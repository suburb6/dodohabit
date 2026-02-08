import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { AlignCenter, AlignLeft, AlignRight, Check, Eraser, Image as ImageIcon, Upload, X } from 'lucide-react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import EditorToolbar from './EditorToolbar';
import TocAnchor from './tiptap/TocAnchor';
import EnhancedImage from './tiptap/EnhancedImage';
import MediaLibraryModal from './MediaLibraryModal';
import './editor.css'; // We'll create this for custom TipTap styles

const slugifyForId = (value) =>
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const getAutoTocLabel = (text, maxWords = 6) => {
    const words = (text || '').replace(/\s+/g, ' ').trim().split(' ');
    if (!words[0]) return '';
    if (words.length <= maxWords) return words.join(' ');
    return `${words.slice(0, maxWords).join(' ')}...`;
};

const RichTextEditor = ({
    content,
    onChange,
    onImageUpload,
    placeholder = 'Start writing your amazing post...',
}) => {
    const [tocMenu, setTocMenu] = useState(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);
    const [toolbarDetached, setToolbarDetached] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [placementMode, setPlacementMode] = useState(false);
    const [selectionMenu, setSelectionMenu] = useState(null);
    const [slashMenu, setSlashMenu] = useState(null);
    const toolbarSentinelRef = useRef(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
            TocAnchor,
            Table.configure({
                resizable: true,
            }),
            TableRow,
            TableHeader,
            TableCell,
            EnhancedImage.configure({
                allowBase64: false, // Force uploads to prevent oversized docs
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

    useEffect(() => {
        if (!toolbarSentinelRef.current) return undefined;

        const sentinel = toolbarSentinelRef.current;
        const scrollRoot = sentinel.closest('[data-admin-scroll-root]');
        const target = scrollRoot || window;

        const syncDetachedState = () => {
            const sentinelTop = sentinel.getBoundingClientRect().top;
            const rootTop = scrollRoot ? scrollRoot.getBoundingClientRect().top : 0;
            const stickyThreshold = rootTop + 78;
            setToolbarDetached(sentinelTop < stickyThreshold);
        };

        syncDetachedState();
        target.addEventListener('scroll', syncDetachedState, { passive: true });
        window.addEventListener('resize', syncDetachedState);

        return () => {
            target.removeEventListener('scroll', syncDetachedState);
            window.removeEventListener('resize', syncDetachedState);
        };
    }, []);

    useEffect(() => {
        if (!editor) return undefined;

        const syncImageSelection = () => {
            if (editor.isActive('image')) {
                setSelectedImage(editor.getAttributes('image'));
            } else {
                setSelectedImage(null);
            }
        };

        syncImageSelection();
        editor.on('selectionUpdate', syncImageSelection);
        editor.on('update', syncImageSelection);
        return () => {
            editor.off('selectionUpdate', syncImageSelection);
            editor.off('update', syncImageSelection);
        };
    }, [editor]);

    useEffect(() => {
        if (!selectedImage) {
            setPlacementMode(false);
        }
    }, [selectedImage]);

    useEffect(() => {
        if (!editor) return undefined;

        const syncSelectionMenu = () => {
            const { empty, from, to } = editor.state.selection;
            if (empty) {
                setSelectionMenu(null);
                return;
            }
            const start = editor.view.coordsAtPos(from);
            const end = editor.view.coordsAtPos(to);
            const x = Math.min(window.innerWidth - 220, Math.max(12, (start.left + end.left) / 2 - 92));
            const y = Math.max(12, Math.min(start.top, end.top) - 46);
            setSelectionMenu({ x, y });
        };

        syncSelectionMenu();
        editor.on('selectionUpdate', syncSelectionMenu);
        window.addEventListener('scroll', syncSelectionMenu, true);
        window.addEventListener('resize', syncSelectionMenu);
        return () => {
            editor.off('selectionUpdate', syncSelectionMenu);
            window.removeEventListener('scroll', syncSelectionMenu, true);
            window.removeEventListener('resize', syncSelectionMenu);
        };
    }, [editor]);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (file && onImageUpload) {
            const url = await onImageUpload(file);
            if (url) {
                editor.chain().focus().setImage({ src: url, width: '60%', align: 'center' }).run();
                setPlacementMode(true);
            }
        }
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const addImageFromComputer = useCallback(() => {
        if (onImageUpload && fileInputRef.current) {
            fileInputRef.current.click();
        } else {
            // Fallback to URL prompt if no upload handler
            const url = window.prompt('URL');
            if (url) {
                editor.chain().focus().setImage({ src: url, width: '60%', align: 'center' }).run();
                setPlacementMode(true);
            }
        }
    }, [editor, onImageUpload]);

    const openImageLibrary = useCallback(() => {
        setIsLibraryOpen(true);
    }, []);

    const onLibraryImageSelect = useCallback((mediaItem) => {
        if (!mediaItem?.url || !editor) return;
        editor.chain().focus().setImage({
            src: mediaItem.url,
            width: '60%',
            align: 'center',
            alt: mediaItem.alt || mediaItem.title || '',
            title: mediaItem.caption || mediaItem.title || '',
        }).run();
        setPlacementMode(true);
    }, [editor]);

    const addAppPromoCard = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertContent(`
            <div class="dodohabit-app-card" contenteditable="false">
                <div class="dodohabit-app-card__icon">D</div>
                <div class="dodohabit-app-card__content">
                    <div class="dodohabit-app-card__title">Get DodoHabit on Play Store</div>
                    <div class="dodohabit-app-card__subtitle">Build habits that stick, one day at a time.</div>
                </div>
                <a class="dodohabit-app-card__cta" href="https://play.google.com/store" target="_blank" rel="noopener noreferrer">Install</a>
            </div>
            <p></p>
        `).run();
    }, [editor]);

    const addTableAtCursor = useCallback(() => {
        if (!editor) return;
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
    }, [editor]);

    const addTocAtCursor = useCallback(() => {
        if (!editor) return;
        const parentText = editor.state.selection.$from.parent?.textContent || '';
        const suggested = getAutoTocLabel(parentText, 8) || 'Section';
        const value = window.prompt('TOC label', suggested);
        const label = (value || '').replace(/\s+/g, ' ').trim();
        if (!label) return;

        const id = `toc-${Date.now()}-${slugifyForId(label) || 'section'}`;
        const { from } = editor.state.selection;
        editor.chain().focus().setTextSelection(from).insertContent({ type: 'tocAnchor', attrs: { id, label, level: 'sub' } }).run();
    }, [editor]);

    const closeSlashMenu = useCallback(() => setSlashMenu(null), []);
    const closeTocMenu = useCallback(() => setTocMenu(null), []);

    const syncSlashMenu = useCallback(() => {
        if (!editor) return;
        const { from, empty, $from } = editor.state.selection;
        if (!empty) {
            setSlashMenu(null);
            return;
        }

        const blockStart = $from.start();
        const textBefore = editor.state.doc.textBetween(blockStart, from, '\n', '\0');
        const match = textBefore.match(/(?:^|\s)\/([a-z0-9-]*)$/i);
        if (!match) {
            setSlashMenu(null);
            return;
        }

        const query = (match[1] || '').toLowerCase();
        const coords = editor.view.coordsAtPos(from);
        const x = Math.min(window.innerWidth - 280, Math.max(12, coords.left));
        setSlashMenu({
            x,
            y: coords.bottom + 8,
            query,
            range: {
                from: from - query.length - 1,
                to: from,
            },
        });
    }, [editor]);

    const slashCommands = React.useMemo(() => {
        if (!editor) return [];
        return [
            {
                id: 'h1',
                label: 'Heading 1',
                keywords: 'h1 heading title',
                run: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
            },
            {
                id: 'h2',
                label: 'Heading 2',
                keywords: 'h2 heading section',
                run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
            },
            {
                id: 'quote',
                label: 'Quote',
                keywords: 'quote blockquote callout',
                run: () => editor.chain().focus().toggleBlockquote().run(),
            },
            {
                id: 'code',
                label: 'Code Block',
                keywords: 'code snippet',
                run: () => editor.chain().focus().toggleCodeBlock().run(),
            },
            {
                id: 'table',
                label: 'Table 3x3',
                keywords: 'table grid rows columns',
                run: addTableAtCursor,
            },
            {
                id: 'image',
                label: 'Image',
                keywords: 'image photo upload',
                run: addImageFromComputer,
            },
            {
                id: 'toc',
                label: 'TOC Marker',
                keywords: 'toc table of contents section',
                run: addTocAtCursor,
            },
            {
                id: 'app',
                label: 'DodoHabit App Card',
                keywords: 'app playstore card cta',
                run: addAppPromoCard,
            },
        ];
    }, [editor, addImageFromComputer, addTocAtCursor, addAppPromoCard, addTableAtCursor]);

    const filteredSlashCommands = React.useMemo(() => {
        if (!slashMenu) return [];
        const query = slashMenu.query || '';
        if (!query) return slashCommands;
        return slashCommands.filter((command) =>
            command.label.toLowerCase().includes(query) ||
            command.keywords.includes(query)
        );
    }, [slashCommands, slashMenu]);

    const runSlashCommand = useCallback((command) => {
        if (!editor || !slashMenu || !command) return;
        editor.chain().focus().deleteRange(slashMenu.range).run();
        command.run();
        closeSlashMenu();
    }, [editor, slashMenu, closeSlashMenu]);

    const setBubbleLink = useCallback(() => {
        if (!editor) return;
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    useEffect(() => {
        if (!editor) return undefined;
        editor.on('selectionUpdate', syncSlashMenu);
        editor.on('update', syncSlashMenu);
        return () => {
            editor.off('selectionUpdate', syncSlashMenu);
            editor.off('update', syncSlashMenu);
        };
    }, [editor, syncSlashMenu]);

    useEffect(() => {
        if (!slashMenu) return undefined;
        const onKeyDown = (event) => {
            if (event.key === 'Escape') {
                closeSlashMenu();
            }
        };
        const onMouseDown = (event) => {
            if (event.target?.closest?.('[data-slash-menu]')) return;
            closeSlashMenu();
        };
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('mousedown', onMouseDown);
        return () => {
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('mousedown', onMouseDown);
        };
    }, [slashMenu, closeSlashMenu]);

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
                    label: getAutoTocLabel(trimmed),
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
                return;
            }

            if (empty) {
                e.preventDefault();
                const parentText = editor.state.selection.$from.parent?.textContent || '';
                setTocMenu({
                    x: e.clientX,
                    y: e.clientY,
                    label: getAutoTocLabel(parentText, 8) || 'Section',
                    selectionText: parentText,
                    isExisting: false
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
            const text = (tocMenu.label || '').trim();
            editor.chain().focus().deleteSelection().insertContent(text).run();
        } else {
            // ADD Logic ('main' or 'sub')
            const label = tocMenu.label.replace(/\s+/g, ' ').trim();
            if (!label) return;
            const level = levelOverride || 'sub';

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

    const selectedImageWidth = Number.parseInt(String(selectedImage?.width || '100').replace('%', ''), 10) || 100;

    const updateSelectedImage = useCallback((attrs) => {
        if (!editor || !editor.isActive('image')) return;
        editor.chain().focus().updateAttributes('image', attrs).run();
    }, [editor]);

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-xl relative overflow-visible">
            <div ref={toolbarSentinelRef} className="h-1 w-full" />
            <EditorToolbar
                editor={editor}
                addImageFromComputer={addImageFromComputer}
                openImageLibrary={openImageLibrary}
                detached={toolbarDetached}
                addTocAtCursor={addTocAtCursor}
                addAppPromoCard={addAppPromoCard}
                addTableAtCursor={addTableAtCursor}
            />
            {editor && selectionMenu && (
                <div
                    className="fixed z-50 flex items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-xl p-1"
                    style={{ left: selectionMenu.x, top: selectionMenu.y }}
                >
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={`px-2 py-1 text-xs rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        B
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={`px-2 py-1 text-xs rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        I
                    </button>
                    <button
                        type="button"
                        onClick={setBubbleLink}
                        className={`px-2 py-1 text-xs rounded ${editor.isActive('link') ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        Link
                    </button>
                    <button
                        type="button"
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                        className={`px-2 py-1 text-xs rounded ${editor.isActive('blockquote') ? 'bg-blue-600 text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)]'}`}
                    >
                        Quote
                    </button>
                </div>
            )}
            <div className="bg-[var(--bg-primary)]" onContextMenu={onEditorContextMenu}>
                <EditorContent editor={editor} />
            </div>

            {selectedImage && (
                <div className="sticky bottom-4 z-20 px-4 pb-4 pointer-events-none">
                    <div className="ml-auto max-w-md rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-3 pointer-events-auto">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">Image Tools</span>
                            <button
                                type="button"
                                onClick={() => editor?.chain().focus().deleteSelection().run()}
                                className="p-1 rounded-md text-[var(--text-secondary)] hover:text-red-500 hover:bg-[var(--bg-primary)] transition-colors"
                                title="Remove image"
                            >
                                <Eraser size={14} />
                            </button>
                        </div>

                        {placementMode && (
                            <div className="mb-3 rounded-lg border border-blue-500/35 bg-blue-500/10 p-2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPlacementMode(false)}
                                    className="px-2.5 py-1.5 rounded-md bg-green-600 text-white text-xs font-semibold hover:bg-green-700 transition-colors inline-flex items-center gap-1"
                                >
                                    <Check size={12} />
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        editor?.chain().focus().deleteSelection().run();
                                        setPlacementMode(false);
                                    }}
                                    className="px-2.5 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1"
                                >
                                    <X size={12} />
                                    Cancel
                                </button>
                                <span className="text-[10px] text-[var(--text-secondary)]">Adjust size + alignment, then confirm placement.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-4 gap-1 mb-3">
                            {[40, 60, 80, 100].map((size) => (
                                <button
                                    key={size}
                                    type="button"
                                    onClick={() => updateSelectedImage({ width: `${size}%` })}
                                    className={`px-2 py-1.5 text-xs rounded-md border transition-colors ${selectedImageWidth === size
                                        ? 'bg-blue-600 text-white border-blue-500'
                                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                        }`}
                                >
                                    {size}%
                                </button>
                            ))}
                        </div>

                        <input
                            type="range"
                            min={25}
                            max={100}
                            value={selectedImageWidth}
                            onChange={(e) => updateSelectedImage({ width: `${e.target.value}%` })}
                            className="w-full accent-blue-500 mb-3"
                        />

                        <div className="grid grid-cols-3 gap-1 mb-3">
                            <button
                                type="button"
                                onClick={() => updateSelectedImage({ align: 'left' })}
                                className={`px-2 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1 transition-colors ${selectedImage?.align === 'left'
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                    }`}
                            >
                                <AlignLeft size={12} /> Left
                            </button>
                            <button
                                type="button"
                                onClick={() => updateSelectedImage({ align: 'center' })}
                                className={`px-2 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1 transition-colors ${!selectedImage?.align || selectedImage?.align === 'center'
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                    }`}
                            >
                                <AlignCenter size={12} /> Center
                            </button>
                            <button
                                type="button"
                                onClick={() => updateSelectedImage({ align: 'right' })}
                                className={`px-2 py-1.5 text-xs rounded-md border flex items-center justify-center gap-1 transition-colors ${selectedImage?.align === 'right'
                                    ? 'bg-blue-600 text-white border-blue-500'
                                    : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                    }`}
                            >
                                <AlignRight size={12} /> Right
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button
                                type="button"
                                onClick={addImageFromComputer}
                                className="px-3 py-2 rounded-md bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                            >
                                <Upload size={12} />
                                Replace
                            </button>
                            <button
                                type="button"
                                onClick={openImageLibrary}
                                className="px-3 py-2 rounded-md border border-[var(--border-color)] text-[var(--text-primary)] text-xs font-semibold hover:bg-[var(--bg-primary)] transition-colors flex items-center justify-center gap-2"
                            >
                                <ImageIcon size={12} />
                                Library
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {slashMenu && filteredSlashCommands.length > 0 && (
                <div
                    data-slash-menu
                    className="fixed z-50 w-64 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl p-2"
                    style={{ left: slashMenu.x, top: slashMenu.y }}
                >
                    <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-secondary)]">
                        Slash Commands
                    </div>
                    <div className="mt-1 space-y-1">
                        {filteredSlashCommands.slice(0, 8).map((command) => (
                            <button
                                key={command.id}
                                type="button"
                                onClick={() => runSlashCommand(command)}
                                className="w-full text-left px-2.5 py-2 rounded-lg text-xs text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                            >
                                {command.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

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
                            <button
                                type="button"
                                onClick={() => handleTocAction('sub')}
                                className="col-span-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Add TOC Entry
                            </button>
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

            <MediaLibraryModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={onLibraryImageSelect}
            />
        </div>
    );
};

export default RichTextEditor;
