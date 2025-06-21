const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Mock practice test data for development
const mockPracticeTests = [
  {
    _id: '1',
    title: 'Basic Mathematics',
    subject: 'Mathematics',
    difficulty: 'Easy',
    description: 'Practice basic arithmetic, algebra, and geometry concepts.',
    topics: ['Arithmetic', 'Basic Algebra', 'Geometry'],
    timeLimit: 30,
    totalPoints: 20,
    passingScore: 70,
    isActive: true,
    questions: [
      {
        _id: 'pq1',
        question: 'What is 15 + 27?',
        type: 'multiple-choice',
        options: [
          { text: '42', isCorrect: true },
          { text: '41', isCorrect: false },
          { text: '43', isCorrect: false },
          { text: '40', isCorrect: false }
        ],
        explanation: '15 + 27 = 42',
        points: 1,
        order: 1
      },
      {
        _id: 'pq2',
        question: 'What is the square root of 64?',
        type: 'multiple-choice',
        options: [
          { text: '6', isCorrect: false },
          { text: '7', isCorrect: false },
          { text: '8', isCorrect: true },
          { text: '9', isCorrect: false }
        ],
        explanation: 'The square root of 64 is 8 because 8 × 8 = 64',
        points: 1,
        order: 2
      },
      {
        _id: 'pq3',
        question: 'If x + 5 = 12, what is x?',
        type: 'multiple-choice',
        options: [
          { text: '6', isCorrect: false },
          { text: '7', isCorrect: true },
          { text: '8', isCorrect: false },
          { text: '17', isCorrect: false }
        ],
        explanation: 'x + 5 = 12, so x = 12 - 5 = 7',
        points: 1,
        order: 3
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    _id: '2',
    title: 'Advanced Calculus',
    subject: 'Mathematics',
    difficulty: 'Hard',
    description: 'Advanced calculus problems including derivatives and integrals.',
    topics: ['Derivatives', 'Integrals', 'Limits'],
    timeLimit: 45,
    totalPoints: 15,
    passingScore: 70,
    isActive: true,
    questions: [
      {
        _id: 'pq4',
        question: 'What is the derivative of x²?',
        type: 'multiple-choice',
        options: [
          { text: 'x', isCorrect: false },
          { text: '2x', isCorrect: true },
          { text: 'x²', isCorrect: false },
          { text: '2x²', isCorrect: false }
        ],
        explanation: 'The derivative of x² is 2x using the power rule',
        points: 1,
        order: 1
      },
      {
        _id: 'pq5',
        question: 'What is the integral of 2x?',
        type: 'multiple-choice',
        options: [
          { text: 'x² + C', isCorrect: true },
          { text: '2x² + C', isCorrect: false },
          { text: 'x + C', isCorrect: false },
          { text: '2 + C', isCorrect: false }
        ],
        explanation: 'The integral of 2x is x² + C',
        points: 1,
        order: 2
      }
    ],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16')
  },
  {
    _id: '3',
    title: 'Programming Fundamentals',
    subject: 'Computer Science',
    difficulty: 'Medium',
    description: 'Basic programming concepts and problem-solving.',
    topics: ['Variables', 'Loops', 'Functions'],
    timeLimit: 40,
    totalPoints: 25,
    passingScore: 70,
    isActive: true,
    questions: [
      {
        _id: 'pq6',
        question: 'Which of the following is a valid variable name in most programming languages?',
        type: 'multiple-choice',
        options: [
          { text: '2variable', isCorrect: false },
          { text: 'my-variable', isCorrect: false },
          { text: 'myVariable', isCorrect: true },
          { text: 'my variable', isCorrect: false }
        ],
        explanation: 'Variable names typically cannot start with numbers or contain spaces/hyphens',
        points: 1,
        order: 1
      },
      {
        _id: 'pq7',
        question: 'What does a for loop do?',
        type: 'multiple-choice',
        options: [
          { text: 'Executes code once', isCorrect: false },
          { text: 'Executes code repeatedly based on a condition', isCorrect: true },
          { text: 'Defines a function', isCorrect: false },
          { text: 'Creates a variable', isCorrect: false }
        ],
        explanation: 'A for loop executes code repeatedly based on a specified condition',
        points: 1,
        order: 2
      }
    ],
    createdAt: new Date('2024-01-17'),
    updatedAt: new Date('2024-01-17')
  }
];

// @route   GET /api/practice-tests
// @desc    Get all available practice tests
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // In a real implementation, you would fetch from MongoDB
      // For now, return mock data with question count instead of full questions
      const practiceTestsWithStats = mockPracticeTests.map(test => ({
        ...test,
        questions: test.questions.length, // Return count instead of full array
        totalQuestions: test.questions.length,
        attempts: 0, // TODO: Get actual user attempts from database
        bestScore: null, // TODO: Get actual best score from database
        lastAttempt: null // TODO: Get actual last attempt from database
      }));
      res.json(practiceTestsWithStats);
    } else {
      // Use mock data with question count
      const practiceTestsWithStats = mockPracticeTests.map(test => ({
        ...test,
        questions: test.questions.length, // Return count instead of full array
        totalQuestions: test.questions.length,
        attempts: 0,
        bestScore: null,
        lastAttempt: null
      }));
      res.json(practiceTestsWithStats);
    }
  } catch (error) {
    console.error('Error fetching practice tests:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practice-tests/:id
// @desc    Get practice test by ID (for taking the test)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // In a real implementation, you would fetch from MongoDB
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);

      if (!practiceTest || !practiceTest.isActive) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      res.json({
        ...practiceTest,
        attempts: 0,
        bestScore: null,
        canTake: true
      });
    } else {
      // Use mock data
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);

      if (!practiceTest || !practiceTest.isActive) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      res.json({
        ...practiceTest,
        attempts: 0,
        bestScore: null,
        canTake: true
      });
    }
  } catch (error) {
    console.error('Error fetching practice test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/practice-tests/:id/start
// @desc    Start a new practice test attempt
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // In a real implementation, you would create an attempt record in MongoDB
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);

      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      const practiceTestForTaking = {
        ...practiceTest,
        questions: practiceTest.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        practiceTest: practiceTestForTaking,
        attemptId: 'mock-practice-attempt-' + Date.now(),
        timeLimit: practiceTest.timeLimit
      });
    } else {
      // Mock response for development
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);

      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      const practiceTestForTaking = {
        ...practiceTest,
        questions: practiceTest.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })),
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        practiceTest: practiceTestForTaking,
        attemptId: 'mock-practice-attempt-' + Date.now(),
        timeLimit: practiceTest.timeLimit
      });
    }
  } catch (error) {
    console.error('Error starting practice test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/practice-tests/:id/submit
// @desc    Submit practice test answers
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const { attemptId, answers, timeSpent, timeExpired } = req.body;

    if (isMongoConnected()) {
      // In a real implementation, you would save the attempt to MongoDB
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);
      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      // Calculate mock score
      let correctAnswers = 0;
      const processedAnswers = answers.map(answer => {
        const question = practiceTest.questions.find(q => q._id === answer.questionId);
        if (question) {
          const selectedOption = question.options.find(opt => opt.text === answer.selectedOption);
          const isCorrect = selectedOption && selectedOption.isCorrect;
          if (isCorrect) correctAnswers++;

          return {
            questionId: answer.questionId,
            question: question.question,
            selectedAnswer: answer.selectedOption,
            correctAnswer: question.options.find(opt => opt.isCorrect)?.text,
            isCorrect,
            explanation: question.explanation,
            pointsEarned: isCorrect ? question.points : 0,
            timeSpent: answer.timeSpent || 0
          };
        }
        return null;
      }).filter(Boolean);

      const percentage = Math.round((correctAnswers / practiceTest.questions.length) * 100);
      const passed = percentage >= practiceTest.passingScore;

      res.json({
        message: 'Practice test submitted successfully',
        attemptId: attemptId,
        score: correctAnswers,
        percentage,
        passed,
        grade: passed ? (percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : 'C') : 'F',
        answers: processedAnswers
      });
    } else {
      // Mock response for development
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);
      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      // Calculate mock score
      let correctAnswers = 0;
      const processedAnswers = answers.map(answer => {
        const question = practiceTest.questions.find(q => q._id === answer.questionId);
        if (question) {
          const selectedOption = question.options.find(opt => opt.text === answer.selectedOption);
          const isCorrect = selectedOption && selectedOption.isCorrect;
          if (isCorrect) correctAnswers++;

          return {
            questionId: answer.questionId,
            question: question.question,
            selectedAnswer: answer.selectedOption,
            correctAnswer: question.options.find(opt => opt.isCorrect)?.text,
            isCorrect,
            explanation: question.explanation,
            pointsEarned: isCorrect ? question.points : 0,
            timeSpent: answer.timeSpent || 0
          };
        }
        return null;
      }).filter(Boolean);

      const percentage = Math.round((correctAnswers / practiceTest.questions.length) * 100);
      const passed = percentage >= practiceTest.passingScore;

      res.json({
        message: 'Practice test submitted successfully (demo mode)',
        attemptId: attemptId,
        score: correctAnswers,
        percentage,
        passed,
        grade: passed ? (percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : 'C') : 'F',
        answers: processedAnswers
      });
    }
  } catch (error) {
    console.error('Error submitting practice test:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practice-tests/:id/results/:attemptId
// @desc    Get practice test results
// @access  Private
router.get('/:id/results/:attemptId', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // In a real implementation, you would fetch from MongoDB
      // For now, return mock results
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);
      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      // Mock results data
      const mockResults = {
        practiceTest: {
          title: practiceTest.title,
          subject: practiceTest.subject,
          difficulty: practiceTest.difficulty,
          topics: practiceTest.topics
        },
        score: 2,
        totalQuestions: practiceTest.questions.length,
        percentage: Math.round((2 / practiceTest.questions.length) * 100),
        passed: Math.round((2 / practiceTest.questions.length) * 100) >= practiceTest.passingScore,
        grade: 'B',
        timeSpent: 25,
        answers: practiceTest.questions.map((q, index) => ({
          questionId: q._id,
          question: q.question,
          selectedAnswer: q.options[index % q.options.length].text,
          correctAnswer: q.options.find(opt => opt.isCorrect)?.text,
          isCorrect: index < 2,
          explanation: q.explanation
        }))
      };

      res.json(mockResults);
    } else {
      // Use mock data
      const practiceTest = mockPracticeTests.find(pt => pt._id === req.params.id);
      if (!practiceTest) {
        return res.status(404).json({ message: 'Practice test not found' });
      }

      // Mock results data
      const mockResults = {
        practiceTest: {
          title: practiceTest.title,
          subject: practiceTest.subject,
          difficulty: practiceTest.difficulty,
          topics: practiceTest.topics
        },
        score: 2,
        totalQuestions: practiceTest.questions.length,
        percentage: Math.round((2 / practiceTest.questions.length) * 100),
        passed: Math.round((2 / practiceTest.questions.length) * 100) >= practiceTest.passingScore,
        grade: 'B',
        timeSpent: 25,
        answers: practiceTest.questions.map((q, index) => ({
          questionId: q._id,
          question: q.question,
          selectedAnswer: q.options[index % q.options.length].text,
          correctAnswer: q.options.find(opt => opt.isCorrect)?.text,
          isCorrect: index < 2,
          explanation: q.explanation
        }))
      };

      res.json(mockResults);
    }
  } catch (error) {
    console.error('Error fetching practice test results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/practice-tests/attempts
// @desc    Get user's practice test attempts
// @access  Private
router.get('/attempts', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      // In a real implementation, you would fetch from MongoDB
      // For now, return mock data
      res.json([
        {
          _id: 'practice-attempt-1',
          practiceTest: {
            _id: '1',
            title: 'Basic Mathematics',
            subject: 'Mathematics',
            difficulty: 'Easy',
            topics: ['Arithmetic', 'Basic Algebra', 'Geometry']
          },
          score: 18,
          percentage: 90,
          passed: true,
          grade: 'A-',
          timeSpent: 25,
          submittedAt: new Date('2024-01-12'),
          correctAnswers: 18,
          totalQuestions: 20
        },
        {
          _id: 'practice-attempt-2',
          practiceTest: {
            _id: '3',
            title: 'Programming Fundamentals',
            subject: 'Computer Science',
            difficulty: 'Medium',
            topics: ['Variables', 'Loops', 'Functions']
          },
          score: 20,
          percentage: 80,
          passed: true,
          grade: 'B',
          timeSpent: 35,
          submittedAt: new Date('2024-01-08'),
          correctAnswers: 20,
          totalQuestions: 25
        }
      ]);
    } else {
      // Use mock data
      res.json([
        {
          _id: 'practice-attempt-1',
          practiceTest: {
            _id: '1',
            title: 'Basic Mathematics',
            subject: 'Mathematics',
            difficulty: 'Easy',
            topics: ['Arithmetic', 'Basic Algebra', 'Geometry']
          },
          score: 18,
          percentage: 90,
          passed: true,
          grade: 'A-',
          timeSpent: 25,
          submittedAt: new Date('2024-01-12'),
          correctAnswers: 18,
          totalQuestions: 20
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching practice test attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
