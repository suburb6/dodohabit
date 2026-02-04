import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { Download, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Navbar = () => {
    const location = useLocation();
    const [hoveredTab, setHoveredTab] = useState(null);
    const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const tabRefs = useRef([]);

    const tabs = [
        { id: '/', label: 'Home' },
        { id: '/blog', label: 'Blog' },
        { id: '/feedback', label: 'Feedback' },
    ];

    // Check if current page is one of the nav tabs
    const isOnNavPage = tabs.some(tab => tab.id === location.pathname);

    // Calculate pill position based on active tab
    useEffect(() => {
        const activeIndex = tabs.findIndex(tab => tab.id === location.pathname);
        if (activeIndex !== -1 && tabRefs.current[activeIndex]) {
            const activeTab = tabRefs.current[activeIndex];
            setPillStyle({
                left: activeTab.offsetLeft,
                width: activeTab.offsetWidth,
            });
        }
    }, [location.pathname]);

    const { theme, toggleTheme } = useTheme();

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [location.pathname]);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-primary)]/70 backdrop-blur-md transition-colors duration-300">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 z-50">
                <img src="/icon.png" alt="DodoHabit" className="w-8 h-8 rounded-lg" />
                <span className="text-xl font-bold tracking-tight text-[var(--text-primary)] hiding-sm">Dodohabit</span>
            </Link>

            {/* Desktop Navigation - Absolute Centered */}
            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center bg-[var(--bg-secondary)] p-1 rounded-full border border-[var(--border-color)] backdrop-blur-sm">
                {/* Sliding Pill - only show when on a nav page */}
                {isOnNavPage && (
                    <motion.div
                        className="absolute bg-[var(--bg-primary)] rounded-full h-[calc(100%-8px)] top-1 shadow-sm"
                        initial={false}
                        animate={{
                            left: pillStyle.left,
                            width: pillStyle.width,
                        }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                    />
                )}

                {tabs.map((tab, index) => {
                    const isActive = location.pathname === tab.id;
                    return (
                        <Link
                            key={tab.id}
                            ref={el => tabRefs.current[index] = el}
                            to={tab.id}
                            onMouseEnter={() => setHoveredTab(tab.id)}
                            onMouseLeave={() => setHoveredTab(null)}
                            className={`relative px-4 py-1.5 rounded-full text-sm font-medium transition-colors z-10 ${isActive
                                ? 'text-blue-600'
                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            {/* Hover Effect */}
                            {hoveredTab === tab.id && !isActive && (
                                <span className="absolute inset-0 bg-white/5 rounded-full -z-10 transition-opacity" />
                            )}

                            {tab.label}
                        </Link>
                    );
                })}
            </div>

            <div className="hidden md:flex items-center gap-2">
                <button
                    onClick={toggleTheme}
                    className="p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
                className="md:hidden z-50 p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Mobile Menu Overlay - Portal to escape stacking context */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileMenuOverlay>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="fixed inset-0 bg-[var(--bg-primary)] z-40 flex flex-col pt-32 px-6"
                        >
                            <div className="flex flex-col gap-6">
                                {tabs.map((tab) => {
                                    const isActive = location.pathname === tab.id;
                                    return (
                                        <Link
                                            key={tab.id}
                                            to={tab.id}
                                            className={`text-xl font-bold py-2 ${isActive ? 'text-blue-600' : 'text-[var(--text-secondary)]'
                                                }`}
                                        >
                                            {tab.label}
                                        </Link>
                                    );
                                })}

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-8 flex flex-col gap-4"
                                >
                                    <button
                                        onClick={toggleTheme}
                                        className="w-full bg-[var(--bg-secondary)] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 border border-[var(--border-color)] text-[var(--text-primary)]"
                                    >
                                        {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                                        {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                    <a
                                        href="#"
                                        className="flex-1 bg-white/10 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-white/20 transition-colors"
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M3.609 1.814L13.792 12 3.61 22.186a1.994 1.994 0 0 1-.318-.136 2.005 2.005 0 0 1-1.283-1.907V3.857c0-.747.404-1.4 1.006-1.75.127-.073.262-.13.402-.168.064-.017.129-.03.194-.04v.015l-.002-.1zm1.398.147l10.163 10.04-10.163 10.04L4.005 12l1.002-.039zm10.584 9.08l2.422-2.422 3.324 1.913c.605.348.968.964.968 1.646 0 .682-.363 1.298-.967 1.646l-3.324 1.913-2.423-2.422L14.59 12l1.001-.959zm-1.414 1.414L4.135 21.496l10.042-9.041zm0-2.91L14.177 2.5l-10.042 9.045 10.042 9.046z" />
                                        </svg>
                                        Play Store
                                    </a>
                                    <a
                                        href="#"
                                        className="flex-1 bg-white text-black py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors"
                                    >
                                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                                        </svg>
                                        App Store
                                    </a>
                                </motion.div>
                            </div>
                        </motion.div>
                    </MobileMenuOverlay>
                )}
            </AnimatePresence>
        </nav>
    );
};

// Helper component to render children in a portal
const MobileMenuOverlay = ({ children }) => {
    return createPortal(children, document.body);
};

export default Navbar;
