import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';
import AdminDashboard from './components/AdminDashboard';
import StudentProfile from './components/StudentProfile';

export default function App() {
  const [user, setUser] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // Tracks whether to show 'dashboard' or 'profile'

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
    setCurrentView('dashboard'); // Reset view on logout
  };

  // Handle updating the global user state after a profile edit (Used by both Students and Admins)
  const handleUpdateUser = (updatedUserData) => {
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
    if (user.role !== 'admin') {
      setCurrentView('dashboard'); // Automatically go back to dashboard after saving (for students)
    }
  };

  return (
    <div>
      {/* 1. Not logged in -> Show Authentication Modal */}
      {!user ? (
        <AuthModal onLoginSuccess={(userData) => setUser(userData)} />
      ) : user.role === 'admin' ? (
        /* 2. Logged in as Admin -> Show Executive Admin Dashboard */
        <AdminDashboard 
          user={user} 
          onLogout={handleLogout} 
          onUpdateUser={handleUpdateUser} // <-- ADDED THIS PROP HERE
        />
      ) : currentView === 'profile' ? (
        /* 3. Student clicked "Edit Profile" -> Show Profile Form */
        <StudentProfile 
          user={user} 
          onUpdateSuccess={handleUpdateUser} 
          onBack={() => setCurrentView('dashboard')} 
        />
      ) : (
        /* 4. Default logged in as Student -> Show Student Mess Dashboard */
        <StudentDashboard 
          user={user} 
          onLogout={handleLogout} 
          onOpenProfile={() => setCurrentView('profile')} 
        />
      )}
    </div>
  );
}