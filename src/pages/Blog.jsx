import React from 'react';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/blog/BlogCard';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { readingTime } from 'reading-time-estimator';
import { formatBlogDate } from '../utils/dateFormat';
import { Play, Smartphone } from 'lucide-react';

const Blog = () => {
    const { getPublishedPosts, loading } = useBlog();
    const posts = getPublishedPosts();
    const featuredPost = posts[0];
    const recentPosts = posts.slice(1);
    const featuredStats = featuredPost ? readingTime(featuredPost.content || '') : null;
    const featuredLatestDate = featuredPost?.updatedAt || featuredPost?.publishedAt || featuredPost?.createdAt;

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
        <div className="min-h-screen pt-24 pb-20 px-5 sm:px-8 lg:px-12 xl:px-16 2xl:px-20 max-w-[1800px] mx-auto">
            <SEO
                title="Blog"
                description="Insights on habit building, productivity, and health tracking. Learn how to transform your daily routine with DodoHabit."
            />
            <div className="text-center mb-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="inline-flex flex-col items-center gap-4"
                >
                    <span className="text-xs uppercase tracking-[0.25em] text-blue-400 font-bold">Editorial Journal</span>
                    <span className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)]">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400">Dodo Blog</span>
                    </span>
                    <span className="h-1.5 w-28 rounded-full bg-gradient-to-r from-blue-500/0 via-blue-500 to-cyan-400/0" />
                </motion.h1>
            </div>

            {featuredPost && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-24"
                >
                    <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 border-l-4 border-blue-500 pl-4">Featured Article</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch">
                        <div className="aspect-[16/9] lg:aspect-auto lg:min-h-[360px] lg:h-full rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)] shadow-xl">
                            {featuredPost.featuredImage ? (
                                <div className="relative w-full h-full">
                                    <img
                                        src={featuredPost.featuredImage}
                                        alt={featuredPost.title}
                                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                    />
                                    {(Array.isArray(featuredPost.featuredBadges) ? featuredPost.featuredBadges : [])
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .map((badge) => (
                                            <span
                                                key={badge}
                                                className="absolute top-4 left-4 first:top-4 last:top-12 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md"
                                            >
                                                {badge}
                                            </span>
                                        ))}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-600 font-bold text-xl">
                                    No Image
                                </div>
                            )}
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 text-sm text-blue-500 font-bold uppercase tracking-wider">
                                <span>Latest Update</span>
                                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                                <span>{formatBlogDate(featuredLatestDate)}</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight hover:text-blue-500 transition-colors cursor-pointer">
                                <a href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</a>
                            </h3>
                            {(featuredPost.authorName || featuredStats?.text) && (
                                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
                                    {featuredPost.authorName && <span>By {featuredPost.authorName}</span>}
                                    {featuredPost.authorName && featuredStats?.text && (
                                        <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                                    )}
                                    {featuredStats?.text && <span>{featuredStats.text}</span>}
                                </div>
                            )}
                            <p className="text-[var(--text-secondary)] text-lg leading-relaxed line-clamp-3">
                                {featuredPost.excerpt}
                            </p>
                            <a
                                href={`/blog/${featuredPost.slug}`}
                                className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                            >
                                Read Article
                            </a>
                        </div>
                    </div>
                </motion.section>
            )}

            {recentPosts.length > 0 && (
                <section>
                    <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-8 border-l-4 border-blue-500 pl-4">Recent Articles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-8">
                        {recentPosts.map(post => (
                            <BlogCard key={post.id} post={post} />
                        ))}
                    </div>
                </section>
            )}

            {posts.length === 0 && (
                <div className="text-center py-20 bg-[var(--bg-secondary)] rounded-3xl border border-[var(--border-color)] border-dashed">
                    <p className="text-[var(--text-secondary)] text-lg">No posts published yet. Check back soon!</p>
                </div>
            )}

            <div className="mt-24 bg-gradient-to-r from-blue-900/20 via-blue-800/10 to-cyan-900/20 rounded-3xl p-8 md:p-12 border border-blue-500/20 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h3 className="text-3xl font-bold text-[var(--text-primary)]">Get DodoHabit On Mobile</h3>
                    <p className="text-[var(--text-secondary)]">Track habits and read fresh insights from your phone.</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button className="px-5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-500 transition-colors flex items-center gap-3">
                            <Play size={18} className="text-blue-500" />
                            <span className="text-left">
                                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Get it on</span>
                                <span className="block text-sm font-bold">Google Play</span>
                            </span>
                        </button>
                        <button className="px-5 py-3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:border-blue-500 transition-colors flex items-center gap-3">
                            <Smartphone size={18} className="text-blue-500" />
                            <span className="text-left">
                                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Download on</span>
                                <span className="block text-sm font-bold">App Store</span>
                            </span>
                        </button>
                    </div>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02]" />
            </div>
        </div>
    );
};

export default Blog;
