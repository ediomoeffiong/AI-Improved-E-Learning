const express = require('express');
const auth = require('../middleware/auth');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');

const router = express.Router();

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Mock quiz data for development
const mockQuizzes = [
  {
    _id: '1',
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
    instructor: 'Prof. Michael Chen',
    course: 'Frontend Development',
    category: 'Programming',
    difficulty: 'Beginner',
    timeLimit: 20,
    totalPoints: 15,
    passingScore: 70,
    isActive: true,
    prerequisites: [],
    tags: ['javascript', 'basics', 'variables'],
    estimatedTime: '15-20 min',
    maxAttempts: 3,
    questions: [
      {
        _id: 'q1',
        question: 'What is the correct way to declare a variable in JavaScript?',
        type: 'multiple-choice',
        options: [
          { text: 'var myVariable;', isCorrect: true },
          { text: 'variable myVariable;', isCorrect: false },
          { text: 'v myVariable;', isCorrect: false },
          { text: 'declare myVariable;', isCorrect: false }
        ],
        explanation: 'In JavaScript, variables are declared using var, let, or const keywords.',
        points: 1,
        order: 1
      },
      {
        _id: 'q2',
        question: 'JavaScript is a statically typed language.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'JavaScript is a dynamically typed language, meaning variable types are determined at runtime.',
        points: 1,
        order: 2
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    title: 'React Components & Props',
    description: 'Challenge yourself with questions about React components, props, and state management.',
    instructor: 'Prof. Michael Chen',
    course: 'Frontend Development',
    category: 'React',
    difficulty: 'Intermediate',
    timeLimit: 15,
    totalPoints: 12,
    passingScore: 70,
    isActive: true,
    prerequisites: ['JavaScript Fundamentals'],
    tags: ['react', 'components', 'props'],
    estimatedTime: '12-15 min',
    maxAttempts: 3,
    questions: [
      {
        _id: 'q3',
        question: 'What is the correct way to pass data to a React component?',
        type: 'multiple-choice',
        options: [
          { text: 'Through props', isCorrect: true },
          { text: 'Through state', isCorrect: false },
          { text: 'Through context only', isCorrect: false },
          { text: 'Through refs', isCorrect: false }
        ],
        explanation: 'Props are the primary way to pass data from parent to child components in React.',
        points: 1,
        order: 1
      }
    ],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  }
];

// @route   GET /api/quizzes
// @desc    Get all available quizzes with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      difficulty,
      course,
      page = 1,
      limit = 12
    } = req.query;

    if (isMongoConnected()) {
      // Build filter object
      const filters = { isActive: true };
      
      if (search) {
        filters.$text = { $search: search };
      }
      if (category && category !== 'All') filters.category = category;
      if (difficulty && difficulty !== 'All') filters.difficulty = difficulty;
      if (course && course !== 'All') filters.course = course;

      // Apply pagination
      const skip = (page - 1) * limit;
      const quizzes = await Quiz.find(filters)
        .select('-questions') // Don't include questions in list view
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

      const total = await Quiz.countDocuments(filters);

      res.json({
        quizzes,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      });
    } else {
      // Use mock data
      let filtered = mockQuizzes.filter(quiz => {
        if (search && !quiz.title.toLowerCase().includes(search.toLowerCase()) && 
            !quiz.description.toLowerCase().includes(search.toLowerCase())) return false;
        if (category && category !== 'All' && quiz.category !== category) return false;
        if (difficulty && difficulty !== 'All' && quiz.difficulty !== difficulty) return false;
        if (course && course !== 'All' && quiz.course !== course) return false;
        return true;
      });

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedQuizzes = filtered.slice(skip, skip + parseInt(limit));

      res.json({
        quizzes: paginatedQuizzes.map(quiz => ({
          ...quiz,
          questions: undefined // Don't include questions in list view
        })),
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(filtered.length / limit),
          total: filtered.length
        }
      });
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Get quiz by ID (for taking the quiz)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz || !quiz.isActive) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Check user's previous attempts
      const attempts = await QuizAttempt.find({
        user: req.user.id,
        quiz: req.params.id
      }).sort({ attemptNumber: -1 });

      const canTakeQuiz = attempts.length < quiz.maxAttempts;
      const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null;

      res.json({
        ...quiz.toObject(),
        attempts: attempts.length,
        bestScore,
        canTakeQuiz
      });
    } else {
      // Use mock data
      const quiz = mockQuizzes.find(q => q._id === req.params.id);

      if (!quiz || !quiz.isActive) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      res.json({
        ...quiz,
        attempts: 0,
        bestScore: null,
        canTakeQuiz: true
      });
    }
  } catch (error) {
    console.error('Error fetching quiz:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/start
// @desc    Start a new quiz attempt
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const quiz = await Quiz.findById(req.params.id);

      if (!quiz || !quiz.isActive) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Check if user can take the quiz
      const previousAttempts = await QuizAttempt.countDocuments({
        user: req.user.id,
        quiz: req.params.id
      });

      if (previousAttempts >= quiz.maxAttempts) {
        return res.status(400).json({ message: 'Maximum attempts reached' });
      }

      // Create new attempt
      const attempt = new QuizAttempt({
        user: req.user.id,
        quiz: req.params.id,
        attemptNumber: previousAttempts + 1,
        totalPoints: quiz.totalPoints,
        totalQuestions: quiz.questions.length
      });

      await attempt.save();

      // Return quiz without correct answers
      const quizForTaking = {
        ...quiz.toObject(),
        questions: quiz.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        quiz: quizForTaking,
        attemptId: attempt._id,
        timeLimit: quiz.timeLimit
      });
    } else {
      // Mock response for development
      const quiz = mockQuizzes.find(q => q._id === req.params.id);

      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      const quizForTaking = {
        ...quiz,
        questions: quiz.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })),
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        quiz: quizForTaking,
        attemptId: 'mock-attempt-' + Date.now(),
        timeLimit: quiz.timeLimit
      });
    }
  } catch (error) {
    console.error('Error starting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { attemptId, answers, timeSpent } = req.body;

    if (isMongoConnected()) {
      const quiz = await Quiz.findById(req.params.id);
      const attempt = await QuizAttempt.findById(attemptId);

      if (!quiz || !attempt) {
        return res.status(404).json({ message: 'Quiz or attempt not found' });
      }

      if (attempt.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      if (attempt.status !== 'in-progress') {
        return res.status(400).json({ message: 'Quiz already submitted' });
      }

      // Process answers
      const processedAnswers = answers.map(answer => {
        const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) return null;

        let isCorrect = false;
        let pointsEarned = 0;

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          const selectedOption = question.options.find(opt => opt.text === answer.selectedOption);
          isCorrect = selectedOption && selectedOption.isCorrect;
        } else if (question.type === 'fill-in-blank') {
          isCorrect = answer.selectedAnswer &&
            answer.selectedAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
        }

        if (isCorrect) {
          pointsEarned = question.points;
        }

        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          selectedAnswer: answer.selectedAnswer,
          isCorrect,
          pointsEarned,
          timeSpent: answer.timeSpent || 0
        };
      }).filter(Boolean);

      // Update attempt
      attempt.answers = processedAnswers;
      attempt.status = 'completed';
      attempt.submittedAt = new Date();
      attempt.timeSpent = timeSpent || 0;

      await attempt.save();

      res.json({
        message: 'Quiz submitted successfully',
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        grade: attempt.grade
      });
    } else {
      // Mock response for development
      const quiz = mockQuizzes.find(q => q._id === req.params.id);
      if (!quiz) {
        return res.status(404).json({ message: 'Quiz not found' });
      }

      // Calculate mock score
      let correctAnswers = 0;
      answers.forEach(answer => {
        const question = quiz.questions.find(q => q._id === answer.questionId);
        if (question) {
          if (question.type === 'multiple-choice' || question.type === 'true-false') {
            const selectedOption = question.options.find(opt => opt.text === answer.selectedOption);
            if (selectedOption && selectedOption.isCorrect) correctAnswers++;
          }
        }
      });

      const percentage = Math.round((correctAnswers / quiz.questions.length) * 100);
      const passed = percentage >= 70;

      res.json({
        message: 'Quiz submitted successfully (demo mode)',
        attemptId: attemptId,
        score: correctAnswers,
        percentage,
        passed,
        grade: passed ? 'B' : 'F'
      });
    }
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/:id/results/:attemptId
// @desc    Get quiz results
// @access  Private
router.get('/:id/results/:attemptId', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const quiz = await Quiz.findById(req.params.id);
      const attempt = await QuizAttempt.findById(req.params.attemptId);

      if (!quiz || !attempt) {
        return res.status(404).json({ message: 'Quiz or attempt not found' });
      }

      if (attempt.user.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Unauthorized' });
      }

      // Build detailed results
      const detailedResults = attempt.answers.map(answer => {
        const question = quiz.questions.find(q => q._id.toString() === answer.questionId);
        return {
          question: question.question,
          type: question.type,
          options: question.options,
          selectedOption: answer.selectedOption,
          selectedAnswer: answer.selectedAnswer,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          explanation: question.explanation,
          timeSpent: answer.timeSpent
        };
      });

      res.json({
        quiz: {
          title: quiz.title,
          description: quiz.description,
          totalPoints: quiz.totalPoints
        },
        attempt: {
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          grade: attempt.grade,
          timeSpent: attempt.timeSpent,
          submittedAt: attempt.submittedAt,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions
        },
        results: detailedResults
      });
    } else {
      // Mock response
      res.json({
        quiz: { title: 'Mock Quiz', description: 'Demo quiz', totalPoints: 10 },
        attempt: { score: 8, percentage: 80, passed: true, grade: 'B', timeSpent: 15 },
        results: []
      });
    }
  } catch (error) {
    console.error('Error fetching quiz results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/dashboard
// @desc    Get quiz dashboard data for user
// @access  Private
router.get('/dashboard', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // Get user's quiz attempts
      const attempts = await QuizAttempt.find({ user: req.user.id })
        .populate('quiz', 'title course category difficulty')
        .sort({ submittedAt: -1 });

      // Get all available quizzes
      const availableQuizzes = await Quiz.find({ isActive: true })
        .select('-questions.options.isCorrect -questions.correctAnswer -questions.explanation');

      // Calculate stats
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      const averageScore = completedAttempts.length > 0
        ? Math.round(completedAttempts.reduce((sum, a) => sum + a.percentage, 0) / completedAttempts.length)
        : 0;

      const stats = {
        totalQuizzes: availableQuizzes.length,
        completedQuizzes: completedAttempts.length,
        averageScore,
        totalTimeSpent: completedAttempts.reduce((sum, a) => sum + a.timeSpent, 0),
        streak: 0, // TODO: Calculate streak
        rank: 0, // TODO: Calculate rank
        badges: [] // TODO: Calculate badges
      };

      // Format recent results
      const recentResults = completedAttempts.slice(0, 5).map(attempt => ({
        id: attempt._id,
        quiz: attempt.quiz?.title || 'Unknown Quiz',
        score: attempt.score,
        percentage: attempt.percentage,
        date: attempt.submittedAt,
        status: attempt.passed ? 'Passed' : 'Failed',
        timeSpent: attempt.timeSpent,
        correctAnswers: attempt.correctAnswers,
        totalQuestions: attempt.totalQuestions,
        difficulty: attempt.quiz?.difficulty || 'Unknown',
        course: attempt.quiz?.course || 'Unknown',
        canRetake: true
      }));

      // Add attempt info to available quizzes
      const quizzesWithAttempts = availableQuizzes.map(quiz => {
        const userAttempts = attempts.filter(a => a.quiz && a.quiz._id.toString() === quiz._id.toString());
        const bestAttempt = userAttempts.length > 0
          ? userAttempts.reduce((best, current) => current.percentage > best.percentage ? current : best)
          : null;

        return {
          ...quiz.toObject(),
          attempts: userAttempts.length,
          bestScore: bestAttempt ? bestAttempt.percentage : null,
          isLocked: userAttempts.length >= quiz.maxAttempts
        };
      });

      res.json({
        stats,
        availableQuizzes: quizzesWithAttempts,
        recentResults,
        upcomingQuizzes: [] // TODO: Implement scheduled quizzes
      });
    } else {
      // Use mock data
      const mockDashboard = {
        stats: {
          totalQuizzes: mockQuizzes.length,
          completedQuizzes: 2,
          averageScore: 85,
          totalTimeSpent: 145,
          streak: 7,
          rank: 15,
          badges: ['Quiz Master', 'Speed Demon']
        },
        availableQuizzes: mockQuizzes.map(quiz => ({
          ...quiz,
          questions: quiz.questions.length,
          attempts: 0,
          bestScore: null,
          isLocked: false
        })),
        recentResults: [
          {
            id: 1,
            quiz: 'JavaScript Fundamentals',
            score: 2,
            percentage: 67,
            date: new Date().toISOString(),
            status: 'Passed',
            timeSpent: 15,
            difficulty: 'Beginner',
            course: 'Frontend Development'
          }
        ],
        upcomingQuizzes: []
      };

      res.json(mockDashboard);
    }
  } catch (error) {
    console.error('Error fetching quiz dashboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/quizzes/attempts
// @desc    Get user's quiz attempts
// @access  Private
router.get('/attempts', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const attempts = await QuizAttempt.find({ user: req.user.id })
        .populate('quiz', 'title course category difficulty')
        .sort({ submittedAt: -1 });

      res.json(attempts);
    } else {
      // Mock data
      res.json([
        {
          _id: 'attempt1',
          quiz: { title: 'JavaScript Fundamentals', course: 'Frontend Development' },
          score: 2,
          percentage: 67,
          passed: false,
          submittedAt: new Date()
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching quiz attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
