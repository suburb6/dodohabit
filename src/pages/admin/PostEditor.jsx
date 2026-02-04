import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBlog } from '../../contexts/BlogContext';
import RichTextEditor from '../../components/blog/RichTextEditor';
import ImageUploader from '../../components/blog/ImageUploader';
import { Save, Eye } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { getPostById, createPost, updatePost, uploadImage } = useBlog();
    const isNew = !id;
    const [uploading, setUploading] = useState(false);

    const [post, setPost] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: null,
        status: 'draft',
        slug: '',
        slug: '',
        publishedAt: null,
        authorName: '',
        authorTitle: ''
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
            alert("Failed to upload image");
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
            if (isNew) {
                await createPost(postData);
            } else {
                await updatePost(id, postData);
            }
            navigate('/admin/posts');
        } catch (error) {
            console.error("Failed to save post:", error);
            // Optionally add toast notification here
        }
    };

    const handlePreview = () => {
        localStorage.setItem('blog_preview_data', JSON.stringify(post));
        window.open('/blog/preview', '_blank');
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
                            />
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="space-y-4">
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft sticky top-24">
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
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostEditor;
