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
    <header className="w-full bg-white border-b-2 border-slate-300 shadow-xs sticky top-0 z-50 font-sans select-none print:hidden">
      
      {/* 1. TOP STATUTORY RIBBON */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-1.5 border-b border-amber-500/60 flex justify-between items-center">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Autonomous Student Cooperative Registry</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-300 font-black hidden md:inline">
            {isAdmin ? 'Executive Comptroller & Magistracy Division' : 'Central Residential Comptroller'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
          <span>Session: <strong className="text-white">{user?.session || '2024-2028'}</strong></span>
          <span className="text-slate-600">•</span>
          <span>Hostel: <strong className="text-amber-400">{user?.hostelNo || 'CAMPUS RESIDENCE'}</strong></span>
        </div>
      </div>

      {/* 2. PRIMARY EMBLEM & USER CONTROL BAR */}
      <div className="px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200">
        
        {/* Institutional Authority Brand */}
        <div 
          onClick={() => navigate(isAdmin ? '/admin' : '/student')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 rounded-xs flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
            <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />
            <span className="text-[5px] font-black tracking-widest text-amber-200 uppercase leading-none">SEAL</span>
          </div>
          <div>
            <span className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-tight font-serif block group-hover:text-blue-900 transition">
              Central Residential Mess Cooperative
            </span>
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
              Directorate of Student Residential Welfare &amp; Dietary Operations
            </span>
          </div>
        </div>

        {/* User Identity & Global Action Controls */}
        <div className="flex items-center gap-3">
          
          {/* Official Dossier Card */}
          <div 
            onClick={handleProfileClick} 
            className="flex items-center gap-3 cursor-pointer group hover:bg-slate-100 p-1.5 px-2.5 border border-slate-300 bg-slate-50 transition shadow-xs"
            title="Open Certified Dossier & Settings"
          >
            <div className="w-8 h-8 bg-blue-950 text-white font-bold text-xs flex items-center justify-center border border-amber-500/70 overflow-hidden shrink-0 shadow-xs">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-4 h-4 text-amber-400" />
              )}
            </div>
            <div className="text-left leading-tight">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-black uppercase text-blue-950 font-serif group-hover:underline">
                  {user?.name || 'Officer'}
                </span>
                <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1 py-0.2 rounded-xs">
                  {isAdmin ? 'Staff' : 'Certified'}
                </span>
              </div>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-0.5">
                {isAdmin ? (
                  <>Clearance: <strong className="text-blue-950">Executive Magistracy</strong></>
                ) : (
                  <>Roll: <strong className="text-blue-950">{user?.rollNo || 'N/A'}</strong> &bull; Hostel: {user?.hostelNo || 'N/A'}</>
                )}
                <span className="text-amber-800 font-bold ml-1.5 hidden sm:inline">[ VIEW DOSSIER ]</span>
              </p>
            </div>
          </div>

          {/* Quick Refresh & Session Controls */}
          <div className="flex items-center gap-1.5">
            <button 
              type="button"
              onClick={handleRefresh} 
              className="flex items-center gap-1.5 text-[10px] font-black bg-white hover:bg-slate-100 border border-slate-400 text-slate-800 px-3 py-2 uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-95"
              title="Synchronize Interface & Ledger"
            >
              <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button 
              type="button"
              onClick={onLogout} 
              className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-xs active:scale-95"
              title="Terminate Active Session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>

        </div>
      </div>

      {/* 3. DUAL-ROLE TAB NAVIGATION REGISTER */}
      <nav className="bg-slate-100 px-4 md:px-8 flex overflow-x-auto border-t border-slate-200">
        <div className="flex gap-1 py-2">
          {isAdmin ? (
            // Executive Administrator Tabs
            adminLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeAdminTab === link.tab;
              return (
                <button
                  key={link.tab}
                  type="button"
                  onClick={() => onSelectAdminTab && onSelectAdminTab(link.tab)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-blue-950 text-white border-b-2 border-amber-400 shadow-xs' 
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
                  <span>{link.name}</span>
                </button>
              );
            })
          ) : (
            // Certified Candidate Links
            studentLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <button
                  key={link.path}
                  type="button"
                  onClick={() => navigate(link.path)}
                  className={`flex items-center gap-2 px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition cursor-pointer shrink-0 ${
                    isActive 
                      ? 'bg-blue-950 text-white border-b-2 border-amber-400 shadow-xs' 
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-400' : 'text-slate-500'}`} />
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