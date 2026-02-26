const escapeHtml = (value = '') =>
    String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

const safeJson = (value) => JSON.stringify(value).replace(/</g, '\\u003c');

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

const normalizeSlug = (rawSlug) => {
    let slug = String(rawSlug || '').trim();
    if (!slug) return '';

    try {
        slug = decodeURIComponent(slug);
    } catch {
        slug = String(rawSlug || '').trim();
    }

    return slug.replace(/^\/+|\/+$/g, '');
};

const toIsoIfValid = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

const formatHumanDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    }).format(date);
};

const sanitizeArticleHtml = (value = '') =>
    String(value)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/\son[a-z]+\s*=\s*"[^"]*"/gi, '')
        .replace(/\son[a-z]+\s*=\s*'[^']*'/gi, '')
        .replace(/\son[a-z]+\s*=\s*[^\s>]+/gi, '')
        .replace(/\s(href|src)\s*=\s*"javascript:[^"]*"/gi, ' $1="#"')
        .replace(/\s(href|src)\s*=\s*'javascript:[^']*'/gi, " $1='#'");

const getPostTimelineMs = (post) => {
    const source = post?.updatedAt || post?.publishedAt || post?.createdAt;
    const time = source ? new Date(source).getTime() : 0;
    return Number.isFinite(time) ? time : 0;
};

const buildBotHtml = ({
    canonicalUrl,
    metaTitle,
    heading,
    description,
    image,
    ogType = 'article',
    robots = 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
    bodyHtml = '',
    structuredData = [],
    articleMeta = null,
}) => {
    const jsonLdArray = Array.isArray(structuredData) ? structuredData.filter(Boolean) : (structuredData ? [structuredData] : []);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(metaTitle)}</title>
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="robots" content="${escapeHtml(robots)}" />
  <meta name="googlebot" content="${escapeHtml(robots)}" />
  <meta name="theme-color" content="#2C666E" />

  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta property="og:site_name" content="DodoHabit" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:title" content="${escapeHtml(metaTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:image:secure_url" content="${escapeHtml(image)}" />

  <meta property="twitter:card" content="summary_large_image" />
  <meta property="twitter:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="twitter:title" content="${escapeHtml(metaTitle)}" />
  <meta property="twitter:description" content="${escapeHtml(description)}" />
  <meta property="twitter:image" content="${escapeHtml(image)}" />
  ${articleMeta?.publishedIso ? `<meta property="article:published_time" content="${escapeHtml(articleMeta.publishedIso)}" />` : ''}
  ${articleMeta?.modifiedIso ? `<meta property="article:modified_time" content="${escapeHtml(articleMeta.modifiedIso)}" />` : ''}
  ${articleMeta?.authorName ? `<meta property="article:author" content="${escapeHtml(articleMeta.authorName)}" />` : ''}

  ${jsonLdArray.map((entry) => `<script type="application/ld+json">${safeJson(entry)}</script>`).join('\n  ')}
  <style>
    :root {
      --onyx: #0A090C;
      --platinum: #F0EDEE;
      --dark-teal: #07393C;
      --stormy-teal: #2C666E;
      --frosted-blue: #90DDF0;
      --border: rgba(44, 102, 110, 0.22);
      --muted: rgba(10, 9, 12, 0.66);
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Sora, Outfit, system-ui, -apple-system, Segoe UI, sans-serif;
      background:
        radial-gradient(60rem 36rem at -10% -10%, rgba(7,57,60,0.12), transparent 70%),
        radial-gradient(48rem 28rem at 110% 5%, rgba(144,221,240,0.20), transparent 70%),
        var(--platinum);
      color: var(--onyx);
      line-height: 1.6;
    }
    a { color: var(--stormy-teal); }
    .shell { max-width: 860px; margin: 0 auto; padding: 24px 20px 48px; }
    .card {
      background: rgba(255,255,255,0.55);
      border: 1px solid var(--border);
      border-radius: 20px;
      padding: 20px;
      backdrop-filter: blur(6px);
    }
    h1, h2, h3 { line-height: 1.14; letter-spacing: -0.02em; }
    h1 { font-size: clamp(2rem, 5vw, 3.25rem); margin: 0 0 12px; }
    .lede { color: var(--muted); margin: 0; }
    .meta { display: flex; flex-wrap: wrap; gap: 12px 20px; margin-top: 14px; color: var(--muted); font-size: 0.92rem; }
    .hero { width: 100%; border-radius: 16px; margin: 20px 0 0; border: 1px solid var(--border); }
    .content {
      margin-top: 20px;
      color: rgba(10, 9, 12, 0.86);
      font-size: 1.03rem;
      line-height: 1.85;
      word-break: break-word;
    }
    .content h2 { font-size: 1.9rem; margin: 2.1rem 0 0.8rem; color: var(--onyx); }
    .content h3 { font-size: 1.45rem; margin: 1.65rem 0 0.65rem; color: var(--onyx); }
    .content p { margin: 0 0 1rem; }
    .content img { max-width: 100%; height: auto; border-radius: 14px; border: 1px solid var(--border); }
    .content a { text-decoration: underline; text-underline-offset: 2px; }
    .content blockquote {
      margin: 1.1rem 0;
      border-left: 4px solid var(--stormy-teal);
      padding: 0.25rem 0 0.25rem 1rem;
      color: var(--muted);
    }
    .content code {
      background: rgba(44,102,110,0.08);
      color: var(--dark-teal);
      padding: 0.12rem 0.35rem;
      border-radius: 6px;
    }
    .content pre {
      overflow: auto;
      padding: 12px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: rgba(10, 9, 12, 0.04);
    }
    .content table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      display: block;
      overflow-x: auto;
    }
    .content th, .content td {
      border: 1px solid var(--border);
      padding: 8px 10px;
      text-align: left;
      vertical-align: top;
      min-width: 120px;
    }
    .content th { background: rgba(44,102,110,0.08); }
    .content hr { border: 0; border-top: 1px solid var(--border); margin: 2rem 0; }
    .content ul, .content ol { padding-left: 1.2rem; }
    .footer-note {
      margin-top: 24px;
      font-size: 0.9rem;
      color: var(--muted);
      border-top: 1px solid var(--border);
      padding-top: 14px;
    }
    .link-list { display: grid; gap: 12px; margin-top: 16px; }
    .link-item {
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      background: rgba(255,255,255,0.42);
    }
    .link-item h2 {
      font-size: 1.05rem;
      margin: 0 0 4px;
    }
    .link-item p {
      margin: 0;
      color: var(--muted);
      font-size: 0.93rem;
      line-height: 1.55;
    }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      border: 1px solid var(--border);
      padding: 6px 10px;
      font-size: 0.82rem;
      color: var(--muted);
      background: rgba(255,255,255,0.5);
    }
  </style>
</head>
<body>
  <main class="shell">
    ${bodyHtml || `
      <section class="card">
        <h1>${escapeHtml(heading || 'DodoHabit Blog')}</h1>
        <p class="lede">${escapeHtml(description)}</p>
        <p class="footer-note">Open the full page: <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></p>
      </section>
    `}
  </main>
</body>
</html>`;
};

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

const fetchPublishedPosts = async ({ projectId, maxPages = 10 }) => {
    const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/posts`;
    const published = [];
    let pageToken = '';

    for (let page = 0; page < maxPages; page += 1) {
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
            if (String(post.status || '').trim().toLowerCase() !== 'published') continue;
            if (!String(post.slug || '').trim()) continue;
            published.push(post);
        }

        if (!payload?.nextPageToken) break;
        pageToken = payload.nextPageToken;
    }

    published.sort((a, b) => getPostTimelineMs(b) - getPostTimelineMs(a));
    return published;
};

const buildArticleBodyHtml = ({ post, canonicalUrl, description, image, siteUrl }) => {
    const title = String(post.title || 'DodoHabit Blog');
    const authorName = String(post.authorName || 'DodoHabit Team');
    const publishedSource = post.publishedAt || post.createdAt || null;
    const updatedSource = post.updatedAt || post.publishedAt || post.createdAt || null;
    const publishedLabel = formatHumanDate(publishedSource);
    const updatedLabel = formatHumanDate(updatedSource);
    const safeContent = sanitizeArticleHtml(post.content || '<p>No content found.</p>');
    const caption = String(post.featuredImageCaption || '').trim();

    return `
      <article class="card">
        <div class="status">Bot-optimized render (same canonical URL)</div>
        <h1>${escapeHtml(title)}</h1>
        <p class="lede">${escapeHtml(description)}</p>
        <div class="meta">
          <span>By ${escapeHtml(authorName)}</span>
          ${publishedLabel ? `<span>Published ${escapeHtml(publishedLabel)}</span>` : ''}
          ${updatedLabel && updatedLabel !== publishedLabel ? `<span>Updated ${escapeHtml(updatedLabel)}</span>` : ''}
        </div>
        ${image ? `<img class="hero" src="${escapeHtml(image)}" alt="${escapeHtml(post.featuredImageAlt || post.title || 'DodoHabit article image')}" />` : ''}
        ${caption ? `<p class="lede" style="margin-top:8px;font-size:0.88rem;">${escapeHtml(caption)}</p>` : ''}
        <section class="content">${safeContent}</section>
        <p class="footer-note">
          Interactive version: <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>
          ${siteUrl ? ` · Browse more articles at <a href="${escapeHtml(`${siteUrl}/blog`)}">${escapeHtml(`${siteUrl}/blog`)}</a>` : ''}
        </p>
      </article>
    `;
};

const buildBlogIndexBodyHtml = ({ posts, siteUrl, canonicalUrl }) => {
    const itemsHtml = posts.slice(0, 40).map((post) => {
        const postUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug)}`;
        const excerpt = truncate(String(post.excerpt || '').trim() || stripHtml(post.content || ''), 220);
        const dateLabel = formatHumanDate(post.updatedAt || post.publishedAt || post.createdAt);
        return `
          <article class="link-item">
            <h2><a href="${escapeHtml(postUrl)}">${escapeHtml(post.title || 'Untitled Post')}</a></h2>
            <p>${dateLabel ? `${escapeHtml(dateLabel)} · ` : ''}${escapeHtml(excerpt || 'Read article')}</p>
          </article>
        `;
    }).join('\n');

    return `
      <section class="card">
        <div class="status">Bot-optimized render (same canonical URL)</div>
        <h1>DodoHabit Blog</h1>
        <p class="lede">Deep dives on habits, consistency, and routine design from the DodoHabit team.</p>
        <div class="link-list">
          ${itemsHtml || '<p class="lede">No published articles yet.</p>'}
        </div>
        <p class="footer-note">Interactive version: <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></p>
      </section>
    `;
};

const buildNotFoundBodyHtml = ({ canonicalUrl }) => `
  <section class="card">
    <div class="status">404</div>
    <h1>Post not found</h1>
    <p class="lede">This blog post does not exist or is not published.</p>
    <p class="footer-note">Back to <a href="/blog">DodoHabit Blog</a> · Canonical URL: <a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></p>
  </section>
`;

const buildArticleJsonLd = ({ post, canonicalUrl, image, description, siteUrl }) => ({
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: String(post.title || 'DodoHabit Blog'),
    description,
    url: canonicalUrl,
    mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
    },
    image: image ? [image] : undefined,
    datePublished: toIsoIfValid(post.publishedAt || post.createdAt) || undefined,
    dateModified: toIsoIfValid(post.updatedAt || post.publishedAt || post.createdAt) || undefined,
    author: {
        '@type': 'Person',
        name: String(post.authorName || 'DodoHabit Team'),
    },
    publisher: {
        '@type': 'Organization',
        name: 'DodoHabit',
        logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/icon.png`,
        },
    },
});

const buildBlogIndexJsonLd = ({ siteUrl, canonicalUrl, posts }) => ([
    {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'DodoHabit Blog',
        description: 'Deep dives on habits, consistency, and routine design from the DodoHabit team.',
        url: canonicalUrl,
        isPartOf: {
            '@type': 'WebSite',
            name: 'DodoHabit',
            url: siteUrl,
        },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: posts.slice(0, 40).map((post, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            url: `${siteUrl}/blog/${encodeURIComponent(post.slug)}`,
            name: post.title || 'Untitled Post',
        })),
    },
]);

const sendHtml = ({ req, res, statusCode, html, cacheControl, xRobotsTag }) => {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', cacheControl);
    res.setHeader('Vary', 'User-Agent');
    if (xRobotsTag) res.setHeader('X-Robots-Tag', xRobotsTag);
    if (req.method === 'HEAD') {
        res.end();
        return;
    }
    res.end(html);
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
    const slug = normalizeSlug(rawSlug);
    const siteUrl = getSiteUrl(req);
    const canonicalPath = slug ? `/blog/${encodeURIComponent(slug)}` : '/blog';
    const canonicalUrl = `${siteUrl}${canonicalPath}`;

    const defaultTitle = 'DodoHabit Blog';
    const defaultDescription = 'Read the latest habit-building guides and insights from DodoHabit.';
    const defaultImage = `${siteUrl}/og-image.png`;

    try {
        if (!slug) {
            const posts = await fetchPublishedPosts({ projectId });
            const html = buildBotHtml({
                canonicalUrl,
                metaTitle: 'DodoHabit Blog',
                heading: 'DodoHabit Blog',
                description: defaultDescription,
                image: defaultImage,
                ogType: 'website',
                robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
                structuredData: buildBlogIndexJsonLd({ siteUrl, canonicalUrl, posts }),
                bodyHtml: buildBlogIndexBodyHtml({ posts, siteUrl, canonicalUrl }),
            });
            sendHtml({
                req,
                res,
                statusCode: 200,
                html,
                cacheControl: 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
            });
            return;
        }

        const post = await fetchPublishedPostBySlug({ projectId, slug });
        if (!post) {
            const html = buildBotHtml({
                canonicalUrl,
                metaTitle: 'Post Not Found | DodoHabit',
                heading: 'Post not found',
                description: 'This blog post could not be found.',
                image: defaultImage,
                ogType: 'article',
                robots: 'noindex, nofollow, max-image-preview:large',
                bodyHtml: buildNotFoundBodyHtml({ canonicalUrl }),
            });
            sendHtml({
                req,
                res,
                statusCode: 404,
                html,
                cacheControl: 'public, max-age=60, s-maxage=60',
                xRobotsTag: 'noindex, nofollow',
            });
            return;
        }

        const plainText = stripHtml(post.content || '');
        const description = truncate(
            String(post.excerpt || '').trim() || plainText || defaultDescription,
            180
        );
        const image = toAbsoluteUrl(siteUrl, post.featuredImage) || defaultImage;
        const publishedIso = toIsoIfValid(post.publishedAt || post.createdAt);
        const modifiedIso = toIsoIfValid(post.updatedAt || post.publishedAt || post.createdAt) || publishedIso;
        const authorName = String(post.authorName || 'DodoHabit Team');
        const metaTitle = post.title ? `${post.title} | DodoHabit` : defaultTitle;
        const html = buildBotHtml({
            canonicalUrl,
            metaTitle,
            heading: post.title || defaultTitle,
            description,
            image,
            ogType: 'article',
            robots: 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1',
            articleMeta: { publishedIso, modifiedIso, authorName },
            structuredData: buildArticleJsonLd({ post, canonicalUrl, image, description, siteUrl }),
            bodyHtml: buildArticleBodyHtml({ post, canonicalUrl, description, image, siteUrl }),
        });
        sendHtml({
            req,
            res,
            statusCode: 200,
            html,
            cacheControl: 'public, max-age=300, s-maxage=300, stale-while-revalidate=86400',
        });
    } catch (error) {
        console.error('blog-social-preview error:', error);
        const html = buildBotHtml({
            canonicalUrl,
            metaTitle: 'DodoHabit Blog',
            heading: 'DodoHabit Blog',
            description: defaultDescription,
            image: defaultImage,
            ogType: 'website',
            robots: 'noindex, nofollow, max-image-preview:large',
            bodyHtml: `
              <section class="card">
                <div class="status">Temporary error</div>
                <h1>DodoHabit Blog</h1>
                <p class="lede">The bot-rendered page is temporarily unavailable. Please retry shortly.</p>
                <p class="footer-note"><a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a></p>
              </section>
            `,
        });
        sendHtml({
            req,
            res,
            statusCode: 503,
            html,
            cacheControl: 'no-store',
            xRobotsTag: 'noindex, nofollow',
        });
    }
}
