import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ROLE_ICONS, ROLE_COLORS } from '../../constants/roles';
import { hasSuperAdminSession, getCurrentSessionUser } from '../../utils/sessionManager';
import { notificationsAPI } from '../../services/api';

const RoleBasedHeader = () => {

  const { user, logout, getUserName } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
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

  // Handle scroll effect for responsive header
  useEffect(() => {
    const handleScroll = () => {
      const scrollThreshold = 50; // Change appearance after 50px scroll
      setIsScrolled(window.scrollY > scrollThreshold);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Fetch notifications when component mounts (regardless of user status for demo mode)
  useEffect(() => {
    // Fetch notifications immediately
    fetchNotifications();

    // Set up periodic refresh every 30 seconds
    const notificationInterval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(notificationInterval);
  }, []);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown(openDropdown === dropdownName ? null : dropdownName);
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
    setIsUserMenuOpen(false); // Close the dropdown
    window.location.reload();
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setNotificationsLoading(true);
      const response = await notificationsAPI.getNotifications({ limit: 10 });
      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set fallback data on error
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setNotificationsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      // Update local state
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      // Update local state
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    const iconConfigs = {
      user_approval: <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
      enrollment: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      quiz_result: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
      course_update: <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.168 18.477 18.582 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />,
      system: <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    };

    const iconPath = iconConfigs[type] || iconConfigs.system;

    return (
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        strokeWidth="2"
      >
        {iconPath}
      </svg>
    );
  };

  // Format relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;

    return time.toLocaleDateString();
  };

  // Handle logout confirmation
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
    setIsUserMenuOpen(false); // Close the dropdown
  };

  const handleLogoutConfirm = () => {
    setShowLogoutConfirm(false);
    if (isSuperAdmin) {
      localStorage.removeItem('superAdminToken');
      localStorage.removeItem('superAdminUser');
      navigate('/super-admin-login');
    } else {
      logout();
      navigate('/login');
    }
  };

  const handleLogoutCancel = () => {
    setShowLogoutConfirm(false);
  };

  const getSuperAdminNavigationItems = () => {
    if (isSuperAdmin) {
      return [
        { name: 'Dashboard', href: '/dashboard', type: 'link' },
        {
          name: 'Course',
          type: 'dropdown',
          items: [
            {
              name: 'All Courses',
              href: '/super-admin/courses',
              description: 'View and manage all courses',
              icon: (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              )
            },
            {
              name: 'Create Course',
              href: '/super-admin/courses/create',
              description: 'Form to create new courses',
              icon: (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              )
            },
            {
              name: 'Categories',
              href: '/super-admin/categories',
              description: 'Manage course categories',
              icon: (
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 4H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zM10 14H4c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2v-6c0-1.11-.89-2-2-2zm10 0h-6c-1.11 0-2 .89-2 2v6c0 1.11.89 2 2 2h6c1.11 0 2-.89 2-2v-6c0-1.11-.89-2-2-2z"/>
                </svg>
              )
            },
            {
              name: 'Course Analytics',
              href: '/super-admin/course-analytics',
              description: 'View course performance metrics',
              icon: (
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              )
            }
          ]
        },
        {
          name: 'Quiz',
          type: 'dropdown',
          items: [
            {
              name: 'All Quizzes',
              href: '/super-admin/quizzes',
              description: 'View and manage all quizzes',
              icon: (
                <svg className="w-5 h-5 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                </svg>
              )
            },
            {
              name: 'Create Quiz',
              href: '/super-admin/quizzes/create',
              description: 'Form to create new quizzes',
              icon: (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              )
            },
            {
              name: 'Quiz Results',
              href: '/super-admin/quiz-results',
              description: 'View and analyze quiz performance',
              icon: (
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/>
                </svg>
              )
            }
          ]
        },
        {
          name: 'Progress',
          type: 'dropdown',
          items: [
            {
              name: 'Progress Overview',
              href: '/super-admin/progress-overview',
              description: 'Aggregate progress metrics',
              icon: (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              )
            },
            {
              name: 'Course Completions',
              href: '/super-admin/course-completions',
              description: 'Detailed completion tracking',
              icon: (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              )
            },
            {
              name: 'Learning Paths',
              href: '/super-admin/learning-paths',
              description: 'Monitor learning path progress',
              icon: (
                <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              )
            },
            {
              name: 'Intervention Tools',
              href: '/super-admin/intervention-tools',
              description: 'Help struggling users',
              icon: (
                <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"/>
                </svg>
              )
            }
          ]
        },
        {
          name: 'User',
          type: 'dropdown',
          items: [
            {
              name: 'User Management',
              href: '/super-admin/users',
              description: 'Manage all user accounts',
              icon: (
                <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              )
            },
            {
              name: 'Activity Monitor',
              href: '/super-admin/activity-monitor',
              description: 'Monitor user activity and system logs',
              icon: (
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )
            }
          ]
        }
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
              { name: 'User Approvals', href: '/admin/approvals', description: 'Approve pending user registrations', icon: '✅' },
              { name: 'Students', href: '/admin/students', description: 'Manage student accounts', icon: '🎓' },
              { name: 'Instructors', href: '/admin/instructors', description: 'Manage instructor accounts', icon: '👨‍🏫' },
              { name: 'Moderators', href: '/admin/moderators', description: 'Manage moderator accounts', icon: '🛡️' },
              { name: 'User Reports', href: '/admin/user-reports', description: 'View user activity reports', icon: '📊' }
            ]
          },
          {
            name: 'Institution Management',
            type: 'dropdown',
            items: [
              { name: 'Institution Settings', href: '/admin/institution-settings', description: 'Configure institution settings', icon: '⚙️' },
              { name: 'Department Management', href: '/admin/departments', description: 'Manage institution departments', icon: '🏢' },
              { name: 'Course Oversight', href: '/admin/course-oversight', description: 'Oversee institution courses', icon: '📚' },
              { name: 'Institution Reports', href: '/admin/reports', description: 'Generate institution reports', icon: '📋' }
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
              { name: 'Assigned Users', href: '/moderator/users', description: 'Monitor assigned users', icon: '👥' },
              { name: 'User Activities', href: '/moderator/activities', description: 'Track user activities and engagement', icon: '📈' },
              { name: 'User Reports', href: '/moderator/user-reports', description: 'Generate user activity reports', icon: '📊' },
              { name: 'User Assistance', href: '/moderator/assistance', description: 'Provide support to users', icon: '🤝' }
            ]
          },
          {
            name: 'Content Moderation',
            type: 'dropdown',
            items: [
              { name: 'Flagged Items', href: '/moderator/flagged', description: 'Review flagged content and activities', icon: '🚩' },
              { name: 'Content Review', href: '/moderator/content-review', description: 'Review and moderate user content', icon: '📝' },
              { name: 'Violation Reports', href: '/moderator/violations', description: 'Handle policy violation reports', icon: '⚠️' },
              { name: 'Moderation Tools', href: '/moderator/tools', description: 'Access moderation tools and settings', icon: '🔧' }
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
              { name: 'My Courses', href: '/instructor/courses', description: 'Manage your created courses', icon: '📚' },
              { name: 'Create Course', href: '/instructor/courses/create', description: 'Create a new course', icon: '➕' },
              { name: 'Course Analytics', href: '/instructor/analytics', description: 'View course performance metrics', icon: '📊' },
              { name: 'Course Materials', href: '/instructor/materials', description: 'Manage course resources and materials', icon: '📄' }
            ]
          },
          {
            name: 'Student Management',
            type: 'dropdown',
            items: [
              { name: 'My Students', href: '/instructor/students', description: 'View and manage your students', icon: '🎓' },
              { name: 'Student Progress', href: '/instructor/student-progress', description: 'Track student learning progress', icon: '📈' },
              { name: 'Grade Management', href: '/instructor/grades', description: 'Manage student grades and assessments', icon: '📝' },
              { name: 'Student Reports', href: '/instructor/student-reports', description: 'Generate student performance reports', icon: '📋' }
            ]
          },
          {
            name: 'Content Creation',
            type: 'dropdown',
            items: [
              { name: 'Create Content', href: '/instructor/create', description: 'Create new course content', icon: '✏️' },
              { name: 'Quiz Builder', href: '/instructor/quiz-builder', description: 'Create and manage quizzes', icon: '📝' },
              { name: 'Assignment Creator', href: '/instructor/assignments', description: 'Create and manage assignments', icon: '📋' },
              { name: 'Media Library', href: '/instructor/media', description: 'Manage course videos and media', icon: '🎬' }
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
              {
                name: 'Dashboard',
                href: '/courses/dashboard',
                description: 'Course overview',
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                )
              },
              {
                name: 'Browse Courses',
                href: '/courses',
                description: 'Explore catalog',
                badge: 'New',
                icon: (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )
              },
              {
                name: 'My Courses',
                href: '/courses/my-courses',
                description: 'Enrolled courses',
                badge: 'New',
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="12" cy="12" r="6" fill="currentColor"/>
                  </svg>
                )
              },
              {
                name: 'Course Materials',
                href: '/courses/materials',
                description: 'Resources & files',
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                )
              },
              {
                name: 'Discussions',
                href: '/courses/discussion',
                description: 'Community forum',
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                    <circle cx="15" cy="9" r="1.5" fill="currentColor"/>
                    <path d="M8 14s1.5 2 4 2 4-2 4-2" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )
              }
            ]
          },
          {
            name: 'Quizzes',
            type: 'dropdown',
            items: [
              {
                name: 'Quiz Dashboard',
                href: '/quiz/dashboard',
                description: 'Performance overview',
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                )
              },
              {
                name: 'Available Quizzes',
                href: '/quizzes',
                description: 'Browse all quizzes',
                icon: (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )
              },
              {
                name: 'My Quiz Results',
                href: '/quizzes/results',
                description: 'View scores & history',
                icon: (
                  <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )
              },
              {
                name: 'Practice Tests',
                href: '/quizzes/practice',
                description: 'Take practice quizzes',
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z"/>
                  </svg>
                )
              }
            ]
          },
          {
            name: 'Progress',
            type: 'dropdown',
            items: [
              {
                name: 'Dashboard',
                href: '/progress/dashboard',
                description: 'Progress overview',
                icon: (
                  <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                )
              },
              {
                name: 'Performance Reports',
                href: '/progress/reports',
                description: 'Detailed analytics',
                icon: (
                  <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                  </svg>
                )
              },
              {
                name: 'Activity Logs',
                href: '/progress/activity',
                description: 'Learning history',
                icon: (
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                )
              },
              {
                name: 'AI Recommendations',
                href: '/progress/recommendations',
                description: 'Personalized tips',
                icon: (
                  <svg className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                )
              }
            ]
          },

        ];
    }
  };



  const getHeaderColor = () => {
    console.log('🎨 getHeaderColor Debug:', {
      isSuperAdmin: !!isSuperAdmin,
      user: !!user,
      userRole: user?.role,
      superAdminRole: isSuperAdmin?.role,
      isScrolled
    });

    // When scrolled, use a more subtle background with backdrop blur
    if (isScrolled) {
      return 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-700';
    }

    // Original gradient colors when not scrolled
    if (isSuperAdmin) {
      console.log('🔴 Returning super admin color (subtle blue/red gradient)');
      return 'bg-gradient-to-r from-blue-600 via-blue-700 to-red-500';
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

  // Determine if header should be sticky for student role, super admin, and super moderator
  const isStudent = user?.role === USER_ROLES.STUDENT;
  const isSuperAdminOrModerator = isSuperAdmin && (isSuperAdmin.role === 'Super Admin' || isSuperAdmin.role === 'Super Moderator');
  const isDashboardPage = location.pathname === '/dashboard';
  const shouldBeSticky = (isStudent || isSuperAdminOrModerator) && !isDashboardPage;

  return (
    <header className={`${getHeaderColor()} shadow-lg ${shouldBeSticky ? 'sticky top-0 z-50' : ''} transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex justify-between items-center transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
          {/* Logo */}
          <div className="flex items-center">
            <Link to={currentUser ? "/dashboard" : "/"} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className={`text-base font-medium transition-colors duration-300 ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>AI E-Learning</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-6">
            {navigationItems.map((item) => (
              item.type === 'dropdown' ? (
                <div key={item.name} className="relative dropdown-container">
                  <button
                    onClick={() => toggleDropdown(item.name)}
                    className={`flex items-center space-x-1 px-3 py-2 transition-all duration-200 ${isScrolled ? 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400' : 'text-white hover:text-white/80'}`}
                  >
                    <span className="text-base font-medium">{item.name}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
                        openDropdown === item.name ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === item.name && (
                    <div className="absolute z-50 mt-3 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 overflow-hidden animate-in slide-in-from-top-2">
                      {/* Header */}
                      <div className="relative p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100/50 dark:border-gray-700/50">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Explore {item.name.toLowerCase()} options</p>
                      </div>

                      {/* Menu Items */}
                      <div className="p-2">
                        {item.items.map((subItem, index) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => setOpenDropdown(null)}
                            className="flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-800 dark:hover:to-gray-700 group transition-all duration-200 rounded-xl mx-1 my-1"
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center mr-4 group-hover:from-blue-200 group-hover:to-indigo-200 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500 transition-all duration-200 group-hover:scale-110">
                              <div className="text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200 text-lg">
                                {typeof subItem.icon === 'string' ? (
                                  <span>{subItem.icon}</span>
                                ) : (
                                  subItem.icon || <span>📚</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold flex items-center text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors duration-200">
                                {subItem.name}
                                {subItem.badge && (
                                  <span className="ml-2 px-2 py-1 text-xs bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 text-green-800 dark:text-green-200 rounded-full font-medium">
                                    {subItem.badge}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 mt-1">{subItem.description}</div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}

                        {/* Special message for non-authenticated users on Courses dropdown */}
                        {!currentUser && item.name === 'Courses' && (
                          <div className="border-t border-gray-200/50 dark:border-gray-700/50 mt-2 pt-2 mx-2">
                            <div className="px-4 py-3 text-center bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl">
                              <Link
                                to="/login"
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold transition-colors duration-200"
                                onClick={() => setOpenDropdown(null)}
                              >
                                Sign in
                              </Link>
                              <span className="text-gray-600 dark:text-gray-400"> to access your courses and dashboard</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 transition-all duration-200 ${isScrolled ? 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400' : 'text-white hover:text-white/80'}`}
                >
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              )
            ))}
          </nav>

          {/* Right side - User Menu and Notifications */}
          <div className="flex items-center space-x-2">

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`p-2 rounded-lg transition-all duration-200 ${isScrolled ? 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:text-blue-100 hover:bg-white hover:bg-opacity-10'}`}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* User Menu or Auth Buttons */}
            {currentUser ? (
              <>
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded transition-all duration-200 ${isScrolled ? 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white hover:bg-white/10'}`}
                >
                  {/* White Circular Avatar with Refined User Icon */}
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>

                  {/* Welcome Text */}
                  <span className={`text-sm font-normal transition-colors duration-300 ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}>Welcome, {getUserName() || currentUser?.name || 'User'}</span>

                  {/* Dropdown Arrow */}
                  <svg
                    className={`w-4 h-4 transition-all duration-200 ${isUserMenuOpen ? 'rotate-180' : ''} ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-3 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 overflow-hidden animate-in slide-in-from-top-2">
                  {/* User Info Header with Gradient Background */}
                  <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100/50 dark:border-gray-700/50">
                    <div className="flex items-center space-x-3">
                      {/* Enhanced Avatar */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {getUserName() || currentUser?.name || 'Covenant Effiong'}
                        </div>
                        <div className="mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            ROLE_COLORS[currentUser?.role || isSuperAdmin?.role || USER_ROLES.STUDENT] ||
                            'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400'
                          }`}>
                            <span className="mr-1">
                              {ROLE_ICONS[currentUser?.role || isSuperAdmin?.role || USER_ROLES.STUDENT] || '🎓'}
                            </span>
                            {currentUser?.role || isSuperAdmin?.role || 'Student'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Menu Items with Enhanced Styling */}
                  <div className="py-2">
                    {/* Dashboard */}
                    <Link
                      to="/dashboard"
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/20 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <span className="font-medium">Dashboard</span>
                    </Link>

                    {/* My Profile */}
                    <Link
                      to={isSuperAdmin ? "/super-admin/profile" : "/profile"}
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 dark:hover:from-green-900/20 dark:hover:to-emerald-900/20 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="font-medium">My Profile</span>
                    </Link>

                    {/* Settings */}
                    <Link
                      to="/settings"
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-violet-50 dark:hover:from-purple-900/20 dark:hover:to-violet-900/20 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Settings</span>
                    </Link>

                    {/* Help & Support */}
                    <Link
                      to="/support"
                      className="group flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50 dark:hover:from-orange-900/20 dark:hover:to-amber-900/20 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="font-medium">Help & Support</span>
                    </Link>

                    {/* Demo Mode Toggle */}
                    <button
                      onClick={handleToggleDemoMode}
                      className={`group flex items-center w-full px-4 py-3 text-sm transition-all duration-200 hover:translate-x-1 ${
                        isDemoMode
                          ? 'text-amber-700 dark:text-amber-300 hover:bg-gradient-to-r hover:from-amber-50 hover:to-yellow-50 dark:hover:from-amber-900/20 dark:hover:to-yellow-900/20'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 dark:hover:from-gray-800/50 dark:hover:to-slate-800/50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200 ${
                        isDemoMode
                          ? 'bg-amber-100 dark:bg-amber-900/30'
                          : 'bg-gray-100 dark:bg-gray-700/50'
                      }`}>
                        <svg className={`w-4 h-4 ${
                          isDemoMode
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-gray-600 dark:text-gray-400'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          {isDemoMode ? (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 5.636a9 9 0 1 0 12.728 0M12 3v9" />
                          ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                      </div>
                      <span className="font-medium">
                        {isDemoMode ? 'Disable Demo Mode' : 'Enable Demo Mode'}
                      </span>
                    </button>
                  </div>

                  {/* Logout Section with Enhanced Styling */}
                  <div className="border-t border-gray-100/50 dark:border-gray-700/50 py-2">
                    <button
                      onClick={handleLogoutClick}
                      className="group flex items-center w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 dark:hover:from-red-900/20 dark:hover:to-rose-900/20 transition-all duration-200 hover:translate-x-1"
                    >
                      <div className="w-8 h-8 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                        <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="font-medium">Logout</span>
                    </button>
                  </div>
                </div>
              )}
              </div>

              {/* Notifications - Always show for demo mode support */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className={`relative p-2.5 rounded-xl transition-all duration-200 group ${isScrolled ? 'text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700' : isSuperAdmin ? 'text-white hover:text-white/90 hover:bg-white/10' : 'text-white hover:text-white/80 hover:bg-white/10'}`}
                >
                  <svg className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className={`absolute -top-1 -right-1 text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium shadow-lg animate-pulse ${isSuperAdmin ? 'bg-white text-green-600 border border-green-200' : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'}`}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white/95 dark:bg-gray-900/95 backdrop-filter backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 z-50 overflow-hidden animate-in slide-in-from-top-2">
                    {/* Header */}
                    <div className="relative p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 border-b border-gray-100/50 dark:border-gray-700/50">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h3>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                          >
                            Mark all read
                          </button>
                          <button
                            onClick={() => setIsNotificationOpen(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="max-h-96 overflow-y-auto">
                      {notificationsLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                      ) : notifications.length > 0 ? (
                        notifications.map((notification) => {
                          const isUnread = !notification.isRead;
                          return (
                            <div
                              key={notification.id}
                              onClick={() => handleMarkAsRead(notification.id)}
                              className={`p-4 border-b border-gray-100/50 dark:border-gray-700/50 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 cursor-pointer transition-all duration-200 ${
                                isUnread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''
                              }`}
                            >
                              <div className="flex items-start space-x-3">
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                  notification.priority === 'high' ? 'bg-red-100 dark:bg-red-900/30' :
                                  notification.priority === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                                  'bg-blue-100 dark:bg-blue-900/30'
                                }`}>
                                  {getNotificationIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${isUnread ? 'text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                      {notification.title}
                                    </p>
                                    {isUnread && (
                                      <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                                    {new Date(notification.timestamp).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                          <svg className="w-12 h-12 text-gray-400 dark:text-gray-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                          <p className="text-gray-500 dark:text-gray-400 text-sm">No notifications yet</p>
                          <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">We'll notify you when something happens</p>
                        </div>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-100/50 dark:border-gray-700/50 p-3">
                      <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium py-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200">
                        View all notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>
              </>
            ) : (
              /* Auth Buttons for Non-Authenticated Users */
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className={`px-4 py-2 rounded-lg border transition-all duration-200 ${isScrolled ? 'text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700' : 'text-white border-white border-opacity-30 hover:text-blue-100 hover:bg-white hover:bg-opacity-10'}`}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${isScrolled ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-white text-blue-600 hover:bg-blue-50'}`}
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
                    className="w-full text-left px-3 py-2 text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 rounded-md flex justify-between items-center transition-all duration-200"
                  >
                    <span>{item.name}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 transform ${openDropdown === `mobile-${item.name}` ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {openDropdown === `mobile-${item.name}` && (
                    <div className="mx-2 mt-2 bg-white/10 dark:bg-gray-900/20 backdrop-filter backdrop-blur-lg rounded-xl border border-white/20 dark:border-gray-700/30 overflow-hidden">
                      {/* Mobile Dropdown Header */}
                      <div className="px-4 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10">
                        <h4 className="text-white font-medium text-base">{item.name}</h4>
                      </div>

                      {/* Mobile Menu Items */}
                      <div className="p-2 space-y-1">
                        {item.items.map((subItem) => (
                          <Link
                            key={subItem.name}
                            to={subItem.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className="flex items-center px-3 py-3 text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 rounded-lg transition-all duration-200 group"
                          >
                            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all duration-200 group-hover:scale-110">
                              <div className="text-white text-sm">
                                {typeof subItem.icon === 'string' ? (
                                  <span>{subItem.icon}</span>
                                ) : (
                                  subItem.icon || <span>📚</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-white group-hover:text-blue-200 transition-colors duration-200">
                                {subItem.name}
                              </div>
                              {subItem.description && (
                                <div className="text-xs text-blue-200 group-hover:text-blue-100 transition-colors duration-200 mt-1">
                                  {subItem.description}
                                </div>
                              )}
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 rounded-md transition-all duration-200"
                >
                  <span className="text-base font-medium">{item.name}</span>
                </Link>
              )
            ))}

            {/* Mobile Auth Buttons for Non-Authenticated Users */}
            {!currentUser && (
              <div className="pt-4 border-t border-blue-500 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-white hover:bg-gradient-to-r hover:from-blue-500/30 hover:to-purple-500/30 rounded-md text-center border border-white border-opacity-30 transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 rounded-md text-center font-medium transition-all duration-200"
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
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white">
                      <span className="mr-1">
                        {ROLE_ICONS[currentUser?.role || isSuperAdmin?.role || USER_ROLES.STUDENT] || '🎓'}
                      </span>
                      {currentUser?.role || isSuperAdmin?.role || 'Student'}
                    </span>
                  </div>
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
                    handleLogoutClick();
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

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white text-center mb-2">
              Confirm Logout
            </h3>

            <p className="text-gray-600 dark:text-gray-300 text-center mb-6">
              Are you sure you want to logout? You'll need to sign in again to access your account.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleLogoutCancel}
                className="flex-1 px-4 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 px-4 py-2.5 text-white bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default RoleBasedHeader;
