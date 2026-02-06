import React, { createContext, useContext, useState, useEffect } from 'react';
import { db } from '../firebase';
import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    onSnapshot,
    query,
    orderBy,
    serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../firebase';

const BlogContext = createContext(null);

export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Real-time subscription to posts
    useEffect(() => {
        // If db is not initialized, skip subscription
        if (!db) {
            setLoading(false);
            return;
        }

        const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const postsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                // Safely handle timestamps (pending writes can be null)
                createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : new Date().toISOString(),
                updatedAt: doc.data().updatedAt?.toDate ? doc.data().updatedAt.toDate().toISOString() : new Date().toISOString(),
                publishedAt: doc.data().publishedAt?.toDate ? doc.data().publishedAt.toDate().toISOString() : null
            }));

            setPosts(postsData);
            setLoading(false);
        }, (error) => {
            console.error("Error fetching posts:", error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const getPost = (slug) => {
        return posts.find(post => post.slug === slug);
    };

    const getPostById = (id) => {
        return posts.find(post => post.id === id);
    };

    const createPost = async (postData) => {
        // Use provided slug or generate from title
        const slug = postData.slug && postData.slug.trim() !== ''
            ? createSlug(postData.slug)
            : createSlug(postData.title);

        // For production, we should upload image to Storage and get URL
        // Currently utilizing Base64 directly into Firestore (limit 1MB per doc)
        // If images are large, this might fail. 
        // TODO: Implement Firebase Storage upload here

        try {
            const newPostRef = await addDoc(collection(db, 'posts'), {
                ...postData,
                slug,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                publishedAt: postData.status === 'published' ? serverTimestamp() : null
            });
            return newPostRef.id;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    };

    const updatePost = async (id, updates) => {
        try {
            const postRef = doc(db, 'posts', id);

            const updateData = {
                ...updates,
                updatedAt: serverTimestamp()
            };

            if (updates.slug) {
                updateData.slug = createSlug(updates.slug);
            } else if (updates.title && !getPostById(id)?.slug) {
                // Only auto-generate if no slug exists (fallback)
                updateData.slug = createSlug(updates.title);
            }

            if (updates.status === 'published' && !getPostById(id)?.publishedAt) {
                updateData.publishedAt = serverTimestamp();
            }

            await updateDoc(postRef, updateData);
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    };

    const deletePost = async (id) => {
        try {
            await deleteDoc(doc(db, 'posts', id));
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    };

    const createSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const getPublishedPosts = () => {
        return posts
            .filter(post => post.status === 'published');
    };

    const uploadImage = (file, onProgress) => {
        if (!file) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            try {
                // Create a unique filename: timestamp_filename
                const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
                const storagePath = `blog_images/${filename}`;
                const storageRef = ref(storage, storagePath);

                const uploadTask = uploadBytesResumable(storageRef, file);

                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        if (onProgress) {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            onProgress(progress);
                        }
                    },
                    (error) => {
                        console.error("Error uploading image:", error);
                        reject(error);
                    },
                    async () => {
                        try {
                            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                            // Save to Firestore 'media' collection for the library
                            await addDoc(collection(db, 'media'), {
                                url: downloadURL,
                                path: storagePath,
                                filename: filename,
                                originalName: file.name,
                                type: file.type,
                                size: file.size,
                                uploadedAt: serverTimestamp()
                            });

                            resolve(downloadURL);
                        } catch (err) {
                            console.error("Error saving media metadata:", err);
                            reject(err);
                        }
                    }
                );
            } catch (error) {
                console.error("Error initiating upload:", error);
                reject(error);
            }
        });
    };

    // Media state and subscription
    const [media, setMedia] = useState([]);
    useEffect(() => {
        const q = query(collection(db, 'media'), orderBy('uploadedAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMedia(snapshot.docs.map(d => ({
                id: d.id,
                ...d.data(),
                uploadedAt: d.data().uploadedAt?.toDate().toISOString() || new Date().toISOString()
            })));
        });
        return () => unsubscribe();
    }, []);

    const deleteMedia = async (mediaItem) => {
        try {
            // Delete from Firestore
            await deleteDoc(doc(db, 'media', mediaItem.id));
            // Delete from Storage
            if (mediaItem.path) {
                const storageRef = ref(storage, mediaItem.path);
                await deleteObject(storageRef);
            }
        } catch (error) {
            console.error("Error deleting media:", error);
            throw error;
        }
    };

    return (
        <BlogContext.Provider value={{
            posts,
            getPost,
            getPostById,
            createPost,
            updatePost,
            deletePost,
            getPublishedPosts,
            uploadImage,
            media,
            deleteMedia,
            loading
        }}>
            {children}
        </BlogContext.Provider>
    );
};
