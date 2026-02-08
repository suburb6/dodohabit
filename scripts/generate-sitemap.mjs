import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const ENV_PATH = path.join(ROOT, '.env');

const readDotEnv = (filePath) => {
    if (!fs.existsSync(filePath)) return {};
    const result = {};
    const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;
        const equalsIndex = line.indexOf('=');
        if (equalsIndex <= 0) continue;
        const key = line.slice(0, equalsIndex).trim();
        let value = line.slice(equalsIndex + 1).trim();
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.slice(1, -1);
        }
        result[key] = value;
    }
    return result;
};

const envFileValues = readDotEnv(ENV_PATH);
const getConfig = (key, fallback = '') => process.env[key] || envFileValues[key] || fallback;

const SITE_URL = getConfig('SITE_URL', getConfig('VITE_SITE_URL', 'https://dodohabit.com')).replace(/\/+$/, '');
const FIREBASE_PROJECT_ID = getConfig('VITE_FIREBASE_PROJECT_ID', '');
const FIREBASE_API_KEY = getConfig('VITE_FIREBASE_API_KEY', '');

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const fromFirestoreValue = (value) => {
    if (!value || typeof value !== 'object') return undefined;
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.booleanValue !== undefined) return value.booleanValue;
    if (value.integerValue !== undefined) return Number.parseInt(value.integerValue, 10);
    if (value.doubleValue !== undefined) return Number.parseFloat(value.doubleValue);
    if (value.timestampValue !== undefined) return value.timestampValue;
    if (value.arrayValue !== undefined) return (value.arrayValue.values || []).map(fromFirestoreValue);
    if (value.mapValue !== undefined) {
        const obj = {};
        const fields = value.mapValue.fields || {};
        for (const key of Object.keys(fields)) {
            obj[key] = fromFirestoreValue(fields[key]);
        }
        return obj;
    }
    if (value.nullValue !== undefined) return null;
    return undefined;
};

const parseFirestoreDocument = (doc) => {
    const fields = doc?.fields || {};
    const parsed = {};
    for (const key of Object.keys(fields)) {
        parsed[key] = fromFirestoreValue(fields[key]);
    }
    parsed.__createTime = doc?.createTime || null;
    parsed.__updateTime = doc?.updateTime || null;
    return parsed;
};

const asIsoDate = (value, fallback = todayIsoDate()) => {
    if (!value) return fallback;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return fallback;
    return date.toISOString().slice(0, 10);
};

const xmlEscape = (value) =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');

const staticRoutes = [
    { path: '/', changefreq: 'daily', priority: '1.0' },
    { path: '/blog', changefreq: 'daily', priority: '0.9' },
    { path: '/privacy', changefreq: 'yearly', priority: '0.4' },
    { path: '/terms', changefreq: 'yearly', priority: '0.4' },
    { path: '/feedback', changefreq: 'monthly', priority: '0.6' },
    { path: '/delete-account', changefreq: 'yearly', priority: '0.3' },
];

const fetchPublishedPosts = async () => {
    if (!FIREBASE_PROJECT_ID || !FIREBASE_API_KEY) {
        console.log('[sitemap] Firebase env missing, generating static-only sitemap.');
        return [];
    }

    const allDocuments = [];
    let pageToken = '';

    try {
        do {
            const baseUrl = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/posts`;
            const query = new URLSearchParams({
                pageSize: '200',
                key: FIREBASE_API_KEY,
            });
            if (pageToken) query.set('pageToken', pageToken);
            const url = `${baseUrl}?${query.toString()}`;
            const response = await fetch(url);
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Firestore list failed (${response.status}): ${text}`);
            }
            const payload = await response.json();
            const docs = payload.documents || [];
            allDocuments.push(...docs);
            pageToken = payload.nextPageToken || '';
        } while (pageToken);
    } catch (error) {
        console.warn(`[sitemap] Could not fetch blog posts from Firestore. Using static-only sitemap. ${error.message}`);
        return [];
    }

    const routes = [];
    for (const rawDoc of allDocuments) {
        const post = parseFirestoreDocument(rawDoc);
        if (post.status !== 'published') continue;
        const slug = String(post.slug || '').trim();
        if (!slug) continue;
        routes.push({
            path: `/blog/${slug}`,
            changefreq: 'weekly',
            priority: '0.8',
            lastmod: asIsoDate(post.updatedAt || post.publishedAt || post.createdAt || post.__updateTime || post.__createTime),
        });
    }
    return routes;
};

const buildSitemapXml = (entries) => {
    const rows = entries
        .map((entry) => {
            const loc = `${SITE_URL}${entry.path}`;
            const lastmod = entry.lastmod || todayIsoDate();
            const changefreq = entry.changefreq || 'weekly';
            const priority = entry.priority || '0.5';
            return [
                '  <url>',
                `    <loc>${xmlEscape(loc)}</loc>`,
                `    <lastmod>${xmlEscape(lastmod)}</lastmod>`,
                `    <changefreq>${xmlEscape(changefreq)}</changefreq>`,
                `    <priority>${xmlEscape(priority)}</priority>`,
                '  </url>',
            ].join('\n');
        })
        .join('\n');

    return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${rows}\n</urlset>\n`;
};

const buildRobotsTxt = () => {
    return [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /admin/',
        'Disallow: /blog/preview',
        '',
        `Sitemap: ${SITE_URL}/sitemap.xml`,
        '',
    ].join('\n');
};

const main = async () => {
    const publishedPostRoutes = await fetchPublishedPosts();
    const now = todayIsoDate();
    const staticEntries = staticRoutes.map((route) => ({ ...route, lastmod: now }));

    const deduped = new Map();
    for (const entry of [...staticEntries, ...publishedPostRoutes]) {
        deduped.set(entry.path, entry);
    }
    const entries = Array.from(deduped.values());

    if (!fs.existsSync(PUBLIC_DIR)) {
        fs.mkdirSync(PUBLIC_DIR, { recursive: true });
    }

    const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
    const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');

    fs.writeFileSync(sitemapPath, buildSitemapXml(entries), 'utf8');
    fs.writeFileSync(robotsPath, buildRobotsTxt(), 'utf8');

    console.log(`[sitemap] Wrote ${entries.length} URLs to public/sitemap.xml`);
    console.log('[sitemap] Updated public/robots.txt');
};

main().catch((error) => {
    console.error('[sitemap] Generation failed:', error);
    process.exitCode = 1;
});
