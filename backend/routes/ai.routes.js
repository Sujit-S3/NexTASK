const express = require('express');
const rateLimit = require('express-rate-limit');
const { suggestTaskBreakdown, chat } = require('../controllers/aiController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Specific rate limit for AI routes to prevent abuse
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: { success: false, message: 'Too many AI requests. Please try again later.' },
});

router.use(protect);
router.use(aiLimiter);

router.post('/suggest', suggestTaskBreakdown);
router.post('/chat', chat);

module.exports = router;
