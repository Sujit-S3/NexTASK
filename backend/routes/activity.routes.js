const express = require('express');
const { getActivities } = require('../controllers/activityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.route('/').get(getActivities);

module.exports = router;
