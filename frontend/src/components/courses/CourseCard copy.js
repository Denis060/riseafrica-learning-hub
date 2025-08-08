import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <img 
                className="w-full h-48 object-cover" 
                src={course.imageUrl} 
                alt={`Cover image for ${course.title}`} 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}
            />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#0A2463] mb-2">{course.title}</h3>
                <p className="text-gray-500 text-sm mb-4">By {course.instructor}</p>
                <p className="text-gray-700 flex-grow mb-6">{course.description}</p>
                <Link 
                    to={`/course/${course.id}`}
                    className="mt-auto block text-center w-full bg-[#FFD700] text-[#0A2463] font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                >
                    View Course
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;