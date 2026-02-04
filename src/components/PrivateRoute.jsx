import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center text-white">Loading...</div>;
    }

    return isAuthenticated ? (
        <Outlet />
    ) : (
        <Navigate to="/admin/login" state={{ from: location }} replace />
    );
};

export default PrivateRoute;
