require('dotenv').config();
const mongoose = require('mongoose');
const Course = require('../models/Course');

const sampleCourses = [
  {
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
          { title: 'What is Data Science?', description: 'Overview of data science field', order: 1 },
          { title: 'Setting up Python Environment', description: 'Installing Python and required libraries', order: 2 },
          { title: 'Basic Python for Data Science', description: 'Python basics for data analysis', order: 3 }
        ]
      },
      {
        week: 2,
        title: 'Data Collection and Cleaning',
        lessons: [
          { title: 'Data Sources', description: 'Understanding different data sources', order: 1 },
          { title: 'Data Cleaning Techniques', description: 'Methods for cleaning messy data', order: 2 },
          { title: 'Handling Missing Data', description: 'Strategies for dealing with missing values', order: 3 }
        ]
      }
    ],
    badge: 'Popular'
  },
  {
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
          { title: 'Introduction to Design Thinking', description: 'Understanding the design process', order: 1 },
          { title: 'User Research Methods', description: 'Conducting effective user research', order: 2 },
          { title: 'Creating User Personas', description: 'Building detailed user personas', order: 3 }
        ]
      }
    ],
    badge: 'New'
  },
  {
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
          { title: 'Introduction to React', description: 'Understanding React and its ecosystem', order: 1 },
          { title: 'JSX and Components', description: 'Creating your first React components', order: 2 },
          { title: 'Props and State', description: 'Managing component data', order: 3 }
        ]
      }
    ],
    badge: ''
  },
  {
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
          { title: 'Installing Python', description: 'Setting up your development environment', order: 1 },
          { title: 'Your First Python Program', description: 'Writing and running Python code', order: 2 },
          { title: 'Variables and Data Types', description: 'Understanding Python data types', order: 3 }
        ]
      }
    ],
    badge: 'Popular'
  }
];

async function seedCourses() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing courses
    await Course.deleteMany({});
    console.log('Cleared existing courses');

    // Insert sample courses
    const courses = await Course.insertMany(sampleCourses);
    console.log(`Inserted ${courses.length} courses`);

    console.log('Course seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding courses:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedCourses();
