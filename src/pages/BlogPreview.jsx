import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ShareButtons from '../components/blog/ShareButtons';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import SEO from '../components/SEO';
import '../components/blog/editor.css';

const BlogPreview = () => {
    const [post, setPost] = useState(null);
    const [toc, setToc] = useState([]);
    const [processedContent, setProcessedContent] = useState('');

    useEffect(() => {
        // Load from local storage
        const previewData = localStorage.getItem('blog_preview_data');
        if (previewData) {
            const parsedPost = JSON.parse(previewData);
            setPost(parsedPost);
        }
    }, []);

    useEffect(() => {
        if (post?.content) {
            const div = document.createElement('div');
            div.innerHTML = post.content;
            const headings = [];

            div.querySelectorAll('h2, h3').forEach((heading, index) => {
                const text = heading.textContent;
                const id = `heading-${index}-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
                heading.id = id;
                headings.push({ id, text, level: heading.tagName.toLowerCase() });
            });

            setToc(headings);
            setProcessedContent(div.innerHTML);
        }
    }, [post]);

    if (!post) {
        return <div className="min-h-screen pt-32 text-center text-[var(--text-primary)]">Loading Preview...</div>;
    }

    const stats = readingTime(post.content || '');
    const date = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="min-h-screen pt-32 pb-20">
            <SEO
                title={`[Preview] ${post.title}`}
                description={post.excerpt}
                image={post.featuredImage}
                type="article"
            />

            <div className="fixed bottom-4 right-4 z-50 bg-yellow-400 text-black px-4 py-2 rounded-full font-bold shadow-lg">
                Preview Mode
            </div>

            <header className="max-w-4xl mx-auto px-4 md:px-8 mb-16 text-center">
                <div className="inline-flex items-center gap-2 text-[var(--text-secondary)] mb-8 text-sm font-medium uppercase tracking-wider">
                    <span className="bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded">Preview</span>
                </div>

                <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] leading-tight mb-8">
                    {post.title || 'Untitled Post'}
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
                </div>
            </header>

            {post.featuredImage && (
                <div className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
                    <div className="aspect-[21/9] rounded-3xl overflow-hidden bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-color)]">
                        <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="hidden lg:block lg:col-span-3">
                    <div className="sticky top-32 space-y-4">
                        <h3 className="text-sm font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Table of Contents</h3>
                        {toc.length > 0 && (
                            <nav className="space-y-1">
                                {toc.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.id}`}
                                        className={`block py-2 text-sm transition-colors border-l-2 pl-4 ${item.level === 'h2' ? 'text-[var(--text-primary)] border-[var(--border-color)] hover:border-blue-500' : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] ml-2'}`}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                        }}
                                    >
                                        {item.text}
                                    </a>
                                ))}
                            </nav>
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div
                        className="prose dark:prose-invert prose-lg max-w-none prose-headings:text-[var(--text-primary)] prose-headings:scroll-mt-32 prose-p:text-[var(--text-secondary)] prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-[var(--text-primary)] prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-li:text-[var(--text-secondary)]"
                        dangerouslySetInnerHTML={{ __html: processedContent || post.content }}
                    />
                    <hr className="border-[var(--border-color)] my-12" />
                </div>
            </div>
        </article>
    );
};

export default BlogPreview;
