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

    return (
        <div className="flex flex-col gap-4">
            <h4 className="font-bold text-white text-sm uppercase tracking-wider">Share this article</h4>
            <div className="flex gap-2">
                <a
                    href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1DA1F2]/10 text-[#1DA1F2] rounded-lg hover:bg-[#1DA1F2] hover:text-white transition-colors"
                    title="Share on Twitter"
                >
                    <Twitter size={20} />
                </a>
                <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#1877F2]/10 text-[#1877F2] rounded-lg hover:bg-[#1877F2] hover:text-white transition-colors"
                    title="Share on Facebook"
                >
                    <Facebook size={20} />
                </a>
                <a
                    href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 bg-[#0A66C2]/10 text-[#0A66C2] rounded-lg hover:bg-[#0A66C2] hover:text-white transition-colors"
                    title="Share on LinkedIn"
                >
                    <Linkedin size={20} />
                </a>
                <button
                    onClick={handleCopy}
                    className="p-3 bg-gray-800 text-gray-400 rounded-lg hover:bg-gray-700 hover:text-white transition-colors relative"
                    title="Copy Link"
                >
                    {copied ? <Check size={20} className="text-green-500" /> : <Copy size={20} />}
                </button>
            </div>
        </div>
    );
};

export default ShareButtons;
