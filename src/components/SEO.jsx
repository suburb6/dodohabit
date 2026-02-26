import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
    title,
    description,
    keywords = '',
    image = null,
    type = 'website',
    noindex = false,
    canonical = null,
    structuredData = null,
    publishedTime = null,
    modifiedTime = null,
    author = null,
}) => {
    const location = useLocation();
    const rawSiteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dodohabit.com';
    const siteUrl = rawSiteUrl.replace(/\/$/, '');
    const canonicalHref = (() => {
        if (!canonical) return `${siteUrl}${location.pathname}`;
        if (typeof canonical !== 'string') return `${siteUrl}${location.pathname}`;
        const trimmed = canonical.trim();
        if (!trimmed) return `${siteUrl}${location.pathname}`;
        return trimmed.startsWith('http') ? trimmed : `${siteUrl}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
    })();
    const defaultTitle = 'DodoHabit - Build Better Habits, Track Everything';
    const defaultDescription = 'The all-in-one habit tracker with auto step counting, heatmaps, and smart analytics. Build positive habits or break bad ones with DodoHabit.';
    const defaultImage = `${siteUrl}/og-image.png`;

    const metaTitle = title ? `${title} | DodoHabit` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = (() => {
        const raw = typeof image === 'string' ? image.trim() : '';
        if (!raw) return defaultImage;
        if (/^https?:\/\//i.test(raw)) return raw;
        return `${siteUrl}${raw.startsWith('/') ? raw : `/${raw}`}`;
    })();
    const normalizedAuthor = typeof author === 'string' ? author.trim() : '';
    const robotsContent = noindex
        ? 'noindex, nofollow, max-image-preview:large'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1';
    const toIso = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return null;
        return date.toISOString();
    };
    const articlePublishedTime = toIso(publishedTime);
    const articleModifiedTime = toIso(modifiedTime);

    const jsonLdBlocks = (Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : [])
        .filter(Boolean)
        .map((item) => JSON.stringify(item).replace(/</g, '\\u003c'));

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <meta name="robots" content={robotsContent} />
            <meta name="googlebot" content={robotsContent} />
            <link rel="canonical" href={canonicalHref} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonicalHref} />
            <meta property="og:site_name" content="DodoHabit" />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={canonicalHref} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />

            {type === 'article' && articlePublishedTime && (
                <meta property="article:published_time" content={articlePublishedTime} />
            )}
            {type === 'article' && articleModifiedTime && (
                <meta property="article:modified_time" content={articleModifiedTime} />
            )}
            {type === 'article' && normalizedAuthor && (
                <meta property="article:author" content={normalizedAuthor} />
            )}

            {jsonLdBlocks.map((json, index) => (
                <script key={`jsonld-${index}`} type="application/ld+json">
                    {json}
                </script>
            ))}
        </Helmet>
    );
};

export default SEO;
