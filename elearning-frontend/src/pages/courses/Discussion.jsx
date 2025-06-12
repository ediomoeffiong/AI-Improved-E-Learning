import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, handleAPIError } from '../../services/api';

// Mock data for discussions
const mockDiscussions = {
  categories: [
    { id: 'all', name: 'All Discussions', count: 45, icon: '💬' },
    { id: 'general', name: 'General', count: 12, icon: '🗣️' },
    { id: 'assignments', name: 'Assignments', count: 8, icon: '📝' },
    { id: 'technical', name: 'Technical Help', count: 15, icon: '🔧' },
    { id: 'projects', name: 'Projects', count: 6, icon: '🚀' },
    { id: 'announcements', name: 'Announcements', count: 4, icon: '📢' }
  ],
  threads: [
    {
      id: 1,
      title: 'How to implement React hooks in the final project?',
      content: 'I\'m struggling with implementing useState and useEffect in my final project. Can someone provide guidance on best practices?',
      author: {
        name: 'Sarah Chen',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80',
        role: 'Student',
        level: 'Intermediate'
      },
      course: 'Frontend Development with React',
      category: 'technical',
      replies: 12,
      views: 156,
      likes: 8,
      isLiked: false,
      isPinned: false,
      isSolved: true,
      createdAt: '2024-01-20T10:30:00Z',
      lastActivity: '2024-01-21T14:22:00Z',
      tags: ['react', 'hooks', 'javascript']
    },
    {
      id: 2,
      title: 'Assignment 3 - Data Visualization Requirements',
      content: 'Can someone clarify the requirements for the data visualization assignment? Specifically about the chart types we need to include.',
      author: {
        name: 'Michael Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        role: 'Student',
        level: 'Beginner'
      },
      course: 'Data Science Fundamentals',
      category: 'assignments',
      replies: 5,
      views: 89,
      likes: 3,
      isLiked: true,
      isPinned: true,
      isSolved: false,
      createdAt: '2024-01-19T16:45:00Z',
      lastActivity: '2024-01-21T09:15:00Z',
      tags: ['assignment', 'visualization', 'charts']
    },
    {
      id: 3,
      title: 'Study Group for Machine Learning Course',
      content: 'Looking to form a study group for the ML course. We can meet weekly to discuss concepts and work through problems together.',
      author: {
        name: 'Emily Johnson',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
        role: 'Student',
        level: 'Advanced'
      },
      course: 'Machine Learning Basics',
      category: 'general',
      replies: 18,
      views: 234,
      likes: 15,
      isLiked: false,
      isPinned: false,
      isSolved: false,
      createdAt: '2024-01-18T12:20:00Z',
      lastActivity: '2024-01-21T11:30:00Z',
      tags: ['study-group', 'collaboration', 'machine-learning']
    },
    {
      id: 4,
      title: 'New Course Materials Available - Week 5',
      content: 'Week 5 materials for all courses are now available. Please check your course materials section for the latest updates.',
      author: {
        name: 'Dr. Emily Rodriguez',
        avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
        role: 'Instructor',
        level: 'Expert'
      },
      course: 'Multiple Courses',
      category: 'announcements',
      replies: 3,
      views: 445,
      likes: 22,
      isLiked: true,
      isPinned: true,
      isSolved: false,
      createdAt: '2024-01-17T08:00:00Z',
      lastActivity: '2024-01-21T08:45:00Z',
      tags: ['announcement', 'materials', 'week-5']
    },
    {
      id: 5,
      title: 'Portfolio Project Showcase - Share Your Work!',
      content: 'This thread is for sharing your portfolio projects. Get feedback from peers and showcase your amazing work!',
      author: {
        name: 'Prof. Michael Chen',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        role: 'Instructor',
        level: 'Expert'
      },
      course: 'Web Development',
      category: 'projects',
      replies: 25,
      views: 567,
      likes: 31,
      isLiked: false,
      isPinned: true,
      isSolved: false,
      createdAt: '2024-01-15T14:30:00Z',
      lastActivity: '2024-01-21T16:20:00Z',
      tags: ['portfolio', 'showcase', 'feedback']
    }
  ],
  userStats: {
    totalPosts: 23,
    totalReplies: 67,
    reputation: 245,
    badges: ['Helper', 'Active Participant', 'Problem Solver']
  }
};

function Discussion() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [showNewThreadModal, setShowNewThreadModal] = useState(false);
  const [discussions, setDiscussions] = useState(mockDiscussions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch discussions data
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from the API
        // const discussionsData = await discussionAPI.getDiscussions();
        setDiscussions(mockDiscussions);
        setError(null);
      } catch (err) {
        console.error('Error fetching discussions:', err);
        setError(handleAPIError(err));
        setDiscussions(mockDiscussions);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscussions();
  }, []);

  // Filter and sort threads
  const filteredThreads = discussions.threads
    .filter(thread => {
      const matchesCategory = selectedCategory === 'all' || thread.category === selectedCategory;
      const matchesSearch = thread.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           thread.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           thread.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return new Date(b.lastActivity) - new Date(a.lastActivity);
        case 'popular':
          return b.likes - a.likes;
        case 'replies':
          return b.replies - a.replies;
        case 'views':
          return b.views - a.views;
        default:
          return new Date(b.lastActivity) - new Date(a.lastActivity);
      }
    });

  const getTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'Instructor':
        return 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400';
      case 'TA':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400';
      case 'Student':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Expert':
        return 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400';
      case 'Advanced':
        return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400';
      case 'Intermediate':
        return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'Beginner':
        return 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading discussions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Demo Mode Banner */}
      {error && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800 p-4">
          <div className="container mx-auto px-4 max-w-7xl">
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
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">Course Discussions</h1>
              <p className="text-gray-600 dark:text-gray-400">Connect with peers, ask questions, and share knowledge</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowNewThreadModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                New Discussion
              </button>
              <Link
                to="/courses/dashboard"
                className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Categories */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Categories</h3>
                <div className="space-y-2">
                  {discussions.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between ${
                        selectedCategory === category.id
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-2 border-blue-200 dark:border-blue-700'
                          : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 border-2 border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <span className="text-sm bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                        {category.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Your Activity</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Posts</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{discussions.userStats.totalPosts}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Replies</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{discussions.userStats.totalReplies}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Reputation</span>
                    <span className="font-semibold text-blue-600 dark:text-blue-400">{discussions.userStats.reputation}</span>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-white mb-2">Badges</h4>
                  <div className="flex flex-wrap gap-1">
                    {discussions.userStats.badges.map((badge, index) => (
                      <span key={index} className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-2 py-1 rounded-full">
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search discussions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="popular">Most Popular</option>
                    <option value="replies">Most Replies</option>
                    <option value="views">Most Views</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Discussion Threads */}
            <div className="space-y-4">
              {filteredThreads.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h3 className="text-xl font-medium text-gray-800 dark:text-white mb-2">No discussions found</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Be the first to start a discussion!'}
                  </p>
                  <button
                    onClick={() => setShowNewThreadModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    Start Discussion
                  </button>
                </div>
              ) : (
                filteredThreads.map((thread) => (
                  <div key={thread.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden">
                    <div className="p-6">
                      {/* Thread Header */}
                      <div className="flex items-start space-x-4">
                        <img
                          src={thread.author.avatar}
                          alt={thread.author.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-2">
                            {thread.isPinned && (
                              <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                              </svg>
                            )}
                            {thread.isSolved && (
                              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            )}
                            <h3 className="text-xl font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer">
                              {thread.title}
                            </h3>
                          </div>

                          <div className="flex items-center space-x-3 mb-3">
                            <span className="font-medium text-gray-800 dark:text-white">{thread.author.name}</span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(thread.author.role)}`}>
                              {thread.author.role}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(thread.author.level)}`}>
                              {thread.author.level}
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">in {thread.course}</span>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                            {thread.content}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {thread.tags.map((tag, index) => (
                              <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Thread Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span>{thread.replies} replies</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>{thread.views} views</span>
                              </div>
                              <span>Last activity {getTimeAgo(thread.lastActivity)}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                              <button className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                                thread.isLiked
                                  ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}>
                                <svg className="w-4 h-4" fill={thread.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                <span>{thread.likes}</span>
                              </button>
                              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* New Thread Modal */}
        {showNewThreadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Start New Discussion</h2>
                  <button
                    onClick={() => setShowNewThreadModal(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter discussion title..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category
                    </label>
                    <select className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                      <option value="">Select a category</option>
                      {discussions.categories.filter(cat => cat.id !== 'all').map((category) => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Content
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write your discussion content..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Tags (optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Enter tags separated by commas..."
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowNewThreadModal(false)}
                      className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      Post Discussion
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Discussion;
