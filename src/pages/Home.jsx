import React from 'react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';

import mock11 from '../assets/screenshots/11.jpg';
import mock22 from '../assets/screenshots/22.jpg';
import mock33 from '../assets/screenshots/33.jpg';
import mock44 from '../assets/screenshots/44.jpg';
import mock55 from '../assets/screenshots/55.jpg';

const mockups = [mock11, mock22, mock33, mock44, mock55];

const Home = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans overflow-x-clip">
            <SEO
                title="Home"
                description="DodoHabit helps you build consistency with 75+ pre-made habits and flexible custom progress measurements."
            />

            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                <section className="text-center">
                    <motion.p
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45 }}
                        className="section-kicker mb-4"
                    >
                        DodoHabit
                    </motion.p>

                    <motion.h1
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.58, delay: 0.05 }}
                        className="font-display text-5xl md:text-7xl leading-[1.03] font-extrabold tracking-tight"
                    >
                        Your habit system,
                        <br />
                        <span className="headline-gradient">now clean and customizable.</span>
                    </motion.h1>
                </section>

                <section className="mt-12 surface-card rounded-[2rem] p-4 md:p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4">
                        {mockups.map((src, index) => (
                            <motion.div
                                key={src}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.45, delay: 0.12 + index * 0.07 }}
                                className="rounded-[1.2rem] overflow-hidden border border-[var(--border-color)] shadow-soft"
                            >
                                <img
                                    src={src}
                                    alt={`DodoHabit app mockup ${index + 1}`}
                                    className="w-full h-64 md:h-72 object-cover object-top"
                                />
                            </motion.div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Home;
