import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // On initial load, try to get user and token from localStorage
        try {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('token');

            if (storedUser && storedToken) {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            }
        } catch (error) {
            console.error("Failed to parse auth data from localStorage", error);
            // Clear corrupted storage
            localStorage.removeItem('user');
            localStorage.removeItem('token');
        } finally {
            setLoading(false); // Finished loading auth state
        }
    }, []);

    const login = (userData, userToken) => {
        // --- THIS IS THE FIX ---
        // Ensure both user and token are set in state and localStorage
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    };

    const logout = () => {
        // Clear both user and token from state and localStorage
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    // The context value now provides the token correctly
    const value = { user, token, login, logout, loading };

    // Don't render children until the initial auth state has been loaded
    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
