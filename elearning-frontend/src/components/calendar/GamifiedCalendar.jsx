import React, { useState, useEffect } from 'react';
import CalendarView from './CalendarView';
import CalendarSidebar from './CalendarSidebar';
import AITaskSuggestions from './AITaskSuggestions';
import EventModal from './EventModal';
import { useGamification } from '../../contexts/GamificationContext';

const GamifiedCalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFilters, setEventFilters] = useState(['quiz', 'assignment', 'live-session', 'study-session', 'review', 'deadline']);
  const [showAISuggestions, setShowAISuggestions] = useState(true);
  const [calendarStats, setCalendarStats] = useState({
    totalEvents: 0,
    completedEvents: 0,
    upcomingEvents: 0,
    overdueEvents: 0
  });

  const { userStats, addPoints, updateDailyProgress } = useGamification();

  // Mock events data with comprehensive E-Learning events
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
      priority: 'high',
      description: 'Comprehensive quiz covering React basics, components, and props.',
      reminders: ['1day', '1hour']
    },
    {
      id: 2,
      title: 'JavaScript Assignment Due',
      type: 'assignment',
      date: new Date(2024, 11, 18, 23, 59),
      duration: 180,
      course: 'Advanced JavaScript',
      points: 100,
      completed: false,
      priority: 'high',
      description: 'Build a weather app using async/await and fetch API.',
      reminders: ['1week', '1day', '1hour']
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
      priority: 'medium',
      description: 'Interactive session on color theory and typography.',
      reminders: ['1day', '30min']
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
      priority: 'low',
      description: 'Deep dive into useState, useEffect, and custom hooks.',
      reminders: ['15min']
    },
    {
      id: 5,
      title: 'Weekly Progress Review',
      type: 'review',
      date: new Date(2024, 11, 22, 9, 0),
      duration: 30,
      recurring: 'weekly',
      completed: false,
      priority: 'medium',
      description: 'Review learning progress and plan for next week.',
      reminders: ['1day']
    },
    {
      id: 6,
      title: 'Frontend Development Final Exam',
      type: 'exam',
      date: new Date(2024, 11, 25, 10, 0),
      duration: 180,
      course: 'Frontend Development',
      points: 200,
      completed: false,
      priority: 'high',
      description: 'Comprehensive final exam covering HTML, CSS, and JavaScript.',
      reminders: ['1week', '1day', '1hour']
    },
    {
      id: 7,
      title: 'Portfolio Project Deadline',
      type: 'deadline',
      date: new Date(2024, 11, 30, 23, 59),
      course: 'Web Development Bootcamp',
      points: 150,
      completed: false,
      priority: 'high',
      description: 'Submit completed portfolio website with 5 projects.',
      reminders: ['1week', '1day']
    }
  ];

  useEffect(() => {
    setEvents(mockEvents);
    updateCalendarStats(mockEvents);
  }, []);

  useEffect(() => {
    updateCalendarStats(events);
  }, [events]);

  const updateCalendarStats = (eventList) => {
    const now = new Date();
    const stats = {
      totalEvents: eventList.length,
      completedEvents: eventList.filter(e => e.completed).length,
      upcomingEvents: eventList.filter(e => new Date(e.date) > now && !e.completed).length,
      overdueEvents: eventList.filter(e => new Date(e.date) < now && !e.completed).length
    };
    setCalendarStats(stats);
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleEventSave = (eventData) => {
    if (editingEvent) {
      // Update existing event
      setEvents(events.map(e => e.id === eventData.id ? eventData : e));
    } else {
      // Add new event
      setEvents([...events, eventData]);
    }
    setEditingEvent(null);
  };

  const handleEventEdit = (event) => {
    setEditingEvent(event);
    setShowEventModal(true);
  };

  const handleEventDelete = (eventId) => {
    setEvents(events.filter(e => e.id !== eventId));
  };

  const handleEventComplete = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (event && !event.completed) {
      setEvents(events.map(e => 
        e.id === eventId ? { ...e, completed: true } : e
      ));
      
      // Award points and update daily progress
      if (event.points) {
        addPoints(event.points);
      }
      updateDailyProgress(event.duration || 30);
    }
  };

  const handleAddAITask = (task) => {
    setEvents([...events, task]);
  };

  const handleFilterChange = (filters) => {
    setEventFilters(filters);
  };

  const filteredEvents = events.filter(event => 
    eventFilters.includes(event.type)
  );

  const getUpcomingDeadlines = () => {
    const now = new Date();
    const oneWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return events
      .filter(event => 
        new Date(event.date) <= oneWeek && 
        new Date(event.date) >= now && 
        !event.completed &&
        (event.type === 'assignment' || event.type === 'quiz' || event.type === 'exam' || event.type === 'deadline')
      )
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const getUserProgress = () => {
    // Mock user progress data
    return {
      coursesInProgress: 3,
      averageScore: 85,
      studyStreak: userStats.currentStreak,
      weeklyGoal: 10, // hours
      weeklyProgress: 7.5 // hours
    };
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header with Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-6 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center">
              <span className="mr-3">📅</span>
              Smart Learning Calendar
            </h1>
            <p className="text-blue-100">
              AI-powered scheduling with gamification to boost your learning journey
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{calendarStats.totalEvents}</div>
              <div className="text-sm text-blue-100">Total Events</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{calendarStats.completedEvents}</div>
              <div className="text-sm text-blue-100">Completed</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold">{calendarStats.upcomingEvents}</div>
              <div className="text-sm text-blue-100">Upcoming</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="text-2xl font-bold text-yellow-300">{calendarStats.overdueEvents}</div>
              <div className="text-sm text-blue-100">Overdue</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Calendar Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar View */}
        <div className="xl:col-span-3 space-y-6">
          <CalendarView
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onEventEdit={handleEventEdit}
            onEventDelete={handleEventDelete}
            onEventComplete={handleEventComplete}
            onCreateEvent={() => setShowEventModal(true)}
          />
          
          {/* AI Suggestions Toggle */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">
              AI Study Recommendations
            </h2>
            <button
              onClick={() => setShowAISuggestions(!showAISuggestions)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                showAISuggestions
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {showAISuggestions ? 'Hide AI Suggestions' : 'Show AI Suggestions'}
            </button>
          </div>
          
          {/* AI Task Suggestions */}
          {showAISuggestions && (
            <AITaskSuggestions
              onAddTask={handleAddAITask}
              userProgress={getUserProgress()}
              upcomingDeadlines={getUpcomingDeadlines()}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1">
          <CalendarSidebar
            events={filteredEvents}
            onDateSelect={handleDateSelect}
            selectedDate={selectedDate}
            onFilterChange={handleFilterChange}
            filters={eventFilters}
          />
        </div>
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEvent(null);
        }}
        onSave={handleEventSave}
        event={editingEvent}
        selectedDate={selectedDate}
      />

      {/* Achievement Notifications */}
      {userStats.currentStreak > 0 && userStats.currentStreak % 7 === 0 && (
        <div className="fixed bottom-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white p-4 rounded-xl shadow-lg animate-bounce">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🏆</span>
            <div>
              <div className="font-bold">Achievement Unlocked!</div>
              <div className="text-sm">Weekly Learning Streak!</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamifiedCalendar;
