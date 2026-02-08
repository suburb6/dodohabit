import Image from '@tiptap/extension-image';
import { mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import ResizableImageView from './ResizableImageView';

const sanitizeWidth = (value) => {
    const number = Number.parseInt(String(value || '').replace('%', ''), 10);
    if (Number.isNaN(number)) return '100%';
    return `${Math.min(100, Math.max(25, number))}%`;
};

const resolveAlignStyle = (align) => {
    if (align === 'left') return 'margin-right:auto;margin-left:0;';
    if (align === 'right') return 'margin-left:auto;margin-right:0;';
    return 'margin-left:auto;margin-right:auto;';
};

const EnhancedImage = Image.extend({
    inline: false,
    group: 'block',

    addAttributes() {
        return {
            ...this.parent?.(),
            width: {
                default: '100%',
                parseHTML: (element) => element.getAttribute('data-width') || element.style.width || '100%',
                renderHTML: (attributes) => ({ 'data-width': sanitizeWidth(attributes.width) }),
            },
            align: {
                default: 'center',
                parseHTML: (element) => element.getAttribute('data-align') || 'center',
                renderHTML: (attributes) => ({ 'data-align': attributes.align || 'center' }),
            },
        };
    },

    renderHTML({ HTMLAttributes }) {
        const width = sanitizeWidth(HTMLAttributes.width);
        const align = HTMLAttributes.align || 'center';
        const style = `width:${width};display:block;max-width:100%;${resolveAlignStyle(align)}`;

        return ['img', mergeAttributes(HTMLAttributes, { style })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageView);
    },
});

export default EnhancedImage;
