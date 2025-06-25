import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES } from '../../constants/roles';
import { superAdminAPI } from '../../services/api';

const AdminVerificationSystem = () => {
  const [adminApprovals, setAdminApprovals] = useState([]);
  const [allAdmins, setAllAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [filters, setFilters] = useState({
    status: 'pending',
    institution: 'all',
    adminType: 'all',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});

  // Check if current user can verify admins (Super Admin or Super Moderator)
  // For Super Admin system, check localStorage directly
  const getSuperAdminUser = () => {
    try {
      const superAdminUser = localStorage.getItem('appAdminUser');
      return superAdminUser ? JSON.parse(superAdminUser) : null;
    } catch (error) {
      console.error('Error parsing super admin user:', error);
      return null;
    }
  };

  const user = getSuperAdminUser();
  const canVerifyAdmins = user?.role === USER_ROLES.SUPER_ADMIN || user?.role === USER_ROLES.SUPER_MODERATOR;

  // Fetch admin approvals from API
  const fetchAdminApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        type: 'admin_verification',
        status: filters.status,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/pending-approvals?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 404) {
          // No data found - this is normal, not an error
          setAdminApprovals([]);
          setPagination({});
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAdminApprovals(data.approvals || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching admin approvals:', error);

      // Only show error and demo data for actual connectivity issues
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') ||
          error.message.includes('ERR_NETWORK') || error.message.includes('ERR_INTERNET_DISCONNECTED')) {
        setError('Backend service is temporarily unavailable. Showing demo data for testing purposes.');

        // Fallback to demo data only for connectivity issues
      const mockAdminApprovals = [
        {
          _id: 'demo-1',
          user: {
            _id: 'user-1',
            name: 'Prof. Michael Johnson',
            email: 'michael.johnson@unilag.edu.ng',
            username: 'mjohnson',
            phoneNumber: '+234-803-456-7890'
          },
          approvalType: 'admin_verification',
          currentRole: 'User',
          requestedRole: 'Admin',
          requestedAdminType: 'primary',
          institution: {
            _id: 'inst-1',
            name: 'University of Lagos',
            code: 'UNILAG'
          },
          reason: 'I am the IT director at this institution and would like to become an admin',
          additionalInfo: 'I have 5 years of experience managing educational platforms',
          status: 'pending',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          userDetails: {
            name: 'Prof. Michael Johnson',
            email: 'michael.johnson@unilag.edu.ng',
            phoneNumber: '+234-803-456-7890',
            department: 'Administration',
            staffId: 'ADMIN/2024/03'
          }
        },
        {
          _id: 'demo-2',
          user: {
            _id: 'user-2',
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@abu.edu.ng',
            username: 'swilson',
            phoneNumber: '+234-804-567-8901'
          },
          approvalType: 'admin_verification',
          currentRole: 'User',
          requestedRole: 'Admin',
          requestedAdminType: 'secondary',
          institution: {
            _id: 'inst-2',
            name: 'Ahmadu Bello University',
            code: 'ABU'
          },
          reason: 'Request to become secondary admin for academic affairs',
          additionalInfo: 'I am the head of academic affairs department',
          status: 'pending',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          userDetails: {
            name: 'Dr. Sarah Wilson',
            email: 'sarah.wilson@abu.edu.ng',
            phoneNumber: '+234-804-567-8901',
            department: 'Academic Affairs',
            staffId: 'ADMIN/2024/05'
          }
        }
      ];
        setAdminApprovals(mockAdminApprovals);
      } else {
        // For other errors (like 401, 403, 500), just show empty state
        setAdminApprovals([]);
        setError(null); // Don't show error for these cases
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch all admins for the "All Admins" tab using proper API
  const fetchAllAdmins = async () => {
    try {
      const adminFilters = {
        role: 'Admin',
        page: filters.page,
        limit: filters.limit,
        ...(filters.search && { search: filters.search }),
        ...(filters.institution !== 'all' && { institution: filters.institution }),
        ...(filters.adminType !== 'all' && { adminType: filters.adminType })
      };

      const response = await superAdminAPI.getUsers(adminFilters);
      setAllAdmins(response.users || []);
    } catch (error) {
      console.error('Error fetching all admins:', error);

      // Only show demo data for connectivity issues
      if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError') ||
          error.message.includes('ERR_NETWORK') || error.message.includes('ERR_INTERNET_DISCONNECTED') ||
          error.message.includes('Backend service is not available')) {
        // Set fallback data only for connectivity issues
        setAllAdmins([
          {
            _id: 'admin-1',
            name: 'John Admin',
            email: 'john@unilag.edu.ng',
            role: 'Admin',
            adminType: 'primary',
            institution: { name: 'University of Lagos', code: 'UNILAG' },
            isVerified: true,
            createdAt: new Date().toISOString()
          }
        ]);
      } else {
        // For other errors, just show empty state
        setAllAdmins([]);
      }
    }
  };

  // Fetch statistics using the proper API
  const fetchStats = async () => {
    try {
      const response = await superAdminAPI.getStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching stats:', error);
      // The superAdminAPI.getStats() already handles demo data properly
      // Just set empty stats for other errors
      setStats({});
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchAdminApprovals();
    } else if (activeTab === 'all') {
      fetchAllAdmins();
    }
  }, [activeTab, filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle admin approval/rejection
  const handleAdminApproval = async (approvalId, action, notes = '', adminType = 'primary') => {
    try {
      setActionLoading(true);

      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const approval = adminApprovals.find(app => app._id === approvalId);
      if (!approval) {
        throw new Error('Approval not found');
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/approve-user/${approvalId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          notes,
          adminType
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update local state
      setAdminApprovals(prev => prev.filter(approval => approval._id !== approvalId));
      setSelectedAdmin(null);

      // Refresh stats
      fetchStats();

      alert(`✅ ${data.message}`);
    } catch (error) {
      console.error('Error processing admin approval:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Utility functions
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600 bg-gray-100',
      'normal': 'text-blue-600 bg-blue-100',
      'high': 'text-orange-600 bg-orange-100',
      'urgent': 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.normal;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (!canVerifyAdmins) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🚫</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only Super Admins and Super Moderators can verify institution admin requests.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin verifications...</p>
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
              <h1 className="text-3xl font-bold text-red-600 dark:text-red-400">
                👑 Admin Verification System
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review and verify institution admin requests (Super Admin/Moderator only)
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
                onClick={() => {
                  if (activeTab === 'pending') {
                    fetchAdminApprovals();
                  } else {
                    fetchAllAdmins();
                  }
                  fetchStats();
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Message - Only show for connectivity issues */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Backend Connection Issue
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>{error}</p>
                  <p className="mt-1">Demo data is being shown for testing purposes.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Admin Approvals</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingApprovals || adminApprovals.filter(app => app.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-xl">👑</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Institution Admins</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.institutionAdmins || allAdmins.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-xl">👥</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.totalUsers || 1250}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'pending'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                Pending Approvals ({adminApprovals.filter(app => app.status === 'pending').length})
              </button>
              <button
                onClick={() => setActiveTab('all')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'all'
                    ? 'border-red-500 text-red-600 dark:text-red-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
                }`}
              >
                All Admins ({allAdmins.length})
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'pending' && (
            <div className="p-6">
              {adminApprovals.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No pending admin approvals
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no pending admin approval requests at the moment.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminApprovals.map((approval) => (
                    <div key={approval._id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <span className="text-2xl">👑</span>
                          </div>
                          <div>
                            <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                              {approval.user?.name || 'Unknown User'}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {approval.user?.email}
                            </p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(approval.status)}`}>
                                {approval.status.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                                {approval.requestedAdminType?.toUpperCase() || 'PRIMARY'}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(approval.priority)}`}>
                                {approval.priority?.toUpperCase() || 'NORMAL'}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(approval.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {approval.institution?.name || 'No Institution'} ({approval.institution?.code || 'N/A'})
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {approval.user?.phoneNumber || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Role</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{approval.currentRole}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Role</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{approval.requestedRole}</p>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Reason</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                          {approval.reason}
                        </p>
                      </div>

                      {approval.additionalInfo && (
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Information</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                            {approval.additionalInfo}
                          </p>
                        </div>
                      )}

                      {approval.status === 'pending' && (
                        <div className="flex space-x-3">
                          <button
                            onClick={() => setSelectedAdmin(approval)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Add approval notes (optional):');
                              if (notes !== null) {
                                const adminType = prompt('Admin type (primary/secondary):', approval.requestedAdminType || 'primary') || 'primary';
                                handleAdminApproval(approval._id, 'approve', notes, adminType);
                              }
                            }}
                            disabled={actionLoading}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => {
                              const notes = prompt('Reason for rejection:');
                              if (notes && notes.trim()) {
                                handleAdminApproval(approval._id, 'reject', notes);
                              }
                            }}
                            disabled={actionLoading}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            {actionLoading ? 'Processing...' : 'Reject'}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* All Admins Tab */}
          {activeTab === 'all' && (
            <div className="p-6">
              {/* Filters for All Admins */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                    placeholder="Search admins..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Institution
                  </label>
                  <select
                    value={filters.institution}
                    onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Institutions</option>
                    {/* Add institution options dynamically */}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Admin Type
                  </label>
                  <select
                    value={filters.adminType}
                    onChange={(e) => setFilters(prev => ({ ...prev, adminType: e.target.value, page: 1 }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="all">All Types</option>
                    <option value="primary">Primary</option>
                    <option value="secondary">Secondary</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total: {allAdmins.length} admins
                  </div>
                </div>
              </div>

              {allAdmins.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">👑</div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No admins found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    There are no institution admins at the moment.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Admin
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Institution
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {allAdmins.map((admin) => (
                        <tr key={admin._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    {admin.name?.charAt(0) || '?'}
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {admin.name}
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  {admin.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 dark:text-white">
                              {admin.institution?.name || 'No Institution'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {admin.institution?.code || ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              {admin.adminType || 'primary'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              admin.isVerified
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            }`}>
                              {admin.isVerified ? 'Verified' : 'Pending'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(admin.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedAdmin(admin)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                            >
                              View Details
                            </button>
                            <button
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Admin Details Modal */}
        {selectedAdmin && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Admin Details
                  </h3>
                  <button
                    onClick={() => setSelectedAdmin(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* User Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">User Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.user?.name || selectedAdmin.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.user?.email || selectedAdmin.email}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.user?.phoneNumber || selectedAdmin.phoneNumber || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Role:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.requestedRole || selectedAdmin.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Institution Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Institution Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Institution:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.institution?.name || 'No Institution'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Code:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.institution?.code || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Admin Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedAdmin.requestedAdminType || selectedAdmin.adminType || 'primary'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Request Details (for pending approvals) */}
                  {selectedAdmin.reason && (
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Request Details</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{selectedAdmin.reason}</p>
                        </div>
                        {selectedAdmin.additionalInfo && (
                          <div>
                            <span className="text-gray-500 dark:text-gray-400">Additional Information:</span>
                            <p className="mt-1 text-gray-900 dark:text-white">{selectedAdmin.additionalInfo}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Timeline */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(selectedAdmin.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedAdmin.verifiedAt && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Verified:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {new Date(selectedAdmin.verifiedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={() => setSelectedAdmin(null)}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVerificationSystem;
