import React, { useState } from 'react';
import API from '../services/api';

import {
  User,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  KeySquare,
  Landmark,
  Loader2,
  ArrowLeft,
  Building2,
  ChevronRight,
  Mail,
  BadgeCheck,
} from 'lucide-react';

export default function AdminAuthModal({
  onLoginSuccess,
  onSwitchToStudent,
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    adminSecret: '',
  });

  /* =========================================================
     HELPERS
  ========================================================= */

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const switchMode = (registering) => {
    setIsRegistering(registering);
    resetMessages();

    setFormData({
      name: '',
      password: '',
      adminSecret: '',
    });
  };

  /* =========================================================
     SUBMIT
  ========================================================= */

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    resetMessages();

    const name = formData.name.trim();
    const password = formData.password;
    const adminSecret =
      formData.adminSecret.trim();

    /* ---------------------------
       BASIC VALIDATION
    --------------------------- */

    if (!name) {
      setError(
        'Please enter the administrator name.'
      );
      setLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError(
        'Password must contain at least 8 characters.'
      );
      setLoading(false);
      return;
    }

    if (isRegistering && !adminSecret) {
      setError(
        'Please enter the administrator authorization code.'
      );
      setLoading(false);
      return;
    }

    try {
      /* =====================================================
         ADMIN REGISTRATION
      ===================================================== */

      if (isRegistering) {
        await API.post(
          '/auth/register-admin',
          {
            name,
            password,
            adminSecret,
          }
        );

        setSuccessMsg(
          'Administrator account created successfully. You can now sign in.'
        );

        setFormData({
          name,
          password: '',
          adminSecret: '',
        });

        setTimeout(() => {
          setIsRegistering(false);
          resetMessages();
        }, 1600);
      }

      /* =====================================================
         ADMIN LOGIN
      ===================================================== */

      else {
        const { data } =
          await API.post(
            '/auth/login',
            {
              name,
              password,
              role: 'admin',
            }
          );

        localStorage.setItem(
          'token',
          data.token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to authenticate. Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================================================
     COMPACT ADMIN DESIGN
  ========================================================= */

  const inputClass =
    'w-full min-w-0 h-10 sm:h-11 rounded-lg border border-slate-300 bg-white px-3 text-[13px] sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:ring-2 focus:ring-slate-200';

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col">

      {/* =====================================================
          TOP GOVERNANCE BAR
      ===================================================== */}

      <div className="bg-slate-950 text-slate-300 shrink-0">

        <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2">

          <div className="flex items-center justify-between gap-2">

            <div className="flex items-center gap-1.5 min-w-0">

              <span className="relative flex w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0">

                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />

                <span className="relative rounded-full bg-emerald-400 w-full h-full" />

              </span>

              <span className="truncate text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                Institutional Administration Portal
              </span>

            </div>


            <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] text-slate-400 shrink-0">

              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />

              <span className="hidden sm:inline">
                Restricted Administrative Access
              </span>

              <span className="sm:hidden">
                Restricted Access
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          ADMIN HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 shrink-0">

        <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5">

          <div className="flex items-center justify-between gap-2.5">

            {/* BRAND */}

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-slate-950 flex items-center justify-center shrink-0 shadow-sm">

                <Landmark className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />

              </div>


              <div className="min-w-0">

                <div className="flex items-center gap-1.5">

                  <h1 className="text-[13px] sm:text-lg lg:text-xl font-bold text-slate-950 truncate leading-tight">
                    Hostel Administration
                  </h1>

                  <span className="hidden sm:inline-flex shrink-0 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase text-amber-700">
                    Admin
                  </span>

                </div>

                <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 mt-0.5 truncate">
                  Mess records • Fees • Student welfare
                </p>

              </div>

            </div>


            {/* STUDENT SWITCH */}

            <button
              type="button"
              onClick={onSwitchToStudent}
              className="shrink-0 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-2 sm:py-2.5 text-[9px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 active:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />

              <span className="hidden sm:inline">
                Student Portal
              </span>

              <span className="sm:hidden">
                Student
              </span>

              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />

            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="flex-1 w-full min-w-0 px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-7">

        <div className="w-full max-w-md mx-auto min-w-0">


          {/* =================================================
              ACCESS CARD
          ================================================= */}

          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-[0_6px_25px_rgba(15,23,42,0.07)] overflow-hidden">


            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="bg-slate-950 text-white px-3.5 sm:px-5 py-3 sm:py-4">

              <div className="flex items-center gap-2.5">

                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-white/10 border border-white/10 flex items-center justify-center shrink-0">

                  {isRegistering ? (
                    <UserPlus className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
                  ) : (
                    <KeySquare className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-amber-300" />
                  )}

                </div>


                <div className="min-w-0">

                  <h2 className="text-[13px] sm:text-base font-bold truncate leading-tight">
                    {isRegistering
                      ? 'Register Administrator'
                      : 'Administrator Sign In'}
                  </h2>

                  <p className="text-[9px] sm:text-[11px] text-slate-400 mt-0.5 truncate">
                    {isRegistering
                      ? 'Create a verified administrative account'
                      : 'Authorized personnel only'}
                  </p>

                </div>

              </div>


              {/* ACCESS LEVEL */}

              <div className="mt-2.5 flex items-center gap-1.5 text-[8px] sm:text-[10px] text-slate-400">

                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />

                <span>
                  Executive / Warden access level
                </span>

              </div>

            </div>


            {/* =================================================
                MODE SWITCH
            ================================================= */}

            <div className="px-3 sm:px-5 pt-3 sm:pt-4">

              <div className="grid grid-cols-2 rounded-lg bg-slate-100 border border-slate-200 p-0.5">

                <button
                  type="button"
                  onClick={() =>
                    switchMode(false)
                  }
                  className={`h-8.5 sm:h-9.5 rounded-md text-[10px] sm:text-xs font-bold transition ${
                    !isRegistering
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Administrator Login
                </button>

                <button
                  type="button"
                  onClick={() =>
                    switchMode(true)
                  }
                  className={`h-8.5 sm:h-9.5 rounded-md text-[10px] sm:text-xs font-bold transition ${
                    isRegistering
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  New Administrator
                </button>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <div className="p-3 sm:p-5">

              {/* ERROR */}

              {error && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 sm:px-3 py-2.5">

                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

                  <div className="min-w-0">

                    <p className="text-[10px] sm:text-xs font-bold text-red-800">
                      Authentication failed
                    </p>

                    <p className="text-[9px] sm:text-[10px] text-red-700 mt-0.5 leading-relaxed break-words">
                      {error}
                    </p>

                  </div>

                </div>
              )}


              {/* SUCCESS */}

              {successMsg && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-2.5">

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />

                  <div className="min-w-0">

                    <p className="text-[10px] sm:text-xs font-bold text-emerald-800">
                      Operation successful
                    </p>

                    <p className="text-[9px] sm:text-[10px] text-emerald-700 mt-0.5 leading-relaxed">
                      {successMsg}
                    </p>

                  </div>

                </div>
              )}


              <form
                onSubmit={handleSubmit}
                className="space-y-3 sm:space-y-4"
              >

                {/* =================================================
                    ADMIN NAME
                ================================================= */}

                <div>

                  <label className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-bold text-slate-700">

                    <User className="w-3.5 h-3.5 text-slate-700" />

                    Administrator Name

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <div className="relative">

                    <input
                      required
                      type="text"
                      autoComplete="username"
                      placeholder="Enter administrator name"
                      value={formData.name}
                      onChange={(e) =>
                        updateField(
                          'name',
                          e.target.value
                        )
                      }
                      className={`${inputClass} pr-10`}
                    />

                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                  </div>

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>

                  <label className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-bold text-slate-700">

                    <Lock className="w-3.5 h-3.5 text-slate-700" />

                    Password

                    <span className="text-red-500">
                      *
                    </span>

                  </label>

                  <div className="relative">

                    <input
                      required
                      type="password"
                      autoComplete={
                        isRegistering
                          ? 'new-password'
                          : 'current-password'
                      }
                      placeholder={
                        isRegistering
                          ? 'Create password'
                          : 'Enter password'
                      }
                      value={
                        formData.password
                      }
                      onChange={(e) =>
                        updateField(
                          'password',
                          e.target.value
                        )
                      }
                      className={`${inputClass} pr-10`}
                    />

                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

                  </div>

                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                    Minimum 8 characters.
                  </p>

                </div>


                {/* =================================================
                    ADMIN SECRET
                ================================================= */}

                {isRegistering && (
                  <div>

                    <label className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-bold text-slate-700">

                      <KeySquare className="w-3.5 h-3.5 text-amber-600" />

                      Authorization Code

                      <span className="text-red-500">
                        *
                      </span>

                    </label>

                    <div className="relative">

                      <input
                        required
                        type="password"
                        autoComplete="off"
                        placeholder="Enter authorization code"
                        value={
                          formData.adminSecret
                        }
                        onChange={(e) =>
                          updateField(
                            'adminSecret',
                            e.target.value
                          )
                        }
                        className={`${inputClass} pr-10`}
                      />

                      <KeySquare className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />

                    </div>

                    <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-relaxed">
                      Required to create a new administrator account.
                    </p>

                  </div>
                )}


                {/* =================================================
                    SECURITY NOTICE
                ================================================= */}

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-2.5">

                  <div className="flex items-start gap-2">

                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />

                    <div>

                      <p className="text-[10px] sm:text-xs font-bold text-slate-800">
                        Restricted access
                      </p>

                      <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                        This area is intended only for authorized hostel administration personnel.
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 sm:h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 hover:bg-slate-800 active:bg-black text-white px-4 text-xs sm:text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                >

                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                  ) : isRegistering ? (
                    <UserPlus className="w-4 h-4 shrink-0" />
                  ) : (
                    <LogIn className="w-4 h-4 shrink-0" />
                  )}

                  <span>
                    {loading
                      ? isRegistering
                        ? 'Creating account...'
                        : 'Authenticating...'
                      : isRegistering
                      ? 'Create Administrator Account'
                      : 'Sign In to Administration'}
                  </span>

                  {!loading && (
                    <ChevronRight className="hidden sm:block w-4 h-4 opacity-60" />
                  )}

                </button>

              </form>

            </div>


            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3">

              <div className="flex items-center justify-between gap-2">

                <div className="flex items-center gap-1.5 min-w-0">

                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                  <span className="text-[8px] sm:text-[10px] text-slate-500 truncate">
                    Secure administrative access
                  </span>

                </div>

                <span className="hidden sm:block text-[9px] text-slate-400 shrink-0">
                  Institutional Portal
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              ACCESS INFORMATION
          ================================================= */}

          <div className="grid grid-cols-2 gap-2 mt-2.5 sm:mt-3">

            <AccessInfo
              icon={
                <Building2 className="w-3.5 h-3.5" />
              }
              title="Hostel Operations"
              text="Students & mess"
            />

            <AccessInfo
              icon={
                <BadgeCheck className="w-3.5 h-3.5" />
              }
              title="Administrative"
              text="Fees & records"
            />

          </div>


          {/* =================================================
              SUPPORT
          ================================================= */}

          <div className="flex items-center justify-center gap-1.5 mt-2.5 px-2 text-[9px] sm:text-[10px] text-slate-500">

            <Mail className="w-3 h-3 shrink-0" />

            <span>
              Administrative support:
            </span>

            <span className="inline-flex items-center gap-1 font-medium text-black-900">
                          <Mail className="h-3.5 w-3.5" />
                          adminconnect.org@gmail.com
                        </span>

          </div>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white shrink-0">

        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 text-center text-[8px] sm:text-[9px] text-slate-400">

          2026 @ALL RIGHTS RESERVED.

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   ACCESS INFO CARD
========================================================= */

function AccessInfo({
  icon,
  title,
  text,
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white px-2.5 py-2 sm:px-3 sm:py-2.5">

      <div className="flex items-center gap-1.5 min-w-0">

        <div className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
          {icon}
        </div>

        <div className="min-w-0">

          <p className="text-[9px] sm:text-[10px] font-bold text-slate-800 truncate">
            {title}
          </p>

          <p className="text-[8px] sm:text-[9px] text-slate-500 truncate">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}