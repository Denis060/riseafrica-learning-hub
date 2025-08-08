// FILE: src/components/courses/CourseCard.js

import React from 'react';
import { Link } from 'react-router-dom';

const CourseCard = ({ course }) => {
    const { id, title, instructor, description, imageUrl, progress } = course;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col">
            <img 
                className="w-full h-48 object-cover" 
                src={imageUrl} 
                alt={`Cover for ${title}`} 
                onError={(e) => { e.target.onerror = null; e.target.src='https://placehold.co/600x400/cccccc/ffffff?text=Image+Not+Found'; }}
            />
            <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-xl font-bold text-[#0A2463] mb-2">{title}</h3>
                <p className="text-gray-500 text-sm mb-4">By {instructor}</p>
                <p className="text-gray-700 flex-grow mb-6">{description}</p>
                
                {typeof progress === 'number' && (
                    <div className="mb-4">
                        <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-[#FFD700] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                )}

                <Link 
                    to={`/course/${id}`}
                    className="mt-auto block text-center w-full bg-[#0A2463] text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-all duration-300"
                >
                    {progress > 0 && progress < 100 ? 'Continue Learning' : 'View Course'}
                </Link>
            </div>
        </div>
    );
};

export default CourseCard;