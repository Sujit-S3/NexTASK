const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Track online users: Map<userId, socketId>
const onlineUsers = new Map();

const initSocket = (io) => {
  // ─── Authentication Middleware ───────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication error: No token'));
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('role isActive');
      if (!user || !user.isActive) return next(new Error('Authentication error: User inactive or not found'));
      
      socket.userId = user._id.toString();
      socket.userRole = user.role;
      next();
    } catch (err) {
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (User: ${socket.userId}, Role: ${socket.userRole})`);

    // Automatically join personal room
    socket.join(socket.userId);
    // Automatically join admins room if admin
    if (socket.userRole === 'admin') {
      socket.join('admins');
    }

    onlineUsers.set(socket.userId, socket.id);
    io.emit('users:online', Array.from(onlineUsers.keys()));
    console.log(`👤 User ${socket.userId} joined. Online: ${onlineUsers.size}`);

    // ─── Task events (emitted by controllers, forwarded here) ────────────
    socket.on('task:join', (taskId) => {
      socket.join(`task:${taskId}`);
    });

    socket.on('task:leave', (taskId) => {
      socket.leave(`task:${taskId}`);
    });

    // ─── Typing indicator in comments ────────────────────────────────────
    socket.on('comment:typing', ({ taskId, userName }) => {
      socket.to(`task:${taskId}`).emit('comment:typing', { userName });
    });

    socket.on('comment:stop-typing', ({ taskId }) => {
      socket.to(`task:${taskId}`).emit('comment:stop-typing');
    });

    // ─── Disconnect ───────────────────────────────────────────────────────
    socket.on('disconnect', () => {
      if (socket.userId) {
        onlineUsers.delete(socket.userId);
        io.emit('users:online', Array.from(onlineUsers.keys()));
        console.log(`🔌 User ${socket.userId} disconnected. Online: ${onlineUsers.size}`);
      }
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
};

// ─── Helper: emit notification to a specific user ────────────────────────────
const emitToUser = (io, userId, event, data) => {
  io.to(userId.toString()).emit(event, data);
};

// ─── Helper: emit to all connected clients ───────────────────────────────────
const emitToAll = (io, event, data) => {
  io.emit(event, data);
};

// ─── Helper: emit to all admins ──────────────────────────────────────────────
const emitToAdmins = (io, event, data) => {
  io.to('admins').emit(event, data);
};

// ─── Helper: emit to a task room ─────────────────────────────────────────────
const emitToTask = (io, taskId, event, data) => {
  io.to(`task:${taskId}`).emit(event, data);
};

// ─── Helper: create & emit notification ──────────────────────────────────────
const createAndEmitNotification = async (io, { recipient, sender, type, message, taskId }) => {
  try {
    const notification = await Notification.create({
      recipient,
      sender,
      type,
      message,
      task: taskId,
    });

    await notification.populate([
      { path: 'sender', select: 'name avatar' },
      { path: 'task', select: 'title' },
    ]);

    emitToUser(io, recipient, 'notification:new', notification);
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};

module.exports = {
  initSocket,
  emitToUser,
  emitToAll,
  emitToAdmins,
  emitToTask,
  createAndEmitNotification,
  onlineUsers,
};
