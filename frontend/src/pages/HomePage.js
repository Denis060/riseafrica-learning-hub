import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import CourseCard from '../components/courses/CourseCard';
import LandingPage from './LandingPage';

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [courses, setCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // This effect handles redirection for admin users
    useEffect(() => {
        if (user && user.is_admin === '1') {
            navigate('/admin/dashboard');
        }
    }, [user, navigate]);

    // This effect fetches courses for both guests and logged-in users
    useEffect(() => {
        // Don't fetch courses if the user is an admin who will be redirected
        if (user && user.is_admin === '1') {
            setIsLoading(false);
            return;
        }

        const fetchCourses = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getCourses.php`);
                // Use the 'records' property to match the PHP script
                setCourses(response.data.records || []);
            } catch (err) {
                console.error("Error fetching courses:", err);
                if (err.response && err.response.data && err.response.data.error) {
                    setError(`Server Error: ${err.response.data.error} (Details: ${err.response.data.error_detail || 'N/A'})`);
                } else {
                    setError('Failed to load courses. Please check your connection or try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCourses();
    }, [user]); // Re-run if the user logs in or out

    // If the user is an admin, show a loading message while they are redirected
    if (user && user.is_admin === '1') {
        return <div className="text-center p-10">Redirecting to admin dashboard...</div>;
    }

    // If there is no user, show the public landing page
    if (!user) {
        if (isLoading) return <p className="text-center p-10">Loading...</p>;
        if (error) return <p className="text-center text-red-500 p-10">Error: {error}</p>;
        return <LandingPage courses={courses.slice(0, 3)} />;
    }
  
    // If the user is a logged-in student, show the main dashboard
    return (
        <div>
            <div className="text-center my-10 bg-white p-10 rounded-lg shadow-lg">
                <h1 className="text-5xl font-extrabold mb-4 text-[#0A2463]">
                    Welcome back, {user.full_name}!
                </h1>
                <p className="text-xl text-gray-600">
                    Continue your learning journey.
                </p>
            </div>

            <h2 id="courses" className="text-3xl font-bold text-[#0A2463] mb-8">All Courses</h2>

            {isLoading && <p className="text-center text-lg">Loading courses...</p>}
            {error && <p className="text-center text-red-500 text-lg">{error}</p>}
            
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {courses.length > 0 ? (
                        courses.map(course => (
                            <CourseCard key={course.id} course={course} />
                        ))
                    ) : (
                        <p className="text-center text-lg col-span-3">No courses are available at this time.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default HomePage;
