const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank', 'essay'],
    default: 'multiple-choice'
  },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String, // For fill-in-blank questions
  explanation: String,
  points: {
    type: Number,
    default: 1
  },
  order: {
    type: Number,
    required: true
  }
});

const assessmentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  course: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Final Exam', 'Midterm', 'Quiz', 'Lab Test', 'Assignment', 'Project']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  timeLimit: {
    type: Number, // in minutes
    required: true
  },
  questions: [questionSchema],
  totalPoints: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Assessment-specific fields
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'available', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  // Access control
  institution: {
    type: String,
    required: true
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // Assessment settings
  maxAttempts: {
    type: Number,
    default: 1 // Formal assessments typically allow only one attempt
  },
  shuffleQuestions: {
    type: Boolean,
    default: true // Usually enabled for formal assessments
  },
  shuffleOptions: {
    type: Boolean,
    default: true
  },
  showResults: {
    type: Boolean,
    default: false // Results may not be immediately available
  },
  showCorrectAnswers: {
    type: Boolean,
    default: false // Usually hidden for formal assessments
  },
  // Additional assessment metadata
  instructions: [String],
  requirements: [String],
  prerequisites: [String],
  tags: [String],
  estimatedTime: String,
  // Proctoring and security
  requireProctoring: {
    type: Boolean,
    default: false
  },
  allowCalculator: {
    type: Boolean,
    default: false
  },
  allowNotes: {
    type: Boolean,
    default: false
  },
  // Grading
  autoGrade: {
    type: Boolean,
    default: true
  },
  gradingRubric: String,
  // Availability window
  availableFrom: Date,
  availableUntil: Date
}, {
  timestamps: true
});

// Calculate total points and marks when questions are added/modified
assessmentSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  this.totalMarks = this.totalPoints; // For assessments, marks = points
  next();
});

// Index for search functionality
assessmentSchema.index({
  title: 'text',
  description: 'text',
  course: 'text',
  subject: 'text',
  category: 'text',
  tags: 'text'
});

// Index for institution-based queries
assessmentSchema.index({ institution: 1, status: 1 });
assessmentSchema.index({ scheduledDate: 1, status: 1 });

module.exports = mongoose.model('Assessment', assessmentSchema);
