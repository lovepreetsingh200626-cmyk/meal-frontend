import React, { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';

import {
    LogOut,
    Landmark,
    Award,
    LayoutDashboard,
    Users,
    FileText,
    CreditCard,
    MessageSquareWarning,
    BellRing,
    Settings,
    Lock,
    UserCircle
} from 'lucide-react';

import ProfileModal from '../../components/ProfileModal';

export default function AdminLayout({ user, onLogout }) {

    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);

    /*
     * Keep admin information synchronized with localStorage.
     */
    useEffect(() => {

        const handleUserUpdated = () => {

            try {

                const storedUser = localStorage.getItem('user');

                if (storedUser) {
                    setCurrentUser(JSON.parse(storedUser));
                }

            } catch (error) {

                console.error(
                    'Unable to refresh administrator profile:',
                    error
                );

            }
        };

        window.addEventListener(
            'userUpdated',
            handleUserUpdated
        );

        return () => {
            window.removeEventListener(
                'userUpdated',
                handleUserUpdated
            );
        };

    }, []);


    /*
     * Update local admin state after ProfileModal saves.
     */
    const handleUpdateUser = (updatedUser) => {

        setCurrentUser(updatedUser);

        try {

            localStorage.setItem(
                'user',
                JSON.stringify(updatedUser)
            );

        } catch (error) {

            console.error(
                'Unable to save administrator session:',
                error
            );
        }
    };


    const navLinkClass = ({ isActive }) =>
        `px-3.5 py-2 text-[10px] font-black uppercase tracking-wider
        transition-all cursor-pointer flex items-center gap-1.5
        ${
            isActive
                ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
        }`;


    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans flex flex-col selection:bg-blue-950 selection:text-white">

            {/* =====================================================
                TOP STRIP
            ====================================================== */}

            <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex justify-between items-center z-50 print:hidden select-none">

                <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">

                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>

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

                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">

                    <span>
                        Portal Clearance:{' '}
                        <strong className="text-white">
                            SUPERVISORY ACCESS
                        </strong>
                    </span>

                </div>

            </div>


            {/* =====================================================
                HEADER
            ====================================================== */}

            <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-40 print:hidden">

                <div className="flex items-center gap-4">

                    <div className="w-14 h-14 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 p-1 rounded-xs flex flex-col items-center justify-center text-center shadow-xs shrink-0 select-none">

                        <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />

                        <span className="text-[7px] font-black tracking-widest text-amber-200 uppercase leading-none">
                            AUDIT
                        </span>

                    </div>

                    <div>

                        <h1 className="text-lg md:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                            Central Student Hostel Mess &amp; Diet Audit Ledger
                        </h1>

                        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5 flex items-center gap-2">

                            <span>
                                Executive Committee for Residential Welfare
                            </span>

                            <span className="text-slate-400">
                                •
                            </span>

                            <span className="text-amber-800 font-extrabold">
                                Autonomous Jurisdiction
                            </span>

                        </h2>

                    </div>

                </div>


                {/* HEADER ACTIONS */}

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">

                   

                    {/* LOGOUT */}

                    <button
                        type="button"
                        onClick={onLogout}
                        className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-xs active:scale-95"
                    >

                        <LogOut className="w-3.5 h-3.5" />

                        <span>
                            logout
                        </span>

                    </button>

                </div>

            </header>


            {/* =====================================================
                ADMIN IDENTIFIER
            ====================================================== */}

            <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-slate-800 z-30 print:hidden">

                <button
                    type="button"
                    onClick={() => setShowProfile(true)}
                    className="flex items-center gap-3 px-2 py-1 rounded-xs hover:bg-slate-800 transition cursor-pointer text-left"
                >

                    <div className="w-8 h-8 bg-blue-900 text-amber-400 font-bold flex items-center justify-center border border-amber-600/50 overflow-hidden shrink-0">

                        {currentUser?.profilePhoto ? (

                            <img
                                src={currentUser.profilePhoto}
                                alt="Admin"
                                className="w-full h-full object-cover"
                            />

                        ) : (

                            <Award className="w-4 h-4" />

                        )}

                    </div>


                    <div>

                        <div className="flex items-center gap-2">

                            <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">
                                {currentUser?.name || 'Executive Officer'}
                            </h3>

                            <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-xs flex items-center gap-1">

                                <Lock className="w-2 h-2" />

                                Verified

                            </span>

                        </div>

                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">

                            {currentUser?.designation ||
                                'Chief Warden & Executive Secretary'}

                        </p>

                    </div>

                </button>

            </div>


            {/* =====================================================
                MAIN
            ====================================================== */}

            <div className="max-w-7xl mx-auto px-4 mt-6 w-full space-y-6">

                {/* NAVIGATION */}

                <div className="bg-white border border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden overflow-x-auto">

                    <div className="flex flex-wrap gap-1 min-w-max">

                        <NavLink
                            to="/admin"
                            end
                            className={navLinkClass}
                        >
                            <LayoutDashboard className="w-3.5 h-3.5" />
                            Executive Dashboard
                        </NavLink>


                        <NavLink
                            to="/admin/users"
                            className={navLinkClass}
                        >
                            <Users className="w-3.5 h-3.5" />
                            Member Directory
                        </NavLink>


                        <NavLink
                            to="/admin/meals"
                            className={navLinkClass}
                        >
                            <FileText className="w-3.5 h-3.5" />
                            Master Ledger
                        </NavLink>


                        <NavLink
                            to="/admin/payments"
                            className={navLinkClass}
                        >
                            <CreditCard className="w-3.5 h-3.5" />
                            Fee Clearances
                        </NavLink>


                        <NavLink
                            to="/admin/complaints"
                            className={navLinkClass}
                        >
                            <MessageSquareWarning className="w-3.5 h-3.5" />
                            Grievance Docket
                        </NavLink>


                        <NavLink
                            to="/admin/notices"
                            className={navLinkClass}
                        >
                            <BellRing className="w-3.5 h-3.5" />
                            Directives
                        </NavLink>


                        <NavLink
                            to="/admin/settings"
                            className={navLinkClass}
                        >
                            <Settings className="w-3.5 h-3.5" />
                            Statutory Tariffs
                        </NavLink>

                    </div>

                </div>


                {/* CURRENT ADMIN PAGE */}

                <Outlet context={{ user: currentUser }} />

            </div>


            {/* =====================================================
                ADMIN PROFILE MODAL
            ====================================================== */}

            {showProfile && currentUser && (

                <ProfileModal
                    user={currentUser}
                    onClose={() => setShowProfile(false)}
                    onUpdateUser={handleUpdateUser}
                />

            )}

        </div>
    );
}