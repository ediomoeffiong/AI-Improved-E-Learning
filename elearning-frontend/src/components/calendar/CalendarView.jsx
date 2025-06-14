import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const CalendarView = ({
  events = [],
  selectedDate,
  onDateSelect,
  onEventEdit,
  onEventDelete,
  onEventComplete,
  onCreateEvent
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState('month'); // month, week, day
  const [showEventDetails, setShowEventDetails] = useState(null);
  const { userStats, addPoints } = useGamification();

  // Mock events data with E-Learning specific events
  const mockEvents = [
    {
      id: 1,
      title: 'React Fundamentals Quiz',
      type: 'quiz',
      date: new Date(2024, 11, 15, 10, 0),
      duration: 60,
      course: 'Introduction to React',
      points: 50,
      completed: false,
      priority: 'high'
    },
    {
      id: 2,
      title: 'JavaScript Assignment Due',
      type: 'assignment',
      date: new Date(2024, 11, 18, 23, 59),
      course: 'Advanced JavaScript',
      points: 100,
      completed: false,
      priority: 'high'
    },
    {
      id: 3,
      title: 'UI/UX Design Live Session',
      type: 'live-session',
      date: new Date(2024, 11, 20, 14, 0),
      duration: 90,
      instructor: 'Dr. Sarah Johnson',
      course: 'UI/UX Design Principles',
      completed: false,
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Study Session: React Hooks',
      type: 'study-session',
      date: new Date(2024, 11, 16, 16, 0),
      duration: 120,
      course: 'Introduction to React',
      points: 25,
      completed: true,
      priority: 'low'
    },
    {
      id: 5,
      title: 'Weekly Progress Review',
      type: 'review',
      date: new Date(2024, 11, 22, 9, 0),
      duration: 30,
      recurring: 'weekly',
      completed: false,
      priority: 'medium'
    }
  ];

  // Remove the useEffect and mockEvents since events are now passed as props

  const getEventTypeColor = (type) => {
    const colors = {
      'quiz': 'bg-red-500',
      'assignment': 'bg-orange-500',
      'live-session': 'bg-blue-500',
      'study-session': 'bg-green-500',
      'review': 'bg-purple-500',
      'deadline': 'bg-yellow-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  const getEventTypeIcon = (type) => {
    const icons = {
      'quiz': '📝',
      'assignment': '📋',
      'live-session': '🎥',
      'study-session': '📚',
      'review': '🔍',
      'deadline': '⏰'
    };
    return icons[type] || '📅';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': 'border-red-400 bg-red-50 dark:bg-red-900/20',
      'medium': 'border-yellow-400 bg-yellow-50 dark:bg-yellow-900/20',
      'low': 'border-green-400 bg-green-50 dark:bg-green-900/20'
    };
    return colors[priority] || 'border-gray-400 bg-gray-50 dark:bg-gray-900/20';
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const getEventsForDate = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const handleEventComplete = (eventId) => {
    if (onEventComplete) {
      onEventComplete(eventId);
    }
  };

  const renderMonthView = () => {
    const days = getDaysInMonth(currentDate);
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        {/* Calendar Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMonth(-1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-xl font-bold">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => navigateMonth(1)}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Week Days Header */}
        <div className="grid grid-cols-7 bg-gray-50 dark:bg-gray-700">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center font-semibold text-gray-600 dark:text-gray-300">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0">
          {days.map((day, index) => {
            const dayEvents = day ? getEventsForDate(day) : [];
            const isToday = day && day.toDateString() === new Date().toDateString();
            const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();

            return (
              <div
                key={index}
                className={`min-h-[120px] p-2 border-b border-r border-gray-200 dark:border-gray-600 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  day ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-900'
                } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => day && onDateSelect && onDateSelect(day)}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${
                      isToday 
                        ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' 
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {day.getDate()}
                    </div>
                    
                    {/* Events for this day */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map(event => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded border-l-2 cursor-pointer hover:shadow-sm transition-all ${getEventTypeColor(event.type)} ${getPriorityColor(event.priority)} ${
                            event.completed ? 'opacity-60 line-through' : ''
                          }`}
                          title={`${event.title} - ${event.course || ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEventDetails(event);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1 flex-1 min-w-0">
                              <span>{getEventTypeIcon(event.type)}</span>
                              <span className="truncate font-medium text-gray-800 dark:text-gray-200">
                                {event.title}
                              </span>
                            </div>
                            {!event.completed && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEventComplete(event.id);
                                }}
                                className="ml-1 text-green-600 hover:text-green-800 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Mark as complete"
                              >
                                ✓
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
            <span className="mr-2">📅</span>
            Learning Calendar
          </h1>
          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            <span className="text-blue-600 dark:text-blue-400 text-sm font-medium">
              🔥 {userStats.currentStreak} day streak
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {['month', 'week', 'day'].map(viewType => (
              <button
                key={viewType}
                onClick={() => setView(viewType)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  view === viewType
                    ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {viewType.charAt(0).toUpperCase() + viewType.slice(1)}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => onCreateEvent && onCreateEvent()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar View */}
      {view === 'month' && renderMonthView()}
      
      {/* Placeholder for week and day views */}
      {view !== 'month' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-400 mb-2">
            {view.charAt(0).toUpperCase() + view.slice(1)} View Coming Soon!
          </h3>
          <p className="text-gray-500 dark:text-gray-500">
            We're working on the {view} view. For now, enjoy the month view!
          </p>
        </div>
      )}

      {/* Event Details Modal */}
      {showEventDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center">
                  <span className="mr-2">{getEventTypeIcon(showEventDetails.type)}</span>
                  {showEventDetails.title}
                </h3>
                <button
                  onClick={() => setShowEventDetails(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">📅</span>
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(showEventDetails.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </span>
                </div>

                {showEventDetails.duration && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">⏱️</span>
                    <span className="text-gray-700 dark:text-gray-300">
                      {showEventDetails.duration} minutes
                    </span>
                  </div>
                )}

                {showEventDetails.course && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">📚</span>
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {showEventDetails.course}
                    </span>
                  </div>
                )}

                {showEventDetails.points > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500 dark:text-gray-400">🏆</span>
                    <span className="text-yellow-600 dark:text-yellow-400 font-medium">
                      +{showEventDetails.points} points
                    </span>
                  </div>
                )}

                {showEventDetails.description && (
                  <div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      {showEventDetails.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-gray-500 dark:text-gray-400">🎯</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    showEventDetails.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300' :
                    showEventDetails.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300' :
                    'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {showEventDetails.priority} priority
                  </span>
                </div>
              </div>

              <div className="flex space-x-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                {!showEventDetails.completed && (
                  <button
                    onClick={() => {
                      handleEventComplete(showEventDetails.id);
                      setShowEventDetails(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Mark Complete
                  </button>
                )}

                <button
                  onClick={() => {
                    onEventEdit && onEventEdit(showEventDetails);
                    setShowEventDetails(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Edit
                </button>

                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this event?')) {
                      onEventDelete && onEventDelete(showEventDetails.id);
                      setShowEventDetails(null);
                    }
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarView;
