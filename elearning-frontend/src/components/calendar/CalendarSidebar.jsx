import React, { useState } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const CalendarSidebar = ({ events, onDateSelect, selectedDate, onFilterChange, filters }) => {
  const { userStats } = useGamification();
  const [miniCalendarDate, setMiniCalendarDate] = useState(new Date());

  const eventTypes = [
    { id: 'quiz', label: 'Quizzes', icon: '📝', color: 'bg-red-500' },
    { id: 'assignment', label: 'Assignments', icon: '📋', color: 'bg-orange-500' },
    { id: 'live-session', label: 'Live Sessions', icon: '🎥', color: 'bg-blue-500' },
    { id: 'study-session', label: 'Study Sessions', icon: '📚', color: 'bg-green-500' },
    { id: 'review', label: 'Reviews', icon: '🔍', color: 'bg-purple-500' },
    { id: 'deadline', label: 'Deadlines', icon: '⏰', color: 'bg-yellow-500' }
  ];

  const getMiniCalendarDays = () => {
    const year = miniCalendarDate.getFullYear();
    const month = miniCalendarDate.getMonth();
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

  const navigateMiniCalendar = (direction) => {
    const newDate = new Date(miniCalendarDate);
    newDate.setMonth(miniCalendarDate.getMonth() + direction);
    setMiniCalendarDate(newDate);
  };

  const getUpcomingEvents = () => {
    const now = new Date();
    const upcoming = events
      .filter(event => new Date(event.date) >= now && !event.completed)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 5);
    return upcoming;
  };

  const getCompletedTasksToday = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString() && event.completed;
    }).length;
  };

  const getTotalTasksToday = () => {
    const today = new Date();
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === today.toDateString();
    }).length;
  };

  const handleFilterToggle = (type) => {
    const newFilters = filters.includes(type)
      ? filters.filter(f => f !== type)
      : [...filters, type];
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-6">
      {/* Daily Progress Card */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Today's Progress</h3>
          <span className="text-2xl">📊</span>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-blue-100">Tasks Completed</span>
            <span className="font-bold">{getCompletedTasksToday()}/{getTotalTasksToday()}</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${getTotalTasksToday() > 0 ? (getCompletedTasksToday() / getTotalTasksToday()) * 100 : 0}%` 
              }}
            ></div>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-100">Current Streak</span>
            <span className="font-bold flex items-center">
              🔥 {userStats.currentStreak} days
            </span>
          </div>
        </div>
      </div>

      {/* Mini Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gray-50 dark:bg-gray-700 p-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateMiniCalendar(-1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h3 className="font-semibold text-gray-800 dark:text-white">
              {miniCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            
            <button
              onClick={() => navigateMiniCalendar(1)}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Week days */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 p-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {getMiniCalendarDays().map((day, index) => {
              const dayEvents = day ? getEventsForDate(day) : [];
              const isToday = day && day.toDateString() === new Date().toDateString();
              const isSelected = day && selectedDate && day.toDateString() === selectedDate.toDateString();
              const hasEvents = dayEvents.length > 0;

              return (
                <button
                  key={index}
                  onClick={() => day && onDateSelect(day)}
                  className={`p-1 text-xs rounded transition-colors ${
                    day 
                      ? `hover:bg-gray-100 dark:hover:bg-gray-700 ${
                          isSelected 
                            ? 'bg-blue-600 text-white' 
                            : isToday 
                              ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 font-bold'
                              : 'text-gray-700 dark:text-gray-300'
                        }`
                      : 'text-gray-300 dark:text-gray-600'
                  }`}
                  disabled={!day}
                >
                  {day && (
                    <div className="relative">
                      {day.getDate()}
                      {hasEvents && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Event Type Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Event Filters
        </h3>
        <div className="space-y-3">
          {eventTypes.map(type => (
            <label key={type.id} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.includes(type.id)}
                onChange={() => handleFilterToggle(type.id)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <div className="flex items-center space-x-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                <span className="text-lg">{type.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {type.label}
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="mr-2">⏰</span>
          Upcoming Events
        </h3>
        <div className="space-y-3">
          {getUpcomingEvents().length > 0 ? (
            getUpcomingEvents().map(event => (
              <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <span className="text-lg flex-shrink-0 mt-0.5">
                  {event.type === 'quiz' ? '📝' : 
                   event.type === 'assignment' ? '📋' : 
                   event.type === 'live-session' ? '🎥' : 
                   event.type === 'study-session' ? '📚' : 
                   event.type === 'review' ? '🔍' : '⏰'}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(event.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </p>
                  {event.course && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                      {event.course}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <div className="text-3xl mb-2">🎉</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No upcoming events!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center">
          <span className="mr-2">⚡</span>
          Quick Actions
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group">
            <div className="flex items-center space-x-3">
              <span className="text-lg">📚</span>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300 group-hover:text-blue-800 dark:group-hover:text-blue-200">
                Schedule Study Session
              </span>
            </div>
          </button>
          
          <button className="w-full text-left p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🎯</span>
              <span className="text-sm font-medium text-green-700 dark:text-green-300 group-hover:text-green-800 dark:group-hover:text-green-200">
                Set Learning Goal
              </span>
            </div>
          </button>
          
          <button className="w-full text-left p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors group">
            <div className="flex items-center space-x-3">
              <span className="text-lg">🤖</span>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300 group-hover:text-purple-800 dark:group-hover:text-purple-200">
                AI Study Suggestions
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarSidebar;
