import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../../contexts/BlogContext';
import RichTextEditor from '../../components/blog/RichTextEditor';
import ImageUploader from '../../components/blog/ImageUploader';
import { Save, Eye, List, X, EyeOff, ChevronDown, ChevronUp, Hash } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../contexts/ToastContext';

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
    const savedRef = useRef(false);
    const pendingIdRef = useRef(null);

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
        tocHidden: []
    });

    useEffect(() => {
        if (loading) return;
        if (!isNew) {
            const existingPost = getPostById(id);
            if (existingPost) {
                setPost(existingPost);
                if (pendingIdRef.current === id) {
                    pendingIdRef.current = null;
                }
            } else {
                if (pendingIdRef.current === id) return;
                console.warn(`Post ${id} not found in ${posts?.length || 0} posts`);
                navigate('/admin/posts');
            }
        }
    }, [id, isNew, getPostById, navigate, loading]);

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

    // Parse TOC entries from content for the sidebar panel
    const tocEntries = useMemo(() => {
        if (!post.content) return { items: [] };
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const items = [];
        const customLabels = new Set();

        div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3').forEach((el, index) => {
            const isAnchor = el.matches('span[data-toc-anchor="true"]');
            const datasetLabel = el instanceof HTMLElement ? el.dataset?.tocLabel : null;
            const rawText = isAnchor
                ? (el.getAttribute('data-toc-label') || datasetLabel || el.textContent || '')
                : (el.textContent || '');
            const text = (rawText || '').replace(/\s+/g, ' ').trim();
            if (!text) return;

            const normalized = (text || '').toLowerCase();
            if (!isAnchor && customLabels.has(normalized)) return;

            if (isAnchor) {
                customLabels.add(normalized);
            }

            const id = isAnchor
                ? (el.getAttribute('id') || el.getAttribute('data-toc-id') || `toc-${index}`)
                : '';
            const level = isAnchor
                ? 'sub'
                : el.tagName.toLowerCase();

            items.push({
                id,
                text,
                level,
                type: isAnchor ? 'anchor' : 'heading',
            });
        });

        return { items };
    }, [post.content]);

    const tocHiddenArr = useMemo(() => Array.isArray(post.tocHidden) ? post.tocHidden : [], [post.tocHidden]);

    const unhideFromToc = useCallback((text) => {
        const normalized = (text || '').toLowerCase();
        setPost((p) => ({
            ...p,
            tocHidden: (Array.isArray(p.tocHidden) ? p.tocHidden : []).filter(
                (t) => (t || '').toLowerCase() !== normalized
            ),
        }));
    }, []);

    const removeAnchorFromContent = useCallback((anchorId) => {
        if (!post.content || !anchorId) return;
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const el = div.querySelector(`span[data-toc-anchor="true"]#${CSS.escape(anchorId)}`) ||
            div.querySelector(`span[data-toc-anchor="true"][data-toc-id="${CSS.escape(anchorId)}"]`);
        if (el) {
            // Replace with just text
            const text = el.getAttribute('data-toc-label') || '';
            el.replaceWith(document.createTextNode(text)); // Replace node with text
            setPost((p) => ({ ...p, content: div.innerHTML }));
        }
    }, [post.content]);

    const featuredUploadIdRef = useRef(0);
    const authorUploadIdRef = useRef(0);
    const [featuredFileDetails, setFeaturedFileDetails] = useState(null);
    const [authorFileDetails, setAuthorFileDetails] = useState(null);

    const handleFeaturedImageChange = async (file) => {
        if (!file) {
            setPost({ ...post, featuredImage: null });
            setFeaturedFileDetails(null);
            return;
        }
        if (typeof file === 'string') {
            setPost({ ...post, featuredImage: file });
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
            // It's a library item
            setPost({
                ...post,
                featuredImage: file.url,
                featuredImageCaption: file.caption || post.featuredImageCaption || '',
                featuredImageAlt: file.alt || post.featuredImageAlt || '',
                featuredImageCredit: file.credit || post.featuredImageCredit || ''
            });
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
                setPost({ ...post, featuredImage: url });
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
            setPost({ ...post, authorImage: null });
            setAuthorFileDetails(null);
            return;
        }
        if (typeof file === 'string') {
            setPost({ ...post, authorImage: file });
            return;
        }

        const currentId = Date.now();
        authorUploadIdRef.current = currentId;

        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setAuthorFileDetails({
            name: file.name,
            size: `${sizeInMB} MB`,
            type: file.type
        });

        if (!file.name && file.url) {
            setPost({
                ...post,
                authorImage: file.url
            });
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
                setPost({ ...post, authorImage: url });
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

    const handleCancelAuthorUpload = () => {
        authorUploadIdRef.current = 0;
        setAuthorUploading(false);
        setAuthorUploadProgress(0);
        setAuthorFileDetails(null);
        toast?.info?.("Upload cancelled");
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

        const postToSave = {
            ...post,
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
                                    height="h-56"
                                />
                        </div>

                        <div className="prose-container bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-soft">
                            <RichTextEditor
                                content={post.content}
                                onChange={(content) => setPost({ ...post, content })}
                                onImageUpload={handleBodyImageUpload}
                                onHideFromToc={(text) => {
                                    const normalized = (text || '').replace(/\s+/g, ' ').trim();
                                    if (!normalized) return;
                                    const existing = Array.isArray(post.tocHidden) ? post.tocHidden : [];
                                    if (existing.some((t) => (t || '').toLowerCase() === normalized.toLowerCase())) return;
                                    setPost({ ...post, tocHidden: [...existing, normalized] });
                                    toast?.info?.(`"${normalized}" hidden from TOC`);
                                }}
                            />
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-4">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto">
                            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-base">
                                Post Settings
                            </h3>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author Name</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                        value={post.authorName || ''}
                                        onChange={(e) => setPost({ ...post, authorName: e.target.value })}
                                        placeholder="e.g. John Doe"
                                    />
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
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author Photo</label>
                                    <ImageUploader
                                        image={post.authorImage}
                                        onChange={handleAuthorImageChange}
                                        uploading={authorUploading}
                                        onCancel={handleCancelAuthorUpload}
                                        progress={authorUploadProgress}
                                        fileDetails={authorFileDetails}
                                        recommendedText="400 x 400px"
                                        height="h-40"
                                        titleText="Author Photo"
                                        descriptionText="Upload or select a profile photo for this post"
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

                            {/* TOC Management */}
                            <hr className="border-[var(--border-color)]" />
                            <div>
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
                                                    return !tocHiddenArr.some((t) => (t || '').toLowerCase() === item.text.toLowerCase());
                                                }).length}
                                            </span>
                                        )}
                                    </span>
                                    {tocOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                                </button>

                                {tocOpen && (
                                    <div className="mt-3 space-y-3">
                                        {/* Custom anchors */}
                                        {tocEntries.items.length > 0 && (
                                            <div className="space-y-1">
                                                {tocEntries.items.map((item, i) => {
                                                    const isHeading = item.type === 'heading';
                                                    const isHidden = isHeading && tocHiddenArr.some((t) => (t || '').toLowerCase() === item.text.toLowerCase());
                                                    const isSub = item.level === 'h3' || item.level === 'sub';

                                                    return (
                                                        <div
                                                            key={`${item.type}-${item.id || i}`}
                                                            className={`flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 group ${isHidden ? 'opacity-50' : ''} ${isSub ? 'ml-4 border-l-2 border-l-purple-400' : ''}`}
                                                        >
                                                            {isHeading ? (
                                                                <Hash size={12} className={`shrink-0 ${item.level === 'h1' ? 'text-blue-500' : item.level === 'h2' ? 'text-blue-400' : 'text-blue-300'}`} />
                                                            ) : (
                                                                <div className="text-purple-400 shrink-0 select-none">↳</div>
                                                            )}
                                                            <span className={`text-xs truncate flex-1 ${isHidden ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                                                {item.text}
                                                            </span>
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
                                                                    onClick={() => removeAnchorFromContent(item.id)}
                                                                    className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                                                    title="Remove from TOC"
                                                                >
                                                                    <X size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {tocEntries.items.length === 0 && (
                                            <p className="text-xs text-[var(--text-secondary)] italic">No TOC entries yet. Add headings or right-click text to create custom entries.</p>
                                        )}
                                    </div >
                                )}
                            </div >
                        </div >
                    </div >
                </div >
            </div >
        </div >
    );
};

export default PostEditor;
