import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

const BackgroundEffects = () => {
    const { theme } = useTheme();
    const location = useLocation();
    const isDark = theme === 'dark';
    const prefersReducedMotion = useReducedMotion();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;
        const media = window.matchMedia('(max-width: 1023px), (pointer: coarse)');
        const update = () => setIsMobile(media.matches);
        update();
        media.addEventListener('change', update);
        return () => media.removeEventListener('change', update);
    }, []);

    if (location.pathname.startsWith('/admin') || isMobile || prefersReducedMotion) {
        return null;
    }

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden>
            <motion.div
                className="absolute -top-40 -left-36 w-[38rem] h-[38rem] rounded-full blur-[110px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(45,212,191,0.22) 0%, rgba(45,212,191,0) 72%)'
                        : 'radial-gradient(circle, rgba(15,118,110,0.18) 0%, rgba(15,118,110,0) 74%)',
                }}
                animate={{ x: [0, 70, -20, 0], y: [0, 34, 8, 0], scale: [1, 1.08, 0.95, 1] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -bottom-44 -right-36 w-[34rem] h-[34rem] rounded-full blur-[120px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(251,146,60,0.16) 0%, rgba(251,146,60,0) 75%)'
                        : 'radial-gradient(circle, rgba(217,119,6,0.16) 0%, rgba(217,119,6,0) 75%)',
                }}
                animate={{ x: [0, -48, 24, 0], y: [0, -20, 10, 0], scale: [1, 0.9, 1.06, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-[28%] left-[42%] w-[28rem] h-[28rem] rounded-full blur-[120px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(125,211,252,0.1) 0%, rgba(125,211,252,0) 78%)'
                        : 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0) 80%)',
                }}
                animate={{ x: [0, 20, -12, 0], y: [0, -30, 12, 0] }}
                transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
};

export default BackgroundEffects;
