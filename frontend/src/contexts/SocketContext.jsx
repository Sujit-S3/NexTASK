import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { socketTaskCreated, socketTaskUpdated, socketTaskDeleted } from '../store/taskSlice';
import { socketNotificationNew } from '../store/notificationSlice';
import { setOnlineUsers } from '../store/uiSlice';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [socketReady, setSocketReady] = useState(false);
  const dispatch  = useDispatch();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://nextask-backend-uiya.onrender.com';

    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      // A callback (not a plain object) so the token is re-read from
      // localStorage on every reconnection attempt, not just the first
      // connect — otherwise a socket that outlives a token refresh
      // reconnects with a stale token and can fail re-authentication.
      auth: (cb) => cb({ token: localStorage.getItem('tf_token') }),
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;
    setSocketReady(true);

    socket.on('connect', () => {
      console.log('🔌 Socket connected:', socket.id);
      socket.emit('user:join', user._id);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
    });

    // ── Task events ───────────────────────────────────────────────────────────
    socket.on('task:created', (task) => dispatch(socketTaskCreated(task)));
    socket.on('task:updated', (task) => dispatch(socketTaskUpdated(task)));
    socket.on('task:deleted', (data) => dispatch(socketTaskDeleted(data)));

    // ── Notification events ───────────────────────────────────────────────────
    socket.on('notification:new', (notif) => dispatch(socketNotificationNew(notif)));

    // ── Online users ──────────────────────────────────────────────────────────
    socket.on('users:online', (userIds) => dispatch(setOnlineUsers(userIds)));

    return () => {
      socket.off('task:created');
      socket.off('task:updated');
      socket.off('task:deleted');
      socket.off('notification:new');
      socket.off('users:online');
      socket.disconnect();
      socketRef.current = null;
      setSocketReady(false);
    };
  }, [isAuthenticated, user?._id]);

  const joinTaskRoom  = (taskId) => socketRef.current?.emit('task:join',  taskId);
  const leaveTaskRoom = (taskId) => socketRef.current?.emit('task:leave', taskId);
  const emitTyping    = (taskId, userName) => socketRef.current?.emit('comment:typing',      { taskId, userName });
  const emitStopTyping= (taskId)           => socketRef.current?.emit('comment:stop-typing', { taskId });

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, socketReady, joinTaskRoom, leaveTaskRoom, emitTyping, emitStopTyping }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);
