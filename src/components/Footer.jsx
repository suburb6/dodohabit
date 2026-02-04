import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] py-8 transition-colors duration-300">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">

                {/* Logo - Order 1 on mobile, Left on desktop */}
                <div className="flex items-center gap-2">
                    <img src="/icon.png?v=2" alt="DodoHabit" className="w-6 h-6 rounded" />
                    <span className="text-sm font-semibold text-[var(--text-secondary)]">Dodohabit</span>
                </div>

                {/* Menu Links - Order 2 on mobile, Center on desktop */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-[var(--text-secondary)]">
                    <Link to="/blog" className="hover:text-[var(--text-primary)] transition-colors">Blog</Link>
                    <Link to="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms & Conditions</Link>
                    <Link to="/feedback" className="hover:text-[var(--text-primary)] transition-colors">Feedback</Link>
                </div>

                {/* Copyright - Order 3 on mobile, Right on desktop */}
                <div className="text-xs text-[var(--text-secondary)]">
                    © 2026 Dodohabit Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
