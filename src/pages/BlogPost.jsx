import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import ShareButtons from '../components/blog/ShareButtons';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import SEO from '../components/SEO';
import '../components/blog/editor.css'; // Reuse editor styles for content

const BlogPost = () => {
    const { slug } = useParams();
    const { getPost, loading } = useBlog();
    const post = getPost(slug);
    // Generate Table of Contents and inject IDs
    const [toc, setToc] = useState([]);
    const [processedContent, setProcessedContent] = useState('');

    useEffect(() => {
        if (post?.content) {
            // Create a temporary DOM element to parse HTML
            const div = document.createElement('div');
            div.innerHTML = post.content;

            const headings = [];

            // Find all H1, H2 and H3
            div.querySelectorAll('h1, h2, h3').forEach((heading, index) => {
                const text = heading.textContent;
                const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                heading.id = id;
                headings.push({
                    id,
                    text,
                    level: heading.tagName.toLowerCase()
                });
            });

            setToc(headings);
            setProcessedContent(div.innerHTML);
        }
    }, [post]);

    if (loading) {
        return <div className="min-h-screen pt-32 text-center text-[var(--text-primary)]">Loading...</div>;
    }

    if (!post) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-white">
                <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">404</h1>
                <p className="text-[var(--text-secondary)] mb-8">Post not found</p>
                <Link to="/blog" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Blog
                </Link>
            </div>
        );
    }

    const stats = readingTime(post.content);
    const date = new Date(post.publishedAt || post.createdAt).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="min-h-screen pt-32 pb-20">
            <SEO
                title={post.title}
                description={post.excerpt}
                image={post.featuredImage}
                type="article"
            />
            {/* Header */}
            {/* Header */}
            <header className="max-w-4xl mx-auto px-4 md:px-8 mb-16 text-center pt-8">

                <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] leading-tight mb-8">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 text-[var(--text-secondary)] text-sm md:text-base">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-blue-500" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-blue-500" />
                        <span>{stats.text}</span>
                    </div>
                    {post.updatedAt !== post.publishedAt && (
                        <div className="text-gray-600 text-xs mt-1 w-full">
                            Last updated: {new Date(post.updatedAt).toLocaleDateString()}
                        </div>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
                    <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-color)]">
                        <img
                            src={post.featuredImage}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                </div>
            )}

            {/* Content & Sidebar */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 2xl:gap-20">
                {/* Table of Contents - Desktop Sidebar */}
                <div className="hidden lg:block lg:col-span-3">
                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl mb-8">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                            <span className="font-bold text-lg">{post.authorName ? post.authorName.charAt(0) : 'D'}</span>
                        </div>
                        <div>
                            <span className="font-bold text-[var(--text-primary)] block text-lg">{post.authorName || 'Dodohabit Team'}</span>
                            <span className="text-sm text-[var(--text-secondary)]">{post.authorTitle || 'Building habits that stick.'}</span>
                        </div>
                    </div>

                    <div className="sticky top-32 space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                            Table of Contents
                        </h3>
                        {toc.length > 0 ? (
                            <nav className="space-y-1">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`block py-2 text-sm transition-colors border-l-2 pl-4 ${item.level === 'h2'
                                            ? 'text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500'
                                            : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] ml-2'
                                            }`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        ) : (
                            <p className="text-sm text-gray-600 italic">No sections found</p>
                        )}

                        <div className="pt-8">
                            <ShareButtons title={post.title} url={window.location.href} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 2xl:col-span-8">
                    <div
                        className="prose dark:prose-invert prose-lg max-w-none 2xl:prose-xl
                        prose-headings:text-[var(--text-primary)] prose-headings:font-bold prose-headings:scroll-mt-32
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-[var(--text-secondary)] prose-p:leading-relaxed prose-p:mb-6
                        prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
                        prose-strong:text-[var(--text-primary)] prose-strong:font-bold
                        prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-code:bg-[var(--bg-secondary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-li:text-[var(--text-secondary)]
                        "
                        dangerouslySetInnerHTML={{ __html: processedContent || post.content }}
                    />

                    <hr className="border-[var(--border-color)] my-12" />

                    <div className="md:hidden mt-8">
                        <ShareButtons title={post.title} url={window.location.href} />
                    </div>
                </div>
            </div>
            {/* Related Posts */}
            {/* Can be implemented later, for now just simple footer area */}
        </article>
    );
};

export default BlogPost;
