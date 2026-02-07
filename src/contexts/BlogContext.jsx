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
import { storage, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { restAddDoc, restAddDocPublic, restUpdateDoc, restDeleteDoc, restGetDocs } from '../utils/firestoreRest';

const BlogContext = createContext(null);

export const useBlog = () => useContext(BlogContext);

export const BlogProvider = ({ children }) => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [media, setMedia] = useState([]);
    const [feedback, setFeedback] = useState([]);

    // Track auth state
    useEffect(() => {
        if (!auth) return;
        const unsub = onAuthStateChanged(auth, (u) => {
            console.log("BlogContext: Auth State Changed", u ? `User: ${u.email} (${u.uid})` : "No User");
            setUser(u);
        });
        return unsub;
    }, []);

    // Data Fetching via REST (Socket Bypass)
    const fetchData = async () => {
        // Allow public fetch (REST utility now handles unauthenticated requests)
        // if (!user) return; 

        setLoading(true);
        console.log("BlogContext: Fetching data via REST...");

        try {
            const postsData = await restGetDocs('posts');
            postsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setPosts(postsData);
            console.log(`BlogContext: Fetched ${postsData.length} posts`);
        } catch (error) {
            console.error("BlogContext: Error fetching posts:", error);
        }

        try {
            const mediaData = await restGetDocs('media');
            mediaData.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
            setMedia(mediaData);
            console.log(`BlogContext: Fetched ${mediaData.length} media items`);
        } catch (error) {
            console.error("BlogContext: Error fetching media:", error);
        }

        try {
            if (!user) {
                setFeedback([]);
            } else {
                const feedbackData = await restGetDocs('feedback');
                feedbackData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setFeedback(feedbackData);
                console.log(`BlogContext: Fetched ${feedbackData.length} feedback items`);
            }
        } catch (error) {
            console.error("BlogContext: Error fetching feedback:", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial Fetch when app loads (auth state change or not)
    useEffect(() => {
        fetchData();

        // If user logs in later, we might want to re-fetch to see protected drafts if we implemented that,
        // but for now the main priority is ensuring public users see content.
        // We'll keep the dependency on `user` to re-fetch if auth state changes (e.g. login as admin)
    }, [user]);

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
                createdAt: new Date(),
                updatedAt: new Date(),
                publishedAt: postData.status === 'published' ? new Date() : null
            };

            console.log("createPost: Payload prepared", payload);

            // Use REST Add
            const newPost = await restAddDoc('posts', payload);
            console.log("createPost: REST Write success!", newPost.id);
            fetchData(); // Refresh list
            return newPost.id;
        } catch (error) {
            console.error("Error creating post:", error);
            throw error;
        }
    };

    const updatePost = async (id, updates) => {
        console.log(`updatePost: Updating ${id}...`, updates);
        try {
            const updateData = {
                ...updates,
                updatedAt: new Date()
            };

            if (updates.slug) {
                updateData.slug = createSlug(updates.slug);
            } else if (updates.title && !getPostById(id)?.slug) {
                // Only auto-generate if no slug exists (fallback)
                updateData.slug = createSlug(updates.title);
            }

            if (updates.status === 'published' && !getPostById(id)?.publishedAt) {
                updateData.publishedAt = new Date();
            }

            console.log("updatePost: Payload prepared", updateData);

            await restUpdateDoc('posts', id, updateData);
            console.log("updatePost: REST Write success!");
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error updating post:", error);
            throw error;
        }
    };

    const deletePost = async (id) => {
        try {
            await restDeleteDoc('posts', id);
            fetchData(); // Refresh list
        } catch (error) {
            console.error("Error deleting post:", error);
            throw error;
        }
    };

    const submitFeedback = async (feedbackData) => {
        try {
            const payload = {
                ...feedbackData,
                status: feedbackData.status || 'new',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            const created = await restAddDocPublic('feedback', payload);
            if (user) fetchData();
            return created?.id;
        } catch (error) {
            console.error("Error submitting feedback:", error);
            throw error;
        }
    };

    const updateFeedback = async (id, updates) => {
        try {
            await restUpdateDoc('feedback', id, { ...updates, updatedAt: new Date() });
            fetchData();
        } catch (error) {
            console.error("Error updating feedback:", error);
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
                        console.log("Saving media metadata to Firestore (REST)...", { url: downloadURL });
                        restAddDoc('media', {
                            url: downloadURL,
                            path: response.public_id,
                            filename: file.name,
                            originalName: file.name,
                            type: file.type,
                            size: file.size,
                            source: 'cloudinary',
                            uploadedAt: new Date()
                        })
                            .then((res) => {
                                console.log("Media metadata saved with ID:", res.id);
                                fetchData(); // Refresh media library
                            })
                            .catch(err => {
                                console.error("CRITICAL: Background metadata save failed:", err);
                                if (err.message && err.message.includes('permission-denied')) {
                                    console.error("This is likely a Firestore Rules issue.");
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



    const deleteMedia = async (mediaItem) => {
        try {
            // Delete from Firestore via REST
            await restDeleteDoc('media', mediaItem.id);
            fetchData(); // Refresh list
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

    const testFirestore = async () => {
        console.log("--- FIRESTORE DIAGNOSTIC START ---");
        console.log("Time:", new Date().toISOString());
        console.log("Auth User:", auth?.currentUser?.email || "NOT LOGGED IN");

        // Short timeout for test
        const testTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Diagnostic timeout (10s)")), 10000)
        );

        try {
            console.log("Step 1: Simple write to 'media' (WITHOUT serverTimestamp)...");
            const testRef = await Promise.race([
                addDoc(collection(db, 'media'), {
                    url: 'https://example.com/test.jpg',
                    test: true,
                    manualTime: new Date().toISOString()
                }),
                testTimeout
            ]);
            console.log("STEP 1 SUCCESS! ID:", testRef.id);

            console.log("Step 2: Write with serverTimestamp...");
            const tsRef = await Promise.race([
                addDoc(collection(db, 'media'), {
                    url: 'https://example.com/test2.jpg',
                    test: true,
                    uploadedAt: serverTimestamp()
                }),
                testTimeout
            ]);
            console.log("STEP 2 SUCCESS! ID:", tsRef.id);

            return true;
        } catch (err) {
            console.error("DIAGNOSTIC FAILED AT STEP:", err.message);

            // Step 3: REST API Fallback (The "200iq" move)
            if (err.message.includes("diagnostic timeout") || err.message.includes("Diagnostic timeout")) {
                console.log("--- ATTEMPTING EMERGENCY REST API TEST ---");
                try {
                    const token = await auth.currentUser.getIdToken();
                    const projectId = auth.app.options.projectId;
                    // Target 'media' collection which SHOULD be allowed by rules
                    const restUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/media`;

                    console.log(`Sending REST request to: ${restUrl}`);

                    const response = await fetch(restUrl, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            fields: {
                                test: { booleanValue: true },
                                uploadedAt: { timestampValue: new Date().toISOString() },
                                originalName: { stringValue: "REST_TEST_ENTRY" },
                                user: { stringValue: auth.currentUser.email }
                            }
                        })
                    });

                    if (response.ok) {
                        const data = await response.json();
                        console.log("✅ REST WRITE SUCCESS!", data);
                        console.log("CONCLUSION: Your Project ID and Rules are CORRECT. The issue is purely the Firebase SDK Connection (likely blocked by a firewall or proxy).");
                        console.log("RECOMMENDATION: We can switch to using REST for writes if this persists.");
                        alert("REST API Write SUCCEEDED! The app is blocked by a network firewall, but the database works.");
                        return true;
                    } else {
                        const errText = await response.text();
                        console.error("❌ REST WRITE FAILED:", response.status, errText);
                        console.log("CONCLUSION: This is a Server-Side issue (Rules, Project ID, or Quotas).");
                        alert(`REST Failed: ${response.status}. Check console for details.`);
                        return false;
                    }
                } catch (restErr) {
                    console.error("❌ REST NETWORK FAIL:", restErr);
                    return false;
                }
            }

            if (err.message.includes("Diagnostic timeout")) {
                console.warn("ADVICE: Long Polling is enabled, but the write still timed out. This usually means a strict corporate firewall or an invalid Project ID in .env");
            }
            return false;
        } finally {
            console.log("--- FIRESTORE DIAGNOSTIC END ---");
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
            feedback,
            submitFeedback,
            updateFeedback,
            loading,
            testFirestore
        }}>
            {children}
        </BlogContext.Provider>
    );
};
