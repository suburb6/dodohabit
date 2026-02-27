import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const Footer = () => {
    const earnedBadges = [
        {
            href: 'https://open-launch.com/projects/dodohabit',
            src: 'https://open-launch.com/api/badge/dc6904f3-0348-4d01-be95-1e27f5fd315d/featured-minimal.svg',
            alt: 'Featured on Open-Launch',
        },
        {
            href: 'https://www.producthunt.com/products/dodohabit?embed=true&utm_source=badge-featured&utm_medium=badge&utm_campaign=badge-dodohabit',
            src: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1087005&theme=light&t=1772206256996',
            alt: 'DodoHabit - Build Better Habits: One Day or Day One? | Product Hunt',
        },
        {
            href: 'https://acidtools.com',
            src: 'https://acidtools.com/assets/images/badge.png',
            alt: 'Acid Tools',
        },
    ];

    return (
        <footer className="relative mt-16 border-t border-[var(--border-color)] bg-[var(--bg-primary)]/65 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-6 md:px-8 py-10 md:py-12">
                <div className="grid grid-cols-1 md:grid-cols-[1.4fr_1fr_auto] gap-8 items-start">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <img src="/icon.png" alt="DodoHabit" className="w-8 h-8 rounded-lg" />
                            <div>
                                <p className="font-display text-base font-bold text-[var(--text-primary)]">DodoHabit</p>
                                <p className="text-xs uppercase tracking-[0.18em] text-[var(--text-secondary)]">Build habits with clarity</p>
                            </div>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] max-w-md">
                            A focused habit platform for people who want structure without noise.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm font-medium text-[var(--text-secondary)]">
                        <Link to="/blog" className="hover:text-[var(--accent-primary)] transition-colors">Blog</Link>
                        <Link to="/privacy" className="hover:text-[var(--accent-primary)] transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-[var(--accent-primary)] transition-colors">Terms</Link>
                        <Link to="/feedback" className="hover:text-[var(--accent-primary)] transition-colors">Feedback</Link>
                    </div>

                    <Link
                        to="/feedback"
                        className="btn-secondary rounded-xl px-4 py-2.5 text-sm font-semibold inline-flex items-center gap-2 w-fit"
                    >
                        Contact Team
                        <ArrowUpRight size={16} />
                    </Link>
                </div>

                <div className="mt-10 pt-6 border-t border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
                    <div className="flex flex-col items-center gap-4">
                        <div className="flex flex-col items-center gap-2 md:flex-row md:items-center md:gap-4">
                            <span>© 2026 Dodohabit Inc.</span>
                            <span>Designed for calm consistency.</span>
                        </div>

                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
                            Earned Badges
                        </p>

                        <div className="w-full overflow-x-auto thin-scrollbar">
                            <div className="mx-auto flex w-fit min-w-max items-center justify-center gap-3 px-1">
                                {earnedBadges.map((badge) => (
                                    <a
                                        key={badge.href}
                                        href={badge.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex h-12 shrink-0 items-center justify-center rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 transition-colors hover:border-[var(--accent-primary)]"
                                    >
                                        <img
                                            src={badge.src}
                                            alt={badge.alt}
                                            className="h-7 w-auto object-contain"
                                            loading="lazy"
                                        />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
