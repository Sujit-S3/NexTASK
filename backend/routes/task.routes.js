const express = require('express');
const router = express.Router();

const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  assignTask,
  getTaskStats,
  createTaskValidation,
  updateTaskValidation,
} = require('../controllers/taskController');

const {
  getComments,
  addComment,
  updateComment,
  deleteComment,
  commentValidation,
} = require('../controllers/commentController');

const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');
const { validate } = require('../middleware/validate');

router.use(protect);

// Stats
router.get('/stats', getTaskStats);

// Tasks CRUD
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTaskValidation, validate, createTask);
router.put('/:id', updateTaskValidation, validate, updateTask);
router.delete('/:id', authorize('admin'), deleteTask);
router.patch('/:id/assign', assignTask);

// Comments (nested under tasks)
router.get('/:taskId/comments', getComments);
router.post('/:taskId/comments', commentValidation, validate, addComment);
router.put('/:taskId/comments/:commentId', commentValidation, validate, updateComment);
router.delete('/:taskId/comments/:commentId', deleteComment);

module.exports = router;
