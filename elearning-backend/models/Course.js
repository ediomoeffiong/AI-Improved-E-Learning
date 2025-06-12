const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  videoUrl: String,
  duration: Number, // in minutes
  order: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  }
});

const weekSchema = new mongoose.Schema({
  week: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  lessons: [lessonSchema]
});

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: String,
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String,
  date: {
    type: Date,
    default: Date.now
  }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  fullDescription: {
    type: String,
    required: true
  },
  instructor: {
    type: String,
    required: true
  },
  instructorBio: String,
  image: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Data Science', 'Design', 'Marketing', 'Programming', 'IT', 'Business']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: {
    type: Number,
    min: 0
  },
  isFree: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  students: {
    type: Number,
    default: 0
  },
  language: {
    type: String,
    default: 'English'
  },
  skills: [String],
  requirements: [String],
  whatYouWillLearn: [String],
  curriculum: [weekSchema],
  reviews: [reviewSchema],
  badge: {
    type: String,
    enum: ['', 'Popular', 'New', 'Top Rated', 'Bestseller']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
courseSchema.index({
  title: 'text',
  description: 'text',
  instructor: 'text',
  skills: 'text'
});

// Virtual for calculating average rating
courseSchema.virtual('averageRating').get(function() {
  if (this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
  return (sum / this.reviews.length).toFixed(1);
});

// Update rating when reviews change
courseSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating = (sum / this.reviews.length);
  }
  this.lastUpdated = new Date();
  next();
});

// Static method to find courses by category
courseSchema.statics.findByCategory = function(category) {
  return this.find({ category, isActive: true });
};

// Static method to find courses by level
courseSchema.statics.findByLevel = function(level) {
  return this.find({ level, isActive: true });
};

// Static method to find free courses
courseSchema.statics.findFreeCourses = function() {
  return this.find({ isFree: true, isActive: true });
};

// Static method for advanced search
courseSchema.statics.searchCourses = function(filters) {
  const query = { isActive: true };
  
  if (filters.search) {
    query.$text = { $search: filters.search };
  }
  
  if (filters.category && filters.category !== 'All') {
    query.category = filters.category;
  }
  
  if (filters.level && filters.level !== 'All') {
    query.level = filters.level;
  }
  
  if (filters.instructor && filters.instructor !== 'All') {
    query.instructor = filters.instructor;
  }
  
  if (filters.isFree !== undefined) {
    query.isFree = filters.isFree;
  }
  
  if (filters.priceRange) {
    switch (filters.priceRange) {
      case 'Free':
        query.isFree = true;
        break;
      case 'Under $50':
        query.price = { $lt: 50, $gt: 0 };
        break;
      case '$50-$100':
        query.price = { $gte: 50, $lte: 100 };
        break;
      case '$100-$200':
        query.price = { $gt: 100, $lte: 200 };
        break;
      case 'Over $200':
        query.price = { $gt: 200 };
        break;
    }
  }
  
  return this.find(query);
};

module.exports = mongoose.model('Course', courseSchema);
