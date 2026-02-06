import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { X } from 'lucide-react';
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
            // Underline, // Potentially duplicate
            TocAnchor,
            Image.configure({
                inline: true,
                allowBase64: false, // Force uploads to prevent oversized docs
            }),
            // Link.configure({ // Potentially duplicate
            //     openOnClick: false,
            // }),
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

    // Update editor content when prop key changes (async load fix)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if significantly different to avoid cursor jumps
            // Ideally we'd compare parsed JSON but HTML approx is okay for initial load
            if (Math.abs(content.length - editor.getHTML().length) > 10 || content === '') {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

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

    // Context menu logic

    const onEditorContextMenu = useCallback(
        (e) => {
            if (!editor) return;
            // distinct behavior: check if we are clicking on an existing anchor
            // TipTap doesn't make finding the node at coordinates trivial without a helper, 
            // but we can check if the selection *is* an anchor

            const { empty, from, to } = editor.state.selection;
            // If clicked directly on a node (like our anchor), the selection might be a NodeSelection

            // Helpful: check if the active node or mark at selection is 'tocAnchor'
            const isAhc = editor.isActive('tocAnchor');

            // If we have a selection range
            if (!empty && from !== to) {
                const selectedText = editor.state.doc.textBetween(from, to, ' ');
                const trimmed = (selectedText || '').replace(/\s+/g, ' ').trim();
                if (!trimmed) return;

                e.preventDefault();
                setTocMenu({
                    x: e.clientX,
                    y: e.clientY,
                    label: trimmed,
                    selectionText: trimmed,
                    isExisting: isAhc
                });
                return;
            }

            // If we clicked exactly on an existing anchor (without range selection potentially)
            if (isAhc) {
                e.preventDefault();
                // Try to get the attribute
                const attrs = editor.getAttributes('tocAnchor');
                setTocMenu({
                    x: e.clientX,
                    y: e.clientY,
                    label: attrs.label || 'Entry',
                    selectionText: attrs.label || '',
                    isExisting: true
                });
            }
        },
        [editor]
    );

    const handleTocAction = useCallback((levelOverride) => {
        if (!editor) return;

        if (tocMenu.isExisting) {
            // REMOVE Logic
            // To "Remove", we just replace the node with its text label
            const text = tocMenu.label;
            editor.chain().focus().insertContent(text).run();
        } else {
            // ADD Logic ('main' or 'sub')
            const label = tocMenu.label.replace(/\s+/g, ' ').trim();
            if (!label) return;
            const level = levelOverride || 'main';

            const id = `toc-${Date.now()}-${slugifyForId(label) || 'section'}`;
            const { from, empty } = editor.state.selection;

            // Insert AT current position (start of selection), DO NOT replace text
            // We collapse the selection to 'from' first
            editor
                .chain()
                .focus()
                .setTextSelection(from) // Collapse to start
                .insertContent({ type: 'tocAnchor', attrs: { id, label, level } })
                // Add a space after if it was empty to prevent typing inside the atom? 
                // Actually an atom is a block so cursor moves after.
                .run();
        }

        closeTocMenu();
    }, [editor, tocMenu, closeTocMenu]);

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-xl overflow-hidden relative">
            <EditorToolbar editor={editor} addImage={addImage} />
            <div className="bg-[var(--bg-primary)]" onContextMenu={onEditorContextMenu}>
                <EditorContent editor={editor} />
            </div>

            {tocMenu && (
                <div
                    data-toc-menu
                    className="fixed z-50 w-80 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-xl p-3"
                    style={{ left: tocMenu.x, top: tocMenu.y }}
                    role="dialog"
                    aria-label="Table of contents actions"
                >
                    <div className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-2 flex items-center justify-between">
                        <span>Table of Contents</span>
                        {tocMenu.isExisting && <span className="text-red-400 text-[10px]">Editing</span>}
                    </div>

                    <label className="block text-xs font-semibold text-[var(--text-primary)] mb-1">Label</label>
                    <input
                        value={tocMenu.label}
                        onChange={(e) => setTocMenu((m) => (m ? { ...m, label: e.target.value } : m))}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                        placeholder="TOC label"
                    />

                    <div className="grid grid-cols-2 gap-2 mt-3">
                        {tocMenu.isExisting ? (
                            <button
                                type="button"
                                onClick={() => handleTocAction()}
                                className="col-span-2 px-3 py-2 bg-red-500/10 text-red-500 rounded-lg text-xs font-semibold hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2"
                            >
                                <X size={14} /> Remove Entry
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => handleTocAction('main')}
                                    className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Add Main
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleTocAction('sub')}
                                    className="px-3 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    Add Sub
                                </button>
                            </>
                        )}

                        <button
                            type="button"
                            onClick={closeTocMenu}
                            className="col-span-2 px-3 py-2 bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] rounded-lg text-xs font-semibold hover:text-[var(--text-primary)] transition-colors"
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
