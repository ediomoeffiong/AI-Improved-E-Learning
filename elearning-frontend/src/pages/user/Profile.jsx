import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import PhoneNumberInput from '../../components/PhoneNumberInput';
import { formatPhoneNumber } from '../../constants/countryCodes';
import { enrollmentAPI, userAPI } from '../../services/api';

function Profile() {
  const { user, getUserName, getUserEmail, getUserRole } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedCourses: 0,
    totalTimeSpent: 0
  });
  const [formData, setFormData] = useState({
    name: getUserName() || '',
    email: getUserEmail() || '',
    bio: '',
    phone: '',
    location: '',
    website: ''
  });

  // Fetch user statistics on component mount
  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch enrollment statistics
        const enrollmentStats = await enrollmentAPI.getEnrollmentStats();

        if (enrollmentStats) {
          setStats({
            totalCourses: enrollmentStats.totalCourses || 0,
            completedCourses: enrollmentStats.completedCourses || 0,
            totalTimeSpent: enrollmentStats.totalTimeSpent || 0
          });
        }
      } catch (err) {
        console.error('Error fetching user statistics:', err);
        setError('Unable to load statistics. Showing default values.');
        // Keep default values in case of error
        setStats({
          totalCourses: 0,
          completedCourses: 0,
          totalTimeSpent: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    // TODO: Implement profile update API call
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      name: getUserName() || '',
      email: getUserEmail() || '',
      bio: '',
      phone: '',
      location: '',
      website: ''
    });
    setIsEditing(false);
  };

  // Helper function to format time spent in hours
  const formatTimeSpent = (minutes) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your personal information and preferences
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            
            {/* User Info */}
            <div className="text-white">
              <h2 className="text-2xl font-bold">{getUserName() || 'User'}</h2>
              <p className="text-blue-100">{getUserEmail()}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                {getUserRole() || 'Student'}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Personal Information</h3>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">{formData.name || 'Not provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <p className="text-gray-900 dark:text-white py-2">{formData.email}</p>
              <p className="text-xs text-gray-500">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <PhoneNumberInput
                  value={formData.phone}
                  onChange={(value) => setFormData(prev => ({ ...prev, phone: value }))}
                  placeholder="Enter your phone number"
                  label=""
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {formData.phone ? formatPhoneNumber(formData.phone) : 'Not provided'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">{formData.location || 'Not provided'}</p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">{formData.bio || 'No bio provided'}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Website
              </label>
              {isEditing ? (
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="https://example.com"
                />
              ) : (
                <p className="text-gray-900 dark:text-white py-2">
                  {formData.website ? (
                    <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {formData.website}
                    </a>
                  ) : (
                    'Not provided'
                  )}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Enrolled</p>
              {loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-12 rounded"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCourses}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Completed</p>
              {loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-12 rounded"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.completedCourses}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Learning Hours</p>
              {loading ? (
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-8 w-16 rounded"></div>
              ) : (
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {stats.totalTimeSpent > 0 ? formatTimeSpent(stats.totalTimeSpent) : '0h'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Profile;
