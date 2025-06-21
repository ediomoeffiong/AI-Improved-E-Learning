const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: String, // For multiple choice
  selectedAnswer: String, // For fill-in-blank
  essayAnswer: String, // For essay questions
  isCorrect: Boolean,
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  // For manual grading
  manualGrade: Number,
  graderComments: String,
  needsManualGrading: {
    type: Boolean,
    default: false
  }
});

const assessmentAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assessment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Assessment',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  submittedAt: Date,
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned', 'time-expired', 'under-review'],
    default: 'in-progress'
  },
  answers: [answerSchema],
  score: {
    type: Number,
    default: 0
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  percentage: {
    type: Number,
    default: 0
  },
  passed: {
    type: Boolean,
    default: false
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  feedback: String,
  grade: {
    type: String,
    enum: ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F', ''],
    default: ''
  },
  // Assessment-specific fields
  institution: {
    type: String,
    required: true
  },
  proctorNotes: String,
  flaggedForReview: {
    type: Boolean,
    default: false
  },
  reviewReason: String,
  // Grading status
  gradingStatus: {
    type: String,
    enum: ['auto-graded', 'pending-manual', 'manually-graded', 'reviewed'],
    default: 'auto-graded'
  },
  gradedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  gradedAt: Date,
  // Security and integrity
  browserInfo: String,
  ipAddress: String,
  suspiciousActivity: [{
    type: String,
    timestamp: Date,
    description: String
  }]
}, {
  timestamps: true
});

// Calculate score and percentage before saving
assessmentAttemptSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.answers.length > 0) {
    // Calculate auto-graded score
    const autoGradedAnswers = this.answers.filter(answer => !answer.needsManualGrading);
    const autoScore = autoGradedAnswers.reduce((total, answer) => total + answer.pointsEarned, 0);
    
    // Add manual grades
    const manualGradedAnswers = this.answers.filter(answer => answer.needsManualGrading && answer.manualGrade !== undefined);
    const manualScore = manualGradedAnswers.reduce((total, answer) => total + (answer.manualGrade || 0), 0);
    
    this.score = autoScore + manualScore;
    this.correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
    this.totalQuestions = this.answers.length;
    
    if (this.totalPoints > 0) {
      this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    
    // Determine if passed
    this.passed = this.percentage >= 70; // Default passing score
    
    // Assign grade
    if (this.percentage >= 97) this.grade = 'A+';
    else if (this.percentage >= 93) this.grade = 'A';
    else if (this.percentage >= 90) this.grade = 'A-';
    else if (this.percentage >= 87) this.grade = 'B+';
    else if (this.percentage >= 83) this.grade = 'B';
    else if (this.percentage >= 80) this.grade = 'B-';
    else if (this.percentage >= 77) this.grade = 'C+';
    else if (this.percentage >= 73) this.grade = 'C';
    else if (this.percentage >= 70) this.grade = 'C-';
    else if (this.percentage >= 67) this.grade = 'D+';
    else if (this.percentage >= 60) this.grade = 'D';
    else this.grade = 'F';
    
    // Update grading status
    const hasManualGrading = this.answers.some(answer => answer.needsManualGrading);
    if (hasManualGrading) {
      const allManuallyGraded = this.answers.filter(answer => answer.needsManualGrading)
        .every(answer => answer.manualGrade !== undefined);
      this.gradingStatus = allManuallyGraded ? 'manually-graded' : 'pending-manual';
    } else {
      this.gradingStatus = 'auto-graded';
    }
  }
  next();
});

// Index for efficient queries
assessmentAttemptSchema.index({ user: 1, assessment: 1 });
assessmentAttemptSchema.index({ institution: 1, status: 1 });
assessmentAttemptSchema.index({ gradingStatus: 1 });

module.exports = mongoose.model('AssessmentAttempt', assessmentAttemptSchema);
