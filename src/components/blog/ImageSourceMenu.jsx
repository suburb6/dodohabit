import React from 'react';
import { Image as ImageIcon, Library, Upload } from 'lucide-react';

const ImageSourceMenu = ({
    open,
    onClose,
    onUploadFromComputer,
    onOpenLibrary,
    className = '',
}) => {
    if (!open) return null;

    return (
        <div className={`absolute right-0 top-full mt-2 z-40 w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-2 ${className}`}>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)] px-2 pt-1 pb-2 flex items-center gap-2">
                <ImageIcon size={12} />
                Image Source
            </div>
            <button
                type="button"
                onClick={() => {
                    onUploadFromComputer?.();
                    onClose?.();
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2"
            >
                <Upload size={15} />
                Upload From Computer
            </button>
            <button
                type="button"
                onClick={() => {
                    onOpenLibrary?.();
                    onClose?.();
                }}
                className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors flex items-center gap-2"
            >
                <Library size={15} />
                Open Media Library
            </button>
        </div>
    );
};

export default ImageSourceMenu;
