const Notification = require('../models/Notification');

// ─── @route  GET /api/notifications ──────────────────────────────────────────
exports.getNotifications = async (req, res) => {
  const { page = 1, limit = 20, isRead } = req.query;

  const filter = { recipient: req.user._id };
  if (isRead !== undefined) filter.isRead = isRead === 'true';

  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .populate('sender', 'name avatar')
      .populate('task', 'title status')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ recipient: req.user._id, isRead: false }),
  ]);

  res.status(200).json({
    success: true,
    data: notifications,
    unreadCount,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

// ─── @route  PATCH /api/notifications/:id/read ───────────────────────────────
exports.markAsRead = async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, recipient: req.user._id },
    { isRead: true, readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  const unreadCount = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });

  res.status(200).json({ success: true, data: notification, unreadCount });
};

// ─── @route  PATCH /api/notifications/read-all ───────────────────────────────
exports.markAllAsRead = async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user._id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.status(200).json({ success: true, message: 'All notifications marked as read.', unreadCount: 0 });
};

// ─── @route  DELETE /api/notifications/:id ───────────────────────────────────
exports.deleteNotification = async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user._id,
  });

  if (!notification) {
    return res.status(404).json({ success: false, message: 'Notification not found.' });
  }

  res.status(200).json({ success: true, message: 'Notification deleted.' });
};

// ─── @route  DELETE /api/notifications ───────────────────────────────────────
exports.clearAllNotifications = async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });
  res.status(200).json({ success: true, message: 'All notifications cleared.' });
};

// ─── @route  GET /api/notifications/unread-count ─────────────────────────────
exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    recipient: req.user._id,
    isRead: false,
  });
  res.status(200).json({ success: true, unreadCount: count });
};
