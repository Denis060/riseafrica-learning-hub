import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { User, LogOut, ChevronDown, BookOpen, Settings, Shield } from 'lucide-react';

const Header = () => {
    const { user, logout } = useContext(AuthContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const avatarUrl = user?.avatar_url 
        ? `${process.env.REACT_APP_API_URL}/${user.avatar_url}`
        : `https://placehold.co/40x40/0A2463/FFD700?text=${user?.name ? user.name.charAt(0) : 'R'}`;

    return (
        <header className="bg-white shadow-md sticky top-0 z-50">
            <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="text-2xl font-black text-[#0A2463]">
                    RiseAfrica Hub
                </Link>
                <nav className="hidden md:flex items-center space-x-6">
                    <NavLink to="/" className={({ isActive }) => isActive ? "text-[#0A2463] font-bold" : "text-gray-600 hover:text-[#0A2463]"}>Home</NavLink>
                </nav>
                <div className="flex items-center">
                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="flex items-center space-x-2">
                                <img
                                    src={avatarUrl}
                                    alt="User avatar"
                                    className="w-10 h-10 rounded-full object-cover border-2 border-[#FFD700]"
                                />
                                <span className="hidden md:block font-semibold text-gray-700">{user.name}</span>
                                <ChevronDown size={20} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isDropdownOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50">
                                    {user.is_admin === '1' && (
                                        <>
                                            <Link to="/admin/dashboard" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                                <Shield size={16} className="mr-3" /> Admin Dashboard
                                            </Link>
                                            <div className="border-t my-2"></div>
                                        </>
                                    )}
                                    {/* --- FIX: Points to the public profile page --- */}
                                    <Link to={`/profile/${user.id}`} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <User size={16} className="mr-3" /> My Profile
                                    </Link>
                                    <Link to="/my-learning" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <BookOpen size={16} className="mr-3" /> My Learning
                                    </Link>
                                    {/* --- FIX: Added the Settings link back --- */}
                                    <Link to="/profile-settings" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
                                        <Settings size={16} className="mr-3" /> Settings
                                    </Link>
                                    <div className="border-t my-2"></div>
                                    <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-red-600 hover:bg-gray-100">
                                        <LogOut size={16} className="mr-3" /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="font-semibold text-gray-600 hover:text-[#0A2463]">Login</Link>
                            <Link to="/register" className="font-bold bg-[#0A2463] text-white py-2 px-4 rounded-lg hover:bg-opacity-90">Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
