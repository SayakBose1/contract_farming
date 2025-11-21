import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import LoadingSpinner from './components/Common/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Auth/Login';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

import Signup from './pages/Auth/Signup';                 // 🔥 NEW
import SignupDetails from './pages/Auth/SignupDetails';   // 🔥 NEW

import FarmerDashboard from './pages/Farmer/Dashboard';
import TraderDashboard from './pages/Trader/Dashboard';
import AdminDashboard from './pages/Admin/Dashboard';
import FarmList from './pages/Farmer/FarmList';
import FarmDetails from './pages/Farmer/FarmDetails';
import CreateFarm from './pages/Farmer/CreateFarm';
import AvailableContracts from './pages/Trader/AvailableContracts';
import ContractList from './pages/Contracts/ContractList';
import ContractDetails from './pages/Contracts/ContractDetails';
import CreateContract from './pages/Contracts/CreateContract';
import Profile from './pages/Profile/Profile';
import NotFound from './pages/NotFound';


// ----------------------
// PROTECTED ROUTE
// ----------------------
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (!user) return <Navigate to="/login" replace />;

    if (allowedRoles.length > 0) {
        const userRole =
            user.user_type === 'F' || user.user_type === 'FT'
                ? 'farmer'
                : user.user_type === 'T'
                ? 'trader'
                : user.user_type === 'A'
                ? 'admin'
                : null;

        if (!allowedRoles.includes(userRole)) {
            return <Navigate to="/unauthorized" replace />;
        }
    }

    return children;
};


// ----------------------
// PUBLIC ROUTE
// ----------------------
const PublicRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <LoadingSpinner />;

    if (user) {
        switch (user.user_type) {
            case 'F':
            case 'FT':
                return <Navigate to="/farmer/dashboard" replace />;
            case 'T':
                return <Navigate to="/trader/dashboard" replace />;
            case 'A':
                return <Navigate to="/admin/dashboard" replace />;
            default:
                return <Navigate to="/" replace />;
        }
    }

    return children;
};


// ----------------------
// APP CONTENT
// ----------------------
function AppContent() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-grow">
                <Routes>

                    {/* Public Routes */}
                    <Route path="/" element={<Home />} />

                    {/* ---------------------- */}
                    {/*   AUTH ROUTES          */}
                    {/* ---------------------- */}

                    <Route
                        path="/login"
                        element={
                            <PublicRoute>
                                <Login />
                            </PublicRoute>
                        }
                    />

                    {/* 🔥 NEW SIGNUP ROUTES */}
                    <Route
                        path="/signup"
                        element={
                            <PublicRoute>
                                <Signup />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/signup/details/:userId"
                        element={
                            <PublicRoute>
                                <SignupDetails />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/forgot-password"
                        element={
                            <PublicRoute>
                                <ForgotPassword />
                            </PublicRoute>
                        }
                    />

                    <Route
                        path="/reset-password/:token"
                        element={
                            <PublicRoute>
                                <ResetPassword />
                            </PublicRoute>
                        }
                    />

                    {/* ---------------------- */}
                    {/* FARMER ROUTES          */}
                    {/* ---------------------- */}
                    <Route
                        path="/farmer/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <FarmerDashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/farmer/farms"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <FarmList />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/farmer/farms/create"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <CreateFarm />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/farmer/farms/:id"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <FarmDetails />
                            </ProtectedRoute>
                        }
                    />

                    {/* ---------------------- */}
                    {/* TRADER ROUTES          */}
                    {/* ---------------------- */}
                    <Route
                        path="/trader/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['trader']}>
                                <TraderDashboard />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/trader/contracts/available"
                        element={
                            <ProtectedRoute allowedRoles={['trader']}>
                                <AvailableContracts />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/trader/contracts/:id"
                        element={
                            <ProtectedRoute allowedRoles={['trader']}>
                                <ContractDetails />
                            </ProtectedRoute>
                        }
                    />

                    {/* ---------------------- */}
                    {/* ADMIN ROUTES           */}
                    {/* ---------------------- */}
                    <Route
                        path="/admin/dashboard"
                        element={
                            <ProtectedRoute allowedRoles={['admin']}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        }
                    />

                    {/* ---------------------- */}
                    {/* CONTRACT ROUTES        */}
                    {/* ---------------------- */}
                    <Route
                        path="/contracts"
                        element={
                            <ProtectedRoute>
                                <ContractList />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/contracts/create"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <CreateContract />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/contracts/create/:farmId"
                        element={
                            <ProtectedRoute allowedRoles={['farmer']}>
                                <CreateContract />
                            </ProtectedRoute>
                        }
                    />

                    <Route
                        path="/contracts/:id"
                        element={
                            <ProtectedRoute>
                                <ContractDetails />
                            </ProtectedRoute>
                        }
                    />

                    {/* Profile */}
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <Profile />
                            </ProtectedRoute>
                        }
                    />

                    {/* Unauthorized */}
                    <Route
                        path="/unauthorized"
                        element={
                            <div className="min-h-screen flex items-center justify-center">
                                <div className="text-center">
                                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                                        403
                                    </h1>
                                    <p className="text-xl text-gray-600 mb-8">Access Denied</p>
                                    <p className="text-gray-500">
                                        You don't have permission to access this page.
                                    </p>
                                </div>
                            </div>
                        }
                    />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />

                </Routes>
            </main>

            <Footer />

            {/* Toast Notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        theme: {
                            primary: '#4ade80',
                            secondary: '#000',
                        },
                    },
                    error: {
                        duration: 4000,
                        theme: {
                            primary: '#ef4444',
                            secondary: '#000',
                        },
                    },
                }}
            />
        </div>
    );
}


// ----------------------
// ROOT APP WRAPPER
// ----------------------
function App() {
    return (
        <AuthProvider>
            <Router>
                <AppContent />
            </Router>
        </AuthProvider>
    );
}

export default App;
