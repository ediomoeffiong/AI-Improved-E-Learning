const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const AssessmentAttempt = require('../models/AssessmentAttempt');

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Mock assessment data
const mockAssessments = [
  {
    _id: '507f1f77bcf86cd799439011',
    title: 'Mathematics Final Examination',
    description: 'Comprehensive mathematics examination covering all topics from the semester.',
    instructor: 'Dr. Sarah Johnson',
    course: 'Advanced Mathematics',
    subject: 'Mathematics',
    category: 'Final Exam',
    difficulty: 'Advanced',
    timeLimit: 120,
    totalPoints: 100,
    totalMarks: 100,
    passingScore: 70,
    isActive: true,
    scheduledDate: new Date('2024-01-25'),
    scheduledTime: '10:00 AM',
    status: 'scheduled',
    institution: 'University of Lagos',
    maxAttempts: 1,
    shuffleQuestions: true,
    shuffleOptions: true,
    showResults: false,
    showCorrectAnswers: false,
    instructions: [
      'Ensure stable internet connection',
      'Use only approved calculator',
      'No external materials allowed',
      'Submit before time expires'
    ],
    requirements: ['Calculator', 'Stable Internet', 'Quiet Environment'],
    allowCalculator: true,
    allowNotes: false,
    autoGrade: true,
    questions: [
      {
        _id: '507f1f77bcf86cd799439012',
        question: 'What is the derivative of x²?',
        type: 'multiple-choice',
        options: [
          { text: '2x', isCorrect: true },
          { text: 'x²', isCorrect: false },
          { text: '2', isCorrect: false },
          { text: 'x', isCorrect: false }
        ],
        points: 5,
        order: 1
      },
      {
        _id: '507f1f77bcf86cd799439013',
        question: 'Solve for x: 2x + 5 = 15',
        type: 'fill-in-blank',
        correctAnswer: '5',
        points: 5,
        order: 2
      }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439014',
    title: 'Computer Science Midterm',
    description: 'Midterm examination covering programming fundamentals and data structures.',
    instructor: 'Prof. Michael Chen',
    course: 'Computer Science 101',
    subject: 'Computer Science',
    category: 'Midterm',
    difficulty: 'Intermediate',
    timeLimit: 90,
    totalPoints: 80,
    totalMarks: 80,
    passingScore: 70,
    isActive: true,
    scheduledDate: new Date('2024-01-28'),
    scheduledTime: '2:00 PM',
    status: 'scheduled',
    institution: 'University of Lagos',
    maxAttempts: 1,
    instructions: [
      'Code compilation will be tested',
      'Provide well-commented code',
      'Follow naming conventions',
      'Test your solutions'
    ],
    requirements: ['Programming Environment', 'Stable Internet'],
    questions: [
      {
        _id: '507f1f77bcf86cd799439015',
        question: 'What is the time complexity of binary search?',
        type: 'multiple-choice',
        options: [
          { text: 'O(n)', isCorrect: false },
          { text: 'O(log n)', isCorrect: true },
          { text: 'O(n²)', isCorrect: false },
          { text: 'O(1)', isCorrect: false }
        ],
        points: 4,
        order: 1
      }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439016',
    title: 'Physics Lab Test',
    description: 'Practical examination on electromagnetic principles and circuit analysis.',
    instructor: 'Dr. Adebayo Ogundimu',
    course: 'Physics 201',
    subject: 'Physics',
    category: 'Lab Test',
    difficulty: 'Intermediate',
    timeLimit: 60,
    totalPoints: 50,
    totalMarks: 50,
    passingScore: 70,
    isActive: true,
    scheduledDate: new Date('2024-01-30'),
    scheduledTime: '11:00 AM',
    status: 'available',
    institution: 'University of Lagos',
    maxAttempts: 1,
    instructions: [
      'Show all calculations',
      'Draw clear diagrams',
      'Label all components',
      'Include units in answers'
    ],
    requirements: ['Calculator', 'Drawing Tools'],
    questions: [
      {
        _id: '507f1f77bcf86cd799439017',
        question: 'Calculate the resistance of a circuit with voltage 12V and current 3A.',
        type: 'fill-in-blank',
        correctAnswer: '4',
        points: 10,
        order: 1
      }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439018',
    title: 'Chemistry Quiz',
    description: 'Quick assessment on organic chemistry reactions and mechanisms.',
    instructor: 'Dr. Fatima Abdullahi',
    course: 'Organic Chemistry',
    subject: 'Chemistry',
    category: 'Quiz',
    difficulty: 'Beginner',
    timeLimit: 30,
    totalPoints: 25,
    totalMarks: 25,
    passingScore: 70,
    isActive: true,
    scheduledDate: new Date('2024-02-02'),
    scheduledTime: '9:00 AM',
    status: 'scheduled',
    institution: 'University of Lagos',
    maxAttempts: 1,
    instructions: [
      'Read questions carefully',
      'Select the best answer',
      'No calculators needed',
      'Time limit is strict'
    ],
    requirements: ['Periodic Table'],
    questions: [
      {
        _id: '507f1f77bcf86cd799439019',
        question: 'What is the molecular formula of methane?',
        type: 'multiple-choice',
        options: [
          { text: 'CH₄', isCorrect: true },
          { text: 'C₂H₆', isCorrect: false },
          { text: 'C₃H₈', isCorrect: false },
          { text: 'CH₂', isCorrect: false }
        ],
        points: 5,
        order: 1
      }
    ]
  },
  {
    _id: '507f1f77bcf86cd799439020',
    title: 'English Literature Essay',
    description: 'Analytical essay on modern literature themes and techniques.',
    instructor: 'Prof. Chinua Okoro',
    course: 'Modern Literature',
    subject: 'English',
    category: 'Assignment',
    difficulty: 'Advanced',
    timeLimit: 180,
    totalPoints: 100,
    totalMarks: 100,
    passingScore: 70,
    isActive: true,
    scheduledDate: new Date('2024-02-01'),
    scheduledTime: '1:00 PM',
    status: 'scheduled',
    institution: 'University of Lagos',
    maxAttempts: 1,
    instructions: [
      'Minimum 1500 words',
      'Cite at least 5 sources',
      'Use MLA format',
      'Original work only'
    ],
    requirements: ['Text References', 'Citation Guide'],
    questions: [
      {
        _id: '507f1f77bcf86cd799439021',
        question: 'Analyze the theme of identity in post-colonial African literature. Use specific examples from at least three different authors.',
        type: 'essay',
        points: 100,
        order: 1
      }
    ]
  }
];

// @route   GET /api/assessments
// @desc    Get all available assessments for user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { category, status, institution } = req.query;
    
    if (isMongoConnected()) {
      // Build query
      let query = { isActive: true };
      
      if (category && category !== 'all') {
        query.category = category;
      }
      
      if (status && status !== 'all') {
        query.status = status;
      }
      
      if (institution) {
        query.institution = institution;
      }
      
      // Get assessments with question count instead of full questions
      const assessments = await Assessment.find(query)
        .select('-questions.options.isCorrect -questions.correctAnswer -questions.explanation')
        .lean();
      
      // Add user-specific data
      const assessmentsWithStats = await Promise.all(assessments.map(async (assessment) => {
        const attempts = await AssessmentAttempt.find({
          user: req.user.userId,
          assessment: assessment._id
        }).sort({ attemptNumber: -1 });
        
        return {
          ...assessment,
          questions: assessment.questions.length,
          attempts: attempts.length,
          bestScore: attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null,
          canTake: attempts.length < assessment.maxAttempts,
          lastAttempt: attempts.length > 0 ? attempts[0].submittedAt : null
        };
      }));
      
      res.json(assessmentsWithStats);
    } else {
      // Use mock data
      let filteredAssessments = mockAssessments;
      
      if (category && category !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.category === category);
      }
      
      if (status && status !== 'all') {
        filteredAssessments = filteredAssessments.filter(a => a.status === status);
      }
      
      const assessmentsWithStats = filteredAssessments.map(assessment => ({
        ...assessment,
        questions: assessment.questions.length,
        attempts: 0,
        bestScore: null,
        canTake: true,
        lastAttempt: null
      }));
      
      res.json(assessmentsWithStats);
    }
  } catch (error) {
    console.error('Error fetching assessments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assessments/:id
// @desc    Get assessment by ID (for taking the assessment)
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid assessment ID format' });
    }

    if (isMongoConnected()) {
      const assessment = await Assessment.findById(req.params.id);

      if (!assessment || !assessment.isActive) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      // Check user's previous attempts
      const attempts = await AssessmentAttempt.find({
        user: req.user.userId,
        assessment: req.params.id
      }).sort({ attemptNumber: -1 });

      const canTakeAssessment = attempts.length < assessment.maxAttempts;
      const bestScore = attempts.length > 0 ? Math.max(...attempts.map(a => a.percentage)) : null;

      res.json({
        ...assessment.toObject(),
        attempts: attempts.length,
        bestScore,
        canTakeAssessment
      });
    } else {
      // Use mock data
      const assessment = mockAssessments.find(a => a._id === req.params.id);

      if (!assessment || !assessment.isActive) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      res.json({
        ...assessment,
        attempts: 0,
        bestScore: null,
        canTakeAssessment: true
      });
    }
  } catch (error) {
    console.error('Error fetching assessment:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Assessment not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assessments/:id/start
// @desc    Start a new assessment attempt
// @access  Private
router.post('/:id/start', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid assessment ID format' });
    }

    if (isMongoConnected()) {
      const assessment = await Assessment.findById(req.params.id);

      if (!assessment || !assessment.isActive) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      // Check if assessment is available
      if (assessment.status !== 'available' && assessment.status !== 'scheduled') {
        return res.status(400).json({ message: 'Assessment is not available for taking' });
      }

      // Check user's previous attempts
      const existingAttempts = await AssessmentAttempt.find({
        user: req.user.userId,
        assessment: req.params.id
      });

      if (existingAttempts.length >= assessment.maxAttempts) {
        return res.status(400).json({ message: 'Maximum attempts reached' });
      }

      // Create new attempt
      const attempt = new AssessmentAttempt({
        user: req.user.userId,
        assessment: req.params.id,
        attemptNumber: existingAttempts.length + 1,
        totalPoints: assessment.totalPoints,
        institution: assessment.institution
      });

      await attempt.save();

      // Return assessment without correct answers
      const assessmentForTaking = {
        ...assessment.toObject(),
        questions: assessment.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })), // Remove isCorrect
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        assessment: assessmentForTaking,
        attemptId: attempt._id,
        timeLimit: assessment.timeLimit
      });
    } else {
      // Mock response for development
      const assessment = mockAssessments.find(a => a._id === req.params.id);

      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      const assessmentForTaking = {
        ...assessment,
        questions: assessment.questions.map(q => ({
          _id: q._id,
          question: q.question,
          type: q.type,
          options: q.options.map(opt => ({ text: opt.text })),
          points: q.points,
          order: q.order
        }))
      };

      res.json({
        assessment: assessmentForTaking,
        attemptId: 'mock-attempt-' + Date.now(),
        timeLimit: assessment.timeLimit
      });
    }
  } catch (error) {
    console.error('Error starting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/assessments/:id/submit
// @desc    Submit assessment answers
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    // Validate ObjectId format
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid assessment ID format' });
    }

    const { attemptId, answers, timeSpent, timeExpired } = req.body;

    if (isMongoConnected()) {
      const assessment = await Assessment.findById(req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      const attempt = await AssessmentAttempt.findById(attemptId);
      if (!attempt || attempt.user.toString() !== req.user.userId) {
        return res.status(404).json({ message: 'Assessment attempt not found' });
      }

      if (attempt.status !== 'in-progress') {
        return res.status(400).json({ message: 'Assessment attempt is not in progress' });
      }

      // Process answers
      const processedAnswers = answers.map(answer => {
        const question = assessment.questions.find(q => q._id.toString() === answer.questionId);
        if (!question) return null;

        let isCorrect = false;
        let pointsEarned = 0;
        let needsManualGrading = false;

        if (question.type === 'multiple-choice' || question.type === 'true-false') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          isCorrect = correctOption && correctOption.text === answer.selectedOption;
          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.type === 'fill-in-blank') {
          isCorrect = question.correctAnswer &&
            question.correctAnswer.toLowerCase().trim() === answer.selectedAnswer.toLowerCase().trim();
          pointsEarned = isCorrect ? question.points : 0;
        } else if (question.type === 'essay') {
          needsManualGrading = true;
          pointsEarned = 0; // Will be graded manually
        }

        return {
          questionId: answer.questionId,
          selectedOption: answer.selectedOption,
          selectedAnswer: answer.selectedAnswer,
          essayAnswer: answer.essayAnswer,
          isCorrect,
          pointsEarned,
          timeSpent: answer.timeSpent || 0,
          needsManualGrading
        };
      }).filter(Boolean);

      // Update attempt
      attempt.answers = processedAnswers;
      attempt.status = 'completed';
      attempt.submittedAt = new Date();
      attempt.timeSpent = timeSpent || 0;

      await attempt.save();

      res.json({
        message: 'Assessment submitted successfully',
        attemptId: attempt._id,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        grade: attempt.grade,
        needsManualGrading: processedAnswers.some(a => a.needsManualGrading)
      });
    } else {
      // Mock response for development
      const assessment = mockAssessments.find(a => a._id === req.params.id);
      if (!assessment) {
        return res.status(404).json({ message: 'Assessment not found' });
      }

      // Calculate mock score
      let correctAnswers = 0;
      let totalQuestions = answers.length;

      answers.forEach(answer => {
        const question = assessment.questions.find(q => q._id === answer.questionId);
        if (question && question.type === 'multiple-choice') {
          const correctOption = question.options.find(opt => opt.isCorrect);
          if (correctOption && correctOption.text === answer.selectedOption) {
            correctAnswers++;
          }
        }
      });

      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      const passed = percentage >= assessment.passingScore;

      res.json({
        message: 'Assessment submitted successfully',
        attemptId: attemptId,
        score: correctAnswers * 5, // Mock scoring
        percentage,
        passed,
        grade: passed ? (percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : 'C') : 'F'
      });
    }
  } catch (error) {
    console.error('Error submitting assessment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assessments/:id/results/:attemptId
// @desc    Get assessment results
// @access  Private
router.get('/:id/results/:attemptId', auth, async (req, res) => {
  try {
    // Validate ObjectId formats
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid assessment ID format' });
    }
    if (!req.params.attemptId.match(/^[0-9a-fA-F]{24}$/) && !req.params.attemptId.startsWith('mock-attempt-')) {
      return res.status(400).json({ message: 'Invalid attempt ID format' });
    }

    if (isMongoConnected()) {
      const assessment = await Assessment.findById(req.params.id);
      const attempt = await AssessmentAttempt.findById(req.params.attemptId);

      if (!assessment || !attempt) {
        return res.status(404).json({ message: 'Assessment or attempt not found' });
      }

      if (attempt.user.toString() !== req.user.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Prepare detailed results
      const detailedResults = attempt.answers.map(answer => {
        const question = assessment.questions.find(q => q._id.toString() === answer.questionId);
        return {
          question: question ? question.question : 'Question not found',
          userAnswer: answer.selectedOption || answer.selectedAnswer || answer.essayAnswer,
          correctAnswer: question ? (question.correctAnswer || question.options.find(opt => opt.isCorrect)?.text) : null,
          isCorrect: answer.isCorrect,
          pointsEarned: answer.pointsEarned,
          totalPoints: question ? question.points : 0,
          explanation: question ? question.explanation : null,
          needsManualGrading: answer.needsManualGrading,
          manualGrade: answer.manualGrade,
          graderComments: answer.graderComments
        };
      });

      res.json({
        assessment: {
          title: assessment.title,
          description: assessment.description,
          totalPoints: assessment.totalPoints,
          category: assessment.category,
          subject: assessment.subject
        },
        attempt: {
          score: attempt.score,
          percentage: attempt.percentage,
          passed: attempt.passed,
          grade: attempt.grade,
          timeSpent: attempt.timeSpent,
          submittedAt: attempt.submittedAt,
          correctAnswers: attempt.correctAnswers,
          totalQuestions: attempt.totalQuestions,
          gradingStatus: attempt.gradingStatus
        },
        results: detailedResults
      });
    } else {
      // Mock response
      res.json({
        assessment: {
          title: 'Mock Assessment',
          description: 'Demo assessment',
          totalPoints: 50,
          category: 'Quiz',
          subject: 'General'
        },
        attempt: {
          score: 40,
          percentage: 80,
          passed: true,
          grade: 'B',
          timeSpent: 25,
          gradingStatus: 'auto-graded'
        },
        results: []
      });
    }
  } catch (error) {
    console.error('Error fetching assessment results:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/assessments/attempts
// @desc    Get user's assessment attempts
// @access  Private
router.get('/attempts', auth, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const attempts = await AssessmentAttempt.find({ user: req.user.userId })
        .populate('assessment', 'title course category difficulty subject institution')
        .sort({ submittedAt: -1 });

      res.json(attempts);
    } else {
      // Mock data
      res.json([
        {
          _id: 'assessment-attempt-1',
          assessment: {
            _id: '507f1f77bcf86cd799439011',
            title: 'Mathematics Final Examination',
            course: 'Advanced Mathematics',
            category: 'Final Exam',
            difficulty: 'Advanced',
            subject: 'Mathematics',
            institution: 'University of Lagos'
          },
          score: 85,
          percentage: 85,
          passed: true,
          grade: 'B',
          timeSpent: 95,
          submittedAt: new Date('2024-01-15'),
          correctAnswers: 17,
          totalQuestions: 20,
          gradingStatus: 'auto-graded'
        },
        {
          _id: 'assessment-attempt-2',
          assessment: {
            _id: '507f1f77bcf86cd799439014',
            title: 'Computer Science Midterm',
            course: 'Computer Science 101',
            category: 'Midterm',
            difficulty: 'Intermediate',
            subject: 'Computer Science',
            institution: 'University of Lagos'
          },
          score: 72,
          percentage: 90,
          passed: true,
          grade: 'A-',
          timeSpent: 75,
          submittedAt: new Date('2024-01-10'),
          correctAnswers: 36,
          totalQuestions: 40,
          gradingStatus: 'auto-graded'
        }
      ]);
    }
  } catch (error) {
    console.error('Error fetching assessment attempts:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
