import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import EditorToolbar from './EditorToolbar';
import './editor.css'; // We'll create this for custom TipTap styles

const RichTextEditor = ({ content, onChange, onImageUpload, placeholder = 'Start writing your amazing post...' }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Underline,
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

    return (
        <div className="bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] shadow-xl overflow-hidden">
            <EditorToolbar editor={editor} addImage={addImage} />
            <div className="bg-[var(--bg-primary)]">
                <EditorContent editor={editor} />
            </div>
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
