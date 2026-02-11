import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import SEO from '../components/SEO';

import shot1 from '../assets/screenshots/1.jpg';
import shot2 from '../assets/screenshots/2.jpg';
import shot3 from '../assets/screenshots/3.jpg';
import shot4 from '../assets/screenshots/4.jpg';
import shot5 from '../assets/screenshots/5.jpg';
import shot6 from '../assets/screenshots/6.jpg';
import mock11 from '../assets/screenshots/11.jpg';
import mock22 from '../assets/screenshots/22.jpg';
import mock33 from '../assets/screenshots/33.jpg';
import mock44 from '../assets/screenshots/44.jpg';
import mock55 from '../assets/screenshots/55.jpg';

const phoneMockups = [mock11, mock22, mock33, mock44, mock55];
const previewShots = [shot1, shot2, shot3, shot4, shot5, shot6];

const Home = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans overflow-x-clip">
            <SEO
                title="Home"
                description="DodoHabit helps you build consistency with 75+ pre-made habits, flexible progress types, custom habits, and custom measurements."
            />

            <main className="pt-32 pb-24 space-y-20">
                <section className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid lg:grid-cols-[1fr_1fr] gap-10 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.62, ease: 'easeOut' }}
                        >
                            <p className="section-kicker mb-5">DodoHabit</p>
                            <h1 className="font-display text-5xl md:text-7xl leading-[1.03] font-extrabold tracking-tight">
                                Your habit system,
                                <br />
                                <span className="headline-gradient">now clean and customizable.</span>
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                                Get started fast with <strong className="text-[var(--text-primary)]">75+ pre-made habits</strong>,
                                choose from multiple progress types, and create custom habits with your own custom measurement rules.
                            </p>

                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to="/feedback" className="btn-primary rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2">
                                    Join Early Access
                                    <ArrowRight size={18} />
                                </Link>
                                <Link to="/blog" className="btn-secondary rounded-xl px-6 py-3 font-semibold">
                                    Explore the Blog
                                </Link>
                            </div>

                            <div className="mt-8 surface-card rounded-2xl p-4">
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/16 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                                        <Sparkles size={18} />
                                    </div>
                                    <p className="text-sm md:text-base text-[var(--text-secondary)] leading-7">
                                        Built for real routines: daily habits, quantity-based goals, duration goals, yes/no completion,
                                        and fully custom progress measurements.
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, delay: 0.12 }}
                            className="surface-card rounded-[2rem] p-5"
                        >
                            <div className="grid grid-cols-5 gap-3 items-end">
                                {phoneMockups.map((src, index) => (
                                    <motion.div
                                        key={src}
                                        initial={{ opacity: 0, y: 16 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.15 + index * 0.07, duration: 0.5 }}
                                        className={`rounded-[1.2rem] overflow-hidden border border-[var(--border-color)] shadow-soft ${
                                            index === 2 ? 'translate-y-0' : index % 2 === 0 ? 'translate-y-5' : 'translate-y-2'
                                        }`}
                                    >
                                        <img src={src} alt={`DodoHabit phone mockup ${index + 1}`} className="w-full h-56 md:h-64 object-cover object-top" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.55 }}
                        className="mb-6"
                    >
                        <p className="section-kicker mb-3">App Previews</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">A closer look at DodoHabit in action.</h2>
                    </motion.div>

                    <div className="grid grid-flow-col auto-cols-[72%] md:auto-cols-[38%] lg:auto-cols-[16.3%] gap-3 overflow-x-auto pb-2 thin-scrollbar">
                        {previewShots.map((src, index) => (
                            <motion.div
                                key={src}
                                initial={{ opacity: 0, y: 14 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.45, delay: index * 0.05 }}
                                className="surface-card rounded-2xl p-2"
                            >
                                <div className="rounded-xl overflow-hidden border border-[var(--border-color)]">
                                    <img src={src} alt={`DodoHabit preview ${index + 1}`} className="w-full h-52 md:h-64 object-cover object-top" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-4 md:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.55 }}
                        className="surface-card rounded-[2rem] px-6 md:px-10 py-8 md:py-10 text-center"
                    >
                        <h3 className="font-display text-2xl md:text-4xl font-bold">Ready to build your routine with DodoHabit?</h3>
                        <p className="mt-4 text-[var(--text-secondary)] text-base md:text-lg max-w-2xl mx-auto">
                            Start with pre-made habits, then customize everything to match your own system.
                        </p>
                        <div className="mt-7 flex flex-wrap justify-center gap-3">
                            <Link to="/feedback" className="btn-primary rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2">
                                Request Access
                                <ArrowRight size={18} />
                            </Link>
                            <Link to="/blog" className="btn-secondary rounded-xl px-6 py-3 font-semibold">
                                Read Product Notes
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </main>
        </div>
    );
};

export default Home;
