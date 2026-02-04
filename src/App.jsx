import React, { useEffect } from 'react';
import Lenis from '@studio-freight/lenis';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { BlogProvider } from './contexts/BlogContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HelmetProvider } from 'react-helmet-async';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import BackgroundEffects from './components/BackgroundEffects';
import PrivateRoute from './components/PrivateRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import PostsList from './pages/admin/PostsList';
import PostEditor from './pages/admin/PostEditor';
import MediaLibrary from './pages/admin/MediaLibrary';
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import BlogPreview from './pages/BlogPreview';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Feedback from './pages/Feedback';
import DeleteAccount from './pages/DeleteAccount';

const App = () => {
    useEffect(() => {
        const lenis = new Lenis({
            duration: 0.8,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            direction: 'vertical',
            gestureDirection: 'vertical',
            smooth: true,
            mouseMultiplier: 1,
            smoothTouch: false,
            touchMultiplier: 2,
        });

        let rafId;

        function raf(time) {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        }

        rafId = requestAnimationFrame(raf);

        return () => {
            cancelAnimationFrame(rafId);
            lenis.destroy();
        };
    }, []);

    return (
        <HelmetProvider>
            <AuthProvider>
                <BlogProvider>
                    <ThemeProvider>
                        <Router>
                            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col font-sans text-[var(--text-primary)] transition-colors duration-300">
                                <BackgroundEffects />

                                <Routes>
                                    {/* Admin Routes - Custom Layout */}
                                    <Route path="/admin/login" element={<AdminLogin />} />

                                    <Route path="/admin" element={<PrivateRoute />}>
                                        <Route element={<AdminLayout />}>
                                            <Route index element={<AdminDashboard />} />
                                            <Route path="posts" element={<PostsList />} />
                                            <Route path="posts/new" element={<PostEditor />} />
                                            <Route path="posts/:id/edit" element={<PostEditor />} />
                                            <Route path="media" element={<MediaLibrary />} />
                                        </Route>
                                    </Route>

                                    {/* Public Routes - Default Layout */}
                                    <Route path="*" element={
                                        <>
                                            <Navbar />
                                            <main className="flex-grow">
                                                <Routes>
                                                    <Route path="/" element={<Home />} />
                                                    <Route path="/blog" element={<Blog />} />
                                                    <Route path="/blog/:slug" element={<BlogPost />} />
                                                    <Route path="/privacy" element={<Privacy />} />
                                                    <Route path="/terms" element={<Terms />} />
                                                    <Route path="/feedback" element={<Feedback />} />
                                                    <Route path="/delete-account" element={<DeleteAccount />} />
                                                </Routes>
                                            </main>
                                            <Footer />
                                        </>
                                    } />
                                </Routes>
                            </div>
                        </Router>
                    </ThemeProvider>
                </BlogProvider>
            </AuthProvider>
        </HelmetProvider>
    );
};

export default App;
