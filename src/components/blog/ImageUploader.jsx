import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ image, onChange, height = "h-48" }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = async (file) => {
        // Preview immediately
        const reader = new FileReader();
        reader.onloadend = () => {
            // If we have a separate preview handler, we could use it here
        };
        reader.readAsDataURL(file);

        // Upload to server if handler provided
        if (onChange) {
            // Pass the file object directly if the parent component wants to handle upload
            // Or if the parent expects a URL, we might need a separate prop.
            // For now, let's assume onChange handles the final value (URL or Base64)
            // But to support async upload, we should probably pass the FILE or a PROMISE.

            // User requested: "user stores the images somewhere... with its url"
            // So we need to upload THIS file.

            // Let's pass the FILE to the parent, and let the parent decide.
            // But wait, existing code expects a string (image URL/Base64).
            // Let's modify this component to accept an optional `onUpload` prop.

            // Actually, simpler: Just call onChange with the file, and let parent handle it?
            // No, the parent state `featuredImage` is likely a string.
            // Let's emit the file and let parent upload.
            onChange(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        onChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div
            className={`relative w-full ${height} border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer group
                ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-[var(--border-color)] hover:border-blue-500 hover:bg-[var(--bg-secondary)]"}
                ${!image ? "bg-[var(--bg-secondary)]" : ""}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
            />

            {image ? (
                <>
                    <img
                        src={image}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="text-white font-medium flex items-center gap-2">
                            <Upload size={18} /> Change Image
                        </p>
                    </div>
                    <button
                        onClick={removeImage}
                        className="absolute top-2 right-2 p-2 bg-red-500 rounded-full hover:bg-red-600 transition-colors z-10"
                        title="Remove image"
                    >
                        <X size={16} color="white" />
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] gap-3">
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                        <ImageIcon size={24} className="text-[var(--text-secondary)]" />
                    </div>
                    <div className="text-center">
                        <p className="font-medium text-[var(--text-primary)]">Click to upload or drag and drop</p>
                        <p className="text-sm text-[var(--text-secondary)]">SVG, PNG, JPG or GIF</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
