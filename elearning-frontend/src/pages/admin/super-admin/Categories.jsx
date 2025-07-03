import React, { useState, useEffect } from 'react';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6'
  });

  useEffect(() => {
    // Simulate loading categories data
    setTimeout(() => {
      setCategories([
        {
          id: 1,
          name: 'Programming',
          description: 'Software development and coding courses',
          icon: '💻',
          color: '#3B82F6',
          courseCount: 45,
          studentCount: 1234,
          created: '2024-01-15'
        },
        {
          id: 2,
          name: 'Data Science',
          description: 'Data analysis, machine learning, and statistics',
          icon: '📊',
          color: '#10B981',
          courseCount: 28,
          studentCount: 892,
          created: '2024-01-20'
        },
        {
          id: 3,
          name: 'Design',
          description: 'UI/UX design, graphic design, and creative arts',
          icon: '🎨',
          color: '#F59E0B',
          courseCount: 32,
          studentCount: 567,
          created: '2024-02-01'
        },
        {
          id: 4,
          name: 'Business',
          description: 'Business management, entrepreneurship, and finance',
          icon: '💼',
          color: '#8B5CF6',
          courseCount: 19,
          studentCount: 445,
          created: '2024-02-10'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateCategory = () => {
    setFormData({ name: '', description: '', icon: '', color: '#3B82F6' });
    setEditingCategory(null);
    setShowCreateModal(true);
  };

  const handleEditCategory = (category) => {
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color
    });
    setEditingCategory(category);
    setShowCreateModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      // Create new category
      const newCategory = {
        id: Date.now(),
        ...formData,
        courseCount: 0,
        studentCount: 0,
        created: new Date().toISOString().split('T')[0]
      };
      setCategories(prev => [...prev, newCategory]);
    }
    
    setShowCreateModal(false);
    setFormData({ name: '', description: '', icon: '', color: '#3B82F6' });
    setEditingCategory(null);
  };

  const handleDeleteCategory = (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-300 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                📂 Course Categories
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Manage course categories and organization
              </p>
            </div>
            <button
              onClick={handleCreateCategory}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Create Category</span>
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                    style={{ backgroundColor: `${category.color}20` }}
                  >
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    ></div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category.id)}
                    className="text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {category.description}
              </p>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {category.courseCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {category.studentCount}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Students</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Categories</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {categories.reduce((sum, cat) => sum + cat.courseCount, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Courses</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {categories.reduce((sum, cat) => sum + cat.studentCount, 0)}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Students</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {Math.round(categories.reduce((sum, cat) => sum + cat.studentCount, 0) / categories.reduce((sum, cat) => sum + cat.courseCount, 0))}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Avg Students/Course</div>
          </div>
        </div>

        {/* Create/Edit Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {editingCategory ? 'Edit Category' : 'Create New Category'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Enter category description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="e.g., 💻"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex items-center justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                  >
                    {editingCategory ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
