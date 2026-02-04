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

const EditorToolbar = ({ editor, addImage }) => {
    if (!editor) {
        return null;
    }

    const setLink = () => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);

        // cancelled
        if (url === null) {
            return;
        }

        // empty
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }

        // update
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
        <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-t-xl sticky top-0 z-10">
            <ToolbarButton
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
            >
                <Undo size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
            >
                <Redo size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={editor.isActive('bold')}
                title="Bold"
            >
                <Bold size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={editor.isActive('italic')}
                title="Italic"
            >
                <Italic size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={editor.isActive('underline')}
                title="Underline"
            >
                <Underline size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleStrike().run()}
                isActive={editor.isActive('strike')}
                title="Strikethrough"
            >
                <Strikethrough size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                isActive={editor.isActive('heading', { level: 1 })}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                isActive={editor.isActive('heading', { level: 2 })}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                isActive={editor.isActive({ textAlign: 'left' })}
                title="Align Left"
            >
                <AlignLeft size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                isActive={editor.isActive({ textAlign: 'center' })}
                title="Align Center"
            >
                <AlignCenter size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                isActive={editor.isActive({ textAlign: 'right' })}
                title="Align Right"
            >
                <AlignRight size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().setTextAlign('justify').run()}
                isActive={editor.isActive({ textAlign: 'justify' })}
                title="Justify"
            >
                <AlignJustify size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                isActive={editor.isActive('bulletList')}
                title="Bullet List"
            >
                <List size={18} />
            </ToolbarButton>
            <ToolbarButton
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                isActive={editor.isActive('orderedList')}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </ToolbarButton>

            <Divider />

            <ToolbarButton
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
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
            <ToolbarButton
                onClick={addImage}
                title="Add Image"
            >
                <ImageIcon size={18} />
            </ToolbarButton>
        </div>
    );
};

export default EditorToolbar;
