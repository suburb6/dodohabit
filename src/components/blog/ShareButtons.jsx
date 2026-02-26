import React, { useState } from 'react';
import { Share2, Twitter, Facebook, Linkedin, Copy, Check } from 'lucide-react';

const ShareButtons = ({ title, url }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const encodedTitle = encodeURIComponent(title);
    const encodedUrl = encodeURIComponent(url);
    const buttonClass = 'p-3 rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--accent-primary-strong)] transition-colors';

    return (
        <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
            <h4 className="font-bold text-[var(--text-primary)] text-xs uppercase tracking-[0.18em]">Share This Article</h4>
            <div className="flex gap-2">
                <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass}
                    title="Share on Twitter"
                >
                    <Twitter size={20} />
                </a>
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass}
                    title="Share on Facebook"
                >
                    <Facebook size={20} />
                </a>
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClass}
                    title="Share on LinkedIn"
                >
                    <Linkedin size={20} />
                </a>
                <button
                    onClick={handleCopy}
                    className={`${buttonClass} relative`}
                    title="Copy Link"
                >
                    {copied ? <Check size={20} className="text-[var(--accent-primary-strong)]" /> : <Copy size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ShareButtons;
