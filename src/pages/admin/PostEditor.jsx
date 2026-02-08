import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readingTime } from 'reading-time-estimator';
import { useBlog } from '../../contexts/BlogContext';
import RichTextEditor from '../../components/blog/RichTextEditor';
import ImageUploader from '../../components/blog/ImageUploader';
import MediaLibraryModal from '../../components/blog/MediaLibraryModal';
import ImageSourceMenu from '../../components/blog/ImageSourceMenu';
import { Save, Eye, List, X, EyeOff, ChevronDown, ChevronUp, Hash, Camera, Trash2, Navigation, History, RotateCcw, Cloud, Loader2 } from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../contexts/ToastContext';

const normalizeLabel = (value) => (value || '').replace(/\s+/g, ' ').trim().toLowerCase();
const tocItemKey = (item) => `${item.type}-${item.sourceIndex}`;
const slugifyForId = (value) =>
    (value || '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

const htmlToPlainText = (value) => (value || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

const withStableTocIds = (html) => {
    if (!html) return '';
    const div = document.createElement('div');
    div.innerHTML = html;

    const used = new Set();
    Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3')).forEach((el, sourceIndex) => {
        const isAnchor = el.matches('span[data-toc-anchor="true"]');
        const rawText = isAnchor
            ? (el.getAttribute('data-toc-label') || el.textContent || '')
            : (el.textContent || '');
        const text = rawText.replace(/\s+/g, ' ').trim();

        const fallbackId = `${isAnchor ? 'toc' : 'heading'}-${sourceIndex}-${slugifyForId(text) || 'section'}`;
        const currentId = el.getAttribute('id') || el.getAttribute('data-toc-id') || fallbackId;
        let uniqueId = currentId;
        let suffix = 2;
        while (used.has(uniqueId)) {
            uniqueId = `${currentId}-${suffix}`;
            suffix += 1;
        }
        used.add(uniqueId);

        el.setAttribute('id', uniqueId);
        if (isAnchor) {
            el.setAttribute('data-toc-id', uniqueId);
            el.setAttribute('data-toc-anchor', 'true');
            if (text) el.setAttribute('data-toc-label', text);
        }
    });

    return div.innerHTML;
};

const PostEditor = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { posts, getPostById, createPost, updatePost, uploadImage, loading, createPostHistory, getPostHistory } = useBlog();
    const toast = useToast();
    const isNew = !id;
    const [featuredUploading, setFeaturedUploading] = useState(false);
    const [featuredUploadProgress, setFeaturedUploadProgress] = useState(0);
    const [authorUploading, setAuthorUploading] = useState(false);
    const [authorUploadProgress, setAuthorUploadProgress] = useState(0);
    const [bodyUploading, setBodyUploading] = useState(false);
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(true);
    const [tocOpen, setTocOpen] = useState(true);
    const [historyOpen, setHistoryOpen] = useState(true);
    const [tocRowsVisible, setTocRowsVisible] = useState(7);
    const [historyRowsVisible, setHistoryRowsVisible] = useState(6);
    const [authorPhotoMenuOpen, setAuthorPhotoMenuOpen] = useState(false);
    const [authorPhotoLibraryOpen, setAuthorPhotoLibraryOpen] = useState(false);
    const [tocLabelDrafts, setTocLabelDrafts] = useState({});
    const [tocEditingKey, setTocEditingKey] = useState(null);
    const [historyEntries, setHistoryEntries] = useState([]);
    const [cloudHistoryEntries, setCloudHistoryEntries] = useState([]);
    const [historySyncing, setHistorySyncing] = useState(false);
    const [historyPreview, setHistoryPreview] = useState(null);
    const savedRef = useRef(false);
    const pendingIdRef = useRef(null);
    const initializedPostIdRef = useRef(null);
    const authorPhotoInputRef = useRef(null);
    const authorPhotoMenuRef = useRef(null);
    const historyHashRef = useRef('');
    const restoreInProgressRef = useRef(false);
    const historyDebounceRef = useRef(null);
    const historyCloudDisabledRef = useRef(false);

    const [post, setPost] = useState({
        title: '',
        excerpt: '',
        content: '',
        featuredImage: null,
        featuredImageCaption: '',
        featuredImageAlt: '',
        featuredImageCredit: '',
        status: 'draft',
        slug: '',
        publishedAt: null,
        authorName: '',
        authorTitle: '',
        authorImage: null,
        featuredBadges: [],
        tocHidden: []
    });

    const makeHistorySnapshot = useCallback((value) => ({
        title: value.title || '',
        excerpt: value.excerpt || '',
        content: value.content || '',
        slug: value.slug || '',
        featuredImage: value.featuredImage || null,
        featuredImageCaption: value.featuredImageCaption || '',
        featuredImageAlt: value.featuredImageAlt || '',
        featuredImageCredit: value.featuredImageCredit || '',
        authorName: value.authorName || '',
        authorTitle: value.authorTitle || '',
        authorImage: value.authorImage || null,
        featuredBadges: Array.isArray(value.featuredBadges) ? value.featuredBadges.slice(0, 2) : [],
        tocHidden: Array.isArray(value.tocHidden) ? value.tocHidden : [],
    }), []);

    const mapCloudHistoryEntry = useCallback((entry) => {
        const snapshot = entry?.snapshot || {};
        const plain = htmlToPlainText(snapshot.content || '');
        return {
            id: `cloud-${entry.id}`,
            remoteId: entry.id,
            source: 'cloud',
            label: entry.label || 'Cloud snapshot',
            createdAt: new Date(entry.createdAt || entry.updatedAt || Date.now()).toISOString(),
            preview: plain.slice(0, 140),
            snapshot,
        };
    }, []);

    const pushHistorySnapshot = useCallback((label, sourcePost) => {
        const snapshot = makeHistorySnapshot(sourcePost || post);
        const hash = JSON.stringify(snapshot);
        if (hash === historyHashRef.current) return;
        historyHashRef.current = hash;
        const plain = htmlToPlainText(snapshot.content);
        setHistoryEntries((previous) => [
            {
                id: `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
                source: 'local',
                label: label || 'Auto snapshot',
                createdAt: new Date().toISOString(),
                preview: plain.slice(0, 140),
                snapshot,
            },
            ...previous,
        ].slice(0, 40));
    }, [makeHistorySnapshot, post]);

    const loadCloudHistory = useCallback(async (postId) => {
        if (historyCloudDisabledRef.current) return;
        if (!postId) {
            setCloudHistoryEntries([]);
            return;
        }
        try {
            setHistorySyncing(true);
            const entries = await getPostHistory(postId, 40);
            setCloudHistoryEntries(entries.map(mapCloudHistoryEntry));
        } catch (error) {
            console.error('Failed to load cloud history:', error);
            const errorText = String(error?.message || '').toLowerCase();
            if (errorText.includes('permission') || errorText.includes('403') || errorText.includes('unauthorized')) {
                historyCloudDisabledRef.current = true;
                toast?.info?.('Cloud history requires Firestore history rules. Using local history for now.');
            }
        } finally {
            setHistorySyncing(false);
        }
    }, [getPostHistory, mapCloudHistoryEntry, toast]);

    const persistHistorySnapshot = useCallback(async (postId, label, sourcePost) => {
        if (historyCloudDisabledRef.current) return;
        if (!postId) return;
        const snapshot = makeHistorySnapshot(sourcePost || post);
        const summary = htmlToPlainText(snapshot.content).slice(0, 160);
        try {
            setHistorySyncing(true);
            await createPostHistory(postId, snapshot, { label, summary, source: 'editor' });
            const entries = await getPostHistory(postId, 40);
            setCloudHistoryEntries(entries.map(mapCloudHistoryEntry));
        } catch (error) {
            console.error('Failed to persist history snapshot:', error);
            const errorText = String(error?.message || '').toLowerCase();
            if (errorText.includes('permission') || errorText.includes('403') || errorText.includes('unauthorized')) {
                historyCloudDisabledRef.current = true;
                toast?.info?.('Cloud history blocked by Firestore rules. Local history is still active.');
                return;
            }
            toast?.error?.('Cloud history save failed. Local history still available.');
        } finally {
            setHistorySyncing(false);
        }
    }, [createPostHistory, getPostHistory, makeHistorySnapshot, mapCloudHistoryEntry, post, toast]);

    const replacePostContent = useCallback((nextContent) => {
        const value = nextContent || '';
        setPost((prev) => (prev.content === value ? prev : { ...prev, content: value }));
    }, []);

    useEffect(() => {
        if (loading) return;
        if (!isNew) {
            const existingPost = getPostById(id);
            if (existingPost) {
                if (initializedPostIdRef.current === id) {
                    return;
                }
                setPost({
                    ...existingPost,
                    content: withStableTocIds(existingPost.content || ''),
                    featuredBadges: Array.isArray(existingPost.featuredBadges)
                        ? existingPost.featuredBadges.slice(0, 2)
                        : []
                });
                historyHashRef.current = '';
                setHistoryEntries([]);
                setHistoryPreview(null);
                initializedPostIdRef.current = id;
                if (pendingIdRef.current === id) {
                    pendingIdRef.current = null;
                }
            } else {
                if (pendingIdRef.current === id) return;
                console.warn(`Post ${id} not found in ${posts?.length || 0} posts`);
                navigate('/admin/posts');
            }
        }
    }, [id, isNew, getPostById, navigate, loading, posts]);

    useEffect(() => {
        initializedPostIdRef.current = null;
    }, [id]);

    useEffect(() => {
        if (isNew || !id) {
            setCloudHistoryEntries([]);
            return;
        }
        loadCloudHistory(id);
    }, [id, isNew, loadCloudHistory]);

    // Mark dirty on any post field change (skip initial load)
    const initialLoadDone = useRef(false);
    useEffect(() => {
        if (!initialLoadDone.current) {
            initialLoadDone.current = true;
            return;
        }
        if (!savedRef.current) {
            setDirty(true);
        }
        savedRef.current = false;
    }, [post]);

    // Warn on reload / tab close when dirty or uploading
    const isUploading = featuredUploading || authorUploading || bodyUploading;

    useEffect(() => {
        if (!dirty && !isUploading) return;
        const handler = (e) => {
            e.preventDefault();
            e.returnValue = '';
        };
        window.addEventListener('beforeunload', handler);
        return () => window.removeEventListener('beforeunload', handler);
    }, [dirty, isUploading]);

    useEffect(() => {
        const onKeyDown = (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
                event.preventDefault();
                if (!saving && !isUploading) {
                    handleSave('draft');
                }
            }
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [saving, isUploading, post, id]);

    useEffect(() => {
        if (!authorPhotoMenuOpen) return;
        const onMouseDown = (event) => {
            if (authorPhotoMenuRef.current?.contains(event.target)) return;
            setAuthorPhotoMenuOpen(false);
        };
        window.addEventListener('mousedown', onMouseDown);
        return () => window.removeEventListener('mousedown', onMouseDown);
    }, [authorPhotoMenuOpen]);

    const tocEntries = useMemo(() => {
        if (!post.content) return { items: [] };
        const div = document.createElement('div');
        div.innerHTML = post.content;
        const items = [];
        const customLabels = new Set();

        Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3')).forEach((el, sourceIndex) => {
            const isAnchor = el.matches('span[data-toc-anchor="true"]');
            const datasetLabel = el instanceof HTMLElement ? el.dataset?.tocLabel : null;
            const rawText = isAnchor
                ? (el.getAttribute('data-toc-label') || datasetLabel || el.textContent || '')
                : (el.textContent || '');
            const text = (rawText || '').replace(/\s+/g, ' ').trim();
            if (!text) return;

            const normalized = normalizeLabel(text);
            if (!isAnchor && customLabels.has(normalized)) return;

            if (isAnchor) {
                customLabels.add(normalized);
            }

            const existingId = el.getAttribute('id') || el.getAttribute('data-toc-id');
            const fallbackId = `${isAnchor ? 'toc' : 'heading'}-${sourceIndex}-${slugifyForId(text) || 'section'}`;
            const id = existingId || fallbackId;
            const level = isAnchor
                ? 'sub'
                : el.tagName.toLowerCase();

            items.push({
                id,
                text,
                level,
                type: isAnchor ? 'anchor' : 'heading',
                sourceIndex,
            });
        });

        return { items };
    }, [post.content]);

    useEffect(() => {
        if (!tocEntries.items.length) {
            setTocLabelDrafts({});
            return;
        }
        setTocLabelDrafts((drafts) => {
            const next = {};
            tocEntries.items.forEach((item) => {
                const key = tocItemKey(item);
                next[key] = tocEditingKey === key && typeof drafts[key] === 'string' ? drafts[key] : item.text;
            });
            return next;
        });
    }, [tocEntries.items, tocEditingKey]);

    const tocHiddenArr = useMemo(() => Array.isArray(post.tocHidden) ? post.tocHidden : [], [post.tocHidden]);
    const editorStats = useMemo(() => {
        const plainText = (post.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const words = plainText ? plainText.split(' ').filter(Boolean).length : 0;
        const read = readingTime(post.content || '');
        return { words, read: read.text || '0 min read' };
    }, [post.content]);

    const mergedHistoryEntries = useMemo(() => {
        const map = new Map();
        [...cloudHistoryEntries, ...historyEntries].forEach((entry) => {
            const key = `${entry.createdAt}-${entry.label}-${entry.preview}`;
            if (!map.has(key)) map.set(key, entry);
        });
        return Array.from(map.values()).sort(
            (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
        );
    }, [cloudHistoryEntries, historyEntries]);
    const visibleTocEntries = useMemo(() => tocEntries.items.slice(0, tocRowsVisible), [tocEntries.items, tocRowsVisible]);
    const hasMoreTocEntries = tocEntries.items.length > tocRowsVisible;
    const visibleHistoryEntries = useMemo(() => mergedHistoryEntries.slice(0, historyRowsVisible), [mergedHistoryEntries, historyRowsVisible]);
    const hasMoreHistoryEntries = mergedHistoryEntries.length > historyRowsVisible;

    useEffect(() => {
        if (!initialLoadDone.current) return;
        if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
        historyDebounceRef.current = setTimeout(() => {
            if (restoreInProgressRef.current) {
                restoreInProgressRef.current = false;
                return;
            }
            pushHistorySnapshot('Auto snapshot');
        }, 1200);
        return () => {
            if (historyDebounceRef.current) clearTimeout(historyDebounceRef.current);
        };
    }, [
        post.title,
        post.excerpt,
        post.content,
        post.slug,
        post.authorName,
        post.authorTitle,
        post.authorImage,
        post.featuredImage,
        post.featuredImageCaption,
        post.featuredImageAlt,
        post.featuredImageCredit,
        post.featuredBadges,
        post.tocHidden,
        pushHistorySnapshot,
    ]);

    const unhideFromToc = useCallback((text) => {
        const normalized = normalizeLabel(text);
        setPost((p) => ({
            ...p,
            tocHidden: (Array.isArray(p.tocHidden) ? p.tocHidden : []).filter(
                (t) => normalizeLabel(t) !== normalized
            ),
        }));
    }, []);

    const updateFeaturedBadge = useCallback((index, value) => {
        setPost((prev) => {
            const current = Array.isArray(prev.featuredBadges) ? prev.featuredBadges.slice(0, 2) : [];
            while (current.length < 2) current.push('');
            current[index] = value;
            return { ...prev, featuredBadges: current };
        });
    }, []);

    const renameTocEntry = useCallback((item, nextText) => {
        const label = (nextText || '').replace(/\s+/g, ' ').trim();
        if (!label) {
            setTocLabelDrafts((drafts) => ({ ...drafts, [tocItemKey(item)]: item.text }));
            return;
        }

        setPost((p) => {
            if (!p.content) return p;
            const div = document.createElement('div');
            div.innerHTML = p.content;
            const nodes = Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3'));
            const target = nodes[item.sourceIndex];
            if (!target) return p;

            let previous = '';
            if (item.type === 'anchor') {
                previous = (target.getAttribute('data-toc-label') || target.textContent || '').replace(/\s+/g, ' ').trim();
                target.setAttribute('data-toc-label', label);
                target.setAttribute('data-toc-anchor', 'true');
                target.textContent = '';
            } else {
                previous = (target.textContent || '').replace(/\s+/g, ' ').trim();
                target.textContent = label;
            }

            const updatedHidden = (Array.isArray(p.tocHidden) ? p.tocHidden : []).map((entry) =>
                normalizeLabel(entry) === normalizeLabel(previous) ? label : entry
            );

            return { ...p, content: withStableTocIds(div.innerHTML), tocHidden: updatedHidden };
        });

        setTocLabelDrafts((drafts) => ({ ...drafts, [tocItemKey(item)]: label }));
    }, []);

    const removeAnchorFromContent = useCallback((sourceIndex) => {
        setPost((p) => {
            if (!p.content) return p;
            const div = document.createElement('div');
            div.innerHTML = p.content;
            const nodes = Array.from(div.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3'));
            const target = nodes[sourceIndex];
            if (!target || !target.matches('span[data-toc-anchor="true"]')) return p;
            const text = target.getAttribute('data-toc-label') || '';
            target.replaceWith(document.createTextNode(text));
            return { ...p, content: withStableTocIds(div.innerHTML) };
        });
    }, []);

    const scrollToTocEntry = useCallback((item) => {
        const root = document.querySelector('.ProseMirror');
        if (!root) return;

        let target = null;
        if (item.id) {
            target = root.querySelector(`[id="${item.id.replace(/"/g, '\\"')}"]`);
        }
        if (!target) {
            const nodes = Array.from(root.querySelectorAll('span[data-toc-anchor="true"], h1, h2, h3'));
            target = nodes[item.sourceIndex] || null;
        }
        if (!target) return;

        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, []);

    const featuredUploadIdRef = useRef(0);
    const authorUploadIdRef = useRef(0);
    const [featuredFileDetails, setFeaturedFileDetails] = useState(null);

    const handleFeaturedImageChange = async (file) => {
        if (!file) {
            setPost((prev) => ({ ...prev, featuredImage: null }));
            setFeaturedFileDetails(null);
            return;
        }
        if (typeof file === 'string') {
            setPost((prev) => ({ ...prev, featuredImage: file }));
            return;
        }

        const currentId = Date.now();
        featuredUploadIdRef.current = currentId;

        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        setFeaturedFileDetails({
            name: file.name,
            size: `${sizeInMB} MB`,
            type: file.type
        });

        // Check if this is a library item (object with url) or a raw file
        if (!file.name && file.url) {
            setPost((prev) => ({
                ...prev,
                featuredImage: file.url,
                featuredImageCaption: file.caption || prev.featuredImageCaption || '',
                featuredImageAlt: file.alt || prev.featuredImageAlt || '',
                featuredImageCredit: file.credit || prev.featuredImageCredit || ''
            }));
            return;
        }

        try {
            setFeaturedUploading(true);
            setFeaturedUploadProgress(0);

            const url = await uploadImage(file, (progress) => {
                if (featuredUploadIdRef.current === currentId) {
                    setFeaturedUploadProgress(progress);
                }
            });

            if (featuredUploadIdRef.current === currentId) {
                setPost((prev) => ({ ...prev, featuredImage: url }));
            }
        } catch (error) {
            if (featuredUploadIdRef.current !== 0) {
                console.error("Upload error caught in component:", error);
                toast?.error?.(`Upload failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            if (featuredUploadIdRef.current === currentId) {
                setFeaturedUploading(false);
                setFeaturedUploadProgress(0);
            }
        }
    };

    const handleCancelFeaturedUpload = () => {
        featuredUploadIdRef.current = 0;
        setFeaturedUploading(false);
        setFeaturedUploadProgress(0);
        setFeaturedFileDetails(null);
        toast?.info?.("Upload cancelled");
    };

    const handleAuthorImageChange = async (file) => {
        if (!file) {
            setPost((prev) => ({ ...prev, authorImage: null }));
            return;
        }
        if (typeof file === 'string') {
            setPost((prev) => ({ ...prev, authorImage: file }));
            return;
        }

        const currentId = Date.now();
        authorUploadIdRef.current = currentId;

        if (!file.name && file.url) {
            setPost((prev) => ({
                ...prev,
                authorImage: file.url
            }));
            return;
        }

        try {
            setAuthorUploading(true);
            setAuthorUploadProgress(0);

            const url = await uploadImage(file, (progress) => {
                if (authorUploadIdRef.current === currentId) {
                    setAuthorUploadProgress(progress);
                }
            });

            if (authorUploadIdRef.current === currentId) {
                setPost((prev) => ({ ...prev, authorImage: url }));
            }
        } catch (error) {
            if (authorUploadIdRef.current !== 0) {
                console.error("Upload error caught in component:", error);
                toast?.error?.(`Upload failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            if (authorUploadIdRef.current === currentId) {
                setAuthorUploading(false);
                setAuthorUploadProgress(0);
            }
        }
    };

    const handleAuthorFileInput = (event) => {
        const file = event.target.files?.[0];
        if (file) handleAuthorImageChange(file);
        event.target.value = '';
    };

    const handleMetadataChange = (field, value) => {
        setPost(p => ({
            ...p,
            [`featuredImage${field.charAt(0).toUpperCase() + field.slice(1)}`]: value
        }));
    };

    const handleBodyImageUpload = async (file) => {
        try {
            setBodyUploading(true);
            const url = await uploadImage(file);
            return url;
        } catch (error) {
            console.error(error);
            return null;
        } finally {
            setBodyUploading(false);
        }
    };

    const handleSave = async (statusOverride) => {
        if (saving) return;
        const status = statusOverride || post.status;
        const now = new Date().toISOString();

        if (!post.title || !post.title.trim()) {
            toast?.error?.("Post title is required.");
            return;
        }

        const badges = (Array.isArray(post.featuredBadges) ? post.featuredBadges : [])
            .map((entry) => (entry || '').trim())
            .filter(Boolean)
            .slice(0, 2);

        const postToSave = {
            ...post,
            content: withStableTocIds(post.content || ''),
            featuredBadges: badges,
            status,
            publishedAt: status === 'published' && !post.publishedAt ? now : post.publishedAt
        };
        const contentSizeBytes = new Blob([postToSave.content || '']).size;
        console.log(`Payload Size Check: ~${(contentSizeBytes / 1024).toFixed(2)} KB`);

        if (contentSizeBytes > 800000) { // ~800KB (Firestore limit is 1MB but we need overhead)
            toast?.error?.("Content is too large. Did you paste a high-res image directly?");
            setSaving(false);
            return;
        }

        try {
            setSaving(true);
            savedRef.current = true;
            setDirty(false);

            // Timeout promise to prevent infinite loading
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Request timed out")), 15000)
            );

            const savePromise = isNew ? createPost(postToSave) : updatePost(id, postToSave);
            const result = await Promise.race([savePromise, timeoutPromise]);
            pushHistorySnapshot(status === 'published' ? 'Published snapshot' : 'Draft snapshot', postToSave);
            const savedPostId = isNew ? result : id;
            await persistHistorySnapshot(savedPostId, status === 'published' ? 'Published snapshot' : 'Draft snapshot', postToSave);

            if (isNew && result) {
                pendingIdRef.current = result;
                navigate(`/admin/posts/${result}/edit`, { replace: true });
            }

            toast?.success?.(status === 'published' ? 'Post published successfully!' : 'Draft saved!');
            setSaving(false);
        } catch (error) {
            console.error("Failed to save post:", error);
            savedRef.current = false;
            setDirty(true);
            setSaving(false);
            if (error.message === "Request timed out") {
                toast?.error?.("The operation timed out. Please check your internet connection.");
            } else {
                toast?.error?.(`Failed to ${status === 'published' ? 'publish' : 'save'}: ${error?.message || 'Unknown error'}`);
            }
        }
    };

    const handlePreview = () => {
        localStorage.setItem('blog_preview_data', JSON.stringify(post));
        window.open('/blog/preview', '_blank', 'noopener,noreferrer');
    };

    const openHistoryPreview = (entry) => setHistoryPreview(entry);

    const restoreFromHistory = async () => {
        if (!historyPreview?.snapshot) return;
        const checkpoint = makeHistorySnapshot(post);
        pushHistorySnapshot('Before restore', post);
        if (!isNew && id) {
            await persistHistorySnapshot(id, 'Before restore', checkpoint);
        }
        restoreInProgressRef.current = true;
        setPost((previous) => ({
            ...previous,
            ...historyPreview.snapshot,
            content: withStableTocIds(historyPreview.snapshot.content || ''),
        }));
        setHistoryPreview(null);
        toast?.success?.('Version restored.');
    };

    const handleManualCheckpoint = async () => {
        const snapshot = makeHistorySnapshot(post);
        pushHistorySnapshot('Manual checkpoint', post);
        if (!isNew && id) {
            await persistHistorySnapshot(id, 'Manual checkpoint', snapshot);
            return;
        }
        toast?.info?.('Saved locally. Cloud history starts after first post save.');
    };

    const headerActions = (
        <>
            <button
                onClick={handlePreview}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] transition-colors text-sm flex items-center gap-2 shadow-sm"
            >
                <Eye size={18} /> Preview
            </button>
            <button
                onClick={() => handleSave('draft')}
                disabled={isUploading || saving}
                className="px-4 py-2 bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-lg font-medium hover:bg-[var(--bg-primary)] transition-colors disabled:opacity-50 text-sm shadow-sm"
            >
                {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
                onClick={() => handleSave('published')}
                disabled={isUploading || saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 text-sm shadow-sm"
            >
                <Save size={18} /> {saving ? 'Saving...' : (post.status === 'published' ? 'Update' : 'Publish')}
            </button>
        </>
    );

    return (
        <div className="flex flex-col min-h-full bg-[var(--bg-primary)]">
            <AdminHeader
                title={post.title || (isNew ? 'New Post' : 'Untitled Post')}
                status={post.status || 'draft'}
                uploading={isUploading}
                actions={headerActions}
            />

            <div className="max-w-[1800px] mx-auto px-4 md:px-6 py-6 w-full">
                <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                    {/* Main Editor */}
                    <div className="xl:col-span-3 space-y-6">
                        <input
                            type="text"
                            placeholder="Post Title"
                            className="w-full bg-transparent text-3xl font-extrabold text-[var(--text-primary)] placeholder-[var(--text-secondary)] border-none focus:outline-none focus:ring-0 px-0"
                            value={post.title}
                            onChange={(e) => setPost({ ...post, title: e.target.value })}
                            autoFocus
                        />

                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4">
                            <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-3">Featured Image</label>
                            <ImageUploader
                                image={post.featuredImage}
                                onChange={handleFeaturedImageChange}
                                uploading={featuredUploading}
                                onCancel={handleCancelFeaturedUpload}
                                progress={featuredUploadProgress}
                                fileDetails={featuredFileDetails}
                                recommendedText="1200 x 630px"
                                metadata={{
                                    caption: post.featuredImageCaption,
                                    alt: post.featuredImageAlt,
                                    credit: post.featuredImageCredit
                                }}
                                onMetadataChange={handleMetadataChange}
                                height="h-72 lg:h-80"
                            />

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Image badge #1 (e.g. Featured)"
                                    value={Array.isArray(post.featuredBadges) ? (post.featuredBadges[0] || '') : ''}
                                    onChange={(e) => updateFeaturedBadge(0, e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                    placeholder="Image badge #2 (e.g. Editor Pick)"
                                    value={Array.isArray(post.featuredBadges) ? (post.featuredBadges[1] || '') : ''}
                                    onChange={(e) => updateFeaturedBadge(1, e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="prose-container bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl overflow-visible shadow-soft">
                            <RichTextEditor
                                content={post.content}
                                onChange={replacePostContent}
                                onImageUpload={handleBodyImageUpload}
                            />
                        </div>

                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl px-4 py-3 flex items-center gap-4 text-xs text-[var(--text-secondary)]">
                            <span>{editorStats.words} words</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border-color)]" />
                            <span>{editorStats.read}</span>
                            <span className="ml-auto">Shortcut: `Ctrl/Cmd + S` to save draft</span>
                        </div>
                    </div>

                    {/* Sidebar Settings */}
                    <div className="xl:col-span-1">
                        <div className="xl:sticky xl:top-[5.25rem] xl:h-[calc(100vh-6.25rem)]">
                        <div
                            data-lenis-prevent
                            className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 shadow-soft h-full overflow-y-auto thin-scrollbar"
                        >
                            <button
                                type="button"
                                onClick={() => setSettingsOpen((v) => !v)}
                                className="flex items-center justify-between w-full text-left"
                            >
                                <span className="font-bold text-[var(--text-primary)] text-base">
                                    Post Settings
                                </span>
                                {settingsOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                            </button>

                            {settingsOpen && (
                            <div className="space-y-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author</label>
                                    <div className="flex items-center gap-2">
                                        <div className="relative z-20" ref={authorPhotoMenuRef}>
                                            <button
                                                type="button"
                                                onClick={() => setAuthorPhotoMenuOpen((v) => !v)}
                                                className="w-10 h-10 rounded-full border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors overflow-hidden flex items-center justify-center"
                                                title="Author photo options"
                                            >
                                                {post.authorImage ? (
                                                    <img src={post.authorImage} alt={post.authorName || 'Author'} className="w-full h-full object-cover" />
                                                ) : (
                                                    <Camera size={16} />
                                                )}
                                            </button>

                                            <ImageSourceMenu
                                                open={authorPhotoMenuOpen}
                                                onClose={() => setAuthorPhotoMenuOpen(false)}
                                                onUploadFromComputer={() => authorPhotoInputRef.current?.click()}
                                                onOpenLibrary={() => setAuthorPhotoLibraryOpen(true)}
                                                anchorRef={authorPhotoMenuRef}
                                                portal
                                            />

                                            <input
                                                ref={authorPhotoInputRef}
                                                type="file"
                                                className="hidden"
                                                accept="image/*"
                                                onChange={handleAuthorFileInput}
                                            />
                                        </div>

                                        <input
                                            type="text"
                                            className="flex-1 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                            value={post.authorName || ''}
                                            onChange={(e) => setPost({ ...post, authorName: e.target.value })}
                                            placeholder="e.g. John Doe"
                                        />

                                        {post.authorImage && (
                                            <button
                                                type="button"
                                                onClick={() => handleAuthorImageChange(null)}
                                                className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                                                title="Remove author photo"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    {authorUploading && (
                                        <div className="mt-2 text-[10px] text-blue-400">
                                            Uploading author photo... {Math.round(authorUploadProgress)}%
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Author Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                        value={post.authorTitle || ''}
                                        onChange={(e) => setPost({ ...post, authorTitle: e.target.value })}
                                        placeholder="e.g. Senior Editor"
                                    />
                                </div>

                                <hr className="border-[var(--border-color)] my-4" />

                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Slug</label>
                                    <input
                                        type="text"
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 transition-colors"
                                        value={post.slug}
                                        onChange={(e) => setPost({ ...post, slug: e.target.value })}
                                        placeholder="auto-generated-slug"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">Excerpt</label>
                                    <textarea
                                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                                        value={post.excerpt}
                                        onChange={(e) => setPost({ ...post, excerpt: e.target.value })}
                                        placeholder="Short summary for search engines..."
                                    />
                                </div>
                            </div>
                            )}
                            <hr className="border-[var(--border-color)]" />

                        <div className="pt-1">
                                <button
                                    type="button"
                                    onClick={() => setTocOpen((v) => !v)}
                                    className="flex items-center justify-between w-full text-left shrink-0"
                                >
                                    <span className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm">
                                        <List size={16} className="text-blue-500" />
                                        Table of Contents
                                        {tocEntries.items.length > 0 && (
                                            <span className="ml-1 text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold">
                                                {tocEntries.items.filter((item) => {
                                                    if (item.type === 'anchor') return true;
                                                    return !tocHiddenArr.some((t) => normalizeLabel(t) === normalizeLabel(item.text));
                                                }).length}
                                            </span>
                                        )}
                                    </span>
                                    {tocOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                                </button>

                                {tocOpen && (
                                    <div className="mt-2 space-y-2">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Rows</span>
                                            <div className="flex items-center gap-1">
                                                {[4, 7, 12].map((size) => (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => setTocRowsVisible(size)}
                                                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${tocRowsVisible === size
                                                            ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                                                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setTocRowsVisible(Math.max(tocEntries.items.length, 1))}
                                                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${(tocRowsVisible >= tocEntries.items.length && tocEntries.items.length > 0)
                                                        ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                                                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
                                                >
                                                    All
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-2 overflow-y-auto pr-1 thin-scrollbar max-h-[35vh]">
                                            {visibleTocEntries.length > 0 && visibleTocEntries.map((item) => {
                                                const isHeading = item.type === 'heading';
                                                const isHidden = isHeading && tocHiddenArr.some((t) => normalizeLabel(t) === normalizeLabel(item.text));
                                                const isSub = item.level === 'h3' || item.level === 'sub';
                                                const key = tocItemKey(item);

                                                return (
                                                    <div
                                                        key={key}
                                                        className={`flex items-center gap-2 bg-[var(--bg-primary)] border border-[var(--border-color)] rounded-lg px-2.5 py-2 group ${isHidden ? 'opacity-50' : ''} ${isSub ? 'ml-4 border-l-2 border-l-blue-400' : ''}`}
                                                        onClick={(event) => {
                                                            if (event.target.closest('input') || event.target.closest('button')) return;
                                                            scrollToTocEntry(item);
                                                        }}
                                                    >
                                                        {isHeading ? (
                                                            <Hash size={12} className={`shrink-0 ${item.level === 'h1' ? 'text-blue-500' : item.level === 'h2' ? 'text-blue-400' : 'text-blue-300'}`} />
                                                        ) : (
                                                            <div className="text-blue-400 shrink-0 select-none">↳</div>
                                                        )}
                                                        <input
                                                            value={tocLabelDrafts[key] ?? item.text}
                                                            onFocus={() => setTocEditingKey(key)}
                                                            onChange={(e) => setTocLabelDrafts((drafts) => ({ ...drafts, [key]: e.target.value }))}
                                                            onBlur={(e) => {
                                                                renameTocEntry(item, e.target.value);
                                                                setTocEditingKey((current) => (current === key ? null : current));
                                                            }}
                                                            className={`text-xs flex-1 bg-transparent focus:outline-none ${isHidden ? 'line-through text-[var(--text-secondary)]' : 'text-[var(--text-primary)]'}`}
                                                            title="Edit TOC text"
                                                        />
                                                        {isHeading && (
                                                            <span className="text-[10px] text-[var(--text-secondary)] uppercase font-bold shrink-0">{item.level}</span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={() => scrollToTocEntry(item)}
                                                            className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-blue-400 transition-all"
                                                            title="Jump to this section"
                                                        >
                                                            <Navigation size={12} />
                                                        </button>
                                                        {isHeading ? (
                                                            isHidden ? (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => unhideFromToc(item.text)}
                                                                    className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-green-400 transition-all"
                                                                    title="Show in TOC"
                                                                >
                                                                    <Eye size={12} />
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        setPost((current) => {
                                                                            const existing = Array.isArray(current.tocHidden) ? current.tocHidden : [];
                                                                            if (existing.some((entry) => normalizeLabel(entry) === normalizeLabel(item.text))) return current;
                                                                            return { ...current, tocHidden: [...existing, item.text] };
                                                                        });
                                                                    }}
                                                                    className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-yellow-400 transition-all"
                                                                    title="Hide from TOC"
                                                                >
                                                                    <EyeOff size={12} />
                                                                </button>
                                                            )
                                                        ) : (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeAnchorFromContent(item.sourceIndex)}
                                                                className="opacity-0 group-hover:opacity-100 text-[var(--text-secondary)] hover:text-red-400 transition-all"
                                                                title="Remove custom TOC entry"
                                                            >
                                                                <X size={12} />
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}

                                            {tocEntries.items.length === 0 && (
                                                <p className="text-xs text-[var(--text-secondary)] italic">No TOC entries yet. Add headings or use the cursor TOC action in editor.</p>
                                            )}
                                        </div>
                                        {hasMoreTocEntries && (
                                            <p className="text-[10px] text-[var(--text-secondary)]">+{tocEntries.items.length - visibleTocEntries.length} more entries hidden by row limit.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="pt-2 border-t border-[var(--border-color)]">
                                <div className="flex items-center justify-between mb-3 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setHistoryOpen((v) => !v)}
                                        className="flex items-center gap-2 text-left"
                                    >
                                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-2 text-sm">
                                            <History size={15} className="text-blue-400" />
                                            Change History
                                        </span>
                                        {historyOpen ? <ChevronUp size={14} className="text-[var(--text-secondary)]" /> : <ChevronDown size={14} className="text-[var(--text-secondary)]" />}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleManualCheckpoint}
                                        className="text-[10px] px-2 py-1 rounded-md border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors"
                                    >
                                        Save Point
                                    </button>
                                </div>
                                {historyOpen && (
                                    <>
                                        <div className="flex items-center gap-2 mb-2 text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                                            <Cloud size={11} className="text-blue-400" />
                                            <span>Cloud history</span>
                                            {historySyncing && <Loader2 size={11} className="animate-spin text-blue-400" />}
                                        </div>
                                        <div className="flex items-center justify-between gap-2 mb-2">
                                            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Rows</span>
                                            <div className="flex items-center gap-1">
                                                {[4, 8, 12].map((size) => (
                                                    <button
                                                        key={size}
                                                        type="button"
                                                        onClick={() => setHistoryRowsVisible(size)}
                                                        className={`text-[10px] px-2 py-1 rounded border transition-colors ${historyRowsVisible === size
                                                            ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                                                            : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                ))}
                                                <button
                                                    type="button"
                                                    onClick={() => setHistoryRowsVisible(Math.max(mergedHistoryEntries.length, 1))}
                                                    className={`text-[10px] px-2 py-1 rounded border transition-colors ${(historyRowsVisible >= mergedHistoryEntries.length && mergedHistoryEntries.length > 0)
                                                        ? 'border-blue-500/50 bg-blue-500/15 text-blue-300'
                                                        : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'}`}
                                                >
                                                    All
                                                </button>
                                            </div>
                                        </div>
                                        {mergedHistoryEntries.length === 0 ? (
                                            <p className="text-xs text-[var(--text-secondary)] italic">Snapshots appear while you edit. Cloud snapshots are saved on manual checkpoints and post saves.</p>
                                        ) : (
                                            <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1 thin-scrollbar">
                                                {visibleHistoryEntries.map((entry) => (
                                                    <button
                                                        key={entry.id}
                                                        type="button"
                                                        onClick={() => openHistoryPreview(entry)}
                                                        className="w-full text-left rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] px-3 py-2 hover:border-blue-500/45 transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">{entry.label}</span>
                                                            <div className="flex items-center gap-2 shrink-0">
                                                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full border ${entry.source === 'cloud'
                                                                    ? 'text-blue-300 border-blue-400/30 bg-blue-500/10'
                                                                    : 'text-[var(--text-secondary)] border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}
                                                                >
                                                                    {entry.source === 'cloud' ? 'Cloud' : 'Local'}
                                                                </span>
                                                                <span className="text-[10px] text-[var(--text-secondary)]">
                                                                    {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        {entry.preview && (
                                                            <p className="mt-1 text-[10px] text-[var(--text-secondary)] line-clamp-2">{entry.preview}</p>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                        {hasMoreHistoryEntries && (
                                            <p className="mt-2 text-[10px] text-[var(--text-secondary)]">+{mergedHistoryEntries.length - visibleHistoryEntries.length} more snapshots hidden by row limit.</p>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div >
            </div >
            </div >

            <MediaLibraryModal
                isOpen={authorPhotoLibraryOpen}
                onClose={() => setAuthorPhotoLibraryOpen(false)}
                onSelect={handleAuthorImageChange}
            />

            {historyPreview && (
                <div className="fixed inset-0 z-[130] bg-black/75 backdrop-blur-sm p-4 flex items-center justify-center">
                    <div className="w-full max-w-2xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-xl shadow-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Preview Restore Point</h3>
                                <p className="text-xs text-[var(--text-secondary)]">
                                    {historyPreview.label} • {new Date(historyPreview.createdAt).toLocaleString()}
                                </p>
                                <p className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">
                                    Source: {historyPreview.source === 'cloud' ? 'Cloud history' : 'Local session'}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setHistoryPreview(null)}
                                className="p-2 rounded-lg hover:bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        <div className="rounded-lg border border-[var(--border-color)] bg-[var(--bg-primary)] p-3 space-y-2">
                            <p className="text-sm text-[var(--text-primary)] font-semibold">{historyPreview.snapshot.title || 'Untitled post'}</p>
                            {historyPreview.snapshot.excerpt && (
                                <p className="text-xs text-[var(--text-secondary)]">{historyPreview.snapshot.excerpt}</p>
                            )}
                            <p className="text-xs text-[var(--text-secondary)]">
                                {htmlToPlainText(historyPreview.snapshot.content).slice(0, 280) || 'No content in this snapshot.'}
                            </p>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setHistoryPreview(null)}
                                className="px-4 py-2 rounded-lg border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)] transition-colors text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={restoreFromHistory}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm inline-flex items-center gap-2"
                            >
                                <RotateCcw size={14} />
                                Restore This Version
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};

export default PostEditor;
