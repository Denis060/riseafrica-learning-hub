import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { FaCertificate, FaPlayCircle } from 'react-icons/fa';

// Enhanced card component for enrolled courses
const EnrolledCourseCard = ({ course }) => {
    const isCompleted = course.progress >= 100;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out flex flex-col">
            <div className="relative">
                <img src={course.imageUrl || 'https://placehold.co/600x400/0A2463/FFF?text=RiseAfrica'} alt={course.title} className="w-full h-48 object-cover"/>
                {isCompleted && (
                    <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
                        COMPLETED
                    </div>
                )}
            </div>
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-gray-800 mb-2 flex-grow">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-4">By {course.instructor}</p>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                        className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}
                        style={{ width: `${course.progress || 0}%` }}
                    ></div>
                </div>
                <p className="text-sm text-gray-500 mb-6">{course.progress || 0}% Complete</p>

                {/* --- THIS IS THE KEY CHANGE --- */}
                {/* Conditionally render the button based on completion status */}
                {isCompleted ? (
                    <Link 
                        to={`/certificate/${course.id}`} 
                        className="w-full mt-auto text-center block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        <FaCertificate className="mr-2" /> View Certificate
                    </Link>
                ) : (
                    <Link 
                        to={`/course/${course.id}`} 
                        className="w-full mt-auto text-center block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    >
                        <FaPlayCircle className="mr-2" /> Continue Learning
                    </Link>
                )}
            </div>
        </div>
    );
};


const MyLearningPage = () => {
    const { token } = useContext(AuthContext);
    const [inProgressCourses, setInProgressCourses] = useState([]);
    const [completedCourses, setCompletedCourses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMyCourses = async () => {
            if (!token) {
                setError("You must be logged in to view your courses.");
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getMyCourses.php`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                const allCourses = response.data.records || [];
                const inProgress = allCourses.filter(course => course.progress < 100);
                const completed = allCourses.filter(course => course.progress >= 100);

                setInProgressCourses(inProgress);
                setCompletedCourses(completed);

            } catch (err) {
                console.error("Error fetching my courses:", err);
                if (err.response && err.response.data && err.response.data.error_detail) {
                    setError(`Server Error: ${err.response.data.error} (Details: ${err.response.data.error_detail})`);
                } else if (err.response && err.response.data && err.response.data.error) {
                    setError(`Server Error: ${err.response.data.error}`);
                } else {
                    setError('Could not fetch your courses. Please try again later.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchMyCourses();
    }, [token]);

    if (isLoading) return <p className="text-center text-lg p-10">Loading your courses...</p>;
    if (error) return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
        </div>
    );

    return (
        <div className="container mx-auto p-4 md:p-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-10">My Learning</h1>

            {inProgressCourses.length === 0 && completedCourses.length === 0 ? (
                <div className="col-span-full text-center py-10 bg-white rounded-lg shadow">
                    <h2 className="text-2xl font-semibold text-gray-700">You are not enrolled in any courses yet.</h2>
                    <p className="text-gray-500 mt-2">Explore our catalog to start your learning journey!</p>
                    <Link to="/" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors">
                        Browse Courses
                    </Link>
                </div>
            ) : (
                <>
                    {inProgressCourses.length > 0 && (
                        <section className="mb-12">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">In Progress</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {inProgressCourses.map(course => (
                                    <EnrolledCourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </section>
                    )}

                    {completedCourses.length > 0 && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Completed</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {completedCourses.map(course => (
                                    <EnrolledCourseCard key={course.id} course={course} />
                                ))}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default MyLearningPage;
