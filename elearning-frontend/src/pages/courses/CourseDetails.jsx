import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { courseAPI, handleAPIError } from '../../services/api';

// Mock course data (in real app, this would come from API)
const courseData = {
  3: {
    id: 3,
    title: 'Data Science Fundamentals',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the basics of data science, including Python, statistics, and visualization.',
    fullDescription: 'This comprehensive course covers the fundamental concepts of data science, providing you with the essential skills needed to analyze and interpret data. You\'ll learn Python programming, statistical analysis, data visualization techniques, and how to work with popular libraries like Pandas, NumPy, and Matplotlib.',
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
    curriculum: [
      {
        week: 1,
        title: 'Introduction to Data Science',
        lessons: ['What is Data Science?', 'Setting up Python Environment', 'Basic Python for Data Science']
      },
      {
        week: 2,
        title: 'Data Collection and Cleaning',
        lessons: ['Data Sources', 'Data Cleaning Techniques', 'Handling Missing Data']
      },
      {
        week: 3,
        title: 'Exploratory Data Analysis',
        lessons: ['Statistical Measures', 'Data Distribution', 'Correlation Analysis']
      },
      {
        week: 4,
        title: 'Data Visualization',
        lessons: ['Matplotlib Basics', 'Seaborn for Statistical Plots', 'Interactive Visualizations']
      },
      {
        week: 5,
        title: 'Introduction to Machine Learning',
        lessons: ['Supervised vs Unsupervised Learning', 'Linear Regression', 'Classification Basics']
      },
      {
        week: 6,
        title: 'Final Project',
        lessons: ['Project Planning', 'Data Analysis Project', 'Presentation and Review']
      }
    ],
    requirements: [
      'Basic computer skills',
      'No prior programming experience required',
      'Access to a computer with internet connection'
    ],
    whatYouWillLearn: [
      'Python programming fundamentals',
      'Statistical analysis techniques',
      'Data visualization with Matplotlib and Seaborn',
      'Data cleaning and preprocessing',
      'Exploratory data analysis',
      'Basic machine learning concepts'
    ],
    instructorBio: 'Dr. Emily Rodriguez is a data scientist with over 10 years of experience in the field. She holds a PhD in Statistics from Stanford University and has worked with major tech companies including Google and Microsoft. She is passionate about making data science accessible to everyone.',
    reviews: [
      {
        id: 1,
        name: 'John Smith',
        rating: 5,
        comment: 'Excellent course! Dr. Rodriguez explains complex concepts in a very understandable way.',
        date: '2024-01-20'
      },
      {
        id: 2,
        name: 'Sarah Johnson',
        rating: 4,
        comment: 'Great introduction to data science. The hands-on projects were very helpful.',
        date: '2024-01-18'
      }
    ]
  }
  // Add more courses as needed
};

function CourseDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolled, setEnrolled] = useState(false);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const courseData = await courseAPI.getCourse(id);
        setCourse(courseData);
        setError(null);
      } catch (err) {
        console.error('Error fetching course:', err);
        setError(handleAPIError(err));
        // Fallback to mock data
        setCourse(courseData[id] || null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCourse();
    }
  }, [id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Course Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The course you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses/available" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Back to Available Courses
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = async () => {
    try {
      await courseAPI.enrollInCourse(id);
      setEnrolled(true);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      // For demo purposes, still set as enrolled
      setEnrolled(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Demo Mode Banner */}
        {error && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Demo Mode</h3>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">Backend service is not available. Showing sample data for demonstration.</p>
              </div>
            </div>
          </div>
        )}

        {/* Breadcrumb */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li>/</li>
            <li><Link to="/courses/available" className="hover:text-blue-600">Courses</Link></li>
            <li>/</li>
            <li className="text-gray-800 dark:text-white">{course.title}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Course Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden mb-6">
              <img src={course.image} alt={course.title} className="w-full h-64 object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm font-medium">
                    {course.category}
                  </span>
                  {course.badge && (
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {course.badge}
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">{course.title}</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{course.fullDescription}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center">
                    <span className="text-yellow-400 mr-1">★</span>
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <span>•</span>
                  <span>{course.students.toLocaleString()} students</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                  <span>•</span>
                  <span>{course.level}</span>
                  <span>•</span>
                  <span>{course.language}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg">
              <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="flex space-x-8 px-6">
                  {['overview', 'curriculum', 'instructor', 'reviews'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                        activeTab === tab
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'overview' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">What you'll learn</h3>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-6">
                      {course.whatYouWillLearn.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600 dark:text-gray-300">{item}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Requirements</h3>
                    <ul className="space-y-2 mb-6">
                      {course.requirements.map((req, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-blue-500 mr-2">•</span>
                          <span className="text-gray-600 dark:text-gray-300">{req}</span>
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Skills you'll gain</h3>
                    <div className="flex flex-wrap gap-2">
                      {course.skills.map((skill, index) => (
                        <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-sm">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'curriculum' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Course Curriculum</h3>
                    <div className="space-y-4">
                      {course.curriculum.map((week, index) => (
                        <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                          <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
                            Week {week.week}: {week.title}
                          </h4>
                          <ul className="space-y-1">
                            {week.lessons.map((lesson, lessonIndex) => (
                              <li key={lessonIndex} className="text-gray-600 dark:text-gray-300 text-sm">
                                {lessonIndex + 1}. {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'instructor' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">About the Instructor</h3>
                    <div className="flex items-start space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                        {course.instructor.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-800 dark:text-white">{course.instructor}</h4>
                        <p className="text-gray-600 dark:text-gray-300 mt-2">{course.instructorBio}</p>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Student Reviews</h3>
                    <div className="space-y-4">
                      {course.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-gray-800 dark:text-white">{review.name}</h4>
                            <div className="flex items-center">
                              <span className="text-yellow-400 mr-1">{'★'.repeat(review.rating)}</span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">{review.date}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 sticky top-8">
              <div className="text-center mb-6">
                {course.isFree ? (
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">FREE</div>
                ) : (
                  <div>
                    <div className="text-3xl font-bold text-gray-800 dark:text-white">${course.price}</div>
                    {course.originalPrice > course.price && (
                      <div className="text-lg text-gray-500 dark:text-gray-400 line-through">${course.originalPrice}</div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolled}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {enrolled ? '✓ Enrolled' : 'Enroll Now'}
              </button>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-800 dark:text-white">{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Level:</span>
                  <span className="text-gray-800 dark:text-white">{course.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Language:</span>
                  <span className="text-gray-800 dark:text-white">{course.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Students:</span>
                  <span className="text-gray-800 dark:text-white">{course.students.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Last Updated:</span>
                  <span className="text-gray-800 dark:text-white">{new Date(course.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
