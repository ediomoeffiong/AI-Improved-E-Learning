import React, { useState, useEffect } from 'react';
import AvailableCoursesSection from './AvailableCoursesSection';
import { courseAPI, handleAPIError } from '../../services/api';

// Fallback mock data (used only if API fails)
const allAvailableCourses = [
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
  },
  {
    id: 4,
    title: 'UI/UX Design Principles',
    instructor: 'Ms. Laura Kim',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    description: 'Master the fundamentals of user interface and user experience design.',
    category: 'Design',
    duration: '4 weeks',
    rating: 4.5,
    badge: 'New',
    price: 89.99,
    originalPrice: 129.99,
    level: 'Intermediate',
    students: 1523,
    language: 'English',
    lastUpdated: '2024-02-20',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    isFree: false,
  },
  {
    id: 5,
    title: 'Machine Learning Basics',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
    description: 'A hands-on introduction to machine learning concepts and algorithms.',
    category: 'Data Science',
    duration: '8 weeks',
    rating: 4.8,
    badge: 'Top Rated',
    price: 199.99,
    originalPrice: 299.99,
    level: 'Advanced',
    students: 3421,
    language: 'English',
    lastUpdated: '2024-01-10',
    skills: ['Python', 'TensorFlow', 'Scikit-learn', 'Neural Networks'],
    isFree: false,
  },
  {
    id: 6,
    title: 'Frontend Development with React',
    instructor: 'Prof. Michael Chen',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    description: 'Build modern web apps using React and best practices.',
    category: 'Web Development',
    duration: '5 weeks',
    rating: 4.6,
    badge: '',
    price: 0,
    originalPrice: 0,
    level: 'Intermediate',
    students: 4567,
    language: 'English',
    lastUpdated: '2024-03-01',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Redux'],
    isFree: true,
  },
  {
    id: 7,
    title: 'Digital Marketing Essentials',
    instructor: 'Ms. Laura Kim',
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
    description: 'Learn the core skills for digital marketing and social media.',
    category: 'Marketing',
    duration: '3 weeks',
    rating: 4.3,
    badge: '',
    price: 79.99,
    originalPrice: 99.99,
    level: 'Beginner',
    students: 1876,
    language: 'English',
    lastUpdated: '2024-02-15',
    skills: ['SEO', 'Social Media', 'Google Analytics', 'Content Marketing'],
    isFree: false,
  },
  {
    id: 8,
    title: 'Python for Everybody',
    instructor: 'Dr. Sarah Johnson',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    description: 'A beginner-friendly course to learn Python programming.',
    category: 'Programming',
    duration: '6 weeks',
    rating: 4.9,
    badge: 'Popular',
    price: 0,
    originalPrice: 0,
    level: 'Beginner',
    students: 8934,
    language: 'English',
    lastUpdated: '2024-02-28',
    skills: ['Python', 'Programming Basics', 'Data Structures', 'Algorithms'],
    isFree: true,
  },
  {
    id: 9,
    title: 'Cloud Computing Fundamentals',
    instructor: 'Dr. Emily Rodriguez',
    image: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    description: 'Understand the basics of cloud services and deployment.',
    category: 'IT',
    duration: '4 weeks',
    rating: 4.4,
    badge: '',
    price: 129.99,
    originalPrice: 179.99,
    level: 'Intermediate',
    students: 2156,
    language: 'English',
    lastUpdated: '2024-01-20',
    skills: ['AWS', 'Azure', 'Docker', 'Kubernetes'],
    isFree: false,
  },
];

const categories = [
  'All',
  ...Array.from(new Set(allAvailableCourses.map((c) => c.category)))
];

const levels = [
  'All',
  ...Array.from(new Set(allAvailableCourses.map((c) => c.level)))
];

const instructors = [
  'All',
  ...Array.from(new Set(allAvailableCourses.map((c) => c.instructor)))
];

function Available() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All');
  const [instructor, setInstructor] = useState('All');
  const [priceRange, setPriceRange] = useState('All');
  const [sortBy, setSortBy] = useState('popularity');
  const [showFreeOnly, setShowFreeOnly] = useState(false);
  const [modalCourse, setModalCourse] = useState(null);
  const [enrolled, setEnrolled] = useState([]); // ids of enrolled courses
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // API state
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState(['All']);
  const [levels, setLevels] = useState(['All']);
  const [instructors, setInstructors] = useState(['All']);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesData, levelsData, instructorsData] = await Promise.all([
          courseAPI.getCategories(),
          courseAPI.getLevels(),
          courseAPI.getInstructors()
        ]);

        setCategories(categoriesData);
        setLevels(levelsData);
        setInstructors(instructorsData);
      } catch (err) {
        console.error('Error fetching initial data:', err);
        setError(handleAPIError(err));
      }
    };

    fetchInitialData();
  }, []);

  // Fetch courses when filters change
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const filters = {
          search: search || undefined,
          category: category !== 'All' ? category : undefined,
          level: level !== 'All' ? level : undefined,
          instructor: instructor !== 'All' ? instructor : undefined,
          priceRange: priceRange !== 'All' ? priceRange : undefined,
          sortBy,
          showFreeOnly: showFreeOnly || undefined
        };

        const response = await courseAPI.getCourses(filters);
        setCourses(response.courses || response); // Handle both paginated and non-paginated responses
        setError(null);
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError(handleAPIError(err));
        setCourses([]); // Set empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [search, category, level, instructor, priceRange, sortBy, showFreeOnly]);

  // Use courses from API (filtering and sorting is handled by backend)
  const filteredAndSortedCourses = courses;

  // Enroll handler
  const handleEnroll = async (course) => {
    if (enrolled.includes(course.id)) return;

    try {
      await courseAPI.enrollInCourse(course.id);
      setEnrolled([...enrolled, course.id]);
      setToastMsg(`Successfully enrolled in "${course.title}"!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      console.error('Error enrolling in course:', err);
      setToastMsg(handleAPIError(err));
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading courses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">Error Loading Courses</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-[1920px]">
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

        <AvailableCoursesSection
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          categories={categories}
          level={level}
          setLevel={setLevel}
          levels={levels}
          instructor={instructor}
          setInstructor={setInstructor}
          instructors={instructors}
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          sortBy={sortBy}
          setSortBy={setSortBy}
          showFreeOnly={showFreeOnly}
          setShowFreeOnly={setShowFreeOnly}
          filteredCourses={filteredAndSortedCourses}
          handleEnroll={handleEnroll}
          enrolled={enrolled}
          setModalCourse={setModalCourse}
        />

        {/* Course Details Modal */}
        {modalCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
              <button
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 text-2xl hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                onClick={() => setModalCourse(null)}
              >
                &times;
              </button>
              <img src={modalCourse.image} alt={modalCourse.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{modalCourse.title}</h3>
              <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-2 gap-2">
                <span>{modalCourse.instructor}</span>
                <span>•</span>
                <span>{modalCourse.category}</span>
                <span>•</span>
                <span>{modalCourse.duration}</span>
              </div>
              <div className="flex items-center mb-2">
                <span className="text-yellow-400 mr-1">{'★'.repeat(Math.floor(modalCourse.rating))}</span>
                <span className="text-gray-500 dark:text-gray-400 text-xs">{modalCourse.rating}</span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{modalCourse.description}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => { handleEnroll(modalCourse); setModalCourse(null); }}
                  disabled={enrolled.includes(modalCourse.id)}
                >
                  {enrolled.includes(modalCourse.id) ? 'Enrolled' : 'Enroll'}
                </button>
                <button
                  className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors"
                  onClick={() => setModalCourse(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
            <div className="flex items-center">
              <span className="mr-2">✓</span>
              {toastMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Available; 