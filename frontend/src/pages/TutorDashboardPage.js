import React from 'react';

const TutorDashboardPage = () => {
    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Tutor Dashboard</h1>
            <div className="bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-700">Welcome, Tutor!</h2>
                <p className="text-gray-600 mt-2">
                    This is your dashboard. From here, you can manage your courses, lessons, and student progress.
                </p>
                <p className="text-gray-600 mt-4">
                    Select an option from the sidebar to get started.
                </p>
            </div>
        </div>
    );
};

export default TutorDashboardPage;
