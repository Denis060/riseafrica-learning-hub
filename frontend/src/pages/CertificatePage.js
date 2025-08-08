import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
// Import icons and PDF generation libraries
import { FaDownload, FaArrowLeft, FaShareAlt, FaCheck } from 'react-icons/fa';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Custom SVG Logo for RiseAfrica Hub
const RiseAfricaLogo = ({ className }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
        <path d="M50 10 A40 40 0 1 1 50 90 A40 40 0 1 1 50 10 Z" fill="#0A2463" />
        <path d="M50 20 L60 40 L75 45 L65 58 L68 75 L50 65 L32 75 L35 58 L25 45 L40 40 Z" fill="#FFD700" />
    </svg>
);


const CertificatePage = () => {
    const { courseId } = useParams();
    const { token } = useContext(AuthContext);
    const [certificateData, setCertificateData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCopied, setIsCopied] = useState(false);
    const certificateRef = useRef(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            if (!token) {
                setError("Authentication required to view certificates.");
                setIsLoading(false);
                return;
            }

            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/getCertificate.php?course_id=${courseId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setCertificateData(response.data.certificate_data);
            } catch (err) {
                console.error("Error fetching certificate:", err);
                if (err.response && err.response.data && err.response.data.error_detail) {
                    setError(`Server Error: ${err.response.data.error} (Details: ${err.response.data.error_detail})`);
                } else if (err.response && err.response.data && err.response.data.error) {
                    setError(`Server Error: ${err.response.data.error}`);
                } else {
                    setError("Could not load certificate data. Please check your connection.");
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchCertificate();
    }, [courseId, token]);

    const handleDownloadPdf = () => {
        const input = certificateRef.current;
        html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: 'a4'
            });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`RiseAfrica_Certificate_${certificateData.course_title.replace(/\s/g, '_')}.pdf`);
        });
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (isLoading) {
        return <div className="text-center p-10">Loading Certificate...</div>;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-lg">
                    <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
                    <p className="text-gray-700">{error}</p>
                    <Link to="/my-learning" className="mt-6 inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg">
                        Back to My Learning
                    </Link>
                </div>
            </div>
        );
    }

    if (!certificateData) {
        return <div className="text-center p-10">No certificate data found.</div>;
    }

    const { user_name, course_title, completion_date, instructor_name, skills_covered } = certificateData;

    return (
        <div className="bg-gray-200 min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center font-sans">
            <div className="w-full max-w-5xl mx-auto print:p-0">
                <div className="mb-6 flex justify-between items-center print:hidden">
                    <Link to="/my-learning" className="flex items-center text-gray-600 hover:text-[#0A2463]">
                        <FaArrowLeft size={16} className="mr-2" /> Back to My Learning
                    </Link>
                    <div className="flex gap-4">
                         <button 
                            onClick={handleCopyLink}
                            className="flex items-center bg-white text-[#0A2463] font-bold py-2 px-4 rounded-lg shadow hover:bg-gray-100 transition-colors"
                        >
                            {isCopied ? <FaCheck size={16} className="mr-2 text-green-500" /> : <FaShareAlt size={16} className="mr-2" />}
                            {isCopied ? 'Copied!' : 'Share'}
                        </button>
                        <button 
                            onClick={handleDownloadPdf}
                            className="flex items-center bg-[#FFD700] text-[#0A2463] font-bold py-2 px-4 rounded-lg shadow hover:bg-opacity-90 transition-colors"
                        >
                            <FaDownload size={16} className="mr-2" /> Download PDF
                        </button>
                    </div>
                </div>

                <div ref={certificateRef} className="w-full bg-white rounded-lg shadow-2xl border-4 border-[#0A2463] p-10 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="relative z-10">
                        {/* --- FIXED SPACING --- */}
                        <h1 className="text-4xl md:text-5xl font-black text-[#0A2463] tracking-wider mb-6">Certificate of Completion</h1>
                        <p className="text-md md:text-lg text-gray-600">This certificate is proudly presented to</p>
                        
                        {/* --- ENHANCED NAME STYLING --- */}
                        <p className="text-4xl md:text-5xl font-bold my-6" style={{ fontFamily: "'Garamond', serif", color: '#0A2463' }}>{user_name}</p>
                        
                        <p className="text-md md:text-lg text-gray-600">for successfully completing the course</p>
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 my-4">{course_title}</h2>
                        <p className="text-md text-gray-500">on {completion_date}</p>
                        
                        {/* --- REDESIGNED SKILLS SECTION --- */}
                        {skills_covered && skills_covered.length > 0 && (
                            <div className="my-8 max-w-2xl mx-auto bg-gray-50 p-4 rounded-lg">
                                <h3 className="text-lg font-bold text-gray-700 mb-3">Skills Covered</h3>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {skills_covered.map((skill, index) => (
                                        <span key={index} className="bg-gray-200 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                                            {skill.trim()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* --- REPLACED ICON WITH SVG LOGO --- */}
                        <div className="mt-12 flex justify-between items-center">
                            <div className="text-center"><p className="font-bold text-gray-700">{instructor_name}</p><p className="text-sm text-gray-500 border-t-2 pt-1 mt-1">Lead Instructor</p></div>
                            <RiseAfricaLogo className="h-20 w-20 text-[#FFD700]" />
                            <div className="text-center"><p className="font-bold text-gray-700">RiseAfrica Hub</p><p className="text-sm text-gray-500 border-t-2 pt-1 mt-1">Official Training Partner</p></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificatePage;
