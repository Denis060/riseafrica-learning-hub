import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
    LayoutDashboard, BookCopy, PenSquare, HelpCircle, BarChart2, 
    MessageSquare, User, Bell, LogOut 
} from 'lucide-react';

const TutorSidebar = () => {
    const { logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const linkClasses = "flex items-center px-6 py-3 text-gray-600 hover:bg-gray-200 hover:text-gray-800 transition-colors duration-200";
    const activeLinkClasses = "bg-gray-300 text-gray-900 font-bold";

    return (
        <div className="w-64 bg-white shadow-md h-full flex flex-col">
            <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-[#0A2463]">Tutor Panel</h2>
            </div>
            <nav className="flex-grow mt-5">
                <NavLink to="/tutor/dashboard" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <LayoutDashboard size={20} className="mr-4" /> Dashboard
                </NavLink>
                <NavLink to="/tutor/courses" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <BookCopy size={20} className="mr-4" /> My Courses
                </NavLink>
                <NavLink to="/tutor/lessons" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <PenSquare size={20} className="mr-4" /> Lessons
                </NavLink>
                <NavLink to="/tutor/quizzes" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <HelpCircle size={20} className="mr-4" /> Quizzes
                </NavLink>
                <NavLink to="/tutor/progress" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <BarChart2 size={20} className="mr-4" /> Student Progress
                </NavLink>
                <NavLink to="/tutor/feedback" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <MessageSquare size={20} className="mr-4" /> Feedback & Ratings
                </NavLink>
                <NavLink to="/profile-settings" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <User size={20} className="mr-4" /> Profile Settings
                </NavLink>
                <NavLink to="/tutor/announcements" className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}>
                    <Bell size={20} className="mr-4" /> Announcements
                </NavLink>
            </nav>
            <div className="p-6 border-t">
                <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors duration-200">
                    <LogOut size={20} className="mr-4" /> Logout
                </button>
            </div>
        </div>
    );
};

export default TutorSidebar;
