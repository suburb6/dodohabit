import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Library, Upload } from 'lucide-react';
import { createPortal } from 'react-dom';

const ImageSourceMenu = ({
    open,
    onClose,
    onUploadFromComputer,
    onOpenLibrary,
    anchorRef,
    portal = false,
    className = '',
}) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
        if (!open || !portal || !anchorRef?.current) return undefined;

        const updatePosition = () => {
            const rect = anchorRef.current.getBoundingClientRect();
            const menuWidth = 224;
            const viewportPadding = 8;
            const left = Math.min(
                Math.max(viewportPadding, rect.right - menuWidth),
                window.innerWidth - menuWidth - viewportPadding
            );
            const top = rect.bottom + 8;
            setPosition({ top, left });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open, portal, anchorRef]);

    if (!open) return null;

    const menu = (
        <div
            className={`${portal ? 'fixed' : 'absolute right-0 top-full mt-2'} z-[120] w-56 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-2 ${className}`}
            style={portal ? { top: position.top, left: position.left } : undefined}
            onMouseDown={(event) => event.stopPropagation()}
        >
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

    if (portal) {
        return createPortal(menu, document.body);
    }

    return menu;
};

export default ImageSourceMenu;
