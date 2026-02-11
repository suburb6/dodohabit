import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Menu, Moon, Sun, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const navLinks = [
    { id: '/', label: 'Home' },
    { id: '/blog', label: 'Blog' },
    { id: '/feedback', label: 'Feedback' },
];

const isLinkActive = (pathname, linkId) => {
    if (linkId === '/blog') return pathname.startsWith('/blog');
    return pathname === linkId;
};

const Navbar = () => {
    const location = useLocation();
    const { theme, toggleTheme } = useTheme();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <header className="fixed inset-x-0 top-0 z-50 px-4 md:px-8 pt-4">
            <nav className="mx-auto max-w-7xl rounded-2xl glass-panel shadow-soft">
                <div className="h-16 px-4 md:px-6 flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-strong)] p-[1px]">
                            <div className="w-full h-full rounded-[10px] bg-[var(--bg-secondary)] flex items-center justify-center">
                                <img src="/icon.png" alt="DodoHabit" className="w-6 h-6 rounded-md" />
                            </div>
                        </div>
                        <div className="leading-tight">
                            <p className="font-display text-sm font-bold tracking-tight text-[var(--text-primary)]">DodoHabit</p>
                            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-secondary)]">Habit OS</p>
                        </div>
                    </Link>

                    <div className="hidden md:flex items-center gap-1 mx-auto">
                        {navLinks.map((link) => {
                            const active = isLinkActive(location.pathname, link.id);
                            return (
                                <Link
                                    key={link.id}
                                    to={link.id}
                                    className={`relative px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                        active
                                            ? 'text-[var(--text-primary)]'
                                            : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                    }`}
                                >
                                    {active && (
                                        <motion.span
                                            layoutId="active-nav-pill"
                                            className="absolute inset-0 -z-10 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-color)]"
                                            transition={{ type: 'spring', stiffness: 460, damping: 34 }}
                                        />
                                    )}
                                    {link.label}
                                </Link>
                            );
                        })}
                    </div>

                    <div className="hidden md:flex items-center gap-2 ml-auto">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} className="mx-auto" /> : <Moon size={18} className="mx-auto" />}
                        </button>
                        <Link
                            to="/feedback"
                            className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold inline-flex items-center gap-2"
                        >
                            Join Early Access
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>

                    <div className="md:hidden ml-auto flex items-center gap-2">
                        <button
                            onClick={toggleTheme}
                            className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                        >
                            {theme === 'dark' ? <Sun size={18} className="mx-auto" /> : <Moon size={18} className="mx-auto" />}
                        </button>
                        <button
                            onClick={() => setMobileMenuOpen((prev) => !prev)}
                            className="w-10 h-10 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-secondary)]"
                            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                        >
                            {mobileMenuOpen ? <X size={18} className="mx-auto" /> : <Menu size={18} className="mx-auto" />}
                        </button>
                    </div>
                </div>

                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeOut' }}
                            className="md:hidden overflow-hidden border-t border-[var(--border-color)]"
                        >
                            <div className="px-4 py-4 flex flex-col gap-2">
                                {navLinks.map((link) => {
                                    const active = isLinkActive(location.pathname, link.id);
                                    return (
                                        <Link
                                            key={link.id}
                                            to={link.id}
                                            className={`rounded-xl px-4 py-3 font-semibold transition-colors ${
                                                active
                                                    ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-color)]'
                                                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                                <Link
                                    to="/feedback"
                                    className="btn-primary mt-2 rounded-xl px-4 py-3 text-center font-semibold inline-flex items-center justify-center gap-2"
                                >
                                    Join Early Access
                                    <ArrowUpRight size={16} />
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </header>
    );
};

export default Navbar;
