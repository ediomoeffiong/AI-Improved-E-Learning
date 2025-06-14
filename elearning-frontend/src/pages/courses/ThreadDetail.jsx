import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { handleAPIError } from '../../services/api';

// Mock data for thread details
const mockThreadData = {
  1: {
    id: 1,
    title: 'How to implement React hooks in the final project?',
    content: 'I\'m struggling with implementing useState and useEffect in my final project. Can someone provide guidance on best practices?\n\nSpecifically, I\'m having trouble with:\n1. Managing complex state with multiple useState calls\n2. Optimizing useEffect dependencies\n3. Avoiding infinite re-renders\n\nAny help would be appreciated!',
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
    tags: ['react', 'hooks', 'javascript'],
    replies_data: [
      {
        id: 101,
        content: 'Great question! For managing complex state, I recommend using useReducer instead of multiple useState calls. It gives you better control and makes state updates more predictable.',
        author: {
          name: 'Prof. Michael Chen',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
          role: 'Instructor',
          level: 'Expert'
        },
        createdAt: '2024-01-20T11:15:00Z',
        likes: 5,
        isLiked: false,
        isSolution: true,
        replies: [
          {
            id: 102,
            content: 'Thanks! That makes sense. Could you provide a quick example of useReducer in action?',
            author: {
              name: 'Sarah Chen',
              avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?auto=format&fit=crop&w=150&q=80',
              role: 'Student',
              level: 'Intermediate'
            },
            createdAt: '2024-01-20T11:30:00Z',
            likes: 1,
            isLiked: false
          }
        ]
      },
      {
        id: 103,
        content: 'For useEffect optimization, make sure to include all dependencies in the dependency array. You can use ESLint plugin react-hooks/exhaustive-deps to catch missing dependencies.',
        author: {
          name: 'Emily Johnson',
          avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
          role: 'Student',
          level: 'Advanced'
        },
        createdAt: '2024-01-20T12:45:00Z',
        likes: 3,
        isLiked: true,
        replies: []
      }
    ]
  }
};

function ThreadDetail() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [thread, setThread] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newReply, setNewReply] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    const fetchThread = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from the API
        const threadData = mockThreadData[threadId];
        if (!threadData) {
          throw new Error('Thread not found');
        }
        setThread(threadData);
        setError(null);
      } catch (err) {
        console.error('Error fetching thread:', err);
        setError(handleAPIError(err));
      } finally {
        setLoading(false);
      }
    };

    if (threadId) {
      fetchThread();
    }
  }, [threadId]);

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

  const handleLike = (replyId = null) => {
    if (replyId) {
      // Handle reply like
      setThread(prev => ({
        ...prev,
        replies_data: prev.replies_data.map(reply => 
          reply.id === replyId 
            ? { 
                ...reply, 
                isLiked: !reply.isLiked,
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1
              }
            : reply
        )
      }));
    } else {
      // Handle thread like
      setThread(prev => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1
      }));
    }
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!newReply.trim()) return;

    const reply = {
      id: Date.now(),
      content: newReply,
      author: {
        name: 'Current User',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
        role: 'Student',
        level: 'Intermediate'
      },
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    };

    if (replyingTo) {
      // Add nested reply
      setThread(prev => ({
        ...prev,
        replies_data: prev.replies_data.map(r => 
          r.id === replyingTo 
            ? { ...r, replies: [...r.replies, reply] }
            : r
        )
      }));
    } else {
      // Add top-level reply
      setThread(prev => ({
        ...prev,
        replies_data: [...prev.replies_data, reply],
        replies: prev.replies + 1
      }));
    }

    setNewReply('');
    setReplyingTo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading thread...</p>
        </div>
      </div>
    );
  }

  if (error || !thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Thread Not Found</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">The discussion thread you're looking for doesn't exist or has been removed.</p>
          <Link to="/courses/discussion" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Back to Discussions
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Link to="/courses/discussion" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Discussions
            </Link>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-gray-800 dark:text-white">{thread.title}</span>
          </div>
        </nav>

        {/* Thread Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            {thread.isPinned && (
              <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            )}
            {thread.isSolved && (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{thread.title}</h1>
          </div>

          <div className="flex items-start space-x-4">
            <img
              src={thread.author.avatar}
              alt={thread.author.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <span className="font-medium text-gray-800 dark:text-white">{thread.author.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(thread.author.role)}`}>
                  {thread.author.role}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(thread.author.level)}`}>
                  {thread.author.level}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">in {thread.course}</span>
              </div>
              
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Posted {getTimeAgo(thread.createdAt)} • Last activity {getTimeAgo(thread.lastActivity)}
              </div>

              <div className="prose dark:prose-invert max-w-none mb-4">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{thread.content}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {thread.tags.map((tag, index) => (
                  <span key={index} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full text-xs">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Thread Stats and Actions */}
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
                </div>

                <button 
                  onClick={() => handleLike()}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                    thread.isLiked
                      ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <svg className="w-4 h-4" fill={thread.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  <span>{thread.likes}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Replies ({thread.replies_data.length})
          </h2>

          {thread.replies_data.map((reply) => (
            <div key={reply.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              {reply.isSolution && (
                <div className="flex items-center space-x-2 mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-green-800 dark:text-green-200 font-medium">Marked as Solution</span>
                </div>
              )}

              <div className="flex items-start space-x-4">
                <img
                  src={reply.author.avatar}
                  alt={reply.author.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="font-medium text-gray-800 dark:text-white">{reply.author.name}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(reply.author.role)}`}>
                      {reply.author.role}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(reply.author.level)}`}>
                      {reply.author.level}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{getTimeAgo(reply.createdAt)}</span>
                  </div>

                  <div className="prose dark:prose-invert max-w-none mb-4">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{reply.content}</p>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(reply.id)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-lg transition-colors ${
                          reply.isLiked
                            ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        <svg className="w-4 h-4" fill={reply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span>{reply.likes}</span>
                      </button>
                      <button
                        onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        Reply
                      </button>
                    </div>
                  </div>

                  {/* Nested Replies */}
                  {reply.replies && reply.replies.length > 0 && (
                    <div className="mt-4 ml-6 space-y-4 border-l-2 border-gray-200 dark:border-gray-700 pl-4">
                      {reply.replies.map((nestedReply) => (
                        <div key={nestedReply.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <img
                              src={nestedReply.author.avatar}
                              alt={nestedReply.author.name}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-800 dark:text-white text-sm">{nestedReply.author.name}</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(nestedReply.author.role)}`}>
                                  {nestedReply.author.role}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">{getTimeAgo(nestedReply.createdAt)}</span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{nestedReply.content}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <button className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${
                                  nestedReply.isLiked
                                    ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                                    : 'bg-gray-100 text-gray-600 dark:bg-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                                }`}>
                                  <svg className="w-3 h-3" fill={nestedReply.isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                  </svg>
                                  <span>{nestedReply.likes}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form for this specific reply */}
                  {replyingTo === reply.id && (
                    <div className="mt-4 ml-6 border-l-2 border-blue-200 dark:border-blue-700 pl-4">
                      <form onSubmit={handleReplySubmit} className="space-y-3">
                        <textarea
                          value={newReply}
                          onChange={(e) => setNewReply(e.target.value)}
                          placeholder={`Reply to ${reply.author.name}...`}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                          required
                        />
                        <div className="flex items-center space-x-2">
                          <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                          >
                            Post Reply
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setReplyingTo(null);
                              setNewReply('');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Main Reply Form */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add Your Reply</h3>
            <form onSubmit={handleReplySubmit} className="space-y-4">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Write your reply..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                required
              />
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Be respectful and constructive in your response
                </div>
                <button
                  type="submit"
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Post Reply
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ThreadDetail;
