import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
    FaBars,
    FaTimes,
    FaUser,
    FaSignOutAlt,
    FaTractor,
    FaHandshake,
    FaCog
} from 'react-icons/fa';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const toggleProfileMenu = () => setIsProfileMenuOpen(!isProfileMenuOpen);

    const getNavLinks = () => {
        if (!user) return [];

        const userRole =
            user.user_type === 'F' || user.user_type === 'FT'
                ? 'farmer'
                : user.user_type === 'T'
                ? 'trader'
                : user.user_type === 'A'
                ? 'admin'
                : null;

        switch (userRole) {
            case 'farmer':
                return [
                    { to: '/farmer/dashboard', label: 'Dashboard', icon: FaTractor },
                    { to: '/farmer/farms', label: 'My Farms', icon: FaTractor },
                    { to: '/contracts', label: 'Contracts', icon: FaHandshake },
                ];
            case 'trader':
                return [
                    { to: '/trader/dashboard', label: 'Dashboard', icon: FaHandshake },
                    { to: '/contracts', label: 'Contracts', icon: FaHandshake },
                ];
            case 'admin':
                return [
                    { to: '/admin/dashboard', label: 'Dashboard', icon: FaCog },
                    { to: '/contracts', label: 'All Contracts', icon: FaHandshake },
                ];
            default:
                return [];
        }
    };

    const navLinks = getNavLinks();

    return (
        <nav className="bg-white shadow-lg sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">

                    {/* Logo */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <FaTractor className="h-8 w-8 text-green-600" />
                            <span className="text-xl font-bold text-gray-900">
                                Contract Farming J & K
                            </span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {user ? (
                            <>
                                {navLinks.map((link) => {
                                    const IconComponent = link.icon;
                                    return (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className="flex items-center space-x-1 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                        >
                                            <IconComponent className="h-4 w-4" />
                                            <span>{link.label}</span>
                                        </Link>
                                    );
                                })}

                                {/* Profile Dropdown */}
                                <div className="relative">
                                    <button
                                        onClick={toggleProfileMenu}
                                        className="flex items-center space-x-2 text-gray-700 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
                                    >
                                        <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                                            <span className="text-white text-sm font-medium">
                                                {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                        <span>{user.full_name || 'User'}</span>
                                    </button>

                                    {isProfileMenuOpen && (
                                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-50">
                                            <div className="px-4 py-2 text-sm text-gray-500 border-b">
                                                <div className="break-words overflow-hidden">
                                                    {user.email_id}
                                                </div>
                                                <div className="text-xs text-green-600 capitalize mt-1">
                                                    {user.user_type === 'F' || user.user_type === 'FT'
                                                        ? 'Farmer'
                                                        : user.user_type === 'T'
                                                        ? 'Trader'
                                                        : user.user_type === 'A'
                                                        ? 'Admin'
                                                        : 'User'}
                                                </div>
                                            </div>

                                            <Link
                                                to="/profile"
                                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsProfileMenuOpen(false)}
                                            >
                                                <FaUser className="mr-2 h-4 w-4" />
                                                Profile
                                            </Link>

                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            >
                                                <FaSignOutAlt className="mr-2 h-4 w-4" />
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">

                                {/* 🔥 ADDED SIGNUP BUTTON */}
                                <Link
                                    to="/signup"
                                    className="text-green-600 border border-green-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-green-50 transition-colors"
                                >
                                    Signup
                                </Link>

                                <Link
                                    to="/login"
                                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={toggleMenu}
                            className="text-gray-700 hover:text-green-600 focus:outline-none"
                        >
                            {isMenuOpen ? (
                                <FaTimes className="h-6 w-6" />
                            ) : (
                                <FaBars className="h-6 w-6" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden">
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
                            {user ? (
                                <>
                                    {navLinks.map((link) => {
                                        const IconComponent = link.icon;
                                        return (
                                            <Link
                                                key={link.to}
                                                to={link.to}
                                                className="flex items-center space-x-2 text-gray-700 hover:text-green-600 block px-3 py-2 rounded-md text-base font-medium"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <IconComponent className="h-4 w-4" />
                                                <span>{link.label}</span>
                                            </Link>
                                        );
                                    })}

                                    <div className="border-t border-gray-200 pt-4">
                                        <div className="flex items-center px-3 py-2">
                                            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                                                <span className="text-white text-sm font-medium">
                                                    {user.full_name?.charAt(0).toUpperCase() || 'U'}
                                                </span>
                                            </div>

                                            <div>
                                                <div className="text-base font-medium text-gray-800">
                                                    {user.full_name || 'User'}
                                                </div>
                                                <div className="text-sm text-gray-500 break-words overflow-hidden">
                                                    {user.email_id}
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            to="/profile"
                                            className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <FaUser className="mr-2 h-4 w-4" />
                                            Profile
                                        </Link>

                                        <button
                                            onClick={() => {
                                                handleLogout();
                                                setIsMenuOpen(false);
                                            }}
                                            className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600"
                                        >
                                            <FaSignOutAlt className="mr-2 h-4 w-4" />
                                            Logout
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* 🔥 MOBILE SIGNUP */}
                                    <Link
                                        to="/signup"
                                        className="text-green-600 border border-green-600 block px-3 py-2 rounded-md text-base font-medium hover:bg-green-50"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Signup
                                    </Link>

                                    {/* MOBILE LOGIN */}
                                    <Link
                                        to="/login"
                                        className="bg-green-600 hover:bg-green-700 text-white block px-3 py-2 rounded-md text-base font-medium"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        Login
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
