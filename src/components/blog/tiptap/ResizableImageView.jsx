import React, { useCallback, useEffect, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const toPercent = (value) => {
    const parsed = Number.parseFloat(String(value || '').replace('%', ''));
    if (Number.isNaN(parsed)) return 100;
    return clamp(parsed, 20, 100);
};

const ResizableImageView = ({ node, selected, updateAttributes, editor, getPos }) => {
    const rafRef = useRef(null);
    const pendingWidthRef = useRef(null);

    useEffect(() => () => {
        if (rafRef.current !== null) {
            cancelAnimationFrame(rafRef.current);
        }
    }, []);

    const flushWidth = useCallback(() => {
        if (pendingWidthRef.current === null) return;
        updateAttributes({ width: `${Math.round(pendingWidthRef.current)}%` });
        pendingWidthRef.current = null;
        rafRef.current = null;
    }, [updateAttributes]);

    const setWidthWithRaf = useCallback((nextWidth) => {
        pendingWidthRef.current = nextWidth;
        if (rafRef.current !== null) return;
        rafRef.current = requestAnimationFrame(flushWidth);
    }, [flushWidth]);

    const startResize = useCallback((corner, event) => {
        if (!editor?.view) return;
        event.preventDefault();
        event.stopPropagation();

        const root = editor.view.dom.closest('.ProseMirror') || editor.view.dom;
        const rootRect = root?.getBoundingClientRect();
        const containerWidth = Math.max(1, rootRect?.width || root?.clientWidth || 1);
        const startWidthPercent = toPercent(node.attrs.width);
        const startWidthPx = (startWidthPercent / 100) * containerWidth;
        const startX = event.clientX;
        const startY = event.clientY;
        const xSign = corner.includes('w') ? -1 : 1;
        const ySign = corner.includes('n') ? -1 : 1;

        document.body.classList.add('is-resizing-image');

        const onPointerMove = (moveEvent) => {
            moveEvent.preventDefault();
            const deltaX = (moveEvent.clientX - startX) * xSign;
            const deltaY = (moveEvent.clientY - startY) * ySign;
            const weightedDelta = deltaX + (deltaY * 0.32);
            const nextPx = Math.max(48, startWidthPx + weightedDelta);
            const nextPercent = clamp((nextPx / containerWidth) * 100, 20, 100);
            setWidthWithRaf(nextPercent);
        };

        const cleanup = () => {
            window.removeEventListener('pointermove', onPointerMove);
            window.removeEventListener('pointerup', onPointerUp);
            window.removeEventListener('pointercancel', onPointerUp);
            document.body.classList.remove('is-resizing-image');
            if (rafRef.current !== null) {
                cancelAnimationFrame(rafRef.current);
                flushWidth();
            }
            const position = typeof getPos === 'function' ? getPos() : null;
            if (typeof position === 'number') {
                editor.chain().focus().setNodeSelection(position).run();
            } else {
                editor.chain().focus().run();
            }
        };

        const onPointerUp = () => cleanup();

        window.addEventListener('pointermove', onPointerMove, { passive: false });
        window.addEventListener('pointerup', onPointerUp);
        window.addEventListener('pointercancel', onPointerUp);
    }, [editor, flushWidth, node.attrs.width, setWidthWithRaf]);

    const align = node.attrs.align || 'center';
    const width = `${toPercent(node.attrs.width)}%`;

    return (
        <NodeViewWrapper as="figure" className={`tiptap-image-node tiptap-image-node--${align} ${selected ? 'is-selected' : ''}`}>
            <div className="tiptap-image-node__frame" style={{ width }}>
                <img
                    src={node.attrs.src}
                    alt={node.attrs.alt || ''}
                    title={node.attrs.title || ''}
                    className="tiptap-image-node__img"
                    draggable={false}
                />
                {selected && (
                    <>
                        <button type="button" className="tiptap-image-node__handle tiptap-image-node__handle--nw" onPointerDown={(event) => startResize('nw', event)} />
                        <button type="button" className="tiptap-image-node__handle tiptap-image-node__handle--ne" onPointerDown={(event) => startResize('ne', event)} />
                        <button type="button" className="tiptap-image-node__handle tiptap-image-node__handle--sw" onPointerDown={(event) => startResize('sw', event)} />
                        <button type="button" className="tiptap-image-node__handle tiptap-image-node__handle--se" onPointerDown={(event) => startResize('se', event)} />
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};

export default ResizableImageView;
