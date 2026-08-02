const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const User = require('../models/User');

// ─── Token generator helpers ──────────────────────────────────────────────────
const signAccessToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '1h' });

const signRefreshToken = (id) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d',
  });

const sendTokenResponse = async (user, statusCode, res) => {
  const accessToken = signAccessToken(user._id);
  const refreshToken = signRefreshToken(user._id);

  // Persist refresh token on user doc
  await User.findByIdAndUpdate(user._id, { refreshToken });

  // Strip sensitive fields
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken;

  res.status(statusCode).json({
    success: true,
    accessToken,
    refreshToken,
    user: userData,
  });
};

// ─── Validation rules (exported for routes) ───────────────────────────────────
exports.registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 50 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
];

exports.loginValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email already registered.' });
  }

  // Self-registration is always a member; admin accounts are created via POST /api/users.
  const user = await User.create({ name, email, password, role: 'member' });
  await sendTokenResponse(user, 201, res);
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  if (!user.isActive) {
    return res
      .status(401)
      .json({ success: false, message: 'Account deactivated. Contact an admin.' });
  }

  await sendTokenResponse(user, 200, res);
};

// ─── @route  POST /api/auth/logout ───────────────────────────────────────────
exports.logout = async (req, res) => {
  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
  }
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

// ─── @route  GET /api/auth/me ────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, user });
};

// ─── @route  POST /api/auth/refresh-token ────────────────────────────────────
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: 'Refresh token required.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findOne({ _id: decoded.id }).select('+refreshToken');

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: 'Invalid refresh token.' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account deactivated. Contact an admin.' });
    }

    const newAccessToken = signAccessToken(user._id);
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch {
    res.status(401).json({ success: false, message: 'Refresh token expired or invalid.' });
  }
};

// ─── @route  PATCH /api/auth/change-password ─────────────────────────────────
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(currentPassword))) {
    return res.status(401).json({ success: false, message: 'Current password is incorrect.' });
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully.' });
};
