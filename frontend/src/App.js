import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import Layout and Route Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import AdminLayout from './components/layout/AdminLayout';
import AdminRoute from './components/AdminRoute';
import TutorRoute from './components/TutorRoute'; // --- (1) IMPORT TUTOR ROUTE ---

// Page Components
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PleaseVerifyPage from './pages/PleaseVerifyPage';
import VerificationPage from './pages/VerificationPage';
import CoursePage from './pages/CoursePage';
import MyLearningPage from './pages/MyLearningPage';
import ProfilePage from './pages/ProfilePage';
import PublicProfilePage from './pages/PublicProfilePage';
import CertificatePage from './pages/CertificatePage';
// Admin Pages
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminCoursesPage from './pages/AdminCoursesPage';
// --- (2) IMPORT TUTOR DASHBOARD PAGE ---
import TutorDashboardPage from './pages/TutorDashboardPage';


const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    return user ? children : <Navigate to="/login" />;
};

const MainLayout = () => (
    <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto p-6">
            <Outlet />
        </main>
        <Footer />
    </div>
);

function App() {
    return (
        <AuthProvider>
            <Router>
                <ToastContainer
                    position="top-right"
                    autoClose={5000}
                    hideProgressBar={false}
                    newestOnTop={false}
                    closeOnClick
                    rtl={false}
                    pauseOnFocusLoss
                    draggable
                    pauseOnHover
                    theme="light"
                />

                <Routes>
                    {/* Admin Routes */}
                    <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<AdminDashboardPage />} />
                        <Route path="users" element={<AdminUsersPage />} />
                        <Route path="courses" element={<AdminCoursesPage />} />
                    </Route>

                    {/* --- (3) ADD TUTOR ROUTES --- */}
                    <Route path="/tutor" element={<TutorRoute />}>
                        <Route index element={<Navigate to="dashboard" />} />
                        <Route path="dashboard" element={<TutorDashboardPage />} />
                        {/* Add other tutor pages here later, e.g., courses, lessons */}
                    </Route>

                    {/* Public and Student Routes */}
                    <Route path="/" element={<MainLayout />}>
                        <Route index element={<HomePage />} />
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="please-verify" element={<PleaseVerifyPage />} />
                        <Route path="verify-email" element={<VerificationPage />} />
                        <Route path="profile/:userId" element={<PublicProfilePage />} />
                        <Route path="course/:id" element={<PrivateRoute><CoursePage /></PrivateRoute>} />
                        <Route path="my-learning" element={<PrivateRoute><MyLearningPage /></PrivateRoute>} />
                        <Route path="profile-settings" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                        <Route path="certificate/:courseId" element={<PrivateRoute><CertificatePage /></PrivateRoute>} />
                    </Route>
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
