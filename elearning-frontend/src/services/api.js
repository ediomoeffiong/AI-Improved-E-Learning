const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if backend is available - reset on page load
let backendAvailable = true;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30000; // 30 seconds

// PWA offline support
import { cacheOfflineData, getCachedOfflineData, isOnline } from '../utils/pwa.js';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests with offline support
const apiRequest = async (endpoint, options = {}) => {
  // In development mode, always assume backend is available
  const isDev = import.meta.env.DEV;
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  if (isDev || isLocalhost) {
    // Force backend availability in development/localhost
    backendAvailable = true;
  } else {
    // Check if we should retry backend connection in production
    const now = Date.now();
    if (!backendAvailable && (now - lastBackendCheck) > BACKEND_CHECK_INTERVAL) {
      console.log('Retrying backend connection...');
      backendAvailable = true; // Reset and try again
      lastBackendCheck = now;
    }

    // If backend is not available and we recently checked, use fallback
    if (!backendAvailable) {
      throw new Error('Backend service is not available. Using mock data.');
    }
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

    const data = await response.json();

    // Cache successful GET requests for offline use
    if (options.method === 'GET' || !options.method) {
      await cacheOfflineData(data, `api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`);
    }

    return data;
  } catch (error) {
    // In development/localhost, don't mark backend as unavailable for network errors
    const isDev = import.meta.env.DEV;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    // If it's a network error, handle differently based on environment
    if (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {

      if (isDev || isLocalhost) {
        // In development, just throw the original error without marking backend unavailable
        console.error(`API request failed in development: ${endpoint}`, error);
        throw error;
      } else {
        // In production, mark backend as unavailable temporarily
        backendAvailable = false;
        lastBackendCheck = Date.now();
        console.warn('Backend is temporarily unavailable, will retry in 30 seconds');

        // Try to get cached data for GET requests
        if (options.method === 'GET' || !options.method) {
          const cachedData = getCachedOfflineData(`api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`);
          if (cachedData) {
            console.log('Using cached data for:', endpoint);
            return cachedData;
          }
        }

        throw new Error('Backend service is not available. Using mock data.');
      }
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
    try {
      return await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for login');
        return await mockAPI.login(credentials);
      }
      throw error;
    }
  },

  // Register
  register: async (userData) => {
    try {
      return await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for registration');
        return await mockAPI.register(userData);
      }
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      return await apiRequest('/auth/me');
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for current user');
        return await mockAPI.getCurrentUser();
      }
      throw error;
    }
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

// Cache refresh utilities
export const cacheAPI = {
  // Refresh critical data when coming back online
  refreshCriticalData: async () => {
    try {
      console.log('Refreshing critical API data...');

      // Clear old cached data
      const keys = Object.keys(localStorage);
      const apiKeys = keys.filter(key => key.startsWith('offline_api_'));
      const oneHourAgo = Date.now() - (60 * 60 * 1000);

      apiKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const { timestamp } = JSON.parse(cached);
            if (timestamp < oneHourAgo) {
              localStorage.removeItem(key);
            }
          }
        } catch (error) {
          localStorage.removeItem(key);
        }
      });

      // Force refresh of critical endpoints
      const criticalEndpoints = [
        () => courseAPI.getCourses(),
        () => courseAPI.getCategories(),
        () => authAPI.getCurrentUser().catch(() => null), // Don't fail if not authenticated
      ];

      // Execute all critical refreshes
      await Promise.allSettled(criticalEndpoints.map(fn => fn()));

      console.log('Critical API data refreshed');
      return true;
    } catch (error) {
      console.error('Error refreshing critical data:', error);
      return false;
    }
  },

  // Clear all API cache
  clearAPICache: () => {
    try {
      const keys = Object.keys(localStorage);
      const apiKeys = keys.filter(key => key.startsWith('offline_api_'));

      apiKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      console.log(`Cleared ${apiKeys.length} API cache entries`);
      return true;
    } catch (error) {
      console.error('Error clearing API cache:', error);
      return false;
    }
  }
};

export default {
  courseAPI,
  enrollmentAPI,
  authAPI,
  userAPI,
  handleAPIError,
  storage,
  cacheAPI,
};
