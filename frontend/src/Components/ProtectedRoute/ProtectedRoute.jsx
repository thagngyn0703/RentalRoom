import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
    const { login } = useSelector((state) => state.auth);
    const { currentUser, accessToken } = login;

    if (!currentUser ) {
        return <Navigate to="/login" replace />;
    }

    if (requireAdmin && currentUser?.role !== 'admin') {
        return <Navigate to="/no-permission" replace />;
    }

    return children;
};

export default ProtectedRoute;
