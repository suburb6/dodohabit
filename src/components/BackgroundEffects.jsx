import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';

const BackgroundEffects = () => {
    const location = useLocation();
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
                    background: 'radial-gradient(circle, rgba(7,57,60,0.20) 0%, rgba(7,57,60,0) 74%)',
                }}
                animate={{ x: [0, 70, -20, 0], y: [0, 34, 8, 0], scale: [1, 1.08, 0.95, 1] }}
                transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute -bottom-44 -right-36 w-[34rem] h-[34rem] rounded-full blur-[120px]"
                style={{
                    background: 'radial-gradient(circle, rgba(44,102,110,0.18) 0%, rgba(44,102,110,0) 75%)',
                }}
                animate={{ x: [0, -48, 24, 0], y: [0, -20, 10, 0], scale: [1, 0.9, 1.06, 1] }}
                transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
                className="absolute top-[28%] left-[42%] w-[28rem] h-[28rem] rounded-full blur-[120px]"
                style={{
                    background: 'radial-gradient(circle, rgba(144,221,240,0.16) 0%, rgba(144,221,240,0) 80%)',
                }}
                animate={{ x: [0, 20, -12, 0], y: [0, -30, 12, 0] }}
                transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
            />
        </div>
    );
};

export default BackgroundEffects;
