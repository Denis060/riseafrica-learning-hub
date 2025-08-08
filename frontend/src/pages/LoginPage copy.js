import React, { useState, useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { FaSignInAlt } from 'react-icons/fa';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { user, login } = useContext(AuthContext);
    const navigate = useNavigate();

    // This effect hook handles navigation AFTER the user state is updated.
    // This prevents race conditions and ensures the role is available.
    useEffect(() => {
        if (user) {
            // Use the 'role' property from the user object to redirect.
            switch (user.role) {
                case 'admin':
                    toast.info('Redirecting to Admin Dashboard...');
                    navigate('/admin/dashboard');
                    break;
                case 'tutor':
                    toast.info('Redirecting to Tutor Dashboard...');
                    // Note: Ensure the route '/tutor/dashboard' is set up in App.js
                    navigate('/tutor/dashboard'); 
                    break;
                case 'student':
                default:
                    navigate('/');
                    break;
            }
        }
    }, [user, navigate]);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login.php`, { email, password });

            if (response.data && response.data.success) {
                toast.success('Login successful! Redirecting...');
                // The login function updates the user state, which triggers the useEffect hook.
                login(response.data.user, response.data.token);
            } else {
                toast.error(response.data.message || 'Login failed. Please check your credentials.');
            }
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Could not connect to the server.';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto w-full">
                <h2 className="text-2xl font-bold text-center mb-6 text-[#0A2463]">Login to Your Account</h2>
                <div className="bg-white p-8 rounded-lg shadow-lg">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">Email Address</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                id="email"
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">Password</label>
                            <input
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-[#FFD700]"
                                id="password"
                                type="password"
                                placeholder="******************"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <button
                                className="bg-[#0A2463] hover:bg-opacity-90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition-colors flex items-center justify-center disabled:bg-opacity-70"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? 'Signing in...' : (
                                    <>
                                        <FaSignInAlt className="mr-2" />
                                        Sign In
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                    <p className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                            Register here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
