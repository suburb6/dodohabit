import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import ShareButtons from '../components/blog/ShareButtons';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import { readingTime } from 'reading-time-estimator';
import SEO from '../components/SEO';
import '../components/blog/editor.css'; // Reuse editor styles for content
import TocNav from '../components/blog/TocNav';

const normalizeLabel = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const slugifyForId = (value) =>
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const getReadingAnchorLine = () => {
    const viewportHeight = window.innerHeight || 0;
    return Math.round(Math.min(320, Math.max(120, viewportHeight * 0.34)));
};

const BlogPost = () => {
    const { slug } = useParams();
    const { getPost, loading } = useBlog();
    const post = getPost(slug);
    // Generate Table of Contents and inject IDs
    const [toc, setToc] = useState([]);
    const [processedContent, setProcessedContent] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const articleRef = useRef(null);

    useEffect(() => {
        if (post?.content) {
            // Create a temporary DOM element to parse HTML
            const div = document.createElement('div');
            div.innerHTML = post.content;
            const imageBadges = (Array.isArray(post.featuredBadges) ? post.featuredBadges : [])
                .map((badge) => (badge || '').trim())
                .filter(Boolean)
                .slice(0, 2);

            const hidden = new Set((Array.isArray(post.tocHidden) ? post.tocHidden : []).map(normalizeLabel));
            const items = [];
            const customLabels = new Set();
            const usedIds = new Set();

            // Collect headings + custom anchors in DOM order
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

                // Custom anchors override same-label headings
                if (!isAnchor && customLabels.has(normalized)) return;

                const fallbackId = `${isAnchor ? 'toc' : 'heading'}-${index}-${slugifyForId(text) || 'section'}`;
                const baseId = el.getAttribute('id') || fallbackId;
                let id = baseId;
                let suffix = 2;
                while (usedIds.has(id)) {
                    id = `${baseId}-${suffix}`;
                    suffix += 1;
                }
                usedIds.add(id);
                el.setAttribute('id', id);

                if (isAnchor) {
                    el.setAttribute('data-toc-anchor', 'true');
                    el.setAttribute('data-toc-label', text);
                    el.setAttribute('data-toc-id', id);
                    customLabels.add(normalized);
                }

                items.push({
                    id,
                    text,
                    level: isAnchor ? 'sub' : el.tagName.toLowerCase(),
                });
            });

            if (imageBadges.length > 0) {
                div.querySelectorAll('img').forEach((img, imageIndex) => {
                    if (!(img instanceof HTMLImageElement)) return;
                    if (img.closest('.content-image-frame')) return;
                    const frame = document.createElement('figure');
                    frame.className = 'content-image-frame';
                    img.replaceWith(frame);
                    frame.appendChild(img);

                    const badges = document.createElement('div');
                    badges.className = 'content-image-badges';
                    imageBadges.forEach((badge, badgeIndex) => {
                        const badgeEl = document.createElement('span');
                        badgeEl.className = 'content-image-badge';
                        badgeEl.style.top = `${12 + badgeIndex * 34}px`;
                        badgeEl.textContent = badge;
                        badges.appendChild(badgeEl);
                    });
                    frame.appendChild(badges);
                });
            }

            setToc(items);
            setProcessedContent(div.innerHTML);
            setActiveId(items[0]?.id || null);
        }
    }, [post]);

    useEffect(() => {
        if (!toc.length) return undefined;

        let rafId = null;

        const updateScrollUi = () => {
            const anchorLine = getReadingAnchorLine();
            let nextActive = toc[0]?.id || null;

            for (const item of toc) {
                const node = document.getElementById(item.id);
                if (!node) continue;
                if (node.getBoundingClientRect().top <= anchorLine) {
                    nextActive = item.id;
                } else {
                    break;
                }
            }

            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
            // Force the final TOC item when user reaches page end and further scrolling is impossible.
            if (maxScroll > 0 && window.scrollY >= maxScroll - 2) {
                nextActive = toc[toc.length - 1]?.id || nextActive;
            }

            setActiveId((prev) => (prev === nextActive ? prev : nextActive));

            if (articleRef.current) {
                const rect = articleRef.current.getBoundingClientRect();
                const articleTop = window.scrollY + rect.top;
                const articleBottom = articleTop + articleRef.current.offsetHeight;
                const maxScrollableY = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                const startY = Math.max(0, articleTop - anchorLine);
                const endY = Math.min(maxScrollableY, articleBottom - anchorLine);
                const denominator = Math.max(1, endY - startY);
                const progress = Math.min(1, Math.max(0, (window.scrollY - startY) / denominator));
                setScrollProgress((prev) => (Math.abs(prev - progress) < 0.002 ? prev : progress));
            }

            rafId = null;
        };

        const onScrollOrResize = () => {
            if (rafId !== null) return;
            rafId = requestAnimationFrame(updateScrollUi);
        };

        updateScrollUi();
        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize);
        return () => {
            if (rafId !== null) cancelAnimationFrame(rafId);
            window.removeEventListener('scroll', onScrollOrResize);
            window.removeEventListener('resize', onScrollOrResize);
        };
    }, [toc, processedContent]);

    const navigateToSection = useCallback((id) => {
        const node = document.getElementById(id);
        if (!node) return;
        const anchorLine = getReadingAnchorLine();
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const y = window.scrollY + node.getBoundingClientRect().top - anchorLine;
        const nextY = Math.max(0, Math.min(maxScroll, y));
        window.scrollTo({ top: nextY, behavior: 'smooth' });
        setActiveId(id);
    }, []);

    if (loading) {
        return <div className="min-h-screen pt-32 text-center text-[var(--text-primary)]">Loading...</div>;
    }

    if (!post) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-white">
                <SEO
                    title="Post Not Found"
                    description="This blog post could not be found."
                />
                <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">404</h1>
                <p className="text-[var(--text-secondary)] mb-8">Post not found</p>
                <Link to="/blog" className="text-blue-500 hover:text-blue-400 flex items-center gap-2">
                    <ArrowLeft size={20} /> Back to Blog
                </Link>
            </div>
        );
    }

    const plainText = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const metaDescription = (post.excerpt && post.excerpt.trim() !== '')
        ? post.excerpt
        : (plainText ? `${plainText.substring(0, 160)}${plainText.length > 160 ? '…' : ''}` : undefined);

    const stats = readingTime(post.content);
    const publishedAt = post.publishedAt || post.createdAt || new Date();
    const updatedAt = post.updatedAt || null;
    const date = new Date(publishedAt).toLocaleDateString(undefined, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const showUpdated = updatedAt && publishedAt && new Date(updatedAt).toDateString() !== new Date(publishedAt).toDateString();

    return (
        <article ref={articleRef} className="min-h-screen pt-32 pb-20">
            <SEO
                title={post.title}
                description={metaDescription}
                image={post.featuredImage}
                type="article"
            />
            <div className="fixed top-0 left-0 right-0 z-[95] h-1 bg-blue-500/15 pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300 transition-[width] duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, scrollProgress * 100))}%` }}
                />
            </div>
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
                    {showUpdated && (
                        <div className="text-gray-600 text-xs mt-1 w-full">
                            Last updated: {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="max-w-6xl mx-auto px-4 md:px-8 mb-16">
                    <div className="rounded-3xl overflow-hidden bg-[var(--bg-secondary)] shadow-2xl border border-[var(--border-color)]">
                        <div className="aspect-[21/9] relative">
                            <img
                                src={post.featuredImage}
                                alt={post.featuredImageAlt || post.title}
                                className="w-full h-full object-cover"
                            />
                            {(Array.isArray(post.featuredBadges) ? post.featuredBadges : [])
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
                        {(post.featuredImageCaption || post.featuredImageCredit) && (
                            <div className="px-6 py-3 bg-[var(--bg-secondary)] border-t border-[var(--border-color)] flex flex-wrap justify-between items-center gap-4 text-xs md:text-sm text-[var(--text-secondary)]">
                                {post.featuredImageCaption && (
                                    <span className="font-medium italic">{post.featuredImageCaption}</span>
                                )}
                                {post.featuredImageCredit && (
                                    <div className="flex items-center gap-1">
                                        <span className="opacity-70">Source:</span>
                                        {post.featuredImageCredit.startsWith('http') ? (
                                            <a
                                                href={post.featuredImageCredit}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:underline"
                                            >
                                                {new URL(post.featuredImageCredit).hostname.replace('www.', '')}
                                            </a>
                                        ) : (
                                            <span>{post.featuredImageCredit}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Content & Sidebar */}
            <div className="max-w-[1600px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 2xl:gap-20">
                {/* Table of Contents - Desktop Sidebar */}
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
                        <h3 className="text-base font-extrabold text-[var(--text-secondary)] uppercase tracking-widest mb-4">
                            Table of Contents
                        </h3>
                        {toc.length > 0 ? (
                            <TocNav
                                items={toc}
                                activeId={activeId}
                                onNavigate={navigateToSection}
                            />
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
