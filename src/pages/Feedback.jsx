import React from 'react';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import SEO from '../components/SEO';


const Feedback = () => {
    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-blue-500 selection:text-white flex flex-col transition-colors duration-300">
            <SEO
                title="Feedback"
                description="Send feedback, ideas, or bug reports to help improve DodoHabit."
            />
            <main className="flex-1 pt-32 pb-20 px-4 md:px-8 max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">Feedback</h1>
                    <p className="text-lg text-[var(--text-secondary)] mb-10">
                        Help us make DodoHabit better for everyone.
                    </p>

                    <a
                        href="mailto:dodohabitapp@gmail.com"
                        className="group inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-500 px-8 py-4 rounded-2xl font-semibold text-lg transition-all hover:scale-[1.02]"
                    >
                        <Mail size={22} />
                        dodohabitapp@gmail.com
                    </a>

                    <p className="text-sm text-gray-500 mt-8">
                        Share your ideas, suggestions, or report issues.
                    </p>
                </motion.div>
            </main>


        </div>
    );
};

export default Feedback;
