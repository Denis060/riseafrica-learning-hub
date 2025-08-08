
import React, { useContext, useState } from 'react'; // Import useContext and useState
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext for logout
import { LayoutDashboard, Users, BookCopy, ClipboardCheck, School, Award, BarChart2, Megaphone, Settings, FileText, ShieldCheck, LogOut, Moon, Sun } from 'lucide-react';

const AdminSidebar = () => {
    const { logout } = useContext(AuthContext); // Get logout function from context
    const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode toggle

    const navLinkClasses = ({ isActive }) =>
        `flex items-center px-4 py-3 text-gray-700 rounded-lg transition-colors duration-200 ${
            isActive ? 'bg-[#0A2463] text-white font-bold' : 'hover:bg-gray-200'
        }`;
    
    const handleLogout = () => {
        // In a real app, you might want a confirmation modal here
        logout();
    };

    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        // In a real implementation, you would also add/remove a 'dark' class
        // from the root <html> element to apply Tailwind's dark mode styles.
        // document.documentElement.classList.toggle('dark');
        alert("Dark mode functionality will be implemented in a future step!");
    };

    return (
        <aside className="w-64 bg-white shadow-md h-screen sticky top-0 flex flex-col justify-between">
            <div>
                <div className="p-6">
                    <h2 className="text-2xl font-black text-[#0A2463]">Admin Panel</h2>
                </div>
                <nav className="px-4">
                    <ul className="space-y-2">
                        <li><NavLink to="/admin/dashboard" className={navLinkClasses}><LayoutDashboard size={20} className="mr-3" /> Dashboard</NavLink></li>
                        <li><NavLink to="/admin/users" className={navLinkClasses}><Users size={20} className="mr-3" /> User Management</NavLink></li>
                        <li><NavLink to="/admin/courses" className={navLinkClasses}><BookCopy size={20} className="mr-3" /> Courses</NavLink></li>
                        <li><NavLink to="/admin/quizzes" className={navLinkClasses}><ClipboardCheck size={20} className="mr-3" /> Lessons & Quizzes</NavLink></li>
                        <li><NavLink to="/admin/tutors" className={navLinkClasses}><School size={20} className="mr-3" /> Tutors</NavLink></li>
                        <li><NavLink to="/admin/certificates" className={navLinkClasses}><Award size={20} className="mr-3" /> Certificates</NavLink></li>
                        <li><NavLink to="/admin/reports" className={navLinkClasses}><BarChart2 size={20} className="mr-3" /> Reports & Analytics</NavLink></li>
                        <li><NavLink to="/admin/announcements" className={navLinkClasses}><Megaphone size={20} className="mr-3" /> Announcements</NavLink></li>
                        <li><NavLink to="/admin/settings" className={navLinkClasses}><Settings size={20} className="mr-3" /> Settings</NavLink></li>
                        <li><NavLink to="/admin/pages" className={navLinkClasses}><FileText size={20} className="mr-3" /> Pages</NavLink></li>
                        <li><NavLink to="/admin/security" className={navLinkClasses}><ShieldCheck size={20} className="mr-3" /> Security Logs</NavLink></li>
                    </ul>
                </nav>
            </div>
            <div className="px-4 py-6 border-t">
                <button onClick={toggleDarkMode} className="w-full flex items-center px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-200 mb-2">
                    {isDarkMode ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
                    {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-600 rounded-lg hover:bg-red-50">
                    <LogOut size={20} className="mr-3" /> Logout
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;