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
                    };
                },
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        const id = HTMLAttributes.id || HTMLAttributes['data-toc-id'] || null;
        const label = HTMLAttributes.label || HTMLAttributes['data-toc-label'] || null;

        return [
            'span',
            mergeAttributes(HTMLAttributes, {
                id: id || undefined,
                'data-toc-anchor': 'true',
                'data-toc-id': id || undefined,
                'data-toc-label': label || undefined,
                class: ['toc-anchor-marker', HTMLAttributes.class].filter(Boolean).join(' '),
            }),
        ];
    },
});

export default TocAnchor;
