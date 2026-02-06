import React from 'react';
import { X, Trash2, Check } from 'lucide-react';
import { useBlog } from '../../contexts/BlogContext';

const MediaLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const { media, deleteMedia } = useBlog();
    const [selectedId, setSelectedId] = React.useState(null);

    // Reset selection when modal opens/closes
    React.useEffect(() => {
        if (isOpen) setSelectedId(null);
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSelect = () => {
        const selectedMedia = media.find(m => m.id === selectedId);
        if (selectedMedia) {
            onSelect(selectedMedia);
            onClose();
        }
    };

    const handleDelete = async (e, item) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this image?')) {
            try {
                await deleteMedia(item);
                if (selectedId === item.id) setSelectedId(null);
            } catch (error) {
                console.error("Failed to delete media:", error);
                alert("Failed to delete image.");
            }
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Media Library</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-secondary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)]">
                            <p>No images found in library.</p>
                            <p className="text-sm mt-2 opacity-70">Upload images in the editor to see them here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {media.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => setSelectedId(item.id)}
                                    className={`
                                        group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all
                                        ${selectedId === item.id
                                            ? 'border-blue-500 ring-2 ring-blue-500/20'
                                            : 'border-transparent hover:border-[var(--border-color)]'}
                                    `}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.originalName || 'Library image'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />

                                    {/* Overlay info */}
                                    <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-[2px] p-2 translate-y-full group-hover:translate-y-0 transition-transform">
                                        <p className="text-[10px] text-white truncate">{item.originalName}</p>
                                        <p className="text-[10px] text-white/70">
                                            {new Date(item.uploadedAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    {/* Selection Checkmark */}
                                    {selectedId === item.id && (
                                        <div className="absolute top-2 right-2 bg-blue-500 text-white p-1 rounded-full shadow-lg">
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                    )}

                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(e, item)}
                                        className="absolute top-2 left-2 p-1.5 bg-red-500/80 hover:bg-red-500 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete image"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border-color)] flex justify-end gap-3 bg-[var(--bg-secondary)]/30">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSelect}
                        disabled={!selectedId}
                        className="px-4 py-2 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        Use Selected Image
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MediaLibraryModal;
