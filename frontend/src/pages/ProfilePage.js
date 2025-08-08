import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUserEdit, FaCamera, FaSave, FaKey, FaUserCircle, FaShieldAlt } from 'react-icons/fa';

// --- Reusable Tab Component ---
const TabButton = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center justify-center px-6 py-3 text-lg font-semibold border-b-4 transition-colors duration-300 ${
            isActive 
                ? 'border-[#0A2463] text-[#0A2463]' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);


const ProfilePage = () => {
    const { token, user, login } = useContext(AuthContext);
    
    const [activeTab, setActiveTab] = useState('details'); // 'details' or 'security'
    
    // State for profile form
    const [profile, setProfile] = useState({ name: '', email: '', bio: '', avatar_url: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    
    // State for password form
    const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm_password: '' });

    const [isLoading, setIsLoading] = useState(true);
    const [isSavingProfile, setIsSavingProfile] = useState(false);
    const [isSavingPassword, setIsSavingPassword] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getProfile.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.data.success) {
                    setProfile(response.data.profile);
                    if (response.data.profile.avatar_url) {
                        setAvatarPreview(`${process.env.REACT_APP_API_URL}/${response.data.profile.avatar_url}`);
                    }
                }
            } catch (error) {
                toast.error("Failed to load profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfile();
    }, [token]);

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsSavingProfile(true);
        console.log("Attempting to save profile..."); // DEBUG LOG

        const formData = new FormData();
        formData.append('name', profile.name);
        formData.append('email', profile.email);
        formData.append('bio', profile.bio);
        formData.append('current_avatar_url', profile.avatar_url);
        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }
        console.log("Form data prepared:", Object.fromEntries(formData)); // DEBUG LOG

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/updateProfile.php`, formData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("Server response received:", response.data); // DEBUG LOG

            if (response.data.success) {
                toast.success(response.data.message);
                const updatedUser = { ...user, name: profile.name, bio: profile.bio, avatar_url: response.data.new_avatar_url };
                login(updatedUser, token); 
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            console.error("An error occurred while updating profile:", error.response || error); // DEBUG LOG
            toast.error(error.response?.data?.error || "An error occurred while updating profile.");
        } finally {
            setIsSavingProfile(false);
            console.log("Finished save attempt."); // DEBUG LOG
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        if (passwords.new_password !== passwords.confirm_password) {
            toast.error("New passwords do not match.");
            return;
        }
        setIsSavingPassword(true);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/updatePassword.php`, {
                current_password: passwords.current_password,
                new_password: passwords.new_password
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                toast.success(response.data.message);
                setPasswords({ current_password: '', new_password: '', confirm_password: '' });
            } else {
                toast.error(response.data.error);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "An error occurred while updating password.");
        } finally {
            setIsSavingPassword(false);
        }
    };

    if (isLoading) {
        return <p className="text-center p-10">Loading Profile...</p>;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 max-w-4xl space-y-8">
            <h1 className="text-3xl md:text-4xl font-bold text-[#0A2463]">My Profile Settings</h1>
            
            <div className="bg-white rounded-xl shadow-lg">
                {/* --- Tab Navigation --- */}
                <div className="border-b border-gray-200">
                    <nav className="flex" aria-label="Tabs">
                        <TabButton 
                            label="Profile Details" 
                            icon={<FaUserCircle />}
                            isActive={activeTab === 'details'} 
                            onClick={() => setActiveTab('details')} 
                        />
                        <TabButton 
                            label="Security" 
                            icon={<FaShieldAlt />}
                            isActive={activeTab === 'security'} 
                            onClick={() => setActiveTab('security')} 
                        />
                    </nav>
                </div>

                {/* --- Tab Content --- */}
                <div className="p-8">
                    {activeTab === 'details' && (
                        <form onSubmit={handleProfileSubmit} className="space-y-6">
                            <div className="flex items-center space-x-6">
                                <div className="relative">
                                    <img 
                                        src={avatarPreview || `https://placehold.co/128x128/0A2463/FFD700?text=${profile.name ? profile.name.charAt(0) : 'R'}`} 
                                        alt="Avatar" 
                                        className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                                    />
                                    <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#FFD700] text-[#0A2463] p-2 rounded-full cursor-pointer hover:bg-opacity-90">
                                        <FaCamera />
                                        <input id="avatar-upload" type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                                    </label>
                                </div>
                                <div className="flex-grow">
                                     <h2 className="text-2xl font-bold text-[#0A2463]">{profile.name}</h2>
                                     <p className="text-gray-500">{profile.email}</p>
                                </div>
                            </div>
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="name" id="name" value={profile.name} onChange={handleProfileChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FFD700] focus:border-[#FFD700]" />
                            </div>
                            <div>
                                <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                                <textarea name="bio" id="bio" rows="4" value={profile.bio || ''} onChange={handleProfileChange} className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-[#FFD700] focus:border-[#FFD700]" placeholder="Tell us a little about yourself..."></textarea>
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={isSavingProfile} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#0A2463] hover:bg-opacity-90 disabled:bg-opacity-70">
                                    <FaSave className="mr-2" />
                                    {isSavingProfile ? 'Saving...' : 'Save Profile'}
                                </button>
                            </div>
                        </form>
                    )}
                    
                    {activeTab === 'security' && (
                         <form onSubmit={handlePasswordSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="current_password">Current Password</label>
                                <input type="password" name="current_password" value={passwords.current_password} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-[#FFD700] focus:border-[#FFD700]" required />
                            </div>
                            <div>
                                <label htmlFor="new_password">New Password</label>
                                <input type="password" name="new_password" value={passwords.new_password} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-[#FFD700] focus:border-[#FFD700]" required />
                            </div>
                            <div>
                                <label htmlFor="confirm_password">Confirm New Password</label>
                                <input type="password" name="confirm_password" value={passwords.confirm_password} onChange={handlePasswordChange} className="mt-1 block w-full px-4 py-2 border rounded-md focus:ring-[#FFD700] focus:border-[#FFD700]" required />
                            </div>
                            <div className="text-right">
                                <button type="submit" disabled={isSavingPassword} className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#0A2463] hover:bg-opacity-90 disabled:bg-opacity-70">
                                    <FaKey className="mr-2" />
                                    {isSavingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
