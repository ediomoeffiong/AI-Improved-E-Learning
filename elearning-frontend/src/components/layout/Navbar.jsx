import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useScrollToTop } from '../../hooks/useScrollToTop';
import { useAuth } from '../../contexts/AuthContext';
import { isOnline } from '../../utils/pwa';

const Navbar = ({ isScrolled = false }) => {
  const navigate = useNavigate();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const navRef = useRef(null);
  const { scrollToTop } = useScrollToTop();
  const { isAuthenticated, logout, getUserName, getUserEmail, hasInstitutionFunctions } = useAuth();

  // Check demo mode status
  useEffect(() => {
    const checkDemoMode = () => {
      const demoEnabled = localStorage.getItem('demoModeEnabled') === 'true';
      const token = localStorage.getItem('token');
      const hasDemo = token === 'demo-token' || token?.startsWith('mock-jwt-token');
      return demoEnabled || hasDemo;
    };

    setIsDemoMode(checkDemoMode());

    const handleDemoModeChange = (event) => {
      setIsDemoMode(event.detail.enabled);
    };

    window.addEventListener('demoModeChanged', handleDemoModeChange);

    const interval = setInterval(() => {
      setIsDemoMode(checkDemoMode());
    }, 1000);

    return () => {
      window.removeEventListener('demoModeChanged', handleDemoModeChange);
      clearInterval(interval);
    };
  }, []);

  // Check offline status
  useEffect(() => {
    const checkOfflineStatus = async () => {
      const online = await isOnline();
      setIsOffline(!online);
    };

    // Initial check
    checkOfflineStatus();

    // Listen for online/offline events
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check
    const interval = setInterval(checkOfflineStatus, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'New Course Available',
      message: 'Advanced React Development course is now available for enrollment.',
      type: 'course',
      time: '2 hours ago',
      read: false,
      icon: '📚'
    },
    {
      id: 2,
      title: 'Assignment Due Soon',
      message: 'JavaScript Fundamentals assignment is due in 2 days.',
      type: 'assignment',
      time: '4 hours ago',
      read: false,
      icon: '📝'
    },
    {
      id: 3,
      title: 'Quiz Results Available',
      message: 'Your React Basics quiz results are now available.',
      type: 'quiz',
      time: '1 day ago',
      read: true,
      icon: '✅'
    },
    {
      id: 4,
      title: 'Live Session Reminder',
      message: 'Node.js workshop starts in 30 minutes.',
      type: 'session',
      time: '1 day ago',
      read: false,
      icon: '🎥'
    },
    {
      id: 5,
      title: 'Achievement Unlocked',
      message: 'Congratulations! You earned the "Quick Learner" badge.',
      type: 'achievement',
      time: '2 days ago',
      read: true,
      icon: '🏆'
    }
  ]);

  // Get unread notifications count
  const unreadCount = notifications.filter(n => !n.read).length;

  // Notification functions
  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const deleteNotification = (notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  };

  const toggleDropdown = (menu) => {
    setOpenDropdown(openDropdown === menu ? null : menu);
    // If opening notifications dropdown, mark all as read after a short delay
    if (menu === 'notifications') {
      setTimeout(() => {
        markAllAsRead();
      }, 1000);
    }
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
    if (isOffline) {
      alert('❌ Logout is disabled while offline. Please check your internet connection.');
      return;
    }

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

  // Handle demo mode toggle
  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      window.disableDemoMode();
      // Clear demo tokens
      if (localStorage.getItem('token')?.includes('demo') || localStorage.getItem('token')?.includes('mock')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      window.enableDemoMode();
    }
    setOpenDropdown(null);
    window.location.reload();
  };

  return (
    <nav ref={navRef} className={`w-full relative z-50 transition-all duration-300 ${
      isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-lg dark:bg-gray-900/95'
        : 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${
          isScrolled ? 'h-14' : 'h-16'
        }`}>
          <Link
            to="/"
            onClick={handleLinkClick}
            className={`flex items-center space-x-3 text-xl font-bold transition-colors group ${
              isScrolled
                ? 'text-gray-900 dark:text-white hover:text-blue-600'
                : 'text-white hover:text-blue-100'
            }`}
          >
            <div className={`p-2 rounded-lg shadow-md group-hover:shadow-lg transition-all duration-200 ${
              isScrolled
                ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                : 'bg-white/20'
            }`}>
              <svg className={`w-6 h-6 transition-colors duration-200 ${
                isScrolled ? 'text-white' : 'text-white'
              }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <span>AI E-Learning</span>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {/* Home - Only show to non-authenticated users */}
            {!isAuthenticated() && (
              <Link
                to="/"
                onClick={handleLinkClick}
                className={`transition-colors duration-200 px-3 py-2 rounded-md ${
                  isScrolled
                    ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                    : 'text-white hover:text-blue-100 hover:bg-white/10'
                }`}
              >
                Home
              </Link>
            )}

            {/* Dashboard - Only show to authenticated users */}
            {isAuthenticated() && (
              <Link
                to="/dashboard"
                onClick={handleLinkClick}
                className={`transition-colors duration-200 px-3 py-2 rounded-md ${
                  isScrolled
                    ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                    : 'text-white hover:text-blue-100 hover:bg-white/10'
                }`}
              >
                Dashboard
              </Link>
            )}
            
            {/* Courses Dropdown */}
            <div className="relative">
              <button
                onClick={() => toggleDropdown('courses')}
                className={`flex items-center transition-all duration-200 px-3 py-2 rounded-md ${
                  isScrolled
                    ? `text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                        openDropdown === 'courses' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700' : ''
                      }`
                    : `text-white hover:text-blue-100 hover:bg-white/10 ${
                        openDropdown === 'courses' ? 'bg-white/10 text-blue-100' : ''
                      }`
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

            {/* Classroom Dropdown - Only show to authenticated users with institution functions */}
            {isAuthenticated() && hasInstitutionFunctions() && (
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
                  <div className="border-t border-gray-100 my-2"></div>
                  <div className="px-4 py-2">
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CBT System</div>
                  </div>
                  <Link
                    to="/cbt/dashboard"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">Dashboard</div>
                      <div className="text-xs text-gray-500">CBT overview</div>
                    </div>
                  </Link>
                  <Link
                    to="/cbt/practice"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <div className="font-medium">Practice</div>
                      <div className="text-xs text-gray-500">Practice tests</div>
                    </div>
                  </Link>
                  <Link
                    to="/cbt/take-assessment"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-orange-500 group-hover:text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="font-medium">Take Assessment</div>
                      <div className="text-xs text-gray-500">Official exams</div>
                    </div>
                  </Link>
                  <Link
                    to="/cbt/view-results"
                    onClick={handleLinkClick}
                    className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                  >
                    <svg className="w-4 h-4 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <div>
                      <div className="font-medium">View Results</div>
                      <div className="text-xs text-gray-500">Test scores</div>
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
                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('user')}
                    className={`flex items-center space-x-3 transition-all duration-200 px-3 py-2 rounded-md ${
                      isScrolled
                        ? `text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                            openDropdown === 'user' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700' : ''
                          }`
                        : `text-white hover:text-blue-100 hover:bg-white/10 ${
                            openDropdown === 'user' ? 'bg-white/10 text-blue-100' : ''
                          }`
                    }`}
                    type="button"
                  >
                    {/* User Avatar */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isScrolled
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700'
                        : 'bg-white'
                    }`}>
                      <svg className={`w-5 h-5 transition-colors duration-200 ${
                        isScrolled ? 'text-white' : 'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>

                    {/* Welcome message - between icon and dropdown arrow */}
                    <span className={`text-sm hidden sm:block transition-colors duration-200 ${
                      isScrolled
                        ? 'text-gray-700 dark:text-gray-300'
                        : 'text-white'
                    }`}>
                      Welcome, {getUserName()?.split(' ')[0] || 'User'}
                    </span>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openDropdown === 'user' ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === 'user' && (
                    <div className="absolute right-0 top-full z-[60] mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 border border-gray-100">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{getUserName() || 'User'}</p>
                        <p className="text-sm text-gray-500 truncate">{getUserEmail() || 'user@example.com'}</p>
                      </div>

                      {/* Menu Items */}
                      <Link
                        to="/dashboard"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-blue-500 group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span className="font-medium">Dashboard</span>
                      </Link>

                      <Link
                        to="/profile"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-green-500 group-hover:text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">My Profile</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={handleLinkClick}
                        className="flex items-center px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
                      >
                        <svg className="w-4 h-4 mr-3 text-purple-500 group-hover:text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="font-medium">Settings</span>
                      </Link>

                      {/* Demo Mode Toggle */}
                      <button
                        onClick={handleToggleDemoMode}
                        className={`flex items-center w-full px-4 py-3 transition-colors duration-150 group ${
                          isDemoMode
                            ? 'text-amber-700 hover:bg-amber-50 hover:text-amber-800'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-800'
                        }`}
                      >
                        <svg className={`w-4 h-4 mr-3 group-hover:scale-110 transition-transform ${
                          isDemoMode ? 'text-amber-500' : 'text-gray-500'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                        </svg>
                        <span className="font-medium">
                          {isDemoMode ? 'Exit Demo Mode' : 'Enable Demo Mode'}
                        </span>
                        {isDemoMode && (
                          <span className="ml-auto text-xs bg-amber-100 text-amber-800 px-2 py-1 rounded-full">
                            Active
                          </span>
                        )}
                      </button>

                      <div className="border-t border-gray-100 my-2"></div>

                      <button
                        onClick={handleLogout}
                        disabled={isOffline}
                        className={`flex items-center w-full px-4 py-3 transition-colors duration-150 group ${
                          isOffline
                            ? 'text-gray-400 cursor-not-allowed opacity-50'
                            : 'text-gray-700 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <svg className={`w-4 h-4 mr-3 ${
                          isOffline ? 'text-gray-400' : 'text-red-500 group-hover:text-red-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <span className="font-medium">
                          {isOffline ? 'Logout (Offline)' : 'Logout'}
                        </span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown('notifications')}
                    className={`relative flex items-center transition-all duration-200 px-3 py-2 rounded-md ${
                      isScrolled
                        ? `text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 ${
                            openDropdown === 'notifications' ? 'bg-blue-50 text-blue-600 dark:bg-gray-700' : ''
                          }`
                        : `text-white hover:text-blue-100 hover:bg-white/10 ${
                            openDropdown === 'notifications' ? 'bg-white/10 text-blue-100' : ''
                          }`
                    }`}
                    type="button"
                  >
                    {/* Notification Bell Icon */}
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>

                    {/* Notification Count Badge */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {openDropdown === 'notifications' && (
                    <div className="absolute right-0 top-full z-[60] mt-2 w-80 bg-white rounded-xl shadow-2xl py-2 border border-gray-100 max-h-96 overflow-y-auto">
                      {/* Header */}
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllAsRead}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 hover:bg-gray-50 transition-colors duration-150 border-b border-gray-50 last:border-0 ${
                                !notification.read ? 'bg-blue-50/50' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                  <span className="text-2xl">{notification.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <p className={`text-sm font-medium text-gray-900 ${!notification.read ? 'font-semibold' : ''}`}>
                                        {notification.title}
                                      </p>
                                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-2">
                                        {notification.time}
                                      </p>
                                    </div>
                                    <div className="flex items-center space-x-1 ml-2">
                                      {!notification.read && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                      )}
                                      <button
                                        onClick={() => deleteNotification(notification.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors duration-150"
                                        title="Delete notification"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="px-4 py-8 text-center">
                            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <p className="text-gray-500 text-sm">No notifications</p>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {notifications.length > 0 && (
                        <div className="px-4 py-3 border-t border-gray-100">
                          <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
                            View all notifications
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={handleLinkClick}
                className={`px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2 ${
                  isScrolled
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                    : 'bg-white text-blue-600 hover:bg-blue-50'
                }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Sign In</span>
              </Link>
            )}
            <button
              onClick={toggleMobileMenu}
              className={`md:hidden p-2 rounded-md transition-all duration-200 ${
                isScrolled
                  ? 'text-gray-700 dark:text-gray-300 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700'
                  : 'text-white hover:text-blue-100 hover:bg-white/10'
              }`}
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
            {/* Home - Only show to non-authenticated users */}
            {!isAuthenticated() && (
              <Link
                to="/"
                onClick={handleLinkClick}
                className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
              >
                🏠 Home
              </Link>
            )}

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

            {/* Mobile Classroom Menu - Only show to authenticated users with institution functions */}
            {isAuthenticated() && hasInstitutionFunctions() && (
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
            {isAuthenticated() && hasInstitutionFunctions() && openDropdown === 'mobile-classroom' && (
              <div className="pl-4 space-y-1 bg-blue-700/30 rounded-md mx-2 py-2">
                <Link to="/classroom/dashboard" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">🏫 Dashboard</Link>
                <div className="px-3 py-1 text-xs text-blue-200 font-semibold uppercase tracking-wide">CBT System</div>
                <Link to="/cbt/dashboard" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">📊 Dashboard</Link>
                <Link to="/cbt/practice" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">📚 Practice</Link>
                <Link to="/cbt/take-assessment" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">✅ Take Assessment</Link>
                <Link to="/cbt/view-results" className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md">📈 View Results</Link>
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



            {/* Mobile User Menu - Only show to authenticated users */}
            {isAuthenticated() && (
              <button
                onClick={() => toggleDropdown('mobile-user')}
                className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span>👤 User Menu</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === 'mobile-user' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {isAuthenticated() && openDropdown === 'mobile-user' && (
              <div className="pl-4 space-y-1 bg-blue-700/30 rounded-md mx-2 py-2">
                {/* User Info */}
                <div className="px-3 py-2 text-white text-sm border-b border-blue-500/30 mb-2">
                  <div className="font-medium">{getUserName() || 'User'}</div>
                  <div className="text-blue-200 text-xs truncate">{getUserEmail()}</div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={handleLinkClick}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                >
                  📊 Dashboard
                </Link>
                <Link
                  to="/profile"
                  onClick={handleLinkClick}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                >
                  👤 My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={handleLinkClick}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md transition-colors duration-150"
                >
                  ⚙️ Settings
                </Link>
                <button
                  onClick={handleToggleDemoMode}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${
                    isDemoMode
                      ? 'text-amber-200 hover:bg-amber-600'
                      : 'text-white hover:bg-gray-600'
                  }`}
                >
                  {isDemoMode ? '🎭 Exit Demo Mode' : '🎭 Enable Demo Mode'}
                  {isDemoMode && <span className="ml-2 text-xs">(Active)</span>}
                </button>
                <button
                  onClick={handleLogout}
                  disabled={isOffline}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors duration-150 ${
                    isOffline
                      ? 'text-gray-400 cursor-not-allowed opacity-50'
                      : 'text-white hover:bg-red-600'
                  }`}
                >
                  🚪 {isOffline ? 'Logout (Offline)' : 'Logout'}
                </button>
              </div>
            )}

            {/* Mobile Notifications Menu - Only show to authenticated users */}
            {isAuthenticated() && (
              <button
                onClick={() => toggleDropdown('mobile-notifications')}
                className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>🔔 Notifications {unreadCount > 0 && `(${unreadCount})`}</span>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === 'mobile-notifications' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
            {isAuthenticated() && openDropdown === 'mobile-notifications' && (
              <div className="pl-4 space-y-1 bg-blue-700/30 rounded-md mx-2 py-2 max-h-64 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between px-3 py-2 border-b border-blue-500/30 mb-2">
                  <span className="text-white font-medium text-sm">Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-200 hover:text-white"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                {/* Notifications List */}
                {notifications.length > 0 ? (
                  notifications.slice(0, 5).map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-3 py-2 rounded-md transition-colors duration-150 ${
                        !notification.read ? 'bg-blue-600/50' : 'hover:bg-blue-700'
                      }`}
                    >
                      <div className="flex items-start space-x-2">
                        <span className="text-sm">{notification.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm text-white ${!notification.read ? 'font-semibold' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-xs text-blue-200 mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-blue-300 mt-1">
                            {notification.time}
                          </p>
                        </div>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-blue-300 hover:text-red-400 transition-colors duration-150"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-4 text-center">
                    <p className="text-blue-200 text-sm">No notifications</p>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Authentication Section for non-authenticated users */}
            <div className="border-t border-blue-500 mt-4 pt-4">
              {!isAuthenticated() && (
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


