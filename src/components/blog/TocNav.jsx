import React from 'react';
import { motion } from 'framer-motion';

const isSubLevel = (level) => ['h3', 'sub'].includes(level);

const TocNav = ({ items, activeId, onNavigate }) => {
    if (!items || items.length === 0) return null;

    return (
        <nav className="space-y-1 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/75 p-2">
            {items.map((item) => {
                const isActive = activeId === item.id;
                const isSub = isSubLevel(item.level);

                return (
                    <a
                        key={item.id}
                        href={`#${item.id}`}
                        className={`relative z-0 block rounded-xl py-2.5 text-sm transition-colors border
                            ${isSub ? 'ml-2 pl-7 text-[var(--text-secondary)] border-transparent' : 'pl-4 font-medium text-[var(--text-primary)] border-transparent'}
                            ${isActive ? 'text-[var(--text-primary)] border-[var(--accent-primary)]' : 'hover:text-[var(--text-primary)] hover:border-[var(--border-color)]'}
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
                                className="absolute inset-0 z-0 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--accent-primary)]"
                                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                            />
                        )}
                        {isSub && (
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full bg-[var(--accent-primary)] z-10" />
                        )}
                        <span className="relative z-10 line-clamp-2">{item.text}</span>
                    </a>
                );
            })}
        </nav>
    );
};

export default TocNav;
