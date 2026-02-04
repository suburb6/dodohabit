import React, { useState } from 'react';
import { useBlog } from '../../contexts/BlogContext';
import { Image as ImageIcon, Trash2, Upload, Copy, Check, Search } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';

const MediaLibrary = () => {
    const { media, uploadImage, deleteMedia } = useBlog();
    const [uploading, setUploading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [copiedId, setCopiedId] = useState(null);

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setUploading(true);
        try {
            await Promise.all(files.map(file => uploadImage(file)));
        } catch (error) {
            alert("Failed to upload some images.");
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const handleCopyUrl = (url, id) => {
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const handleDelete = async (item) => {
        if (window.confirm("Are you sure you want to delete this image? It might be used in potential posts.")) {
            await deleteMedia(item);
        }
    };

    const filteredMedia = media.filter(item =>
        (item.originalName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const headerActions = (
        <label className={`cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Upload Image'}
            <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
            />
        </label>
    );

    return (
        <div className="flex flex-col h-full bg-[var(--bg-primary)]">
            <AdminHeader title="Media Library" actions={headerActions} uploading={uploading} />

            <div className="p-4 md:p-6 space-y-6">
                {/* Search Bar */}
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" size={18} />
                    <input
                        type="text"
                        placeholder="Search images..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl pl-10 pr-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                    />
                </div>

                {/* Gallery Grid */}
                {filteredMedia.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                        {filteredMedia.map((item) => (
                            <div key={item.id} className="group relative aspect-square bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-2xl overflow-hidden hover:border-blue-500/50 transition-all shadow-soft">
                                <img
                                    src={item.url}
                                    alt={item.originalName}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />

                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleCopyUrl(item.url, item.id)}
                                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-colors"
                                            title="Copy URL"
                                        >
                                            {copiedId === item.id ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item)}
                                            className="p-2.5 bg-red-500/20 hover:bg-red-500/40 rounded-full text-red-400 backdrop-blur transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-white font-medium truncate w-full text-center px-2">
                                        {item.originalName}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-[var(--text-secondary)]">
                        <div className="w-20 h-20 bg-[var(--bg-secondary)] rounded-3xl flex items-center justify-center mb-6 shadow-sm">
                            <ImageIcon size={40} className="text-[var(--text-secondary)] opacity-50" />
                        </div>
                        <p className="text-xl font-bold text-[var(--text-primary)] mb-2">No images found</p>
                        <p className="text-sm">Upload some images to populate your library.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MediaLibrary;
