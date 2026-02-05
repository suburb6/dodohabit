import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
    Download,
    Activity,
    Shield,
    Smartphone,
    Zap,
    Clock,
    Trophy,
    Calendar
} from 'lucide-react';

import habitListsImg from '../assets/screenshots/habit-lists.jpg';
import autoTrackingImg from '../assets/screenshots/auto-fitness-analytics.jpg';
import heatmapsImg from '../assets/screenshots/heatmaps.jpg';
import customGoalsImg from '../assets/screenshots/custom-habit.jpg';
import yourThemeImg from '../assets/screenshots/custom-appearance.jpg';

const Home = () => {
    const [isAppStoreFlipped, setIsAppStoreFlipped] = useState(false);
    const [isPlayStoreFlipped, setIsPlayStoreFlipped] = useState(false);

    // Auto-flip back after 2 seconds
    useEffect(() => {
        if (isAppStoreFlipped) {
            const timer = setTimeout(() => {
                setIsAppStoreFlipped(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isAppStoreFlipped]);

    useEffect(() => {
        if (isPlayStoreFlipped) {
            const timer = setTimeout(() => {
                setIsPlayStoreFlipped(false);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [isPlayStoreFlipped]);

    const [activeIndex, setActiveIndex] = useState(0);

    const features = [
        {
            title: "HABIT LISTS",
            subtitle: "Stay organized.",
            color: "from-[#FF5733] to-[#C13615]",
            image: habitListsImg,
            mockupBg: "bg-white",
            imageClass: "translate-y-2"
        },
        {
            title: "AUTO TRACKING",
            subtitle: "Steps & Analytics.",
            color: "from-[#3B82F6] to-[#1D4ED8]",
            image: autoTrackingImg,
            mockupBg: "bg-white"
        },
        {
            title: "HEATMAPS",
            subtitle: "Visualize streaks.",
            color: "from-[#A855F7] to-[#7E22CE]",
            image: heatmapsImg,
            mockupBg: "bg-white"
        },
        {
            title: "CUSTOM GOALS",
            subtitle: "Tailor your success.",
            color: "from-[#22C55E] to-[#15803D]",
            image: customGoalsImg,
            mockupBg: "bg-white",
            imageClass: "translate-y-0"
        },
        {
            title: "YOUR THEME",
            subtitle: "Make it yours.",
            color: "from-[#EC4899] to-[#BE185D]",
            image: yourThemeImg,
            mockupBg: "bg-[#27272A]",
            hideHeader: false,
            imageClass: "translate-y-0"
        }
    ];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % features.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + features.length) % features.length);
    };

    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-blue-500 selection:text-white overflow-x-hidden transition-colors duration-300">

            <SEO
                title="Home"
                description="The all-in-one habit tracker with auto step counting, heatmaps, and smart analytics. Build positive habits or break bad ones with DodoHabit."
            />


            <main className="pt-32 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
                {/* Hero Section */}
                <section className="flex flex-col items-center text-center mb-12 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="mb-6"
                    >
                        <span className="px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-400 text-xs font-medium tracking-wide">
                            COMING SOON
                        </span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.1]"
                    >
                        Build better habits.<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">
                            Track everything.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="text-lg md:text-xl text-[var(--text-secondary)] max-w-2xl mb-12"
                    >
                        The all-in-one habit tracker with auto step counting, heatmaps,
                        and smart analytics. Build positive habits or break bad ones.
                    </motion.p>

                    {/* Store Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="flex flex-wrap items-center justify-center gap-4 mb-20 select-none"
                    >
                        {/* Play Store Button */}
                        <motion.div
                            className="relative w-[180px] h-[54px] cursor-pointer perspective-1000"
                            onClick={() => setIsPlayStoreFlipped(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="w-full h-full relative"
                                initial={false}
                                animate={{ rotateX: isPlayStoreFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front Face */}
                                <div
                                    className="absolute inset-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <img
                                        src="https://upload.wikimedia.org/wikipedia/commons/d/d0/Google_Play_Arrow_logo.svg"
                                        alt="Play Store"
                                        className="w-6 h-6"
                                        draggable="false"
                                    />
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">GET IT ON</div>
                                        <div className="text-sm font-bold text-[var(--text-primary)] leading-none">Google Play</div>
                                    </div>
                                </div>

                                {/* Back Face */}
                                <div
                                    className="absolute inset-0 bg-[#FF5733] rounded-xl flex items-center justify-center border border-[#FF5733]"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateX(180deg)"
                                    }}
                                >
                                    <span className="text-white font-bold tracking-wide">Coming Soon!</span>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* App Store Button */}
                        <motion.div
                            className="relative w-[180px] h-[54px] cursor-pointer perspective-1000"
                            onClick={() => setIsAppStoreFlipped(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className="w-full h-full relative"
                                initial={false}
                                animate={{ rotateX: isAppStoreFlipped ? 180 : 0 }}
                                transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                                style={{ transformStyle: "preserve-3d" }}
                            >
                                {/* Front Face */}
                                <div
                                    className="absolute inset-0 bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl flex items-center justify-center gap-3 transition-colors shadow-sm"
                                    style={{ backfaceVisibility: "hidden" }}
                                >
                                    <div className="w-6 h-6 flex items-center justify-center">
                                        <svg viewBox="0 0 384 512" fill="currentColor" className="w-7 h-7 text-[var(--text-primary)]">
                                            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 46.9 126.7 98 126.7 6.6 0 14-2.2 20.6-5.4 15-7.2 34-15 57.5-15 23.9 0 46.9 8.7 57.5 14.7 6.9 3.9 14.3 5.4 20.6 5.4 53.9 0 76.3-89.2 88.5-125.7-52.7-22.1-73.4-56.3-72.3-102.3zm-77-175.7c25.4-25.4 46-56.8 40.4-89-21.5 0-47.3 14.4-61.1 27.9-19.1 18.2-34.9 49.3-29.2 82.3 26 0 35.8-9 50-21.2z" />
                                        </svg>
                                    </div>
                                    <div className="text-left">
                                        <div className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-secondary)]">GET IT ON</div>
                                        <div className="text-sm font-bold text-[var(--text-primary)] leading-none">App Store</div>
                                    </div>
                                </div>

                                {/* Back Face */}
                                <div
                                    className="absolute inset-0 bg-[#FF5733] rounded-xl flex items-center justify-center border border-[#FF5733]"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        transform: "rotateX(180deg)"
                                    }}
                                >
                                    <span className="text-white font-bold tracking-wide">Coming Soon!</span>
                                </div>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    {/* Mobile Slider (Visible < md) */}
                    <div className="w-full relative h-[600px] flex items-center justify-center md:hidden perspective-1000 overflow-hidden">
                        {features.map((item, index) => {
                            // Calculate relative position based on activeIndex
                            let position = index - activeIndex;

                            // Handle wrapping for infinite feel (optional, but requested simple slider)
                            // Let's keep it simple: just clamp or standard list
                            // But user wants "behind nexts are smaller", implies centering.
                            // Let's stick to standard index logic for simplicity and robustness first.

                            const isActive = index === activeIndex;
                            const isNext = index === activeIndex + 1;
                            const isPrev = index === activeIndex - 1;

                            // Determine styles
                            let x = 0;
                            let scale = 0.8;
                            let opacity = 0;
                            let zIndex = 0;

                            if (isActive) {
                                x = 0;
                                scale = 1;
                                opacity = 1;
                                zIndex = 30;
                            } else if (isNext) {
                                x = 120; // partially offscreen right
                                scale = 0.85;
                                opacity = 1;
                                zIndex = 20;
                            } else if (isPrev) {
                                x = -120; // partially offscreen left
                                scale = 0.85;
                                opacity = 1;
                                zIndex = 20;
                            } else {
                                opacity = 0;
                                zIndex = 10;
                            }

                            // If distinct index > 1, hide
                            if (Math.abs(index - activeIndex) > 1) return null;

                            return (
                                <motion.div
                                    key={index}
                                    initial={false}
                                    animate={{ x, scale, opacity, zIndex }}
                                    transition={{ type: "spring", stiffness: 200, damping: 40, mass: 1.2 }}
                                    style={{
                                        touchAction: "pan-y" // Allow vertical scrolling, block horizontal for drag
                                    }}
                                    drag={isActive ? "x" : false}
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={(e, { offset, velocity }) => {
                                        const swipe = offset.x; // + is right (prev), - is left (next)

                                        if (swipe < -50) {
                                            nextSlide();
                                        } else if (swipe > 50) {
                                            prevSlide();
                                        }
                                    }}
                                    className="absolute top-0 flex flex-col items-center gap-4 cursor-grab active:cursor-grabbing select-none"
                                    onClick={() => !isActive && setActiveIndex(index)}
                                >
                                    <div className={`relative w-[260px] h-[520px] rounded-[40px] bg-gradient-to-b ${item.color} p-6 flex flex-col items-center overflow-hidden border border-white/10 shadow-2xl`}>
                                        {/* Text Content Top */}
                                        <div className="text-center mb-2 z-10 pointer-events-none">
                                            <h2 className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase leading-none">
                                                {item.title}
                                            </h2>
                                            <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                                {item.subtitle}
                                            </p>
                                        </div>

                                        {/* Logo & App Name */}
                                        {!item.hideHeader && (
                                            <div className="flex items-center gap-3 mb-4 z-10 pointer-events-none">
                                                <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                                                <span className="font-bold text-white text-lg tracking-wide text-shadow-sm">Dodohabit</span>
                                            </div>
                                        )}

                                        <div className={`relative w-[220px] h-full ${item.mockupBg} rounded-t-[30px] border-[8px] border-b-0 border-gray-900 shadow-2xl flex flex-col overflow-hidden ${item.containerClass || 'translate-y-8'}`}>
                                            <img
                                                src={item.image}
                                                alt={item.title}
                                                draggable={false}
                                                className={`w-full h-full object-cover object-top ${item.imageClass || 'translate-y-3'} select-none`}
                                            />
                                        </div>

                                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Slider Controls Hint */}
                        <div className="absolute bottom-4 flex gap-2">
                            {features.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setActiveIndex(i)}
                                    className={`w-2 h-2 rounded-full transition-all ${i === activeIndex ? 'bg-white w-4' : 'bg-white/30'}`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Desktop Grid (Visible >= md) */}
                    <div className="hidden md:flex w-full items-start justify-center gap-6 md:gap-8 px-8 md:px-16 select-none">
                        {features.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 * index }}
                                className="flex-shrink-0 flex flex-col items-center gap-4"
                            >
                                <div className={`relative w-[260px] h-[520px] rounded-[40px] bg-gradient-to-b ${item.color} p-6 flex flex-col items-center overflow-hidden border border-white/10 shadow-2xl group hover:-translate-y-2 transition-transform duration-500`}>

                                    {/* Text Content Top */}
                                    <div className="text-center mb-2 z-10 pointer-events-none">
                                        <h2 className="text-2xl font-black text-white italic tracking-tighter mb-1 uppercase leading-none">
                                            {item.title}
                                        </h2>
                                        <p className="text-xs font-bold text-white/80 uppercase tracking-widest">
                                            {item.subtitle}
                                        </p>
                                    </div>

                                    {/* Logo & App Name */}
                                    {!item.hideHeader && (
                                        <div className="flex items-center gap-3 mb-4 z-10 pointer-events-none">
                                            <img src="/icon.png" alt="Logo" className="w-8 h-8 rounded-lg shadow-sm" />
                                            <span className="font-bold text-white text-lg tracking-wide text-shadow-sm">Dodohabit</span>
                                        </div>
                                    )}

                                    <div className={`relative w-[220px] h-full ${item.mockupBg} rounded-t-[30px] border-[8px] border-b-0 border-gray-900 shadow-2xl flex flex-col overflow-hidden ${item.containerClass || 'translate-y-8'}`}>
                                        <img
                                            src={item.image}
                                            alt={item.title}
                                            draggable={false}
                                            className={`w-full h-full object-cover object-top ${item.imageClass || 'translate-y-3'} select-none`}
                                        />
                                    </div>

                                    {/* Background Shine */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>



            </main>

        </div >
    );
};



export default Home;
