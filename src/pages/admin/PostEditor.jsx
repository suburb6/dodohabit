import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readingTime } from 'reading-time-estimator';
import { useBlog } from '../../contexts/BlogContext';
import RichTextEditor from '../../components/blog/RichTextEditor';
import ImageUploader from '../../components/blog/ImageUploader';
import MediaLibraryModal from '../../components/blog/MediaLibraryModal';
import ImageSourceMenu from '../../components/blog/ImageSourceMenu';
import { Save, Eye, List, X, EyeOff, ChevronDown, ChevronUp, Hash, Camera, Trash2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../contexts/ToastContext';

const normalizeLabel = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const tocItemKey = (item) => `${item.type}-${item.sourceIndex}`;

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { posts, getPostById, createPost, updatePost, uploadImage, loading } = useBlog();
    const toast = useToast();
    const isNew = !id;
    const [featuredUploading, setFeaturedUploading] = useState(false);
    const [featuredUploadProgress, setFeaturedUploadProgress] = useState(0);
    const [authorUploading, setAuthorUploading] = useState(false);
    const [authorUploadProgress, setAuthorUploadProgress] = useState(0);
    const [bodyUploading, setBodyUploading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tocOpen, setTocOpen] = useState(true);
    const [authorPhotoMenuOpen, setAuthorPhotoMenuOpen] = useState(false);
    const [authorPhotoLibraryOpen, setAuthorPhotoLibraryOpen] = useState(false);
    const [tocLabelDrafts, setTocLabelDrafts] = useState({});
    const savedRef = useRef(false);
    const pendingIdRef = useRef(null);
    const initializedPostIdRef = useRef(null);
    const authorPhotoInputRef = useRef(null);
    const authorPhotoMenuRef = useRef(null);

    const [post, setPost] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: null,
        featuredImageCaption: '',
        featuredImageAlt: '',
        featuredImageCredit: '',
        status: 'draft',
        slug: '',
        publishedAt: null,
        authorName: '',
        authorTitle: '',
        authorImage: null,
        featuredBadges: [],
        tocHidden: []
    });

    useEffect(() => {
        if (loading) return;
        if (!isNew) {
            const existingPost = getPostById(id);
            if (existingPost) {
                if (initializedPostIdRef.current === id) {
                    return;
                }
                setPost({
                    ...existingPost,
                    featuredBadges: Array.isArray(existingPost.featuredBadges)
                        ? existingPost.featuredBadges.slice(0, 2)
                        : []
                });
                initializedPostIdRef.current = id;
                if (pendingIdRef.current === id) {
                    pendingIdRef.current = null;
                }
            } else {
                if (pendingIdRef.current === id) return;
                console.warn(`Post ${id} not found in ${posts?.length || 0} posts`);
                navigate('/admin/posts');
            }
        }
    }, [id, isNew, getPostById, navigate, loading, posts]);

    useEffect(() => {
        initializedPostIdRef.current = null;
    }, [id]);

    // Mark dirty on any post field change (skip initial load)
    const initialLoadDone = useRef(false);
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            return;
        }
        if (!savedRef.current) {
            setDirty(true);
        }
        savedRef.current = false;
    }, [post]);

    // Warn on reload / tab close when dirty or uploading
    const isUploading = featuredUploading || authorUploading || bodyUploading;

    useEffect(() => {
        if (!dirty && !isUploading) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty, isUploading]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                if (!saving && !isUploading) {
                    handleSave('draft');
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [saving, isUploading, post, id]);

    useEffect(() => {
        if (!authorPhotoMenuOpen) return;
        const onMouseDown = (event) => {
            if (authorPhotoMenuRef.current?.contains(event.target)) return;
            setAuthorPhotoMenuOpen(false);
        };
        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, [authorPhotoMenuOpen]);

    const tocEntries = useMemo(() => {
        if (!post.content) return { items: [] };
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const items = [];
        const customLabels = new Set();

        Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3')).forEach((el, sourceIndex) => {
            const isAnchor = el.matches('span[data-toc-anchor="true"]');
            const datasetLabel = el instanceof HTMLElement ? el.dataset?.tocLabel : null;
            const rawText = isAnchor
                ? (el.getAttribute('data-toc-label') || datasetLabel || el.textContent || '')
                : (el.textContent || '');
            const text = (rawText || '').replace(/\s+/g, ' ').trim();
            if (!text) return;

            const normalized = normalizeLabel(text);
            if (!isAnchor && customLabels.has(normalized)) return;

            if (isAnchor) {
                customLabels.add(normalized);
            }

            const id = isAnchor
                ? (el.getAttribute('id') || el.getAttribute('data-toc-id') || `toc-${sourceIndex}`)
                : '';
            const level = isAnchor
                ? 'sub'
                : el.tagName.toLowerCase();

            items.push({
                id,
                text,
                level,
                type: isAnchor ? 'anchor' : 'heading',
                sourceIndex,
            });
        });

        return { items };
    }, [post.content]);

    useEffect(() => {
        if (!tocEntries.items.length) {
            setTocLabelDrafts({});
            return;
        }
        setTocLabelDrafts((drafts) => {
            const next = { ...drafts };
            tocEntries.items.forEach((item) => {
                const key = tocItemKey(item);
                if (typeof next[key] !== 'string') {
                    next[key] = item.text;
                }
            });
            return next;
        });
    }, [tocEntries.items]);

    const tocHiddenArr = useMemo(() => Array.isArray(post.tocHidden) ? post.tocHidden : [], [post.tocHidden]);
    const editorStats = useMemo(() => {
        const plainText = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = plainText ? plainText.split(' ').filter(Boolean).length : 0;
        const read = readingTime(post.content || '');
        return { words, read: read.text || '0 min read' };
    }, [post.content]);

    const unhideFromToc = useCallback((text) => {
        const normalized = normalizeLabel(text);
        setPost((p) => ({
            ...p,
            tocHidden: (Array.isArray(p.tocHidden) ? p.tocHidden : []).filter(
                (t) => normalizeLabel(t) !== normalized
            ),
        }));
    }, []);

    const updateFeaturedBadge = useCallback((index, value) => {
        setPost((prev) => {
            const current = Array.isArray(prev.featuredBadges) ? prev.featuredBadges.slice(0, 2) : [];
            while (current.length < 2) current.push('');
            current[index] = value;
            return { ...prev, featuredBadges: current };
        });
    }, []);

    const renameTocEntry = useCallback((item, nextText) => {
        const label = (nextText || '').replace(/\s+/g, ' ').trim();
        if (!label) {
            setTocLabelDrafts((drafts) => ({ ...drafts, [tocItemKey(item)]: item.text }));
            return;
        }

        setPost((p) => {
            if (!p.content) return p;
            const div = document.createElement('div');
            div.innerHTML = p.content;
            const nodes = Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3'));
            const target = nodes[item.sourceIndex];
            if (!target) return p;

            let previous = '';
            if (item.type === 'anchor') {
                previous = (target.getAttribute('data-toc-label') || target.textContent || '').replace(/\s+/g, ' ').trim();
                target.setAttribute('data-toc-label', label);
                target.setAttribute('data-toc-anchor', 'true');
                target.textContent = '';
            } else {
                previous = (target.textContent || '').replace(/\s+/g, ' ').trim();
                target.textContent = label;
            }

            const updatedHidden = (Array.isArray(p.tocHidden) ? p.tocHidden : []).map((entry) =>
                normalizeLabel(entry) === normalizeLabel(previous) ? label : entry
            );

            return { ...p, content: div.innerHTML, tocHidden: updatedHidden };
        });

        setTocLabelDrafts((drafts) => ({ ...drafts, [tocItemKey(item)]: label }));
    }, []);

    const removeAnchorFromContent = useCallback((sourceIndex) => {
        setPost((p) => {
            if (!p.content) return p;
            const div = document.createElement('div');
            div.innerHTML = p.content;
            const nodes = Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3'));
            const target = nodes[sourceIndex];
            if (!target || !target.matches('span[data-toc-anchor="true"]')) return p;
            const text = target.getAttribute('data-toc-label') || '';
            target.replaceWith(document.createTextNode(text));
            return { ...p, content: div.innerHTML };
        });
    }, []);

    const featuredUploadIdRef = useRef(0);
    const authorUploadIdRef = useRef(0);
    const [featuredFileDetails, setFeaturedFileDetails] = useState(null);

    const handleFeaturedImageChange = async (file) => {
        if (!file) {
            setPost((prev) => ({ ...prev, featuredImage: null }));
            setFeaturedFileDetails(null);
            return;
        }
        if (typeof file === 'string') {
            setPost((prev) => ({ ...prev, featuredImage: file }));
            return;
        }

        const currentId = Date.now();
        featuredUploadIdRef.current = currentId;

        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setFeaturedFileDetails({
            name: file.name,
            size: `${sizeInMB} MB`,
            type: file.type
        });

        // Check if this is a library item (object with url) or a raw file
        if (!file.name && file.url) {
            setPost((prev) => ({
                ...prev,
                featuredImage: file.url,
                featuredImageCaption: file.caption || prev.featuredImageCaption || '',
                featuredImageAlt: file.alt || prev.featuredImageAlt || '',
                featuredImageCredit: file.credit || prev.featuredImageCredit || ''
            }));
            return;
        }

        try {
            setFeaturedUploading(true);
            setFeaturedUploadProgress(0);

            const url = await uploadImage(file, (progress) => {
                if (featuredUploadIdRef.current === currentId) {
                    setFeaturedUploadProgress(progress);
                }
            });

            if (featuredUploadIdRef.current === currentId) {
                setPost((prev) => ({ ...prev, featuredImage: url }));
            }
        } catch (error) {
            if (featuredUploadIdRef.current !== 0) {
                console.error("Upload error caught in component:", error);
                toast?.error?.(`Upload failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            if (featuredUploadIdRef.current === currentId) {
                setFeaturedUploading(false);
                setFeaturedUploadProgress(0);
            }
        }
    };

    const handleCancelFeaturedUpload = () => {
        featuredUploadIdRef.current = 0;
        setFeaturedUploading(false);
        setFeaturedUploadProgress(0);
        setFeaturedFileDetails(null);
        toast?.info?.("Upload cancelled");
    };

    const handleAuthorImageChange = async (file) => {
        if (!file) {
            setPost((prev) => ({ ...prev, authorImage: null }));
            return;
        }
        if (typeof file === 'string') {
            setPost((prev) => ({ ...prev, authorImage: file }));
            return;
        }

        const currentId = Date.now();
        authorUploadIdRef.current = currentId;

        if (!file.name && file.url) {
            setPost((prev) => ({
                ...prev,
                authorImage: file.url
            }));
            return;
        }

        try {
            setAuthorUploading(true);
            setAuthorUploadProgress(0);

            const url = await uploadImage(file, (progress) => {
                if (authorUploadIdRef.current === currentId) {
                    setAuthorUploadProgress(progress);
                }
            });

            if (authorUploadIdRef.current === currentId) {
                setPost((prev) => ({ ...prev, authorImage: url }));
            }
        } catch (error) {
            if (authorUploadIdRef.current !== 0) {
                console.error("Upload error caught in component:", error);
                toast?.error?.(`Upload failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            if (authorUploadIdRef.current === currentId) {
                setAuthorUploading(false);
                setAuthorUploadProgress(0);
            }
        }
    };

    const handleAuthorFileInput = (event) => {
        const file = event.target.files?.[0];
        if (file) handleAuthorImageChange(file);
        event.target.value = '';
    };

    const handleMetadataChange = (field, value) => {
        setPost(p => ({
            ...p,
            [`featuredImage${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
        }));
    };

    const handleBodyImageUpload = async (file) => {
        try {
            setBodyUploading(true);
            const url = await uploadImage(file);
            return url;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setBodyUploading(false);
        }
    };

    const handleSave = async (statusOverride) => {
        if (saving) return;
        const status = statusOverride || post.status;
        const now = new Date().toISOString();

        if (!post.title || !post.title.trim()) {
            toast?.error?.("Post title is required.");
            return;
        }

        const badges = (Array.isArray(post.featuredBadges) ? post.featuredBadges : [])
            .map((entry) => (entry || '').trim())
            .filter(Boolean)
            .slice(0, 2);

        const postToSave = {
            ...post,
            featuredBadges: badges,
            status,
            publishedAt: status === 'published' && !post.publishedAt ? now : post.publishedAt
        };
        const contentSizeBytes = new Blob([postToSave.content || '']).size;
        console.log(`Payload Size Check: ~${(contentSizeBytes / 1024).toFixed(2)} KB`);

        if (contentSizeBytes > 800000) { // ~800KB (Firestore limit is 1MB but we need overhead)
            toast?.error?.("Content is too large. Did you paste a high-res image directly?");
            setSaving(false);
            return;
        }

        try {
            setSaving(true);
            savedRef.current = true;
            setDirty(false);

            // Timeout promise to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 15000)
            );

            const savePromise = isNew ? createPost(postToSave) : updatePost(id, postToSave);
            const result = await Promise.race([savePromise, timeoutPromise]);

            if (isNew && result) {
                pendingIdRef.current = result;
                navigate(`/admin/posts/${result}/edit`, { replace: true });
            }

            toast?.success?.(status === 'published' ? 'Post published successfully!' : 'Draft saved!');
            setSaving(false);
        } catch (error) {
            console.error("Failed to save post:", error);
            savedRef.current = false;
            setDirty(true);
            setSaving(false);
            if (error.message === "Request timed out") {
                toast?.error?.("The operation timed out. Please check your internet connection.");
            } else {
                toast?.error?.(`Failed to ${status === 'published' ? 'publish' : 'save'}: ${error?.message || 'Unknown error'}`);
            }
        }
    };

    const handlePreview = () => {
        localStorage.setItem('blog_preview_data', JSON.stringify(post));
        window.open('/blog/preview', '_blank', 'noopener,noreferrer');
    };

    const headerActions = (
        <>
            <button
                onClick={handlePreview}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
                <Eye size={18} /> Preview
            </button>
            <button
                onClick={() => handleSave('draft')}
                disabled={isUploading || saving}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
                {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
                onClick={() => handleSave('published')}
                disabled={isUploading || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
                <Save size={18} /> {saving ? 'Saving...' : (post.status === 'published' ? 'Update' : 'Publish')}
            </button>
        </>
    );

    return (
        <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
            <AdminHeader
                title={post.title || (isNew ? 'New Post' : 'Untitled Post')}
                status={post.status || 'draft'}
                uploading={isUploading}
                actions={headerActions}
            />

            <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-6 w-full">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Editor */}
                    <div className="xl:col-span-3 space-y-6">
                        <input
                            type="text"
                            placeholder="Post Title"
                            className="w-full bg-transparent text-3xl font-extrabold text-[var(--text-primary)] placeholder-[var(--text-secondary)] border-none focus:outline-none focus:ring-0 px-0"
                            value={post.title}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            autoFocus
                        />

                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Featured Image</label>
                            <ImageUploader
                                image={post.featuredImage}
                                onChange={handleFeaturedImageChange}
                                uploading={featuredUploading}
                                onCancel={handleCancelFeaturedUpload}
                                progress={featuredUploadProgress}
                                fileDetails={featuredFileDetails}
                                recommendedText="1200 x 630px"
                                metadata={{
                                    caption: post.featuredImageCaption,
                                    alt: post.featuredImageAlt,
                                    credit: post.featuredImageCredit
                                }}
                                onMetadataChange={handleMetadataChange}
                                height="h-72 lg:h-80"
                            />

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Image badge #1 (e.g. Featured)"
                                    value={Array.isArray(post.featuredBadges) ? (post.featuredBadges[0] || '') : ''}
                                    onChange={(e) => updateFeaturedBadge(0, e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Image badge #2 (e.g. Editor Pick)"
                                    value={Array.isArray(post.featuredBadges) ? (post.featuredBadges[1] || '') : ''}
                                    onChange={(e) => updateFeaturedBadge(1, e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="prose-container bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-visible shadow-soft">
                            <RichTextEditor
                                content={post.content}
                                onChange={(content) => setPost({ ...post, content })}
                                onImageUpload={handleBodyImageUpload}
                            />
                        </div>

                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                            <span>{editorStats.words} words</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                            <span>{editorStats.read}</span>
                            <span className="ml-auto">Shortcut: `Ctrl/Cmd + S` to save draft</span>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-4 xl:col-span-1 xl:self-stretch">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft">
                            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-base">
                                Post Settings
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative z-20" ref={authorPhotoMenuRef}>
                                            <button
                                                type="button"
                                                onClick={() => setAuthorPhotoMenuOpen((v) => !v)}
                                                className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors overflow-hidden flex items-center justify-center"
                                                title="Author photo options"
                                            >
                                                {post.authorImage ? (
                                                    <img src={post.authorImage} alt={post.authorName || 'Author'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera size={16} />
                                                )}
                                            </button>

                                            <ImageSourceMenu
                                                open={authorPhotoMenuOpen}
                                                onClose={() => setAuthorPhotoMenuOpen(false)}
                                                onUploadFromComputer={() => authorPhotoInputRef.current?.click()}
                                                onOpenLibrary={() => setAuthorPhotoLibraryOpen(true)}
                                                anchorRef={authorPhotoMenuRef}
                                                portal
                                            />

                                            <input
                                                ref={authorPhotoInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAuthorFileInput}
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                            value={post.authorName || ''}
                                            onChange={(e) => setPost({ ...post, authorName: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />

                                        {post.authorImage && (
                                            <button
                                                type="button"
                                                onClick={() => handleAuthorImageChange(null)}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Remove author photo"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {authorUploading && (
                                        <div className="mt-2 text-[10px] text-blue-400">
                                            Uploading author photo... {Math.round(authorUploadProgress)}%
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                        value={post.authorTitle || ''}
                                        onChange={(e) => setPost({ ...post, authorTitle: e.target.value })}
                                        placeholder="e.g. Senior Editor"
                                    />
                                </div>

                                <hr className="border-[var(--border-color)] my-4" />

                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Slug</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                        value={post.slug}
                                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                                        placeholder="auto-generated-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Excerpt</label>
                                    <textarea
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                                        value={post.excerpt}
                                        onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                                        placeholder="Short summary for search engines..."
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="sticky top-20 z-20 self-start">
                            <div
                                data-lenis-prevent
                                className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft max-h-[calc(100vh-6.25rem)] overflow-y-auto thin-scrollbar"
                            >
                                <button
                                    type="button"
                                    onClick={() => setTocOpen((v) => !v)}
                                    className="flex items-center justify-between w-full text-left"
                                >
                                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm">
                                        <List size={16} className="text-blue-500" />
                                        Table of Contents
                                        {tocEntries.items.length > 0 && (
                                            <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                                                {tocEntries.items.filter((item) => {
                                                    if (item.type === 'anchor') return true;
                                                    return !tocHiddenArr.some((t) => normalizeLabel(t) === normalizeLabel(item.text));
                                                }).length}
                                            </span>
                                        )}
                                    </span>
                                    {tocOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                                </button>

                                {tocOpen && (
                                    <div className="mt-1 space-y-2">
                                        {tocEntries.items.length > 0 && tocEntries.items.map((item) => {
                                            const isHeading = item.type === 'heading';
                                            const isHidden = isHeading && tocHiddenArr.some((t) => normalizeLabel(t) === normalizeLabel(item.text));
                                            const isSub = item.level === 'h3' || item.level === 'sub';
                                            const key = tocItemKey(item);

                                            return (
                                                <div
                                                    key={key}
                                                    className={`flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-2 group ${isHidden ? 'opacity-50' : ''} ${isSub ? 'ml-4 border-l-2 border-l-blue-400' : ''}`}
                                                >
                                                    {isHeading ? (
                                                        <Hash size={12} className={`shrink-0 ${item.level === 'h1' ? 'text-blue-500' : item.level === 'h2' ? 'text-blue-400' : 'text-blue-300'}`} />
                                                    ) : (
                                                        <div className="text-blue-400 shrink-0 select-none">↳</div>
                                                    )}
                                                    <input
                                                        value={tocLabelDrafts[key] ?? item.text}
                                                        onChange={(e) => setTocLabelDrafts((drafts) => ({ ...drafts, [key]: e.target.value }))}
                                                        onBlur={(e) => renameTocEntry(item, e.target.value)}
                                                        className={`text-xs flex-1 bg-transparent focus:outline-none ${isHidden ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}
                                                        title="Edit TOC text"
                                                    />
                                                    {isHeading && (
                                                        <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold shrink-0">{item.level}</span>
                                                    )}
                                                    {isHeading ? (
                                                        isHidden ? (
                                                            <button
                                                                type="button"
                                                                onClick={() => unhideFromToc(item.text)}
                                                                className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-green-400 transition-all"
                                                                title="Show in TOC"
                                                            >
                                                                <Eye size={12} />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const existing = Array.isArray(post.tocHidden) ? post.tocHidden : [];
                                                                    if (existing.some((entry) => normalizeLabel(entry) === normalizeLabel(item.text))) return;
                                                                    setPost({ ...post, tocHidden: [...existing, item.text] });
                                                                }}
                                                                className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-yellow-400 transition-all"
                                                                title="Hide from TOC"
                                                            >
                                                                <EyeOff size={12} />
                                                            </button>
                                                        )
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeAnchorFromContent(item.sourceIndex)}
                                                            className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                                            title="Remove custom TOC entry"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                            );
                                        })}

                                        {tocEntries.items.length === 0 && (
                                            <p className="text-xs text-[var(--text-secondary)] italic">No TOC entries yet. Add headings or use the cursor TOC action in editor.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            </div >

            <MediaLibraryModal
                isOpen={authorPhotoLibraryOpen}
                onClose={() => setAuthorPhotoLibraryOpen(false)}
                onSelect={handleAuthorImageChange}
            />
        </div >
    );
};

export default PostEditor;
