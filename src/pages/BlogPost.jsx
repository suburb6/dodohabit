import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBlog } from '../contexts/BlogContext';
import ShareButtons from '../components/blog/ShareButtons';
import { ArrowLeft, Clock, Calendar, List, X } from 'lucide-react';
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

const getProgressAnchorLine = () => {
    const viewportHeight = window.innerHeight || 0;
    return Math.round(Math.min(320, Math.max(120, viewportHeight * 0.34)));
};

const getTocSwitchLine = () => {
    const viewportHeight = window.innerHeight || 0;
    return Math.round(Math.min(180, Math.max(84, viewportHeight * 0.22)));
};

const getTocAdvanceOffset = () => {
    const viewportHeight = window.innerHeight || 0;
    return Math.round(Math.min(96, Math.max(36, viewportHeight * 0.08)));
};

const toIsoIfValid = (value) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toISOString();
};

const BlogPost = () => {
    const { slug } = useParams();
    const { getPost, loading } = useBlog();
    const matchedPost = getPost(slug);
    const post = matchedPost && matchedPost.status === 'published' ? matchedPost : null;
    // Generate Table of Contents and inject IDs
    const [toc, setToc] = useState([]);
    const [processedContent, setProcessedContent] = useState('');
    const [activeId, setActiveId] = useState(null);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [mobileTocOpen, setMobileTocOpen] = useState(false);
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
            const switchLine = getTocSwitchLine();
            const advanceOffset = getTocAdvanceOffset();
            let nextActive = toc[0]?.id || null;

            for (const item of toc) {
                const node = document.getElementById(item.id);
                if (!node) continue;
                if (node.getBoundingClientRect().top <= switchLine + advanceOffset) {
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
                const progressAnchorLine = getProgressAnchorLine();
                const rect = articleRef.current.getBoundingClientRect();
                const articleTop = window.scrollY + rect.top;
                const articleBottom = articleTop + articleRef.current.offsetHeight;
                const maxScrollableY = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
                const startY = Math.max(0, articleTop - progressAnchorLine);
                const endY = Math.min(maxScrollableY, articleBottom - progressAnchorLine);
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
        const anchorLine = getTocSwitchLine();
        const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
        const y = window.scrollY + node.getBoundingClientRect().top - anchorLine;
        const nextY = Math.max(0, Math.min(maxScroll, y));
        window.scrollTo({ top: nextY, behavior: 'smooth' });
        setActiveId(id);
    }, []);

    const navigateFromMobileToc = useCallback((id) => {
        navigateToSection(id);
        setMobileTocOpen(false);
    }, [navigateToSection]);

    useEffect(() => {
        if (!mobileTocOpen) return undefined;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        const onKeyDown = (event) => {
            if (event.key === 'Escape') setMobileTocOpen(false);
        };
        window.addEventListener('keydown', onKeyDown);
        return () => {
            document.body.style.overflow = previousOverflow;
            window.removeEventListener('keydown', onKeyDown);
        };
    }, [mobileTocOpen]);

    if (loading) {
        return <div className="min-h-screen pt-32 text-center text-[var(--text-primary)]">Loading...</div>;
    }

    if (!post) {
        return (
            <div className="min-h-screen pt-32 flex flex-col items-center justify-center text-white">
                <SEO
                    title="Post Not Found"
                    description="This blog post could not be found."
                    noindex
                />
                <h1 className="text-4xl font-bold mb-4 text-[var(--text-primary)]">404</h1>
                <p className="text-[var(--text-secondary)] mb-8">Post not found</p>
                <Link to="/blog" className="text-[var(--accent-primary)] hover:text-[var(--accent-primary-strong)] flex items-center gap-2">
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
    const publishedIso = toIsoIfValid(publishedAt);
    const updatedIso = toIsoIfValid(updatedAt) || publishedIso;
    const siteUrl = (typeof window !== 'undefined' ? window.location.origin : 'https://dodohabit.com').replace(/\/$/, '');
    const canonicalUrl = `${siteUrl}/blog/${encodeURIComponent(post.slug || slug || '')}`;
    const absoluteFeaturedImage = post.featuredImage
        ? (post.featuredImage.startsWith('http') ? post.featuredImage : `${siteUrl}${post.featuredImage}`)
        : `${siteUrl}/og-image.png`;
    const schemaDescription = metaDescription || post.title;
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: schemaDescription,
        url: canonicalUrl,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': canonicalUrl,
        },
        image: [absoluteFeaturedImage],
        datePublished: publishedIso || undefined,
        dateModified: updatedIso || undefined,
        author: {
            '@type': 'Person',
            name: post.authorName || 'DodoHabit Team',
        },
        publisher: {
            '@type': 'Organization',
            name: 'DodoHabit',
            logo: {
                '@type': 'ImageObject',
                url: `${siteUrl}/icon.png`,
            },
        },
    };
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
                author={post.authorName || 'DodoHabit Team'}
                publishedTime={publishedIso}
                modifiedTime={updatedIso}
                structuredData={articleSchema}
            />
            <div className="fixed top-0 left-0 right-0 z-[95] h-1 bg-[var(--accent-primary)]/15 pointer-events-none">
                <div
                    className="h-full bg-gradient-to-r from-[var(--accent-primary-strong)] via-[var(--accent-primary)] to-[var(--accent-secondary)] transition-[width] duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, scrollProgress * 100))}%` }}
                />
            </div>
            {/* Header */}
            {/* Header */}
            <header className="max-w-4xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 mb-14 text-center pt-8">

                <h1 className="text-4xl md:text-6xl font-extrabold text-[var(--text-primary)] leading-tight mb-8">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center gap-6 text-[var(--text-secondary)] text-sm md:text-base">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-[var(--accent-primary)]" />
                        <span>{date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Clock size={18} className="text-[var(--accent-primary)]" />
                        <span>{stats.text}</span>
                    </div>
                    {showUpdated && (
                        <div className="text-[var(--text-secondary)] text-xs mt-1 w-full">
                            Last updated: {new Date(updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                    )}
                </div>
            </header>

            {/* Featured Image */}
            {post.featuredImage && (
                <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 mb-16">
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
                                                className="text-[var(--accent-primary)] hover:underline"
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
            <div className="max-w-[1480px] mx-auto px-5 sm:px-8 lg:px-12 xl:px-16 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-12 2xl:gap-14">
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
                            <div className="w-12 h-12 bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] rounded-full flex items-center justify-center text-white shadow-lg shrink-0">
                                <span className="font-bold text-lg">{post.authorName ? post.authorName.charAt(0) : 'D'}</span>
                            </div>
                        )}
                        <div>
                            <span className="font-bold text-[var(--text-primary)] block text-lg">{post.authorName || 'Dodohabit Team'}</span>
                            <span className="text-sm text-[var(--text-secondary)]">{post.authorTitle || 'Building habits that stick.'}</span>
                        </div>
                    </div>

                    <div className="sticky top-32 space-y-4">
                        <h3 className="text-xs font-extrabold text-[var(--text-secondary)] uppercase tracking-[0.18em] mb-3">
                            Table of Contents
                        </h3>
                        {toc.length > 0 ? (
                            <TocNav
                                items={toc}
                                activeId={activeId}
                                onNavigate={navigateToSection}
                            />
                        ) : (
                            <p className="text-sm text-[var(--text-secondary)] italic">No sections found</p>
                        )}

                        <div className="pt-4">
                            <ShareButtons title={post.title} url={window.location.href} />
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-8 2xl:col-span-8 w-full max-w-[700px] xl:max-w-[700px] 2xl:max-w-[720px]">
                    {toc.length > 0 && (
                        <div className="lg:hidden sticky top-24 z-20 mb-5">
                            <button
                                type="button"
                                onClick={() => setMobileTocOpen(true)}
                                className="w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/95 backdrop-blur-md px-4 py-3 text-left text-sm text-[var(--text-primary)] shadow-xl"
                            >
                                <span className="inline-flex items-center gap-2 font-semibold">
                                    <List size={16} className="text-[var(--accent-primary)]" />
                                    Table of Contents
                                </span>
                                {activeId && (
                                    <span className="block mt-1 text-xs text-[var(--text-secondary)] truncate">
                                        {toc.find((item) => item.id === activeId)?.text || ''}
                                    </span>
                                )}
                            </button>
                        </div>
                    )}

                    <div
                        className="prose prose-base lg:prose-lg max-w-none
                        prose-headings:text-[var(--text-primary)] prose-headings:font-bold prose-headings:scroll-mt-32
                        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                        prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                        prose-p:text-[var(--text-secondary)] prose-p:leading-7 prose-p:mb-6
                        prose-a:text-[var(--accent-primary)] prose-a:no-underline hover:prose-a:text-[var(--accent-primary-strong)] hover:prose-a:underline
                        prose-strong:text-[var(--text-primary)] prose-strong:font-bold
                        prose-code:text-[var(--accent-primary)] prose-code:bg-[var(--bg-secondary)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:before:content-none prose-code:after:content-none
                        prose-blockquote:border-l-[var(--accent-primary)] prose-blockquote:text-[var(--text-secondary)]
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

            {mobileTocOpen && (
                <div
                    className="fixed inset-0 z-[110] bg-black/70 backdrop-blur-sm p-4 flex items-end sm:items-center justify-center"
                    onClick={() => setMobileTocOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-4 max-h-[78vh] overflow-y-auto thin-scrollbar"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-extrabold text-[var(--text-secondary)] uppercase tracking-widest">Table of Contents</h3>
                            <button
                                type="button"
                                onClick={() => setMobileTocOpen(false)}
                                className="p-1.5 rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <TocNav
                            items={toc}
                            activeId={activeId}
                            onNavigate={navigateFromMobileToc}
                        />
                    </div>
                </div>
            )}
            {/* Related Posts */}
            {/* Can be implemented later, for now just simple footer area */}
        </article>
    );
};

export default BlogPost;
