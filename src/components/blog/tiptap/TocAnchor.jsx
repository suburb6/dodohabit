import { Node, mergeAttributes } from '@tiptap/core';

const TocAnchor = Node.create({
    name: 'tocAnchor',

    group: 'inline',

    inline: true,

    atom: true,

    selectable: true,

    addAttributes() {
        return {
            id: {
                default: null,
            },
            label: {
                default: null,
            },
            level: {
                default: 'main', // 'main' or 'sub'
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: 'span[data-toc-anchor="true"]',
                getAttrs: (dom) => {
                    if (!(dom instanceof HTMLElement)) return false;
                    return {
                        id: dom.getAttribute('id') || dom.dataset.tocId || null,
                        label: dom.dataset.tocLabel || null,
                        level: dom.dataset.tocLevel || 'main',
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const id = HTMLAttributes.id || HTMLAttributes['data-toc-id'] || null;
        const label = HTMLAttributes.label || HTMLAttributes['data-toc-label'] || null;
        const level = HTMLAttributes.level || 'main'; // Ensure default

        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                id: id || undefined,
                'data-toc-anchor': 'true',
                'data-toc-id': id || undefined,
                'data-toc-label': label || undefined,
                'data-toc-level': level,
                'data-level': level, // For CSS selector convenience
                class: ['toc-anchor-marker', HTMLAttributes.class].filter(Boolean).join(' '),
            }),
        ];
    },
});

export default TocAnchor;
