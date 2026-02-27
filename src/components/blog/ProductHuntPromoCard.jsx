const ProductHuntPromoCard = ({ className = '' }) => {
    return (
        <div
            className={`not-prose rounded-xl border border-[#e0e0e0] bg-white p-5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] ${className}`}
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}
        >
            <div className="mb-3 flex items-center gap-3">
                <img
                    alt="DodoHabit"
                    src="https://ph-files.imgix.net/226ee198-44f6-4c04-b669-ea1f968792a5.jpeg?auto=format&fit=crop&w=80&h=80"
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                    loading="lazy"
                />
                <div className="min-w-0 flex-1">
                    <h3 className="m-0 truncate text-lg font-semibold leading-tight text-[#1a1a1a]">DodoHabit</h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-snug text-[#666666]">Build Better Habits: One Day or Day One?</p>
                </div>
            </div>

            <a
                href="https://www.producthunt.com/products/dodohabit?embed=true&utm_source=embed&utm_medium=post_embed"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 rounded-lg bg-[#ff6154] px-4 py-2 text-sm font-semibold text-white no-underline hover:bg-[#ff5143] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff6154]/45"
            >
                Check it out on Product Hunt
                <span aria-hidden="true">→</span>
            </a>
        </div>
    );
};

export default ProductHuntPromoCard;
