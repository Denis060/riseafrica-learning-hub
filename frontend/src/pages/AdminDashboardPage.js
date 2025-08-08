import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Users, BookCopy, UserCheck, Activity, UserPlus, FilePlus } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center">
        <div className={`mr-4 p-3 rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const AdminDashboardPage = () => {
    const { user } = useContext(AuthContext);
    const [dashboardData, setDashboardData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role === 'admin') {
            const fetchData = async () => {
                try {
                    // This now calls the new, more powerful API endpoint
                    const response = await fetch('http://localhost/riseafrica-hub/backend/api/getAdminDashboardData.php', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ admin_id: user.id }),
                    });
                    const data = await response.json();
                    if (!response.ok) {
                        throw new Error(data.message || 'Failed to fetch dashboard data.');
                    }
                    setDashboardData(data);
                } catch (err) {
                    setError(err.message);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }
    }, [user]);

    if (isLoading) {
        return <div className="text-center p-10">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="text-center p-10 text-red-500">Error: {error}</div>;
    }

    if (!dashboardData) {
        return <div className="text-center p-10">No dashboard data available.</div>;
    }
    
    const { stats, recent_activity, chart_data } = dashboardData;

    return (
        <div>
            <h1 className="text-3xl font-black text-[#0A2463] mb-8">Dashboard Overview</h1>
            
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Users" value={stats.total_users} icon={<Users className="text-white" />} color="bg-blue-500" />
                <StatCard title="Total Courses" value={stats.total_courses} icon={<BookCopy className="text-white" />} color="bg-green-500" />
                <StatCard title="Total Enrollments" value={stats.total_enrollments} icon={<UserCheck className="text-white" />} color="bg-purple-500" />
                <StatCard title="Active Users Today" value={stats.active_users_today} icon={<Activity className="text-white" />} color="bg-yellow-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Chart and Quick Actions */}
                <div className="lg:col-span-2">
                    {/* User Roles Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">User Distribution by Role</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chart_data.users_by_role} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="role" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="count" fill="#0A2463" name="Number of Users" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                     {/* Quick Actions */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                         <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
                         <div className="flex flex-wrap gap-4">
                            <Link to="/admin/users" className="flex items-center bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-lg hover:bg-gray-300">
                                <UserPlus size={20} className="mr-2"/> Manage Users
                            </Link>
                             <a href="http://localhost/riseafrica-hub/backend/admin.php" target="_blank" rel="noopener noreferrer" className="flex items-center bg-gray-200 text-gray-800 font-bold py-3 px-5 rounded-lg hover:bg-gray-300">
                                <FilePlus size={20} className="mr-2"/> Create New Course
                            </a>
                         </div>
                    </div>
                </div>

                {/* Sidebar: Recent Activity */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-2">New Users</h3>
                        <ul className="space-y-3 text-sm">
                            {recent_activity.new_users.map(u => (
                                <li key={u.id} className="truncate">
                                    <span className="font-medium">{u.name}</span>
                                    <span className="text-gray-500"> just registered.</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold text-gray-700 mb-2">New Enrollments</h3>
                         <ul className="space-y-3 text-sm">
                            {recent_activity.new_enrollments.map((e, i) => (
                                <li key={i} className="truncate">
                                    <span className="font-medium">{e.user_name}</span>
                                    <span className="text-gray-500"> enrolled in </span>
                                    <span className="font-medium">{e.course_title}</span>.
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboardPage;
