import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Lock, PlayCircle, CheckCircle, Award, Notebook, ChevronDown, ChevronRight, LogIn } from 'lucide-react';
import Quiz from '../components/courses/Quiz';

// This component renders the main content area (video, text, or quiz)
const LessonContent = ({ lesson }) => {
    if (!lesson) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center h-full flex flex-col justify-center">
                <Notebook size={64} className="mx-auto text-gray-300 mb-4" />
                <h2 className="text-2xl font-bold text-gray-700">Select a lesson to begin</h2>
                <p className="text-gray-500 mt-2">Choose a lesson from the sidebar on the left.</p>
            </div>
        );
    }
    const lessonType = String(lesson.lesson_type || '').trim();

    if (lessonType === 'video') {
        return (
            <div className="relative mb-6" style={{ paddingTop: '56.25%' }}>
                <iframe src={lesson.content} title={lesson.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen className="absolute top-0 left-0 w-full h-full rounded-lg"></iframe>
            </div>
        );
    }
    if (lessonType === 'text') {
        return <div className="prose max-w-none text-lg text-gray-700 mb-6" dangerouslySetInnerHTML={{ __html: lesson.content }} />;
    }
    if (lessonType === 'quiz') {
        // The Quiz component itself is rendered in the parent
        return <p className="text-gray-600">Loading quiz...</p>;
    }
    return <div className="text-red-500 font-semibold">Unknown lesson type.</div>;
};


const CoursePage = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const [course, setCourse] = useState(null);
    const [activeLesson, setActiveLesson] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openModules, setOpenModules] = useState([]);
    const [isEnrolling, setIsEnrolling] = useState(false);

    const fetchCourseDetails = useCallback(async (showFirstLesson = false) => {
        if (!token) {
            setIsLoading(false);
            return;
        }
        try {
            // Use the secure, token-based endpoint
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getCourse.php?id=${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.success) {
                setCourse(response.data.course);
                if (response.data.course.modules?.[0]) {
                    setOpenModules([parseInt(response.data.course.modules[0].id)]);
                    if (showFirstLesson && response.data.course.modules[0].lessons?.[0]) {
                        setActiveLesson(response.data.course.modules[0].lessons[0]);
                    }
                }
            } else {
                 throw new Error(response.data.error || 'Failed to fetch course details');
            }
        } catch (err) {
            setError(err.response?.data?.error || err.message);
        } finally {
            setIsLoading(false);
        }
    }, [id, token]);

    useEffect(() => {
        fetchCourseDetails();
    }, [fetchCourseDetails]);
    
    const handleEnroll = async () => {
        setIsEnrolling(true);
        setError(null);
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/enrollInCourse.php`, 
                { course_id: id },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            await fetchCourseDetails(true); // Refetch details after enrolling
            toast.success("Successfully enrolled!");
        } catch (err) { 
            toast.error(err.response?.data?.error || "Enrollment failed.");
        } finally {
            setIsEnrolling(false);
        }
    };
    
    const handleCompleteLesson = async (lessonId) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/saveProgress.php`, 
                { lesson_id: lessonId },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            
            const allLessons = course.modules.flatMap(m => m.lessons);
            const currentLessonIndex = allLessons.findIndex(l => l.id === lessonId);
            const nextLesson = (currentLessonIndex !== -1 && currentLessonIndex + 1 < allLessons.length) ? allLessons[currentLessonIndex + 1] : null;
            
            await fetchCourseDetails(); // Refetch to update progress
            setActiveLesson(nextLesson); // Move to next lesson
            toast.success("Progress saved!");

        } catch (err) { 
            toast.error("Could not save your progress.");
        }
    };

    const toggleModule = (moduleId) => {
        const numericModuleId = parseInt(moduleId);
        setOpenModules(prev => prev.includes(numericModuleId) ? prev.filter(id => id !== numericModuleId) : [...prev, numericModuleId]);
    };

    if (isLoading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center p-10 text-red-600">Error: {error}</div>;
    if (!user) return (
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <LogIn size={48} className="mx-auto text-[#FFD700] mb-4" />
            <h1 className="text-3xl font-bold text-[#0A2463] mb-2">Join Our Community to Learn</h1>
            <p className="text-gray-600 mb-6">Please log in or create an account to view course content.</p>
            <div className="flex justify-center gap-4">
                <Link to="/login" className="bg-[#0A2463] text-white font-bold py-3 px-8 rounded-lg">Login</Link>
                <Link to="/register" className="bg-gray-200 text-[#0A2463] font-bold py-3 px-8 rounded-lg">Sign Up</Link>
            </div>
        </div>
    );
    if (!course) return <div className="text-center p-10">Course not found.</div>;

    if (!course.isEnrolled) {
         return (
            <div className="bg-white rounded-xl shadow-lg p-8">
                <h1 className="text-4xl font-bold text-[#0A2463] mb-2">{course.title}</h1>
                <p className="text-gray-500 text-lg mb-6">By {course.instructor}</p>
                <p className="text-gray-700 text-lg mb-10">{course.description}</p>
                <div className="text-center bg-gray-50 p-8 rounded-lg">
                    <Award size={48} className="mx-auto text-[#FFD700] mb-4" />
                    <h3 className="text-2xl font-bold text-[#0A2463] mb-2">Start Your Learning Journey</h3>
                    <p className="text-gray-600 mb-6">Enroll in this course to gain access to all lessons and materials.</p>
                    <button onClick={handleEnroll} disabled={isEnrolling} className="bg-[#0A2463] text-white font-bold py-3 px-8 rounded-lg disabled:bg-gray-400">
                        {isEnrolling ? 'Enrolling...' : 'Enroll Now'}
                    </button>
                </div>
            </div>
        );
    }

    const allLessons = course.modules?.flatMap(m => m.lessons) || [];
    const completedLessons = course.completedLessons?.map(Number) || [];

    return (
        <div className="flex flex-col md:flex-row gap-8">
            <aside className="w-full md:w-1/3 lg:w-1/4 bg-white rounded-xl shadow-lg p-4 h-fit sticky top-24">
                <h3 className="text-xl font-bold text-[#0A2463] mb-4 p-2 flex items-center justify-between">
                    <span>Course Content</span>
                    <Link to="/my-learning" className="text-sm text-blue-600 hover:underline font-normal">Exit</Link>
                </h3>
                <ul className="space-y-1">
                    {course.modules?.map(module => {
                        const isModuleOpen = openModules.includes(parseInt(module.id));
                        return (
                            <li key={module.id}>
                                <button onClick={() => toggleModule(module.id)} className="w-full text-left flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 font-bold text-gray-800">
                                    <span>{module.title}</span>
                                    {isModuleOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                                </button>
                                {isModuleOpen && module.lessons?.map((lesson) => {
                                    const isCompleted = completedLessons.includes(parseInt(lesson.id));
                                    const lessonIndex = allLessons.findIndex(l => l.id === lesson.id);
                                    const isLocked = lessonIndex > 0 && !completedLessons.includes(parseInt(allLessons[lessonIndex - 1]?.id));
                                    const isActive = activeLesson && activeLesson.id === lesson.id;
                                    let Icon = isCompleted ? CheckCircle : (isLocked ? Lock : PlayCircle);
                                    
                                    return (
                                        <li key={lesson.id} className="pl-4 mt-1 border-l-2 ml-4">
                                            <button disabled={isLocked} onClick={() => !isLocked && setActiveLesson(lesson)} className={`w-full text-left flex items-center space-x-3 p-2 rounded-md ${isLocked ? 'text-gray-400 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'} ${isActive ? 'bg-[#FFD700] bg-opacity-30 font-bold' : ''}`}>
                                                <Icon size={18} className={`${isCompleted ? 'text-green-500' : ''} ${isLocked ? 'text-gray-400' : 'text-[#0A2463]'}`} />
                                                <span>{lesson.title}</span>
                                            </button>
                                        </li>
                                    );
                                })}
                            </li>
                        );
                    })}
                </ul>
            </aside>

            <main className="w-full md:w-2/3 lg:w-3/4 flex flex-col">
                <div className="bg-white p-8 rounded-xl shadow-lg flex-grow">
                    {activeLesson ? (
                        <>
                            <h2 className="text-3xl font-bold text-gray-900 mb-6">{activeLesson.title}</h2>
                            <LessonContent lesson={activeLesson} />
                        </>
                    ) : (
                        <div className="text-center h-full flex flex-col justify-center">
                            <Notebook size={64} className="mx-auto text-gray-300 mb-4" />
                            <h2 className="text-2xl font-bold text-gray-700">Select a lesson to begin</h2>
                            <p className="text-gray-500 mt-2">Choose a lesson from the sidebar on the left.</p>
                        </div>
                    )}
                </div>
                
                {activeLesson && !completedLessons.includes(parseInt(activeLesson.id)) && (
                    <div className="bg-white mt-4 p-4 rounded-xl shadow-lg border-t">
                        {String(activeLesson.lesson_type).trim() === 'quiz' ? (
                            <Quiz lesson={activeLesson} onComplete={() => handleCompleteLesson(activeLesson.id)} />
                        ) : (
                            <button onClick={() => handleCompleteLesson(activeLesson.id)} className="w-full bg-green-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-700 flex items-center justify-center">
                                <CheckCircle size={20} className="inline-block mr-2" />
                                Mark as Complete & Continue
                            </button>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
};

export default CoursePage;
