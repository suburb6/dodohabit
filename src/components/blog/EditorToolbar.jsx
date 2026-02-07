// @ts-nocheck
import React from 'react';
import {
    Bold,
    Italic,
    Underline,
    Strikethrough,
    AlignLeft,
    AlignCenter,
    AlignRight,
    AlignJustify,
    List,
    ListOrdered,
    Image as ImageIcon,
    Quote,
    Heading1,
    Heading2,
    Undo,
    Redo,
    Link as LinkIcon
} from 'lucide-react';
import ImageSourceMenu from './ImageSourceMenu';

/**
 * @param {{
 *   editor: import('@tiptap/react').Editor | null,
 *   addImageFromComputer: () => void,
 *   openImageLibrary: () => void,
 *   detached?: boolean,
 *   addTocAtCursor?: () => void,
 * }} props
 */
const EditorToolbar = ({ editor, addImageFromComputer, openImageLibrary, detached = false, addTocAtCursor }) => {
    if (!editor) {
        return null;
    }

    const [imageMenuOpen, setImageMenuOpen] = React.useState(false);
    const imageMenuRef = React.useRef(null);

    React.useEffect(() => {
        if (!imageMenuOpen) return;
        const onMouseDown = (event) => {
            if (imageMenuRef.current?.contains(event.target)) return;
            setImageMenuOpen(false);
        };
        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, [imageMenuOpen]);

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor?.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    };

    const ToolbarButton = ({ onClick, isActive, disabled, children, title }) => (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`p-2 rounded-lg transition-colors ${isActive
                ? 'bg-blue-600 text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            title={title}
            type="button"
        >
            {children}
        </button>
    );

    const Divider = () => <div className="w-[1px] h-6 bg-[var(--border-color)] mx-1" />;

    return (
        <div
            className={`sticky z-30 transition-all duration-300
                ${detached ? 'top-[4.5rem] mx-3 mt-2 rounded-xl border border-blue-500/20 bg-[var(--bg-secondary)]/95 backdrop-blur-xl shadow-[0_14px_40px_-18px_rgba(59,130,246,0.55)]'
                    : 'top-[4.5rem] rounded-t-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]'}
            `}
        >
            <div className="flex flex-wrap items-center gap-1 p-2 relative">
            <ToolbarButton
                onClick={() => editor?.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
            >
                <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
            >
                <Redo size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
            >
                <Underline size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <AlignRight size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                title="Justify"
            >
                <AlignJustify size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                isActive={editor.isActive('blockquote')}
                title="Quote"
            >
                <Quote size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={setLink}
                isActive={editor.isActive('link')}
                title="Link"
            >
                <LinkIcon size={18} />
            </ToolbarButton>
            <div ref={imageMenuRef} className="relative">
                <ToolbarButton
                    onClick={() => setImageMenuOpen((v) => !v)}
                    isActive={imageMenuOpen}
                    title="Add Image"
                >
                    <ImageIcon size={18} />
                </ToolbarButton>
                <ImageSourceMenu
                    open={imageMenuOpen}
                    onClose={() => setImageMenuOpen(false)}
                    onUploadFromComputer={addImageFromComputer}
                    onOpenLibrary={openImageLibrary}
                    className="left-1/2 right-auto -translate-x-1/2 mt-1"
                />
            </div>
            <ToolbarButton
                onClick={addTocAtCursor}
                title="Add TOC marker at cursor"
            >
                TOC
            </ToolbarButton>
            </div>
        </div>
    );
};

export default EditorToolbar;
