import React from 'react';
import TutorSidebar from './TutorSidebar'; // We will create this next

const TutorLayout = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <TutorSidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TutorLayout;
