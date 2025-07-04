const mongoose = require('mongoose');

const notificationReadStatusSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  notificationId: {
    type: String,
    required: true,
    index: true
  },
  isRead: {
    type: Boolean,
    default: true
  },
  readAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
notificationReadStatusSchema.index({ userId: 1, notificationId: 1 }, { unique: true });

// Static method to mark notification as read
notificationReadStatusSchema.statics.markAsRead = async function(userId, notificationId) {
  return await this.findOneAndUpdate(
    { userId, notificationId },
    { 
      isRead: true, 
      readAt: new Date() 
    },
    { 
      upsert: true, 
      new: true 
    }
  );
};

// Static method to mark all notifications as read for a user
notificationReadStatusSchema.statics.markAllAsRead = async function(userId, notificationIds) {
  const operations = notificationIds.map(notificationId => ({
    updateOne: {
      filter: { userId, notificationId },
      update: { 
        isRead: true, 
        readAt: new Date() 
      },
      upsert: true
    }
  }));

  return await this.bulkWrite(operations);
};

// Static method to get read status for notifications
notificationReadStatusSchema.statics.getReadStatus = async function(userId, notificationIds) {
  const readStatuses = await this.find({
    userId,
    notificationId: { $in: notificationIds },
    isRead: true
  }).select('notificationId');

  return readStatuses.map(status => status.notificationId);
};

module.exports = mongoose.model('NotificationReadStatus', notificationReadStatusSchema);
