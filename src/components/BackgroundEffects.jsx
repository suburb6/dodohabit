import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

const BackgroundEffects = () => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden transition-colors duration-300">
            {/* Top-right corner glow - Primary Blue */}
            <div
                className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px]"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,1) 0%, transparent 70%)',
                    opacity: isDark ? 0.15 : 0.08,
                }}
            />

            {/* Bottom-left corner glow - Cyan/Teal */}
            <div
                className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px]"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,1) 0%, transparent 70%)',
                    opacity: isDark ? 0.12 : 0.08,
                }}
            />

            {/* Center subtle glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px]"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 60%)'
                        : 'radial-gradient(circle, rgba(59,130,246,0.5) 0%, transparent 60%)',
                    opacity: isDark ? 0.04 : 0.04,
                }}
            />

            {/* Subtle dot pattern overlay */}
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage: `radial-gradient(circle, ${isDark ? '#ffffff' : '#000000'} 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                    opacity: isDark ? 0.08 : 0.05,
                }}
            />
        </div>
    );
};

export default BackgroundEffects;
