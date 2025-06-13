import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navRef = useRef(null);
  const { scrollToTop } = useScrollToTop();
  const { isAuthenticated, logout, getUserName } = useAuth();

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Close any open dropdowns when toggling mobile menu
    setOpenDropdown(null);
  };

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navRef.current && !navRef.current.contains(event.target)) {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        setOpenDropdown(null);
        setMobileMenuOpen(false);
      }
    };

    // Add event listeners
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscapeKey);

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, []);

  // Close dropdowns when navigating and scroll to top
  const handleLinkClick = () => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);

    // Smooth scroll to top with a small delay to ensure route change
    scrollToTop({
      behavior: 'smooth',
      delay: 100
    });
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    setOpenDropdown(null);
    setMobileMenuOpen(false);
    navigate('/');

    // Scroll to top after logout
    scrollToTop({
      behavior: 'smooth',
      delay: 100
    });
  };

  return (
    <nav ref={navRef} className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to="/"
            onClick={handleLinkClick}
            className="flex items-center space-x-2 text-xl font-bold text-white hover:text-blue-100 transition-colors"
          >
            <div className="bg-white/20 p-1 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span>AI E-Learning</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="text-white hover:text-blue-100 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-white/10"
            >
              Home
            </Link>

            {/* Dashboard - Only show to authenticated users */}
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className="text-white hover:text-blue-100 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-white/10"
              >
                Dashboard
              </Link>
            )}
            
            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('courses')}
                className={`text-white hover:text-blue-100 flex items-center transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10 ${
                  openDropdown === 'courses' ? 'bg-white/10 text-blue-100' : ''
                }`}
              >
                Courses
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                    openDropdown === 'courses' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'courses' && (
                <div className="absolute z-50 mt-2 w-64 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                  {/* Protected content - Dashboard first for authenticated users */}
                  {isAuthenticated() ? (
                    <>
                      <Link
                        to="/courses/dashboard"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div>
                          <div className="font-medium">Dashboard</div>
                          <div className="text-xs text-gray-500">Course overview</div>
                        </div>
                      </Link>
                      <div className="border-t border-gray-100 my-2"></div>
                    </>
                  ) : null}

                  {/* Always show Browse Courses */}
                  <Link
                    to="/courses/available"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium">Browse Courses</div>
                      <div className="text-xs text-gray-500">Explore catalog</div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded-full">New</span>
                  </Link>

                  {/* Additional protected content - only show to authenticated users */}
                  {isAuthenticated() ? (
                    <>
                      <Link
                        to="/courses/my-courses"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                          <div className="font-medium">My Courses</div>
                          <div className="text-xs text-gray-500">Enrolled courses</div>
                        </div>
                        <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2 py-0.5 rounded-full">New</span>
                      </Link>
                    </>
                  ) : (
                    <div className="px-4 py-3 text-gray-500 text-sm border-t border-gray-100 mt-2">
                      <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                        Sign in
                      </Link> to access your courses and dashboard
                    </div>
                  )}
                  <div className="border-t border-gray-100 my-2"></div>
                  <Link
                    to="/courses/materials"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-orange-500 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Course Materials</div>
                      <div className="text-xs text-gray-500">Resources & files</div>
                    </div>
                  </Link>
                  <Link
                    to="/courses/discussion"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-indigo-500 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                      <div className="font-medium">Discussions</div>
                      <div className="text-xs text-gray-500">Community forum</div>
                    </div>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Quiz Direct Link - Only show to authenticated users */}
            {isAuthenticated() && (
              <Link
                to="/quiz/dashboard"
                onClick={handleLinkClick}
                className="text-white hover:text-blue-100 transition-colors duration-200 px-3 py-2 rounded-md hover:bg-white/10"
              >
                Quiz
              </Link>
            )}

            {/* Classroom Dropdown - Only show to authenticated users */}
            {isAuthenticated() && (
              <div className="relative">
              <button
                onClick={() => toggleDropdown('classroom')}
                className={`text-white hover:text-blue-100 flex items-center transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10 ${
                  openDropdown === 'classroom' ? 'bg-white/10 text-blue-100' : ''
                }`}
              >
                Classroom
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                    openDropdown === 'classroom' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'classroom' && (
                <div className="absolute z-50 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/classroom/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-gray-500">Virtual classroom</div>
                    </div>
                  </Link>
                  <Link
                    to="/classroom/materials"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Materials</div>
                      <div className="text-xs text-gray-500">Shared resources</div>
                    </div>
                  </Link>
                  <Link
                    to="/classroom/chat"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <div>
                      <div className="font-medium">Live Chat</div>
                      <div className="text-xs text-gray-500">Real-time messaging</div>
                    </div>
                  </Link>
                  <Link
                    to="/classroom/recordings"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-red-500 group-hover:text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Recordings</div>
                      <div className="text-xs text-gray-500">Session replays</div>
                    </div>
                  </Link>
                  <Link
                    to="/classroom/schedule"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-orange-500 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-1 12a2 2 0 002 2h6a2 2 0 002-2L15 7" />
                    </svg>
                    <div>
                      <div className="font-medium">Schedule</div>
                      <div className="text-xs text-gray-500">Class timetable</div>
                    </div>
                  </Link>
                </div>
              )}
              </div>
            )}

            {/* Progress Dropdown - Only show to authenticated users */}
            {isAuthenticated() && (
              <div className="relative">
              <button
                onClick={() => toggleDropdown('progress')}
                className={`text-white hover:text-blue-100 flex items-center transition-all duration-200 px-3 py-2 rounded-md hover:bg-white/10 ${
                  openDropdown === 'progress' ? 'bg-white/10 text-blue-100' : ''
                }`}
              >
                Progress
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                    openDropdown === 'progress' ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openDropdown === 'progress' && (
                <div className="absolute z-50 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 animate-in slide-in-from-top-2 duration-200">
                  <Link
                    to="/progress/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-gray-500">Progress overview</div>
                    </div>
                  </Link>
                  <Link
                    to="/progress/reports"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Performance Reports</div>
                      <div className="text-xs text-gray-500">Detailed analytics</div>
                    </div>
                  </Link>
                  <Link
                    to="/progress/activity"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-yellow-500 group-hover:text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium">Activity Logs</div>
                      <div className="text-xs text-gray-500">Learning history</div>
                    </div>
                  </Link>
                  <Link
                    to="/progress/recommendations"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <div className="font-medium">AI Recommendations</div>
                      <div className="text-xs text-gray-500">Personalized tips</div>
                    </div>
                  </Link>
                </div>
              )}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            {isAuthenticated() ? (
              <div className="flex items-center space-x-4">
                {/* User greeting */}
                <span className="text-white text-sm hidden sm:block">
                  Welcome, {getUserName()?.split(' ')[0] || 'User'}!
                </span>

                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="bg-white text-blue-600 px-4 py-2 rounded-md font-medium hover:bg-blue-50 transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden text-white hover:text-blue-100 p-2 rounded-md hover:bg-white/10 transition-all duration-200"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-6 w-6 transition-transform duration-200 ${mobileMenuOpen ? 'rotate-90' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-blue-600 to-blue-700 border-t border-blue-500 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/"
              onClick={handleLinkClick}
              className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
            >
              🏠 Home
            </Link>

            {/* Dashboard - Only show to authenticated users */}
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
              >
                📊 Dashboard
              </Link>
            )}
            
            {/* Mobile Courses Menu */}
            <button 
              onClick={() => toggleDropdown('mobile-courses')} 
              className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
            >
              Courses
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === 'mobile-courses' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {openDropdown === 'mobile-courses' && (
              <div className="pl-4 space-y-1 bg-blue-700/30 rounded-md mx-2 py-2">
                {/* Protected content - Dashboard first for authenticated users */}
                {isAuthenticated() ? (
                  <>
                    <Link
                      to="/courses/dashboard"
                      onClick={handleLinkClick}
                      className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                    >
                      📊 Dashboard
                    </Link>
                  </>
                ) : null}

                {/* Always show Browse Courses */}
                <Link
                  to="/courses/available"
                  onClick={handleLinkClick}
                  className="flex items-center justify-between px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                >
                  <span>📚 Browse Courses</span>
                  <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">New</span>
                </Link>

                {/* Additional protected content - only show to authenticated users */}
                {isAuthenticated() ? (
                  <>
                    <Link
                      to="/courses/my-courses"
                      onClick={handleLinkClick}
                      className="flex items-center justify-between px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                    >
                      <span>✅ My Courses</span>
                      <span className="text-xs bg-purple-500 px-2 py-0.5 rounded-full">New</span>
                    </Link>
                    <Link
                      to="/courses/materials"
                      onClick={handleLinkClick}
                      className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                    >
                      📄 Course Materials
                    </Link>
                    <Link
                      to="/courses/discussion"
                      onClick={handleLinkClick}
                      className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                    >
                      💬 Discussions
                    </Link>
                  </>
                ) : (
                  <div className="px-3 py-2 text-blue-200 text-sm">
                    <Link to="/login" className="text-white hover:text-blue-100 font-medium">
                      🔐 Sign in
                    </Link> to access your courses
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile Quiz Direct Link - Only show to authenticated users */}
            {isAuthenticated() && (
              <Link
                to="/quiz/dashboard"
                className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors"
              >
                📝 Quiz
              </Link>
            )}

            {/* Mobile Classroom Menu - Only show to authenticated users */}
            {isAuthenticated() && (
              <button
                onClick={() => toggleDropdown('mobile-classroom')}
                className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
              >
                Classroom
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === 'mobile-classroom' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {isAuthenticated() && openDropdown === 'mobile-classroom' && (
              <div className="pl-4">
                <Link to="/classroom/dashboard" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Dashboard</Link>
                <Link to="/classroom/materials" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Course Materials</Link>
                <Link to="/classroom/chat" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Chat Feature</Link>
                <Link to="/classroom/recordings" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Session Recordings</Link>
              </div>
            )}

            {/* Mobile Progress Menu - Only show to authenticated users */}
            {isAuthenticated() && (
              <button
                onClick={() => toggleDropdown('mobile-progress')}
                className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
              >
                Progress
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === 'mobile-progress' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {isAuthenticated() && openDropdown === 'mobile-progress' && (
              <div className="pl-4">
                <Link to="/progress/dashboard" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Dashboard</Link>
                <Link to="/progress/reports" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Performance Reports</Link>
                <Link to="/progress/activity" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Activity Logs</Link>
                <Link to="/progress/recommendations" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">Personalized Recommendations</Link>
              </div>
            )}

            {/* Mobile Authentication Section */}
            <div className="border-t border-blue-500 mt-4 pt-4">
              {isAuthenticated() ? (
                <div className="space-y-2">
                  {/* User greeting */}
                  <div className="px-3 py-2 text-white text-sm">
                    👋 Welcome, {getUserName()?.split(' ')[0] || 'User'}!
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-white hover:bg-red-600 rounded-md transition-colors duration-150 flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span>🚪 Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={handleLinkClick}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150 flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>🔐 Sign In</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;


