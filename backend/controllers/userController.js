const { body } = require('express-validator');
const User = require('../models/User');
const Task = require('../models/Task');

// ─── Validation rules ─────────────────────────────────────────────────────────
exports.createUserValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Role must be admin or member'),
];

exports.updateUserValidation = [
  body('name').optional().trim().isLength({ min: 2, max: 50 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('role').optional().isIn(['admin', 'member']),
  body('department').optional().trim().isLength({ max: 100 }),
  body('jobTitle').optional().trim().isLength({ max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
];

// ─── @route  GET /api/users ───────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  const { search, role, isActive, page = 1, limit = 20, sort = '-createdAt' } = req.query;

  const filter = {};
  if (search) filter.$or = [
    { name: { $regex: search, $options: 'i' } },
    { email: { $regex: search, $options: 'i' } },
  ];
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true';

  const skip = (Number(page) - 1) * Number(limit);
  const [users, total] = await Promise.all([
    User.find(filter).sort(sort).skip(skip).limit(Number(limit)).lean(),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: users,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      limit: Number(limit),
    },
  });
};

// ─── @route  GET /api/users/:id ──────────────────────────────────────────────
exports.getUserById = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Attach task stats
  const [assignedCount, completedCount] = await Promise.all([
    Task.countDocuments({ assignedTo: user._id }),
    Task.countDocuments({ assignedTo: user._id, status: 'completed' }),
  ]);

  res.status(200).json({
    success: true,
    data: { ...user.toObject(), stats: { assignedCount, completedCount } },
  });
};

// ─── @route  POST /api/users (admin only) ────────────────────────────────────
exports.createUser = async (req, res) => {
  const { name, email, password, role, department, jobTitle } = req.body;

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  const user = await User.create({ name, email, password, role, department, jobTitle });

  res.status(201).json({ success: true, data: user });
};

// ─── @route  PUT /api/users/:id ──────────────────────────────────────────────
exports.updateUser = async (req, res) => {
  // Prevent non-admins from updating other users
  if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  // Prevent members from changing their own role or active status
  if (req.user.role !== 'admin') {
    if (req.body.role) delete req.body.role;
    if (req.body.isActive !== undefined) delete req.body.isActive;
  }

  // Don't allow password change via this route
  delete req.body.password;

  const allowedFields = ['name', 'email', 'role', 'avatar', 'department', 'jobTitle', 'bio', 'isActive'];
  const updateData = {};
  allowedFields.forEach((f) => { if (req.body[f] !== undefined) updateData[f] = req.body[f]; });

  const user = await User.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  res.status(200).json({ success: true, data: user });
};

// ─── @route  DELETE /api/users/:id (admin only) ──────────────────────────────
exports.deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString()) {
    return res.status(400).json({ success: false, message: 'You cannot delete your own account.' });
  }

  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Unassign tasks
  await Task.updateMany({ assignedTo: req.params.id }, { assignedTo: null });

  res.status(200).json({ success: true, message: 'User deleted successfully.' });
};

// ─── @route  PATCH /api/users/:id/toggle-status (admin only) ─────────────────
exports.toggleUserStatus = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

  user.isActive = !user.isActive;
  await user.save();

  res.status(200).json({
    success: true,
    message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
    data: user,
  });
};

// ─── @route  GET /api/users/me/profile ───────────────────────────────────────
exports.getMyProfile = async (req, res) => {
  const user = await User.findById(req.user._id);
  const [assignedCount, completedCount, inProgressCount] = await Promise.all([
    Task.countDocuments({ assignedTo: req.user._id }),
    Task.countDocuments({ assignedTo: req.user._id, status: 'completed' }),
    Task.countDocuments({ assignedTo: req.user._id, status: 'in-progress' }),
  ]);

  res.status(200).json({
    success: true,
    data: {
      ...user.toObject(),
      stats: { assignedCount, completedCount, inProgressCount },
    },
  });
};
