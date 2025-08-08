import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Award, BookOpen, Edit } from 'lucide-react';

// Card for displaying a completed course on the profile, with a link to the certificate
const CompletedCourseCard = ({ course }) => (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col transform hover:-translate-y-1 transition-transform duration-300">
        <img src={course.image_url || 'https://placehold.co/600x400/0A2463/FFF?text=RiseAfrica'} alt={course.title} className="w-full h-40 object-cover" />
        <div className="p-4 flex flex-col flex-grow">
            <h3 className="text-lg font-bold text-[#0A2463] truncate flex-grow">{course.title}</h3>
            <p className="text-sm text-gray-500 mb-3">By {course.instructor}</p>
            <div className="mt-auto">
                <Link to={`/certificate/${course.id}`} className="w-full text-center block bg-[#FFD700] text-[#0A2463] font-bold py-2 px-4 rounded-lg hover:opacity-90 flex items-center justify-center">
                    <Award size={16} className="mr-2" /> View Certificate
                </Link>
            </div>
        </div>
    </div>
);

const PublicProfilePage = () => {
    const { userId } = useParams();
    const { user: loggedInUser } = useContext(AuthContext); // Get the currently logged-in user
    const [profileData, setProfileData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Check if the logged-in user is viewing their own profile
    const isOwnProfile = loggedInUser && parseInt(loggedInUser.id) === parseInt(userId);

    useEffect(() => {
        const fetchPublicProfile = async () => {
            try {
                // --- THIS IS THE FIX ---
                // Using axios and the correct 'getPublicProfile.php' endpoint
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getPublicProfile.php?id=${userId}`);
                if (response.data.success) {
                    setProfileData(response.data.profile);
                } else {
                    throw new Error(response.data.error || "Failed to load profile.");
                }
            } catch (err) {
                console.error("Error fetching public profile:", err);
                setError(err.response?.data?.error_detail || err.message || "Could not fetch profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchPublicProfile();
    }, [userId]);

    if (isLoading) {
        return <p className="text-center p-10">Loading Profile...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 p-10">Error: {error}</p>;
    }

    if (!profileData) {
        return <p className="text-center p-10">Profile not found.</p>;
    }

    const { user, completed_courses } = profileData;
    const avatarUrl = user.avatar_url
        ? `${process.env.REACT_APP_API_URL}/${user.avatar_url}`
        : `https://placehold.co/128x128/0A2463/FFD700?text=${user.name.charAt(0)}`;

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:flex gap-8 items-center">
                <div className="flex-shrink-0 text-center md:text-left mb-6 md:mb-0">
                    <img
                        src={avatarUrl}
                        alt={`${user.name}'s profile`}
                        className="w-36 h-36 rounded-full mx-auto md:mx-0 border-4 border-[#FFD700] object-cover"
                    />
                </div>
                <div className="flex-grow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-4xl font-black text-[#0A2463]">{user.name}</h1>
                            <p className="text-gray-600 mt-2 max-w-2xl">{user.bio || 'A passionate learner at RiseAfrica Hub.'}</p>
                             <p className="text-sm text-gray-400 mt-2">Member since {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                        {/* Show "Edit Profile" button only if it's the user's own profile */}
                        {isOwnProfile && (
                            <Link to="/profile-settings" className="flex-shrink-0 ml-4 inline-flex items-center justify-center bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                                <Edit size={16} className="mr-2" />
                                Edit Profile
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-3xl font-bold text-gray-800 mb-6 flex items-center">
                    <Award size={28} className="mr-3 text-[#FFD700]" />
                    Completed Courses
                </h2>
                {completed_courses && completed_courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {completed_courses.map(course => (
                            <CompletedCourseCard key={course.id} course={course} />
                        ))}
                    </div>
                ) : (
                     <div className="text-center bg-white p-12 rounded-lg shadow-md">
                        <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
                        <h3 className="text-xl font-bold text-gray-600">No Completed Courses Yet</h3>
                        <p className="text-gray-500 mt-2">Keep learning to earn certificates and fill this space!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PublicProfilePage;
