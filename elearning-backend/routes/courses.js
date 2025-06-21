const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const auth = require('../middleware/auth');

// Helper function to check if MongoDB is connected
const isMongoConnected = () => {
  return require('mongoose').connection.readyState === 1;
};

// Mock data for development (when MongoDB is not available)
const mockCourses = [
  {
    _id: '1',
    title: 'React Fundamentals',
    instructor: 'John Smith',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the basics of React including components, state, and props.',
    category: 'Web Development',
    duration: '8 weeks',
    rating: 4.8,
    badge: 'Popular',
    price: 99.99,
    originalPrice: 149.99,
    level: 'Beginner',
    students: 3245,
    language: 'English',
    lastUpdated: '2024-01-10',
    skills: ['React', 'JavaScript', 'HTML', 'CSS'],
    isFree: false,
    isActive: true,
    createdAt: new Date('2024-01-01')
  },
  {
    _id: '2',
    title: 'Advanced JavaScript',
    instructor: 'Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=800&q=80',
    description: 'Master advanced JavaScript concepts and modern ES6+ features.',
    category: 'Programming',
    duration: '10 weeks',
    rating: 4.9,
    badge: 'Top Rated',
    price: 129.99,
    originalPrice: 179.99,
    level: 'Advanced',
    students: 2156,
    language: 'English',
    lastUpdated: '2024-01-12',
    skills: ['JavaScript', 'ES6+', 'Async/Await', 'Promises'],
    isFree: false,
    isActive: true,
    createdAt: new Date('2024-01-02')
  },
  {
    _id: '3',
    title: 'Data Science Fundamentals',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the basics of data science, including Python, statistics, and visualization.',
    category: 'Data Science',
    duration: '6 weeks',
    rating: 4.7,
    badge: 'Popular',
    price: 149.99,
    originalPrice: 199.99,
    level: 'Beginner',
    students: 2847,
    language: 'English',
    lastUpdated: '2024-01-15',
    skills: ['Python', 'Statistics', 'Data Visualization', 'Pandas'],
    isFree: false,
    isActive: true,
    createdAt: new Date('2024-01-03')
  },
  {
    _id: '4',
    title: 'Introduction to Python',
    instructor: 'Michael Chen',
    image: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?auto=format&fit=crop&w=800&q=80',
    description: 'Start your programming journey with Python basics.',
    category: 'Programming',
    duration: '4 weeks',
    rating: 4.6,
    badge: 'New',
    price: 0,
    originalPrice: 79.99,
    level: 'Beginner',
    students: 4521,
    language: 'English',
    lastUpdated: '2024-01-18',
    skills: ['Python', 'Programming Basics', 'Variables', 'Functions'],
    isFree: true,
    isActive: true,
    createdAt: new Date('2024-01-04')
  },
  {
    _id: '5',
    title: 'UI/UX Design Principles',
    instructor: 'Lisa Wang',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the fundamentals of user interface and user experience design.',
    category: 'Design',
    duration: '5 weeks',
    rating: 4.5,
    badge: '',
    price: 89.99,
    originalPrice: 129.99,
    level: 'Intermediate',
    students: 1834,
    language: 'English',
    lastUpdated: '2024-01-20',
    skills: ['UI Design', 'UX Research', 'Prototyping', 'Figma'],
    isFree: false,
    isActive: true,
    createdAt: new Date('2024-01-05')
  }
];

// Mock filter functions
const filterMockCourses = (filters) => {
  let filtered = [...mockCourses];

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(course =>
      course.title.toLowerCase().includes(searchTerm) ||
      course.description.toLowerCase().includes(searchTerm) ||
      course.instructor.toLowerCase().includes(searchTerm) ||
      course.skills.some(skill => skill.toLowerCase().includes(searchTerm))
    );
  }

  if (filters.category && filters.category !== 'All') {
    filtered = filtered.filter(course => course.category === filters.category);
  }

  if (filters.level && filters.level !== 'All') {
    filtered = filtered.filter(course => course.level === filters.level);
  }

  if (filters.instructor && filters.instructor !== 'All') {
    filtered = filtered.filter(course => course.instructor === filters.instructor);
  }

  if (filters.isFree) {
    filtered = filtered.filter(course => course.isFree);
  }

  if (filters.priceRange && filters.priceRange !== 'All') {
    switch (filters.priceRange) {
      case 'free':
        filtered = filtered.filter(course => course.isFree);
        break;
      case 'under-50':
        filtered = filtered.filter(course => !course.isFree && course.price < 50);
        break;
      case '50-100':
        filtered = filtered.filter(course => !course.isFree && course.price >= 50 && course.price <= 100);
        break;
      case 'over-100':
        filtered = filtered.filter(course => !course.isFree && course.price > 100);
        break;
    }
  }

  return filtered;
};

const sortMockCourses = (courses, sortBy) => {
  const sorted = [...courses];

  switch (sortBy) {
    case 'title':
      return sorted.sort((a, b) => a.title.localeCompare(b.title));
    case 'price-low':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-high':
      return sorted.sort((a, b) => b.price - a.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'students':
      return sorted.sort((a, b) => b.students - a.students);
    case 'newest':
      return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    case 'popularity':
    default:
      return sorted.sort((a, b) => (b.students * b.rating) - (a.students * a.rating));
  }
};

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

    if (isMongoConnected()) {
      // Use MongoDB
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
    } else {
      // Use mock data for development
      let filtered = filterMockCourses(filters);
      let sorted = sortMockCourses(filtered, sortBy);

      // Apply pagination
      const skip = (page - 1) * limit;
      const paginatedCourses = sorted.slice(skip, skip + parseInt(limit));

      res.json({
        courses: paginatedCourses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(sorted.length / limit),
          total: sorted.length
        }
      });
    }
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
    if (isMongoConnected()) {
      const categories = await Course.distinct('category', { isActive: true });
      res.json(['All', ...categories]);
    } else {
      // Use mock data
      const categories = [...new Set(mockCourses.map(course => course.category))];
      res.json(['All', ...categories]);
    }
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
    if (isMongoConnected()) {
      const levels = await Course.distinct('level', { isActive: true });
      res.json(['All', ...levels]);
    } else {
      // Use mock data
      const levels = [...new Set(mockCourses.map(course => course.level))];
      res.json(['All', ...levels]);
    }
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
    if (isMongoConnected()) {
      const instructors = await Course.distinct('instructor', { isActive: true });
      res.json(['All', ...instructors]);
    } else {
      // Use mock data
      const instructors = [...new Set(mockCourses.map(course => course.instructor))];
      res.json(['All', ...instructors]);
    }
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
    if (isMongoConnected()) {
      const course = await Course.findById(req.params.id);

      if (!course || !course.isActive) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
    } else {
      // Use mock data
      const course = mockCourses.find(c => c._id === req.params.id);

      if (!course || !course.isActive) {
        return res.status(404).json({ message: 'Course not found' });
      }

      res.json(course);
    }
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
    if (isMongoConnected()) {
      const course = await Course.findById(req.params.id);

      if (!course || !course.isActive) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // Check if user is already enrolled
      const existingEnrollment = await Enrollment.findOne({
        user: req.user.userId,
        course: req.params.id
      });

      if (existingEnrollment) {
        return res.status(400).json({ message: 'Already enrolled in this course' });
      }

      // Calculate total lessons
      const totalLessons = course.curriculum.reduce((total, week) => total + week.lessons.length, 0);

      // Create enrollment
      const enrollment = new Enrollment({
        user: req.user.userId,
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
    } else {
      // Use mock data for development
      const course = mockCourses.find(c => c._id === req.params.id);

      if (!course || !course.isActive) {
        return res.status(404).json({ message: 'Course not found' });
      }

      // For demo mode, just return success
      res.json({
        message: 'Successfully enrolled in course (demo mode)',
        enrollment: {
          _id: 'demo-enrollment-' + Date.now(),
          user: req.user.userId,
          course: req.params.id,
          enrolledAt: new Date(),
          status: 'enrolled',
          progress: 0
        }
      });
    }
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
      user: req.user.userId,
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
      user: req.user.userId,
      course: req.params.id
    });

    if (!enrollment) {
      return res.status(400).json({ message: 'Must be enrolled to review course' });
    }

    // Check if user already reviewed
    const existingReview = course.reviews.find(
      review => review.user.toString() === req.user.userId
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this course' });
    }

    // Add review
    course.reviews.push({
      user: req.user.userId,
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
      user: req.user.userId,
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
