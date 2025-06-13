// Mock data service to provide fallback data when backend is not available

export const mockCourses = [
  {
    _id: '1',
    title: 'Data Science Fundamentals',
    description: 'Learn the basics of data science, including Python, statistics, and visualization.',
    fullDescription: 'This comprehensive course covers the fundamental concepts of data science, providing you with the essential skills needed to analyze and interpret data. You\'ll learn Python programming, statistical analysis, data visualization techniques, and how to work with popular libraries like Pandas, NumPy, and Matplotlib.',
    instructor: 'Dr. Emily Rodriguez',
    instructorBio: 'Dr. Emily Rodriguez is a data scientist with over 10 years of experience in the field. She holds a PhD in Statistics from Stanford University and has worked with major tech companies including Google and Microsoft.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    category: 'Data Science',
    level: 'Beginner',
    duration: '6 weeks',
    price: 149.99,
    originalPrice: 199.99,
    isFree: false,
    rating: 4.7,
    students: 2847,
    language: 'English',
    skills: ['Python', 'Statistics', 'Data Visualization', 'Pandas'],
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
    curriculum: [
      {
        week: 1,
        title: 'Introduction to Data Science',
        lessons: [
          { _id: 'l1', title: 'What is Data Science?', description: 'Overview of data science field', order: 1 },
          { _id: 'l2', title: 'Setting up Python Environment', description: 'Installing Python and required libraries', order: 2 },
          { _id: 'l3', title: 'Basic Python for Data Science', description: 'Python basics for data analysis', order: 3 }
        ]
      },
      {
        week: 2,
        title: 'Data Collection and Cleaning',
        lessons: [
          { _id: 'l4', title: 'Data Sources', description: 'Understanding different data sources', order: 1 },
          { _id: 'l5', title: 'Data Cleaning Techniques', description: 'Methods for cleaning messy data', order: 2 },
          { _id: 'l6', title: 'Handling Missing Data', description: 'Strategies for dealing with missing values', order: 3 }
        ]
      }
    ],
    reviews: [
      {
        _id: 'r1',
        name: 'John Smith',
        rating: 5,
        comment: 'Excellent course! Dr. Rodriguez explains complex concepts in a very understandable way.',
        date: '2024-01-20'
      },
      {
        _id: 'r2',
        name: 'Sarah Johnson',
        rating: 4,
        comment: 'Great introduction to data science. The hands-on projects were very helpful.',
        date: '2024-01-18'
      }
    ],
    badge: 'Popular',
    isActive: true,
    createdAt: '2024-01-01',
    lastUpdated: '2024-01-15'
  },
  {
    _id: '2',
    title: 'UI/UX Design Principles',
    description: 'Master the fundamentals of user interface and user experience design.',
    fullDescription: 'Learn the essential principles of UI/UX design through hands-on projects and real-world examples. This course covers design thinking, user research, wireframing, prototyping, and design systems.',
    instructor: 'Ms. Laura Kim',
    instructorBio: 'Laura Kim is a senior UX designer with 8 years of experience at top design agencies. She has worked on projects for Fortune 500 companies and startups alike.',
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    category: 'Design',
    level: 'Intermediate',
    duration: '4 weeks',
    price: 89.99,
    originalPrice: 129.99,
    isFree: false,
    rating: 4.5,
    students: 1523,
    language: 'English',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    requirements: [
      'Basic design knowledge helpful but not required',
      'Access to Figma (free account available)',
      'Creative mindset and attention to detail'
    ],
    whatYouWillLearn: [
      'Design thinking methodology',
      'User research techniques',
      'Wireframing and prototyping',
      'Visual design principles',
      'Usability testing',
      'Design system creation'
    ],
    curriculum: [
      {
        week: 1,
        title: 'Design Thinking & User Research',
        lessons: [
          { _id: 'l7', title: 'Introduction to Design Thinking', description: 'Understanding the design process', order: 1 },
          { _id: 'l8', title: 'User Research Methods', description: 'Conducting effective user research', order: 2 },
          { _id: 'l9', title: 'Creating User Personas', description: 'Building detailed user personas', order: 3 }
        ]
      }
    ],
    reviews: [],
    badge: 'New',
    isActive: true,
    createdAt: '2024-02-01',
    lastUpdated: '2024-02-20'
  },
  {
    _id: '3',
    title: 'Frontend Development with React',
    description: 'Build modern web apps using React and best practices.',
    fullDescription: 'Master React development from basics to advanced concepts. Learn hooks, state management, routing, and how to build scalable React applications.',
    instructor: 'Prof. Michael Chen',
    instructorBio: 'Michael Chen is a full-stack developer and computer science professor with expertise in modern web technologies. He has contributed to several open-source React projects.',
    image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
    category: 'Web Development',
    level: 'Intermediate',
    duration: '5 weeks',
    price: 0,
    originalPrice: 0,
    isFree: true,
    rating: 4.6,
    students: 4567,
    language: 'English',
    skills: ['React', 'JavaScript', 'HTML/CSS', 'Redux'],
    requirements: [
      'Basic JavaScript knowledge',
      'Understanding of HTML and CSS',
      'Familiarity with ES6+ features'
    ],
    whatYouWillLearn: [
      'React fundamentals and JSX',
      'Component lifecycle and hooks',
      'State management with Redux',
      'React Router for navigation',
      'Testing React applications',
      'Performance optimization'
    ],
    curriculum: [
      {
        week: 1,
        title: 'React Fundamentals',
        lessons: [
          { _id: 'l10', title: 'Introduction to React', description: 'Understanding React and its ecosystem', order: 1 },
          { _id: 'l11', title: 'JSX and Components', description: 'Creating your first React components', order: 2 },
          { _id: 'l12', title: 'Props and State', description: 'Managing component data', order: 3 }
        ]
      }
    ],
    reviews: [],
    badge: '',
    isActive: true,
    createdAt: '2024-01-15',
    lastUpdated: '2024-03-01'
  },
  {
    _id: '4',
    title: 'Python for Everybody',
    description: 'A beginner-friendly course to learn Python programming.',
    fullDescription: 'Start your programming journey with Python. This course covers Python basics, data structures, algorithms, and practical applications.',
    instructor: 'Dr. Sarah Johnson',
    instructorBio: 'Dr. Sarah Johnson is a computer science professor and Python expert with over 15 years of teaching experience. She has authored several programming textbooks.',
    image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    category: 'Programming',
    level: 'Beginner',
    duration: '6 weeks',
    price: 0,
    originalPrice: 0,
    isFree: true,
    rating: 4.9,
    students: 8934,
    language: 'English',
    skills: ['Python', 'Programming Basics', 'Data Structures', 'Algorithms'],
    requirements: [
      'No prior programming experience required',
      'Basic computer literacy',
      'Willingness to learn and practice'
    ],
    whatYouWillLearn: [
      'Python syntax and fundamentals',
      'Data types and variables',
      'Control structures and loops',
      'Functions and modules',
      'Object-oriented programming',
      'File handling and error management'
    ],
    curriculum: [
      {
        week: 1,
        title: 'Getting Started with Python',
        lessons: [
          { _id: 'l13', title: 'Installing Python', description: 'Setting up your development environment', order: 1 },
          { _id: 'l14', title: 'Your First Python Program', description: 'Writing and running Python code', order: 2 },
          { _id: 'l15', title: 'Variables and Data Types', description: 'Understanding Python data types', order: 3 }
        ]
      }
    ],
    reviews: [],
    badge: 'Popular',
    isActive: true,
    createdAt: '2024-01-01',
    lastUpdated: '2024-02-28'
  },
  {
    _id: '5',
    title: 'Digital Marketing Essentials',
    description: 'Learn the core skills for digital marketing and social media.',
    fullDescription: 'Master digital marketing strategies including SEO, social media marketing, content marketing, and analytics to grow your business online.',
    instructor: 'Ms. Laura Kim',
    image: 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=800&q=80',
    category: 'Marketing',
    level: 'Beginner',
    duration: '3 weeks',
    price: 79.99,
    originalPrice: 99.99,
    isFree: false,
    rating: 4.3,
    students: 1876,
    language: 'English',
    skills: ['SEO', 'Social Media', 'Google Analytics', 'Content Marketing'],
    requirements: ['Basic computer skills', 'Interest in marketing'],
    whatYouWillLearn: ['SEO fundamentals', 'Social media strategy', 'Content creation', 'Analytics and reporting'],
    curriculum: [],
    reviews: [],
    badge: '',
    isActive: true,
    createdAt: '2024-02-01',
    lastUpdated: '2024-02-15'
  }
];

export const mockEnrollments = [
  {
    _id: 'e1',
    course: mockCourses[0],
    progress: 75,
    status: 'in-progress',
    completedLessons: 4,
    totalLessons: 6,
    lastAccessed: '2024-01-20',
    grade: 'A-',
    certificate: false,
    enrolledAt: '2024-01-01'
  },
  {
    _id: 'e2',
    course: mockCourses[2],
    progress: 100,
    status: 'completed',
    completedLessons: 3,
    totalLessons: 3,
    lastAccessed: '2024-01-15',
    grade: 'A',
    certificate: true,
    enrolledAt: '2024-01-01',
    completedAt: '2024-01-15'
  }
];

// Mock API functions
export const mockAPI = {
  getCourses: (filters = {}) => {
    let filtered = [...mockCourses];
    
    // Apply filters
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
    
    if (filters.showFreeOnly === 'true') {
      filtered = filtered.filter(course => course.isFree);
    }
    
    if (filters.priceRange && filters.priceRange !== 'All') {
      switch (filters.priceRange) {
        case 'Free':
          filtered = filtered.filter(course => course.isFree);
          break;
        case 'Under $50':
          filtered = filtered.filter(course => !course.isFree && course.price < 50);
          break;
        case '$50-$100':
          filtered = filtered.filter(course => !course.isFree && course.price >= 50 && course.price <= 100);
          break;
        case '$100-$200':
          filtered = filtered.filter(course => !course.isFree && course.price > 100 && course.price <= 200);
          break;
        case 'Over $200':
          filtered = filtered.filter(course => !course.isFree && course.price > 200);
          break;
      }
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'students':
        filtered.sort((a, b) => b.students - a.students);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'popularity':
      default:
        filtered.sort((a, b) => (b.students * b.rating) - (a.students * a.rating));
        break;
    }
    
    return Promise.resolve({ courses: filtered });
  },
  
  getCourse: (id) => {
    const course = mockCourses.find(c => c._id === id);
    return course ? Promise.resolve(course) : Promise.reject(new Error('Course not found'));
  },
  
  getCategories: () => Promise.resolve(['All', ...Array.from(new Set(mockCourses.map(c => c.category)))]),
  getLevels: () => Promise.resolve(['All', ...Array.from(new Set(mockCourses.map(c => c.level)))]),
  getInstructors: () => Promise.resolve(['All', ...Array.from(new Set(mockCourses.map(c => c.instructor)))]),
  
  enrollInCourse: (courseId) => Promise.resolve({ message: 'Successfully enrolled' }),
  
  getEnrollments: () => {
    const transformedEnrollments = mockEnrollments.map(enrollment => ({
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
      certificate: enrollment.certificate,
      enrolledAt: enrollment.enrolledAt,
      completedAt: enrollment.completedAt,
      nextClass: enrollment.status !== 'completed' ? 'Tomorrow, 10:00 AM' : null
    }));
    return Promise.resolve(transformedEnrollments);
  },

  // Mock authentication functions
  login: (credentials) => {
    // Simple mock login - accepts any email/password combination
    const mockUser = {
      id: '1',
      name: 'Demo User',
      email: credentials.email,
      role: 'student',
      avatar: 'https://via.placeholder.com/40'
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    return Promise.resolve({
      token: mockToken,
      user: mockUser,
      message: 'Login successful (using mock data)'
    });
  },

  register: (userData) => {
    // Simple mock registration
    const mockUser = {
      id: '1',
      name: userData.name,
      email: userData.email,
      role: 'student',
      avatar: 'https://via.placeholder.com/40'
    };

    const mockToken = 'mock-jwt-token-' + Date.now();

    return Promise.resolve({
      token: mockToken,
      user: mockUser,
      message: 'Registration successful (using mock data)'
    });
  },

  getCurrentUser: () => {
    const mockUser = {
      id: '1',
      name: 'Demo User',
      email: 'demo@example.com',
      role: 'student',
      avatar: 'https://via.placeholder.com/40'
    };

    return Promise.resolve(mockUser);
  }
};
