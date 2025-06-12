const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if backend is available
let backendAvailable = true;

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  // If backend is not available, throw error immediately
  if (!backendAvailable) {
    throw new Error('Backend service is not available. Using mock data.');
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // If it's a network error, mark backend as unavailable
    if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      backendAvailable = false;
      console.warn('Backend is not available, switching to mock data mode');
      throw new Error('Backend service is not available. Using mock data.');
    }
    console.error(`API request failed: ${endpoint}`, error);
    throw error;
  }
};

import { mockAPI } from './mockData.js';

// Course API functions
export const courseAPI = {
  // Get all courses with filters
  getCourses: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/courses${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for courses');
        return await mockAPI.getCourses(filters);
      }
      throw error;
    }
  },

  // Get course by ID
  getCourse: async (id) => {
    try {
      return await apiRequest(`/courses/${id}`);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for course details');
        return await mockAPI.getCourse(id);
      }
      throw error;
    }
  },

  // Get course categories
  getCategories: async () => {
    try {
      return await apiRequest('/courses/categories');
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for categories');
        return await mockAPI.getCategories();
      }
      throw error;
    }
  },

  // Get course levels
  getLevels: async () => {
    try {
      return await apiRequest('/courses/levels');
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for levels');
        return await mockAPI.getLevels();
      }
      throw error;
    }
  },

  // Get instructors
  getInstructors: async () => {
    try {
      return await apiRequest('/courses/instructors');
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for instructors');
        return await mockAPI.getInstructors();
      }
      throw error;
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    try {
      return await apiRequest(`/courses/${courseId}/enroll`, {
        method: 'POST',
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for enrollment');
        return await mockAPI.enrollInCourse(courseId);
      }
      throw error;
    }
  },

  // Get enrollment status for a course
  getEnrollmentStatus: async (courseId) => {
    return apiRequest(`/courses/${courseId}/enrollment`);
  },

  // Add a review to a course
  addReview: async (courseId, reviewData) => {
    return apiRequest(`/courses/${courseId}/review`, {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  },

  // Mark lesson as completed
  completeLesson: async (courseId, lessonId, timeSpent = 0) => {
    return apiRequest(`/courses/${courseId}/lesson/${lessonId}/complete`, {
      method: 'PUT',
      body: JSON.stringify({ timeSpent }),
    });
  },
};

// Enrollment API functions
export const enrollmentAPI = {
  // Get user's enrollments
  getEnrollments: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/enrollments${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for enrollments');
        return await mockAPI.getEnrollments(filters);
      }
      throw error;
    }
  },

  // Get enrollment statistics
  getEnrollmentStats: async () => {
    return apiRequest('/enrollments/stats');
  },

  // Get specific enrollment
  getEnrollment: async (courseId) => {
    return apiRequest(`/enrollments/${courseId}`);
  },

  // Update course progress
  updateProgress: async (courseId, progressData) => {
    return apiRequest(`/enrollments/${courseId}/progress`, {
      method: 'PUT',
      body: JSON.stringify(progressData),
    });
  },

  // Issue certificate
  issueCertificate: async (courseId) => {
    return apiRequest(`/enrollments/${courseId}/certificate`, {
      method: 'POST',
    });
  },

  // Unenroll from course
  unenroll: async (courseId) => {
    return apiRequest(`/enrollments/${courseId}`, {
      method: 'DELETE',
    });
  },
};

// Auth API functions
export const authAPI = {
  // Login
  login: async (credentials) => {
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  // Register
  register: async (userData) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Get current user
  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },

  // Refresh token
  refreshToken: async () => {
    return apiRequest('/auth/refresh', {
      method: 'POST',
    });
  },
};

// User API functions
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return apiRequest('/user/profile');
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return apiRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Change password
  changePassword: async (passwordData) => {
    return apiRequest('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  },
};

// Error handling utility
export const handleAPIError = (error) => {
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    localStorage.removeItem('token');
    window.location.href = '/login';
    return 'Session expired. Please log in again.';
  } else if (error.message.includes('403')) {
    return 'You do not have permission to perform this action.';
  } else if (error.message.includes('404')) {
    return 'The requested resource was not found.';
  } else if (error.message.includes('500')) {
    return 'Server error. Please try again later.';
  } else {
    return error.message || 'An unexpected error occurred.';
  }
};

// Local storage utilities
export const storage = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  
  getToken: () => {
    return localStorage.getItem('token');
  },
  
  removeToken: () => {
    localStorage.removeItem('token');
  },
  
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
  },
  
  getUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  removeUser: () => {
    localStorage.removeItem('user');
  },
  
  clear: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default {
  courseAPI,
  enrollmentAPI,
  authAPI,
  userAPI,
  handleAPIError,
  storage,
};
