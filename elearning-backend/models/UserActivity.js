const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    // Store only the date part (YYYY-MM-DD)
    set: function(value) {
      const date = new Date(value);
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  },
  activities: {
    quizzes: {
      count: { type: Number, default: 0 },
      attempts: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuizAttempt' },
        score: Number,
        timeSpent: Number,
        timestamp: { type: Date, default: Date.now }
      }]
    },
    courses: {
      count: { type: Number, default: 0 },
      progress: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
        enrollmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
        lessonsCompleted: Number,
        timeSpent: Number,
        timestamp: { type: Date, default: Date.now }
      }]
    },
    assessments: {
      count: { type: Number, default: 0 },
      attempts: [{
        assessmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assessment' },
        attemptId: { type: mongoose.Schema.Types.ObjectId, ref: 'AssessmentAttempt' },
        score: Number,
        timeSpent: Number,
        timestamp: { type: Date, default: Date.now }
      }]
    }
  },
  totalTimeSpent: {
    type: Number,
    default: 0 // in minutes
  },
  hasActivity: {
    type: Boolean,
    default: false
  },
  streakContribution: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userActivitySchema.index({ user: 1, date: 1 }, { unique: true });
userActivitySchema.index({ user: 1, date: -1 });
userActivitySchema.index({ user: 1, hasActivity: 1, date: -1 });

// Method to add quiz activity
userActivitySchema.methods.addQuizActivity = function(quizId, attemptId, score, timeSpent) {
  this.activities.quizzes.count += 1;
  this.activities.quizzes.attempts.push({
    quizId,
    attemptId,
    score,
    timeSpent,
    timestamp: new Date()
  });
  this.totalTimeSpent += timeSpent || 0;
  this.hasActivity = true;
  this.streakContribution = true;
  return this.save();
};

// Method to add course activity
userActivitySchema.methods.addCourseActivity = function(courseId, enrollmentId, lessonsCompleted, timeSpent) {
  this.activities.courses.count += 1;
  this.activities.courses.progress.push({
    courseId,
    enrollmentId,
    lessonsCompleted,
    timeSpent,
    timestamp: new Date()
  });
  this.totalTimeSpent += timeSpent || 0;
  this.hasActivity = true;
  this.streakContribution = true;
  return this.save();
};

// Method to add assessment activity
userActivitySchema.methods.addAssessmentActivity = function(assessmentId, attemptId, score, timeSpent) {
  this.activities.assessments.count += 1;
  this.activities.assessments.attempts.push({
    assessmentId,
    attemptId,
    score,
    timeSpent,
    timestamp: new Date()
  });
  this.totalTimeSpent += timeSpent || 0;
  this.hasActivity = true;
  this.streakContribution = true;
  return this.save();
};

// Static method to get or create activity for a user on a specific date
userActivitySchema.statics.getOrCreateActivity = async function(userId, date = new Date()) {
  const activityDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  let activity = await this.findOne({
    user: userId,
    date: activityDate
  });

  if (!activity) {
    activity = new this({
      user: userId,
      date: activityDate,
      activities: {
        quizzes: { count: 0, attempts: [] },
        courses: { count: 0, progress: [] },
        assessments: { count: 0, attempts: [] }
      }
    });
    await activity.save();
  }

  return activity;
};

// Static method to calculate user streak
userActivitySchema.statics.calculateStreak = async function(userId) {
  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Get all activities for the user, sorted by date descending
  const activities = await this.find({
    user: userId,
    hasActivity: true,
    streakContribution: true
  }).sort({ date: -1 });

  if (activities.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let expectedDate = new Date(todayDate);

  // Check if user has activity today or yesterday (to maintain streak)
  const latestActivity = activities[0];
  const daysDiff = Math.floor((todayDate - latestActivity.date) / (1000 * 60 * 60 * 24));

  if (daysDiff <= 1) {
    // Start counting from the latest activity
    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];
      const activityDate = new Date(activity.date);

      if (i === 0) {
        tempStreak = 1;
        expectedDate = new Date(activityDate);
        expectedDate.setDate(expectedDate.getDate() - 1);
      } else {
        const daysBetween = Math.floor((expectedDate - activityDate) / (1000 * 60 * 60 * 24));

        if (daysBetween === 0) {
          tempStreak++;
          expectedDate.setDate(expectedDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    currentStreak = tempStreak;
  }

  // Calculate longest streak
  tempStreak = 0;
  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];

    if (i === 0) {
      tempStreak = 1;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      const prevActivity = activities[i - 1];
      const daysBetween = Math.floor((prevActivity.date - activity.date) / (1000 * 60 * 60 * 24));

      if (daysBetween === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }
  }

  return { currentStreak, longestStreak };
};

module.exports = mongoose.model('UserActivity', userActivitySchema);
