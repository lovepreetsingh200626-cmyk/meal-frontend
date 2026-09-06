import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Utensils, FileText, MessageSquareWarning, LayoutDashboard, 
  Users, BellRing, Settings, LogOut, User as UserIcon, CreditCard, 
  ShieldCheck, Landmark, ShieldAlert, Fingerprint
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
      <div className="px-4 md:px-8 py-3.5 flex flex-wrap items-stretch justify-between gap-4 bg-white relative z-10">
        
        {/* Institutional Authority Brand */}
        <div 
          onClick={() => navigate(isAdmin ? '/admin' : '/student')} 
          className="flex items-center gap-3.5 cursor-pointer group py-1"
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
        <div className="flex items-stretch gap-2.5 sm:gap-4">
          
          {/* OFFICIAL SECURITY CLEARANCE BADGE (Profile Card) */}
          <div 
            onClick={handleProfileClick} 
            className="flex items-stretch cursor-pointer group bg-white border border-slate-300 shadow-sm hover:shadow-md transition-all"
            title="Open Certified Dossier & Settings"
          >
            {/* Photo Housing */}
            <div className="bg-slate-100 border-r border-slate-300 p-1.5 flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
              <div className="w-10 h-10 border border-slate-400 overflow-hidden bg-white flex items-center justify-center shadow-inner relative">
                {user?.profilePhoto ? (
                  <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover grayscale-[20%]" />
                ) : (
                  <Fingerprint className="w-6 h-6 text-slate-400" />
                )}
              </div>
            </div>
            
            {/* Dossier Credentials */}
            <div className="px-3 py-1.5 flex flex-col justify-center border-l-4 border-l-transparent group-hover:border-l-orange-500 transition-colors hidden sm:flex min-w-[160px]">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-[11px] font-black uppercase text-blue-950 font-serif tracking-wide truncate">
                  {user?.name || 'Officer'}
                </span>
                <span className="text-[7px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300 px-1 py-0.5 tracking-widest shrink-0">
                  {isAdmin ? 'STAFF' : 'CERTIFIED'}
                </span>
              </div>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-1 tracking-tight flex items-center justify-between">
                <span>
                  {isAdmin ? (
                    <>Access: <strong className="text-blue-950">Magistracy</strong></>
                  ) : (
                    <>ID: <strong className="text-blue-950">{user?.studentId || 'N/A'}</strong></>
                  )}
                </span>
                <span className="text-orange-600 font-black group-hover:underline">DOSSIER ➔</span>
              </p>
            </div>
          </div>

          {/* Secure Session Termination Button */}
          <div className="flex items-stretch border-l border-slate-200 pl-2 sm:pl-4">
            <button 
              type="button"
              onClick={onLogout} 
              className="flex flex-col sm:flex-row items-center justify-center px-3 sm:px-4 bg-red-900 hover:bg-red-950 text-white border border-red-950 transition cursor-pointer shadow-xs active:scale-95 group"
              title="Terminate Active Session"
            >
              <LogOut className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-red-200 group-hover:text-white transition-colors" />
              <span className="hidden sm:block text-[9px] font-black uppercase tracking-widest ml-1.5 font-mono">Terminate<br/>Session</span>
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