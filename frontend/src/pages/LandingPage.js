// This is the final, complete version of the Landing Page component.
// It includes all sections and animations.

// FILE: src/pages/LandingPage.js

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import CountUp from 'react-countup';

// Custom hook for the typing effect
const useTypingEffect = (words, typeSpeed = 100, deleteSpeed = 50) => {
    const [text, setText] = useState('');
    const [index, setIndex] = useState(0);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const handleTyping = () => {
            const currentWord = words[index % words.length];
            if (isDeleting) {
                setText(currentWord.substring(0, text.length - 1));
            } else {
                setText(currentWord.substring(0, text.length + 1));
            }

            if (!isDeleting && text === currentWord) {
                setTimeout(() => setIsDeleting(true), 2000);
            } else if (isDeleting && text === '') {
                setIsDeleting(false);
                setIndex(index + 1);
            }
        };

        const speed = isDeleting ? deleteSpeed : typeSpeed;
        const timer = setTimeout(handleTyping, speed);
        return () => clearTimeout(timer);
    }, [text, isDeleting, index, words, typeSpeed, deleteSpeed]);

    return text;
};

// --- Landing Page Sections ---

const HeroSection = () => {
    const typedText = useTypingEffect(["Innovators", "Leaders", "Developers", "Scientists"]);
    return (
        <section className="bg-[#0A2463] text-white pt-20 pb-12 md:pt-32 md:pb-20">
            <div className="container mx-auto px-6 text-center">
                <h1 className="text-4xl md:text-6xl font-black leading-tight">
                    Africa’s STEM Learning Hub for Future <span className="text-[#FFD700]">{typedText}</span><span className="animate-ping">|</span>
                </h1>
                <p data-aos="fade-up" data-aos-delay="200" className="mt-4 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                    Learn Data Science, AI, and more — from anywhere, at your own pace.
                </p>
                <div data-aos="fade-up" data-aos-delay="400" className="mt-8 space-y-4 sm:space-y-0 sm:space-x-4">
                    <a href="#courses" className="inline-block font-bold text-center bg-[#FFD700] text-[#0A2463] py-3 px-8 rounded-lg transform hover:scale-105 transition-transform duration-300">Browse Courses</a>
                    <Link to="/register" className="inline-block font-bold text-center bg-transparent border-2 border-[#FFD700] text-[#FFD700] py-3 px-8 rounded-lg hover:bg-[#FFD700] hover:text-[#0A2463] transform hover:scale-105 transition-all duration-300">Join for Free</Link>
                </div>
            </div>
        </section>
    );
};

const ValuePropositionBanner = () => (
    <div className="bg-white" data-aos="fade-up">
        <div className="container mx-auto px-6 py-4">
            <div className="flex flex-wrap justify-center text-center -mx-4">
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0"><p className="font-semibold text-gray-700">✅ Trusted by <span className="font-bold text-[#0A2463]">10,000+</span> African Learners</p></div>
                <div className="w-full md:w-1/3 px-4 mb-4 md:mb-0"><p className="font-semibold text-gray-700">📚 <span className="font-bold text-[#0A2463]">100% Free</span> Starter Courses</p></div>
                <div className="w-full md:w-1/3 px-4"><p className="font-semibold text-gray-700">🌍 Learn <span className="font-bold text-[#0A2463]">Anytime, Anywhere</span></p></div>
            </div>
        </div>
    </div>
);

const HowItWorksSection = () => (
    <section className="py-20">
        <div className="container mx-auto px-6">
            <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-black text-[#0A2463] text-center mb-12">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                <div data-aos="fade-up" data-aos-delay="100" className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"><div className="text-5xl mb-4">👤</div><h3 className="text-xl font-bold mb-2">Create Account</h3><p className="text-gray-600">Sign up for free and unlock your potential.</p></div>
                <div data-aos="fade-up" data-aos-delay="200" className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"><div className="text-5xl mb-4">📚</div><h3 className="text-xl font-bold mb-2">Enroll in a Course</h3><p className="text-gray-600">Choose from a wide range of in-demand STEM courses.</p></div>
                <div data-aos="fade-up" data-aos-delay="300" className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"><div className="text-5xl mb-4">💻</div><h3 className="text-xl font-bold mb-2">Start Learning</h3><p className="text-gray-600">Learn with video, text, and interactive quiz lessons.</p></div>
                <div data-aos="fade-up" data-aos-delay="400" className="bg-white p-6 rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-300"><div className="text-5xl mb-4">🎓</div><h3 className="text-xl font-bold mb-2">Earn Certificates</h3><p className="text-gray-600">Get certified and share your achievements.</p></div>
            </div>
        </div>
    </section>
);

const PopularCoursesSection = ({ courses }) => (
    <section id="courses" className="py-20 bg-gray-100">
        <div className="container mx-auto px-6">
            <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-black text-[#0A2463] text-center mb-12">Popular Courses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map((course, index) => (
                     <div key={course.id} data-aos="fade-up" data-aos-delay={100 * (index + 1)} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition-transform duration-300">
                        <img src={course.imageUrl} alt={`${course.title} Course`} className="w-full h-48 object-cover" />
                        <div className="p-6 flex flex-col flex-grow"><h3 className="text-xl font-bold text-[#0A2463] mb-2">{course.title}</h3><p className="text-gray-500 text-sm mb-4">By {course.instructor}</p><Link to="/register" className="mt-auto inline-block text-center w-full font-bold bg-[#FFD700] text-[#0A2463] py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors duration-300">Start Free</Link></div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

const StatsSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div data-aos="fade-up"><h3 className="text-5xl font-black text-[#0A2463]"><CountUp end={10000} duration={3} enableScrollSpy />+</h3><p className="mt-2 text-gray-600">Learners Enrolled</p></div>
                <div data-aos="fade-up" data-aos-delay="200"><h3 className="text-5xl font-black text-[#0A2463]"><CountUp end={95} duration={3} enableScrollSpy />%</h3><p className="mt-2 text-gray-600">Course Completion Rate</p></div>
                <div data-aos="fade-up" data-aos-delay="400"><h3 className="text-5xl font-black text-[#0A2463]"><CountUp end={300} duration={3} enableScrollSpy />+</h3><p className="mt-2 text-gray-600">Hours of Learning Material</p></div>
            </div>
        </div>
    </section>
);

const PartnersSection = () => (
    <section className="py-20 bg-gray-100">
        <div className="container mx-auto px-6 text-center">
            <h2 data-aos="fade-up" className="text-3xl font-black text-[#0A2463] mb-8">Trusted Partners & Press 📰</h2>
            <div data-aos="fade-up" data-aos-delay="200" className="flex flex-wrap justify-center items-center gap-x-12 gap-y-6">
                <span className="text-2xl font-bold text-gray-400">Google</span>
                <span className="text-2xl font-bold text-gray-400">UNICEF</span>
                <span className="text-2xl font-bold text-gray-400">TechCrunch</span>
                <span className="text-2xl font-bold text-gray-400">Forbes</span>
                <span className="text-2xl font-bold text-gray-400">Pace University</span>
            </div>
        </div>
    </section>
);

const NewsletterSection = () => (
    <section className="py-20 bg-white">
        <div className="container mx-auto px-6 text-center max-w-2xl">
            <h2 data-aos="fade-up" className="text-3xl font-black text-[#0A2463] mb-4">Stay Ahead with STEM Trends 📩</h2>
            <p data-aos="fade-up" data-aos-delay="100" className="text-gray-600 mb-6">Join our mailing list for the latest courses, news, and insights from the RiseAfrica Hub.</p>
            <form data-aos="fade-up" data-aos-delay="200" className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input type="email" placeholder="Enter your email address" className="flex-grow p-3 border rounded-md" required />
                <button type="submit" className="bg-[#0A2463] text-white font-bold py-3 px-6 rounded-md hover:bg-opacity-90">Subscribe</button>
            </form>
        </div>
    </section>
);

const CallToActionSection = () => (
    <section className="py-20 bg-[#0A2463] text-white">
        <div className="container mx-auto px-6 text-center">
            <h2 data-aos="fade-up" className="text-3xl md:text-4xl font-black">Start Learning Today – 100% Free to Join</h2>
            <div data-aos="fade-up" data-aos-delay="200" className="mt-8">
                <Link to="/register" className="inline-block font-bold text-center bg-[#FFD700] text-[#0A2463] py-3 px-8 rounded-lg transform hover:scale-105 transition-transform duration-300">Create Free Account</Link>
            </div>
        </div>
    </section>
);

const Footer = () => (
    <footer className="bg-gray-800 text-white py-10">
        <div className="container mx-auto px-6 text-center">
            <div className="flex justify-center space-x-6 mb-4">
                <a href="#" className="hover:underline">About</a>
                <a href="#" className="hover:underline">Contact</a>
                <a href="#" className="hover:underline">Privacy</a>
                <a href="#" className="hover:underline">Terms</a>
            </div>
            <p className="text-gray-400">Powered by Ibrahim Denis Fofanah | Africa Rising 🌍</p>
        </div>
    </footer>
);


const LandingPage = ({ courses }) => {
    useEffect(() => {
        AOS.init({ duration: 800, once: true });
    }, []);

    return (
        <div>
            <HeroSection />
            <ValuePropositionBanner />
            <HowItWorksSection />
            <PopularCoursesSection courses={courses} />
            <StatsSection />
            <PartnersSection />
            <NewsletterSection />
            <CallToActionSection />
            <Footer />
        </div>
    );
};

export default LandingPage;
