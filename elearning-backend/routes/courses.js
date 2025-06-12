const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');

// @route   GET /api/courses
// @desc    Get all courses with filtering and sorting
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      search,
      category,
      level,
      instructor,
      priceRange,
      sortBy = 'popularity',
      showFreeOnly,
      page = 1,
      limit = 12
    } = req.query;

    // Build filter object
    const filters = {};
    
    if (search) filters.search = search;
    if (category && category !== 'All') filters.category = category;
    if (level && level !== 'All') filters.level = level;
    if (instructor && instructor !== 'All') filters.instructor = instructor;
    if (priceRange && priceRange !== 'All') filters.priceRange = priceRange;
    if (showFreeOnly === 'true') filters.isFree = true;

    // Get courses using the search method
    let query = Course.searchCourses(filters);

    // Apply sorting
    switch (sortBy) {
      case 'title':
        query = query.sort({ title: 1 });
        break;
      case 'price-low':
        query = query.sort({ price: 1 });
        break;
      case 'price-high':
        query = query.sort({ price: -1 });
        break;
      case 'rating':
        query = query.sort({ rating: -1 });
        break;
      case 'students':
        query = query.sort({ students: -1 });
        break;
      case 'newest':
        query = query.sort({ createdAt: -1 });
        break;
      case 'popularity':
      default:
        // Popularity based on students count and rating
        query = query.sort({ students: -1, rating: -1 });
        break;
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    const courses = await query.skip(skip).limit(parseInt(limit));
    
    // Get total count for pagination
    const total = await Course.countDocuments(Course.searchCourses(filters).getQuery());

    res.json({
      courses,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/categories
// @desc    Get all course categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    const categories = await Course.distinct('category', { isActive: true });
    res.json(['All', ...categories]);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/levels
// @desc    Get all course levels
// @access  Public
router.get('/levels', async (req, res) => {
  try {
    const levels = await Course.distinct('level', { isActive: true });
    res.json(['All', ...levels]);
  } catch (error) {
    console.error('Error fetching levels:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/instructors
// @desc    Get all instructors
// @access  Public
router.get('/instructors', async (req, res) => {
  try {
    const instructors = await Course.distinct('instructor', { isActive: true });
    res.json(['All', ...instructors]);
  } catch (error) {
    console.error('Error fetching instructors:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id
// @desc    Get course by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    console.error('Error fetching course:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/enroll
// @desc    Enroll in a course
// @access  Private
router.post('/:id/enroll', auth, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (existingEnrollment) {
      return res.status(400).json({ message: 'Already enrolled in this course' });
    }

    // Calculate total lessons
    const totalLessons = course.curriculum.reduce((total, week) => total + week.lessons.length, 0);

    // Create enrollment
    const enrollment = new Enrollment({
      user: req.user.id,
      course: req.params.id,
      totalLessons,
      lessonProgress: course.curriculum.flatMap(week => 
        week.lessons.map(lesson => ({
          weekNumber: week.week,
          lessonId: lesson._id,
          isCompleted: false
        }))
      )
    });

    await enrollment.save();

    // Update course student count
    course.students += 1;
    await course.save();

    res.json({ message: 'Successfully enrolled in course', enrollment });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/courses/:id/enrollment
// @desc    Get user's enrollment status for a course
// @access  Private
router.get('/:id/enrollment', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/courses/:id/review
// @desc    Add a review to a course
// @access  Private
router.post('/:id/review', auth, async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const course = await Course.findById(req.params.id);
    
    if (!course || !course.isActive) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(400).json({ message: 'Must be enrolled to review course' });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    // Add review
    course.reviews.push({
      user: req.user.id,
      name: req.user.name,
      rating,
      comment
    });

    await course.save();

    res.json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/courses/:id/lesson/:lessonId/complete
// @desc    Mark a lesson as completed
// @access  Private
router.put('/:id/lesson/:lessonId/complete', auth, async (req, res) => {
  try {
    const { timeSpent = 0 } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Not enrolled in this course' });
    }

    await enrollment.completeLesson(req.params.lessonId, timeSpent);

    res.json({ 
      message: 'Lesson marked as completed',
      progress: enrollment.progress 
    });
  } catch (error) {
    console.error('Error completing lesson:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
