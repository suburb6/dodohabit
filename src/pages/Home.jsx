import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Activity,
    ArrowRight,
    CalendarCheck2,
    Goal,
    Layers3,
    Sparkles,
    TimerReset,
} from 'lucide-react';
import SEO from '../components/SEO';

import habitListsImg from '../assets/screenshots/habit-lists.jpg';
import autoTrackingImg from '../assets/screenshots/auto-fitness-analytics.jpg';
import heatmapsImg from '../assets/screenshots/heatmaps.jpg';
import customGoalsImg from '../assets/screenshots/custom-habit.jpg';
import yourThemeImg from '../assets/screenshots/custom-appearance.jpg';

const pillars = [
    {
        title: 'Clarity Over Clutter',
        description: 'Every screen is designed to answer one question: what matters today?',
        icon: Goal,
    },
    {
        title: 'Automatic Momentum',
        description: 'Step tracking and recurring flows reduce friction and keep habits moving.',
        icon: Activity,
    },
    {
        title: 'Visual Feedback Loop',
        description: 'Heatmaps and trend views make progress obvious before motivation drops.',
        icon: Layers3,
    },
];

const revealContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const revealItem = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.58, ease: [0.21, 0.47, 0.32, 0.98] },
    },
};

const Home = () => {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const visualY = useTransform(scrollYProgress, [0, 1], [0, -64]);
    const glowY = useTransform(scrollYProgress, [0, 1], [0, 60]);

    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans overflow-x-clip">
            <SEO
                title="Home"
                description="DodoHabit helps you design a calm, repeatable routine with auto-tracking, heatmaps, and focused daily execution."
            />

            <main className="pt-32 pb-24">
                <section ref={heroRef} className="max-w-7xl mx-auto px-4 md:px-8">
                    <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 22 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.65, ease: 'easeOut' }}
                        >
                            <p className="section-kicker mb-6">Habit Design Studio</p>
                            <h1 className="font-display text-5xl md:text-7xl leading-[1.02] font-extrabold tracking-tight">
                                Build a routine that feels
                                <br />
                                <span className="headline-gradient">clean, calm, and hard to break.</span>
                            </h1>
                            <p className="mt-7 text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl leading-relaxed">
                                DodoHabit gives you structure without noise. Plan clear habits, track automatic progress,
                                and keep your streaks visible in one focused space.
                            </p>

                            <div className="mt-9 flex flex-wrap items-center gap-3">
                                <Link
                                    to="/feedback"
                                    className="btn-primary rounded-xl px-6 py-3 font-semibold inline-flex items-center gap-2"
                                >
                                    Join Early Access
                                    <ArrowRight size={18} />
                                </Link>
                                <Link to="/blog" className="btn-secondary rounded-xl px-6 py-3 font-semibold">
                                    Explore the Blog
                                </Link>
                            </div>

                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="surface-card rounded-2xl p-4">
                                    <p className="text-3xl font-display font-bold text-[var(--text-primary)]">5+</p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Core habit workflows</p>
                                </div>
                                <div className="surface-card rounded-2xl p-4">
                                    <p className="text-3xl font-display font-bold text-[var(--text-primary)]">24/7</p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Automatic step sync</p>
                                </div>
                                <div className="surface-card rounded-2xl p-4">
                                    <p className="text-3xl font-display font-bold text-[var(--text-primary)]">1 tap</p>
                                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Daily progress check-in</p>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div style={{ y: visualY }} className="relative">
                            <motion.div
                                style={{ y: glowY }}
                                className="absolute -inset-10 rounded-[3rem] blur-3xl"
                                aria-hidden
                            >
                                <div className="w-full h-full rounded-[3rem] bg-gradient-to-tr from-[var(--accent-primary)]/20 via-transparent to-[var(--accent-secondary)]/20" />
                            </motion.div>

                            <div className="relative surface-card rounded-[2rem] p-4 md:p-5">
                                <div className="rounded-[1.45rem] overflow-hidden border border-[var(--border-color)]">
                                    <img
                                        src={habitListsImg}
                                        alt="DodoHabit list overview"
                                        className="w-full h-[300px] md:h-[360px] object-cover object-top"
                                    />
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl overflow-hidden border border-[var(--border-color)]">
                                        <img src={heatmapsImg} alt="Heatmap preview" className="w-full h-24 object-cover" />
                                    </div>
                                    <div className="rounded-2xl overflow-hidden border border-[var(--border-color)]">
                                        <img src={customGoalsImg} alt="Custom goals preview" className="w-full h-24 object-cover" />
                                    </div>
                                </div>
                            </div>

                            <motion.div
                                className="hidden md:flex absolute -left-10 top-12 glass-panel rounded-2xl p-3 items-center gap-3 animate-float-slow"
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.45, duration: 0.6 }}
                            >
                                <div className="w-9 h-9 rounded-xl bg-[var(--accent-primary)]/15 flex items-center justify-center text-[var(--accent-primary)]">
                                    <Sparkles size={18} />
                                </div>
                                <div>
                                    <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Live signal</p>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">Auto tracking is active</p>
                                </div>
                            </motion.div>

                            <motion.div
                                className="hidden md:block absolute -right-8 bottom-16 glass-panel rounded-2xl p-4"
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.58, duration: 0.6 }}
                            >
                                <p className="text-xs uppercase tracking-[0.14em] text-[var(--text-secondary)]">Current streak health</p>
                                <p className="mt-1 text-2xl font-display font-bold text-[var(--text-primary)]">92%</p>
                                <p className="text-sm text-[var(--text-secondary)]">consistency score this week</p>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

                <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 md:mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.6 }}
                        className="max-w-3xl"
                    >
                        <p className="section-kicker mb-4">Why it feels different</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-[var(--text-primary)]">
                            A product language designed for momentum, not just motivation.
                        </h2>
                    </motion.div>

                    <motion.div
                        variants={revealContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="mt-10 grid md:grid-cols-3 gap-4"
                    >
                        {pillars.map((pillar) => {
                            const Icon = pillar.icon;
                            return (
                                <motion.article
                                    key={pillar.title}
                                    variants={revealItem}
                                    className="surface-card rounded-2xl p-6"
                                >
                                    <div className="w-11 h-11 rounded-xl bg-[var(--accent-primary)]/14 text-[var(--accent-primary)] flex items-center justify-center">
                                        <Icon size={20} />
                                    </div>
                                    <h3 className="mt-5 font-display text-xl font-semibold">{pillar.title}</h3>
                                    <p className="mt-3 text-sm leading-7 text-[var(--text-secondary)]">{pillar.description}</p>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                </section>

                <section className="max-w-7xl mx-auto px-4 md:px-8 mt-24 md:mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 max-w-2xl"
                    >
                        <p className="section-kicker mb-4">Visual System</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">See progress at a glance.</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <motion.article
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.2 }}
                            transition={{ duration: 0.6 }}
                            className="md:col-span-7 surface-card rounded-[1.8rem] p-4"
                        >
                            <div className="rounded-2xl overflow-hidden border border-[var(--border-color)] mb-4">
                                <img src={autoTrackingImg} alt="Auto-tracking analytics" className="w-full h-[320px] object-cover" />
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/14 text-[var(--accent-primary)] flex items-center justify-center shrink-0">
                                    <TimerReset size={18} />
                                </div>
                                <div>
                                    <h3 className="font-display text-xl font-semibold">Effortless Progress Feed</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-7">
                                        Auto analytics turn passive activity into an active routine signal, so you always know where your consistency stands.
                                    </p>
                                </div>
                            </div>
                        </motion.article>

                        <div className="md:col-span-5 grid grid-cols-1 gap-4">
                            <motion.article
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: 0.06 }}
                                className="surface-card rounded-[1.8rem] p-4"
                            >
                                <div className="rounded-2xl overflow-hidden border border-[var(--border-color)]">
                                    <img src={yourThemeImg} alt="Theme customization" className="w-full h-44 object-cover object-top" />
                                </div>
                                <h3 className="mt-4 font-display text-lg font-semibold">Custom Theme Control</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-2">Shape the app around your visual rhythm and make it yours.</p>
                            </motion.article>

                            <motion.article
                                initial={{ opacity: 0, y: 24 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.2 }}
                                transition={{ duration: 0.6, delay: 0.12 }}
                                className="surface-card rounded-[1.8rem] p-4"
                            >
                                <div className="rounded-2xl overflow-hidden border border-[var(--border-color)]">
                                    <img src={heatmapsImg} alt="Heatmap analytics" className="w-full h-44 object-cover object-top" />
                                </div>
                                <h3 className="mt-4 font-display text-lg font-semibold">Heatmap Pattern View</h3>
                                <p className="text-sm text-[var(--text-secondary)] mt-2">Spot behavior trends before streak drops become regressions.</p>
                            </motion.article>
                        </div>
                    </div>
                </section>

                <section className="max-w-5xl mx-auto px-4 md:px-8 mt-24 md:mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6 }}
                        className="text-center max-w-3xl mx-auto"
                    >
                        <p className="section-kicker mb-4">Workflow</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold">Three steps. Zero confusion.</h2>
                    </motion.div>

                    <motion.div
                        variants={revealContainer}
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.2 }}
                        className="mt-10 grid md:grid-cols-3 gap-4"
                    >
                        {[
                            {
                                icon: CalendarCheck2,
                                title: 'Plan Intentionally',
                                description: 'Define habits that actually map to your life constraints.',
                            },
                            {
                                icon: Activity,
                                title: 'Track Without Noise',
                                description: 'Update fast, auto-capture steps, and keep your focus on execution.',
                            },
                            {
                                icon: Goal,
                                title: 'Review and Adjust',
                                description: 'Use heatmaps and streak trends to improve week over week.',
                            },
                        ].map((step, index) => {
                            const Icon = step.icon;
                            return (
                                <motion.article key={step.title} variants={revealItem} className="surface-card rounded-2xl p-6 relative">
                                    <span className="absolute top-4 right-5 text-xs font-bold text-[var(--accent-primary)]/55">
                                        0{index + 1}
                                    </span>
                                    <div className="w-10 h-10 rounded-xl bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] flex items-center justify-center">
                                        <Icon size={18} />
                                    </div>
                                    <h3 className="mt-5 font-display text-xl font-semibold">{step.title}</h3>
                                    <p className="mt-2 text-sm leading-7 text-[var(--text-secondary)]">{step.description}</p>
                                </motion.article>
                            );
                        })}
                    </motion.div>
                </section>

                <section className="max-w-6xl mx-auto px-4 md:px-8 mt-24 md:mt-28">
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.35 }}
                        transition={{ duration: 0.65 }}
                        className="surface-card rounded-[2rem] px-6 md:px-10 py-10 md:py-12 text-center"
                    >
                        <p className="section-kicker mb-4">Coming Soon</p>
                        <h2 className="font-display text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
                            Ready for a habit system that feels premium and focused?
                        </h2>
                        <p className="mt-5 text-[var(--text-secondary)] max-w-2xl mx-auto text-lg leading-relaxed">
                            Join early access and help shape the launch version of DodoHabit.
                        </p>
                        <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
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
