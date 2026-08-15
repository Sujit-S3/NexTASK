require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const { initSocket } = require('./config/socket');

// ── Server setup ──────────────────────────────────────────────────────────────
const httpServer = http.createServer(app);

const clientOrigin = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\r?\n|\r/g, '').trim();

// ── Socket.IO ─────────────────────────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: clientOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// ── Initialize Socket.IO events ───────────────────────────────────────────────
initSocket(io);

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Validate critical environment variables
  if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI is not defined.');
    process.exit(1);
  }
  if (!process.env.JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET is not defined.');
    process.exit(1);
  }

  await connectDB();
  const { ensureAdminUser } = require('./createAdmin');
  await ensureAdminUser();

  httpServer.listen(PORT, () => {
    console.log(`\n🚀 NexTASK API running in ${process.env.NODE_ENV} mode`);
    console.log(`📡 Server: http://localhost:${PORT}`);
    console.log(`❤️  Health: http://localhost:${PORT}/health`);
    console.log(`🔌 Socket.IO ready\n`);
  });
};

startServer();

// ── Graceful shutdown ─────────────────────────────────────────────────────────
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  httpServer.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
});

// Nodemon graceful restart handling
process.once('SIGUSR2', () => {
  httpServer.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  httpServer.close(() => process.exit(1));
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Promise Rejection:', reason);
  httpServer.close(() => process.exit(1));
});
