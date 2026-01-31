import React from 'react';

const BackgroundEffects = () => {
    return (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
            {/* Top-right corner glow - Primary Blue */}
            <div
                className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,1) 0%, transparent 70%)',
                }}
            />

            {/* Bottom-left corner glow - Cyan/Teal */}
            <div
                className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] opacity-15"
                style={{
                    background: 'radial-gradient(circle, rgba(6,182,212,1) 0%, transparent 70%)',
                }}
            />

            {/* Center subtle glow */}
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-[120px] opacity-5"
                style={{
                    background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, transparent 60%)',
                }}
            />

            {/* Subtle dot pattern overlay */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ffffff 1.5px, transparent 1.5px)',
                    backgroundSize: '40px 40px',
                }}
            />
        </div>
    );
};

export default BackgroundEffects;
