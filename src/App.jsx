import React, { useState, useEffect } from 'react';
import AuthModal from './components/AuthModal';
import StudentDashboard from './components/StudentDashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Retain login state across browser refreshes
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <div >
      {!user ? (
        <AuthModal onLoginSuccess={(userData) => setUser(userData)} />
      ) : (
        <StudentDashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}