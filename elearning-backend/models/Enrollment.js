const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  weekNumber: {
    type: Number,
    required: true
  },
  lessonId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  timeSpent: {
    type: Number, // in minutes
    default: 0
  }
});

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['enrolled', 'in-progress', 'completed', 'dropped'],
    default: 'enrolled'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  completedLessons: {
    type: Number,
    default: 0
  },
  totalLessons: {
    type: Number,
    default: 0
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', ''],
    default: ''
  },
  certificateIssued: {
    type: Boolean,
    default: false
  },
  certificateIssuedAt: Date,
  lessonProgress: [progressSchema],
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  quizScores: [{
    quizId: mongoose.Schema.Types.ObjectId,
    score: Number,
    maxScore: Number,
    attemptedAt: Date
  }],
  assignments: [{
    assignmentId: mongoose.Schema.Types.ObjectId,
    submitted: Boolean,
    submittedAt: Date,
    grade: Number,
    feedback: String
  }]
}, {
  timestamps: true
});

// Compound index to ensure one enrollment per user per course
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

// Index for querying user enrollments
enrollmentSchema.index({ user: 1, status: 1 });

// Index for querying course enrollments
enrollmentSchema.index({ course: 1, status: 1 });

// Virtual for calculating completion percentage
enrollmentSchema.virtual('completionPercentage').get(function() {
  if (this.totalLessons === 0) return 0;
  return Math.round((this.completedLessons / this.totalLessons) * 100);
});

// Method to update progress
enrollmentSchema.methods.updateProgress = function() {
  const completedCount = this.lessonProgress.filter(p => p.isCompleted).length;
  this.completedLessons = completedCount;
  
  if (this.totalLessons > 0) {
    this.progress = Math.round((completedCount / this.totalLessons) * 100);
  }
  
  // Update status based on progress
  if (this.progress === 0) {
    this.status = 'enrolled';
  } else if (this.progress === 100) {
    this.status = 'completed';
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  } else {
    this.status = 'in-progress';
  }
  
  this.lastAccessed = new Date();
  return this.save();
};

// Method to mark lesson as completed
enrollmentSchema.methods.completeLesson = function(lessonId, timeSpent = 0) {
  const lessonProgress = this.lessonProgress.find(p => 
    p.lessonId.toString() === lessonId.toString()
  );
  
  if (lessonProgress && !lessonProgress.isCompleted) {
    lessonProgress.isCompleted = true;
    lessonProgress.completedAt = new Date();
    lessonProgress.timeSpent = timeSpent;
    this.totalTimeSpent += timeSpent;
    
    return this.updateProgress();
  }
  
  return Promise.resolve(this);
};

// Method to calculate grade based on quiz scores and assignments
enrollmentSchema.methods.calculateGrade = function() {
  if (this.quizScores.length === 0 && this.assignments.length === 0) {
    return '';
  }
  
  let totalScore = 0;
  let maxScore = 0;
  
  // Calculate quiz scores (50% weight)
  if (this.quizScores.length > 0) {
    const quizTotal = this.quizScores.reduce((sum, quiz) => sum + quiz.score, 0);
    const quizMax = this.quizScores.reduce((sum, quiz) => sum + quiz.maxScore, 0);
    totalScore += (quizTotal / quizMax) * 50;
    maxScore += 50;
  }
  
  // Calculate assignment scores (50% weight)
  if (this.assignments.length > 0) {
    const assignmentTotal = this.assignments.reduce((sum, assignment) => sum + (assignment.grade || 0), 0);
    const assignmentCount = this.assignments.length;
    totalScore += (assignmentTotal / (assignmentCount * 100)) * 50;
    maxScore += 50;
  }
  
  const percentage = (totalScore / maxScore) * 100;
  
  if (percentage >= 97) return 'A+';
  if (percentage >= 93) return 'A';
  if (percentage >= 90) return 'A-';
  if (percentage >= 87) return 'B+';
  if (percentage >= 83) return 'B';
  if (percentage >= 80) return 'B-';
  if (percentage >= 77) return 'C+';
  if (percentage >= 73) return 'C';
  if (percentage >= 70) return 'C-';
  if (percentage >= 67) return 'D+';
  if (percentage >= 65) return 'D';
  return 'F';
};

// Static method to get user's enrollments
enrollmentSchema.statics.getUserEnrollments = function(userId, status = null) {
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  return this.find(query).populate('course');
};

// Static method to get course enrollments
enrollmentSchema.statics.getCourseEnrollments = function(courseId) {
  return this.find({ course: courseId }).populate('user');
};

// Static method to check if user is enrolled in course
enrollmentSchema.statics.isUserEnrolled = function(userId, courseId) {
  return this.findOne({ user: userId, course: courseId });
};

// Pre-save middleware to update grade
enrollmentSchema.pre('save', function(next) {
  if (this.isModified('quizScores') || this.isModified('assignments')) {
    this.grade = this.calculateGrade();
  }
  next();
});

module.exports = mongoose.model('Enrollment', enrollmentSchema);
