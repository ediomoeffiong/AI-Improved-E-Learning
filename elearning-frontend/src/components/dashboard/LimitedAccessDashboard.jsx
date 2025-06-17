import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { USER_ROLES, ROLE_ICONS } from '../../constants/roles';

const LimitedAccessDashboard = ({ user }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getApprovalMessage = () => {
    const roleLabel = user.role === USER_ROLES.ADMIN ? 'Institution Admin' : 'Institution Moderator';
    const approver = user.role === USER_ROLES.ADMIN ? 'Super Admin' : 'Institution Admin';
    
    switch (user.approvalStatus) {
      case 'pending':
        return {
          title: `${roleLabel} Access Pending`,
          message: `Your request for ${roleLabel} privileges is awaiting approval from an ${approver}.`,
          icon: '⏳',
          color: 'yellow'
        };
      case 'under_review':
        return {
          title: `Application Under Review`,
          message: `Your ${roleLabel} application is currently being reviewed. Additional verification may be required.`,
          icon: '🔍',
          color: 'blue'
        };
      case 'rejected':
        return {
          title: `Application Rejected`,
          message: `Your ${roleLabel} application has been rejected. Please contact support for more information.`,
          icon: '❌',
          color: 'red'
        };
      default:
        return {
          title: `Verification Required`,
          message: `Your account requires verification before accessing ${roleLabel} features.`,
          icon: '🔒',
          color: 'gray'
        };
    }
  };

  const approvalInfo = getApprovalMessage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {ROLE_ICONS[user.role]} Limited Access Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Account verification required for full access
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Approval Status Card */}
        <div className={`rounded-lg border-l-4 p-6 mb-8 ${
          approvalInfo.color === 'yellow' ? 'bg-yellow-50 border-yellow-400 dark:bg-yellow-900/20' :
          approvalInfo.color === 'blue' ? 'bg-blue-50 border-blue-400 dark:bg-blue-900/20' :
          approvalInfo.color === 'red' ? 'bg-red-50 border-red-400 dark:bg-red-900/20' :
          'bg-gray-50 border-gray-400 dark:bg-gray-900/20'
        }`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-3xl">{approvalInfo.icon}</span>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {approvalInfo.title}
              </h3>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {approvalInfo.message}
              </p>
              <div className="mt-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getApprovalStatusColor(user.approvalStatus || 'pending')}`}>
                  Status: {(user.approvalStatus || 'pending').replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Available Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link
            to="/profile"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View and edit your profile</p>
              </div>
            </div>
          </Link>

          <Link
            to="/settings"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Settings</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Manage account settings</p>
              </div>
            </div>
          </Link>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-600 text-left"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">Application Details</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">View your application status</p>
              </div>
            </div>
          </button>
        </div>

        {/* Application Details */}
        {showDetails && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Application Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Requested Role</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {ROLE_ICONS[user.role]} {user.role === USER_ROLES.ADMIN ? 'Institution Admin' : 'Institution Moderator'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Institution</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{user.institutionName || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Application Date</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.applicationDate || new Date().toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Approval Required From</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role === USER_ROLES.ADMIN ? 'Super Admin/Moderator' : 'Institution Admin'}
                </p>
              </div>
            </div>
            {user.adminNotes && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Admin Notes</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 p-3 rounded mt-1">
                  {user.adminNotes}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Need Help?</h3>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <span className="text-xl">📞</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Contact Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  If you have questions about your application status, contact our support team.
                </p>
                <button className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  support@elearning.com
                </button>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">📚</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Documentation</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Learn more about the verification process and requirements.
                </p>
                <button className="mt-2 text-blue-600 dark:text-blue-400 hover:underline text-sm">
                  View Documentation
                </button>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">⏱️</span>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Processing Time</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.role === USER_ROLES.ADMIN 
                    ? 'Admin applications typically take 2-5 business days to review.'
                    : 'Moderator applications typically take 1-3 business days to review.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Restricted Features Notice */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Restricted Features</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            The following features will be available once your application is approved:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.role === USER_ROLES.ADMIN ? (
              <>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">User Management</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Approval System</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Institution Analytics</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Course Management</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">User Monitoring</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Activity Flagging</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Report Generation</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>🚫</span>
                  <span className="text-sm">Investigation Tools</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LimitedAccessDashboard;
