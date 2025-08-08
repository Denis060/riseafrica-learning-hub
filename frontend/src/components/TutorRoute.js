import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import TutorLayout from './layout/TutorLayout'; // We will create this next

const TutorRoute = () => {
    const { user, loading } = useContext(AuthContext);

    // Wait until the user's auth status is confirmed
    if (loading) {
        return <div>Loading...</div>; // Or a spinner component
    }

    // Allow access if the user is a 'tutor' OR an 'admin'
    if (!user || (user.role !== 'tutor' && user.role !== 'admin')) {
        // Redirect to home page if not authorized
        return <Navigate to="/" />;
    }

    // If authorized, render the TutorLayout which contains the sidebar and content area
    return <TutorLayout><Outlet /></TutorLayout>;
};

export default TutorRoute;
