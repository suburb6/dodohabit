import React from 'react';
import { motion } from 'framer-motion';

const isSubLevel = (level) => ['h3', 'sub'].includes(level);

const TocNav = ({ items, activeId, onNavigate }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="space-y-1">
            {items.map((item) => {
                const isActive = activeId === item.id;
                const isSub = isSubLevel(item.level);

                return (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`relative z-0 block rounded-lg py-2 text-sm transition-colors border-l-2
                            ${isSub ? 'ml-2 pl-6 text-[var(--text-secondary)] border-transparent' : 'pl-4 text-[var(--text-primary)] border-[var(--border-color)]'}
                            ${isActive ? 'text-[var(--text-primary)] border-blue-500' : (isSub ? 'hover:text-[var(--text-primary)]' : 'hover:border-blue-500')}
                        `}
                        onClick={(e) => {
                            e.preventDefault();
                            onNavigate?.(item.id);
                        }}
                        title={item.text}
                    >
                        {isActive && (
                            <motion.span
                                layoutId="toc-magnet"
                                className="absolute inset-0 z-0 rounded-lg bg-blue-500/10 border border-blue-500/40 shadow-[0_0_16px_rgba(59,130,246,0.25)]"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                        {isSub && (
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-blue-500/70 z-10" />
                        )}
                        <span className="relative z-10 line-clamp-2">{item.text}</span>
                    </a>
                );
            })}
        </nav>
    );
};

export default TocNav;
