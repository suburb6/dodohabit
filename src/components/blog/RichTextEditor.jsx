import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import EditorToolbar from './EditorToolbar';
import TocAnchor from './tiptap/TocAnchor';
import './editor.css'; // We'll create this for custom TipTap styles

const slugifyForId = (value) =>
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const RichTextEditor = ({
    content,
    onChange,
    onImageUpload,
    placeholder = 'Start writing your amazing post...',
    onHideFromToc,
}) => {
    const [tocMenu, setTocMenu] = useState(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TocAnchor,
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Link.configure({
                openOnClick: false,
            }),
            Placeholder.configure({
                placeholder,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    const fileInputRef = React.useRef(null);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            const url = await onImageUpload(file);
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addImage = useCallback(() => {
        if (onImageUpload && fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            // Fallback to URL prompt if no upload handler
            const url = window.prompt('URL');
            if (url) {
                editor.chain().focus().setImage({ src: url }).run();
            }
        }
    }, [editor, onImageUpload]);

    const closeTocMenu = useCallback(() => setTocMenu(null), []);

    useEffect(() => {
        if (!tocMenu) return;

        const onKeyDown = (e) => {
            if (e.key === 'Escape') closeTocMenu();
        };

        const onMouseDown = (e) => {
            // Click outside to close
            if (e.target?.closest?.('[data-toc-menu]')) return;
            closeTocMenu();
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('mousedown', onMouseDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('mousedown', onMouseDown);
        };
    }, [tocMenu, closeTocMenu]);

    const onEditorContextMenu = useCallback(
        (e) => {
            if (!editor) return;
            const { empty, from, to } = editor.state.selection;
            if (empty || from === to) return;

            const selectedText = editor.state.doc.textBetween(from, to, ' ');
            const trimmed = (selectedText || '').replace(/\s+/g, ' ').trim();
            if (!trimmed) return;

            e.preventDefault();
            setTocMenu({
                x: e.clientX,
                y: e.clientY,
                label: trimmed,
                selectionText: trimmed,
            });
        },
        [editor]
    );

    const canShowTocMenu = useMemo(() => {
        if (!editor) return false;
        const { empty, from, to } = editor.state.selection;
        return !empty && from !== to;
    }, [editor, tocMenu]);

    const insertAnchorFromMenu = useCallback(() => {
        if (!editor || !tocMenu?.label) return;
        const label = tocMenu.label.replace(/\s+/g, ' ').trim();
        if (!label) return;

        const id = `toc-${Date.now()}-${slugifyForId(label) || 'section'}`;
        const { from } = editor.state.selection;
        editor
            .chain()
            .focus()
            .insertContentAt(from, { type: 'tocAnchor', attrs: { id, label } })
            .run();

        closeTocMenu();
    }, [editor, tocMenu, closeTocMenu]);

    const hideFromTocFromMenu = useCallback(() => {
        const selectionText = tocMenu?.selectionText;
        if (!selectionText) return;
        onHideFromToc?.(selectionText);
        closeTocMenu();
    }, [tocMenu, onHideFromToc, closeTocMenu]);

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-xl overflow-hidden relative">
            <EditorToolbar editor={editor} addImage={addImage} />
            <div className="bg-[var(--bg-primary)]" onContextMenu={onEditorContextMenu}>
                <EditorContent editor={editor} />
            </div>

            {tocMenu && (
                <div
                    data-toc-menu
                    className="fixed z-50 w-72 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl p-3"
                    style={{ left: tocMenu.x, top: tocMenu.y }}
                    role="dialog"
                    aria-label="Table of contents actions"
                >
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2">
                        Table of Contents
                    </div>

                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Label</label>
                    <input
                        value={tocMenu.label}
                        onChange={(e) => setTocMenu((m) => (m ? { ...m, label: e.target.value } : m))}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="TOC label"
                    />

                    <div className="flex items-center gap-2 mt-3">
                        <button
                            type="button"
                            onClick={insertAnchorFromMenu}
                            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Add to TOC
                        </button>
                        <button
                            type="button"
                            onClick={hideFromTocFromMenu}
                            className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-lg text-xs font-semibold hover:bg-[var(--bg-secondary)] transition-colors"
                            title="Hide matching heading text from the TOC"
                        >
                            Hide
                        </button>
                        <button
                            type="button"
                            onClick={closeTocMenu}
                            className="px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold hover:text-[var(--text-primary)] transition-colors"
                        >
                            Esc
                        </button>
                    </div>
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
            />
        </div>
    );
};

export default RichTextEditor;
