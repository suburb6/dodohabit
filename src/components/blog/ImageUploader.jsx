import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const ImageUploader = ({ image, onChange, uploading = false, height = "h-48" }) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);

    // Reset preview when image prop changes (upload finished) or if uploading stops
    React.useEffect(() => {
        if (!uploading) {
            setPreview(null);
        }
    }, [image, uploading]);

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
        // Create local preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);

        // Upload
        if (onChange) {
            onChange(file);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation();
        onChange(null);
        setPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const displayImage = preview || image;

    return (
        <div
            className={`relative w-full ${height} border-2 border-dashed rounded-xl overflow-hidden transition-colors cursor-pointer group
                ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-[var(--border-color)] hover:border-blue-500 hover:bg-[var(--bg-secondary)]"}
                ${!displayImage ? "bg-[var(--bg-secondary)]" : ""}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current.click()}
        >
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleChange}
                disabled={uploading}
            />

            {displayImage ? (
                <>
                    <img
                        src={displayImage}
                        alt="Uploaded"
                        className={`w-full h-full object-cover ${uploading ? 'opacity-50 blur-sm' : ''}`}
                    />

                    {uploading && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <span className="text-white font-bold text-sm shadow-black drop-shadow-md">Uploading...</span>
                        </div>
                    )}

                    {!uploading && (
                        <>
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
                    )}
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-[var(--text-secondary)] gap-3">
                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm font-medium">Uploading...</p>
                        </div>
                    ) : (
                        <>
                            <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] flex items-center justify-center">
                                <ImageIcon size={24} className="text-[var(--text-secondary)]" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium text-[var(--text-primary)]">Click to upload or drag and drop</p>
                                <p className="text-sm text-[var(--text-secondary)]">SVG, PNG, JPG or GIF</p>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImageUploader;
