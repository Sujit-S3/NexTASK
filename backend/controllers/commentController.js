const { body } = require('express-validator');
const Comment = require('../models/Comment');
const Task = require('../models/Task');
const { createAndEmitNotification, emitToTask } = require('../config/socket');
const { getPagination } = require('../utils/pagination');

// ─── Validation ───────────────────────────────────────────────────────────────
exports.commentValidation = [
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Comment content is required')
    .isLength({ max: 1000 })
    .withMessage('Comment cannot exceed 1000 characters'),
];

// ─── @route  GET /api/tasks/:taskId/comments ──────────────────────────────────
exports.getComments = async (req, res) => {
  const { taskId } = req.params;
  const { page, limit, skip } = getPagination(req.query, 50);

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  // Members can only view comments on their tasks
  if (
    req.user.role === 'member' &&
    task.assignedTo?.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const [comments, total] = await Promise.all([
    Comment.find({ task: taskId })
      .populate('author', 'name email avatar role')
      .sort('createdAt')
      .skip(skip)
      .limit(limit)
      .lean(),
    Comment.countDocuments({ task: taskId }),
  ]);

  res.status(200).json({
    success: true,
    data: comments,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
  });
};

// ─── @route  POST /api/tasks/:taskId/comments ────────────────────────────────
exports.addComment = async (req, res) => {
  const io = req.app.get('io');
  const { taskId } = req.params;
  const { content } = req.body;

  const task = await Task.findById(taskId).populate('assignedTo', 'name _id').populate('createdBy', 'name _id');
  if (!task) return res.status(404).json({ success: false, message: 'Task not found.' });

  // Members can only comment on their tasks
  if (
    req.user.role === 'member' &&
    task.assignedTo?._id?.toString() !== req.user._id.toString()
  ) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const comment = await Comment.create({
    task: taskId,
    author: req.user._id,
    content,
  });

  await comment.populate('author', 'name email avatar role');

  // Real-time: broadcast to task room
  if (io) {
    emitToTask(io, taskId, 'comment:new', comment);

    // Notify task owner/assignee (not the commenter)
    const recipients = new Set();
    if (task.createdBy?._id && task.createdBy._id.toString() !== req.user._id.toString()) {
      recipients.add(task.createdBy._id.toString());
    }
    if (task.assignedTo?._id && task.assignedTo._id.toString() !== req.user._id.toString()) {
      recipients.add(task.assignedTo._id.toString());
    }

    for (const recipientId of recipients) {
      await createAndEmitNotification(io, {
        recipient: recipientId,
        sender: req.user._id,
        type: 'comment_added',
        message: `${req.user.name} commented on "${task.title}"`,
        taskId: task._id,
      });
    }
  }

  res.status(201).json({ success: true, data: comment });
};

// ─── @route  PUT /api/tasks/:taskId/comments/:commentId ──────────────────────
exports.updateComment = async (req, res) => {
  const io = req.app.get('io');
  const { taskId, commentId } = req.params;

  const comment = await Comment.findOne({ _id: commentId, task: taskId });
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You can only edit your own comments.' });
  }

  comment.content = req.body.content;
  await comment.save();
  await comment.populate('author', 'name email avatar role');

  if (io) emitToTask(io, taskId, 'comment:updated', comment);

  res.status(200).json({ success: true, data: comment });
};

// ─── @route  DELETE /api/tasks/:taskId/comments/:commentId ───────────────────
exports.deleteComment = async (req, res) => {
  const io = req.app.get('io');
  const { taskId, commentId } = req.params;

  const comment = await Comment.findOne({ _id: commentId, task: taskId });
  if (!comment) return res.status(404).json({ success: false, message: 'Comment not found.' });

  if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You can only delete your own comments.' });
  }

  await comment.deleteOne();
  if (io) emitToTask(io, taskId, 'comment:deleted', { commentId });

  res.status(200).json({ success: true, message: 'Comment deleted.' });
};
