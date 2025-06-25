import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const UniversityVerificationSystem = () => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [filters, setFilters] = useState({
    status: 'pending',
    type: 'all',
    state: 'all',
    search: '',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({});
  const [selectedInstitution, setSelectedInstitution] = useState(null);

  useEffect(() => {
    // Mock data for pending university verification requests
    const mockPendingUniversities = [
      {
        id: 1,
        name: 'Federal University of Technology, Bauchi',
        location: 'Bauchi',
        state: 'Bauchi',
        type: 'public',
        website: 'https://futbauchi.edu.ng',
        contactEmail: 'info@futbauchi.edu.ng',
        requestedBy: 'Prof. Ahmed Musa',
        requestedByEmail: 'ahmed.musa@futbauchi.edu.ng',
        requestedByRole: 'Vice Chancellor',
        submittedAt: '2024-01-15 10:30:00',
        documents: [
          { name: 'University Charter', url: '/docs/charter-1.pdf', verified: true },
          { name: 'NUC Recognition Letter', url: '/docs/nuc-1.pdf', verified: false },
          { name: 'Official Website Screenshot', url: '/docs/website-1.pdf', verified: true }
        ],
        status: 'pending',
        adminNotes: '',
        verificationLevel: 'basic'
      },
      {
        id: 2,
        name: 'Kogi State University of Science and Technology',
        location: 'Anyigba',
        state: 'Kogi',
        type: 'state',
        website: 'https://kogisust.edu.ng',
        contactEmail: 'registrar@kogisust.edu.ng',
        requestedBy: 'Dr. Sarah Johnson',
        requestedByEmail: 'sarah.johnson@kogisust.edu.ng',
        requestedByRole: 'Registrar',
        submittedAt: '2024-01-14 16:45:00',
        documents: [
          { name: 'State Government Approval', url: '/docs/state-approval-2.pdf', verified: true },
          { name: 'Academic Programs List', url: '/docs/programs-2.pdf', verified: true },
          { name: 'Faculty Directory', url: '/docs/faculty-2.pdf', verified: false }
        ],
        status: 'pending',
        adminNotes: 'Requires additional verification of faculty credentials',
        verificationLevel: 'enhanced'
      }
    ];



    // This will be replaced with real API calls
    setInstitutions(mockPendingUniversities);
    setLoading(false);
  }, []);

  // Fetch institutions from API
  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        status: filters.status,
        type: filters.type !== 'all' ? filters.type : '',
        state: filters.state !== 'all' ? filters.state : '',
        search: filters.search,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder
      });

      // Remove empty parameters
      for (const [key, value] of [...queryParams.entries()]) {
        if (!value) queryParams.delete(key);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/institutions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setInstitutions(data.institutions || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching institutions:', error);
      setError(error.message);

      // Fallback to demo data if API fails
      const mockInstitutions = [
        {
          _id: 'demo-1',
          name: 'Federal University of Technology, Bauchi',
          code: 'FUTBAUCHI',
          type: 'university',
          location: {
            state: 'Bauchi',
            city: 'Bauchi',
            country: 'Nigeria'
          },
          contact: {
            email: 'info@futbauchi.edu.ng',
            phone: '+234-803-123-4567',
            website: 'https://futbauchi.edu.ng'
          },
          status: filters.status,
          createdAt: new Date().toISOString(),
          stats: {
            totalUsers: 150,
            totalAdmins: 1,
            totalModerators: 3,
            totalStudents: 120,
            totalInstructors: 25
          },
          settings: {
            maxAdmins: 2,
            maxModerators: 5,
            enableCBT: true,
            enableClassroom: false
          }
        },
        {
          _id: 'demo-2',
          name: 'Kano State Polytechnic',
          code: 'KANOPOLY',
          type: 'polytechnic',
          location: {
            state: 'Kano',
            city: 'Kano',
            country: 'Nigeria'
          },
          contact: {
            email: 'info@kanopoly.edu.ng',
            phone: '+234-802-234-5678',
            website: 'https://kanopoly.edu.ng'
          },
          status: filters.status,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          stats: {
            totalUsers: 89,
            totalAdmins: 2,
            totalModerators: 2,
            totalStudents: 75,
            totalInstructors: 10
          },
          settings: {
            maxAdmins: 2,
            maxModerators: 5,
            enableCBT: false,
            enableClassroom: true
          }
        }
      ];
      setInstitutions(mockInstitutions);
    } finally {
      setLoading(false);
    }
  };

  // Fetch institution statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('appAdminToken');
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/institutions/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || {});
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set fallback stats
      setStats({
        totalInstitutions: 25,
        verifiedInstitutions: 20,
        pendingInstitutions: 3,
        suspendedInstitutions: 2
      });
    }
  };

  // Update useEffect to use new functions
  useEffect(() => {
    fetchInstitutions();
  }, [filters]);

  useEffect(() => {
    fetchStats();
  }, []);

  // Handle institution verification/rejection
  const handleVerification = async (institutionId, action, notes = '') => {
    try {
      setActionLoading(true);

      const token = localStorage.getItem('appAdminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const institution = institutions.find(inst => inst._id === institutionId);
      if (!institution) {
        throw new Error('Institution not found');
      }

      const status = action === 'approve' ? 'verified' : 'rejected';

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/super-admin/institutions/${institutionId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          notes
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      // Update local state
      setInstitutions(prev =>
        prev.map(inst =>
          inst._id === institutionId
            ? { ...inst, status, adminNotes: notes, verifiedAt: new Date().toISOString() }
            : inst
        )
      );

      // Close modal if open
      setSelectedInstitution(null);

      // Refresh data to get updated counts
      fetchStats();

      alert(`✅ ${data.message}`);
    } catch (error) {
      console.error('Error processing verification:', error);
      alert(`❌ Error: ${error.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'verified':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'federal': return '🏛️';
      case 'state': return '🏢';
      case 'private': return '🏫';
      default: return '🎓';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
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
                🏛️ Institution Verification System
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Review and verify institution requests for platform inclusion
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
                  fetchInstitutions();
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

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <span className="text-xl">⏳</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.pendingInstitutions || institutions.filter(inst => inst.status === 'pending').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Verified Institutions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.verifiedInstitutions || institutions.filter(inst => inst.status === 'verified').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-xl">🏛️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Institutions</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.totalInstitutions || institutions.length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <span className="text-xl">⛔</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">Suspended</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.suspendedInstitutions || institutions.filter(inst => inst.status === 'suspended').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value, page: 1 }))}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="university">University</option>
                <option value="polytechnic">Polytechnic</option>
                <option value="college">College</option>
                <option value="institute">Institute</option>
                <option value="school">School</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                placeholder="Search institutions..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
              />
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
                Total: {pagination.totalCount || institutions.length} institutions
              </div>
            </div>
          </div>
        </div>

        {/* Institutions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {institutions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏛️</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No institutions found
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                There are no {filters.status} institutions at the moment.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Institution
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type & Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Users
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
                  {institutions.map((institution) => (
                    <tr key={institution._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                              <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                {getTypeIcon(institution.type)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {institution.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {institution.code}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {institution.type.charAt(0).toUpperCase() + institution.type.slice(1)}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {institution.location?.city}, {institution.location?.state}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {institution.contact?.email}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {institution.contact?.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(institution.status)}`}>
                          {institution.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        <div>Total: {institution.stats?.totalUsers || 0}</div>
                        <div>Admins: {institution.stats?.totalAdmins || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(institution.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => setSelectedInstitution(institution)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 mr-3"
                        >
                          View Details
                        </button>
                        {institution.status === 'pending' && (
                          <>
                            <button
                              onClick={() => {
                                const notes = prompt('Add verification notes (optional):');
                                if (notes !== null) {
                                  handleVerification(institution._id, 'approve', notes);
                                }
                              }}
                              disabled={actionLoading}
                              className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 mr-3 disabled:opacity-50"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => {
                                const notes = prompt('Reason for rejection:');
                                if (notes && notes.trim()) {
                                  handleVerification(institution._id, 'reject', notes);
                                }
                              }}
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

        {/* Institution Details Modal */}
        {selectedInstitution && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Institution Details
                  </h3>
                  <button
                    onClick={() => setSelectedInstitution(null)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Basic Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Name:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.name}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Code:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.code}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedInstitution.type.charAt(0).toUpperCase() + selectedInstitution.type.slice(1)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedInstitution.status)}`}>
                          {selectedInstitution.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Location</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">City:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.location?.city}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">State:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.location?.state}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Country:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.location?.country}</span>
                      </div>
                      {selectedInstitution.location?.address && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Address:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.location.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Contact Information</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Email:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.contact?.email}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Phone:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.contact?.phone}</span>
                      </div>
                      {selectedInstitution.contact?.website && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Website:</span>
                          <a
                            href={selectedInstitution.contact.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-2 text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            {selectedInstitution.contact.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Statistics */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Total Users:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.stats?.totalUsers || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Admins:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.stats?.totalAdmins || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Moderators:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.stats?.totalModerators || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Students:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.stats?.totalStudents || 0}</span>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Settings</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Max Admins:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.settings?.maxAdmins || 2}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Max Moderators:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{selectedInstitution.settings?.maxModerators || 5}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">CBT Enabled:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedInstitution.settings?.enableCBT ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Classroom Enabled:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {selectedInstitution.settings?.enableClassroom ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Timestamps */}
                  <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Timeline</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">
                          {new Date(selectedInstitution.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedInstitution.verifiedAt && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Verified:</span>
                          <span className="ml-2 text-gray-900 dark:text-white">
                            {new Date(selectedInstitution.verifiedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {selectedInstitution.adminNotes && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Admin Notes:</span>
                          <p className="mt-1 text-gray-900 dark:text-white">{selectedInstitution.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedInstitution.status === 'pending' && (
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => {
                          const notes = prompt('Add verification notes (optional):');
                          if (notes !== null) {
                            handleVerification(selectedInstitution._id, 'approve', notes);
                          }
                        }}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Verify & Approve'}
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Reason for rejection:');
                          if (notes && notes.trim()) {
                            handleVerification(selectedInstitution._id, 'reject', notes);
                          }
                        }}
                        disabled={actionLoading}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                      >
                        {actionLoading ? 'Processing...' : 'Reject'}
                      </button>
                      <button
                        onClick={() => setSelectedInstitution(null)}
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

export default UniversityVerificationSystem;
