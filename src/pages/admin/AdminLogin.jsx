import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/admin';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            await login(username, password);
            navigate(from, { replace: true });
        } catch (err) {
            console.error(err);
            if (err.code === 'auth/invalid-credential') {
                setError('Invalid email or password.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Too many failed attempts. Please try again later.');
            } else {
                // Show the actual error message for debugging
                setError(`Login Failed: ${err.message}`);
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-[#111] border border-gray-800 rounded-2xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto flex items-center justify-center mb-4">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Admin Access</h1>
                    <p className="text-gray-400">Please sign in to continue</p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="text-gray-500" size={18} />
                            </div>
                            <input
                                type="email"
                                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Enter admin email"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm font-medium mb-2">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="text-gray-500" size={18} />
                            </div>
                            <input
                                type="password"
                                className="w-full bg-[#0A0A0A] border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-lg shadow-blue-600/20"
                    >
                        Sign In
                    </button>
                </form>

                <div className="mt-6 text-center text-xs text-gray-600">
                    &copy; 2026 Dodohabit. Secure Area.
                </div>
            </motion.div>
        </div>
    );
};

export default AdminLogin;
