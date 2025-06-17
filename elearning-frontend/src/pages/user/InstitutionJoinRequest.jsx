import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { USER_ROLES } from '../../constants/roles';
import { NIGERIAN_UNIVERSITIES, INSTITUTION_REQUEST_STATUS } from '../../constants/institutions';

const InstitutionJoinRequest = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    institution: '',
    requestedRole: USER_ROLES.STUDENT,
    department: '',
    studentId: '',
    staffId: '',
    phoneNumber: '',
    additionalInfo: '',
    documents: []
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [existingRequests, setExistingRequests] = useState([]);

  useEffect(() => {
    // Load existing requests for this user
    const mockExistingRequests = [
      {
        id: 1,
        institution: 'university-of-lagos',
        institutionName: 'University of Lagos',
        requestedRole: USER_ROLES.STUDENT,
        department: 'Computer Science',
        status: INSTITUTION_REQUEST_STATUS.PENDING,
        submittedAt: '2024-01-10 14:30:00',
        adminNotes: ''
      }
    ];
    setExistingRequests(mockExistingRequests);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeDocument = (index) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.institution) {
      newErrors.institution = 'Please select an institution';
    }

    if (!formData.department.trim()) {
      newErrors.department = 'Department is required';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }

    if (formData.requestedRole === USER_ROLES.STUDENT) {
      if (!formData.studentId.trim()) {
        newErrors.studentId = 'Student ID is required';
      }
    } else if (formData.requestedRole === USER_ROLES.INSTRUCTOR) {
      if (!formData.staffId.trim()) {
        newErrors.staffId = 'Staff ID is required';
      }
    }

    if (formData.documents.length === 0) {
      newErrors.documents = 'Please upload at least one supporting document';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Check if user already has a pending request for this institution
      const existingRequest = existingRequests.find(
        req => req.institution === formData.institution && 
               req.status === INSTITUTION_REQUEST_STATUS.PENDING
      );

      if (existingRequest) {
        setErrors({ institution: 'You already have a pending request for this institution' });
        setIsSubmitting(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create new request
      const newRequest = {
        id: Date.now(),
        ...formData,
        institutionName: NIGERIAN_UNIVERSITIES.find(uni => uni.value === formData.institution)?.label,
        status: INSTITUTION_REQUEST_STATUS.PENDING,
        submittedAt: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
        userEmail: user.email
      };

      setExistingRequests(prev => [...prev, newRequest]);
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        institution: '',
        requestedRole: USER_ROLES.STUDENT,
        department: '',
        studentId: '',
        staffId: '',
        phoneNumber: '',
        additionalInfo: '',
        documents: []
      });

    } catch (error) {
      console.error('Error submitting request:', error);
      setErrors({ submit: 'Failed to submit request. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

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
      default: return '👤';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Institution</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Request access to your institution's learning platform
        </p>
      </div>

      {/* Success Message */}
      {submitSuccess && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">Request Submitted Successfully!</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Your institution join request has been submitted and is pending admin approval.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Existing Requests */}
      {existingRequests.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Your Institution Requests</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {existingRequests.map((request) => (
                <div key={request.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <span className="text-2xl">{getRoleIcon(request.requestedRole)}</span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{request.institutionName}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {request.requestedRole} - {request.department}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        Submitted: {new Date(request.submittedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    {request.adminNotes && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-xs">
                        {request.adminNotes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Request Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">New Institution Request</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Institution Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Institution *
            </label>
            <select
              name="institution"
              value={formData.institution}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.institution ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            >
              <option value="">Select your institution</option>
              {NIGERIAN_UNIVERSITIES.map((university) => (
                <option key={university.value} value={university.value}>
                  {university.label}
                </option>
              ))}
            </select>
            {errors.institution && (
              <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Requested Role *
            </label>
            <select
              name="requestedRole"
              value={formData.requestedRole}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              required
            >
              <option value={USER_ROLES.STUDENT}>Student</option>
              <option value={USER_ROLES.INSTRUCTOR}>Instructor</option>
            </select>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Department/Faculty *
            </label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              placeholder="e.g., Computer Science, Mathematics, Engineering"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.department ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.department && (
              <p className="mt-1 text-sm text-red-600">{errors.department}</p>
            )}
          </div>

          {/* ID Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.requestedRole === USER_ROLES.STUDENT && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Student ID/Matric Number *
                </label>
                <input
                  type="text"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  placeholder="e.g., CS/2024/001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.studentId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.studentId && (
                  <p className="mt-1 text-sm text-red-600">{errors.studentId}</p>
                )}
              </div>
            )}

            {formData.requestedRole === USER_ROLES.INSTRUCTOR && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Staff ID *
                </label>
                <input
                  type="text"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleInputChange}
                  placeholder="e.g., STAFF/2024/001"
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.staffId ? 'border-red-300' : 'border-gray-300'
                  }`}
                  required
                />
                {errors.staffId && (
                  <p className="mt-1 text-sm text-red-600">{errors.staffId}</p>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="+234-XXX-XXX-XXXX"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.phoneNumber ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Information
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
              rows={3}
              placeholder="Any additional information that might help with your request..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          {/* Document Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Supporting Documents *
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                  <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="mt-4">
                  <label htmlFor="documents" className="cursor-pointer">
                    <span className="mt-2 block text-sm font-medium text-gray-900 dark:text-white">
                      Upload documents
                    </span>
                    <span className="mt-1 block text-sm text-gray-500 dark:text-gray-400">
                      Student ID, Admission Letter, Staff ID, etc.
                    </span>
                  </label>
                  <input
                    id="documents"
                    name="documents"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="sr-only"
                  />
                </div>
              </div>
            </div>
            {formData.documents.length > 0 && (
              <div className="mt-4 space-y-2">
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => removeDocument(index)}
                      className="text-red-600 hover:text-red-800 dark:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.documents && (
              <p className="mt-1 text-sm text-red-600">{errors.documents}</p>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </div>
              ) : (
                'Submit Request'
              )}
            </button>
          </div>

          {errors.submit && (
            <p className="text-sm text-red-600 text-center">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default InstitutionJoinRequest;
