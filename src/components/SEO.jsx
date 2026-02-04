import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

const SEO = ({
    title,
    description,
    keywords,
    image,
    type = 'website'
}) => {
    const location = useLocation();
    const siteUrl = 'https://dodohabit.com';
    const currentUrl = `${siteUrl}${location.pathname}`;
    const defaultTitle = 'DodoHabit - Build Better Habits, Track Everything';
    const defaultDescription = 'The all-in-one habit tracker with auto step counting, heatmaps, and smart analytics. Build positive habits or break bad ones with DodoHabit.';
    const defaultImage = `${siteUrl}/og-image.png`;

    const metaTitle = title ? `${title} | DodoHabit` : defaultTitle;
    const metaDescription = description || defaultDescription;
    const metaImage = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : defaultImage;

    return (
        <Helmet>
            {/* Standard Metadata */}
            <title>{metaTitle}</title>
            <meta name="description" content={metaDescription} />
            {keywords && <meta name="keywords" content={keywords} />}
            <link rel="canonical" href={currentUrl} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:url" content={currentUrl} />
            <meta property="og:title" content={metaTitle} />
            <meta property="og:description" content={metaDescription} />
            <meta property="og:image" content={metaImage} />

            {/* Twitter */}
            <meta property="twitter:card" content="summary_large_image" />
            <meta property="twitter:url" content={currentUrl} />
            <meta property="twitter:title" content={metaTitle} />
            <meta property="twitter:description" content={metaDescription} />
            <meta property="twitter:image" content={metaImage} />
        </Helmet>
    );
};

export default SEO;
