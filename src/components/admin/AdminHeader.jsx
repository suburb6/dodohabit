import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const AdminHeader = ({ title, status, uploading, actions, showBack }) => {
    const navigate = useNavigate();

    return (
        <div className="sticky top-0 bg-[var(--bg-primary)]/95 backdrop-blur z-20 border-b border-[var(--border-color)]">
            <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-2.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {showBack && (
                        <button
                            onClick={() => navigate('/admin/posts')}
                            className="p-1 hover:bg-[var(--bg-secondary)] rounded-md text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                        >
                            <ArrowLeft size={18} />
                        </button>
                    )}
                    <div>
                        <h1 className="text-base font-bold text-[var(--text-primary)] leading-tight">
                            {title}
                        </h1>
                        {status && (
                            <span className={`text-[10px] font-bold uppercase tracking-wide ${status === 'published' ? 'text-green-400' : 'text-yellow-400'}`}>
                                {status} {uploading ? '(Uploading...)' : ''}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex gap-2">
                    {actions}
                </div>
            </div>
        </div>
    );
};

export default AdminHeader;
