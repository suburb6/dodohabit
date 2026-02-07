import React from 'react';
import { X, Trash2, RefreshCw } from 'lucide-react';
import { useBlog } from '../../contexts/BlogContext';

const MediaLibraryModal = ({ isOpen, onClose, onSelect }) => {
    const { media, deleteMedia, loading } = useBlog();
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
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-color)]">
                    <div className="flex items-center gap-4">
                        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Media Library</h3>
                        <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-color)]">
                            <div className={`w-1.5 h-1.5 rounded-full ${loading ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
                            <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                                {loading ? 'Syncing...' : 'Connected'}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg transition-colors text-[var(--text-secondary)]"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar thin-scrollbar min-h-[300px]" data-lenis-prevent>
                    {media.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-[var(--text-secondary)]">
                            <div className="w-16 h-16 rounded-full bg-[var(--bg-secondary)] flex items-center justify-center mb-4">
                                <RefreshCw className={`w-8 h-8 ${loading ? 'animate-spin opacity-50' : 'opacity-20'}`} />
                            </div>
                            <p className="font-medium text-[var(--text-primary)]">
                                {loading ? 'Fetching images...' : 'No images found in library'}
                            </p>
                            <p className="text-sm mt-1 opacity-70">
                                {loading ? 'Checking Firestore...' : 'Upload images in the editor to see them here.'}
                            </p>
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
                                            ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                                            : 'border-[var(--border-color)] hover:border-blue-500/50'}
                                    `}
                                >
                                    <img
                                        src={item.url}
                                        alt={item.originalName || 'Library image'}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    {/* Delete Button */}
                                    <button
                                        onClick={(e) => handleDelete(e, item)}
                                        className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-md opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 shadow-sm"
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
                <div className="p-4 border-t border-[var(--border-color)] flex justify-between items-center bg-[var(--bg-secondary)]/30">
                    <div className="text-xs text-[var(--text-secondary)]">
                        {media.length > 0 && `${media.length} images in library`}
                    </div>
                    <div className="flex gap-3">
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
        </div>
    );
};

export default MediaLibraryModal;
