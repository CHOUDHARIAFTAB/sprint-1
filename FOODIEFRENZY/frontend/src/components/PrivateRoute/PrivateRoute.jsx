// frontend/src/components/PrivateRoute/PrivateRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    // THE FIX: Check for the real 'authToken', not 'loginData'
    const isAuthenticated = Boolean(localStorage.getItem('authToken'));
    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default PrivateRoute;