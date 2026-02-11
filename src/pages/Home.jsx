import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

import mock11 from '../assets/screenshots/11.jpg';
import mock22 from '../assets/screenshots/22.jpg';
import mock33 from '../assets/screenshots/33.jpg';
import mock44 from '../assets/screenshots/44.jpg';
import mock55 from '../assets/screenshots/55.jpg';

const features = [
    {
        title: 'HABIT LISTS',
        subtitle: 'STAY ORGANIZED.',
        color: 'from-[#FF6A45] to-[#F0432F]',
        image: mock11,
        mockupBg: 'bg-white',
    },
    {
        title: 'AUTO TRACKING',
        subtitle: 'STEPS & ANALYTICS.',
        color: 'from-[#4F93FF] to-[#2B65DD]',
        image: mock22,
        mockupBg: 'bg-white',
    },
    {
        title: 'HEATMAPS',
        subtitle: 'VISUALIZE STREAKS.',
        color: 'from-[#A45DF8] to-[#7D2CE0]',
        image: mock33,
        mockupBg: 'bg-white',
    },
    {
        title: 'CUSTOM GOALS',
        subtitle: 'TAILOR YOUR SUCCESS.',
        color: 'from-[#35CE63] to-[#1EA94F]',
        image: mock44,
        mockupBg: 'bg-white',
    },
    {
        title: 'YOUR THEME',
        subtitle: 'MAKE IT YOURS.',
        color: 'from-[#EC53A9] to-[#D7358F]',
        image: mock55,
        mockupBg: 'bg-[#22252D]',
    },
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
                    <motion.p
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="section-kicker mb-4"
                    >
                        DodoHabit
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.58, delay: 0.05 }}
                        className="font-display text-5xl md:text-7xl leading-[1.03] font-extrabold tracking-tight"
                    >
                        Your habit system,
                        <br />
                        <span className="headline-gradient">now clean and customizable.</span>
                    </motion.h1>
                </section>

                <section className="overflow-x-auto thin-scrollbar pb-2">
                    <div className="mx-auto w-max min-w-full flex items-start justify-start xl:justify-center gap-6 md:gap-7 px-1">
                        {features.map((item, index) => (
                            <motion.div
                                key={item.title}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.52, delay: 0.08 + index * 0.08 }}
                                className={`relative w-[260px] h-[520px] rounded-[40px] bg-gradient-to-b ${item.color} p-6 flex-shrink-0 flex flex-col items-center overflow-hidden border border-white/15 shadow-2xl`}
                            >
                                <div className="text-center mb-2 z-10 pointer-events-none">
                                    <h2 className="text-[36px] font-black text-white italic tracking-[-0.03em] mb-1 uppercase leading-none">
                                        {item.title}
                                    </h2>
                                    <p className="text-sm font-bold text-white/85 uppercase tracking-[0.08em]">
                                        {item.subtitle}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mb-4 z-10 pointer-events-none">
                                    <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                                    <span className="font-bold text-white text-[34px] tracking-tight leading-none">Dodohabit</span>
                                </div>

                                <div className={`relative w-[220px] h-full ${item.mockupBg} rounded-t-[30px] border-[8px] border-b-0 border-[#1E293B] shadow-2xl overflow-hidden translate-y-8`}>
                                    <img
                                        src={item.image}
                                        alt={item.title}
                                        draggable={false}
                                        className="w-full h-full object-cover object-top"
                                    />
                                </div>

                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
