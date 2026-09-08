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
        <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-100 text-slate-900 font-sans">

            {/* =========================================================
                GOVERNMENT / INSTITUTIONAL STRIP
            ========================================================= */}
            <div className="bg-slate-950 text-slate-300 border-b border-slate-800">
                <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-8">
                    <div className="flex min-h-[30px] items-center justify-between gap-3 py-1.5">

                        <div className="flex min-w-0 items-center gap-2">
                            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400 sm:h-2 sm:w-2" />

                            <span className="truncate text-[8px] font-bold uppercase tracking-[0.12em] sm:text-[9px] md:text-[10px] md:tracking-widest">
                                Government of Punjab • Department of Higher Education
                            </span>

                            <span className="hidden lg:inline text-slate-700">
                                |
                            </span>

                            <span className="hidden lg:inline text-[9px] font-black uppercase tracking-wider text-amber-300">
                                Student Residential Portal
                            </span>
                        </div>

                        <div className="hidden shrink-0 items-center gap-2 text-[9px] font-mono uppercase text-slate-400 sm:flex">
                            <span>
                                Status:
                                <strong className="ml-1 text-emerald-400">
                                    ACTIVE
                                </strong>
                            </span>

                            <span className="text-slate-700">•</span>

                            <span>
                                Roll:
                                <strong className="ml-1 text-white">
                                    {user?.rollNo || 'N/A'}
                                </strong>
                            </span>
                        </div>

                    </div>
                </div>
            </div>


            {/* =========================================================
                MAIN INSTITUTIONAL HEADER
            ========================================================= */}
            <header className="border-b border-slate-200 bg-white shadow-sm">
                <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-4 sm:py-4 md:px-8">

                    <div className="flex items-center justify-between gap-3">

                        {/* BRAND */}
                        <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                            <div
                                className="
                                    flex shrink-0 flex-col items-center justify-center
                                    rounded-xl border border-blue-100
                                    bg-blue-50
                                    shadow-sm
                                    h-11 w-11
                                    sm:h-12 sm:w-12
                                    md:h-14 md:w-14
                                "
                            >
                                <Landmark className="mb-0.5 h-5 w-5 text-blue-700 sm:h-5 sm:w-5 md:h-6 md:w-6" />

                                <span className="text-[5px] font-black tracking-widest text-blue-700 sm:text-[6px]">
                                    PUNJAB
                                </span>

                                <span className="text-[4px] font-bold tracking-tight text-slate-600 sm:text-[5px]">
                                    HOSTELS
                                </span>
                            </div>

                            <div className="min-w-0">

                                <div className="flex min-w-0 items-center gap-2">
                                    <h1
                                        className="
                                            truncate
                                            text-sm font-black tracking-tight text-slate-900
                                            sm:text-base
                                            md:text-xl
                                        "
                                    >
                                        Central Student Hostel Mess & Diet Audit Ledger
                                    </h1>

                                    <span className="hidden shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[8px] font-black uppercase text-emerald-800 sm:inline-flex">
                                        Student Portal
                                    </span>
                                </div>

                                <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[8px] font-bold uppercase tracking-wide text-slate-500 sm:mt-1 sm:text-[9px] md:text-[10px]">

                                    <span className="truncate">
                                        Student Residential & Mess Portal
                                    </span>

                                    <span className="hidden shrink-0 text-slate-300 sm:inline">
                                        •
                                    </span>

                                    <span className="hidden max-w-[220px] truncate text-amber-700 sm:inline">
                                        {user?.university || 'University Campus'}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* LOGOUT */}
                        <button
                            type="button"
                            onClick={onLogout}
                            aria-label="Sign out"
                            title="Sign out"
                            className="
                                inline-flex shrink-0 items-center justify-center
                                gap-2
                                rounded-xl
                                border border-red-200
                                bg-red-50
                                px-3 py-2.5
                                text-red-700
                                transition
                                hover:bg-red-100
                                active:scale-[0.97]
                                sm:px-4
                            "
                        >
                            <LogOut className="h-4 w-4" />

                            <span className="hidden text-[10px] font-black uppercase tracking-widest sm:inline">
                                Sign Out
                            </span>
                        </button>

                    </div>

                </div>
            </header>


            {/* =========================================================
                STUDENT IDENTITY BAR
            ========================================================= */}
            <div className="border-b border-slate-800 bg-slate-900 text-white">
                <div className="mx-auto w-full max-w-7xl px-3 sm:px-4 md:px-8">
                    <div className="flex min-h-[54px] items-center justify-between gap-3 py-2 sm:py-2.5">

                        {/* PROFILE */}
                        <button
                            type="button"
                            onClick={() => setIsProfileModalOpen(true)}
                            title="Open profile"
                            className="
                                flex min-w-0 items-center gap-2.5
                                rounded-xl
                                px-1.5 py-1
                                text-left
                                transition
                                hover:bg-slate-800
                                active:scale-[0.99]
                                sm:gap-3
                                sm:px-2
                                sm:py-1.5
                            "
                        >

                            <div
                                className="
                                    flex shrink-0 items-center justify-center
                                    overflow-hidden rounded-lg
                                    border border-slate-700
                                    bg-slate-800
                                    h-8 w-8
                                    sm:h-9 sm:w-9
                                "
                            >
                                {user?.profilePhoto ? (
                                    <img
                                        src={user.profilePhoto}
                                        alt="Student profile"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <UserIcon className="h-4 w-4 text-slate-300" />
                                )}
                            </div>


                            <div className="min-w-0">

                                <div className="flex min-w-0 items-center gap-2">

                                    <h2 className="truncate text-[10px] font-black uppercase tracking-wide sm:text-xs">
                                        {user?.name || 'Student'}
                                    </h2>

                                    <span className="hidden shrink-0 rounded-full bg-blue-600 px-2 py-0.5 text-[8px] font-black uppercase sm:inline-flex">
                                        View Profile
                                    </span>

                                </div>

                                <p className="truncate text-[8px] font-mono uppercase text-slate-400 sm:text-[9px] md:text-[10px]">

                                    ID:
                                    <strong className="ml-1 text-amber-300">
                                        {user?.studentId || 'N/A'}
                                    </strong>

                                    <span className="mx-1 text-slate-600">
                                        •
                                    </span>

                                    Hostel:
                                    <strong className="ml-1 text-white">
                                        {user?.hostelNo || 'N/A'}
                                    </strong>

                                </p>

                            </div>

                        </button>


                        {/* DESKTOP INFORMATION */}
                        <div className="hidden shrink-0 items-center gap-5 text-[9px] font-mono uppercase text-slate-400 lg:flex">

                            <span>
                                Department:
                                <strong className="ml-1 text-white">
                                    {user?.department || 'N/A'}
                                </strong>
                            </span>

                            <span className="text-slate-700">
                                •
                            </span>

                            <span>
                                Roll:
                                <strong className="ml-1 text-amber-400">
                                    {user?.rollNo || 'N/A'}
                                </strong>
                            </span>

                            <span className="text-slate-700">
                                •
                            </span>

                            <span>
                                Session:
                                <strong className="ml-1 text-white">
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
            <main className="mx-auto w-full max-w-7xl min-w-0 px-2.5 py-3.5 sm:px-4 sm:py-5 md:px-8 md:py-6">

                {/* =====================================================
                    NAVIGATION
                ===================================================== */}
                <section
                    className="
                        mb-3
                        w-full min-w-0
                        overflow-hidden
                        rounded-xl
                        border border-slate-200
                        bg-white
                        p-1.5
                        shadow-sm
                        sm:mb-5
                        sm:p-2
                    "
                >

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-1.5
                            overflow-x-auto
                            overscroll-x-contain
                            scrollbar-thin
                            [-ms-overflow-style:none]
                            [scrollbar-width:none]
                            [&::-webkit-scrollbar]:hidden
                        "
                    >

                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabSwitch(tab.id)}
                                    className={`
                                        shrink-0
                                        inline-flex
                                        min-h-10
                                        items-center
                                        justify-center
                                        gap-1.5
                                        rounded-lg
                                        px-3
                                        py-2
                                        text-[10px]
                                        font-black
                                        uppercase
                                        tracking-wide
                                        transition
                                        active:scale-[0.98]
                                        sm:min-h-11
                                        sm:gap-2
                                        sm:px-4
                                        sm:py-2.5
                                        sm:text-[10px]
                                        ${
                                            isActive
                                                ? 'bg-blue-700 text-white shadow-sm'
                                                : 'text-slate-600 hover:bg-slate-100 hover:text-blue-700'
                                        }
                                    `}
                                >

                                    <Icon className="h-4 w-4 shrink-0" />

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
                <section className="min-w-0">

                    {isTransitioning ? (

                        <div
                            className="
                                flex
                                min-h-[260px]
                                w-full
                                flex-col
                                items-center
                                justify-center
                                rounded-xl
                                border border-slate-200
                                bg-white
                                px-4
                                shadow-sm
                                sm:min-h-[400px]
                            "
                        >

                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50 sm:mb-4 sm:h-12 sm:w-12">
                                <Loader2 className="h-5 w-5 animate-spin text-blue-700 sm:h-6 sm:w-6" />
                            </div>

                            <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-600 sm:text-xs">
                                {getLoadingText()}
                            </p>

                            <p className="mt-1.5 text-[9px] text-slate-400 sm:mt-2">
                                Please wait...
                            </p>

                        </div>

                    ) : (

                        <div className="min-w-0 animate-in fade-in duration-300">
                            {renderActivePage()}
                        </div>

                    )}

                </section>

            </main>


            {/* =========================================================
                FOOTER
            ========================================================= */}
            <footer className="mt-4 border-t border-slate-200 bg-white sm:mt-8">
                <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-5 md:px-8">

                    <div className="flex flex-col items-center justify-between gap-2.5 sm:gap-3 md:flex-row">

                        <div className="min-w-0 text-center md:text-left">

                            <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 sm:text-[9px]">
                                Student Residential & Mess Portal
                            </p>

                            <p className="mt-0.5 text-[8px] text-slate-400 sm:mt-1 sm:text-[9px]">
                                Digital hostel mess, diet and payment management system
                            </p>

                        </div>


                        <div className="text-center text-[8px] text-slate-400 md:text-right sm:text-[9px]">

                            <p>
                                Student ID:{' '}
                                <strong className="text-slate-600">
                                    {user?.studentId || 'N/A'}
                                </strong>
                            </p>

                            <p className="mt-0.5 sm:mt-1">
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