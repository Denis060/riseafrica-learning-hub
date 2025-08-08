import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import AdminLayout from '../components/layout/AdminLayout';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminCoursesPage = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getAdminCourses.php`);
                if (response.data && response.data.data) {
                    setCourses(response.data.data);
                } else {
                    setCourses([]); // Ensure courses is always an array
                }
            } catch (error) {
                toast.error('Failed to fetch courses.');
                console.error('Fetch courses error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const uniqueCategories = useMemo(() => {
        const categories = courses.map(course => course.category);
        return ['All', ...new Set(categories)];
    }, [courses]);

    const filteredCourses = useMemo(() => {
        return courses.filter(course => {
            const matchesCategory = filterCategory === '' || filterCategory === 'All' || course.category === filterCategory;
            const matchesSearch = searchTerm === '' ||
                course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                course.instructor_name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [courses, searchTerm, filterCategory]);

    const handleDeleteCourse = async (courseId) => {
        // Using window.confirm is fine for admin panels, but a custom modal is better for user-facing features.
        if (window.confirm('Are you sure you want to permanently delete this course and all its enrollment data?')) {
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/deleteCourse.php`, { id: courseId });
                toast.success(response.data.message);
                setCourses(prevCourses => prevCourses.filter(c => c.id !== courseId));
            } catch (error) {
                toast.error(error.response?.data?.message || 'Failed to delete course.');
                console.error('Delete course error:', error);
            }
        }
    };

    return (
        <AdminLayout>
            <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
                <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-800">Course Management</h1>
                    <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition duration-300">
                        <FaPlus className="mr-2" /> Add New Course
                    </button>
                </div>

                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search by title or instructor..."
                                className="w-full p-2 pl-10 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <FaSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div>
                            <select
                                className="w-full p-2 border rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500"
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            >
                                {uniqueCategories.map(category => (
                                    <option key={category} value={category}>{category === 'All' ? 'All Categories' : category}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md overflow-x-auto">
                    {loading ? (
                        <p className="p-6 text-center text-gray-500">Loading courses...</p>
                    ) : (
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Instructor</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Enrollments</th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredCourses.length > 0 ? filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                {course.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{course.instructor_name}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-center">{course.enrollment_count}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-4" title="Edit Course">
                                                <FaEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDeleteCourse(course.id)} className="text-red-600 hover:text-red-900" title="Delete Course">
                                                <FaTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-10 text-gray-500">No courses match your criteria.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCoursesPage;
