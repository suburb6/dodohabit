import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBlog } from '../../contexts/BlogContext';
import { Plus, Search, Edit, Trash2, ExternalLink } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const PostsList = () => {
    const { posts, deletePost } = useBlog();
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    const filteredPosts = posts.filter(post => {
        const title = post.title || '';
        const matchesStatus = filter === 'all' || post.status === filter;
        const matchesSearch = title.toLowerCase().includes(search.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this post?')) {
            deletePost(id);
        }
    };

    const headerActions = (
        <Link
            to="/admin/posts/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
            <Plus size={18} /> New Post
        </Link>
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <AdminHeader title="All Posts" actions={headerActions} />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex flex-col md:flex-row gap-4 bg-[var(--bg-secondary)] border border-[var(--border-color)] p-4 rounded-xl">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'published', 'draft'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${filter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--bg-primary)] border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                                    <th className="py-4 px-6 font-semibold">Title</th>
                                    <th className="py-4 px-6 font-semibold">Status</th>
                                    <th className="py-4 px-6 font-semibold">Date</th>
                                    <th className="py-4 px-6 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {filteredPosts.map(post => (
                                    <tr key={post.id} className="group hover:bg-[var(--bg-primary)] transition-colors">
                                        <td className="py-2.5 px-6 font-medium text-[var(--text-primary)]">
                                            <div className="truncate max-w-md text-sm">{post.title || 'Untitled Post'}</div>
                                        </td>
                                        <td className="py-2.5 px-6">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 px-6 text-[var(--text-secondary)] text-xs">
                                            {new Date(post.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-2.5 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                <Link to={`/blog/${post.slug}`} target="_blank" className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md hover:text-blue-500 transition-colors" title="View">
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <Link to={`/admin/posts/${post.id}/edit`} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md hover:text-yellow-500 transition-colors" title="Edit">
                                                    <Edit size={16} />
                                                </Link>
                                                <button onClick={() => handleDelete(post.id)} className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] rounded-md hover:text-red-500 transition-colors" title="Delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredPosts.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-[var(--text-secondary)]">
                                            No posts found matching your criteria.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PostsList;
