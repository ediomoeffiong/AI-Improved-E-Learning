const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Import offline detection utility
import { isOnline } from '../utils/pwa.js';

// Check if backend is available - reset on page load
let backendAvailable = true;
let lastBackendCheck = 0;
const BACKEND_CHECK_INTERVAL = 30000; // 30 seconds

// Demo mode management system
let isDemoModeForced = false;
let backendErrorNotificationShown = false;

// Check if user has manually enabled demo mode
const isDemoModeEnabled = () => {
  return localStorage.getItem('demoModeEnabled') === 'true' || isDemoModeForced;
};

// Enable demo mode
const enableDemoMode = () => {
  localStorage.setItem('demoModeEnabled', 'true');
  isDemoModeForced = true;
  window.dispatchEvent(new CustomEvent('demoModeChanged', { detail: { enabled: true } }));
};

// Disable demo mode
const disableDemoMode = () => {
  localStorage.removeItem('demoModeEnabled');
  isDemoModeForced = false;
  window.dispatchEvent(new CustomEvent('demoModeChanged', { detail: { enabled: false } }));
};

// Reset backend error notification flag (called when user comes back online)
const resetBackendErrorNotification = () => {
  backendErrorNotificationShown = false;
};

// Show backend error notification with demo mode option
const showBackendErrorNotification = async (error) => {
  if (backendErrorNotificationShown || isDemoModeEnabled()) return;

  // Check if user is simply offline - don't show demo mode popup for offline state
  try {
    const userIsOnline = await isOnline();
    if (!userIsOnline) {
      console.log('User is offline - not showing demo mode popup');
      return;
    }
  } catch (e) {
    // If we can't check online status, assume offline and don't show popup
    console.log('Cannot determine online status - not showing demo mode popup');
    return;
  }

  backendErrorNotificationShown = true;

  window.dispatchEvent(new CustomEvent('backendError', {
    detail: {
      error: error.message,
      canUseDemoMode: true
    }
  }));
};

// Export demo mode functions globally
window.enableDemoMode = enableDemoMode;
window.disableDemoMode = disableDemoMode;
window.isDemoModeEnabled = isDemoModeEnabled;

// Listen for online events to reset error notification flag
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('User came back online - resetting backend error notification flag');
    resetBackendErrorNotification();
  });
}

// PWA offline support
import { cacheOfflineData, getCachedOfflineData } from '../utils/pwa.js';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests with offline support
const apiRequest = async (endpoint, options = {}) => {
  // If demo mode is manually enabled, skip API call
  if (isDemoModeEnabled()) {
    throw new Error('Demo mode is enabled. Using mock data.');
  }

  // Check if we should retry backend connection
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
    // Handle different types of errors
    const isNetworkError = error.message.includes('fetch') ||
                          error.message.includes('NetworkError') ||
                          error.message.includes('Failed to fetch') ||
                          error.message.includes('ERR_CONNECTION_REFUSED') ||
                          error.name === 'TypeError';

    if (isNetworkError) {
      // Mark backend as unavailable
      backendAvailable = false;
      lastBackendCheck = Date.now();
      console.warn('Backend connection failed:', error.message);

      // Try to get cached data for GET requests
      if (options.method === 'GET' || !options.method) {
        const cachedData = getCachedOfflineData(`api_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`);
        if (cachedData) {
          console.log('Using cached data for:', endpoint);
          return cachedData;
        }
      }

      // Show backend error notification (only if not offline)
      showBackendErrorNotification(error).catch(console.error);
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
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        // Only use mock data if demo mode is explicitly enabled
        if (isDemoModeEnabled()) {
          console.log('Using mock data for courses (demo mode enabled)');
          return await mockAPI.getCourses(filters);
        } else {
          console.log('Backend unavailable, not auto-entering demo mode');
          throw error; // Re-throw to show error to user
        }
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

// Discussion API functions
export const discussionAPI = {
  // Get all discussions with filters
  getDiscussions: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/discussions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for discussions');
        return await mockAPI.getDiscussions(filters);
      }
      throw error;
    }
  },

  // Get a specific discussion thread
  getThread: async (threadId) => {
    try {
      return await apiRequest(`/discussions/${threadId}`);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for thread');
        return await mockAPI.getThread(threadId);
      }
      throw error;
    }
  },

  // Create a new discussion thread
  createThread: async (threadData) => {
    try {
      return await apiRequest('/discussions', {
        method: 'POST',
        body: JSON.stringify(threadData),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for creating thread');
        return await mockAPI.createThread(threadData);
      }
      throw error;
    }
  },

  // Add a reply to a thread
  addReply: async (threadId, replyData) => {
    try {
      return await apiRequest(`/discussions/${threadId}/replies`, {
        method: 'POST',
        body: JSON.stringify(replyData),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for adding reply');
        return await mockAPI.addReply(threadId, replyData);
      }
      throw error;
    }
  },

  // Like/unlike a thread or reply
  toggleLike: async (threadId, replyId = null) => {
    try {
      const endpoint = replyId
        ? `/discussions/${threadId}/replies/${replyId}/like`
        : `/discussions/${threadId}/like`;
      return await apiRequest(endpoint, {
        method: 'POST',
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for toggling like');
        return await mockAPI.toggleLike(threadId, replyId);
      }
      throw error;
    }
  },

  // Mark thread as solved
  markAsSolved: async (threadId, replyId = null) => {
    try {
      return await apiRequest(`/discussions/${threadId}/solve`, {
        method: 'POST',
        body: JSON.stringify({ replyId }),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for marking as solved');
        return await mockAPI.markAsSolved(threadId, replyId);
      }
      throw error;
    }
  },

  // Get discussion statistics
  getStats: async () => {
    try {
      return await apiRequest('/discussions/stats');
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for discussion stats');
        return await mockAPI.getDiscussionStats();
      }
      throw error;
    }
  }
};

// Materials API functions
export const materialsAPI = {
  // Get course materials
  getMaterials: async (courseId, filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/courses/${courseId}/materials${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for materials');
        return await mockAPI.getMaterials(courseId, filters);
      }
      throw error;
    }
  },

  // Get video details
  getVideo: async (courseId, videoId) => {
    try {
      return await apiRequest(`/courses/${courseId}/videos/${videoId}`);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for video');
        return await mockAPI.getVideo(courseId, videoId);
      }
      throw error;
    }
  },

  // Update video progress
  updateVideoProgress: async (courseId, videoId, progress) => {
    try {
      return await apiRequest(`/courses/${courseId}/videos/${videoId}/progress`, {
        method: 'PUT',
        body: JSON.stringify({ progress }),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for video progress update');
        return await mockAPI.updateVideoProgress(courseId, videoId, progress);
      }
      throw error;
    }
  },

  // Download material
  downloadMaterial: async (courseId, materialId, materialType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/materials/${materialId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      return response.blob();
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for download');
        return await mockAPI.downloadMaterial(courseId, materialId, materialType);
      }
      throw error;
    }
  },

  // Upload material
  uploadMaterial: async (courseId, formData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${courseId}/materials/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for upload');
        return await mockAPI.uploadMaterial(courseId, formData);
      }
      throw error;
    }
  },

  // Add bookmark
  addBookmark: async (courseId, materialId, materialType) => {
    try {
      return await apiRequest(`/courses/${courseId}/bookmarks`, {
        method: 'POST',
        body: JSON.stringify({ materialId, materialType }),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for bookmark');
        return await mockAPI.addBookmark(courseId, materialId, materialType);
      }
      throw error;
    }
  },

  // Remove bookmark
  removeBookmark: async (courseId, materialId, materialType) => {
    try {
      return await apiRequest(`/courses/${courseId}/bookmarks/${materialId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for bookmark removal');
        return await mockAPI.removeBookmark(courseId, materialId, materialType);
      }
      throw error;
    }
  },

  // Save notes
  saveNotes: async (courseId, materialId, materialType, notes) => {
    try {
      return await apiRequest(`/courses/${courseId}/materials/${materialId}/notes`, {
        method: 'PUT',
        body: JSON.stringify({ notes, materialType }),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for notes');
        return await mockAPI.saveNotes(courseId, materialId, materialType, notes);
      }
      throw error;
    }
  },

  // Get learning analytics
  getAnalytics: async (courseId) => {
    try {
      return await apiRequest(`/courses/${courseId}/analytics`);
    } catch (error) {
      if (error.message.includes('Backend service is not available')) {
        console.log('Using mock data for analytics');
        return await mockAPI.getAnalytics(courseId);
      }
      throw error;
    }
  }
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
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        // Only use mock data if demo mode is explicitly enabled
        if (isDemoModeEnabled()) {
          console.log('Using mock data for login (demo mode enabled)');
          return await mockAPI.login(credentials);
        } else {
          console.log('Backend unavailable, not auto-entering demo mode');
          throw error; // Re-throw to show error to user
        }
      }
      throw error;
    }
  },

  // App Admin Login
  appAdminLogin: async (credentials) => {
    try {
      return await apiRequest('/auth/app-admin-login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });
    } catch (error) {
      // Handle 404 (endpoint not implemented) or other backend issues
      if (error.message.includes('404') ||
          error.message.includes('Backend service is not available') ||
          error.message.includes('Demo mode is enabled')) {
        console.log('App admin endpoint not available, using mock data');
        return await mockAPI.appAdminLogin(credentials);
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
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        // Only use mock data if demo mode is explicitly enabled
        if (isDemoModeEnabled()) {
          console.log('Using mock data for registration (demo mode enabled)');
          return await mockAPI.register(userData);
        } else {
          console.log('Backend unavailable, not auto-entering demo mode');
          throw error; // Re-throw to show error to user
        }
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

  // Update username
  updateUsername: async (username) => {
    try {
      const response = await apiRequest('/user/username', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ username })
      });
      return response;
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for username update');
        // Mock successful response for demo mode
        return {
          message: 'Username updated successfully (demo mode)',
          user: {
            id: 'demo-user',
            name: 'Demo User',
            username: username.toLowerCase(),
            email: 'demo@example.com',
            role: 'Student'
          }
        };
      }
      throw error;
    }
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

  // Update phone number
  updatePhoneNumber: async (phoneNumber) => {
    try {
      const response = await apiRequest('/user/phone', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ phoneNumber })
      });
      return response;
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for phone number update');
        // Mock successful response for demo mode
        return {
          message: 'Phone number updated successfully (demo mode)',
          user: {
            id: 'demo-user',
            name: 'Demo User',
            username: 'demo',
            email: 'demo@example.com',
            phoneNumber: phoneNumber,
            role: 'Student'
          }
        };
      }
      throw error;
    }
  },
};

// Quiz API functions
export const quizAPI = {
  // Get all available quizzes with filters
  getQuizzes: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();

      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/quizzes${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        if (isDemoModeEnabled()) {
          console.log('Using mock data for quizzes (demo mode enabled)');
          return await mockAPI.getQuizzes(filters);
        } else {
          console.log('Backend unavailable, not auto-entering demo mode');
          throw error;
        }
      }
      throw error;
    }
  },

  // Get quiz by ID (for taking the quiz)
  getQuiz: async (id) => {
    try {
      return await apiRequest(`/quizzes/${id}`);
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for quiz details');
        return await mockAPI.getQuiz(id);
      }
      throw error;
    }
  },

  // Start a new quiz attempt
  startQuiz: async (id) => {
    try {
      return await apiRequest(`/quizzes/${id}/start`, {
        method: 'POST',
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for starting quiz');
        return await mockAPI.startQuiz(id);
      }
      throw error;
    }
  },

  // Submit quiz answers
  submitQuiz: async (id, submissionData) => {
    try {
      return await apiRequest(`/quizzes/${id}/submit`, {
        method: 'POST',
        body: JSON.stringify(submissionData),
      });
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for quiz submission');
        return await mockAPI.submitQuiz(id, submissionData);
      }
      throw error;
    }
  },

  // Get quiz results
  getQuizResults: async (id, attemptId) => {
    try {
      return await apiRequest(`/quizzes/${id}/results/${attemptId}`);
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for quiz results');
        return await mockAPI.getQuizResults(id, attemptId);
      }
      throw error;
    }
  },

  // Get user's quiz attempts
  getUserAttempts: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      });

      const endpoint = `/quizzes/attempts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      return await apiRequest(endpoint);
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for user attempts');
        return await mockAPI.getUserAttempts(filters);
      }
      throw error;
    }
  },

  // Get quiz dashboard data
  getDashboardData: async () => {
    try {
      return await apiRequest('/quizzes/dashboard');
    } catch (error) {
      if (error.message.includes('Backend service is not available') || error.message.includes('Demo mode is enabled')) {
        console.log('Using mock data for quiz dashboard');
        return await mockAPI.getQuizDashboard();
      }
      throw error;
    }
  }
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
  quizAPI,
  authAPI,
  userAPI,
  handleAPIError,
  storage,
  cacheAPI,
};
