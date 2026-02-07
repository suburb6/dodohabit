import React, { useMemo, useState } from 'react';
import { useBlog } from '../../contexts/BlogContext';
import { CheckCircle2, Mail, MessageSquare, Search } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const FeedbackList = () => {
    const { feedback, updateFeedback } = useBlog();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = useMemo(() => {
        return (feedback || []).filter((entry) => {
            const statusMatch = statusFilter === 'all' || (entry.status || 'new') === statusFilter;
            const q = search.trim().toLowerCase();
            const searchMatch = !q || [entry.name, entry.email, entry.message]
                .filter(Boolean)
                .some((value) => String(value).toLowerCase().includes(q));
            return statusMatch && searchMatch;
        });
    }, [feedback, search, statusFilter]);

    const setStatus = async (item, status) => {
        if (!item?.id) return;
        await updateFeedback(item.id, { status });
    };

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <AdminHeader title="Feedback" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={16} />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                            placeholder="Search feedback..."
                        />
                    </div>
                    <div className="flex gap-2">
                        {['all', 'new', 'resolved'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${statusFilter === status
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)]'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-3">
                    {filtered.map((item) => (
                        <article
                            key={item.id}
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4"
                        >
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                <div className="space-y-1">
                                    <div className="font-semibold text-[var(--text-primary)]">{item.name || 'Anonymous'}</div>
                                    <div className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                                        <Mail size={12} />
                                        {item.email || 'No email'}
                                    </div>
                                    <div className="text-xs text-[var(--text-secondary)]">
                                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : '-'}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${item.status === 'resolved'
                                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                        }`}>
                                        {item.status || 'new'}
                                    </span>
                                    {item.status !== 'resolved' ? (
                                        <button
                                            onClick={() => setStatus(item, 'resolved')}
                                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1"
                                        >
                                            <CheckCircle2 size={12} />
                                            Resolve
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setStatus(item, 'new')}
                                            className="px-3 py-1.5 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] text-xs font-semibold hover:bg-[var(--bg-primary)] transition-colors"
                                        >
                                            Mark New
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] p-3 text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                                    <MessageSquare size={12} />
                                    Message
                                </div>
                                {item.message || '-'}
                            </div>
                        </article>
                    ))}

                    {filtered.length === 0 && (
                        <div className="text-center py-14 text-[var(--text-secondary)] bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl">
                            No feedback found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FeedbackList;
