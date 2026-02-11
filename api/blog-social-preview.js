const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const stripHtml = (value = '') =>
    String(value)
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

const truncate = (value = '', maxLength = 180) =>
    value.length > maxLength ? `${value.slice(0, maxLength - 3).trimEnd()}...` : value;

const fromFirestoreValue = (value) => {
    if (!value || typeof value !== 'object') return undefined;
    if (value.nullValue !== undefined) return null;
    if (value.stringValue !== undefined) return value.stringValue;
    if (value.booleanValue !== undefined) return Boolean(value.booleanValue);
    if (value.integerValue !== undefined) return Number.parseInt(value.integerValue, 10);
    if (value.doubleValue !== undefined) return Number(value.doubleValue);
    if (value.timestampValue !== undefined) return value.timestampValue;
    if (value.arrayValue !== undefined) {
        return (value.arrayValue.values || []).map(fromFirestoreValue);
    }
    if (value.mapValue !== undefined) {
        const fields = value.mapValue.fields || {};
        const obj = {};
        for (const key of Object.keys(fields)) {
            obj[key] = fromFirestoreValue(fields[key]);
        }
        return obj;
    }
    return undefined;
};

const fromFirestoreDoc = (doc) => {
    const fields = doc?.fields || {};
    const parsed = {};
    for (const key of Object.keys(fields)) {
        parsed[key] = fromFirestoreValue(fields[key]);
    }
    return parsed;
};

const getSiteUrl = (req) => {
    const protocolHeader = (req.headers['x-forwarded-proto'] || 'https').toString();
    const hostHeader = (req.headers['x-forwarded-host'] || req.headers.host || 'dodohabit.com').toString();
    const protocol = protocolHeader.split(',')[0].trim() || 'https';
    const host = hostHeader.split(',')[0].trim() || 'dodohabit.com';
    return `${protocol}://${host}`.replace(/\/$/, '');
};

const toAbsoluteUrl = (siteUrl, value) => {
    const input = String(value || '').trim();
    if (!input) return '';
    if (/^https?:\/\//i.test(input)) return input;
    if (input.startsWith('/')) return `${siteUrl}${input}`;
    return `${siteUrl}/${input}`;
};

const buildPreviewHtml = ({
    canonicalUrl,
    title,
    description,
    image,
}) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="description" content="${escapeHtml(description)}" />

  <meta property="og:type" content="article" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="twitter:title" content="${escapeHtml(title)}" />
  <meta property="twitter:description" content="${escapeHtml(description)}" />
  <meta property="twitter:image" content="${escapeHtml(image)}" />
</head>
<body>
  <p>Open <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>.</p>
</body>
</html>`;

const fetchPublishedPostBySlug = async ({ projectId, slug }) => {
    const normalizedSlug = String(slug || '').trim().toLowerCase();
    if (!normalizedSlug) return null;

    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts`;
    let pageToken = '';

    for (let page = 0; page < 5; page += 1) {
        const url = new URL(baseUrl);
        url.searchParams.set('pageSize', '200');
        if (pageToken) url.searchParams.set('pageToken', pageToken);

        const response = await fetch(url.toString(), {
            method: 'GET',
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            const details = await response.text();
            throw new Error(`Firestore list failed: ${response.status} ${details}`);
        }

        const payload = await response.json();
        const docs = Array.isArray(payload?.documents) ? payload.documents : [];

        for (const doc of docs) {
            const post = fromFirestoreDoc(doc);
            const postSlug = String(post.slug || '').trim().toLowerCase();
            const status = String(post.status || '').trim().toLowerCase();
            if (postSlug === normalizedSlug && status === 'published') {
                return post;
            }
        }

        if (!payload?.nextPageToken) break;
        pageToken = payload.nextPageToken;
    }

    return null;
};

export default async function handler(req, res) {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
        res.statusCode = 405;
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }

    const env = globalThis.process?.env || {};
    const projectId = env.FIREBASE_PROJECT_ID || env.VITE_FIREBASE_PROJECT_ID || 'dodohabitweb';
    const rawSlug = Array.isArray(req.query.slug) ? req.query.slug[0] : req.query.slug;
    let slug = String(rawSlug || '').trim();
    try {
        slug = decodeURIComponent(slug);
    } catch {
        slug = String(rawSlug || '').trim();
    }
    const siteUrl = getSiteUrl(req);
    const canonicalPath = slug ? `/blog/${encodeURIComponent(slug)}` : '/blog';
    const canonicalUrl = `${siteUrl}${canonicalPath}`;

    const defaultTitle = 'DodoHabit Blog';
    const defaultDescription = 'Read the latest habit-building guides and insights from DodoHabit.';
    const defaultImage = `${siteUrl}/og-image.png`;

    let title = defaultTitle;
    let description = defaultDescription;
    let image = defaultImage;

    try {
        const post = await fetchPublishedPostBySlug({ projectId, slug });
        if (post) {
            title = post.title ? `${post.title} | DodoHabit` : defaultTitle;
            const plainText = stripHtml(post.content || '');
            description = truncate(
                String(post.excerpt || '').trim() || plainText || defaultDescription,
                180
            );
            image = toAbsoluteUrl(siteUrl, post.featuredImage) || defaultImage;
        }
    } catch (error) {
        console.error('blog-social-preview error:', error);
    }

    const html = buildPreviewHtml({ canonicalUrl, title, description, image });

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400');
    res.end(html);
}
