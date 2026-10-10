import React, { useState, useEffect } from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate
} from 'react-router-dom';

import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import StudentDashboard from './components/StudentDashboard';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminMeals from './pages/admin/AdminMeals';
import AdminPayments from './pages/admin/AdminPayments';
import AdminComplaints from './pages/admin/AdminComplaints';
import AdminNotices from './pages/admin/AdminNotices';
import AdminSettings from './pages/admin/AdminSettings';

function AppRoutes() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] =
    useState(false);

  // =========================================================
  // RESTORE LOGIN SESSION
  // =========================================================

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');

    if (storedUser && token) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error(
          'Failed to restore saved user:',
          error
        );

        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }

    setLoadingUser(false);
  }, []);

  // =========================================================
  // LOGIN
  // =========================================================

  const handleLoginSuccess = (userData) => {
    if (!userData) {
      return;
    }

    setUser(userData);

    localStorage.setItem(
      'user',
      JSON.stringify(userData)
    );

    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  // =========================================================
  // LOGOUT
  // =========================================================

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');

    setUser(null);
    setIsProfileModalOpen(false);

    navigate('/login');
  };

  // =========================================================
  // UPDATE USER
  // =========================================================

  const handleUpdateUser = (updatedUser) => {
    if (!updatedUser) {
      return;
    }

    setUser(updatedUser);

    localStorage.setItem(
      'user',
      JSON.stringify(updatedUser)
    );
  };

  // =========================================================
  // INITIAL SESSION LOADING
  // =========================================================

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans select-none px-4">

        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-4" />

        <div className="text-slate-200 font-black uppercase tracking-widest text-xs text-center">
          Synchronizing Statutory Cooperative Framework...
        </div>

        <div className="text-[10px] text-slate-500 font-mono uppercase mt-1 text-center">
          Autonomous Residential Authority • Central Audit Registry
        </div>

      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 font-sans">

      <Routes>

        {/* =====================================================
            ROOT
        ===================================================== */}

        <Route
          path="/"
          element={
            <Navigate
              to={
                user
                  ? user.role === 'admin'
                    ? '/admin'
                    : '/student'
                  : '/login'
              }
              replace
            />
          }
        />

        {/* =====================================================
            LOGIN
        ===================================================== */}

        <Route
          path="/login"
          element={
            !user ? (
              <AuthModal
                onLoginSuccess={handleLoginSuccess}
              />
            ) : (
              <Navigate
                to={
                  user.role === 'admin'
                    ? '/admin'
                    : '/student'
                }
                replace
              />
            )
          }
        />

        {/* =====================================================
            STUDENT PORTAL
        ===================================================== */}

        <Route
          path="/student"
          element={
            user && user.role === 'student' ? (
              <StudentDashboard
                user={user}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =====================================================
            ADMIN PORTAL
        ===================================================== */}

        <Route
          path="/admin"
          element={
            user && user.role === 'admin' ? (
              <AdminLayout
                user={user}
                onLogout={handleLogout}
                onUpdateUser={handleUpdateUser}
              />
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        >
          <Route
            index
            element={<AdminOverview />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="meals"
            element={<AdminMeals />}
          />

          <Route
            path="payments"
            element={<AdminPayments />}
          />

          <Route
            path="complaints"
            element={<AdminComplaints />}
          />

          <Route
            path="notices"
            element={<AdminNotices />}
          />

          <Route
            path="settings"
            element={<AdminSettings />}
          />

        </Route>

        {/* =====================================================
            UNKNOWN ROUTES
        ===================================================== */}

        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? user.role === 'admin'
                    ? '/admin'
                    : '/student'
                  : '/login'
              }
              replace
            />
          }
        />

      </Routes>

      {/* =======================================================
          GLOBAL PROFILE MODAL
      ======================================================= */}

      {isProfileModalOpen && user && (
        <ProfileModal
          user={user}
          onClose={() =>
            setIsProfileModalOpen(false)
          }
          onUpdateUser={handleUpdateUser}
        />
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
