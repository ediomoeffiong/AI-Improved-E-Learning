const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'fill-in-blank'],
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

const quizSchema = new mongoose.Schema({
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
  category: {
    type: String,
    required: true,
    enum: ['Programming', 'React', 'CSS', 'AI/ML', 'Database', 'Web Development', 'Data Science', 'Design', 'Marketing', 'IT', 'Business']
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
  passingScore: {
    type: Number,
    default: 70 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  prerequisites: [String],
  tags: [String],
  estimatedTime: String,
  maxAttempts: {
    type: Number,
    default: 3
  },
  shuffleQuestions: {
    type: Boolean,
    default: false
  },
  shuffleOptions: {
    type: Boolean,
    default: false
  },
  showResults: {
    type: Boolean,
    default: true
  },
  showCorrectAnswers: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total points when questions are added/modified
quizSchema.pre('save', function(next) {
  this.totalPoints = this.questions.reduce((total, question) => total + question.points, 0);
  next();
});

// Index for search functionality
quizSchema.index({
  title: 'text',
  description: 'text',
  course: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Quiz', quizSchema);
