import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-[#050505] py-8">
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0">

                {/* Logo - Order 1 on mobile, Left on desktop */}
                <div className="flex items-center gap-2">
                    <img src="/icon.png?v=2" alt="DodoHabit" className="w-6 h-6 rounded" />
                    <span className="text-sm font-semibold text-gray-300">Dodohabit</span>
                </div>

                {/* Menu Links - Order 2 on mobile, Center on desktop */}
                <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                    <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                    <Link to="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
                    <Link to="/feedback" className="hover:text-white transition-colors">Feedback</Link>
                </div>

                {/* Copyright - Order 3 on mobile, Right on desktop */}
                <div className="text-xs text-gray-600">
                    © 2026 Dodohabit Inc.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
