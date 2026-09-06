import React, { useState } from 'react';
import StudentAuthModal from './StudentAuthModal';
import AdminAuthModal from './AdminAuthModal';

export default function AuthModal({ onLoginSuccess }) {
  const [portalMode, setPortalMode] = useState('student');

  if (portalMode === 'admin') {
    return (
      <AdminAuthModal
        onLoginSuccess={onLoginSuccess}
        onSwitchToStudent={() => setPortalMode('student')}
      />
    );
  }

  return (
    <StudentAuthModal
      onLoginSuccess={onLoginSuccess}
      onSwitchToAdmin={() => setPortalMode('admin')}
    />
  );
}