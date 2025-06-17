import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants/roles';

const ModeratorVerificationSystem = () => {
  const { user } = useAuth();
  const [pendingModerators, setPendingModerators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  // Check if current user can verify moderators (Institution Admin)
  const canVerifyModerators = user?.role === USER_ROLES.ADMIN && user?.approvalStatus === 'approved';

  useEffect(() => {
    // Mock data for pending moderator verifications
    const mockPendingModerators = [
      {
        id: 1,
        name: 'Dr. James Wilson',
        email: 'james.wilson@unilag.edu.ng',
        requestedRole: USER_ROLES.MODERATOR,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        department: 'Computer Science',
        staffId: 'CS/MOD/2024/01',
        phoneNumber: '+234-805-678-9012',
        documents: [
          { name: 'Staff ID Card', url: '/docs/staff-id-mod-1.pdf', verified: true },
          { name: 'Department Recommendation', url: '/docs/recommendation-1.pdf', verified: false },
          { name: 'CV/Resume', url: '/docs/cv-1.pdf', verified: true }
        ],
        submittedAt: '2024-01-15 11:30:00',
        status: 'pending',
        requestType: 'moderator_verification',
        additionalInfo: 'Experienced lecturer seeking moderator role for CS department',
        assignedDepartments: ['Computer Science', 'Information Technology'],
        currentModeratorCount: 2 // Current number of moderators in this institution
      },
      {
        id: 2,
        name: 'Prof. Mary Adebayo',
        email: 'mary.adebayo@unilag.edu.ng',
        requestedRole: USER_ROLES.MODERATOR,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        department: 'Mathematics',
        staffId: 'MATH/MOD/2024/02',
        phoneNumber: '+234-806-789-0123',
        documents: [
          { name: 'Staff ID Card', url: '/docs/staff-id-mod-2.pdf', verified: true },
          { name: 'Academic Credentials', url: '/docs/credentials-2.pdf', verified: true },
          { name: 'HOD Recommendation', url: '/docs/hod-rec-2.pdf', verified: false }
        ],
        submittedAt: '2024-01-14 09:15:00',
        status: 'under_review',
        requestType: 'moderator_verification',
        additionalInfo: 'Senior faculty member with 15+ years experience',
        assignedDepartments: ['Mathematics', 'Statistics'],
        currentModeratorCount: 2
      }
    ];
    
    setPendingModerators(mockPendingModerators);
    setLoading(false);
  }, []);

  const handleModeratorVerification = async (moderatorId, action, notes = '') => {
    try {
      const moderator = pendingModerators.find(m => m.id === moderatorId);
      
      if (action === 'approve') {
        // Check moderator limits (max 5 per institution)
        if (moderator.currentModeratorCount >= 5) {
          alert('❌ Maximum of 5 moderators allowed per institution. Cannot approve this request.');
          return;
        }

        // Update moderator status
        setPendingModerators(prev => 
          prev.map(m => 
            m.id === moderatorId 
              ? { ...m, status: 'approved', adminNotes: notes, approvedAt: new Date().toISOString() }
              : m
          )
        );

        // TODO: Call API to approve moderator and grant access
        console.log(`Approving moderator ${moderator.name}`);
        alert(`✅ ${moderator.name} has been approved as moderator for ${moderator.institutionName}`);
      } else {
        // Reject moderator
        setPendingModerators(prev => 
          prev.map(m => 
            m.id === moderatorId 
              ? { ...m, status: 'rejected', adminNotes: notes, rejectedAt: new Date().toISOString() }
              : m
          )
        );
        
        console.log(`Rejecting moderator ${moderator.name}`);
        alert(`❌ ${moderator.name}'s moderator request has been rejected`);
      }
    } catch (error) {
      console.error('Error processing moderator verification:', error);
      alert('Error processing verification. Please try again.');
    }
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

  const filteredModerators = pendingModerators.filter(moderator => {
    if (filterStatus !== 'all' && moderator.status !== filterStatus) return false;
    return true;
  });

  if (!canVerifyModerators) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">🚫</span>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Only approved Institution Admins can verify moderator requests.
          </p>
        </div>
      </div>
    );
  }

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
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Moderator Verification System</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and verify moderator requests for your institution
          </p>
        </div>
        <div className="flex space-x-4">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="under_review">Under Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
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
                {pendingModerators.filter(m => m.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-xl">🔍</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Under Review</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingModerators.filter(m => m.status === 'under_review').length}
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
                {pendingModerators.filter(m => m.status === 'approved').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <span className="text-xl">🛡️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Moderators</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {pendingModerators[0]?.currentModeratorCount || 0}/5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderator Requests List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Moderator Verification Requests ({filteredModerators.length})
          </h3>
        </div>
        <div className="p-6">
          {filteredModerators.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500 dark:text-gray-400">No moderator verification requests match your current filters</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredModerators.map((moderator) => (
                <div key={moderator.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                        <span className="text-2xl">🛡️</span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{moderator.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{moderator.email}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(moderator.status)}`}>
                            {moderator.status.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="px-2 py-1 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-full text-xs font-medium">
                            MODERATOR
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                            {moderator.currentModeratorCount}/5 MODERATORS
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{moderator.submittedAt}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Department</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{moderator.department}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Staff ID</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{moderator.staffId}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{moderator.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Assigned Departments</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {moderator.assignedDepartments.join(', ')}
                      </p>
                    </div>
                  </div>

                  {moderator.additionalInfo && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Additional Information</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                        {moderator.additionalInfo}
                      </p>
                    </div>
                  )}

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Documents</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {moderator.documents.map((doc, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                          <span className="text-sm text-gray-700 dark:text-gray-300">{doc.name}</span>
                          <div className="flex items-center space-x-2">
                            {doc.verified ? (
                              <span className="text-green-600 dark:text-green-400">✅</span>
                            ) : (
                              <span className="text-yellow-600 dark:text-yellow-400">⏳</span>
                            )}
                            <button className="text-blue-600 dark:text-blue-400 hover:underline text-xs">
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {(moderator.status === 'pending' || moderator.status === 'under_review') && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          const notes = prompt('Add approval notes (optional):');
                          handleModeratorVerification(moderator.id, 'approve', notes || '');
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Approve as Moderator
                      </button>
                      <button
                        onClick={() => {
                          const notes = prompt('Reason for rejection:');
                          if (notes) handleModeratorVerification(moderator.id, 'reject', notes);
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Reject Request
                      </button>
                      <button
                        onClick={() => {
                          setPendingModerators(prev => 
                            prev.map(m => 
                              m.id === moderator.id ? { ...m, status: 'under_review' } : m
                            )
                          );
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        Mark Under Review
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

export default ModeratorVerificationSystem;
