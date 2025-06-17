import React, { useState, useEffect } from 'react';
import { NIGERIAN_UNIVERSITIES } from '../../constants/institutions';

const UniversityVerificationSystem = () => {
  const [pendingUniversities, setPendingUniversities] = useState([]);
  const [verifiedUniversities, setVerifiedUniversities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [newUniversityForm, setNewUniversityForm] = useState({
    name: '',
    location: '',
    state: '',
    type: 'public',
    website: '',
    contactEmail: '',
    requestedBy: '',
    documents: []
  });

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

    // Mock verified universities (subset of existing list)
    const mockVerifiedUniversities = NIGERIAN_UNIVERSITIES.slice(0, 10).map((uni, index) => ({
      id: index + 100,
      ...uni,
      verifiedAt: '2024-01-01 00:00:00',
      verifiedBy: 'System Admin',
      status: 'verified',
      adminCount: Math.floor(Math.random() * 3), // 0-2 admins
      userCount: Math.floor(Math.random() * 1000) + 100,
      verificationLevel: index % 2 === 0 ? 'enhanced' : 'basic'
    }));

    setPendingUniversities(mockPendingUniversities);
    setVerifiedUniversities(mockVerifiedUniversities);
    setLoading(false);
  }, []);

  const handleVerification = async (universityId, action, notes = '') => {
    try {
      const university = pendingUniversities.find(u => u.id === universityId);
      
      if (action === 'approve') {
        // Move to verified list
        const verifiedUniversity = {
          ...university,
          status: 'verified',
          verifiedAt: new Date().toISOString(),
          verifiedBy: 'App Admin',
          adminNotes: notes,
          adminCount: 0,
          userCount: 0
        };
        
        setVerifiedUniversities(prev => [...prev, verifiedUniversity]);
        setPendingUniversities(prev => prev.filter(u => u.id !== universityId));
        
        alert(`✅ ${university.name} has been verified and added to the platform`);
      } else {
        // Reject university
        setPendingUniversities(prev => 
          prev.map(u => 
            u.id === universityId 
              ? { ...u, status: 'rejected', adminNotes: notes }
              : u
          )
        );
        
        alert(`❌ ${university.name} verification has been rejected`);
      }
    } catch (error) {
      console.error('Error processing verification:', error);
      alert('Error processing verification. Please try again.');
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">University Verification System</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review and verify new university requests for platform inclusion
          </p>
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
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Verification</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{pendingUniversities.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Verified Universities</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{verifiedUniversities.length}</p>
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
                {verifiedUniversities.reduce((sum, uni) => sum + uni.userCount, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-xl">👑</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Admins</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {verifiedUniversities.reduce((sum, uni) => sum + uni.adminCount, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Pending Verification ({pendingUniversities.length})
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'verified'
                ? 'border-red-500 text-red-600 dark:text-red-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400'
            }`}
          >
            Verified Universities ({verifiedUniversities.length})
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {pendingUniversities.length === 0 ? (
            <div className="text-center py-8">
              <span className="text-4xl mb-4 block">📭</span>
              <p className="text-gray-500 dark:text-gray-400">No pending university verification requests</p>
            </div>
          ) : (
            pendingUniversities.map((university) => (
              <div key={university.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-2xl">{getTypeIcon(university.type)}</span>
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">{university.name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{university.location}, {university.state}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(university.status)}`}>
                          {university.status.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded-full text-xs font-medium">
                          {university.type.toUpperCase()}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 rounded-full text-xs font-medium">
                          {university.verificationLevel.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Submitted</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{university.submittedAt}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Website</p>
                    <a href={university.website} target="_blank" rel="noopener noreferrer" 
                       className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                      {university.website}
                    </a>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{university.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested By</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {university.requestedBy} ({university.requestedByRole})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requester Email</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{university.requestedByEmail}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Documents</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {university.documents.map((doc, index) => (
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

                {university.adminNotes && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Admin Notes</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded">
                      {university.adminNotes}
                    </p>
                  </div>
                )}

                {university.status === 'pending' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        const notes = prompt('Add verification notes (optional):');
                        handleVerification(university.id, 'approve', notes || '');
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Verify & Approve
                    </button>
                    <button
                      onClick={() => {
                        const notes = prompt('Reason for rejection:');
                        if (notes) handleVerification(university.id, 'reject', notes);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Request More Info
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'verified' && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Verified Universities ({verifiedUniversities.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {verifiedUniversities.map((university) => (
                <div key={university.id} className="border border-gray-200 dark:border-gray-600 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <span className="text-2xl">{getTypeIcon(university.type || 'public')}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white text-sm">{university.label}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{university.location}, {university.state}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Users:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{university.userCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Admins:</span>
                      <span className="font-medium text-gray-900 dark:text-white">{university.adminCount}/2</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Verification:</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        university.verificationLevel === 'enhanced' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                      }`}>
                        {university.verificationLevel}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversityVerificationSystem;
