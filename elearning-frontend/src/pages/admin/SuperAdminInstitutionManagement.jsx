import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';
import { dashboardAPI } from '../../services/api';

const SuperAdminInstitutionManagement = () => {
  const [activeTab, setActiveTab] = useState('all-institutions');
  const [institutions, setInstitutions] = useState([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [institutionsPerPage] = useState(12);
  const [showInstitutionModal, setShowInstitutionModal] = useState(false);
  const [selectedInstitution, setSelectedInstitution] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Get current super admin user
  const currentUser = JSON.parse(localStorage.getItem('appAdminUser') || '{}');

  useEffect(() => {
    fetchInstitutions();
  }, []);

  useEffect(() => {
    filterInstitutions();
  }, [institutions, searchTerm, selectedStatus, selectedType]);

  const fetchInstitutions = async () => {
    try {
      setLoading(true);
      // For now, use mock data - replace with real API call
      const mockInstitutions = [
        {
          id: 1,
          name: 'University of Lagos',
          shortName: 'UNILAG',
          type: 'Federal University',
          location: 'Lagos, Nigeria',
          status: 'verified',
          establishedYear: 1962,
          website: 'https://unilag.edu.ng',
          totalUsers: 2456,
          totalAdmins: 3,
          totalModerators: 8,
          totalStudents: 2234,
          totalInstructors: 211,
          totalCourses: 145,
          verifiedAt: new Date('2024-01-10'),
          lastActivity: new Date('2024-01-21')
        },
        {
          id: 2,
          name: 'Ahmadu Bello University',
          shortName: 'ABU',
          type: 'Federal University',
          location: 'Zaria, Kaduna State',
          status: 'verified',
          establishedYear: 1962,
          website: 'https://abu.edu.ng',
          totalUsers: 1876,
          totalAdmins: 2,
          totalModerators: 6,
          totalStudents: 1698,
          totalInstructors: 170,
          totalCourses: 98,
          verifiedAt: new Date('2024-01-08'),
          lastActivity: new Date('2024-01-20')
        },
        {
          id: 3,
          name: 'University of Ibadan',
          shortName: 'UI',
          type: 'Federal University',
          location: 'Ibadan, Oyo State',
          status: 'verified',
          establishedYear: 1948,
          website: 'https://ui.edu.ng',
          totalUsers: 1654,
          totalAdmins: 2,
          totalModerators: 5,
          totalStudents: 1456,
          totalInstructors: 191,
          totalCourses: 112,
          verifiedAt: new Date('2024-01-05'),
          lastActivity: new Date('2024-01-19')
        },
        {
          id: 4,
          name: 'Federal University of Technology, Akure',
          shortName: 'FUTA',
          type: 'Federal University of Technology',
          location: 'Akure, Ondo State',
          status: 'pending',
          establishedYear: 1981,
          website: 'https://futa.edu.ng',
          totalUsers: 0,
          totalAdmins: 0,
          totalModerators: 0,
          totalStudents: 0,
          totalInstructors: 0,
          totalCourses: 0,
          verifiedAt: null,
          lastActivity: null,
          applicationDate: new Date('2024-01-18')
        },
        {
          id: 5,
          name: 'University of Benin',
          shortName: 'UNIBEN',
          type: 'Federal University',
          location: 'Benin City, Edo State',
          status: 'suspended',
          establishedYear: 1970,
          website: 'https://uniben.edu',
          totalUsers: 987,
          totalAdmins: 1,
          totalModerators: 3,
          totalStudents: 876,
          totalInstructors: 107,
          totalCourses: 67,
          verifiedAt: new Date('2024-01-12'),
          lastActivity: new Date('2024-01-16'),
          suspendedAt: new Date('2024-01-17'),
          suspensionReason: 'Policy violation - unauthorized course content'
        },
        {
          id: 6,
          name: 'Lagos State University',
          shortName: 'LASU',
          type: 'State University',
          location: 'Lagos, Nigeria',
          status: 'verified',
          establishedYear: 1983,
          website: 'https://lasu.edu.ng',
          totalUsers: 1234,
          totalAdmins: 2,
          totalModerators: 4,
          totalStudents: 1098,
          totalInstructors: 130,
          totalCourses: 89,
          verifiedAt: new Date('2024-01-14'),
          lastActivity: new Date('2024-01-21')
        }
      ];
      
      setInstitutions(mockInstitutions);
      setError(null);
    } catch (err) {
      console.error('Error fetching institutions:', err);
      setError('Unable to load institutions. Please try again.');
      setInstitutions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterInstitutions = () => {
    let filtered = institutions;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(institution =>
        institution.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        institution.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(institution => institution.status === selectedStatus);
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(institution => institution.type === selectedType);
    }

    setFilteredInstitutions(filtered);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleInstitutionAction = async (institutionId, action) => {
    try {
      setActionLoading(true);
      console.log(`Performing ${action} on institution ${institutionId}`);
      
      // Mock API call - replace with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update institution status locally
      setInstitutions(prevInstitutions =>
        prevInstitutions.map(institution =>
          institution.id === institutionId
            ? {
                ...institution,
                status: action === 'verify' ? 'verified' : 
                       action === 'suspend' ? 'suspended' : 
                       action === 'activate' ? 'verified' : institution.status,
                verifiedAt: action === 'verify' ? new Date() : institution.verifiedAt,
                suspendedAt: action === 'suspend' ? new Date() : institution.suspendedAt
              }
            : institution
        )
      );

      setShowInstitutionModal(false);
      setSelectedInstitution(null);
    } catch (err) {
      console.error(`Error performing ${action}:`, err);
      setError(`Failed to ${action} institution. Please try again.`);
    } finally {
      setActionLoading(false);
    }
  };

  const getUniqueTypes = () => {
    return [...new Set(institutions.map(institution => institution.type))].sort();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'suspended': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    if (type.includes('Federal')) return '🏛️';
    if (type.includes('State')) return '🏢';
    if (type.includes('Private')) return '🏬';
    if (type.includes('Technology')) return '⚙️';
    return '🎓';
  };

  // Pagination
  const indexOfLastInstitution = currentPage * institutionsPerPage;
  const indexOfFirstInstitution = indexOfLastInstitution - institutionsPerPage;
  const currentInstitutions = filteredInstitutions.slice(indexOfFirstInstitution, indexOfLastInstitution);
  const totalPages = Math.ceil(filteredInstitutions.length / institutionsPerPage);

  const tabs = [
    { id: 'all-institutions', name: 'All Institutions', icon: '🏫', count: institutions.length },
    { id: 'verified', name: 'Verified', icon: '✅', count: institutions.filter(i => i.status === 'verified').length },
    { id: 'pending', name: 'Pending Verification', icon: '⏳', count: institutions.filter(i => i.status === 'pending').length },
    { id: 'suspended', name: 'Suspended', icon: '🚫', count: institutions.filter(i => i.status === 'suspended').length }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading institution management...</p>
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
                {ROLE_ICONS[USER_ROLES.SUPER_ADMIN]} Institution Management
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Manage university verifications, monitoring, and oversight
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
                onClick={fetchInstitutions}
                disabled={loading}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                🔄 Refresh
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

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Search Institutions
              </label>
              <input
                type="text"
                placeholder="Search by name, abbreviation, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              />
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
                <option value="verified">Verified</option>
                <option value="pending">Pending</option>
                <option value="suspended">Suspended</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Filter by Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-red-500 focus:border-red-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Types</option>
                {getUniqueTypes().map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Institutions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentInstitutions.map((institution) => (
            <div key={institution.id} className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <span className="text-2xl">{getTypeIcon(institution.type)}</span>
                      </div>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {institution.shortName}
                      </h3>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(institution.status)}`}>
                        {institution.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                    {institution.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{institution.location}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{institution.type}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Est. {institution.establishedYear}</p>
                </div>

                {institution.status === 'verified' && (
                  <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Total Users</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{institution.totalUsers.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Courses</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{institution.totalCourses}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Students</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{institution.totalStudents.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 dark:text-gray-400">Instructors</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{institution.totalInstructors}</p>
                    </div>
                  </div>
                )}

                <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                  {institution.status === 'verified' && institution.verifiedAt && (
                    <p>Verified: {institution.verifiedAt.toLocaleDateString()}</p>
                  )}
                  {institution.status === 'pending' && institution.applicationDate && (
                    <p>Applied: {institution.applicationDate.toLocaleDateString()}</p>
                  )}
                  {institution.status === 'suspended' && institution.suspendedAt && (
                    <p>Suspended: {institution.suspendedAt.toLocaleDateString()}</p>
                  )}
                  {institution.lastActivity && (
                    <p>Last activity: {institution.lastActivity.toLocaleDateString()}</p>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedInstitution(institution);
                      setShowInstitutionModal(true);
                    }}
                    className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-700 transition-colors"
                  >
                    Manage
                  </button>
                  {institution.website && (
                    <a
                      href={institution.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-700 transition-colors text-center"
                    >
                      Visit Site
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-medium">{indexOfFirstInstitution + 1}</span> to{' '}
                <span className="font-medium">{Math.min(indexOfLastInstitution, filteredInstitutions.length)}</span> of{' '}
                <span className="font-medium">{filteredInstitutions.length}</span> results
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
                        ? 'z-10 bg-red-50 border-red-500 text-red-600 dark:bg-red-900 dark:text-red-200'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        )}
      </div>

      {/* Institution Management Modal */}
      {showInstitutionModal && selectedInstitution && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Manage: {selectedInstitution.shortName}
                </h3>
                <button
                  onClick={() => setShowInstitutionModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Name: {selectedInstitution.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Type: {selectedInstitution.type}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Location: {selectedInstitution.location}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status: {selectedInstitution.status}</p>
                {selectedInstitution.suspensionReason && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-2">
                    Suspension Reason: {selectedInstitution.suspensionReason}
                  </p>
                )}
              </div>

              <div className="flex flex-col space-y-3">
                {selectedInstitution.status === 'pending' && (
                  <button
                    onClick={() => handleInstitutionAction(selectedInstitution.id, 'verify')}
                    disabled={actionLoading}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Verify Institution'}
                  </button>
                )}
                
                {selectedInstitution.status === 'verified' && (
                  <button
                    onClick={() => handleInstitutionAction(selectedInstitution.id, 'suspend')}
                    disabled={actionLoading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Suspend Institution'}
                  </button>
                )}
                
                {selectedInstitution.status === 'suspended' && (
                  <button
                    onClick={() => handleInstitutionAction(selectedInstitution.id, 'activate')}
                    disabled={actionLoading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                  >
                    {actionLoading ? 'Processing...' : 'Reactivate Institution'}
                  </button>
                )}
                
                <button
                  onClick={() => setShowInstitutionModal(false)}
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

export default SuperAdminInstitutionManagement;
