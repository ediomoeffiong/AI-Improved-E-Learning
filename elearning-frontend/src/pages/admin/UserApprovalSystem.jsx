import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES, ADMIN_TYPES } from '../../constants/roles';
import { NIGERIAN_UNIVERSITIES, INSTITUTION_REQUEST_STATUS } from '../../constants/institutions';

const UserApprovalSystem = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterRole, setFilterRole] = useState('all');

  // Mock data for pending requests
  useEffect(() => {
    const mockRequests = [
      {
        id: 1,
        name: 'John Doe',
        email: 'john.doe@student.unilag.edu.ng',
        requestedRole: USER_ROLES.STUDENT,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        department: 'Computer Science',
        studentId: 'CS/2024/001',
        phoneNumber: '+234-801-234-5678',
        documents: [
          { name: 'Student ID Card', url: '/docs/student-id-1.pdf', verified: false },
          { name: 'Admission Letter', url: '/docs/admission-1.pdf', verified: true }
        ],
        submittedAt: '2024-01-15 10:30:00',
        status: INSTITUTION_REQUEST_STATUS.PENDING,
        requestType: 'institution_join',
        additionalInfo: 'Final year student seeking access to advanced courses'
      },
      {
        id: 2,
        name: 'Dr. Jane Smith',
        email: 'jane.smith@unilag.edu.ng',
        requestedRole: USER_ROLES.INSTRUCTOR,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        department: 'Mathematics',
        staffId: 'MATH/2024/15',
        phoneNumber: '+234-802-345-6789',
        documents: [
          { name: 'Staff ID Card', url: '/docs/staff-id-2.pdf', verified: true },
          { name: 'Employment Letter', url: '/docs/employment-2.pdf', verified: true },
          { name: 'PhD Certificate', url: '/docs/phd-cert-2.pdf', verified: false }
        ],
        submittedAt: '2024-01-15 09:15:00',
        status: INSTITUTION_REQUEST_STATUS.PENDING,
        requestType: 'institution_join',
        additionalInfo: 'New faculty member in Mathematics department'
      },
      {
        id: 3,
        name: 'Prof. Michael Johnson',
        email: 'michael.johnson@unilag.edu.ng',
        requestedRole: USER_ROLES.ADMIN,
        adminType: ADMIN_TYPES.SECONDARY,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        department: 'Administration',
        staffId: 'ADMIN/2024/03',
        phoneNumber: '+234-803-456-7890',
        documents: [
          { name: 'Administrative Appointment Letter', url: '/docs/admin-appointment-3.pdf', verified: true },
          { name: 'University Authorization', url: '/docs/auth-3.pdf', verified: false }
        ],
        submittedAt: '2024-01-14 16:45:00',
        status: INSTITUTION_REQUEST_STATUS.PENDING,
        requestType: 'admin_request',
        additionalInfo: 'Requesting secondary admin access for student affairs management'
      }
    ];
    
    setPendingRequests(mockRequests);
    setLoading(false);
  }, []);

  const handleApproval = async (requestId, action, adminType = null) => {
    try {
      const request = pendingRequests.find(r => r.id === requestId);
      
      if (action === 'approve') {
        // Check admin limits for admin requests
        if (request.requestedRole === USER_ROLES.ADMIN) {
          const currentAdmins = await checkCurrentAdminCount(request.institution);
          if (currentAdmins >= 2) {
            alert('❌ Maximum of 2 admins allowed per institution. Cannot approve this request.');
            return;
          }
        }

        // Update request status
        setPendingRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: INSTITUTION_REQUEST_STATUS.APPROVED, adminType }
              : req
          )
        );

        // TODO: Call API to approve user and create account
        console.log(`Approving user ${request.name} as ${request.requestedRole}`, { adminType });
        alert(`✅ ${request.name} has been approved as ${request.requestedRole}${adminType ? ` (${adminType} admin)` : ''}`);
      } else {
        // Reject request
        setPendingRequests(prev => 
          prev.map(req => 
            req.id === requestId 
              ? { ...req, status: INSTITUTION_REQUEST_STATUS.REJECTED }
              : req
          )
        );
        
        console.log(`Rejecting user ${request.name}`);
        alert(`❌ ${request.name}'s request has been rejected`);
      }
    } catch (error) {
      console.error('Error processing approval:', error);
      alert('Error processing request. Please try again.');
    }
  };

  const checkCurrentAdminCount = async (institution) => {
    // TODO: Implement API call to check current admin count
    // For now, return mock data
    return 1; // Simulate 1 existing admin
  };

  const filteredRequests = pendingRequests.filter(request => {
    if (filterStatus !== 'all' && request.status !== filterStatus) return false;
    if (filterRole !== 'all' && request.requestedRole !== filterRole) return false;
    return true;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case INSTITUTION_REQUEST_STATUS.PENDING:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case INSTITUTION_REQUEST_STATUS.APPROVED:
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case INSTITUTION_REQUEST_STATUS.REJECTED:
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case USER_ROLES.STUDENT: return '🎓';
      case USER_ROLES.INSTRUCTOR: return '👨‍🏫';
      case USER_ROLES.ADMIN: return '👑';
      case USER_ROLES.MODERATOR: return '🛡️';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Approval System</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and approve user requests for {user?.institutionName || 'your institution'}
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value={INSTITUTION_REQUEST_STATUS.PENDING}>Pending</option>
            <option value={INSTITUTION_REQUEST_STATUS.APPROVED}>Approved</option>
            <option value={INSTITUTION_REQUEST_STATUS.REJECTED}>Rejected</option>
          </select>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Roles</option>
            <option value={USER_ROLES.STUDENT}>Students</option>
            <option value={USER_ROLES.INSTRUCTOR}>Instructors</option>
            <option value={USER_ROLES.ADMIN}>Admins</option>
            <option value={USER_ROLES.MODERATOR}>Moderators</option>
          </select>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.filter(r => r.status === INSTITUTION_REQUEST_STATUS.PENDING).length}
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.filter(r => r.status === INSTITUTION_REQUEST_STATUS.APPROVED).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-xl">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Rejected</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.filter(r => r.status === INSTITUTION_REQUEST_STATUS.REJECTED).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-xl">👑</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Admin Requests</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingRequests.filter(r => r.requestedRole === USER_ROLES.ADMIN).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Pending Requests ({filteredRequests.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredRequests.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500 dark:text-gray-400">No requests match your current filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">{getRoleIcon(request.requestedRole)}</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{request.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{request.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                            {request.status.toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                            {request.requestedRole.replace('_', ' ').toUpperCase()}
                          </span>
                          {request.adminType && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
                              {request.adminType.toUpperCase()} ADMIN
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{request.submittedAt}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {request.requestedRole === USER_ROLES.STUDENT ? 'Student ID' : 'Staff ID'}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.studentId || request.staffId}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{request.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Request Type</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.requestType.replace('_', ' ').toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {request.additionalInfo && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Information</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        {request.additionalInfo}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Documents Submitted</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {request.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
                          <div className="flex items-center space-x-2">
                            {doc.verified ? (
                              <span className="text-green-600 dark:text-green-400">✅</span>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">⏳</span>
                            )}
                            <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {request.status === INSTITUTION_REQUEST_STATUS.PENDING && (
                    <div className="flex space-x-3">
                      {request.requestedRole === USER_ROLES.ADMIN ? (
                        <>
                          <button
                            onClick={() => handleApproval(request.id, 'approve', ADMIN_TYPES.PRIMARY)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve as Primary Admin
                          </button>
                          <button
                            onClick={() => handleApproval(request.id, 'approve', ADMIN_TYPES.SECONDARY)}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                          >
                            Approve as Secondary Admin
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleApproval(request.id, 'approve')}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                          Approve Request
                        </button>
                      )}
                      <button
                        onClick={() => handleApproval(request.id, 'reject')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Details
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserApprovalSystem;
