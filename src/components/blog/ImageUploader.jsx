import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Library } from 'lucide-react';
import MediaLibraryModal from './MediaLibraryModal';

const ImageUploader = ({
    image,
    onChange,
    uploading = false,
    progress = 0,
    onCancel,
    height = "h-56",
    fileDetails = null, // { name, size, type }
    recommendedText = null,
    metadata = null, // { caption, alt, credit }
    onMetadataChange = null,
    titleText = 'Featured Image',
    descriptionText = 'Upload a high-quality image for your post or select one from your library'
}) => {
    const fileInputRef = useRef(null);
    const [dragActive, setDragActive] = useState(false);
    const [preview, setPreview] = useState(null);
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

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

    const handleLibrarySelect = (mediaItem) => {
        // When selecting from library, we pass the URL directly
        // The parent component needs to handle string (URL) vs File object
        if (onChange) {
            // We can pass an object or special flag to indicate this is a library item
            // OR just pass the URL string, and let parent decide.
            // Since onChange usually expects a File for upload, let's verify how PostEditor handles it.
            // PostEditor expects a File object for uploadImage, OR we can bypass upload if it's already a URL.
            // Actually, for consistency, let's update PostEditor to handle URL updates directly if we pass a non-File.
            // But wait, PostEditor calls uploadImage(featuredImageFile).
            // We need a way to tell PostEditor "this is a URL, don't upload it".
            onChange(mediaItem);
        }

        // If metadata is available in mediaItem, pre-fill it
        if (onMetadataChange) {
            // mediaItem might not have these fields if they weren't saved, but let's try
            // We probably didn't save caption/alt/credit in Firestore on upload (we do now in PostEditor but not in BlogContext 'media' collection yet fully linked)
            // But if we did:
            // if (mediaItem.caption) onMetadataChange('caption', mediaItem.caption);
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
        <div className="space-y-3">
            <div
                className={`relative w-full ${height} border-2 border-dashed rounded-xl overflow-hidden transition-all group
                    ${dragActive ? "border-blue-500 bg-blue-500/10" : "border-[var(--border-color)] hover:border-blue-500/50 hover:bg-[var(--bg-secondary)]"}
                    ${!displayImage ? "bg-[var(--bg-secondary)]/50" : ""}
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
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
                            <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-black/60 backdrop-blur-[2px] transition-all p-4">
                                <div className="w-full max-w-xs space-y-2">
                                    <div className="flex justify-between text-xs font-semibold text-white/90">
                                        <span>Uploading...</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-300 ease-out"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    {fileDetails && (
                                        <div className="text-center text-[10px] text-white/70 mt-1">
                                            {fileDetails.size} • {fileDetails.type}
                                        </div>
                                    )}
                                </div>

                                {onCancel && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCancel();
                                        }}
                                        className="mt-4 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-xs font-medium rounded-full backdrop-blur-md transition-colors border border-white/10"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        )}

                        {!uploading && (
                            <>
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-white/10"
                                    >
                                        <Upload size={16} /> Replace
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsLibraryOpen(true)}
                                        className="px-4 py-2 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors border border-white/10"
                                    >
                                        <Library size={16} /> Library
                                    </button>
                                </div>
                                <button
                                    onClick={removeImage}
                                    className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 backdrop-blur-md rounded-full transition-colors z-10 text-white"
                                    title="Remove image"
                                >
                                    <X size={16} />
                                </button>
                            </>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-[var(--text-secondary)] gap-5 h-full">
                        {uploading ? (
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                                <p className="text-sm font-medium">Starting upload...</p>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-14 h-14 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] flex items-center justify-center mb-1 shadow-sm">
                                        <ImageIcon size={28} className="text-[var(--text-secondary)] opacity-70" />
                                    </div>
                                    <p className="font-semibold text-[var(--text-primary)] text-base">{titleText}</p>
                                    <p className="text-sm text-[var(--text-secondary)] text-center max-w-[240px] leading-relaxed">
                                        {descriptionText}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3 mt-1">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current.click()}
                                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm hover:shadow-md"
                                    >
                                        <Upload size={16} /> Upload Device
                                    </button>
                                    <span className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider px-1">or</span>
                                    <button
                                        type="button"
                                        onClick={() => setIsLibraryOpen(true)}
                                        className="px-4 py-2.5 bg-[var(--bg-primary)] border border-[var(--border-color)] hover:border-[var(--text-secondary)] text-[var(--text-primary)] rounded-lg flex items-center gap-2 text-sm font-medium transition-all shadow-sm"
                                    >
                                        <Library size={16} /> Open Library
                                    </button>
                                </div>

                                {recommendedText && (
                                    <div className="mt-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                                        <p className="text-xs text-blue-400 font-medium">
                                            {recommendedText}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Metadata Fields (Only show if image exists and not uploading) */}
            {displayImage && !uploading && onMetadataChange && metadata && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="md:col-span-2">
                        <input
                            type="text"
                            placeholder="Caption (appears below image)"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                            value={metadata.caption || ''}
                            onChange={(e) => onMetadataChange('caption', e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Alt text (for SEO/Accessibility)"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                            value={metadata.alt || ''}
                            onChange={(e) => onMetadataChange('alt', e.target.value)}
                        />
                    </div>
                    <div>
                        <input
                            type="text"
                            placeholder="Image Credit / Source Link"
                            className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                            value={metadata.credit || ''}
                            onChange={(e) => onMetadataChange('credit', e.target.value)}
                        />
                    </div>
                </div>
            )}

            <MediaLibraryModal
                isOpen={isLibraryOpen}
                onClose={() => setIsLibraryOpen(false)}
                onSelect={handleLibrarySelect}
            />
        </div>
    );
};

export default ImageUploader;
