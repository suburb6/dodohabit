import React from 'react';
import SEO from '../components/SEO';
import { Apple } from 'lucide-react';

import mock11 from '../assets/screenshots/11.jpg';
import mock22 from '../assets/screenshots/22.jpg';
import mock33 from '../assets/screenshots/33.jpg';
import mock44 from '../assets/screenshots/44.jpg';
import mock55 from '../assets/screenshots/55.jpg';

const features = [
    { id: 'habit-lists', image: mock11, alt: 'Habit lists preview' },
    { id: 'auto-tracking', image: mock22, alt: 'Auto tracking preview' },
    { id: 'heatmaps', image: mock33, alt: 'Heatmaps preview' },
    { id: 'custom-goals', image: mock44, alt: 'Custom goals preview' },
    { id: 'your-theme', image: mock55, alt: 'Theme customization preview' },
];

const Home = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans overflow-x-clip">
            <SEO
                title="Home"
                description="DodoHabit helps you build consistency with 75+ pre-made habits and flexible custom progress measurements."
            />

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-[1800px] mx-auto">
                <section className="text-center mb-10">
                    <p className="section-kicker mb-4">
                        DodoHabit
                    </p>

                    <h1 className="font-display text-5xl md:text-7xl leading-[1.03] font-extrabold tracking-tight">
                        Your habit system,
                        <br />
                        <span className="headline-gradient">now clean and customizable.</span>
                    </h1>
                </section>

                <section className="overflow-x-auto thin-scrollbar pb-2">
                    <div className="mx-auto w-max min-w-full flex items-start justify-start xl:justify-center gap-6 md:gap-7 px-1">
                        {features.map((item, index) => (
                            <div
                                key={item.id}
                                className="relative w-[260px] h-[520px] rounded-[28px] flex-shrink-0 overflow-hidden border border-[var(--border-color)] shadow-soft bg-[var(--bg-secondary)]"
                            >
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                    fetchPriority={index === 0 ? 'high' : 'low'}
                                    width="260"
                                    height="520"
                                    draggable={false}
                                    className="w-full h-full object-cover object-center"
                                />
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mt-10 text-center">
                    <p className="text-xs uppercase tracking-[0.22em] font-semibold text-[var(--text-secondary)] mb-4">Coming Soon</p>
                    <div className="flex flex-wrap items-center justify-center gap-4">
                        <button className="surface-card rounded-xl px-5 py-3 inline-flex items-center gap-3 text-left hover:border-[var(--accent-primary)] transition-colors">
                            <img
                                src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                                alt="Google Play"
                                className="w-5 h-5"
                            />
                            <span>
                                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Get it on</span>
                                <span className="block text-sm font-bold text-[var(--text-primary)]">Google Play</span>
                            </span>
                        </button>
                        <button className="surface-card rounded-xl px-5 py-3 inline-flex items-center gap-3 text-left hover:border-[var(--accent-primary)] transition-colors">
                            <Apple size={20} className="text-[var(--text-primary)]" />
                            <span>
                                <span className="block text-[10px] uppercase tracking-wider text-[var(--text-secondary)]">Download on</span>
                                <span className="block text-sm font-bold text-[var(--text-primary)]">App Store</span>
                            </span>
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
