import React from 'react';
import { useBlog } from '../contexts/BlogContext';
import BlogCard from '../components/blog/BlogCard';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const Blog = () => {
    const { getPublishedPosts, loading } = useBlog();
    const posts = getPublishedPosts();
    const featuredPost = posts[0];
    const recentPosts = posts.slice(1);

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

    if (posts.length === 0) {
        return (
            <div className="min-h-screen pt-32 pb-20 px-4 flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
                <SEO
                    title="Blog - Coming Soon"
                    description="The DodoHabit blog is coming soon. Stay tuned for updates!"
                />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-8"
                >
                    <div className="inline-block p-4 rounded-full bg-blue-500/10 border border-blue-500/20 mb-4">
                        <span className="text-4xl">✍️</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                            Coming Soon
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
                        We're crafting detailed guides on habit building, science-backed productivity tips, and health tracking insights.
                    </p>

                    <div className="pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] text-sm font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Preparing first articles...
                        </div>
                    </div>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-[1800px] mx-auto">
            <SEO
                title="Blog"
                description="Insights on habit building, productivity, and health tracking. Learn how to transform your daily routine with DodoHabit."
            />
            <div className="text-center mb-16 space-y-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-primary)] mb-6"
                >
                    The <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">Dodo Blog</span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto"
                >
                    Insights on habit building, productivity, and health tracking.
                </motion.p>
            </div>

            {featuredPost && (
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-24"
                >
                    <h2 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-6 border-l-4 border-blue-500 pl-4">Featured Article</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                        <div className="aspect-[16/9] lg:aspect-auto lg:h-[400px] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            {featuredPost.featuredImage ? (
                                <img
                                    src={featuredPost.featuredImage}
                                    alt={featuredPost.title}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                                />
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
                                <span>{new Date(featuredPost.publishedAt).toLocaleDateString()}</span>
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight hover:text-blue-500 transition-colors cursor-pointer">
                                <a href={`/blog/${featuredPost.slug}`}>{featuredPost.title}</a>
                            </h3>
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

            {/* Newsletter CTA */}
            <div className="mt-24 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded-3xl p-8 md:p-12 border border-blue-500/20 text-center relative overflow-hidden">
                <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                    <h3 className="text-3xl font-bold text-[var(--text-primary)]">Subscribe to our newsletter</h3>
                    <p className="text-[var(--text-secondary)]">Get the latest posts and updates delivered straight to your inbox.</p>
                    <form className="flex flex-col sm:flex-row gap-4 justify-center" onSubmit={(e) => e.preventDefault()}>
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-primary)] px-6 py-3 rounded-xl focus:outline-none focus:border-blue-500 w-full sm:w-auto flex-1 md:max-w-xs"
                        />
                        <button className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors">
                            Subscribe
                        </button>
                    </form>
                </div>
                <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.02] mask-image-b-0" />
            </div>
        </div>
    );
};

export default Blog;
