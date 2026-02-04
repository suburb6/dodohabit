import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react';

const Support = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-[#FF5733] selection:text-white transition-colors duration-300">
            <main className="pt-20 pb-20 px-4 md:px-8 max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-20 h-20 bg-[#FF5733]/10 rounded-2xl flex items-center justify-center text-[#FF5733] mx-auto mb-8">
                        <MessageCircle size={40} />
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">How can we help?</h1>
                    <p className="text-xl text-[var(--text-secondary)] mb-12">
                        We're here to help you get your routine back on track.
                    </p>

                    <div className="grid gap-6">
                        <a href="mailto:dodohabitapp@gmail.com" className="group block bg-[var(--bg-secondary)] hover:bg-[var(--bg-primary)] border border-[var(--border-color)] p-8 rounded-3xl transition-all hover:scale-[1.02]">
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-full flex items-center justify-center mb-4 group-hover:bg-[#FF5733] group-hover:text-white transition-colors">
                                    <Mail size={24} />
                                </div>
                                <h2 className="text-xl font-bold mb-2">Email Support</h2>
                                <p className="text-[var(--text-secondary)] text-sm mb-4">Get a response within 24 hours.</p>
                                <span className="text-[#FF5733] font-medium">dodohabitapp@gmail.com</span>
                            </div>
                        </a>

                        {/* Placeholder for FAQ or other support channels */}
                        <div className="p-6 rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/50">
                            <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
                            <ul className="text-left text-sm text-[var(--text-secondary)] space-y-3 mt-4">
                                <li className="flex gap-2">
                                    <span className="text-[#FF5733]">•</span>
                                    <span>How do I restore my purchases?</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#FF5733]">•</span>
                                    <span>Does Dodohabit sync across devices?</span>
                                </li>
                                <li className="flex gap-2">
                                    <span className="text-[#FF5733]">•</span>
                                    <span>How do I export my data?</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </motion.div>
            </main>

            <footer className="border-t border-[var(--border-color)] bg-[var(--bg-primary)] py-12 mt-12 transition-colors duration-300">
                <div className="max-w-4xl mx-auto px-6 text-center text-xs text-[var(--text-secondary)]">
                    © 2026 Dodohabit Inc. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default Support;
