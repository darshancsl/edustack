import * as React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import VerifyEmailSent from './pages/VerifyEmailSent';
import Welcome from './pages/Welcome';
import Profile from './pages/Profile';
import { authStore } from './store/auth';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Courses from './pages/Courses';
import About from './pages/About';
import Contact from './pages/Contact';
import CourseDetail from './pages/CourseDetail';
import AdminCoursesList from './pages/admin/AdminCoursesList';
import AdminCourseForm from './pages/admin/AdminCourseForm';
import CoursesCatalog from './pages/Courses';
import Checkout from './pages/Checkout';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import { trackPageView } from './lib/analytics';
import AdminLayout from './layouts/AdminLayout';
import RootLayout from './layouts/RootLayout';

function AdminRoute({ children }: { children: JSX.Element }) {
  if (!authStore.state.ready) return null;
  const { user } = authStore.state;
  if (!authStore.state.token) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}

function PrivateRoute({ children }: { children: JSX.Element }) {
  // When not ready yet, avoid flicker
  if (!authStore.state.ready) return null;
  return authStore.state.token ? children : <Navigate to="/login" replace />;
}

function Bootstrapper({ children }: { children: React.ReactNode }) {
  const [, force] = React.useReducer((x) => x + 1, 0);

  // re-render when authStore updates
  React.useEffect(() => authStore.subscribe(force), []);

  // hydrate once on mount
  React.useEffect(() => {
    authStore.hydrate();
  }, []);

  // Capture token from /welcome?token=... on first load after verification
  const location = useLocation();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const newToken = params.get('token');
    if (newToken) {
      authStore.setToken(newToken);
      // re-hydrate to fetch /me
      authStore.hydrate();
      // optional: clean URL
      window.history.replaceState({}, '', location.pathname + '?verified=1');
    }
  }, [location]);


  React.useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Bootstrapper>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/checkout" element={
            <PrivateRoute>
              <Checkout />
            </PrivateRoute>
          } />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:slug" element={<CourseDetail />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/admin/courses/new"
            element={
              <AdminRoute>
                <AdminCourseForm mode="create" />
              </AdminRoute>
            }
          />
          <Route path="/courses" element={<CoursesCatalog />} />
            <Route
              path="admin"
              element={
                <AdminRoute>
                  <AdminLayout />   {/* ⬅️ Sidebar layout */}
                </AdminRoute>
              }
            >
              <Route index element={<AdminAnalytics />} />                {/* /admin -> Analytics */}
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="courses" element={<AdminCoursesList />} />
              <Route path="courses/new" element={<AdminCourseForm mode="create" />} />
              <Route path="courses/:slug/edit" element={<AdminCourseForm mode="edit" />} />
              <Route path="*" element={<Navigate to="analytics" replace />} />
            </Route>
        </Routes>
      </Bootstrapper>
    </BrowserRouter>
  );
}
