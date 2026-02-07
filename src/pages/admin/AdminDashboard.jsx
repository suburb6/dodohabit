import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBlog } from '../../contexts/BlogContext';
import { useAuth } from '../../contexts/AuthContext'; // Assuming this path for AuthContext
import { FileText, Eye, Clock, Plus, Database, MessageSquare } from 'lucide-react'; // Added Database icon
import AdminHeader from '../../components/admin/AdminHeader';

const AdminDashboard = () => {
    const { posts, media, feedback, testFirestore } = useBlog();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleTest = async () => {
        const ok = await testFirestore();
        if (ok) alert("Firestore Write OK!");
        else alert("Firestore Write FAILED / TIMED OUT. Check console.");
    };
    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const feedbackCount = (feedback || []).filter((item) => (item.status || 'new') === 'new').length;
    const totalViews = "--"; // TODO: Implement view tracking

    const StatCard = ({ title, value, icon: Icon, color }) => (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex items-center justify-between shadow-soft">
            <div>
                <p className="text-[var(--text-secondary)] text-[10px] font-bold uppercase tracking-widest">{title}</p>
                <h3 className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</h3>
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                <Icon size={20} className="text-white" />
            </div>
        </div>
    );

    const headerActions = (
        <div className="flex items-center gap-3">
            <button
                onClick={handleTest}
                className="p-2 text-xs font-bold text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/10 transition-colors flex items-center gap-2"
            >
                <Database size={16} /> Test DB Write
            </button>
            <Link
                to="/admin/posts/new"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
                <Plus size={18} /> New Post
            </Link>
        </div>
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <AdminHeader title="Dashboard" actions={headerActions} />

            <div className="p-4 md:p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Published Posts"
                        value={publishedCount}
                        icon={FileText}
                        color="bg-green-500"
                    />
                    <StatCard
                        title="Drafts"
                        value={draftCount}
                        icon={Clock}
                        color="bg-yellow-500"
                    />
                    <StatCard
                        title="Total Views"
                        value={totalViews}
                        icon={Eye}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="New Feedback"
                        value={feedbackCount}
                        icon={MessageSquare}
                        color="bg-blue-600"
                    />
                </div>

                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 shadow-soft">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Posts</h2>
                        <Link to="/admin/posts" className="text-blue-500 hover:text-blue-400 text-xs font-medium transition-colors">View All</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-[var(--border-color)] text-[var(--text-secondary)] text-sm">
                                    <th className="pb-3 pl-2 font-semibold">Title</th>
                                    <th className="pb-3 font-semibold">Status</th>
                                    <th className="pb-3 font-semibold">Date</th>
                                    <th className="pb-3 text-right pr-2 font-semibold">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border-color)]">
                                {posts.slice(0, 5).map(post => (
                                    <tr key={post.id} className="group hover:bg-[var(--bg-primary)] transition-colors">
                                        <td className="py-2.5 pl-2 font-medium text-[var(--text-primary)] text-sm">{post.title || 'Untitled Post'}</td>
                                        <td className="py-2.5">
                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${post.status === 'published' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="py-2.5 text-[var(--text-secondary)] text-xs">
                                            {new Date(post.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-2.5 text-right pr-2">
                                            <Link to={`/admin/posts/${post.id}/edit`} className="text-blue-600 hover:text-blue-700 text-xs font-bold transition-colors">Edit</Link>
                                        </td>
                                    </tr>
                                ))}
                                {posts.length === 0 && (
                                    <tr>
                                        <td colSpan={Number(4)} className="py-8 text-center text-[var(--text-secondary)]">
                                            No posts found. Start writing!
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

export default AdminDashboard;
