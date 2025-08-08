import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerificationPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your email address...');
    const hasVerified = useRef(false); // Prevent duplicate requests in React 18 strict mode

    useEffect(() => {
        // This check prevents the verification from running twice in development
        if (hasVerified.current) return;
        hasVerified.current = true;

        const token = searchParams.get('token');

        if (!token) {
            setStatus('error');
            setMessage('No verification token found. Please check the link from your email.');
            return;
        }

        const verifyToken = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/verify-email.php?token=${token}`);
                
                if (response.data.success) {
                    setStatus('success');
                    setMessage(response.data.message);
                } else {
                    setStatus('error');
                    setMessage(response.data.error || 'An unknown error occurred during verification.');
                }
            } catch (error) {
                setStatus('error');
                const errorMessage = error.response?.data?.error || 'An error occurred during verification. The server response was not valid.';
                setMessage(errorMessage);
            }
        };

        verifyToken();
    }, [searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="max-w-md w-full mx-auto text-center bg-white p-8 rounded-lg shadow-lg">
                {status === 'verifying' && (
                    <>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <h2 className="mt-4 text-2xl font-semibold text-gray-700">{message}</h2>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <FaCheckCircle className="text-green-500 text-6xl mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Verification Successful!</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                        <Link 
                            to="/login" 
                            className="mt-6 inline-block bg-[#0A2463] hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Proceed to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <FaTimesCircle className="text-red-500 text-6xl mx-auto" />
                        <h2 className="mt-4 text-2xl font-bold text-gray-800">Account Verification</h2>
                        <p className="text-gray-600 mt-2">{message}</p>
                         <Link 
                            to="/register" 
                            className="mt-6 inline-block bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
                        >
                            Try Registering Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
