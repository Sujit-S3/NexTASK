import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { ThemeProvider } from './contexts/ThemeContext';
import { SocketProvider } from './contexts/SocketContext';
import { AIProvider } from './context/AIContext';
import { CursorProvider } from './components/cursor/CursorProvider';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AIAssistantPanel from './components/common/AIAssistantPanel';

import Landing    from './pages/Landing';
import Login      from './pages/Login';
import Register   from './pages/Register';
import Dashboard  from './pages/Dashboard';
import Tasks      from './pages/Tasks';
import TaskDetail from './pages/TaskDetail';
import CreateTask from './pages/CreateTask';
import Users      from './pages/Users';
import Profile    from './pages/Profile';
import NotFound   from './pages/NotFound';

export default function App() {
  const { isAuthenticated } = useSelector((s) => s.auth);

  return (
    <ThemeProvider>
      <CursorProvider>
        <BrowserRouter>
          <SocketProvider>
            <AIProvider>
              <Routes>
              {/* ── Landing ─────────────────────────────────────────────── */}
              <Route
                path="/"
                element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />}
              />

              {/* ── Auth routes ─────────────────────────────────────────── */}
              <Route element={<AuthLayout />}>
                <Route
                  path="/login"
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
                />
                <Route
                  path="/register"
                  element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />}
                />
              </Route>

              {/* ── Protected app routes ───────────────────────────────── */}
              <Route element={<ProtectedRoute />}>
                <Route element={<RootLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/tasks"     element={<Tasks />} />
                  <Route path="/tasks/new" element={
                    <ProtectedRoute roles={['admin']}><CreateTask /></ProtectedRoute>
                  } />
                  <Route path="/tasks/:id" element={<TaskDetail />} />
                  <Route path="/users"     element={
                    <ProtectedRoute roles={['admin']}><Users /></ProtectedRoute>
                  } />
                  <Route path="/profile"   element={<Profile />} />
                </Route>
              </Route>

              {/* ── 404 ─────────────────────────────────────────────────── */}
              <Route path="*" element={<NotFound />} />
            </Routes>

            <Toaster
              position="top-center"
              gutter={10}
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(10,17,35,0.92)',
                  backdropFilter: 'blur(24px)',
                  WebkitBackdropFilter: 'blur(24px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '1rem',
                  padding: '12px 16px',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: 'rgba(241,245,249,0.95)',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
                },
                success: {
                  iconTheme: { primary: '#10b981', secondary: 'rgba(10,17,35,0.9)' },
                },
                error: {
                  iconTheme: { primary: '#ef4444', secondary: 'rgba(10,17,35,0.9)' },
                },
              }}
            />
            <AIAssistantPanel />
            </AIProvider>
          </SocketProvider>
        </BrowserRouter>
      </CursorProvider>
    </ThemeProvider>
  );
}
