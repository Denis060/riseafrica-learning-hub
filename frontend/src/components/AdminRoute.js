import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user } = useContext(AuthContext);

    // If there is a user and their role is 'admin', show the page.
    if (user && user.role === 'admin') {
        return children;
    }

    // Otherwise, redirect them to the homepage.
    return <Navigate to="/" />;
};

export default AdminRoute;
                    