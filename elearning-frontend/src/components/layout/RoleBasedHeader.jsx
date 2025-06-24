import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';

const RoleBasedHeader = () => {
  const { user, logout, getUserName } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const userMenuRef = useRef(null);
  const notificationRef = useRef(null);

  // Check if user is super admin
  const superAdminToken = localStorage.getItem('appAdminToken');
  const superAdminUser = localStorage.getItem('appAdminUser');

  let isSuperAdmin = null;
  if (superAdminToken && superAdminUser) {
    try {
      isSuperAdmin = JSON.parse(superAdminUser);
    } catch (error) {
      console.error('Error parsing super admin user:', error);
      localStorage.removeItem('appAdminToken');
      localStorage.removeItem('appAdminUser');
    }
  }

  const currentUser = isSuperAdmin || user;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    if (isSuperAdmin) {
      localStorage.removeItem('appAdminToken');
      localStorage.removeItem('appAdminUser');
      navigate('/super-admin-login');
    } else {
      logout();
      navigate('/login');
    }
  };

  const getNavigationItems = () => {
    if (isSuperAdmin) {
      if (isSuperAdmin.role === USER_ROLES.SUPER_ADMIN) {
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'User Management', href: '/super-admin/users', icon: '👥' },
          { name: 'Institutions', href: '/super-admin/institutions', icon: '🏫' },
          { name: 'System Health', href: '/super-admin/system', icon: '⚙️' },
          { name: 'Reports', href: '/super-admin/reports', icon: '📋' }
        ];
      } else if (isSuperAdmin.role === USER_ROLES.SUPER_MODERATOR) {
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'Content Moderation', href: '/super-moderator/moderation', icon: '🛡️' },
          { name: 'User Oversight', href: '/super-moderator/users', icon: '👥' },
          { name: 'Institution Monitoring', href: '/super-moderator/institutions', icon: '🏛️' },
          { name: 'Reports', href: '/super-moderator/reports', icon: '📈' }
        ];
      }
    }

    if (!user) return [];

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'User Approvals', href: '/admin/approvals', icon: '✅' },
          { name: 'Students', href: '/admin/students', icon: '🎓' },
          { name: 'Instructors', href: '/admin/instructors', icon: '👨‍🏫' },
          { name: 'Reports', href: '/admin/reports', icon: '📋' }
        ];
      
      case USER_ROLES.MODERATOR:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'Assigned Users', href: '/moderator/users', icon: '👥' },
          { name: 'Activities', href: '/moderator/activities', icon: '📈' },
          { name: 'Flagged Items', href: '/moderator/flagged', icon: '🚩' }
        ];

      case USER_ROLES.INSTRUCTOR:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'My Courses', href: '/instructor/courses', icon: '📚' },
          { name: 'Students', href: '/instructor/students', icon: '🎓' },
          { name: 'Content Creation', href: '/instructor/create', icon: '✏️' },
          { name: 'Analytics', href: '/instructor/analytics', icon: '📈' }
        ];

      case USER_ROLES.STUDENT:
      default:
        return [
          { name: 'Dashboard', href: '/dashboard', icon: '📊' },
          { name: 'Courses', href: '/courses', icon: '📚' },
          { name: 'Quizzes', href: '/quizzes', icon: '📝' },
          { name: 'Progress', href: '/progress', icon: '📈' }
        ];
    }
  };

  const getHeaderTitle = () => {
    if (isSuperAdmin) {
      return isSuperAdmin.role === USER_ROLES.SUPER_ADMIN ? 'Super Admin Portal' : 'Super Moderator Portal';
    }
    
    if (!user) return 'E-Learning Platform';

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'Institution Admin Portal';
      case USER_ROLES.MODERATOR:
        return 'Moderator Portal';
      case USER_ROLES.INSTRUCTOR:
        return 'Instructor Portal';
      case USER_ROLES.STUDENT:
        return 'Student Portal';
      default:
        return 'E-Learning Platform';
    }
  };

  const getHeaderColor = () => {
    if (isSuperAdmin) {
      return 'bg-gradient-to-r from-red-600 to-orange-600';
    }
    
    if (!user) return 'bg-gradient-to-r from-blue-600 to-purple-600';

    switch (user.role) {
      case USER_ROLES.ADMIN:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600';
      case USER_ROLES.MODERATOR:
        return 'bg-gradient-to-r from-orange-600 to-yellow-600';
      default:
        return 'bg-gradient-to-r from-blue-600 to-purple-600';
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className={`${getHeaderColor()} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">
                  {isSuperAdmin
                    ? (isSuperAdmin.role === USER_ROLES.SUPER_ADMIN ? '⚡' : '🔧')
                    : user?.role === USER_ROLES.ADMIN ? '👑'
                    : user?.role === USER_ROLES.MODERATOR ? '🛡️'
                    : user?.role === USER_ROLES.INSTRUCTOR ? '👨‍🏫'
                    : '🎓'
                  }
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{getHeaderTitle()}</h1>
                {currentUser && (
                  <p className="text-sm text-white text-opacity-80">
                    Welcome, {getUserName() || currentUser.name}
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 text-white text-opacity-90 hover:text-opacity-100 px-3 py-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-all duration-200"
              >
                <span>{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Right side - Notifications and User Menu */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="p-2 text-white text-opacity-90 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10 rounded-lg transition-all duration-200"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h4m0 14v-2.5" />
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

            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-3 text-white text-opacity-90 hover:text-opacity-100 hover:bg-white hover:bg-opacity-10 px-3 py-2 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold">
                    {(getUserName() || currentUser?.name || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium">{getUserName() || currentUser?.name}</p>
                  <p className="text-xs text-opacity-75">
                    {ROLE_ICONS[currentUser?.role]} {currentUser?.role?.replace('_', ' ')}
                  </p>
                </div>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getUserName() || currentUser?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {currentUser?.email}
                    </p>
                  </div>
                  <div className="py-2">
                    {isSuperAdmin ? (
                      <>
                        <Link
                          to="/super-admin/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          👤 My Profile
                        </Link>
                        <Link
                          to="/super-admin/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ⚙️ Settings
                        </Link>
                        <Link
                          to="/super-admin/system"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🔧 System Settings
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          👤 Profile
                        </Link>
                        <Link
                          to="/settings"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          ⚙️ Settings
                        </Link>
                      </>
                    )}
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-700 py-2">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default RoleBasedHeader;
