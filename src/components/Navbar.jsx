import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, Receipt, MessageSquareWarning, LayoutDashboard, 
  Users, BellRing, Settings, LogOut, User as UserIcon, CreditCard, ShieldCheck, RefreshCw 
} from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenProfile, activeAdminTab, onSelectAdminTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Meal Logger', path: '/student/logger', icon: Utensils },
    { name: 'My Ledger', path: '/student/ledger', icon: Receipt },
    { name: 'Fee & Receipt', path: '/student/payments', icon: CreditCard },
    { name: 'Grievances', path: '/student/complaints', icon: MessageSquareWarning },
  ];

  const adminLinks = [
    { name: 'Directory', tab: 'users', icon: Users },
    { name: 'Admins', tab: 'admins', icon: ShieldCheck },
    { name: 'Master Ledger', tab: 'meals', icon: Receipt },
    { name: 'Fee Settlements', tab: 'payments', icon: CreditCard },
    { name: 'Grievances', tab: 'complaints', icon: MessageSquareWarning },
    { name: 'Notices', tab: 'notices', icon: BellRing },
    { name: 'Configurations', tab: 'settings', icon: Settings },
  ];

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="bg-white border-b-2 border-gray-300 shadow-sm sticky top-0 z-50 font-sans print:hidden">
      
      {/* Top Banner Strip */}
      <div className="bg-amber-950 text-white py-1.5 px-4 text-[10px] font-semibold flex justify-between tracking-wider">
        <span className="uppercase">🛡️ Private & Unofficial Student Utility • Independent Mess Tracker</span>
        <span className="text-orange-300 uppercase">{isAdmin ? 'Executive Control Panel' : 'Student Cooperative Portal'}</span>
      </div>

      {/* User Profile Bar */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-200">
        <div 
          onClick={onOpenProfile} 
          className="flex items-center gap-3 cursor-pointer group hover:bg-gray-100 p-1.5 rounded-sm transition border border-transparent hover:border-gray-300"
          title="Click to Open Profile & Settings"
        >
          <div className="w-10 h-10 bg-blue-900 rounded-full text-white font-bold text-sm flex items-center justify-center border-2 border-orange-500 overflow-hidden shrink-0 shadow-xs">
            {user.profilePhoto ? (
              <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.name?.charAt(0).toUpperCase() || <UserIcon className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <h1 className="text-sm font-black text-blue-900 uppercase group-hover:underline">{user.name}</h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase">
              Roll: {user.rollNo || 'ADMIN'} | Hostel: {user.hostelNo || 'HQ'} <span className="text-orange-600 font-black ml-1">[ EDIT PROFILE ⚙️ ]</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* REFRESH COMPONENT BUTTON */}
          <button 
            onClick={handleRefresh} 
            className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-gray-100 border border-gray-400 text-gray-800 px-3 py-1.5 uppercase transition cursor-pointer shadow-xs rounded-sm"
            title="Refresh Data & Interface"
          >
            <RefreshCw className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Refresh</span>
          </button>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-1.5 text-xs font-bold bg-red-800 hover:bg-red-900 text-white px-3 py-1.5 uppercase transition cursor-pointer shadow-xs rounded-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* Navigation Links Bar (Renders for both Students & Admins) */}
      <div className="bg-gray-100 px-4 flex overflow-x-auto border-t border-gray-200">
        <div className="flex gap-1 py-2">
          {isAdmin ? (
            // Admin Tab Links
            adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeAdminTab === link.tab;
              return (
                <button
                  key={link.tab}
                  onClick={() => onSelectAdminTab && onSelectAdminTab(link.tab)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-900 text-white border-b-2 border-orange-500 shadow-xs' 
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-gray-500'}`} />
                  {link.name}
                </button>
              );
            })
          ) : (
            // Student Page Links
            studentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors shrink-0 cursor-pointer ${
                    isActive 
                      ? 'bg-blue-900 text-white border-b-2 border-orange-500 shadow-xs' 
                      : 'bg-white text-gray-700 hover:bg-gray-200 border border-gray-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-orange-400' : 'text-gray-500'}`} />
                  {link.name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}