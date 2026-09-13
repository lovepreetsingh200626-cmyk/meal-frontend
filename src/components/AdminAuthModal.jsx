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
  Eye,
  EyeOff,
  Server,
  Database,
  FileCheck2,
  Activity,
  Menu,
  X,
} from 'lucide-react';

export default function AdminAuthModal({
  onLoginSuccess,
  onSwitchToStudent,
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminSecret, setShowAdminSecret] = useState(false);
  const [showMobileInfo, setShowMobileInfo] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    adminSecret: '',
  });

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
    setShowPassword(false);
    setShowAdminSecret(false);

    setFormData({
      name: '',
      password: '',
      adminSecret: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    resetMessages();

    const name = formData.name.trim();
    const password = formData.password;
    const adminSecret = formData.adminSecret.trim();

    if (!name) {
      setError('Please enter the administrator name.');
      setLoading(false);
      return;
    }

    if (!password || password.length < 8) {
      setError('Password must contain at least 8 characters.');
      setLoading(false);
      return;
    }

    if (isRegistering && !adminSecret) {
      setError('Please enter the administrator authorization code.');
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await API.post('/auth/register-admin', {
          name,
          password,
          adminSecret,
        });

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
          setShowPassword(false);
          setShowAdminSecret(false);
        }, 1600);
      } else {
        const { data } = await API.post('/auth/login', {
          name,
          password,
          role: 'admin',
        });

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

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

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#07111f] text-slate-100">

      {/* =========================================================
          BACKGROUND
      ========================================================= */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-900/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-amber-600/10 blur-3xl" />

        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)',
            backgroundSize: '36px 36px',
          }}
        />
      </div>

      {/* =========================================================
          TOP BAR
      ========================================================= */}
      <header className="relative z-10 border-b border-white/10 bg-[#050c17]/90 backdrop-blur">

        <div className="mx-auto flex min-h-[58px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-400/20 bg-amber-400/10">
              <Landmark className="h-4 w-4 text-amber-300" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200 sm:text-xs">
                GNDU Hostel Administration
              </p>

              <p className="hidden text-[9px] text-slate-500 sm:block">
                Mess Records & Fee Management System
              </p>
            </div>

          </div>

          {/* Desktop status */}
          <div className="hidden items-center gap-2 sm:flex">

            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Secure Administrative Channel
            </span>

          </div>

          {/* Mobile info button */}
          <button
            type="button"
            onClick={() => setShowMobileInfo((prev) => !prev)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-slate-300 sm:hidden"
            aria-label="Show system information"
          >
            {showMobileInfo ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>

        </div>

        {/* Mobile status panel */}
        {showMobileInfo && (
          <div className="border-t border-white/10 bg-[#050c17] px-4 py-3 sm:hidden">

            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />

              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Secure Administrative Channel
              </span>
            </div>

          </div>
        )}

      </header>

      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="relative z-10 flex min-h-[calc(100vh-58px)] w-full items-center justify-center px-4 py-6 sm:px-6 sm:py-10">

        <div className="mx-auto grid w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-[#0b1728]/95 shadow-[0_25px_80px_rgba(0,0,0,0.35)] lg:grid-cols-[0.9fr_1.1fr]">

          {/* =====================================================
              LEFT ADMINISTRATIVE PANEL
          ===================================================== */}
          <section className="relative hidden overflow-hidden border-r border-white/10 bg-[#091525] p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">

            {/* Decorative line */}
            <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-700 via-blue-500 to-amber-400" />

            <div>

              {/* Icon */}
              <div className="mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-300/10">
                <Landmark className="h-8 w-8 text-amber-300" />
              </div>

              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300">
                Administrative Division
              </p>

              <h1 className="max-w-md text-3xl font-bold leading-tight text-white xl:text-4xl">
                Hostel Mess
                <br />
                <span className="text-slate-300">
                  Control Center
                </span>
              </h1>

              <p className="mt-5 max-w-md text-sm leading-6 text-slate-400">
                Centralized management for student mess records, fee
                clearances, meal expenditure, complaints and hostel
                administration.
              </p>

              {/* System modules */}
              <div className="mt-8 space-y-2.5">

                <AdminModule
                  icon={Database}
                  title="Student Records"
                  text="Centralized member directory"
                />

                <AdminModule
                  icon={FileCheck2}
                  title="Fee & Payment Ledger"
                  text="Financial record management"
                />

                <AdminModule
                  icon={Activity}
                  title="Mess Operations"
                  text="Meal and expenditure monitoring"
                />

              </div>

            </div>

            {/* Bottom security block */}
            <div className="mt-10 border-t border-white/10 pt-6">

              <div className="flex items-start gap-3">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-400/10">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-200">
                    Restricted administrative access
                  </p>

                  <p className="mt-1 text-[10px] leading-5 text-slate-500">
                    Access is limited to authorized hostel administration
                    personnel.
                  </p>
                </div>

              </div>

            </div>

          </section>

          {/* =====================================================
              RIGHT AUTH PANEL
          ===================================================== */}
          <section className="bg-slate-50 text-slate-900">

            {/* Top heading */}
            <div className="border-b border-slate-200 px-5 py-5 sm:px-8 sm:py-7">

              <div className="flex items-start justify-between gap-4">

                <div className="flex min-w-0 items-start gap-3">

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-950 shadow-sm">
                    {isRegistering ? (
                      <UserPlus className="h-5 w-5 text-white" />
                    ) : (
                      <LogIn className="h-5 w-5 text-white" />
                    )}
                  </div>

                  <div className="min-w-0">

                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-700 sm:text-[10px]">
                      {isRegistering
                        ? 'Administrator Registration'
                        : 'Administrator Authentication'}
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">
                      {isRegistering
                        ? 'Create Admin Account'
                        : 'Sign in to Control Center'}
                    </h2>

                    <p className="mt-1 text-[11px] leading-relaxed text-slate-500 sm:text-xs">
                      {isRegistering
                        ? 'Register an authorized administrative account.'
                        : 'Enter your credentials to continue.'}
                    </p>

                  </div>

                </div>

                {/* Security badge */}
                <div className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 sm:flex">

                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />

                  <span className="text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    Secure
                  </span>

                </div>

              </div>

              {/* Mode switch */}
              <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1">

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`
                    flex min-h-11 items-center justify-center gap-2 rounded-lg
                    px-3 py-2.5 text-xs font-bold transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-200
                    ${
                      !isRegistering
                        ? 'bg-white text-blue-800 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }
                  `}
                >
                  <LogIn className="h-4 w-4" />
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`
                    flex min-h-11 items-center justify-center gap-2 rounded-lg
                    px-3 py-2.5 text-xs font-bold transition-all
                    focus:outline-none focus:ring-2 focus:ring-blue-200
                    ${
                      isRegistering
                        ? 'bg-white text-blue-800 shadow-sm'
                        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                    }
                  `}
                >
                  <UserPlus className="h-4 w-4" />
                  Register
                </button>

              </div>

            </div>

            {/* ===================================================
                FORM
            =================================================== */}
            <div className="px-5 py-5 sm:px-8 sm:py-7">

              {/* Error */}
              {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5">

                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-red-800">
                      Authentication Failed
                    </p>

                    <p className="mt-1 break-words text-xs leading-relaxed text-red-700">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5">

                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-emerald-800">
                      Account Created
                    </p>

                    <p className="mt-1 break-words text-xs leading-relaxed text-emerald-700">
                      {successMsg}
                    </p>
                  </div>

                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* =================================================
                    ADMIN NAME
                ================================================= */}
                <div>

                  <label
                    htmlFor="admin-name"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Administrator Name
                    <span className="ml-1 text-red-500">*</span>
                  </label>

                  <div className="relative">

                    <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="admin-name"
                      required
                      type="text"
                      autoComplete="username"
                      placeholder="Enter administrator name"
                      value={formData.name}
                      onChange={(e) =>
                        updateField('name', e.target.value)
                      }
                      disabled={loading}
                      className="
                        min-h-[49px] w-full rounded-xl
                        border border-slate-300 bg-white
                        pl-10 pr-3 text-sm text-slate-900
                        outline-none transition-all
                        placeholder:text-slate-400
                        hover:border-slate-400
                        focus:border-blue-700
                        focus:ring-4 focus:ring-blue-50
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                      "
                    />

                  </div>

                </div>

                {/* =================================================
                    PASSWORD
                ================================================= */}
                <div>

                  <div className="mb-1.5 flex items-center justify-between gap-2">

                    <label
                      htmlFor="admin-password"
                      className="text-xs font-bold text-slate-700"
                    >
                      Password
                      <span className="ml-1 text-red-500">*</span>
                    </label>

                    <span className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
                      Protected
                    </span>

                  </div>

                  <div className="relative">

                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                      id="admin-password"
                      required
                      type={showPassword ? 'text' : 'password'}
                      autoComplete={
                        isRegistering
                          ? 'new-password'
                          : 'current-password'
                      }
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) =>
                        updateField('password', e.target.value)
                      }
                      disabled={loading}
                      className="
                        min-h-[49px] w-full rounded-xl
                        border border-slate-300 bg-white
                        pl-10 pr-12 text-sm text-slate-900
                        outline-none transition-all
                        placeholder:text-slate-400
                        hover:border-slate-400
                        focus:border-blue-700
                        focus:ring-4 focus:ring-blue-50
                        disabled:cursor-not-allowed
                        disabled:bg-slate-50
                      "
                    />

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() =>
                        setShowPassword((prev) => !prev)
                      }
                      className="
                        absolute right-2 top-1/2 flex h-9 w-9
                        -translate-y-1/2 items-center justify-center
                        rounded-lg text-slate-400
                        hover:bg-slate-100 hover:text-slate-700
                        focus:outline-none focus:ring-2 focus:ring-blue-200
                      "
                      aria-label={
                        showPassword
                          ? 'Hide password'
                          : 'Show password'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>

                  </div>

                  {isRegistering && (
                    <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                      Password must contain at least 8 characters.
                    </p>
                  )}

                </div>

                {/* =================================================
                    AUTHORIZATION CODE
                ================================================= */}
                {isRegistering && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5 sm:p-4">

                    <div className="mb-3 flex items-start gap-2.5">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                        <KeySquare className="h-4 w-4 text-amber-700" />
                      </div>

                      <div className="min-w-0">
                        <label
                          htmlFor="admin-secret"
                          className="block text-xs font-bold text-amber-900"
                        >
                          Authorization Code
                          <span className="ml-1 text-red-600">*</span>
                        </label>

                        <p className="mt-0.5 text-[10px] leading-relaxed text-amber-700">
                          Required to register an administrator
                        </p>
                      </div>

                    </div>

                    <div className="relative">

                      <input
                        id="admin-secret"
                        required
                        type={
                          showAdminSecret
                            ? 'text'
                            : 'password'
                        }
                        autoComplete="off"
                        placeholder="Enter authorization code"
                        value={formData.adminSecret}
                        onChange={(e) =>
                          updateField(
                            'adminSecret',
                            e.target.value
                          )
                        }
                        disabled={loading}
                        className="
                          min-h-[49px] w-full rounded-xl
                          border border-amber-300 bg-white
                          px-3 pr-12 text-sm text-slate-900
                          outline-none transition-all
                          placeholder:text-slate-400
                          hover:border-amber-400
                          focus:border-amber-500
                          focus:ring-4 focus:ring-amber-100
                        "
                      />

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() =>
                          setShowAdminSecret(
                            (prev) => !prev
                          )
                        }
                        className="
                          absolute right-2 top-1/2 flex h-9 w-9
                          -translate-y-1/2 items-center justify-center
                          rounded-lg text-amber-700
                          hover:bg-amber-100
                          focus:outline-none focus:ring-2
                          focus:ring-amber-200
                        "
                        aria-label={
                          showAdminSecret
                            ? 'Hide authorization code'
                            : 'Show authorization code'
                        }
                      >
                        {showAdminSecret ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>

                    </div>

                    <p className="mt-2.5 text-[10px] leading-relaxed text-amber-800">
                      This code should only be provided to
                      authorized hostel administrative personnel.
                    </p>

                  </div>
                )}

                {/* =================================================
                    SUBMIT BUTTON
                ================================================= */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    group flex min-h-[51px] w-full
                    items-center justify-center gap-2
                    rounded-xl bg-blue-950 px-4 py-3
                    text-sm font-bold text-white
                    shadow-sm transition-all duration-200
                    hover:bg-blue-900 hover:shadow-md
                    active:scale-[0.995]
                    focus:outline-none focus:ring-4
                    focus:ring-blue-100
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      <span>
                        {isRegistering
                          ? 'Creating Account...'
                          : 'Authenticating...'}
                      </span>
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="h-4 w-4" />

                      <span className="truncate">
                        Create Administrator Account
                      </span>

                      <ChevronRight className="hidden h-4 w-4 opacity-60 sm:block" />
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />

                      <span>
                        Enter Administrative Portal
                      </span>

                      <ChevronRight className="hidden h-4 w-4 opacity-60 sm:block" />
                    </>
                  )}

                </button>

              </form>

            </div>

            {/* =====================================================
                BOTTOM ACTIONS
            ===================================================== */}
            <div className="border-t border-slate-200 bg-white px-5 py-4 sm:px-8">

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                {/* Security */}
                <div className="flex items-center gap-2.5">

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold text-slate-700">
                      Protected session
                    </p>

                    <p className="text-[9px] text-slate-400">
                      Authorized personnel only
                    </p>
                  </div>

                </div>

                {/* Student portal */}
                <button
                  type="button"
                  onClick={onSwitchToStudent}
                  className="
                    inline-flex min-h-10 items-center
                    justify-center gap-2 rounded-lg
                    border border-slate-300 bg-slate-50
                    px-3.5 py-2 text-[11px] font-bold
                    text-slate-700 transition-all
                    hover:border-slate-400 hover:bg-slate-100
                    focus:outline-none focus:ring-2
                    focus:ring-blue-200
                  "
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Student Portal
                </button>

              </div>

            </div>

          </section>

        </div>

      </main>

      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="relative z-10 border-t border-white/10 bg-[#050c17]">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:px-6 lg:px-8">

          <p className="text-[8px] uppercase tracking-[0.12em] text-slate-600 sm:text-[9px]">
            Hostel Mess & Fee Payment Portal
          </p>

          <div className="flex items-center gap-1.5 text-[8px] text-slate-600 sm:text-[9px]">
            <Server className="h-3 w-3" />
            <span>Administrative Gateway</span>
          </div>

        </div>

      </footer>

    </div>
  );
}

/* =============================================================
   ADMIN MODULE COMPONENT
============================================================= */

function AdminModule({ icon: Icon, title, text }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
        <Icon className="h-4 w-4 text-blue-300" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-200">
          {title}
        </p>

        <p className="mt-0.5 text-[10px] text-slate-500">
          {text}
        </p>
      </div>

    </div>
  );
}