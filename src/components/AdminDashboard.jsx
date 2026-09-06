import React, { useState } from 'react';
import {
    Users,
    FileText,
    CreditCard,
    MessageSquareWarning,
    BellRing,
    Settings,
    LayoutDashboard,
    LogOut,
    Landmark,
    Award,
    Loader2
} from 'lucide-react';

// Import admin sub-pages
import AdminOverview from '../pages/admin/AdminOverview';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminMeals from '../pages/admin/AdminMeals';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminNotices from '../pages/admin/AdminNotices';
import AdminSettings from '../pages/admin/AdminSettings';

export default function AdminDashboard({ user, onLogout, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleTabSwitch = (tabName) => {
        if (activeTab === tabName) return;

        setIsTransitioning(true);
        setActiveTab(tabName);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 300);
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans selection:bg-blue-950 selection:text-white">

            {/* =========================================================
                1. NATIONAL / STATUTORY EMBLEM STRIP
            ========================================================= */}
            <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex justify-between items-center z-50 print:hidden select-none">

                <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                    <span>
                        Autonomous Hostel Cooperative Registry
                    </span>

                    <span className="text-slate-600 hidden md:inline">
                        |
                    </span>

                    <span className="text-amber-300 font-black hidden md:inline">
                        Executive Comptroller of Residential Accounts
                    </span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    <span>
                        Portal Clearance:{' '}
                        <strong className="text-white">
                            SUPERVISORY ACCESS
                        </strong>
                    </span>

                    <span className="text-slate-600">
                        •
                    </span>

                    <span>
                        Statute Ref:{' '}
                        <strong className="text-amber-400">
                            SEC-2026/A
                        </strong>
                    </span>
                </div>
            </div>


            {/* =========================================================
                2. EXECUTIVE HEADER
            ========================================================= */}
            <header className="bg-white border-b-2 border-slate-300 shadow-sm px-4 md:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-40 print:hidden">

                <div className="flex items-center gap-4">

                    {/* Audit Logo */}
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 p-1 rounded-sm flex flex-col items-center justify-center text-center shadow-sm shrink-0 select-none">

                        <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />

                        <span className="text-[7px] font-black tracking-widest text-amber-200 uppercase leading-none">
                            AUDIT
                        </span>

                        <span className="text-[5px] font-bold tracking-tight text-white uppercase leading-none mt-0.5">
                            COUNCIL
                        </span>
                    </div>


                    {/* Title */}
                    <div>

                        <div className="flex items-center gap-2 flex-wrap">

                            <h1 className="text-lg md:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                                Central Student Hostel Mess &amp; Diet Audit Ledger
                            </h1>

                            <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2 py-0.5 hidden sm:inline-block">
                                Executive Desk
                            </span>

                        </div>

                        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5 flex items-center gap-2 flex-wrap">

                            <span>
                                Executive Committee for Residential Welfare &amp; Comptroller of Accounts
                            </span>

                            <span className="text-slate-400 hidden md:inline">
                                •
                            </span>

                            <span className="text-amber-800 font-extrabold">
                                Autonomous Cooperative Jurisdiction
                            </span>

                        </h2>
                    </div>
                </div>


                {/* Logout */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">

                    <button
                        onClick={onLogout}
                        className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-sm active:scale-95"
                    >
                        <LogOut className="w-3.5 h-3.5" />

                        <span>
                            Terminate Session
                        </span>
                    </button>

                </div>
            </header>


            {/* =========================================================
                3. SUPERVISORY OFFICER IDENTIFIER STRIP
            ========================================================= */}
            <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-slate-800 z-30 print:hidden">

                <div className="flex items-center gap-3 px-2 py-1">

                    {/* Profile photo */}
                    <div className="w-8 h-8 bg-blue-950 text-amber-400 font-bold flex items-center justify-center border border-amber-600/50 overflow-hidden shrink-0">

                        {user?.profilePhoto ? (
                            <img
                                src={user.profilePhoto}
                                alt="Admin profile"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <Award className="w-4 h-4" />
                        )}

                    </div>


                    {/* Admin information */}
                    <div>

                        <div className="flex items-center gap-2">

                            <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">
                                {user?.name || 'Executive Officer'}
                            </h3>

                            <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-sm">
                                Verified
                            </span>

                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {user?.designation || 'Chief Warden & Executive Secretary'}
                        </p>

                    </div>
                </div>


                {/* Desktop audit information */}
                <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase text-slate-400">

                    <span>
                        Assigned Sector:{' '}
                        <strong className="text-white">
                            {user?.wardenHostel || 'All Residences (Campus Core)'}
                        </strong>
                    </span>

                    <span>
                        •
                    </span>

                    <span>
                        Audit Mode:{' '}
                        <strong className="text-emerald-400">
                            Realtime Reconciled
                        </strong>
                    </span>

                </div>
            </div>


            {/* =========================================================
                4. MAIN OPERATIONAL CONTAINER
            ========================================================= */}
            <div className="max-w-7xl mx-auto px-4 mt-6 w-full space-y-6">

                {/* =====================================================
                    STATUTORY NAVIGATION
                ===================================================== */}
                <div className="bg-white border border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-sm print:hidden">

                    <div className="flex flex-wrap gap-1">

                        {/* Dashboard */}
                        <button
                            onClick={() => handleTabSwitch('dashboard')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'dashboard'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <LayoutDashboard className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Executive Dashboard
                        </button>


                        {/* Users */}
                        <button
                            onClick={() => handleTabSwitch('users')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'users'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Users className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Member Directory
                        </button>


                        {/* Meals */}
                        <button
                            onClick={() => handleTabSwitch('meals')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'meals'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <FileText className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Master Ledger
                        </button>


                        {/* Payments */}
                        <button
                            onClick={() => handleTabSwitch('payments')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'payments'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <CreditCard className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Fee Clearances
                        </button>


                        {/* Complaints */}
                        <button
                            onClick={() => handleTabSwitch('complaints')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'complaints'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <MessageSquareWarning className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Grievance Docket
                        </button>


                        {/* Notices */}
                        <button
                            onClick={() => handleTabSwitch('notices')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'notices'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <BellRing className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Directives
                        </button>


                        {/* Settings */}
                        <button
                            onClick={() => handleTabSwitch('settings')}
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                                activeTab === 'settings'
                                    ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-sm'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                        >
                            <Settings className="w-3 h-3 inline-block mr-1.5 mb-0.5" />
                            Statutory Tariffs
                        </button>

                    </div>
                </div>


                {/* =====================================================
                    DYNAMIC ADMIN VIEW
                ===================================================== */}
                <main className="min-h-[50vh]">

                    {isTransitioning ? (

                        <div className="flex flex-col items-center justify-center min-h-[400px] bg-white border-2 border-slate-300 shadow-sm border-t-4 border-t-blue-950">

                            <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />

                            <p className="text-xs font-mono font-black uppercase tracking-widest text-slate-700">
                                Accessing Archives...
                            </p>

                        </div>

                    ) : (

                        <div className="animate-in fade-in duration-300">

                            {activeTab === 'dashboard' && (
                                <AdminOverview />
                            )}

                            {activeTab === 'users' && (
                                <AdminUsers />
                            )}

                            {activeTab === 'meals' && (
                                <AdminMeals />
                            )}

                            {activeTab === 'payments' && (
                                <AdminPayments />
                            )}

                            {activeTab === 'complaints' && (
                                <AdminComplaints />
                            )}

                            {activeTab === 'notices' && (
                                <AdminNotices />
                            )}

                            {activeTab === 'settings' && (
                                <AdminSettings />
                            )}

                        </div>
                    )}

                </main>
            </div>


            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="max-w-7xl mx-auto px-4 mt-10 w-full print:hidden">

                <div className="border-t border-slate-300 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[9px] font-mono uppercase tracking-wider text-slate-500">

                    <span>
                        Central Student Hostel Mess &amp; Diet Audit Ledger
                    </span>

                    <span>
                        Supervisory Access • {new Date().getFullYear()}
                    </span>

                </div>

            </footer>

        </div>
    );
}