const Task = require('../models/Task');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ─── @route  GET /api/dashboard/admin ────────────────────────────────────────
exports.getAdminDashboard = async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  // Task completion trend for last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  });

  const [
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    reviewTasks,
    overdueTasks,
    totalUsers,
    activeUsers,
    tasksThisMonth,
    tasksLastMonth,
    tasksByPriority,
    tasksByStatus,
    recentActivity,
    teamPerformance,
    completionTrend,
  ] = await Promise.all([
    Task.countDocuments({ isArchived: false }),
    Task.countDocuments({ status: 'completed', isArchived: false }),
    Task.countDocuments({ status: 'in-progress', isArchived: false }),
    Task.countDocuments({ status: 'todo', isArchived: false }),
    Task.countDocuments({ status: 'review', isArchived: false }),
    Task.countDocuments({ dueDate: { $lt: now }, status: { $ne: 'completed' }, isArchived: false }),
    User.countDocuments(),
    User.countDocuments({ isActive: true }),
    Task.countDocuments({ createdAt: { $gte: startOfMonth }, isArchived: false }),
    Task.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }, isArchived: false }),

    // Tasks by priority
    Task.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),

    // Tasks by status (for chart)
    Task.aggregate([
      { $match: { isArchived: false } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),

    // Recent 10 notifications as activity feed
    Notification.find()
      .populate('sender', 'name avatar')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(10)
      .lean(),

    // Team performance: tasks completed per user
    Task.aggregate([
      { $match: { status: 'completed', assignedTo: { $ne: null } } },
      { $group: { _id: '$assignedTo', completed: { $sum: 1 } } },
      { $sort: { completed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          name: '$user.name',
          avatar: '$user.avatar',
          email: '$user.email',
          completed: 1,
        },
      },
    ]),

    // Task completion trend for the last 7 days
    Task.aggregate([
      {
        $match: {
          completedAt: { $gte: last7Days[0] },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$completedAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  const trendMap = new Map(completionTrend.map((d) => [d._id, d.count]));
  const trend = last7Days.map((d) => ({
    date: d.toISOString().split('T')[0],
    count: trendMap.get(d.toISOString().split('T')[0]) || 0,
  }));

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const taskGrowth =
    tasksLastMonth > 0
      ? Math.round(((tasksThisMonth - tasksLastMonth) / tasksLastMonth) * 100)
      : 100;

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        reviewTasks,
        overdueTasks,
        totalUsers,
        activeUsers,
        completionRate,
        taskGrowth,
        tasksThisMonth,
      },
      charts: {
        tasksByPriority,
        tasksByStatus,
        completionTrend: trend,
      },
      recentActivity,
      teamPerformance,
    },
  });
};

// ─── @route  GET /api/dashboard/user ─────────────────────────────────────────
exports.getUserDashboard = async (req, res) => {
  const userId = req.user._id;
  const now = new Date();

  const [
    myTasks,
    completedCount,
    inProgressCount,
    overdueCount,
    upcomingTasks,
    recentNotifications,
  ] = await Promise.all([
    Task.countDocuments({ assignedTo: userId, isArchived: false }),
    Task.countDocuments({ assignedTo: userId, status: 'completed' }),
    Task.countDocuments({ assignedTo: userId, status: 'in-progress' }),
    Task.countDocuments({
      assignedTo: userId,
      dueDate: { $lt: now },
      status: { $ne: 'completed' },
    }),
    Task.find({
      assignedTo: userId,
      dueDate: { $gte: now },
      status: { $ne: 'completed' },
    })
      .populate('createdBy', 'name avatar')
      .sort('dueDate')
      .limit(5)
      .lean({ virtuals: true }),
    Notification.find({ recipient: userId, isRead: false })
      .populate('sender', 'name avatar')
      .populate('task', 'title')
      .sort('-createdAt')
      .limit(10)
      .lean(),
  ]);

  res.status(200).json({
    success: true,
    data: {
      summary: {
        myTasks,
        completedCount,
        inProgressCount,
        overdueCount,
        completionRate: myTasks > 0 ? Math.round((completedCount / myTasks) * 100) : 0,
      },
      upcomingTasks,
      recentNotifications,
    },
  });
};
