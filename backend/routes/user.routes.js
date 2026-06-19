const express = require('express');
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getMyProfile,
  createUserValidation,
  updateUserValidation,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

router.use(protect);

// Current user profile
router.get('/me/profile', getMyProfile);

// Admin-only: list & create
router.get('/', authorize('admin'), getUsers);
router.post('/', authorize('admin'), createUserValidation, validate, createUser);

// Admin or self: get by ID & update
router.get('/:id', getUserById);
router.put('/:id', updateUserValidation, validate, updateUser);

// Admin-only: delete & toggle status
router.delete('/:id', authorize('admin'), deleteUser);
router.patch('/:id/toggle-status', authorize('admin'), toggleUserStatus);

module.exports = router;
