const { body } = require('express-validator');
const Task = require('../models/Task');
const User = require('../models/User');
const Activity = require('../models/Activity');
const { createAndEmitNotification, emitToAdmins, emitToUser, emitToTask } = require('../config/socket');
const { getPagination } = require('../utils/pagination');

// ─── Validation rules ─────────────────────────────────────────────────────────
exports.createTaskValidation = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3, max: 120 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']),
  body('assignedTo').optional().isMongoId().withMessage('Invalid user ID'),
  body('dueDate').optional().isISO8601().withMessage('Invalid date format'),
];

exports.updateTaskValidation = [
  body('title').optional().trim().isLength({ min: 3, max: 120 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('priority').optional().isIn(['low', 'medium', 'high', 'critical']),
  body('status').optional().isIn(['todo', 'in-progress', 'review', 'completed']),
  body('assignedTo').optional({ nullable: true }).isMongoId(),
  body('dueDate').optional({ nullable: true }).isISO8601(),
];

// ─── @route  GET /api/tasks ───────────────────────────────────────────────────
exports.getTasks = async (req, res) => {
  const {
    search,
    status,
    priority,
    assignedTo,
    createdBy,
    dueBefore,
    dueAfter,
    isArchived = false,
    sort = '-createdAt',
  } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = { isArchived: isArchived === 'true' };

  // Members can only see their assigned tasks
  if (req.user.role === 'member') {
    filter.assignedTo = req.user._id;
  } else {
    if (assignedTo) filter.assignedTo = assignedTo;
    if (createdBy) filter.createdBy = createdBy;
  }

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (dueBefore || dueAfter) {
    filter.dueDate = {};
    if (dueBefore) filter.dueDate.$lte = new Date(dueBefore);
    if (dueAfter) filter.dueDate.$gte = new Date(dueAfter);
  }

  if (search) {
    filter.$text = { $search: search };
  }

  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email avatar role')
      .populate('createdBy', 'name email avatar')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }),
    Task.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
};

// ─── @route  GET /api/tasks/:id ───────────────────────────────────────────────
exports.getTaskById = async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'name email avatar role')
    .populate('createdBy', 'name email avatar')
    .populate('statusHistory.changedBy', 'name avatar')
    .lean({ virtuals: true });

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  // Members can only view their own tasks
  if (req.user.role === 'member' && task.assignedTo?._id?.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.status(200).json({ success: true, data: task });
};

// ─── @route  POST /api/tasks (admin only) ────────────────────────────────────
exports.createTask = async (req, res) => {
  const { title, description, priority, status, assignedTo, dueDate, tags } = req.body;
  const io = req.app.get('io');

  const taskData = {
    title,
    description,
    priority,
    status,
    createdBy: req.user._id,
    dueDate: dueDate || null,
    tags: tags || [],
    statusHistory: [{ status: status || 'todo', changedBy: req.user._id }],
  };

  if (assignedTo) {
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      return res.status(404).json({ success: false, message: 'Assigned user not found.' });
    }
    taskData.assignedTo = assignedTo;
  }

  const task = await Task.create(taskData);
  await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  // Real-time: broadcast new task
  if (io) {
    emitToAdmins(io, 'task:created', task);
    if (assignedTo && assignedTo.toString() !== req.user._id.toString()) {
      emitToUser(io, assignedTo, 'task:created', task);
    }

    // Notify assignee
    if (assignedTo && assignedTo !== req.user._id.toString()) {
      await createAndEmitNotification(io, {
        recipient: assignedTo,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you a new task: "${title}"`,
        taskId: task._id,
      });
    }
  }

  await Activity.create({
    user: req.user._id,
    action: 'created',
    targetTask: task._id,
    details: `Created task "${task.title}"`,
  });
  if (io) emitToAdmins(io, 'activity:new', {});

  res.status(201).json({ success: true, data: task });
};

// ─── @route  PUT /api/tasks/:id ──────────────────────────────────────────────
exports.updateTask = async (req, res) => {
  const io = req.app.get('io');

  const task = await Task.findById(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  // Members can only update status
  if (req.user.role === 'member') {
    if (task.assignedTo?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
    const allowedMemberFields = ['status'];
    const reqKeys = Object.keys(req.body);
    const hasUnallowed = reqKeys.some((k) => !allowedMemberFields.includes(k));
    if (hasUnallowed) {
      return res.status(403).json({ success: false, message: 'Members can only update task status.' });
    }
  }

  const oldStatus = task.status;
  const oldAssignee = task.assignedTo?.toString();

  // Track status history
  if (req.body.status && req.body.status !== oldStatus) {
    task.statusHistory.push({ status: req.body.status, changedBy: req.user._id });
  }

  const allowedFields = ['title', 'description', 'priority', 'status', 'assignedTo', 'dueDate', 'tags', 'isArchived'];
  allowedFields.forEach((f) => {
    if (req.body[f] !== undefined) task[f] = req.body[f];
  });

  await task.save();
  await task.populate([
    { path: 'assignedTo', select: 'name email avatar' },
    { path: 'createdBy', select: 'name email avatar' },
  ]);

  if (io) {
    emitToAdmins(io, 'task:updated', task);
    if (task.assignedTo && task.assignedTo._id.toString() !== req.user._id.toString()) {
      emitToUser(io, task.assignedTo._id, 'task:updated', task);
    }
    emitToTask(io, task._id, 'task:updated', task);

    const newAssignee = task.assignedTo?._id?.toString();

    // Notify new assignee if changed
    if (req.body.assignedTo && newAssignee !== oldAssignee && newAssignee !== req.user._id.toString()) {
      await createAndEmitNotification(io, {
        recipient: newAssignee,
        sender: req.user._id,
        type: 'task_assigned',
        message: `${req.user.name} assigned you the task: "${task.title}"`,
        taskId: task._id,
      });
    }

    // Notify assignee of status update
    if (req.body.status && req.body.status !== oldStatus && task.assignedTo) {
      const recipientId = task.assignedTo._id?.toString() || task.assignedTo.toString();
      if (recipientId !== req.user._id.toString()) {
        const notifType = req.body.status === 'completed' ? 'task_completed' : 'task_updated';
        await createAndEmitNotification(io, {
          recipient: recipientId,
          sender: req.user._id,
          type: notifType,
          message: `Task "${task.title}" status changed to ${req.body.status}`,
          taskId: task._id,
        });
      }
    }
  }

  // Activity Log
  let actionStr = 'updated';
  let detailStr = `Updated task "${task.title}"`;
  if (req.body.status && req.body.status !== oldStatus) {
    actionStr = 'status_changed';
    detailStr = `Changed status of "${task.title}" to ${req.body.status}`;
  } else if (req.body.assignedTo && req.body.assignedTo !== oldAssignee) {
    actionStr = 'assigned';
    detailStr = `Reassigned task "${task.title}"`;
  }

  await Activity.create({
    user: req.user._id,
    action: actionStr,
    targetTask: task._id,
    details: detailStr,
  });
  if (io) emitToAdmins(io, 'activity:new', {});

  res.status(200).json({ success: true, data: task });
};

// ─── @route  DELETE /api/tasks/:id (admin only) ──────────────────────────────
exports.deleteTask = async (req, res) => {
  const io = req.app.get('io');
  const Comment = require('../models/Comment');
  const Notification = require('../models/Notification');

  const task = await Task.findByIdAndDelete(req.params.id);
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found.' });
  }

  // Cascading deletes to prevent orphaned data
  await Promise.all([
    Comment.deleteMany({ task: task._id }),
    Notification.deleteMany({ task: task._id }),
    Activity.deleteMany({ targetTask: task._id }),
  ]);

  if (io) {
    emitToAdmins(io, 'task:deleted', { taskId: req.params.id });
    if (task.assignedTo) {
      emitToUser(io, task.assignedTo, 'task:deleted', { taskId: req.params.id });
    }
  }

  await Activity.create({
    user: req.user._id,
    action: 'deleted',
    details: `Deleted task "${task.title}"`,
  });
  if (io) emitToAdmins(io, 'activity:new', {});

  res.status(200).json({ success: true, message: 'Task deleted successfully.' });
};

// ─── @route  PATCH /api/tasks/:id/assign (admin only) ────────────────────────
exports.assignTask = async (req, res) => {
  const io = req.app.get('io');
  const { userId } = req.body;

  const [task, user] = await Promise.all([
    Task.findById(req.params.id),
    User.findById(userId),
  ]);

  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  task.assignedTo = userId;
  await task.save();
  await task.populate('assignedTo', 'name email avatar');

  if (io) {
    emitToAdmins(io, 'task:updated', task);
    emitToUser(io, userId, 'task:updated', task);
    await createAndEmitNotification(io, {
      recipient: userId,
      sender: req.user._id,
      type: 'task_assigned',
      message: `${req.user.name} assigned you the task: "${task.title}"`,
      taskId: task._id,
    });
  }

  await Activity.create({
    user: req.user._id,
    action: 'assigned',
    targetTask: task._id,
    details: `Assigned task "${task.title}" to ${user.name}`,
  });
  if (io) emitToAdmins(io, 'activity:new', {});

  res.status(200).json({ success: true, data: task });
};

// ─── @route  GET /api/tasks/stats ────────────────────────────────────────────
exports.getTaskStats = async (req, res) => {
  const matchFilter = req.user.role === 'member' ? { assignedTo: req.user._id } : {};

  const stats = await Task.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const priorityStats = await Task.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: '$priority',
        count: { $sum: 1 },
      },
    },
  ]);

  const overdueCount = await Task.countDocuments({
    ...matchFilter,
    dueDate: { $lt: new Date() },
    status: { $ne: 'completed' },
  });

  res.status(200).json({
    success: true,
    data: { byStatus: stats, byPriority: priorityStats, overdueCount },
  });
};
