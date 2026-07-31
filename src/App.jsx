import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard'; // 1. Import AdminDashboard

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retain login state across browser refreshes
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Failed to parse user from localStorage');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div>
      {/* 1. Not logged in -> Show Authentication Modal */}
      {!user ? (
        <AuthModal onLoginSuccess={(userData) => setUser(userData)} />
      ) : user.role === 'admin' ? (
        /* 2. Logged in as Admin -> Show Executive Admin Dashboard */
        <AdminDashboard user={user} onLogout={handleLogout} />
      ) : (
        /* 3. Logged in as Student -> Show Student Mess Dashboard */
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}