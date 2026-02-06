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
import { ref, deleteObject } from 'firebase/storage';
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

        console.log("createPost: Initiating write...", { title: postData.title, slug });

        try {
            const payload = {
                ...postData,
                slug,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
                publishedAt: postData.status === 'published' ? serverTimestamp() : null
            };

            console.log("createPost: Payload prepared", payload);

            const newPostRef = await addDoc(collection(db, 'posts'), payload);
            console.log("createPost: Write success!", newPostRef.id);
            return newPostRef.id;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    };

    const updatePost = async (id, updates) => {
        console.log(`updatePost: Updating ${id}...`, updates);
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

            console.log("updatePost: Payload prepared", updateData);

            await updateDoc(postRef, updateData);
            console.log("updatePost: Write success!");
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

    // --- CLOUDINARY UPLOAD IMPLEMENTATION ---
    const uploadImage = (file, onProgress) => {
        if (!file) return Promise.resolve(null);

        return new Promise((resolve, reject) => {
            const cloudName = 'dtwpubykd';
            const uploadPreset = 'dodohabit_uploads';

            const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const xhr = new XMLHttpRequest();

            // Open POST request
            xhr.open('POST', url, true);

            // Track progress
            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable && onProgress) {
                    const progress = (e.loaded / e.total) * 100;
                    onProgress(progress);
                }
            };

            // Handle response
            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    const downloadURL = response.secure_url;

                    // Resolve IMMEDIATELY so the UI updates
                    resolve(downloadURL);

                    // Save metadata in background (fire and forget)
                    // This way if Firestore rules fail, it doesn't block the user
                    if (db) {
                        console.log("Saving media metadata to Firestore...", { url: downloadURL });
                        addDoc(collection(db, 'media'), {
                            url: downloadURL,
                            path: response.public_id,
                            filename: file.name,
                            originalName: file.name,
                            type: file.type,
                            size: file.size,
                            source: 'cloudinary',
                            uploadedAt: serverTimestamp()
                        })
                            .then((docRef) => console.log("Media metadata saved with ID:", docRef.id))
                            .catch(err => {
                                console.error("CRITICAL: Background metadata save failed:", err);
                                // Verify if it's a permission issue
                                if (err.code === 'permission-denied') {
                                    console.error("This is likely a Firestore Rules issue. Check the Rules tab in Firebase Console.");
                                }
                            });
                    }
                } else {
                    console.error("Cloudinary Error:", xhr.responseText);
                    reject(new Error(`Cloudinary Upload Failed: ${xhr.statusText}`));
                }
            };

            xhr.onerror = () => {
                reject(new Error("Network error during upload"));
            };

            xhr.send(formData);
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
