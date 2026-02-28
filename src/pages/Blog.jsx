import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Smartphone } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import SEO from '../components/SEO';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/blog/BlogCard';
import { formatBlogDate } from '../utils/dateFormat';
import { PLAY_STORE_APP_URL } from '../constants/externalLinks';

const toPlainText = (html) => (html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const getLeadSnippet = (post, minWords = 30, maxWords = 42) => {
    const source = toPlainText(post?.content || '') || (post?.excerpt || '').trim();
    if (!source) return '';
    const words = source.split(' ').filter(Boolean);
    if (words.length <= minWords) return `${words.join(' ')}...`;
    const count = Math.min(maxWords, words.length);
    return `${words.slice(0, count).join(' ')}...`;
};

const Blog = () => {
    const { getPublishedPosts, loading } = useBlog();
    const posts = getPublishedPosts();
    const featuredPost = posts[0];
    const recentPosts = posts.slice(1);
    const featuredStats = featuredPost ? readingTime(featuredPost.content || '') : null;
    const featuredLatestDate = featuredPost?.updatedAt || featuredPost?.publishedAt || featuredPost?.createdAt;
    const featuredLead = featuredPost ? getLeadSnippet(featuredPost) : '';
    const siteUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://dodohabit.com').replace(/\/$/, '');
    const blogPageUrl = `${siteUrl}/blog`;
    const blogStructuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'CollectionPage',
            name: 'DodoHabit Blog',
            description: 'Deep dives on habits, consistency, and routine design from the DodoHabit team.',
            url: blogPageUrl,
            isPartOf: {
                '@type': 'WebSite',
                name: 'DodoHabit',
                url: siteUrl,
            },
        },
        ...(posts.length > 0 ? [{
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            itemListElement: posts.slice(0, 20).map((post, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${siteUrl}/blog/${encodeURIComponent(post.slug || '')}`,
                name: post.title || 'Untitled Post',
            })),
        }] : []),
    ];

    if (loading) {
        return (
            <div className="min-h-screen pt-32 pb-20 flex flex-col items-center justify-center">
                <SEO title="Blog" description="DodoHabit Blog" />
                <div className="flex items-center gap-3 text-[var(--text-secondary)]">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span className="text-lg font-medium">Loading posts...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
            <SEO
                title="Blog"
                description="Deep dives on habits, consistency, and routine design from the DodoHabit team."
                structuredData={blogStructuredData}
            />

            <motion.header
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-14 md:mb-16"
            >
                <p className="section-kicker mb-4">Editorial Journal</p>
                <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight">
                    The <span className="headline-gradient">Dodo Blog</span>
                </h1>
                <p className="mt-5 text-lg text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                    Practical notes on building systems that survive real life, not just perfect weeks.
                </p>
            </motion.header>

            {featuredPost && (
                <motion.section
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 }}
                    className="mb-20"
                >
                    <p className="section-kicker mb-5">Featured Article</p>
                    <article className="surface-card rounded-[2rem] p-4 md:p-6 grid lg:grid-cols-[1.05fr_0.95fr] gap-6 md:gap-8">
                        <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] min-h-[260px]">
                            {featuredPost.featuredImage ? (
                                <img
                                    src={featuredPost.featuredImage}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full min-h-[260px] flex items-center justify-center text-[var(--text-secondary)]">
                                    No image
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col">
                            <div className="text-sm text-[var(--text-secondary)] flex items-center gap-3">
                                <span>{formatBlogDate(featuredLatestDate)}</span>
                                {featuredStats?.text && (
                                    <>
                                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                                        <span>{featuredStats.text}</span>
                                    </>
                                )}
                            </div>
                            <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight">
                                <Link to={`/blog/${featuredPost.slug}`} className="hover:text-[var(--accent-primary)] transition-colors">
                                    {featuredPost.title}
                                </Link>
                            </h2>
                            {featuredLead && (
                                <p className="mt-5 text-[var(--text-secondary)] leading-8">{featuredLead}</p>
                            )}
                            <div className="mt-auto pt-6">
                                <Link to={`/blog/${featuredPost.slug}`} className="btn-primary rounded-xl px-5 py-3 font-semibold inline-flex items-center gap-2">
                                    Read Article
                                    <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    </article>
                </motion.section>
            )}

            {recentPosts.length > 0 && (
                <section>
                    <p className="section-kicker mb-5">Recent Articles</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {recentPosts.map((post) => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                </section>
            )}

            {posts.length === 0 && (
                <div className="surface-card rounded-3xl p-16 text-center">
                    <p className="text-[var(--text-secondary)] text-lg">No posts published yet. Check back soon.</p>
                </div>
            )}

            <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.35 }}
                transition={{ duration: 0.55 }}
                className="mt-20 surface-card rounded-[2rem] p-8 md:p-10 text-center"
            >
                <h3 className="font-display text-3xl md:text-4xl font-bold">Read it here. Use it on mobile.</h3>
                <p className="mt-4 text-[var(--text-secondary)] max-w-2xl mx-auto">
                    DodoHabit’s mobile experience is built for daily follow-through.
                </p>
                <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                    <a
                        href={PLAY_STORE_APP_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary rounded-xl px-5 py-3 font-semibold inline-flex items-center gap-2"
                    >
                        <Play size={17} className="text-[var(--accent-primary)]" />
                        Google Play
                    </a>
                    <button className="btn-secondary rounded-xl px-5 py-3 font-semibold inline-flex items-center gap-2">
                        <Smartphone size={17} className="text-[var(--accent-primary)]" />
                        App Store
                    </button>
                </div>
            </motion.section>
        </div>
    );
};

export default Blog;
