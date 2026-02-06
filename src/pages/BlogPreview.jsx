import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import SEO from '../components/SEO';
import '../components/blog/editor.css';
import TocNav from '../components/blog/TocNav';

const normalizeLabel = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const slugifyForId = (value) =>
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const BlogPreview = () => {
    const [post, setPost] = useState(null);
    const [toc, setToc] = useState([]);
    const [processedContent, setProcessedContent] = useState('');
    const [activeId, setActiveId] = useState(null);

    useEffect(() => {
        // Load from local storage
        const previewData = localStorage.getItem('blog_preview_data');
        if (!previewData) {
            setPost({
                title: 'Untitled Post',
                excerpt: '',
                content: '',
                featuredImage: null,
                authorName: '',
                authorTitle: '',
                authorImage: null
            });
            return;
        }

        try {
            const parsedPost = JSON.parse(previewData);
            setPost(parsedPost);
        } catch {
            setPost({
                title: 'Untitled Post',
                excerpt: '',
                content: '',
                featuredImage: null,
                authorName: '',
                authorTitle: '',
                authorImage: null
            });
        }
    }, []);

    const contentForPreview = post?.content && post.content.trim() !== ''
        ? post.content
        : '<p><strong>Preview template:</strong> Start writing your post content in the editor and it will appear here.</p>';

    useEffect(() => {
        if (post) {
            const div = document.createElement('div');
            div.innerHTML = contentForPreview;
            const hidden = new Set((Array.isArray(post.tocHidden) ? post.tocHidden : []).map(normalizeLabel));

            const items = [];
            const customLabels = new Set();

            div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3').forEach((el, index) => {
                const isAnchor = el.matches('span[data-toc-anchor="true"]');
                const datasetLabel = el instanceof HTMLElement ? el.dataset?.tocLabel : null;
                const rawText = isAnchor
                    ? (el.getAttribute('data-toc-label') || datasetLabel || el.textContent || '')
                    : (el.textContent || '');
                const text = rawText.replace(/\s+/g, ' ').trim();
                if (!text) return;

                const normalized = normalizeLabel(text);
                if (!isAnchor && hidden.has(normalized)) return;
                if (!isAnchor && customLabels.has(normalized)) return;

                let id = el.getAttribute('id');
                if (!id) {
                    id = `${isAnchor ? 'toc' : 'heading'}-${index}-${slugifyForId(text) || 'section'}`;
                    el.setAttribute('id', id);
                }

                if (isAnchor) {
                    el.setAttribute('data-toc-anchor', 'true');
                    el.setAttribute('data-toc-label', text);
                    customLabels.add(normalized);
                }

                items.push({ id, text, level: isAnchor ? 'sub' : el.tagName.toLowerCase() });
            });

            setToc(items);
            setProcessedContent(div.innerHTML);
            setActiveId(items[0]?.id || null);
        }
    }, [post, contentForPreview]);

    useEffect(() => {
        if (!toc.length) return;

        const nodes = toc
            .map((item) => document.getElementById(item.id))
            .filter(Boolean);
        if (!nodes.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((e) => e.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
                if (visible[0]?.target?.id) setActiveId(visible[0].target.id);
            },
            {
                root: null,
                rootMargin: '-120px 0px -70% 0px',
                threshold: [0, 0.1, 1],
            }
        );

        nodes.forEach((n) => observer.observe(n));
        return () => observer.disconnect();
    }, [toc, processedContent]);

    if (!post) {
        return <div className="min-h-screen pt-32 text-center text-[var(--text-primary)]">Loading Preview...</div>;
    }

    const stats = readingTime(contentForPreview || '');
    const plainText = (contentForPreview || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (post.excerpt && post.excerpt.trim() !== '')
        ? post.excerpt
        : (plainText ? `${plainText.substring(0, 160)}${plainText.length > 160 ? '…' : ''}` : undefined);
    const date = new Date().toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <article className="min-h-screen pt-32 pb-20">
            <SEO
                title={`[Preview] ${post.title || 'Untitled Post'}`}
                description={metaDescription}
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
                    <div className="flex items-center gap-4 p-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl mb-8">
                        {post.authorImage ? (
                            <img
                                src={post.authorImage}
                                alt={post.authorName || 'Author'}
                                className="w-12 h-12 rounded-full object-cover shadow-lg shrink-0"
                            />
                        ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                                <span className="font-bold text-lg">{post.authorName ? post.authorName.charAt(0) : 'D'}</span>
                            </div>
                        )}
                        <div>
                            <span className="font-bold text-[var(--text-primary)] block text-lg">{post.authorName || 'Dodohabit Team'}</span>
                            <span className="text-sm text-[var(--text-secondary)]">{post.authorTitle || 'Building habits that stick.'}</span>
                        </div>
                    </div>

                    <div className="sticky top-32 space-y-4">
                        <h3 className="text-base font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-4">Table of Contents</h3>
                        {toc.length > 0 && (
                            <TocNav
                                items={toc}
                                activeId={activeId}
                                onNavigate={(id) => {
                                    setActiveId(id);
                                    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
                                }}
                            />
                        )}
                    </div>
                </div>

                <div className="lg:col-span-8">
                    <div
                        className="prose dark:prose-invert prose-lg max-w-none prose-headings:text-[var(--text-primary)] prose-headings:scroll-mt-32 prose-p:text-[var(--text-secondary)] prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-strong:text-[var(--text-primary)] prose-code:text-blue-600 dark:prose-code:text-blue-300 prose-li:text-[var(--text-secondary)]"
                        dangerouslySetInnerHTML={{ __html: processedContent || contentForPreview }}
                    />
                    <hr className="border-[var(--border-color)] my-12" />
                </div>
            </div>
        </article>
    );
};

export default BlogPreview;
