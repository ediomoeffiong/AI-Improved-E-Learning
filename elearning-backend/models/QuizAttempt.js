const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  selectedOption: String, // For multiple choice
  selectedAnswer: String, // For fill-in-blank
  isCorrect: Boolean,
  pointsEarned: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  }
});

const quizAttemptSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  attemptNumber: {
    type: Number,
    required: true
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
    enum: ['in-progress', 'completed', 'abandoned', 'time-expired'],
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
  }
}, {
  timestamps: true
});

// Calculate score and percentage before saving
quizAttemptSchema.pre('save', function(next) {
  if (this.status === 'completed' && this.answers.length > 0) {
    this.score = this.answers.reduce((total, answer) => total + answer.pointsEarned, 0);
    this.correctAnswers = this.answers.filter(answer => answer.isCorrect).length;
    this.totalQuestions = this.answers.length;
    
    if (this.totalPoints > 0) {
      this.percentage = Math.round((this.score / this.totalPoints) * 100);
    }
    
    // Determine if passed based on percentage
    this.passed = this.percentage >= 70; // Default passing score
    
    // Assign grade based on percentage
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
  }
  next();
});

// Index for efficient queries
quizAttemptSchema.index({ user: 1, quiz: 1 });
quizAttemptSchema.index({ user: 1, submittedAt: -1 });
quizAttemptSchema.index({ quiz: 1, submittedAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);
