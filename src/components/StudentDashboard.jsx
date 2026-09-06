import React, { useState } from 'react';
import {
    LayoutDashboard,
    FileText,
    CreditCard,
    MessageSquareWarning,
    BellRing,
    LogOut,
    Landmark,
    User as UserIcon,
    Loader2
} from 'lucide-react';

import StudentOverview from '../pages/student/StudentOverview';
import StudentLedger from '../pages/student/StudentLedger';
import StudentPayments from '../pages/student/StudentPayments';
import StudentComplaints from '../pages/student/StudentComplaints';
import StudentNotices from '../pages/student/StudentNotices';

import ProfileModal from './ProfileModal';

export default function StudentDashboard({ user, onLogout, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const handleTabSwitch = (tabName) => {
        if (activeTab === tabName) return;

        setIsTransitioning(true);
        setActiveTab(tabName);

        setTimeout(() => {
            setIsTransitioning(false);
        }, 350);
    };

    const tabs = [
        {
            id: 'dashboard',
            label: 'Dashboard',
            mobileLabel: 'Home',
            icon: LayoutDashboard
        },
        {
            id: 'ledger',
            label: 'My Diet Ledger',
            mobileLabel: 'Ledger',
            icon: FileText
        },
        {
            id: 'payments',
            label: 'Fee Clearances',
            mobileLabel: 'Payments',
            icon: CreditCard
        },
        {
            id: 'complaints',
            label: 'Grievance Redressal',
            mobileLabel: 'Complaints',
            icon: MessageSquareWarning
        },
        {
            id: 'notices',
            label: 'Campus Directives',
            mobileLabel: 'Notices',
            icon: BellRing
        }
    ];

    const renderActivePage = () => {
        switch (activeTab) {
            case 'ledger':
                return <StudentLedger user={user} />;

            case 'payments':
                return <StudentPayments user={user} />;

            case 'complaints':
                return <StudentComplaints user={user} />;

            case 'notices':
                return <StudentNotices user={user} />;

            case 'dashboard':
            default:
                return <StudentOverview user={user} />;
        }
    };

    const getLoadingText = () => {
        switch (activeTab) {
            case 'ledger':
                return 'Loading dietary ledger...';

            case 'payments':
                return 'Loading payment records...';

            case 'complaints':
                return 'Loading grievance records...';

            case 'notices':
                return 'Loading campus notices...';

            default:
                return 'Loading student dashboard...';
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 font-sans">

            {/* =========================================================
                GOVERNMENT / INSTITUTIONAL STRIP
            ========================================================= */}
            <div className="bg-slate-950 text-slate-300 border-b border-slate-800 px-4 md:px-8 py-2">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">

                    <div className="flex items-center gap-2 min-w-0">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />

                        <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest truncate">
                            Government of Punjab • Department of Higher Education
                        </span>

                        <span className="hidden lg:inline text-slate-700">
                            |
                        </span>

                        <span className="hidden lg:inline text-[9px] font-black uppercase tracking-wider text-amber-300">
                            Student Residential Portal
                        </span>
                    </div>

                    <div className="hidden sm:flex items-center gap-2 text-[9px] font-mono uppercase text-slate-400 shrink-0">
                        <span>
                            Status:
                            <strong className="text-emerald-400 ml-1">
                                ACTIVE
                            </strong>
                        </span>

                        <span className="text-slate-700">•</span>

                        <span>
                            Roll:
                            <strong className="text-white ml-1">
                                {user?.rollNo || 'N/A'}
                            </strong>
                        </span>
                    </div>

                </div>
            </div>

            {/* =========================================================
                MAIN INSTITUTIONAL HEADER
            ========================================================= */}
            <header className="bg-white border-b border-slate-300 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-4">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

                        {/* BRAND */}
                        <div className="flex items-center gap-3 min-w-0">

                            <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-blue-950 border border-blue-900 flex flex-col items-center justify-center shadow-sm shrink-0">
                                <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />

                                <span className="text-[6px] md:text-[7px] font-black tracking-widest text-amber-200 uppercase">
                                    PUNJAB
                                </span>

                                <span className="text-[5px] font-bold tracking-tight text-white uppercase">
                                    HOSTELS
                                </span>
                            </div>

                            <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">

                                    <h1 className="text-base md:text-xl font-black text-blue-950 tracking-tight">
                                        Central Student Hostel Mess &amp; Diet Audit Ledger
                                    </h1>

                                    <span className="hidden sm:inline-flex text-[8px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-full">
                                        Student Portal
                                    </span>

                                </div>

                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-slate-500">

                                    <span>
                                        Student Residential &amp; Mess Portal
                                    </span>

                                    <span className="hidden sm:inline text-slate-300">
                                        •
                                    </span>

                                    <span className="text-amber-700">
                                        {user?.university || 'University Campus'}
                                    </span>

                                </div>
                            </div>

                        </div>

                        {/* LOGOUT */}
                        <button
                            onClick={onLogout}
                            className="
                                self-end md:self-auto
                                inline-flex items-center justify-center gap-2
                                bg-red-700 hover:bg-red-800
                                text-white
                                rounded-lg
                                px-4 py-2.5
                                text-[10px]
                                font-black
                                uppercase
                                tracking-widest
                                transition
                                shadow-sm
                                active:scale-[0.98]
                            "
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                        </button>

                    </div>

                </div>
            </header>

            {/* =========================================================
                STUDENT IDENTITY BAR
            ========================================================= */}
            <div className="bg-slate-900 text-white border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-3">

                    <div className="flex items-center justify-between gap-4">

                        {/* PROFILE */}
                        <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(true)}
                            className="
                                flex items-center gap-3
                                text-left
                                min-w-0
                                rounded-lg
                                px-2 py-1.5
                                hover:bg-slate-800
                                transition
                                cursor-pointer
                            "
                            title="Open profile"
                        >

                            <div className="w-9 h-9 rounded-lg overflow-hidden bg-blue-950 border border-slate-700 flex items-center justify-center shrink-0">

                                {user?.profilePhoto ? (
                                    <img
                                        src={user.profilePhoto}
                                        alt="Student profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="w-4 h-4 text-slate-300" />
                                )}

                            </div>

                            <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                    <h2 className="text-xs font-black uppercase tracking-wide truncate">
                                        {user?.name || 'Student'}
                                    </h2>

                                    <span className="hidden sm:inline-flex text-[8px] font-black uppercase bg-blue-600 px-2 py-0.5 rounded-full">
                                        View Profile
                                    </span>

                                </div>

                                <p className="text-[9px] md:text-[10px] font-mono uppercase text-slate-400 truncate">

                                    ID:
                                    <strong className="text-amber-300 ml-1">
                                        {user?.studentId || 'N/A'}
                                    </strong>

                                    <span className="mx-1 text-slate-600">
                                        •
                                    </span>

                                    Hostel:
                                    <strong className="text-white ml-1">
                                        {user?.hostelNo || 'N/A'}
                                    </strong>

                                </p>

                            </div>

                        </button>

                        {/* DESKTOP INFORMATION */}
                        <div className="hidden lg:flex items-center gap-5 text-[9px] font-mono uppercase text-slate-400">

                            <span>
                                Department:
                                <strong className="text-white ml-1">
                                    {user?.department || 'N/A'}
                                </strong>
                            </span>

                            <span className="text-slate-700">
                                •
                            </span>

                            <span>
                                Roll:
                                <strong className="text-amber-400 ml-1">
                                    {user?.rollNo || 'N/A'}
                                </strong>
                            </span>

                            <span className="text-slate-700">
                                •
                            </span>

                            <span>
                                Session:
                                <strong className="text-white ml-1">
                                    {user?.session || 'N/A'}
                                </strong>
                            </span>

                        </div>

                    </div>

                </div>
            </div>

            {/* =========================================================
                MAIN CONTENT
            ========================================================= */}
            <main className="max-w-7xl mx-auto px-4 md:px-8 py-5 md:py-6">

                {/* =====================================================
                    NAVIGATION
                ===================================================== */}
                <section className="bg-white border border-slate-200 rounded-xl shadow-sm p-2 mb-5">

                    <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">

                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleTabSwitch(tab.id)}
                                    className={`
                                        shrink-0
                                        inline-flex items-center justify-center gap-2
                                        px-3 md:px-4
                                        py-2.5
                                        rounded-lg
                                        text-[9px] md:text-[10px]
                                        font-black
                                        uppercase
                                        tracking-wide
                                        transition
                                        cursor-pointer
                                        ${
                                            isActive
                                                ? 'bg-blue-950 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-950'
                                        }
                                    `}
                                >
                                    <Icon className="w-3.5 h-3.5 shrink-0" />

                                    <span className="hidden sm:inline">
                                        {tab.label}
                                    </span>

                                    <span className="sm:hidden">
                                        {tab.mobileLabel}
                                    </span>
                                </button>
                            );
                        })}

                    </div>

                </section>

                {/* =====================================================
                    PAGE CONTENT
                ===================================================== */}
                <section className="min-h-[50vh]">

                    {isTransitioning ? (
                        <div className="
                            min-h-[50vh]
                            bg-white
                            border border-slate-200
                            rounded-xl
                            shadow-sm
                            flex flex-col
                            items-center
                            justify-center
                        ">

                            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
                                <Loader2 className="w-6 h-6 text-blue-950 animate-spin" />
                            </div>

                            <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600">
                                {getLoadingText()}
                            </p>

                            <p className="text-[9px] text-slate-400 mt-2">
                                Please wait...
                            </p>

                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            {renderActivePage()}
                        </div>
                    )}

                </section>

            </main>

            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="border-t border-slate-200 bg-white mt-8">
                <div className="max-w-7xl mx-auto px-4 md:px-8 py-5">

                    <div className="flex flex-col md:flex-row items-center justify-between gap-3">

                        <div className="text-center md:text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                Student Residential &amp; Mess Portal
                            </p>

                            <p className="text-[9px] text-slate-400 mt-1">
                                Digital hostel mess, diet and payment management system
                            </p>
                        </div>

                        <div className="text-[9px] text-slate-400 text-center md:text-right">
                            <p>
                                Student ID:{' '}
                                <strong className="text-slate-600">
                                    {user?.studentId || 'N/A'}
                                </strong>
                            </p>

                            <p className="mt-1">
                                Authorized Student Access
                            </p>
                        </div>

                    </div>

                </div>
            </footer>

            {/* =========================================================
                SHARED PROFILE MODAL
            ========================================================= */}
            {isProfileModalOpen && (
                <ProfileModal
                    user={user}
                    onClose={() => setIsProfileModalOpen(false)}
                    onUpdateUser={(updatedUser) => {
                        if (onUpdateUser) {
                            onUpdateUser(updatedUser);
                        }

                        setIsProfileModalOpen(false);
                    }}
                />
            )}

        </div>
    );
}