import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import { formatBlogDate } from '../../utils/dateFormat';

const BlogCard = ({ post }) => {
    const stats = readingTime(post.content);

    return (
        <article className="group relative flex flex-col items-start justify-between h-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl p-4 transition-all duration-300 hover:border-blue-500/50 hover:bg-[var(--bg-primary)] hover:-translate-y-1">
            <div className="w-full aspect-[16/9] mb-6 overflow-hidden rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                {post.featuredImage ? (
                    <div className="relative w-full h-full">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {(Array.isArray(post.featuredBadges) ? post.featuredBadges : [])
                            .filter(Boolean)
                            .slice(0, 2)
                            .map((badge) => (
                                <span
                                    key={badge}
                                    className="absolute top-2 left-2 first:top-2 last:top-9 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-full bg-black/60 text-white border border-white/20 backdrop-blur-md"
                                >
                                    {badge}
                                </span>
                            ))}
                    </div>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--bg-secondary)] text-[var(--text-secondary)] opacity-40">
                        <span className="font-bold text-2xl">No Image</span>
                    </div>
                )}
            </div>

            <div className="w-full flex-1 flex flex-col">
                <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-secondary)] mb-3 uppercase tracking-wider">
                    <span className="text-blue-500 font-bold">Blog</span>
                    <span className="w-1 h-1 rounded-full bg-[var(--border-color)]"></span>
                    <span>{formatBlogDate(post.publishedAt || post.createdAt)}</span>
                </div>

                <h3 className="mt-2 text-xl font-bold text-[var(--text-primary)] group-hover:text-blue-500 transition-colors line-clamp-2">
                    <Link to={`/blog/${post.slug}`}>
                        <span className="absolute inset-0" />
                        {post.title}
                    </Link>
                </h3>
                {(post.authorName || stats?.text) && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        {post.authorName && <span>By {post.authorName}</span>}
                        {post.authorName && stats?.text && <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />}
                        {stats?.text && (
                            <span className="inline-flex items-center gap-1">
                                <Clock size={12} className="text-blue-500" />
                                {stats.text}
                            </span>
                        )}
                    </div>
                )}

                <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)] flex-1">
                    {post.excerpt || post.content.replace(/<[^>]+>/g, '').substring(0, 150) + '...'}
                </p>

                <div className="mt-6 flex items-center justify-end w-full border-t border-[var(--border-color)] pt-4">
                    <div className="flex items-center gap-1 text-sm font-bold text-blue-500 group-hover:gap-2 transition-all">
                        Read Article <ArrowRight size={16} />
                    </div>
                </div>
            </div>
        </article>
    );
};

export default BlogCard;
