import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-grow p-8">
                <Outlet /> {/* This is where the child routes like AdminUsersPage will be rendered */}
            </main>
        </div>
    );
};

export default AdminLayout;