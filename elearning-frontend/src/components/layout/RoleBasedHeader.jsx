import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';
import { hasSuperAdminSession, getCurrentSessionUser } from '../../utils/sessionManager';

const RoleBasedHeader = () => {
  const { user, logout, getUserName } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Use session manager for reliable super admin detection
  const hasSuperAdmin = hasSuperAdminSession();
  const isSuperAdmin = hasSuperAdmin ? getCurrentSessionUser() : null;

  console.log('🔍 RoleBasedHeader Session Debug:', {
    hasSuperAdmin,
    isSuperAdmin: !!isSuperAdmin,
    superAdminRole: isSuperAdmin?.role,
    user: !!user,
    userRole: user?.role
  });

  const currentUser = isSuperAdmin || user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
      // Close dropdowns when clicking outside
      if (!event.target.closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
  };

  const handleLogout = () => {
    if (isSuperAdmin) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      navigate('/super-admin-login');
    } else {
      logout();
      navigate('/login');
    }
  };

  const getSuperAdminNavigationItems = () => {
    if (isSuperAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', type: 'link' },
        {
          name: 'Course Management',
          type: 'dropdown',
          items: [
            { name: '📚 All Courses', href: '/super-admin/courses', description: 'View and manage all courses' },
            { name: '➕ Create Course', href: '/super-admin/courses/create', description: 'Form to create new courses' },
            { name: '📂 Categories', href: '/super-admin/categories', description: 'Manage course categories' },
            { name: '📊 Course Analytics', href: '/super-admin/course-analytics', description: 'View course performance metrics' }
          ]
        },
        {
          name: 'Quiz Management',
          type: 'dropdown',
          items: [
            { name: '📝 All Quizzes', href: '/super-admin/quizzes', description: 'View and manage all quizzes' },
            { name: '➕ Create Quiz', href: '/super-admin/quizzes/create', description: 'Form to create new quizzes' },
            { name: '📈 Quiz Results', href: '/super-admin/quiz-results', description: 'View and analyze quiz performance' }
          ]
        },
        {
          name: 'Progress',
          type: 'dropdown',
          items: [
            { name: '📊 Progress Overview', href: '/super-admin/progress-overview', description: 'Aggregate progress metrics' },
            { name: '✅ Course Completions', href: '/super-admin/course-completions', description: 'Detailed completion tracking' },
            { name: '🛤️ Learning Paths', href: '/super-admin/learning-paths', description: 'Monitor learning path progress' },
            { name: '🔧 Intervention Tools', href: '/super-admin/intervention-tools', description: 'Help struggling users' }
          ]
        },
        { name: 'User Management', href: '/super-admin/users', type: 'link' },
        { name: 'Institutions', href: '/super-admin/institutions', type: 'link' },
        { name: 'Activity Monitor', href: '/super-admin/activity-monitor', type: 'link' },
        { name: 'User Approvals', href: '/super-admin/user-approvals', type: 'link' }
      ];
    }
    return [];
  };

  const getPublicNavigationItems = () => {
    return [
      { name: 'Home', href: '/', type: 'link' },
      {
        name: 'Courses',
        type: 'dropdown',
        items: [
          { name: 'Browse Courses', href: '/courses/available', description: 'Explore catalog', badge: 'New', icon: '📚' },
          { name: 'Course Materials', href: '/courses/materials', description: 'Resources & files', icon: '📄' },
          { name: 'Discussions', href: '/courses/discussion', description: 'Community forum', icon: '💬' }
        ]
      },
      { name: 'Quiz', href: '/quiz', type: 'link' }
    ];
  };

  const getNavigationItems = () => {
    console.log('🔍 Getting navigation items:', {
      isSuperAdmin: !!isSuperAdmin,
      user: !!user,
      userRole: user?.role,
      superAdminRole: isSuperAdmin?.role
    });

    if (isSuperAdmin) {
      console.log('🎯 Returning super admin navigation items');
      return getSuperAdminNavigationItems();
    }

    if (!user) {
      console.log('🎯 No user found, returning public navigation');
      return getPublicNavigationItems();
    }

    console.log('🎯 Returning navigation for user role:', user.role);
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return [
          { name: 'Dashboard', href: '/dashboard', type: 'link' },
          {
            name: 'User Management',
            type: 'dropdown',
            items: [
              { name: '✅ User Approvals', href: '/admin/approvals', description: 'Approve pending user registrations' },
              { name: '🎓 Students', href: '/admin/students', description: 'Manage student accounts' },
              { name: '👨‍🏫 Instructors', href: '/admin/instructors', description: 'Manage instructor accounts' },
              { name: '🛡️ Moderators', href: '/admin/moderators', description: 'Manage moderator accounts' },
              { name: '📊 User Reports', href: '/admin/user-reports', description: 'View user activity reports' }
            ]
          },
          {
            name: 'Institution Management',
            type: 'dropdown',
            items: [
              { name: '⚙️ Institution Settings', href: '/admin/institution-settings', description: 'Configure institution settings' },
              { name: '🏢 Department Management', href: '/admin/departments', description: 'Manage institution departments' },
              { name: '📚 Course Oversight', href: '/admin/course-oversight', description: 'Oversee institution courses' },
              { name: '📋 Institution Reports', href: '/admin/reports', description: 'Generate institution reports' }
            ]
          }
        ];
      
      case USER_ROLES.MODERATOR:
        return [
          { name: 'Dashboard', href: '/dashboard', type: 'link' },
          {
            name: 'User Monitoring',
            type: 'dropdown',
            items: [
              { name: '👥 Assigned Users', href: '/moderator/users', description: 'Monitor assigned users' },
              { name: '📈 User Activities', href: '/moderator/activities', description: 'Track user activities and engagement' },
              { name: '📊 User Reports', href: '/moderator/user-reports', description: 'Generate user activity reports' },
              { name: '🤝 User Assistance', href: '/moderator/assistance', description: 'Provide support to users' }
            ]
          },
          {
            name: 'Content Moderation',
            type: 'dropdown',
            items: [
              { name: '🚩 Flagged Items', href: '/moderator/flagged', description: 'Review flagged content and activities' },
              { name: '📝 Content Review', href: '/moderator/content-review', description: 'Review and moderate user content' },
              { name: '⚠️ Violation Reports', href: '/moderator/violations', description: 'Handle policy violation reports' },
              { name: '🔧 Moderation Tools', href: '/moderator/tools', description: 'Access moderation tools and settings' }
            ]
          }
        ];

      case USER_ROLES.INSTRUCTOR:
        return [
          { name: 'Dashboard', href: '/dashboard', type: 'link' },
          {
            name: 'Course Management',
            type: 'dropdown',
            items: [
              { name: '📚 My Courses', href: '/instructor/courses', description: 'Manage your created courses' },
              { name: '➕ Create Course', href: '/instructor/courses/create', description: 'Create a new course' },
              { name: '📊 Course Analytics', href: '/instructor/analytics', description: 'View course performance metrics' },
              { name: '📄 Course Materials', href: '/instructor/materials', description: 'Manage course resources and materials' }
            ]
          },
          {
            name: 'Student Management',
            type: 'dropdown',
            items: [
              { name: '🎓 My Students', href: '/instructor/students', description: 'View and manage your students' },
              { name: '📈 Student Progress', href: '/instructor/student-progress', description: 'Track student learning progress' },
              { name: '📝 Grade Management', href: '/instructor/grades', description: 'Manage student grades and assessments' },
              { name: '📋 Student Reports', href: '/instructor/student-reports', description: 'Generate student performance reports' }
            ]
          },
          {
            name: 'Content Creation',
            type: 'dropdown',
            items: [
              { name: '✏️ Create Content', href: '/instructor/create', description: 'Create new course content' },
              { name: '📝 Quiz Builder', href: '/instructor/quiz-builder', description: 'Create and manage quizzes' },
              { name: '📋 Assignment Creator', href: '/instructor/assignments', description: 'Create and manage assignments' },
              { name: '🎬 Media Library', href: '/instructor/media', description: 'Manage course videos and media' }
            ]
          }
        ];

      case USER_ROLES.STUDENT:
      default:
        return [
          { name: 'Dashboard', href: '/dashboard', type: 'link' },
          {
            name: 'Courses',
            type: 'dropdown',
            items: [
              { name: '📊 Course Dashboard', href: '/courses/dashboard', description: 'View your course progress and overview' },
              { name: '📚 All Courses', href: '/courses', description: 'Browse all available courses' },
              { name: '🎓 My Courses', href: '/courses/my-courses', description: 'View your enrolled courses' },
              { name: '📂 Course Categories', href: '/courses/categories', description: 'Browse courses by category' },
              { name: '🔍 Course Search', href: '/courses/search', description: 'Search for specific courses' }
            ]
          },
          {
            name: 'Quizzes',
            type: 'dropdown',
            items: [
              { name: '📊 Quiz Dashboard', href: '/quiz/dashboard', description: 'View your quiz performance overview' },
              { name: '📝 Available Quizzes', href: '/quizzes', description: 'Browse all available quizzes' },
              { name: '📈 My Quiz Results', href: '/quizzes/results', description: 'View your quiz scores and history' },
              { name: '🎯 Practice Tests', href: '/quizzes/practice', description: 'Take practice quizzes' },
              { name: '📂 Quiz Categories', href: '/quizzes/categories', description: 'Browse quizzes by subject' }
            ]
          },
          {
            name: 'Progress',
            type: 'dropdown',
            items: [
              { name: '📊 Progress Dashboard', href: '/progress/dashboard', description: 'View your overall learning progress' },
              { name: '📋 Performance Reports', href: '/progress/reports', description: 'Detailed performance analytics' },
              { name: '📝 Activity Logs', href: '/progress/activity', description: 'View your learning activity history' },
              { name: '🏆 Achievements', href: '/progress/achievements', description: 'View your earned badges and achievements' },
              { name: '💡 Personalized Recommendations', href: '/progress/recommendations', description: 'Get AI-powered learning suggestions' }
            ]
          }
        ];
    }
  };



  const getHeaderColor = () => {
    console.log('🎨 getHeaderColor Debug:', {
      isSuperAdmin: !!isSuperAdmin,
      user: !!user,
      userRole: user?.role,
      superAdminRole: isSuperAdmin?.role
    });

    if (isSuperAdmin) {
      console.log('🔴 Returning super admin color (red/orange)');
      return 'bg-gradient-to-r from-red-600 to-orange-600';
    }

    if (!user) {
      console.log('🔵 Returning default color (blue/purple) - no user');
      return 'bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800';
    }

    console.log('🔵 Returning role-based color for user role:', user.role);
    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case USER_ROLES.MODERATOR:
        return 'bg-gradient-to-r from-orange-600 to-yellow-600';
      case USER_ROLES.INSTRUCTOR:
        return 'bg-gradient-to-r from-purple-600 to-pink-600';
      case USER_ROLES.STUDENT:
        return 'bg-gradient-to-r from-blue-600 to-purple-600';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600';
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className={`${getHeaderColor()} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="text-lg font-semibold text-white hidden sm:inline">AI E-Learning</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item) => (
              item.type === 'dropdown' ? (
                <div key={item.name} className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className="flex items-center space-x-2 text-white text-opacity-90 hover:text-white px-3 py-2 rounded-lg hover:bg-black hover:bg-opacity-20 hover:shadow-lg transition-all duration-200"
                  >
                    <span className="font-medium">{item.name}</span>
                    <svg
                      className={`w-4 h-4 ml-1 transition-transform duration-200 ${
                        openDropdown === item.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute z-50 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 animate-in slide-in-from-top-2 duration-200">
                      {item.items.map((subItem, index) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setOpenDropdown(null)}
                          className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 group"
                        >
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 dark:text-blue-400">
                              {subItem.icon || '📚'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="font-medium flex items-center">
                              {subItem.name}
                              {subItem.badge && (
                                <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  {subItem.badge}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{subItem.description}</div>
                          </div>
                        </Link>
                      ))}
                      {/* Special message for non-authenticated users on Courses dropdown */}
                      {!currentUser && item.name === 'Courses' && (
                        <div className="border-t border-gray-200 dark:border-gray-700 mt-2 pt-2">
                          <div className="px-4 py-3 text-center">
                            <Link
                              to="/login"
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
                              onClick={() => setOpenDropdown(null)}
                            >
                              Sign in
                            </Link>
                            <span className="text-gray-600 dark:text-gray-400"> to access your courses and dashboard</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-2 text-white text-opacity-90 hover:text-white px-3 py-2 rounded-lg hover:bg-black hover:bg-opacity-20 hover:shadow-lg transition-all duration-200"
                >
                  <span className="font-medium">{item.name}</span>
                </Link>
              )
            ))}
          </nav>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications - Only show for authenticated users */}
            {currentUser && (
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="p-2 text-white text-opacity-90 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                  </span>
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Notifications</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">New user registration</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">2 minutes ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">System maintenance scheduled</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">Quiz completion rate improved</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-white hover:text-blue-100 p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* User Menu or Auth Buttons */}
            {currentUser ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="group flex items-center space-x-3 text-white/90 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all duration-300 ease-out hover:shadow-lg hover:shadow-black/10"
                >
                  {/* Enhanced Avatar */}
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center ring-2 ring-white/20 group-hover:ring-white/30 transition-all duration-300">
                      <span className="text-sm font-bold tracking-wide">
                        {(getUserName() || currentUser?.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full ring-2 ring-white/20"></div>
                  </div>

                  {/* User Info */}
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold leading-tight">{getUserName() || currentUser?.name}</p>
                    <div className="flex items-center space-x-1.5 mt-0.5">
                      <span className="text-xs opacity-90">{ROLE_ICONS[currentUser?.role]}</span>
                      <p className="text-xs font-medium opacity-75 capitalize">
                        {currentUser?.role?.replace('_', ' ')}
                      </p>
                    </div>
                  </div>

                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden">
                  {/* User Info Header */}
                  <div className="p-5 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-gray-700/50 dark:to-gray-600/50 border-b border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-lg">
                          {(getUserName() || currentUser?.name || 'U').charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {getUserName() || currentUser?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {currentUser?.email}
                        </p>
                        <div className="flex items-center space-x-1.5 mt-1">
                          <span className="text-sm">{ROLE_ICONS[currentUser?.role]}</span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 capitalize">
                            {currentUser?.role?.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Menu Items */}
                  <div className="py-2">
                    {isSuperAdmin ? (
                      <>
                        <Link
                          to="/super-admin/profile"
                          className="group flex items-center px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <span className="mr-3 text-base">👤</span>
                          <span>My Profile</span>
                          <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <Link
                          to="/super-admin/settings"
                          className="group flex items-center px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <span className="mr-3 text-base">⚙️</span>
                          <span>Settings</span>
                          <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <Link
                          to="/super-admin/system"
                          className="group flex items-center px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <span className="mr-3 text-base">🔧</span>
                          <span>System Settings</span>
                          <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="group flex items-center px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <span className="mr-3 text-base">👤</span>
                          <span>Profile</span>
                          <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                        <Link
                          to="/settings"
                          className="group flex items-center px-5 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700/50 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200"
                        >
                          <span className="mr-3 text-base">⚙️</span>
                          <span>Settings</span>
                          <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </>
                    )}
                  </div>
                  {/* Logout Section */}
                  <div className="border-t border-gray-200/50 dark:border-gray-700/50 py-2">
                    <button
                      onClick={handleLogout}
                      className="group flex items-center w-full px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 transition-all duration-200"
                    >
                      <span className="mr-3 text-base">🚪</span>
                      <span>Sign Out</span>
                      <svg className="ml-auto w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              </div>
            ) : (
              /* Auth Buttons for Non-Authenticated Users */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-white hover:text-blue-100 px-4 py-2 rounded-lg border border-white border-opacity-30 hover:bg-white hover:bg-opacity-10 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gradient-to-b from-blue-600 to-blue-700 border-t border-blue-500 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigationItems.map((item) => (
              item.type === 'dropdown' ? (
                <div key={item.name}>
                  <button
                    onClick={() => toggleDropdown(`mobile-${item.name}`)}
                    className="w-full text-left px-3 py-2 text-white hover:bg-blue-700 rounded-md flex justify-between items-center"
                  >
                    <span>{item.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === `mobile-${item.name}` ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === `mobile-${item.name}` && (
                    <div className="pl-4 space-y-1 bg-blue-700/30 rounded-md mx-2 py-2">
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.name}
                          to={subItem.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-3 py-2 text-white text-sm hover:bg-blue-600 rounded-md"
                        >
                          {subItem.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md"
                >
                  {item.name}
                </Link>
              )
            ))}

            {/* Mobile Auth Buttons for Non-Authenticated Users */}
            {!currentUser && (
              <div className="pt-4 border-t border-blue-500 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md text-center border border-white border-opacity-30"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 bg-white text-blue-600 hover:bg-blue-50 rounded-md text-center font-medium"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile User Menu for Authenticated Users */}
            {currentUser && (
              <div className="pt-4 border-t border-blue-500 space-y-2">
                <div className="px-3 py-2 text-white text-sm">
                  <p className="font-medium">{getUserName() || currentUser?.name}</p>
                  <p className="text-blue-200 text-xs">{currentUser?.email}</p>
                </div>
                <Link
                  to={isSuperAdmin ? "/super-admin/profile" : "/profile"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md"
                >
                  Profile
                </Link>
                <Link
                  to={isSuperAdmin ? "/super-admin/settings" : "/settings"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-blue-700 rounded-md"
                >
                  Settings
                </Link>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="block w-full text-left px-3 py-2 text-red-300 hover:bg-red-600 hover:text-white rounded-md"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default RoleBasedHeader;
