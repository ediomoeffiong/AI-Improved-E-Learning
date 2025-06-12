import React from 'react';
import { Link } from 'react-router-dom';

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
  return (
    <section className="mb-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Available Courses</h2>
          <p className="text-gray-600 dark:text-gray-400">Discover and enroll in courses that match your interests</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
          {/* Search Bar */}
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search courses, instructors, or skills..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-lg"
            />
            <svg className="absolute left-4 top-3.5 h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-4">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={level}
              onChange={e => setLevel(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Level</option>
              {levels.map(lvl => (
                <option key={lvl} value={lvl}>{lvl}</option>
              ))}
            </select>

            <select
              value={instructor}
              onChange={e => setInstructor(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="">Instructor</option>
              {instructors.map(inst => (
                <option key={inst} value={inst}>{inst}</option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={e => setPriceRange(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="All">All Prices</option>
              <option value="Free">Free</option>
              <option value="Under $50">Under $50</option>
              <option value="$50-$100">$50 - $100</option>
              <option value="$100-$200">$100 - $200</option>
              <option value="Over $200">Over $200</option>
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="students">Most Students</option>
              <option value="newest">Newest</option>
              <option value="title">A-Z</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            <label className="flex items-center space-x-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
              <input
                type="checkbox"
                checked={showFreeOnly}
                onChange={e => setShowFreeOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-200">Free Only</span>
            </label>
          </div>

          {/* Results Count */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold text-blue-600 dark:text-blue-400">{filteredCourses.length}</span> course{filteredCourses.length !== 1 ? 's' : ''} found
            </div>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setLevel('All');
                setInstructor('All');
                setPriceRange('All');
                setSortBy('popularity');
                setShowFreeOnly(false);
              }}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md">No courses found.</div>
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
                  <span className="font-medium">{course.instructor}</span>
                  <span>•</span>
                  <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">{course.level}</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="flex text-yellow-400 mr-2">
                      {'★'.repeat(Math.floor(course.rating))}
                      {'☆'.repeat(5 - Math.floor(course.rating))}
                    </div>
                    <span className="text-gray-600 dark:text-gray-400 text-sm font-medium">{course.rating}</span>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{course.students.toLocaleString()} students</span>
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
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2.5 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-blue-600 disabled:hover:to-blue-700 shadow-md hover:shadow-lg"
                    onClick={() => handleEnroll(course)}
                    disabled={enrolled.includes(course._id || course.id)}
                  >
                    {enrolled.includes(course._id || course.id) ? '✓ Enrolled' : 'Enroll Now'}
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
    </section>
  );
}

export default AvailableCoursesSection; 