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
    Lock
} from 'lucide-react';

import ProfileModal from '../../components/ProfileModal';

export default function AdminLayout({ user, onLogout }) {

    const [showProfile, setShowProfile] = useState(false);
    const [currentUser, setCurrentUser] = useState(user);

    /*
     * Keep administrator information synchronized
     * with localStorage.
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
     * Update local administrator state after
     * ProfileModal saves successfully.
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


    /*
     * Responsive navigation styling.
     */
    const navLinkClass = ({ isActive }) =>
        `
        shrink-0
        flex
        items-center
        justify-center
        gap-1.5

        px-3
        sm:px-3.5

        py-2.5
        sm:py-2

        text-[9px]
        sm:text-[10px]

        font-black
        uppercase
        tracking-wider

        whitespace-nowrap

        transition-all
        cursor-pointer

        border
        rounded-lg
        sm:rounded-md

        ${isActive
            ? `
                bg-blue-700
                text-white
                border-blue-800
                shadow-sm
            `
            : `
                bg-slate-50
                text-slate-700
                border-transparent
                hover:bg-blue-50
                hover:text-blue-800
                hover:border-blue-100
            `
        }
        `;


    return (

        <div
            className="
                min-h-screen
                w-full
                min-w-0
                max-w-full

                overflow-x-hidden

                bg-slate-100
                text-slate-900

                pb-6
                sm:pb-10
                md:pb-16

                font-sans

                flex
                flex-col

                selection:bg-blue-800
                selection:text-white
            "
        >

            {/* =====================================================
                TOP STRIP
            ====================================================== */}

            <div
                className="
                    w-full
                    min-w-0

                    bg-slate-800
                    text-slate-300

                    px-3
                    sm:px-4
                    md:px-8

                    py-1.5
                    sm:py-2

                    border-b-2
                    border-amber-500/80

                    flex
                    items-center
                    justify-between

                    gap-2

                    print:hidden
                    select-none

                    overflow-hidden
                "
            >

                <div
                    className="
                        flex
                        items-center
                        gap-1.5

                        min-w-0
                        flex-1

                        uppercase
                        tracking-widest
                        text-slate-200
                    "
                >

                    <span
                        className="
                            w-1.5
                            h-1.5
                            sm:w-2
                            sm:h-2

                            rounded-full
                            bg-emerald-400
                            animate-pulse

                            shrink-0
                        "
                    />

                    <span
                        className="
                            truncate
                            text-[8px]
                            sm:text-[10px]
                        "
                    >
                        Autonomous Hostel Cooperative Registry
                    </span>

                    <span
                        className="
                            hidden
                            lg:inline
                            text-slate-500
                            shrink-0
                        "
                    >
                        |
                    </span>

                    <span
                        className="
                            hidden
                            lg:inline
                            text-amber-300
                            font-black
                            truncate
                        "
                    >
                        Executive Comptroller of Residential Accounts
                    </span>

                </div>


                <div
                    className="
                        hidden
                        sm:flex
                        items-center

                        text-[8px]
                        md:text-[9px]

                        font-mono
                        uppercase
                        tracking-wider

                        text-slate-400

                        shrink-0
                    "
                >

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

            <header
                className="
                    w-full
                    min-w-0

                    bg-white

                    border-b-2
                    border-slate-300

                    shadow-sm

                    px-3
                    sm:px-4
                    md:px-8

                    py-2.5
                    sm:py-4

                    flex
                    items-center
                    justify-between

                    gap-2

                    z-40
                    print:hidden
                "
            >

                {/* BRAND */}

                <div
                    className="
                        flex
                        items-center

                        gap-2
                        sm:gap-4

                        min-w-0
                        flex-1
                    "
                >

                    <div
                        className="
                            w-10
                            h-10

                            sm:w-14
                            sm:h-14

                            bg-gradient-to-br
                            from-blue-900
                            via-slate-800
                            to-blue-800

                            border-2
                            border-amber-600

                            p-1

                            rounded-md
                            sm:rounded-sm

                            flex
                            flex-col
                            items-center
                            justify-center

                            text-center

                            shadow-sm
                            shrink-0
                            select-none
                        "
                    >

                        <Landmark
                            className="
                                w-4
                                h-4

                                sm:w-5
                                sm:h-5

                                text-amber-400
                                mb-0.5
                            "
                        />

                        <span
                            className="
                                text-[5px]
                                sm:text-[7px]

                                font-black
                                tracking-widest

                                text-amber-200

                                uppercase
                                leading-none
                            "
                        >
                            AUDIT
                        </span>

                    </div>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <h1
                            className="
                                max-w-[205px]
                                sm:max-w-none

                                text-[12px]
                                sm:text-lg
                                md:text-xl

                                font-black
                                text-blue-900

                                uppercase
                                tracking-tight

                                font-serif

                                leading-[1.15]

                                line-clamp-3
                                sm:line-clamp-none
                            "
                        >
                            Central Student Hostel Mess &amp; Diet Audit Ledger
                        </h1>


                        <h2
                            className="
                                hidden
                                sm:flex

                                text-[10px]
                                md:text-xs

                                font-bold
                                text-slate-600

                                uppercase
                                tracking-wide

                                mt-1

                                items-center
                                gap-2
                            "
                        >

                            <span>
                                Executive Committee for Residential Welfare
                            </span>

                            <span className="text-slate-400">
                                •
                            </span>

                            <span
                                className="
                                    text-amber-800
                                    font-extrabold
                                "
                            >
                                Autonomous Jurisdiction
                            </span>

                        </h2>

                    </div>

                </div>


                {/* LOGOUT */}

                <button
                    type="button"
                    onClick={onLogout}
                    className="
                        shrink-0

                        flex
                        items-center
                        justify-center

                        gap-1.5

                        text-[9px]
                        sm:text-[10px]

                        font-black

                        bg-red-700
                        hover:bg-red-800

                        text-white

                        border
                        border-red-900

                        px-2.5
                        sm:px-3.5

                        py-2.5
                        sm:py-2.5

                        rounded-md
                        sm:rounded-none

                        uppercase
                        tracking-wider
                        sm:tracking-widest

                        transition
                        cursor-pointer

                        shadow-sm

                        active:scale-95

                        whitespace-nowrap

                        min-h-[38px]
                        sm:min-h-0
                    "
                >

                    <LogOut
                        className="
                            w-4
                            h-4

                            sm:w-3.5
                            sm:h-3.5

                            shrink-0
                        "
                    />

                    <span>
                        <span className="hidden sm:inline">
                            Terminate Session
                        </span>

                        <span className="sm:hidden">
                            Logout
                        </span>
                    </span>

                </button>

            </header>


            {/* =====================================================
                ADMIN IDENTIFIER + PROFILE
            ====================================================== */}

            <div
                className="
                    w-full
                    min-w-0

                    bg-slate-800
                    text-white

                    px-3
                    sm:px-4
                    md:px-8

                    py-2.5
                    sm:py-3

                    flex
                    items-center
                    justify-between

                    gap-2

                    border-b
                    border-slate-700

                    z-30
                    print:hidden
                "
            >

                <button
                    type="button"
                    onClick={() => setShowProfile(true)}
                    className="
                        flex
                        items-center

                        gap-2
                        sm:gap-3

                        min-w-0
                        flex-1

                        px-1
                        sm:px-2

                        py-1

                        rounded-md

                        hover:bg-slate-700

                        transition
                        cursor-pointer

                        text-left
                    "
                    title="Open Administrator Profile"
                >

                    <div
                        className="
                            w-8
                            h-8

                            sm:w-9
                            sm:h-9

                            bg-blue-800
                            text-amber-400

                            font-bold

                            flex
                            items-center
                            justify-center

                            border
                            border-amber-600/50

                            overflow-hidden
                            shrink-0

                            rounded-sm
                        "
                    >

                        {currentUser?.profilePhoto ? (

                            <img
                                src={currentUser.profilePhoto}
                                alt="Admin"
                                className="
                                    w-full
                                    h-full
                                    object-cover
                                "
                            />

                        ) : (

                            <Award
                                className="
                                    w-4
                                    h-4
                                "
                            />

                        )}

                    </div>


                    <div
                        className="
                            min-w-0
                            flex-1
                        "
                    >

                        <div
                            className="
                                flex
                                items-center

                                gap-2

                                min-w-0
                            "
                        >

                            <h3
                                className="
                                    min-w-0

                                    font-black
                                    text-white

                                    text-[10px]
                                    sm:text-xs

                                    uppercase
                                    tracking-wide
                                    font-serif

                                    truncate
                                "
                            >
                                {currentUser?.name ||
                                    'Executive Officer'}
                            </h3>


                            <span
                                className="
                                    hidden
                                    sm:flex

                                    text-[8px]

                                    font-black
                                    uppercase

                                    bg-amber-500
                                    text-slate-900

                                    px-1.5
                                    py-0.5

                                    rounded-sm

                                    items-center
                                    gap-1

                                    shrink-0
                                "
                            >

                                <Lock className="w-2 h-2" />

                                Verified

                            </span>

                        </div>


                        <p
                            className="
                                text-[8px]
                                sm:text-[10px]

                                font-bold
                                text-slate-300

                                uppercase

                                tracking-wide
                                sm:tracking-widest

                                truncate

                                mt-0.5
                            "
                        >
                            {currentUser?.designation ||
                                'Chief Warden & Executive Secretary'}
                        </p>

                    </div>

                </button>


                <div
                    className="
                        shrink-0

                        text-[8px]
                        sm:text-[9px]

                        font-mono
                        uppercase
                        tracking-wider

                        text-slate-400
                    "
                >

                    <span className="hidden sm:inline">
                        SUPERVISORY ACCESS
                    </span>

                    <span className="sm:hidden">
                        ADMIN
                    </span>

                </div>

            </div>


            {/* =====================================================
                MAIN
            ====================================================== */}

            <main
                className="
                    w-full
                    max-w-7xl

                    mx-auto

                    px-2.5
                    sm:px-4
                    md:px-8

                    mt-3
                    sm:mt-6

                    space-y-4
                    sm:space-y-6

                    min-w-0
                "
            >

                {/* =================================================
                    NAVIGATION
                ================================================== */}

                <nav
                    className="
                        w-full
                        min-w-0

                        bg-white

                        border
                        border-slate-300

                        p-1.5
                        sm:p-2.5

                        rounded-xl
                        sm:rounded-md

                        shadow-sm

                        print:hidden

                        overflow-hidden
                    "
                >

                    <div
                        className="
                            flex
                            items-stretch

                            gap-1.5

                            overflow-x-auto
                            overflow-y-hidden

                            pb-1

                            min-w-0

                            touch-pan-x

                            scrollbar-thin
                            scrollbar-thumb-slate-300
                            scrollbar-track-transparent
                        "
                    >

                        <NavLink
                            to="/admin"
                            end
                            className={navLinkClass}
                        >

                            <LayoutDashboard
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Executive Dashboard
                                </span>

                                <span className="sm:hidden">
                                    Dashboard
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/users"
                            className={navLinkClass}
                        >

                            <Users
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Member Directory
                                </span>

                                <span className="sm:hidden">
                                    Users
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/meals"
                            className={navLinkClass}
                        >

                            <FileText
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Master Ledger
                                </span>

                                <span className="sm:hidden">
                                    Meals
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/payments"
                            className={navLinkClass}
                        >

                            <CreditCard
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Fee Clearances
                                </span>

                                <span className="sm:hidden">
                                    Payments
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/complaints"
                            className={navLinkClass}
                        >

                            <MessageSquareWarning
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Grievance Docket
                                </span>

                                <span className="sm:hidden">
                                    Complaints
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/notices"
                            className={navLinkClass}
                        >

                            <BellRing
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Directives
                                </span>

                                <span className="sm:hidden">
                                    Notices
                                </span>

                            </span>

                        </NavLink>


                        <NavLink
                            to="/admin/settings"
                            className={navLinkClass}
                        >

                            <Settings
                                className="
                                    w-4
                                    h-4
                                    shrink-0
                                "
                            />

                            <span>

                                <span className="hidden sm:inline">
                                    Statutory Tariffs
                                </span>

                                <span className="sm:hidden">
                                    Settings
                                </span>

                            </span>

                        </NavLink>

                    </div>

                </nav>


                {/* =================================================
                    CURRENT ADMIN PAGE
                ================================================== */}

                <section
                    className="
                        w-full
                        min-w-0

                        overflow-x-hidden
                    "
                >

                    <Outlet
                        context={{
                            user: currentUser
                        }}
                    />

                </section>

            </main>


            {/* =====================================================
                ADMIN PROFILE MODAL
            ====================================================== */}

            {showProfile && currentUser && (

                <ProfileModal
                    user={currentUser}

                    onClose={() =>
                        setShowProfile(false)
                    }

                    onUpdateUser={handleUpdateUser}
                />

            )}

        </div>

    );

}