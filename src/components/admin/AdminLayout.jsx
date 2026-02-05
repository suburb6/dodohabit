import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    LayoutDashboard,
    FileText,
    PenSquare,
    LogOut,
    Menu,
    X,
    Settings,
    Moon,
    Sun
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const AdminLayout = () => {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    };

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin';
        }
        if (path === '/admin/posts' && location.pathname === '/admin/posts/new') {
            return false;
        }
        return location.pathname === path || location.pathname.startsWith(path + '/');
    };

    /** @param {{ to: string, icon: any, label: string, activeCheck?: string }} props */
    const NavItem = ({ to, icon: Icon, label, activeCheck }) => (
        <Link
            to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${isActive(activeCheck || to)
                ? 'bg-blue-600 text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
            onClick={() => setIsMobileMenuOpen(false)}
        >
            <Icon size={18} />
            <span className="font-medium">{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex text-[var(--text-primary)] font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-52 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center font-bold text-xs text-white">D</div>
                        <span className="font-bold text-base tracking-tight">DodoAdmin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-[var(--text-secondary)]">
                        <X size={20} />
                    </button>
                </div>

                <nav className="px-2 py-2 flex flex-col gap-0.5">
                    <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} activeCheck="/admin" />
                    <NavItem to="/admin/posts" label="All Posts" icon={FileText} />
                    <NavItem to="/admin/posts/new" label="New Post" icon={PenSquare} />
                    <NavItem to="/admin/media" label="Media Library" icon={Settings} />
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-[var(--border-color)] flex flex-col gap-2">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors"
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        <span className="font-medium">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-md text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={18} />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-52 flex flex-col min-h-screen">
                {/* Mobile Header */}
                <header className="md:hidden flex items-center justify-between p-4 bg-[var(--bg-secondary)] border-b border-[var(--border-color)] sticky top-0 z-40">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-lg text-white">D</div>
                        <span className="font-bold text-xl text-[var(--text-primary)]">DodoAdmin</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={toggleTheme} className="text-[var(--text-secondary)]">
                            {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                        </button>
                        <button onClick={() => setIsMobileMenuOpen(true)} className="text-[var(--text-primary)]">
                            <Menu size={24} />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>

            {/* Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminLayout;
