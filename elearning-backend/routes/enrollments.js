const express = require('express');
const router = express.Router();
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const auth = require('../middleware/auth');
const { manualTrackCourse } = require('../middleware/activityTracker');

// @route   GET /api/enrollments
// @desc    Get user's enrollments
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const { status, sortBy = 'recent' } = req.query;

    let query = Enrollment.find({ user: req.user.userId }).populate('course');

    // Filter by status if provided
    if (status && status !== 'all') {
      if (status === 'in-progress') {
        query = query.where('status').in(['enrolled', 'in-progress']);
      } else if (status === 'completed') {
        query = query.where('status').equals('completed');
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'title':
        query = query.sort({ 'course.title': 1 });
        break;
      case 'progress':
        query = query.sort({ progress: -1 });
        break;
      case 'recent':
      default:
        query = query.sort({ lastAccessed: -1 });
        break;
    }

    const enrollments = await query;

    // Transform data to match frontend expectations
    const transformedEnrollments = enrollments.map(enrollment => ({
      id: enrollment.course._id,
      title: enrollment.course.title,
      instructor: enrollment.course.instructor,
      image: enrollment.course.image,
      category: enrollment.course.category,
      duration: enrollment.course.duration,
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      totalLessons: enrollment.totalLessons,
      lastAccessed: enrollment.lastAccessed,
      status: enrollment.status === 'completed' ? 'Completed' : 'In Progress',
      grade: enrollment.grade,
      certificate: enrollment.certificateIssued,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      nextClass: enrollment.status !== 'completed' ? getNextClass(enrollment) : null
    }));

    res.json(transformedEnrollments);
  } catch (error) {
    console.error('Error fetching enrollments:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/stats
// @desc    Get user's enrollment statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user.userId });

    const stats = {
      totalCourses: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      inProgressCourses: enrollments.filter(e => ['enrolled', 'in-progress'].includes(e.status)).length,
      certificates: enrollments.filter(e => e.certificateIssued).length,
      totalTimeSpent: enrollments.reduce((total, e) => total + e.totalTimeSpent, 0),
      averageProgress: enrollments.length > 0 
        ? Math.round(enrollments.reduce((total, e) => total + e.progress, 0) / enrollments.length)
        : 0
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching enrollment stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/enrollments/:courseId
// @desc    Get specific enrollment details
// @access  Private
router.get('/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    res.json(enrollment);
  } catch (error) {
    console.error('Error fetching enrollment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/enrollments/:courseId/progress
// @desc    Update course progress
// @access  Private
router.put('/:courseId/progress', auth, async (req, res) => {
  try {
    const { lessonId, completed, timeSpent = 0 } = req.body;

    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Find the lesson progress
    const lessonProgress = enrollment.lessonProgress.find(
      p => p.lessonId.toString() === lessonId
    );

    if (!lessonProgress) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Update lesson progress
    if (completed && !lessonProgress.isCompleted) {
      lessonProgress.isCompleted = true;
      lessonProgress.completedAt = new Date();
      lessonProgress.timeSpent = timeSpent;
      enrollment.totalTimeSpent += timeSpent;
    } else if (!completed && lessonProgress.isCompleted) {
      lessonProgress.isCompleted = false;
      lessonProgress.completedAt = null;
      enrollment.totalTimeSpent -= lessonProgress.timeSpent;
      lessonProgress.timeSpent = 0;
    }

    await enrollment.updateProgress();

    // Track course activity if lesson was completed
    if (completed && lessonProgress.isCompleted) {
      await manualTrackCourse(req.user.userId, req.params.courseId, {
        enrollmentId: enrollment._id,
        completedLessons: 1,
        timeSpent: timeSpent
      });
    }

    res.json({
      message: 'Progress updated successfully',
      progress: enrollment.progress,
      completedLessons: enrollment.completedLessons,
      status: enrollment.status
    });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/enrollments/:courseId/certificate
// @desc    Issue certificate for completed course
// @access  Private
router.post('/:courseId/certificate', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      course: req.params.courseId
    }).populate('course');

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    if (enrollment.status !== 'completed') {
      return res.status(400).json({ message: 'Course must be completed to issue certificate' });
    }

    if (enrollment.certificateIssued) {
      return res.status(400).json({ message: 'Certificate already issued' });
    }

    // Issue certificate
    enrollment.certificateIssued = true;
    enrollment.certificateIssuedAt = new Date();
    await enrollment.save();

    res.json({
      message: 'Certificate issued successfully',
      certificateId: enrollment._id,
      issuedAt: enrollment.certificateIssuedAt
    });
  } catch (error) {
    console.error('Error issuing certificate:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/enrollments/:courseId
// @desc    Unenroll from a course
// @access  Private
router.delete('/:courseId', auth, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user.userId,
      course: req.params.courseId
    });

    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }

    // Update course student count
    const course = await Course.findById(req.params.courseId);
    if (course && course.students > 0) {
      course.students -= 1;
      await course.save();
    }

    // Remove enrollment
    await Enrollment.findByIdAndDelete(enrollment._id);

    res.json({ message: 'Successfully unenrolled from course' });
  } catch (error) {
    console.error('Error unenrolling from course:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to calculate next class time (mock implementation)
function getNextClass(enrollment) {
  // This is a mock implementation
  // In a real app, you'd have actual class schedules
  const now = new Date();
  const nextClass = new Date(now.getTime() + (24 * 60 * 60 * 1000)); // Tomorrow
  
  const options = { 
    weekday: 'long', 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  };
  
  return nextClass.toLocaleDateString('en-US', options);
}

module.exports = router;
