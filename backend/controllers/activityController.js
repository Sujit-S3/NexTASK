const Activity = require('../models/Activity');

exports.getActivities = async (req, res) => {
  const { limit = 20 } = req.query;
  const activities = await Activity.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .populate('user', 'name avatar')
    .populate('targetTask', 'title status priority');

  res.status(200).json({
    success: true,
    data: activities,
  });
};
