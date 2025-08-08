import React from 'react';
import { useLocation } from 'react-router-dom';

const PleaseVerifyPage = () => {
    const location = useLocation();
    const email = location.state?.email || 'your email address';

    return (
        <div className="max-w-lg mx-auto mt-10 text-center bg-white p-8 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold text-[#0A2463] mb-4">Thank You for Registering!</h1>
            <p className="text-lg text-gray-700">
                A verification link has been sent to <strong className="text-[#0A2463]">{email}</strong>.
            </p>
            <p className="mt-4 text-gray-600">
                Please click the link in the email to activate your account. You will not be able to log in until your account is verified.
            </p>
        </div>
    );
};

export default PleaseVerifyPage;
