import React, { useState, useEffect } from 'react';
import { useGamification } from '../../contexts/GamificationContext';

const EventModal = ({ isOpen, onClose, onSave, event = null, selectedDate = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    type: 'study-session',
    date: '',
    time: '',
    duration: 60,
    course: '',
    description: '',
    priority: 'medium',
    recurring: 'none',
    points: 0,
    reminders: ['15min']
  });

  const [errors, setErrors] = useState({});
  const { addPoints } = useGamification();

  const eventTypes = [
    { id: 'study-session', label: 'Study Session', icon: '📚', defaultPoints: 25 },
    { id: 'quiz', label: 'Quiz', icon: '📝', defaultPoints: 50 },
    { id: 'assignment', label: 'Assignment', icon: '📋', defaultPoints: 100 },
    { id: 'live-session', label: 'Live Session', icon: '🎥', defaultPoints: 30 },
    { id: 'review', label: 'Review', icon: '🔍', defaultPoints: 20 },
    { id: 'deadline', label: 'Deadline', icon: '⏰', defaultPoints: 0 },
    { id: 'exam', label: 'Exam', icon: '📊', defaultPoints: 150 },
    { id: 'project', label: 'Project', icon: '🚀', defaultPoints: 200 }
  ];

  const courses = [
    'Introduction to React',
    'Advanced JavaScript',
    'UI/UX Design Principles',
    'Frontend Development',
    'Backend Development',
    'Data Structures',
    'Algorithms',
    'Web Security'
  ];

  const reminderOptions = [
    { id: '5min', label: '5 minutes before' },
    { id: '15min', label: '15 minutes before' },
    { id: '30min', label: '30 minutes before' },
    { id: '1hour', label: '1 hour before' },
    { id: '1day', label: '1 day before' },
    { id: '1week', label: '1 week before' }
  ];

  useEffect(() => {
    if (event) {
      // Edit mode
      const eventDate = new Date(event.date);
      setFormData({
        title: event.title || '',
        type: event.type || 'study-session',
        date: eventDate.toISOString().split('T')[0],
        time: eventDate.toTimeString().slice(0, 5),
        duration: event.duration || 60,
        course: event.course || '',
        description: event.description || '',
        priority: event.priority || 'medium',
        recurring: event.recurring || 'none',
        points: event.points || 0,
        reminders: event.reminders || ['15min']
      });
    } else if (selectedDate) {
      // Create mode with selected date
      setFormData(prev => ({
        ...prev,
        date: selectedDate.toISOString().split('T')[0],
        time: '09:00'
      }));
    }
  }, [event, selectedDate]);

  useEffect(() => {
    // Auto-set points based on event type
    const eventType = eventTypes.find(type => type.id === formData.type);
    if (eventType && !event) { // Only auto-set for new events
      setFormData(prev => ({
        ...prev,
        points: eventType.defaultPoints
      }));
    }
  }, [formData.type, event]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleReminderToggle = (reminderId) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.includes(reminderId)
        ? prev.reminders.filter(r => r !== reminderId)
        : [...prev.reminders, reminderId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    if (formData.duration < 5) {
      newErrors.duration = 'Duration must be at least 5 minutes';
    }

    if (formData.points < 0) {
      newErrors.points = 'Points cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Combine date and time
    const eventDateTime = new Date(`${formData.date}T${formData.time}`);

    const eventData = {
      id: event ? event.id : Date.now(),
      title: formData.title.trim(),
      type: formData.type,
      date: eventDateTime,
      duration: parseInt(formData.duration),
      course: formData.course,
      description: formData.description.trim(),
      priority: formData.priority,
      recurring: formData.recurring,
      points: parseInt(formData.points),
      reminders: formData.reminders,
      completed: event ? event.completed : false,
      createdAt: event ? event.createdAt : new Date()
    };

    onSave(eventData);
    
    // Award points for creating/updating events
    if (!event) {
      addPoints(5); // Points for creating an event
    }
    
    onClose();
  };

  const handleClose = () => {
    setFormData({
      title: '',
      type: 'study-session',
      date: '',
      time: '',
      duration: 60,
      course: '',
      description: '',
      priority: 'medium',
      recurring: 'none',
      points: 0,
      reminders: ['15min']
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter event title..."
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Event Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Event Type
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {eventTypes.map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => handleInputChange('type', type.id)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {type.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time *
                </label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleInputChange('time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.time ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.time && <p className="text-red-500 text-sm mt-1">{errors.time}</p>}
              </div>
            </div>

            {/* Duration and Points */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.duration ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.duration && <p className="text-red-500 text-sm mt-1">{errors.duration}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Points Reward
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={formData.points}
                  onChange={(e) => handleInputChange('points', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.points ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.points && <p className="text-red-500 text-sm mt-1">{errors.points}</p>}
              </div>
            </div>

            {/* Course and Priority */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course
                </label>
                <select
                  value={formData.course}
                  onChange={(e) => handleInputChange('course', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Select a course...</option>
                  {courses.map(course => (
                    <option key={course} value={course}>{course}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Add event description..."
              />
            </div>

            {/* Reminders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reminders
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {reminderOptions.map(reminder => (
                  <label key={reminder.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.reminders.includes(reminder.id)}
                      onChange={() => handleReminderToggle(reminder.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {reminder.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                {event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EventModal;
