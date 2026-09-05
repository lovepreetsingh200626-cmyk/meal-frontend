import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, FileText, MessageSquareWarning, LayoutDashboard, 
  Users, BellRing, Settings, LogOut, User as UserIcon, CreditCard, 
  ShieldCheck, RefreshCw, Landmark, ChevronRight, Award
} from 'lucide-react';

export default function Navbar({ user, onLogout, onOpenProfile, activeAdminTab, onSelectAdminTab }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    { name: 'Dashboard', path: '/student', icon: LayoutDashboard },
    { name: 'Diet Register', path: '/student/logger', icon: Utensils },
    { name: 'Expense Ledger', path: '/student/ledger', icon: FileText },
    { name: 'Fee Invoicing Desk', path: '/student/payments', icon: CreditCard },
    { name: 'Grievance Docket', path: '/student/complaints', icon: MessageSquareWarning },
  ];

  const adminLinks = [
    { name: 'Member Directory', tab: 'users', icon: Users },
    { name: 'Council Magistracy', tab: 'admins', icon: ShieldCheck },
    { name: 'Master Ledger', tab: 'meals', icon: FileText },
    { name: 'Fee Clearances', tab: 'payments', icon: CreditCard },
    { name: 'Grievance Docket', tab: 'complaints', icon: MessageSquareWarning },
    { name: 'Executive Directives', tab: 'notices', icon: BellRing },
    { name: 'Statutory Tariffs', tab: 'settings', icon: Settings },
  ];

  const handleProfileClick = () => {
    if (onOpenProfile) onOpenProfile();
    if (!isAdmin) {
      navigate('/student/profile');
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <header className="w-full bg-white shadow-md sticky top-0 z-50 font-sans select-none print:hidden flex flex-col border-b border-slate-300">
      
      {/* 1. TOP STATUTORY RIBBON */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-orange-600 flex justify-between items-center shadow-xs">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
          <span className="hidden sm:inline">Autonomous Student Cooperative Registry</span>
          <span className="sm:hidden">Cooperative Registry</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-orange-400 font-black hidden md:inline tracking-widest">
            {isAdmin ? 'Executive Comptroller & Magistracy Division' : 'Central Residential Comptroller'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-sm border border-slate-800">
          <span>Session: <strong className="text-white">{user?.session || '2024-2028'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Hostel: <strong className="text-orange-400">{user?.hostelNo || 'CAMPUS'}</strong></span>
        </div>
      </div>

      {/* 2. PRIMARY EMBLEM & USER CONTROL BAR */}
      <div className="px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 bg-white relative z-10">
        
        {/* Institutional Authority Brand */}
        <div 
          onClick={() => navigate(isAdmin ? '/admin' : '/student')} 
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-orange-500 rounded-sm flex flex-col items-center justify-center text-white shrink-0 shadow-sm group-hover:shadow-md transition-all">
            <Landmark className="w-5 h-5 text-orange-400 mb-0.5" />
            <span className="text-[5px] font-black tracking-widest text-orange-200 uppercase leading-none">SEAL</span>
          </div>
          <div className="flex flex-col justify-center">
            <span className="text-sm md:text-lg font-black text-blue-950 uppercase tracking-tight font-serif group-hover:text-blue-800 transition-colors">
              Central Residential Mess Cooperative
            </span>
            <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">
              Directorate of Student Residential Welfare &amp; Dietary Operations
            </span>
          </div>
        </div>

        {/* User Identity & Global Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          
          {/* Official Dossier Card */}
          <div 
            onClick={handleProfileClick} 
            className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-1.5 pr-4 border border-slate-300 bg-white transition-all shadow-xs hover:shadow-sm"
            title="Open Certified Dossier & Settings"
          >
            <div className="w-9 h-9 bg-slate-100 text-slate-400 font-bold text-xs flex items-center justify-center border border-slate-300 overflow-hidden shrink-0">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-5 h-5" />
              )}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-blue-950 font-serif group-hover:text-orange-700 transition-colors">
                  {user?.name || 'Officer'}
                </span>
                <span className="text-[8px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-1.5 py-0.5 tracking-wider">
                  {isAdmin ? 'Staff' : 'Certified'}
                </span>
              </div>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1 tracking-tight">
                {isAdmin ? (
                  <>Clearance: <strong className="text-blue-950">Magistracy</strong></>
                ) : (
                  <>ID: <strong className="text-blue-950">{user?.studentId || 'N/A'}</strong></>
                )}
                <span className="text-orange-600 font-black ml-2 group-hover:underline">VIEW DOSSIER ➔</span>
              </p>
            </div>
          </div>

          {/* Quick Refresh & Session Controls */}
          <div className="flex items-center gap-2 border-l border-slate-200 pl-2 sm:pl-4">
            <button 
              type="button"
              onClick={handleRefresh} 
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-3 sm:py-2 bg-slate-50 hover:bg-slate-200 border border-slate-300 text-slate-700 transition cursor-pointer shadow-xs active:scale-95 group"
              title="Synchronize Interface & Ledger"
            >
              <RefreshCw className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-950 group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-wider ml-1.5">Sync</span>
            </button>

            <button 
              type="button"
              onClick={onLogout} 
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:h-auto sm:px-4 sm:py-2 bg-red-800 hover:bg-red-900 text-white border-b-2 border-red-950 transition cursor-pointer shadow-xs active:scale-95"
              title="Terminate Active Session"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-200" />
              <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest ml-1.5">Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. DUAL-ROLE TAB NAVIGATION REGISTER */}
      <nav className="bg-slate-50/80 px-4 md:px-8 border-t border-slate-200 overflow-x-auto shadow-inner relative z-0">
        <div className="flex gap-1 py-2 min-w-max">
          {isAdmin ? (
            /* Executive Administrator Tabs */
            adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeAdminTab === link.tab;
              return (
                <button
                  key={link.tab}
                  type="button"
                  onClick={() => onSelectAdminTab && onSelectAdminTab(link.tab)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-blue-950 text-white border-b-2 border-orange-500 shadow-md transform -translate-y-0.5' 
                      : 'bg-white text-slate-600 hover:bg-slate-200 hover:text-blue-950 border border-slate-300 shadow-xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </button>
              );
            })
          ) : (
            /* Certified Candidate Links */
            studentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-blue-950 text-white border-b-2 border-orange-500 shadow-md transform -translate-y-0.5' 
                      : 'bg-white text-slate-600 hover:bg-slate-200 hover:text-blue-950 border border-slate-300 shadow-xs'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
                  <span>{link.name}</span>
                </button>
              );
            })
          )}
        </div>
      </nav>

    </header>
  );
}