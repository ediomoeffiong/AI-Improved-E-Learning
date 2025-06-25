import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ADMIN_TYPES } from '../../constants/roles';

const SuperAdminUserApprovals = () => {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApproval, setSelectedApproval] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'pending',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  // Fetch approvals from API
  const fetchApprovals = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        type: filters.type,
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setApprovals(data.approvals || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setError(error.message);
      
      // Fallback to demo data if API fails
      setApprovals([
        {
          _id: 'demo-1',
          user: {
            _id: 'user-1',
            name: 'John Doe',
            email: 'john.doe@university.edu',
            username: 'johndoe',
            phoneNumber: '+234-801-234-5678'
          },
          approvalType: 'admin_verification',
          currentRole: 'Student',
          requestedRole: 'Admin',
          requestedAdminType: 'primary',
          institution: {
            _id: 'inst-1',
            name: 'University of Lagos',
            code: 'UNILAG'
          },
          reason: 'Request to become institution admin',
          additionalInfo: 'I am the IT director at this institution',
          status: 'pending',
          priority: 'normal',
          createdAt: new Date().toISOString(),
          ageInDays: 2
        },
        {
          _id: 'demo-2',
          user: {
            _id: 'user-2',
            name: 'Jane Smith',
            email: 'jane.smith@university.edu',
            username: 'janesmith',
            phoneNumber: '+234-802-345-6789'
          },
          approvalType: 'moderator_verification',
          currentRole: 'Student',
          requestedRole: 'Moderator',
          institution: {
            _id: 'inst-2',
            name: 'University of Ibadan',
            code: 'UI'
          },
          reason: 'Request to become institution moderator',
          additionalInfo: 'I am a senior student and would like to help moderate',
          status: 'pending',
          priority: 'normal',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          ageInDays: 1
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, [filters]);

  // Handle approval action
  const handleApprovalAction = async (approvalId, action, notes = '', adminType = 'primary') => {
    try {
      setActionLoading(true);
      
      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
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
      setApprovals(prev => prev.filter(approval => approval._id !== approvalId));
      setSelectedApproval(null);
      
      alert(`✅ ${data.message}`);
    } catch (error) {
      console.error('Error processing approval:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Get approval type display name
  const getApprovalTypeDisplay = (type) => {
    const types = {
      'admin_verification': 'Admin Verification',
      'moderator_verification': 'Moderator Verification',
      'institution_join': 'Institution Join',
      'role_upgrade': 'Role Upgrade'
    };
    return types[type] || type;
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'text-gray-600 bg-gray-100',
      'normal': 'text-blue-600 bg-blue-100',
      'high': 'text-orange-600 bg-orange-100',
      'urgent': 'text-red-600 bg-red-100'
    };
    return colors[priority] || colors.normal;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-600 bg-yellow-100',
      'approved': 'text-green-600 bg-green-100',
      'rejected': 'text-red-600 bg-red-100',
      'cancelled': 'text-gray-600 bg-gray-100'
    };
    return colors[status] || colors.pending;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading user approvals...</p>
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
                🔴 User Approvals Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review and manage all pending user approval requests
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
                onClick={fetchApprovals}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                🔄 Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Approval Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="admin_verification">Admin Verification</option>
                <option value="moderator_verification">Moderator Verification</option>
                <option value="institution_join">Institution Join</option>
                <option value="role_upgrade">Role Upgrade</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Items per page
              </label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total: {pagination.totalCount || approvals.length} approvals
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-yellow-400">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  API Connection Issue
                </h3>
                <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Unable to connect to the backend. Showing demo data for testing purposes.</p>
                  <p className="mt-1">Error: {error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Approvals List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {approvals.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No approvals found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are no {filters.status} approval requests at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Request Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Age
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {approvals.map((approval) => (
                    <tr key={approval._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                {approval.user?.name?.charAt(0) || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {approval.user?.name || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {approval.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {getApprovalTypeDisplay(approval.approvalType)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {approval.currentRole} → {approval.requestedRole}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {approval.institution?.name || 'No Institution'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {approval.institution?.code || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(approval.priority)}`}>
                          {approval.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(approval.status)}`}>
                          {approval.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {approval.ageInDays || Math.floor((Date.now() - new Date(approval.createdAt)) / (1000 * 60 * 60 * 24))} days
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedApproval(approval)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                        >
                          View Details
                        </button>
                        {approval.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprovalAction(approval._id, 'approve')}
                              disabled={actionLoading}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovalAction(approval._id, 'reject')}
                              disabled={actionLoading}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-6 rounded-lg shadow">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={!pagination.hasPrevPage}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNextPage}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Showing page <span className="font-medium">{pagination.currentPage}</span> of{' '}
                  <span className="font-medium">{pagination.totalPages}</span> ({pagination.totalCount} total)
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={!pagination.hasPrevPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                    disabled={!pagination.hasNextPage}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}

        {/* Approval Details Modal */}
        {selectedApproval && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Approval Request Details
                  </h3>
                  <button
                    onClick={() => setSelectedApproval(null)}
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
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.user?.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.user?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Username:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.user?.username || 'N/A'}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.user?.phoneNumber || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Request Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Request Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{getApprovalTypeDisplay(selectedApproval.approvalType)}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Current Role:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.currentRole}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Requested Role:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.requestedRole}</span>
                      </div>
                      {selectedApproval.requestedAdminType && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Admin Type:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedApproval.requestedAdminType}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Institution:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedApproval.institution?.name || 'No Institution'}
                          {selectedApproval.institution?.code && ` (${selectedApproval.institution.code})`}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Priority:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedApproval.priority)}`}>
                          {selectedApproval.priority}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedApproval.status)}`}>
                          {selectedApproval.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Reason and Additional Info */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Request Details</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Reason:</span>
                        <p className="mt-1 text-gray-900 dark:text-white">{selectedApproval.reason}</p>
                      </div>
                      {selectedApproval.additionalInfo && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Additional Information:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{selectedApproval.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(selectedApproval.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedApproval.reviewedAt && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Reviewed:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {new Date(selectedApproval.reviewedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedApproval.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          const notes = prompt('Enter approval notes (optional):');
                          if (notes !== null) {
                            let adminType = 'primary';
                            if (selectedApproval.approvalType === 'admin_verification') {
                              adminType = prompt('Enter admin type (primary/secondary):', 'primary') || 'primary';
                            }
                            handleApprovalAction(selectedApproval._id, 'approve', notes, adminType);
                          }
                        }}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Enter rejection reason:');
                          if (notes !== null && notes.trim()) {
                            handleApprovalAction(selectedApproval._id, 'reject', notes);
                          }
                        }}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => setSelectedApproval(null)}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                      >
                        Close
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperAdminUserApprovals;