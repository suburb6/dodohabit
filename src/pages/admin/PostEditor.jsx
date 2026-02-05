import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../../contexts/BlogContext';
import RichTextEditor from '../../components/blog/RichTextEditor';
import ImageUploader from '../../components/blog/ImageUploader';
import { Save, Eye, List, X, EyeOff, ChevronDown, ChevronUp, Hash, Bookmark } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../contexts/ToastContext';

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPostById, createPost, updatePost, uploadImage } = useBlog();
    const toast = useToast();
    const isNew = !id;
    const [uploading, setUploading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [tocOpen, setTocOpen] = useState(true);
    const savedRef = useRef(false);

    const [post, setPost] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: null,
        status: 'draft',
        slug: '',
        publishedAt: null,
        authorName: '',
        authorTitle: '',
        tocHidden: []
    });

    useEffect(() => {
        if (!isNew) {
            const existingPost = getPostById(id);
            if (existingPost) {
                setPost(existingPost);
            } else {
                navigate('/admin/posts');
            }
        }
    }, [id, isNew, getPostById, navigate]);

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

    // Warn on reload / tab close when dirty
    useEffect(() => {
        if (!dirty) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);

    // Parse TOC entries from content for the sidebar panel
    const tocEntries = useMemo(() => {
        if (!post.content) return { headings: [], anchors: [] };
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const headings = [];
        const anchors = [];
        div.querySelectorAll('h1, h2, h3').forEach((el) => {
            const text = (el.textContent || '').replace(/\s+/g, ' ').trim();
            if (text) headings.push({ text, level: el.tagName.toLowerCase() });
        });
        div.querySelectorAll('span[data-toc-anchor="true"]').forEach((el) => {
            const label = el.getAttribute('data-toc-label') || (el instanceof HTMLElement ? el.dataset?.tocLabel : null) || '';
            const id = el.getAttribute('id') || el.getAttribute('data-toc-id') || '';
            if (label.trim()) anchors.push({ label: label.trim(), id });
        });
        return { headings, anchors };
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
            el.remove();
            setPost((p) => ({ ...p, content: div.innerHTML }));
        }
    }, [post.content]);

    const handleFeaturedImageChange = async (file) => {
        if (!file) {
            setPost({ ...post, featuredImage: null });
            return;
        }
        if (typeof file === 'string') return;

        try {
            setUploading(true);
            const url = await uploadImage(file);
            setPost({ ...post, featuredImage: url });
        } catch (error) {
            toast?.error?.('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleBodyImageUpload = async (file) => {
        try {
            setUploading(true);
            const url = await uploadImage(file);
            return url;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (statusOverride) => {
        const status = statusOverride || post.status;
        const now = new Date().toISOString();

        const postData = {
            ...post,
            status,
            publishedAt: status === 'published' && !post.publishedAt ? now : post.publishedAt
        };

        try {
            savedRef.current = true;
            setDirty(false);
            if (isNew) {
                await createPost(postData);
            } else {
                await updatePost(id, postData);
            }
            toast?.success?.(status === 'published' ? 'Post published successfully!' : 'Draft saved!');
            navigate('/admin/posts');
        } catch (error) {
            console.error("Failed to save post:", error);
            savedRef.current = false;
            setDirty(true);
            toast?.error?.(`Failed to ${status === 'published' ? 'publish' : 'save'}: ${error?.message || 'Unknown error'}`);
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
                disabled={uploading}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
                Save Draft
            </button>
            <button
                onClick={() => handleSave('published')}
                disabled={uploading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
                <Save size={18} /> {post.status === 'published' ? 'Update' : 'Publish'}
            </button>
        </>
    );

    return (
        <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
            <AdminHeader
                title={post.title || (isNew ? 'New Post' : 'Untitled Post')}
                uploading={uploading}
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
                                height="h-48"
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
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
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
                                        {(tocEntries.anchors.length > 0 || tocEntries.headings.length > 0) && (
                                            <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                                                {tocEntries.anchors.length + tocEntries.headings.filter((h) => !tocHiddenArr.some((t) => (t || '').toLowerCase() === h.text.toLowerCase())).length}
                                            </span>
                                        )}
                                    </span>
                                    {tocOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                                </button>

                                {tocOpen && (
                                    <div className="mt-3 space-y-3">
                                        {/* Custom anchors */}
                                        {tocEntries.anchors.length > 0 && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Custom Entries</label>
                                                <div className="space-y-1">
                                                    {tocEntries.anchors.map((a, i) => (
                                                        <div key={a.id || i} className="flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 group">
                                                            <Bookmark size={12} className="text-blue-500 shrink-0" />
                                                            <span className="text-xs text-[var(--text-primary)] truncate flex-1">{a.label}</span>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAnchorFromContent(a.id)}
                                                                className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                                                title="Remove from TOC"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Auto-detected headings */}
                                        {tocEntries.headings.length > 0 && (
                                            <div>
                                                <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Headings</label>
                                                <div className="space-y-1">
                                                    {tocEntries.headings.map((h, i) => {
                                                        const isHidden = tocHiddenArr.some((t) => (t || '').toLowerCase() === h.text.toLowerCase());
                                                        return (
                                                            <div
                                                                key={i}
                                                                className={`flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-1.5 group ${
                                                                    isHidden ? 'opacity-50' : ''
                                                                }`}
                                                            >
                                                                <Hash size={12} className={`shrink-0 ${h.level === 'h1' ? 'text-blue-500' : h.level === 'h2' ? 'text-blue-400' : 'text-blue-300'}`} />
                                                                <span className={`text-xs truncate flex-1 ${isHidden ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}>
                                                                    {h.text}
                                                                </span>
                                                                <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold shrink-0">{h.level}</span>
                                                                {isHidden ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => unhideFromToc(h.text)}
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
                                                                            setPost({ ...post, tocHidden: [...existing, h.text] });
                                                                        }}
                                                                        className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-yellow-400 transition-all"
                                                                        title="Hide from TOC"
                                                                    >
                                                                        <EyeOff size={12} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {tocEntries.anchors.length === 0 && tocEntries.headings.length === 0 && (
                                            <p className="text-xs text-[var(--text-secondary)] italic">No TOC entries yet. Add headings or right-click text to create custom entries.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;
