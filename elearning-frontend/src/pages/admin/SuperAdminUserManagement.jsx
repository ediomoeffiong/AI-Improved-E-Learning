import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';
import { dashboardAPI, superAdminAPI } from '../../services/api';

const SuperAdminUserManagement = () => {
  const [activeTab, setActiveTab] = useState('all-users');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [summary, setSummary] = useState({});
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedInstitution, setSelectedInstitution] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(20);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  // Get current super admin user
  const currentUser = JSON.parse(localStorage.getItem('appAdminUser') || '{}');

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [allUsers, searchTerm, selectedRole, selectedStatus, selectedInstitution, activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching super admin users data...');

      // Use the correct Super Admin API endpoint for users
      const data = await superAdminAPI.getUsers();

      // Process users to add hierarchical structure for moderators
      const processedUsers = processUsersHierarchy(data.users || []);

      setAllUsers(processedUsers);

      // Calculate summary from the actual data
      const summary = {
        totalUsers: data.users?.length || 0,
        pendingApprovals: data.users?.filter(u => u.approvalStatus === 'pending' || u.verificationStatus === 'pending').length || 0,
        suspendedUsers: data.users?.filter(u => u.status === 'suspended').length || 0,
        activeUsers: data.users?.filter(u => u.isActive && u.status === 'active').length || 0,
        adminsAndModerators: data.users?.filter(u => ['Admin', 'Moderator'].includes(u.role)).length || 0
      };
      setSummary(summary);

      // Extract unique institutions from users
      const uniqueInstitutions = [...new Set(data.users?.map(u => u.institutionName || u.institution).filter(Boolean) || [])];
      setInstitutions(uniqueInstitutions);

      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);

      // Provide specific error messages based on error type
      let errorMessage = 'Failed to fetch users. Please try again.';

      if (err.message.includes('Failed to fetch') ||
          err.message.includes('NetworkError') ||
          err.message.includes('ERR_NETWORK') ||
          err.message.includes('ERR_INTERNET_DISCONNECTED')) {
        errorMessage = 'Backend service is temporarily unavailable. Please check your connection.';
      } else if (err.message.includes('Super Admin authentication required') ||
                 err.message.includes('401') ||
                 err.message.includes('Unauthorized')) {
        errorMessage = 'Authentication expired. Please log in again.';
      } else if (err.message.includes('403') ||
                 err.message.includes('Forbidden')) {
        errorMessage = 'Access denied. Super Admin privileges required.';
      }

      setError(errorMessage);
      setAllUsers([]);
      setSummary({
        totalUsers: 0,
        pendingApprovals: 0,
        suspendedUsers: 0,
        activeUsers: 0,
        adminsAndModerators: 0
      });
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  // Process users to create hierarchical structure for moderators under admins
  const processUsersHierarchy = (users) => {
    const admins = users.filter(user => user.role === 'Admin');
    const moderators = users.filter(user => user.role === 'Moderator');
    const otherUsers = users.filter(user => !['Admin', 'Moderator'].includes(user.role));

    // Group moderators by institution and link them to admins
    const processedUsers = [...otherUsers];

    admins.forEach(admin => {
      processedUsers.push({
        ...admin,
        moderators: moderators.filter(mod => mod.institution === admin.institution)
      });
    });

    // Add orphaned moderators (those without matching admin in same institution)
    const orphanedModerators = moderators.filter(mod =>
      !admins.some(admin => admin.institution === mod.institution)
    );
    processedUsers.push(...orphanedModerators);

    return processedUsers;
  };

  const filterUsers = () => {
    let filtered = allUsers;

    // Tab-based filtering first
    switch (activeTab) {
      case 'pending-approval':
        filtered = filtered.filter(user => user.approvalStatus === 'pending');
        break;
      case 'suspended':
        filtered = filtered.filter(user => user.status === 'suspended');
        break;
      case 'admins':
        filtered = filtered.filter(user => ['Admin', 'Moderator'].includes(user.role));
        break;
      case 'all-users':
      default:
        // No additional filtering for all users
        break;
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.institution.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter (only apply if not on admins tab)
    if (selectedRole !== 'all' && activeTab !== 'admins') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Status filter (only apply if not on status-specific tabs)
    if (selectedStatus !== 'all' && !['pending-approval', 'suspended'].includes(activeTab)) {
      filtered = filtered.filter(user => user.approvalStatus === selectedStatus);
    }

    // Institution filter
    if (selectedInstitution !== 'all') {
      filtered = filtered.filter(user => user.institution === selectedInstitution);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleUserAction = async (userId, action, notes = '') => {
    try {
      setActionLoading(true);
      console.log(`Performing ${action} on user ${userId}`);

      // Use the correct Super Admin API endpoint for user management
      let response;

      // Map frontend actions to backend API calls
      if (['approve', 'disapprove', 'pause', 'disable', 'enable'].includes(action)) {
        // Use the manage-user endpoint for admin/moderator actions
        response = await fetch(`${process.env.REACT_APP_API_URL || 'https://ai-improved-e-learning.onrender.com'}/api/super-admin/manage-user/${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('appAdminToken')}`,
          },
          body: JSON.stringify({ action, notes }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }

        response = await response.json();
      } else {
        // For other actions, use the existing manageUser function
        response = await superAdminAPI.manageUser(userId, action, notes);
      }

      // Update user status locally using the correct ID field
      setAllUsers(prevUsers =>
        prevUsers.map(user =>
          (user.id === userId || user._id === userId)
            ? {
                ...user,
                approvalStatus: response.user?.approvalStatus || user.approvalStatus,
                status: response.user?.status || user.status,
                isActive: response.user?.isActive !== undefined ? response.user.isActive : user.isActive
              }
            : user
        )
      );

      // Update summary counts based on the updated users
      setSummary(prevSummary => {
        const updatedUsers = allUsers.map(user =>
          (user.id === userId || user._id === userId)
            ? {
                ...user,
                approvalStatus: response.user?.approvalStatus || user.approvalStatus,
                status: response.user?.status || user.status,
                isActive: response.user?.isActive !== undefined ? response.user.isActive : user.isActive
              }
            : user
        );

        return {
          ...prevSummary,
          pendingApprovals: updatedUsers.filter(u => u.approvalStatus === 'pending' || u.verificationStatus === 'pending').length,
          suspendedUsers: updatedUsers.filter(u => u.status === 'suspended').length,
          activeUsers: updatedUsers.filter(u => u.status === 'active' && u.isActive).length
        };
      });

      setShowUserModal(false);
      setSelectedUser(null);

      // Show success message
      setSuccessMessage(response.message || `User ${action} completed successfully`);
      setTimeout(() => setSuccessMessage(null), 5000); // Clear after 5 seconds
    } catch (err) {
      console.error(`Error performing ${action}:`, err);

      let errorMessage = `Failed to ${action} user. Please try again.`;
      if (err.message.includes('authentication') || err.message.includes('401')) {
        errorMessage = 'Authentication expired. Please log in again.';
      } else if (err.message.includes('403')) {
        errorMessage = 'Access denied. Insufficient privileges.';
      }

      setError(errorMessage);
      setTimeout(() => setError(null), 5000); // Clear error after 5 seconds
    } finally {
      setActionLoading(false);
    }
  };

  // Tabs with real data counts
  const tabs = [
    { id: 'all-users', name: 'All Users', icon: '👥', count: summary.totalUsers || 0 },
    { id: 'pending-approval', name: 'Pending Approval', icon: '⏳', count: summary.pendingApprovals || 0 },
    { id: 'suspended', name: 'Suspended', icon: '🚫', count: summary.suspendedUsers || 0 },
    { id: 'admins', name: 'Admins & Moderators', icon: '👑', count: summary.adminsAndModerators || 0 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Student': return '🎓';
      case 'Instructor': return '👨‍🏫';
      case 'Admin': return '👑';
      case 'Moderator': return '🛡️';
      default: return '👤';
    }
  };

  // Pagination - with safety checks
  const safeFilteredUsers = filteredUsers || [];
  const safeAllUsers = allUsers || [];
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = safeFilteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(safeFilteredUsers.length / usersPerPage);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading user management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ROLE_ICONS[USER_ROLES.SUPER_ADMIN]} User Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage all platform users, approvals, and permissions
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                ← Back to Dashboard
              </Link>
              <button
                onClick={fetchUsers}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
                <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-red-400">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-green-400">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-800 dark:text-green-200">{successMessage}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name, email, or institution..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Roles</option>
                <option value="Student">Students</option>
                <option value="Instructor">Instructors</option>
                <option value="Admin">Admins</option>
                <option value="Moderator">Moderators</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Institution
              </label>
              <select
                value={selectedInstitution}
                onChange={(e) => setSelectedInstitution(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Institutions</option>
                {institutions.map(institution => (
                  <option key={institution} value={institution}>{institution}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Users ({safeFilteredUsers.length} of {safeAllUsers.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Role & Institution
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentUsers.map((user) => (
                  <React.Fragment key={user.id}>
                    {/* Main User Row */}
                    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                              <span className="text-lg">{getRoleIcon(user.role)}</span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{user.role}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{user.institution}</div>
                        {user.role === 'Admin' && user.moderators && user.moderators.length > 0 && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                            {user.moderators.length} moderator{user.moderators.length > 1 ? 's' : ''} under this admin
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.approvalStatus || 'approved')}`}>
                            {user.approvalStatus || 'approved'}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status || 'active')}`}>
                            {user.status || 'active'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                        <div>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</div>
                        {user.role === 'Student' && (
                          <div className="text-xs">
                            <span className="text-blue-600 dark:text-blue-400">
                              {user.coursesEnrolled || 0} courses, {user.quizzesTaken || 0} quizzes
                            </span>
                          </div>
                        )}
                        {user.role === 'Instructor' && (
                          <div className="text-xs">
                            <span className="text-purple-600 dark:text-purple-400">
                              {user.coursesCreated || 0} courses, {user.studentsEnrolled || 0} students
                            </span>
                          </div>
                        )}
                        {['Admin', 'Moderator'].includes(user.role) && (
                          <div className="text-xs">
                            <span className="text-green-600 dark:text-green-400">
                              Managing {user.usersManaged || 0} users
                            </span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {['Admin', 'Moderator'].includes(user.role) ? (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Manage
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>

                    {/* Nested Moderators (only show for Admins in admins tab) */}
                    {user.role === 'Admin' && user.moderators && user.moderators.length > 0 && activeTab === 'admins' && (
                      user.moderators.map((moderator) => (
                        <tr key={`mod-${moderator.id}`} className="bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center pl-8">
                              <div className="flex-shrink-0 h-8 w-8">
                                <div className="h-8 w-8 rounded-full bg-blue-200 dark:bg-blue-700 flex items-center justify-center">
                                  <span className="text-sm">{getRoleIcon(moderator.role)}</span>
                                </div>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {moderator.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {moderator.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">{moderator.role}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{moderator.institution}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                              Under {user.name}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(moderator.approvalStatus || 'approved')}`}>
                                {moderator.approvalStatus || 'approved'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(moderator.status || 'active')}`}>
                                {moderator.status || 'active'}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            <div>Joined: {new Date(moderator.createdAt).toLocaleDateString()}</div>
                            <div>Last login: {moderator.lastLogin ? new Date(moderator.lastLogin).toLocaleDateString() : 'Never'}</div>
                            <div className="text-xs">
                              <span className="text-green-600 dark:text-green-400">
                                Managing {moderator.usersManaged || 0} users
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => {
                                setSelectedUser(moderator);
                                setShowUserModal(true);
                              }}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    Showing <span className="font-medium">{indexOfFirstUser + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(indexOfLastUser, safeFilteredUsers.length)}</span> of{' '}
                    <span className="font-medium">{safeFilteredUsers.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-red-50 border-red-500 text-red-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Management Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Manage User: {selectedUser.name}
                </h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Email: {selectedUser.email}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Role: {selectedUser.role}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Institution: {selectedUser.institution}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status: {selectedUser.approvalStatus} / {selectedUser.status}</p>
              </div>

              <div className="flex flex-col space-y-3">
                {/* Admin and Moderator Management Actions */}
                {['Admin', 'Moderator'].includes(selectedUser.role) && (
                  <>
                    {selectedUser.approvalStatus === 'pending' && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const notes = prompt('Add approval notes (optional):');
                            handleUserAction(selectedUser.id, 'approve', notes || '');
                          }}
                          disabled={actionLoading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for disapproval:');
                            if (notes) handleUserAction(selectedUser.id, 'disapprove', notes);
                          }}
                          disabled={actionLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Disapprove'}
                        </button>
                      </div>
                    )}

                    {selectedUser.status === 'active' && selectedUser.isActive !== false && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for pausing (optional):');
                            handleUserAction(selectedUser.id, 'pause', notes || '');
                          }}
                          disabled={actionLoading}
                          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Pause'}
                        </button>
                        <button
                          onClick={() => {
                            const notes = prompt('Reason for disabling:');
                            if (notes) handleUserAction(selectedUser.id, 'disable', notes);
                          }}
                          disabled={actionLoading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Processing...' : 'Disable'}
                        </button>
                      </div>
                    )}

                    {(selectedUser.status === 'suspended' || selectedUser.status === 'disabled' || selectedUser.isActive === false) && (
                      <button
                        onClick={() => {
                          const notes = prompt('Notes for enabling (optional):');
                          handleUserAction(selectedUser.id, 'enable', notes || '');
                        }}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Enable User'}
                      </button>
                    )}
                  </>
                )}

                {/* Regular User Actions */}
                {!['Admin', 'Moderator'].includes(selectedUser.role) && (
                  <>
                    {selectedUser.approvalStatus === 'pending' && (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'approve')}
                        disabled={actionLoading}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve User'}
                      </button>
                    )}

                    {selectedUser.status === 'active' && (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'suspend')}
                        disabled={actionLoading}
                        className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Suspend User'}
                      </button>
                    )}

                    {selectedUser.status === 'suspended' && (
                      <button
                        onClick={() => handleUserAction(selectedUser.id, 'activate')}
                        disabled={actionLoading}
                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Activate User'}
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => setShowUserModal(false)}
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminUserManagement;
