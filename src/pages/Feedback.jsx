import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquareHeart, User } from 'lucide-react';
import SEO from '../components/SEO';
import { useBlog } from '../contexts/BlogContext';

const isLikelyValidEmail = (value) => {
    const email = (value || '').trim().toLowerCase();
    if (!email) return false;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return false;
    if (email.includes('..')) return false;
    const domain = email.split('@')[1] || '';
    if (!domain || domain.startsWith('.') || domain.endsWith('.')) return false;
    return true;
};

const Feedback = () => {
    const { submitFeedback } = useBlog();
    const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

    const [form, setForm] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [done, setDone] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState('');

    const widgetRef = useRef(null);
    const widgetIdRef = useRef(null);

    useEffect(() => {
        if (!turnstileSiteKey) return undefined;

        const renderWidget = () => {
            if (!window.turnstile || !widgetRef.current || widgetIdRef.current !== null) return;
            widgetIdRef.current = window.turnstile.render(widgetRef.current, {
                sitekey: turnstileSiteKey,
                theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
                callback: (token) => setTurnstileToken(token),
                'expired-callback': () => setTurnstileToken(''),
                'error-callback': () => setTurnstileToken(''),
            });
        };

        if (window.turnstile) {
            renderWidget();
            return undefined;
        }

        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = renderWidget;
        document.body.appendChild(script);

        return () => {
            if (widgetIdRef.current !== null && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
                widgetIdRef.current = null;
            }
        };
    }, [turnstileSiteKey]);

    const emailLooksValid = useMemo(() => isLikelyValidEmail(form.email), [form.email]);

    const onSubmit = async (event) => {
        event.preventDefault();
        const nextErrors = {};

        if (!form.name.trim()) nextErrors.name = 'Name is required.';
        if (!form.email.trim()) nextErrors.email = 'Email is required.';
        if (form.email.trim() && !isLikelyValidEmail(form.email)) nextErrors.email = 'Please enter a valid email format.';
        if (!form.message.trim()) nextErrors.message = 'Message is required.';
        if (form.message.trim().length < 10) nextErrors.message = 'Message should be at least 10 characters.';
        if (turnstileSiteKey && !turnstileToken) nextErrors.turnstile = 'Please complete the verification checkbox.';

        setErrors(nextErrors);
        if (Object.keys(nextErrors).length > 0) return;

        try {
            setSubmitting(true);
            const payload = {
                name: form.name.trim(),
                email: form.email.trim().toLowerCase(),
                message: form.message.trim(),
                turnstileToken: turnstileToken || null,
            };

            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                const message = data?.error || 'Failed to send feedback.';
                throw new Error(message);
            }

            setDone(true);
            setForm({ name: '', email: '', message: '' });
            setTurnstileToken('');
            if (window.turnstile && widgetIdRef.current !== null) {
                window.turnstile.reset(widgetIdRef.current);
            }
        } catch (error) {
            // Local dev fallback when /api is unavailable
            if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                try {
                    await submitFeedback({
                        name: form.name.trim(),
                        email: form.email.trim().toLowerCase(),
                        message: form.message.trim(),
                        turnstileToken: turnstileToken || null,
                        source: 'website-feedback-form-local',
                        status: 'new',
                    });
                    setDone(true);
                    setForm({ name: '', email: '', message: '' });
                    setTurnstileToken('');
                    return;
                } catch (_fallbackError) {
                    // fall through to normal error message
                }
            }
            setErrors({ submit: error.message || 'Failed to send feedback. Please try again.' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen text-[var(--text-primary)] font-sans selection:bg-blue-500 selection:text-white flex flex-col transition-colors duration-300">
            <SEO
                title="Feedback"
                description="Send feedback, ideas, or bug reports to help improve DodoHabit."
            />

            <main className="flex-1 pt-28 pb-20 px-4 md:px-8 max-w-3xl mx-auto w-full">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-3xl p-6 md:p-8 shadow-soft"
                >
                    <div className="mb-8 text-center">
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">Feedback</h1>
                        <p className="text-[var(--text-secondary)]">
                            Share bugs, feature requests, or product ideas. Required: name, email, and message.
                        </p>
                    </div>

                    {done ? (
                        <div className="rounded-2xl border border-green-500/30 bg-green-500/10 p-6 md:p-8 text-center space-y-4">
                            <h2 className="text-2xl md:text-3xl font-extrabold text-green-400">Feedback Sent</h2>
                            <p className="text-[var(--text-primary)] font-medium">
                                Thank you for writing to us.
                            </p>
                            <p className="text-[var(--text-secondary)]">
                                We usually respond within 24 hours. Stay tuned.
                            </p>
                            <button
                                type="button"
                                onClick={() => {
                                    setDone(false);
                                    setErrors({});
                                }}
                                className="inline-flex items-center justify-center rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 transition-colors"
                            >
                                Send Another Feedback
                            </button>
                        </div>
                    ) : (
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2 mb-1.5">
                                <User size={14} />
                                Name
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={form.name}
                                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="Your name"
                                required
                            />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2 mb-1.5">
                                <Mail size={14} />
                                Email
                                <span className="text-red-400">*</span>
                            </label>
                            <input
                                value={form.email}
                                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                                className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                                placeholder="you@example.com"
                                type="email"
                                required
                            />
                            {form.email && !emailLooksValid && (
                                <p className="text-yellow-400 text-xs mt-1">Email format looks invalid.</p>
                            )}
                            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-[var(--text-secondary)] flex items-center gap-2 mb-1.5">
                                <MessageSquareHeart size={14} />
                                Message
                                <span className="text-red-400">*</span>
                            </label>
                            <textarea
                                value={form.message}
                                onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
                                className="w-full min-h-[160px] bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-y"
                                placeholder="Tell us what is working, what is not, and what should be improved."
                                required
                            />
                            {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message}</p>}
                        </div>

                        {turnstileSiteKey ? (
                            <div>
                                <div ref={widgetRef} />
                                {errors.turnstile && <p className="text-red-400 text-xs mt-1">{errors.turnstile}</p>}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 px-4 py-3 text-xs">
                                Turnstile is not enabled yet. Add `VITE_TURNSTILE_SITE_KEY` in your `.env`.
                            </div>
                        )}

                        {errors.submit && (
                            <p className="text-red-400 text-sm">{errors.submit}</p>
                        )}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 transition-colors"
                        >
                            {submitting ? 'Sending...' : 'Send Feedback'}
                        </button>
                    </form>
                    )}
                </motion.div>
            </main>
        </div>
    );
};

export default Feedback;
