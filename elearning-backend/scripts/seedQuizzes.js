const mongoose = require('mongoose');
const Quiz = require('../models/Quiz');
require('dotenv').config();

const sampleQuizzes = [
  {
    title: 'JavaScript Fundamentals',
    description: 'Test your knowledge of JavaScript basics including variables, functions, and control flow.',
    instructor: 'Prof. Michael Chen',
    course: 'Frontend Development',
    category: 'Programming',
    difficulty: 'Beginner',
    timeLimit: 20,
    passingScore: 70,
    prerequisites: [],
    tags: ['javascript', 'basics', 'variables'],
    estimatedTime: '15-20 min',
    maxAttempts: 3,
    questions: [
      {
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
        question: 'JavaScript is a statically typed language.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'JavaScript is a dynamically typed language, meaning variable types are determined at runtime.',
        points: 1,
        order: 2
      },
      {
        question: 'Which of the following is NOT a JavaScript data type?',
        type: 'multiple-choice',
        options: [
          { text: 'String', isCorrect: false },
          { text: 'Boolean', isCorrect: false },
          { text: 'Integer', isCorrect: true },
          { text: 'Object', isCorrect: false }
        ],
        explanation: 'JavaScript has Number type, not separate Integer and Float types.',
        points: 1,
        order: 3
      }
    ]
  },
  {
    title: 'React Components & Props',
    description: 'Challenge yourself with questions about React components, props, and state management.',
    instructor: 'Prof. Michael Chen',
    course: 'Frontend Development',
    category: 'React',
    difficulty: 'Intermediate',
    timeLimit: 15,
    passingScore: 70,
    prerequisites: ['JavaScript Fundamentals'],
    tags: ['react', 'components', 'props'],
    estimatedTime: '12-15 min',
    maxAttempts: 3,
    questions: [
      {
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
      },
      {
        question: 'React components must return a single parent element.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: false },
          { text: 'False', isCorrect: true }
        ],
        explanation: 'React components can return multiple elements using React.Fragment or empty tags <>.',
        points: 1,
        order: 2
      }
    ]
  },
  {
    title: 'CSS Grid & Flexbox',
    description: 'Master advanced CSS layout techniques including Grid, Flexbox, and responsive design.',
    instructor: 'Dr. Sarah Johnson',
    course: 'Web Design',
    category: 'CSS',
    difficulty: 'Advanced',
    timeLimit: 25,
    passingScore: 75,
    prerequisites: ['CSS Basics'],
    tags: ['css', 'grid', 'flexbox', 'layout'],
    estimatedTime: '20-25 min',
    maxAttempts: 2,
    questions: [
      {
        question: 'Which CSS property is used to create a grid container?',
        type: 'multiple-choice',
        options: [
          { text: 'display: grid;', isCorrect: true },
          { text: 'grid-container: true;', isCorrect: false },
          { text: 'layout: grid;', isCorrect: false },
          { text: 'grid: container;', isCorrect: false }
        ],
        explanation: 'The display: grid; property creates a grid container.',
        points: 1,
        order: 1
      },
      {
        question: 'Flexbox is one-dimensional while Grid is two-dimensional.',
        type: 'true-false',
        options: [
          { text: 'True', isCorrect: true },
          { text: 'False', isCorrect: false }
        ],
        explanation: 'Flexbox works in one dimension (row or column) while Grid works in two dimensions (rows and columns).',
        points: 1,
        order: 2
      }
    ]
  }
];

async function seedQuizzes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB');

    // Clear existing quizzes
    await Quiz.deleteMany({});
    console.log('Cleared existing quizzes');

    // Insert sample quizzes
    const createdQuizzes = await Quiz.insertMany(sampleQuizzes);
    console.log(`Created ${createdQuizzes.length} sample quizzes`);

    console.log('Quiz seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding quizzes:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedQuizzes();
