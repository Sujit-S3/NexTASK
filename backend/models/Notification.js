const mongoose = require('mongoose');

const NOTIFICATION_TYPES = [
  'task_assigned',
  'task_updated',
  'task_completed',
  'task_overdue',
  'comment_added',
  'task_created',
  'task_deleted',
  'user_mentioned',
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Notification recipient is required'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: NOTIFICATION_TYPES,
        message: `Type must be one of: ${NOTIFICATION_TYPES.join(', ')}`,
      },
      required: [true, 'Notification type is required'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      maxlength: [300, 'Message cannot exceed 300 characters'],
    },
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// ─── Pre-save: set readAt when isRead changes to true ────────────────────────
notificationSchema.pre('save', function (next) {
  if (this.isModified('isRead') && this.isRead && !this.readAt) {
    this.readAt = new Date();
  }
  next();
});

// ─── Compound index for fast user notification queries ────────────────────────
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

// ─── Auto-delete notifications older than 30 days ────────────────────────────
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

module.exports = mongoose.model('Notification', notificationSchema);
