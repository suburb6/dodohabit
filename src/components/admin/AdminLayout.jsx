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
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm 
                justify-start md:justify-center xl:justify-start
                ${isActive(activeCheck || to)
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                }`}
            onClick={() => setIsMobileMenuOpen(false)}
            title={label}
        >
            <Icon size={20} className="shrink-0" />
            <span className="font-medium md:hidden xl:block whitespace-nowrap">{label}</span>
        </Link>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex text-[var(--text-primary)] font-sans transition-colors duration-300">
            {/* Sidebar */}
            <aside className={`fixed inset-y-0 left-0 z-50 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transform transition-[width,transform] duration-300 ease-in-out 
                w-64 md:w-20 xl:w-64 
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
                <div className="p-4 flex items-center justify-between md:justify-center xl:justify-between h-16">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold text-lg text-white shrink-0">D</div>
                        <span className="font-bold text-xl tracking-tight md:hidden xl:block">DodoAdmin</span>
                    </div>
                    <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-[var(--text-secondary)]">
                        <X size={20} />
                    </button>
                </div>

                <nav className="px-3 py-4 flex flex-col gap-1">
                    <NavItem to="/admin" label="Dashboard" icon={LayoutDashboard} activeCheck="/admin" />
                    <NavItem to="/admin/posts" label="All Posts" icon={FileText} />
                    <NavItem to="/admin/posts/new" label="New Post" icon={PenSquare} />
                    <NavItem to="/admin/media" label="Media Library" icon={Settings} />
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--border-color)] flex flex-col gap-2 bg-[var(--bg-secondary)]">
                    <button
                        onClick={toggleTheme}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] transition-colors justify-start md:justify-center xl:justify-start"
                        title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                        <span className="font-medium md:hidden xl:block">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors justify-start md:justify-center xl:justify-start"
                        title="Sign Out"
                    >
                        <LogOut size={20} />
                        <span className="font-medium md:hidden xl:block">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 md:ml-20 xl:ml-64 flex flex-col min-h-screen transition-[margin] duration-300 ease-in-out">
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
