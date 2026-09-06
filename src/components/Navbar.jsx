import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils,
  FileText,
  MessageSquareWarning,
  LayoutDashboard,
  Users,
  BellRing,
  Settings,
  LogOut,
  CreditCard,
  ShieldCheck,
  Landmark,
  UserRound
} from 'lucide-react';

export default function Navbar({
  user,
  onLogout,
  onOpenProfile,
  activeAdminTab,
  onSelectAdminTab
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = user?.role === 'admin';

  const studentLinks = [
    {
      name: 'Dashboard',
      path: '/student',
      icon: LayoutDashboard
    },
    {
      name: 'Diet Register',
      path: '/student/logger',
      icon: Utensils
    },
    {
      name: 'Expense Ledger',
      path: '/student/ledger',
      icon: FileText
    },
    {
      name: 'Payments',
      path: '/student/payments',
      icon: CreditCard
    },
    {
      name: 'Complaints',
      path: '/student/complaints',
      icon: MessageSquareWarning
    }
  ];

  const adminLinks = [
    {
      name: 'Users',
      tab: 'users',
      icon: Users
    },
    {
      name: 'Administrators',
      tab: 'admins',
      icon: ShieldCheck
    },
    {
      name: 'Meals',
      tab: 'meals',
      icon: Utensils
    },
    {
      name: 'Payments',
      tab: 'payments',
      icon: CreditCard
    },
    {
      name: 'Complaints',
      tab: 'complaints',
      icon: MessageSquareWarning
    },
    {
      name: 'Notices',
      tab: 'notices',
      icon: BellRing
    },
    {
      name: 'Settings',
      tab: 'settings',
      icon: Settings
    }
  ];

  const handleProfileClick = () => {
    if (onOpenProfile) {
      onOpenProfile();
    }

    // Keep existing student profile route behaviour.
    if (!isAdmin) {
      navigate('/student/profile');
    }
  };

  const handleStudentNavigation = (path) => {
    navigate(path);
  };

  const handleAdminNavigation = (tab) => {
    if (onSelectAdminTab) {
      onSelectAdminTab(tab);
    }
  };

  return (
    <header
      className="
        sticky top-0 z-50
        w-full min-w-0
        bg-white
        border-b border-slate-200
        shadow-sm
        font-sans
        print:hidden
        overflow-x-hidden
      "
    >
      {/* =========================================================
          TOP INFORMATION BAR
      ========================================================== */}
      <div
        className="
          bg-slate-900
          text-slate-300
          px-3 sm:px-4 md:px-8
          py-1.5 sm:py-2
        "
      >
        <div
          className="
            max-w-[1600px]
            mx-auto
            flex items-center
            justify-between
            gap-2 sm:gap-4
            min-w-0
          "
        >
          <div
            className="
              flex items-center
              gap-1.5 sm:gap-2
              min-w-0
            "
          >
            <span
              className="
                w-1.5 h-1.5 sm:w-2 sm:h-2
                rounded-full
                bg-emerald-400
                shrink-0
              "
            />

            <span
              className="
                text-[9px]
                sm:text-[10px]
                md:text-[11px]
                font-medium
                truncate
              "
            >
              GNDU Hostel & Mess Management Portal
            </span>
          </div>

          <div
            className="
              hidden sm:flex
              items-center
              gap-2 sm:gap-3
              text-[9px]
              sm:text-[10px]
              text-slate-400
              shrink-0
            "
          >
            {user?.session && (
              <span>
                Session:{' '}
                <strong className="text-slate-200 font-semibold">
                  {user.session}
                </strong>
              </span>
            )}

            {user?.hostelNo && (
              <>
                <span className="text-slate-600">•</span>

                <span>
                  Hostel:{' '}
                  <strong className="text-blue-300 font-semibold">
                    {user.hostelNo}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================
          MAIN IDENTITY BAR
      ========================================================== */}
      <div
        className="
          px-3 sm:px-4 md:px-8
          py-2.5 sm:py-3
          bg-white
        "
      >
        <div
          className="
            max-w-[1600px]
            mx-auto
            flex items-center
            justify-between
            gap-2 sm:gap-4
            min-w-0
          "
        >
          {/* Brand */}
          <button
            type="button"
            onClick={() => navigate(isAdmin ? '/admin' : '/student')}
            className="
              flex
              items-center
              gap-2 sm:gap-3
              text-left
              min-w-0
              flex-1
              cursor-pointer
              group
            "
          >
            <div
              className="
                w-9 h-9
                sm:w-11 sm:h-11
                md:w-12 md:h-12
                rounded-lg sm:rounded-xl
                bg-blue-50
                border border-blue-100
                flex items-center
                justify-center
                shrink-0
                group-hover:bg-blue-100
                transition
              "
            >
              <Landmark
                className="
                  w-4 h-4
                  sm:w-5 sm:h-5
                  md:w-6 md:h-6
                  text-blue-700
                "
              />
            </div>

            <div className="min-w-0 flex-1">
              <h1
                className="
                  text-xs
                  sm:text-sm
                  md:text-base
                  lg:text-lg
                  font-bold
                  text-slate-900
                  leading-tight
                  truncate
                "
              >
                Hostel & Mess Management
              </h1>

              <p
                className="
                  text-[8px]
                  sm:text-[9px]
                  md:text-[10px]
                  lg:text-[11px]
                  text-slate-500
                  font-medium
                  mt-0.5
                  truncate
                "
              >
                Guru Nanak Dev University, Amritsar
              </p>
            </div>
          </button>

          {/* User Controls */}
          <div
            className="
              flex
              items-center
              gap-1.5 sm:gap-2 md:gap-3
              shrink-0
            "
          >
            {/* Profile */}
            <button
              type="button"
              onClick={handleProfileClick}
              className="
                flex
                items-center
                gap-2
                px-1.5
                sm:px-2
                md:px-3
                py-1
                sm:py-1.5
                rounded-lg sm:rounded-xl
                border border-slate-200
                bg-white
                hover:bg-slate-50
                hover:border-slate-300
                transition
                cursor-pointer
                text-left
              "
              title="Open profile"
            >
              <div
                className="
                  w-8 h-8
                  sm:w-9 sm:h-9
                  md:w-10 md:h-10
                  rounded-lg
                  overflow-hidden
                  bg-slate-100
                  border border-slate-200
                  flex items-center
                  justify-center
                  shrink-0
                "
              >
                {user?.profilePhoto ? (
                  <img
                    src={user.profilePhoto}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <UserRound
                    className="
                      w-4 h-4
                      sm:w-5 sm:h-5
                      text-slate-400
                    "
                  />
                )}
              </div>

              <div
                className="
                  hidden
                  sm:block
                  min-w-0
                "
              >
                <p
                  className="
                    max-w-[150px]
                    text-xs
                    font-bold
                    text-slate-800
                    truncate
                  "
                >
                  {user?.name || 'User'}
                </p>

                <p
                  className="
                    text-[10px]
                    text-slate-500
                    mt-0.5
                    truncate
                  "
                >
                  {isAdmin
                    ? 'Administrator'
                    : user?.studentId || 'Student'}
                </p>
              </div>
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={onLogout}
              className="
                w-9 h-9
                sm:w-10 sm:h-10
                md:w-auto
                md:h-10
                px-0
                md:px-3
                rounded-lg sm:rounded-xl
                border border-red-200
                bg-red-50
                text-red-600
                hover:bg-red-100
                hover:border-red-300
                transition
                cursor-pointer
                flex
                items-center
                justify-center
                gap-2
                shrink-0
              "
              title="Logout"
            >
              <LogOut className="w-4 h-4" />

              <span
                className="
                  hidden
                  md:inline
                  text-xs
                  font-bold
                "
              >
                Logout
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================
          NAVIGATION
      ========================================================== */}
      <nav
        className="
          bg-slate-50
          border-t border-slate-200
          overflow-x-auto
          overscroll-x-contain
          scrollbar-thin
        "
      >
        <div
          className="
            max-w-[1600px]
            mx-auto
            px-3 sm:px-4 md:px-8
          "
        >
          <div
            className="
              flex
              items-center
              gap-1
              sm:gap-1.5
              py-1.5
              sm:py-2
              min-w-max
            "
          >
            {/* =========================
                ADMIN NAVIGATION
            ========================== */}
            {isAdmin &&
              adminLinks.map((link) => {
                const Icon = link.icon;

                const isActive =
                  activeAdminTab === link.tab;

                return (
                  <button
                    key={link.tab}
                    type="button"
                    onClick={() =>
                      handleAdminNavigation(link.tab)
                    }
                    className={`
                      flex
                      items-center
                      gap-1.5
                      sm:gap-2
                      px-2.5
                      sm:px-3
                      md:px-4
                      py-2
                      sm:py-2.5
                      rounded-lg
                      text-[9px]
                      sm:text-[10px]
                      md:text-xs
                      font-semibold
                      whitespace-nowrap
                      transition
                      cursor-pointer
                      border
                      shrink-0

                      ${
                        isActive
                          ? `
                            bg-blue-700
                            text-white
                            border-blue-700
                            shadow-sm
                          `
                          : `
                            bg-white
                            text-slate-600
                            border-slate-200
                            hover:bg-blue-50
                            hover:text-blue-700
                            hover:border-blue-100
                          `
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-3 h-3
                        sm:w-3.5 sm:h-3.5
                        md:w-4 md:h-4
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400'
                        }
                      `}
                    />

                    <span>{link.name}</span>
                  </button>
                );
              })}

            {/* =========================
                STUDENT NAVIGATION
            ========================== */}
            {!isAdmin &&
              studentLinks.map((link) => {
                const Icon = link.icon;

                const isActive =
                  location.pathname === link.path;

                return (
                  <button
                    key={link.path}
                    type="button"
                    onClick={() =>
                      handleStudentNavigation(link.path)
                    }
                    className={`
                      flex
                      items-center
                      gap-1.5
                      sm:gap-2
                      px-2.5
                      sm:px-3
                      md:px-4
                      py-2
                      sm:py-2.5
                      rounded-lg
                      text-[9px]
                      sm:text-[10px]
                      md:text-xs
                      font-semibold
                      whitespace-nowrap
                      transition
                      cursor-pointer
                      border
                      shrink-0

                      ${
                        isActive
                          ? `
                            bg-blue-700
                            text-white
                            border-blue-700
                            shadow-sm
                          `
                          : `
                            bg-white
                            text-slate-600
                            border-slate-200
                            hover:bg-blue-50
                            hover:text-blue-700
                            hover:border-blue-100
                          `
                      }
                    `}
                  >
                    <Icon
                      className={`
                        w-3 h-3
                        sm:w-3.5 sm:h-3.5
                        md:w-4 md:h-4
                        ${
                          isActive
                            ? 'text-white'
                            : 'text-slate-400'
                        }
                      `}
                    />

                    <span>{link.name}</span>
                  </button>
                );
              })}
          </div>
        </div>
      </nav>
    </header>
  );
}