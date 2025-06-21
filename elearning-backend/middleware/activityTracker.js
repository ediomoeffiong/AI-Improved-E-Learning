const UserActivity = require('../models/UserActivity');

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Middleware to track quiz activity
const trackQuizActivity = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // Call original res.json first
    originalJson.call(this, data);
    
    // Track activity if MongoDB is connected and quiz was completed successfully
    if (isMongoConnected() && req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Check if this is a quiz submission response
      if (req.method === 'POST' && req.route && req.route.path.includes('submit')) {
        if (data && data.attempt && data.attempt.status === 'completed') {
          trackQuizCompletion(userId, req.params.id, data.attempt)
            .catch(error => console.error('Error tracking quiz activity:', error));
        }
      }
    }
  };
  
  next();
};

// Middleware to track course activity
const trackCourseActivity = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // Call original res.json first
    originalJson.call(this, data);
    
    // Track activity if MongoDB is connected and lesson was completed
    if (isMongoConnected() && req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Check if this is a lesson completion or progress update
      if (req.method === 'PUT' && req.route && req.route.path.includes('progress')) {
        if (data && data.message && data.message.includes('updated')) {
          trackCourseProgress(userId, req.params.courseId, req.body)
            .catch(error => console.error('Error tracking course activity:', error));
        }
      }
    }
  };
  
  next();
};

// Middleware to track assessment activity
const trackAssessmentActivity = async (req, res, next) => {
  // Store original res.json to intercept response
  const originalJson = res.json;
  
  res.json = function(data) {
    // Call original res.json first
    originalJson.call(this, data);
    
    // Track activity if MongoDB is connected and assessment was completed
    if (isMongoConnected() && req.user && req.user.userId) {
      const userId = req.user.userId;
      
      // Check if this is an assessment submission response
      if (req.method === 'POST' && req.route && req.route.path.includes('submit')) {
        if (data && data.attempt && data.attempt.status === 'completed') {
          trackAssessmentCompletion(userId, req.params.id, data.attempt)
            .catch(error => console.error('Error tracking assessment activity:', error));
        }
      }
    }
  };
  
  next();
};

// Helper function to track quiz completion
async function trackQuizCompletion(userId, quizId, attemptData) {
  try {
    const activity = await UserActivity.getOrCreateActivity(userId);
    await activity.addQuizActivity(
      quizId,
      attemptData._id || attemptData.id,
      attemptData.percentage || attemptData.score,
      attemptData.timeSpent || 0
    );
    console.log(`Quiz activity tracked for user ${userId}`);
  } catch (error) {
    console.error('Error in trackQuizCompletion:', error);
  }
}

// Helper function to track course progress
async function trackCourseProgress(userId, courseId, progressData) {
  try {
    const activity = await UserActivity.getOrCreateActivity(userId);
    await activity.addCourseActivity(
      courseId,
      progressData.enrollmentId,
      progressData.completedLessons || 1,
      progressData.timeSpent || 0
    );
    console.log(`Course activity tracked for user ${userId}`);
  } catch (error) {
    console.error('Error in trackCourseProgress:', error);
  }
}

// Helper function to track assessment completion
async function trackAssessmentCompletion(userId, assessmentId, attemptData) {
  try {
    const activity = await UserActivity.getOrCreateActivity(userId);
    await activity.addAssessmentActivity(
      assessmentId,
      attemptData._id || attemptData.id,
      attemptData.percentage || attemptData.score,
      attemptData.timeSpent || 0
    );
    console.log(`Assessment activity tracked for user ${userId}`);
  } catch (error) {
    console.error('Error in trackAssessmentCompletion:', error);
  }
}

// Manual activity tracking functions (for direct use in routes)
const manualTrackQuiz = async (userId, quizId, attemptData) => {
  if (isMongoConnected()) {
    return trackQuizCompletion(userId, quizId, attemptData);
  }
};

const manualTrackCourse = async (userId, courseId, progressData) => {
  if (isMongoConnected()) {
    return trackCourseProgress(userId, courseId, progressData);
  }
};

const manualTrackAssessment = async (userId, assessmentId, attemptData) => {
  if (isMongoConnected()) {
    return trackAssessmentCompletion(userId, assessmentId, attemptData);
  }
};

module.exports = {
  trackQuizActivity,
  trackCourseActivity,
  trackAssessmentActivity,
  manualTrackQuiz,
  manualTrackCourse,
  manualTrackAssessment
};
