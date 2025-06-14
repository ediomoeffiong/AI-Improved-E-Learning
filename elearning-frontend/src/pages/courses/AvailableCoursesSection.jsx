import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useGamification } from '../../contexts/GamificationContext';

function AvailableCoursesSection({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  level,
  setLevel,
  levels,
  instructor,
  setInstructor,
  instructors,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showFreeOnly,
  setShowFreeOnly,
  filteredCourses,
  handleEnroll,
  enrolled,
  setModalCourse
}) {
  const { isAuthenticated } = useAuth();
  const { userStats, addPoints } = useGamification();
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [aiRecommendations, setAIRecommendations] = useState([]);

  // Generate AI recommendations based on user activity
  useEffect(() => {
    if (isAuthenticated() && filteredCourses.length > 0) {
      generateAIRecommendations();
    }
  }, [filteredCourses, isAuthenticated]);

  const generateAIRecommendations = () => {
    // Simple AI recommendation logic based on user level and popular courses
    const userLevel = userStats.level || 1;
    const recommendations = filteredCourses
      .filter(course => {
        // Recommend courses based on user level
        if (userLevel <= 2) return course.level === 'Beginner';
        if (userLevel <= 4) return course.level === 'Intermediate';
        return course.level === 'Advanced';
      })
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    setAIRecommendations(recommendations);
  };

  const handleEnrollWithGamification = (course) => {
    handleEnroll(course);
    if (isAuthenticated()) {
      // Add points for course enrollment
      addPoints(50, `Enrolled in ${course.title}`);
    }
  };
  return (
    <section className="mb-8">
      {/* AI Recommendations Banner */}
      {isAuthenticated() && aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div>
                <h3 className="text-xl font-bold">AI Recommendations</h3>
                <p className="text-purple-100">Courses picked just for you based on your level {userStats.level}</p>
              </div>
            </div>
            <button
              onClick={() => setShowAIRecommendations(!showAIRecommendations)}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors"
            >
              {showAIRecommendations ? 'Hide' : 'Show'} Recommendations
            </button>
          </div>

          {showAIRecommendations && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aiRecommendations.map((course) => (
                <div key={course._id || course.id} className="bg-white/10 rounded-lg p-4 hover:bg-white/20 transition-colors">
                  <h4 className="font-semibold mb-2">{course.title}</h4>
                  <div className="flex items-center justify-between text-sm">
                    <span className="bg-white/20 px-2 py-1 rounded">{course.level}</span>
                    <span className="flex items-center">
                      ⭐ {course.rating}
                    </span>
                  </div>
                  <button
                    onClick={() => handleEnrollWithGamification(course)}
                    className="w-full mt-3 bg-white text-purple-600 hover:bg-purple-50 py-2 rounded-lg font-medium transition-colors"
                    disabled={enrolled.includes(course._id || course.id)}
                  >
                    {enrolled.includes(course._id || course.id) ? '✓ Enrolled' : 'Enroll Now (+50 pts)'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mb-6">
        {/* Header Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-3 mb-2">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Available Courses</h2>
            {isAuthenticated() && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-3 py-1 rounded-full text-sm">
                <span>💎 {userStats.diamonds}</span>
                <span>⭐ {userStats.points}</span>
                <span>🔥 {userStats.currentStreak}</span>
              </div>
            )}
          </div>
          <p className="text-gray-600 dark:text-gray-400">Discover and enroll in courses that match your interests</p>
        </div>

        {/* Filters Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="🔍 Search courses, instructors, skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg shadow-sm"
            />
            <svg className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <div className="relative">
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">📚 Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={level}
                onChange={e => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">🎯 Levels</option>
                {levels.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={instructor}
                onChange={e => setInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="">👨‍🏫 Instructors</option>
                {instructors.map(inst => (
                  <option key={inst} value={inst}>{inst}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={priceRange}
                onChange={e => setPriceRange(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="All">💰 Prices</option>
                <option value="Free">🆓 Free</option>
                <option value="Under $50">💵 Under $50</option>
                <option value="$50-$100">💴 $50 - $100</option>
                <option value="$100-$200">💶 $100 - $200</option>
                <option value="Over $200">💷 Over $200</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors appearance-none cursor-pointer"
              >
                <option value="popularity">🔥 Most Popular</option>
                <option value="rating">⭐ Highest Rated</option>
                <option value="students">👥 Most Students</option>
                <option value="newest">🆕 Newest</option>
                <option value="title">🔤 A-Z</option>
                <option value="price-low">💲 Price: Low to High</option>
                <option value="price-high">💰 Price: High to Low</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            <label className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={e => setShowFreeOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">🆓 Free Only</span>
            </label>
          </div>

          {/* Results Count and Actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-semibold text-blue-600 dark:text-blue-400 text-lg">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} found
              </div>
              {(search || category || level || instructor || priceRange !== 'All' || showFreeOnly) && (
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Filters active:</span>
                  {search && <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">Search</span>}
                  {category && <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs">Category</span>}
                  {level && <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 px-2 py-1 rounded-full text-xs">Level</span>}
                  {instructor && <span className="bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200 px-2 py-1 rounded-full text-xs">Instructor</span>}
                  {priceRange !== 'All' && <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded-full text-xs">Price</span>}
                  {showFreeOnly && <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs">Free Only</span>}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {isAuthenticated() && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  💡 Enroll in courses to earn points and diamonds!
                </div>
              )}
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setLevel('');
                  setInstructor('');
                  setPriceRange('All');
                  setSortBy('popularity');
                  setShowFreeOnly(false);
                }}
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
              >
                🔄 Clear All Filters
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats for Authenticated Users */}
      {isAuthenticated() && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{userStats.points}</div>
            <div className="text-sm opacity-90">Total Points</div>
          </div>
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{userStats.diamonds}</div>
            <div className="text-sm opacity-90">Diamonds</div>
          </div>
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">{userStats.currentStreak}</div>
            <div className="text-sm opacity-90">Day Streak</div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg text-center">
            <div className="text-2xl font-bold">#{userStats.rank}</div>
            <div className="text-sm opacity-90">Leaderboard</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No courses found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredCourses.map((course) => (
            <div key={course._id || course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden flex flex-col relative hover:shadow-xl hover:scale-105 transition-all duration-300 border border-gray-100 dark:border-gray-700">
              {/* Badge */}
              {course.badge && (
                <span className="absolute top-3 right-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 shadow-lg">{course.badge}</span>
              )}
              <img src={course.image} alt={course.title} className="w-full h-48 object-cover" />
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white line-clamp-2 flex-1">{course.title}</h3>
                  <div className="ml-2 text-right">
                    {course.isFree ? (
                      <span className="text-lg font-bold text-green-600 dark:text-green-400">FREE</span>
                    ) : (
                      <div>
                        <span className="text-lg font-bold text-gray-800 dark:text-white">${course.price}</span>
                        {course.originalPrice > course.price && (
                          <span className="text-sm text-gray-500 dark:text-gray-400 line-through ml-1">${course.originalPrice}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center text-sm text-gray-500 dark:text-gray-400 mb-3 gap-2">
                  <span className="font-medium">👨‍🏫 {course.instructor}</span>
                  <span>•</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    course.level === 'Beginner' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    course.level === 'Intermediate' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200' :
                    'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  }`}>
                    {course.level === 'Beginner' ? '🟢' : course.level === 'Intermediate' ? '🟡' : '🔴'} {course.level}
                  </span>
                  <span>•</span>
                  <span>⏱️ {course.duration}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {'⭐'.repeat(Math.floor(course.rating))}
                      {'☆'.repeat(5 - Math.floor(course.rating))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{course.rating}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">👥 {course.students.toLocaleString()}</span>
                    {isAuthenticated() && course.level === 'Beginner' && userStats.level <= 2 && (
                      <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">
                        🎯 Recommended
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 flex-grow">{course.description}</p>

                <div className="flex flex-wrap gap-1 mb-4">
                  {course.skills.slice(0, 3).map((skill, index) => (
                    <span key={index} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                  {course.skills.length > 3 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1">
                      +{course.skills.length - 3} more
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-auto">
                  <button
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 shadow-md hover:shadow-lg relative overflow-hidden"
                    onClick={() => handleEnrollWithGamification(course)}
                    disabled={enrolled.includes(course._id || course.id)}
                  >
                    {enrolled.includes(course._id || course.id) ? (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">✓</span>
                        Enrolled
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <span className="mr-2">🚀</span>
                        Enroll Now
                        {isAuthenticated() && (
                          <span className="ml-2 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                            +50 pts
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                  <Link
                    to={`/courses/${course._id || course.id}`}
                    className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium py-2 px-4 rounded-lg transition-colors border border-gray-200 dark:border-gray-600 text-center"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Floating AI Assistant Button */}
      {isAuthenticated() && (
        <div className="fixed bottom-40 right-8 z-50">
          <button
            onClick={() => setShowAIRecommendations(!showAIRecommendations)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110"
            title="AI Course Recommendations"
          >
            <span className="text-xl">🤖</span>
          </button>
        </div>
      )}
    </section>
  );
}

export default AvailableCoursesSection; 