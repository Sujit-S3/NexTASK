const express = require('express');
const router = express.Router();

const { getAdminDashboard, getUserDashboard } = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/authorize');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/user', getUserDashboard);

module.exports = router;
