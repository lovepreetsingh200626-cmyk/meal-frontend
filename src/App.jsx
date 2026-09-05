import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import AuthModal from './components/AuthModal';
import Navbar from './components/Navbar';
import ProfileModal from './components/ProfileModal';

// Student Pages
import StudentOverview from './pages/student/StudentOverview';
import StudentLogger from './pages/student/StudentLogger';
import StudentLedgerPage from './pages/student/StudentLedgerPage';
import StudentComplaintsPage from './pages/student/StudentComplaintsPage';
import StudentPaymentPage from './pages/student/StudentPaymentPage';

// Admin Dashboard
import AdminDashboard from './components/AdminDashboard'; 

function AppRoutes() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      try { 
        setUser(JSON.parse(storedUser)); 
      } catch (e) { 
        localStorage.clear(); 
      }
    }
    setLoadingUser(false);
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/student');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate('/login');
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans select-none">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mb-4" />
        <div className="text-slate-200 font-black uppercase tracking-widest text-xs">
          Synchronizing Statutory Cooperative Framework...
        </div>
        <div className="text-[10px] text-slate-500 font-mono uppercase mt-1">
          Autonomous Residential Authority &bull; Central Audit Registry
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-100 text-slate-900 font-sans">
      <Routes>
        {/* ROOT PATH REDIRECT */}
        <Route 
          path="/" 
          element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} replace />} 
        />

        {/* AUTHENTICATION ROUTE */}
        <Route 
          path="/login" 
          element={!user ? <AuthModal onLoginSuccess={handleLoginSuccess} /> : <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />} 
        />

        {/* STUDENT MULTI-PAGE ROUTES */}
        <Route 
          path="/student" 
          element={
            user && user.role === 'student' ? (
              <>
                <Navbar user={user} onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
                <StudentOverview user={user} onOpenProfile={() => setIsProfileModalOpen(true)} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/student/logger" 
          element={
            user && user.role === 'student' ? (
              <>
                <Navbar user={user} onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
                <StudentLogger user={user} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/student/ledger" 
          element={
            user && user.role === 'student' ? (
              <>
                <Navbar user={user} onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
                <StudentLedgerPage user={user} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        <Route 
          path="/student/complaints" 
          element={
            user && user.role === 'student' ? (
              <>
                <Navbar user={user} onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
                <StudentComplaintsPage user={user} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
        
        {/* REGISTERED FEE & RECEIPT PAYMENT DESK ROUTE */}
        <Route 
          path="/student/payments" 
          element={
            user && user.role === 'student' ? (
              <>
                <Navbar user={user} onLogout={handleLogout} onOpenProfile={() => setIsProfileModalOpen(true)} />
                <StudentPaymentPage user={user} />
              </>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* ADMIN ROUTE */}
        <Route 
          path="/admin/*" 
          element={
            user && user.role === 'admin' ? (
              <AdminDashboard 
                user={user} 
                onLogout={handleLogout} 
                onUpdateUser={handleUpdateUser} 
                onOpenProfile={() => setIsProfileModalOpen(true)} 
              />
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />

        {/* CATCH-ALL REDIRECT */}
        <Route path="*" element={<Navigate to={user ? (user.role === 'admin' ? '/admin' : '/student') : '/login'} replace />} />
      </Routes>

      {/* POPUP MODAL OVERLAY */}
      {isProfileModalOpen && user && (
        <ProfileModal 
          user={user} 
          onClose={() => setIsProfileModalOpen(false)} 
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