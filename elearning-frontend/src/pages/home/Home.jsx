import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI } from '../../services/api';

function Home() {
  const [featuredCourses, setFeaturedCourses] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 25000,
    totalCourses: 150,
    totalInstructors: 50,
    completionRate: 94
  });
  const [loading, setLoading] = useState(true);

  // Fetch featured courses
  useEffect(() => {
    const fetchFeaturedCourses = async () => {
      try {
        const response = await courseAPI.getCourses({ sortBy: 'popularity', limit: 6 });
        setFeaturedCourses(response.courses || response);
      } catch (error) {
        // Fallback to mock data
        setFeaturedCourses([
          {
            _id: '1',
            title: 'Data Science Fundamentals',
            instructor: 'Dr. Emily Rodriguez',
            image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            rating: 4.7,
            students: 2847,
            price: 149.99,
            isFree: false,
            category: 'Data Science'
          },
          {
            _id: '2',
            title: 'Frontend Development with React',
            instructor: 'Prof. Michael Chen',
            image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80',
            rating: 4.6,
            students: 4567,
            price: 0,
            isFree: true,
            category: 'Web Development'
          },
          {
            _id: '3',
            title: 'Python for Everybody',
            instructor: 'Dr. Sarah Johnson',
            image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
            rating: 4.9,
            students: 8934,
            price: 0,
            isFree: true,
            category: 'Programming'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCourses();
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative isolate overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        {/* Background Pattern */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <svg className="absolute left-[max(50%,25rem)] top-0 h-[64rem] w-[128rem] -translate-x-1/2 stroke-gray-200 dark:stroke-gray-700 [mask-image:radial-gradient(64rem_64rem_at_top,white,transparent)]" aria-hidden="true">
            <defs>
              <pattern id="e813992c-7d03-4cc4-a2bd-151760b470a0" width={200} height={200} x="50%" y={-1} patternUnits="userSpaceOnUse">
                <path d="M100 200V.5M.5 .5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#e813992c-7d03-4cc4-a2bd-151760b470a0)" />
          </svg>
        </div>

        <div className="mx-auto max-w-7xl px-6 pt-10 pb-24 sm:pb-32 lg:flex lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8">
            <div className="mt-24 sm:mt-32 lg:mt-16">
              <div className="inline-flex space-x-6">
                <span className="rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 px-4 py-2 text-sm font-semibold leading-6 text-blue-600 dark:text-blue-400 ring-1 ring-inset ring-blue-600/20 backdrop-blur-sm">
                  🎉 New AI-Enhanced Courses Available
                </span>
              </div>
            </div>
            <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Master New Skills with
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> AI-Powered</span> Learning
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Join thousands of learners advancing their careers with our interactive courses, personalized AI assistance, and expert-led instruction. Learn at your own pace, anywhere, anytime.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link
                to="/courses/available"
                className="group relative rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <span className="relative z-10">Start Learning Today</span>
                <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-700 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
              </Link>
              <Link
                to="/courses/dashboard"
                className="group text-sm font-semibold leading-6 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                Explore Dashboard
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="mt-16 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalStudents.toLocaleString()}+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCourses}+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalInstructors}+</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{stats.completionRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
            <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
                  alt="Students collaborating in modern learning environment"
                  className="w-[76rem] rounded-xl bg-gray-50 shadow-2xl ring-1 ring-gray-400/10"
                />
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 animate-bounce">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Live Learning</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg shadow-lg p-4">
                  <div className="text-sm font-medium">🏆 Certificate Ready</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Why Choose Our Platform</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Everything you need to accelerate your learning journey
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Our AI-enhanced platform combines interactive lessons, practical exercises, and personalized feedback to help you master new skills quickly and effectively.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  AI-Powered Learning
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Get personalized recommendations, adaptive learning paths, and intelligent tutoring that adjusts to your learning style and pace.
                </dd>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  Interactive Learning
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Engage with hands-on projects, interactive quizzes, and real-world simulations that make learning practical and memorable.
                </dd>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-green-500 to-green-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  Industry Certificates
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Earn recognized certificates upon completion that validate your skills and boost your career prospects in the job market.
                </dd>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  Expert Instructors
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Learn from industry professionals and academic experts who bring real-world experience and cutting-edge knowledge to every course.
                </dd>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  Flexible Schedule
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Learn at your own pace with 24/7 access to course materials, allowing you to balance learning with your work and personal life.
                </dd>
              </div>

              <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <dt className="text-xl font-semibold leading-7 text-gray-900 dark:text-white">
                  Community Support
                </dt>
                <dd className="mt-4 text-base leading-7 text-gray-600 dark:text-gray-300">
                  Join a vibrant community of learners, participate in discussions, get help from peers, and collaborate on projects.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Featured Courses Section */}
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Popular Courses
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Join thousands of students in our most popular and highly-rated courses
            </p>
          </div>

          {loading ? (
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-48 mb-4"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-3/4"></div>
                    <div className="bg-gray-200 dark:bg-gray-700 rounded h-4 w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {featuredCourses.slice(0, 3).map((course) => (
                <div key={course._id} className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <div className="relative">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                    {course.isFree && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                        FREE
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {course.instructor}
                    </p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="flex text-yellow-400 mr-2">
                          {'★'.repeat(Math.floor(course.rating))}
                          {'☆'.repeat(5 - Math.floor(course.rating))}
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {course.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {course.students.toLocaleString()} students
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {course.isFree ? 'Free' : `$${course.price}`}
                      </div>
                      <Link
                        to={`/courses/${course._id}`}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-12 text-center">
            <Link
              to="/courses/available"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 dark:text-blue-400 transition-colors"
            >
              View All Courses
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="py-24 sm:py-32 bg-gray-50 dark:bg-gray-800">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              What Our Students Say
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Real stories from learners who transformed their careers with our platform
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80"
                  alt="Sarah Chen"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah Chen</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Software Developer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "The AI-powered learning recommendations helped me focus on exactly what I needed to learn. I landed my dream job as a data scientist within 6 months!"
              </p>
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"
                  alt="Michael Rodriguez"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Michael Rodriguez</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">UX Designer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "The interactive projects and real-world applications made learning engaging. The certificate I earned opened doors to amazing opportunities."
              </p>
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80"
                  alt="Emily Johnson"
                  className="w-12 h-12 rounded-full mr-4"
                />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Emily Johnson</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Marketing Manager</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                "The flexibility to learn at my own pace while working full-time was perfect. The community support kept me motivated throughout my journey."
              </p>
              <div className="flex text-yellow-400">
                {'★'.repeat(5)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Career?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100">
              Join thousands of successful learners who have advanced their careers with our AI-enhanced learning platform. Start your journey today.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                to="/courses/available"
                className="rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-600 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 hover:scale-105"
              >
                Browse Courses
              </Link>
              <Link
                to="/register"
                className="rounded-lg border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-all duration-200"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;



