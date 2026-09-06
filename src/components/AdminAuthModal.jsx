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
} from 'lucide-react';

export default function AdminAuthModal({
  onLoginSuccess,
  onSwitchToStudent
}) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    adminSecret: ''
  });

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const switchMode = (registering) => {
    setIsRegistering(registering);
    resetMessages();

    setFormData({
      name: '',
      password: '',
      adminSecret: ''
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
          adminSecret
        });

        setSuccessMsg(
          'Administrator account created successfully. You can now sign in.'
        );

        setFormData({
          name,
          password: '',
          adminSecret: ''
        });

        setTimeout(() => {
          setIsRegistering(false);
          resetMessages();
        }, 1600);
      } else {
        const { data } = await API.post('/auth/login', {
          name,
          password,
          role: 'admin'
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
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-100 text-slate-900 flex flex-col">

      {/* =========================================================
          TOP INSTITUTIONAL BAR
      ========================================================= */}
      <div className="bg-slate-950 border-b border-slate-800 text-slate-300">
        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-2.5">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">

            <div className="min-w-0 flex items-center justify-center sm:justify-start gap-2 text-center sm:text-left">

              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
              </span>

              <span className="truncate text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.08em]">
                Mess Records & Fee Payment Portal
              </span>

              <span className="hidden md:inline text-slate-700">
                •
              </span>

              <span className="hidden md:inline text-[10px] text-slate-500">
                Hostel Administration
              </span>

            </div>

            <div className="flex items-center gap-2 text-[9px] sm:text-[10px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Authorized administrative access</span>
            </div>

          </div>

        </div>
      </div>


      {/* =========================================================
          HEADER
      ========================================================= */}
      <header className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5">

          <div className="flex flex-col lg:flex-row items-center justify-between gap-4 lg:gap-8">

            {/* Brand */}
            <div className="min-w-0 w-full flex items-center justify-center lg:justify-start gap-3 sm:gap-4">

              <div className="
                w-12 h-12
                sm:w-14 sm:h-14
                lg:w-16 lg:h-16
                shrink-0
                rounded-xl
                sm:rounded-2xl
                bg-blue-950
                flex items-center justify-center
                shadow-sm
              ">
                <Landmark className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
              </div>

              <div className="min-w-0 text-center lg:text-left">

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">

                  <h1 className="
                    text-base
                    sm:text-xl
                    lg:text-2xl
                    font-bold
                    tracking-tight
                    text-slate-950
                  ">
                    Hostel Mess & Diet Management
                  </h1>

                  <span className="
                    inline-flex items-center
                    px-2 py-1
                    rounded-md
                    bg-blue-50
                    border border-blue-100
                    text-blue-700
                    text-[8px] sm:text-[9px]
                    font-bold
                    uppercase
                    tracking-wide
                  ">
                    Admin
                  </span>

                </div>

                <p className="
                  mt-1
                  text-[10px] sm:text-xs lg:text-sm
                  text-slate-500
                  leading-relaxed
                  max-w-2xl
                ">
                  Administrative portal for hostel mess records, payments and student services
                </p>

              </div>

            </div>


            {/* Student Portal */}
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="
                w-full lg:w-auto
                shrink-0
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                rounded-xl
                border border-slate-300
                bg-white
                text-slate-700
                text-xs font-bold
                shadow-sm
                transition-all duration-200
                hover:bg-slate-50
                hover:border-slate-400
                hover:-translate-y-0.5
                active:translate-y-0
                focus:outline-none
                focus:ring-2
                focus:ring-blue-200
              "
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              Student Portal
            </button>

          </div>

        </div>

      </header>


      {/* =========================================================
          MAIN
      ========================================================= */}
      <main className="
        flex-1
        flex items-center justify-center
        px-3 sm:px-5
        py-6 sm:py-10 lg:py-12
      ">

        <div className="w-full max-w-md min-w-0">

          {/* =====================================================
              AUTH CARD
          ===================================================== */}
          <div className="
            bg-white
            rounded-2xl
            border border-slate-200
            shadow-[0_12px_40px_rgba(15,23,42,0.08)]
            overflow-hidden
          ">

            {/* Card Header */}
            <div className="
              px-4 sm:px-7
              pt-5 sm:pt-6
              pb-4 sm:pb-5
              border-b border-slate-200
              bg-slate-50/80
            ">

              <div className="flex items-start gap-3">

                <div className="
                  w-10 h-10 sm:w-11 sm:h-11
                  shrink-0
                  rounded-xl
                  bg-blue-100
                  text-blue-700
                  flex items-center justify-center
                ">
                  {isRegistering ? (
                    <UserPlus className="w-5 h-5" />
                  ) : (
                    <LogIn className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0 flex-1">

                  <h2 className="
                    text-sm sm:text-lg
                    font-bold
                    text-slate-950
                    leading-snug
                  ">
                    {isRegistering
                      ? 'Create Admin Account'
                      : 'Administrator Sign In'}
                  </h2>

                  <p className="
                    mt-1
                    text-[10px] sm:text-[11px]
                    text-slate-500
                    leading-relaxed
                  ">
                    {isRegistering
                      ? 'Register an authorized administrator'
                      : 'Sign in to manage hostel operations'}
                  </p>

                </div>

              </div>


              {/* Mode Switch */}
              <div className="
                mt-5
                grid grid-cols-2
                gap-1
                p-1
                bg-slate-200
                rounded-xl
              ">

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`
                    min-w-0
                    flex items-center justify-center gap-1.5
                    py-2.5
                    rounded-lg
                    text-[11px] sm:text-xs
                    font-bold
                    transition-all duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-200

                    ${
                      !isRegistering
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                  `}
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`
                    min-w-0
                    flex items-center justify-center gap-1.5
                    py-2.5
                    rounded-lg
                    text-[11px] sm:text-xs
                    font-bold
                    transition-all duration-200
                    focus:outline-none
                    focus:ring-2
                    focus:ring-blue-200

                    ${
                      isRegistering
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }
                  `}
                >
                  <UserPlus className="w-3.5 h-3.5 shrink-0" />
                  Register
                </button>

              </div>

            </div>


            {/* ===================================================
                FORM CONTENT
            =================================================== */}
            <div className="p-4 sm:p-7">

              {/* Error */}
              {error && (
                <div className="
                  mb-4 sm:mb-5
                  rounded-xl
                  border border-red-200
                  bg-red-50
                  p-3 sm:p-3.5
                  flex items-start gap-2.5 sm:gap-3
                ">

                  <AlertCircle className="
                    w-5 h-5
                    text-red-600
                    shrink-0
                    mt-0.5
                  " />

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-red-800">
                      Authentication Failed
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      text-red-700
                      leading-relaxed
                      break-words
                    ">
                      {error}
                    </p>

                  </div>

                </div>
              )}


              {/* Success */}
              {successMsg && (
                <div className="
                  mb-4 sm:mb-5
                  rounded-xl
                  border border-emerald-200
                  bg-emerald-50
                  p-3 sm:p-3.5
                  flex items-start gap-2.5 sm:gap-3
                ">

                  <CheckCircle2 className="
                    w-5 h-5
                    text-emerald-600
                    shrink-0
                    mt-0.5
                  " />

                  <div className="min-w-0">

                    <p className="text-xs font-bold text-emerald-800">
                      Account Created
                    </p>

                    <p className="
                      mt-1
                      text-xs
                      text-emerald-700
                      leading-relaxed
                      break-words
                    ">
                      {successMsg}
                    </p>

                  </div>

                </div>
              )}


              {/* Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 sm:space-y-5"
              >

                {/* =================================================
                    ADMIN NAME
                ================================================= */}
                <div className="min-w-0">

                  <label className="
                    block
                    mb-1.5
                    text-xs
                    font-bold
                    text-slate-700
                  ">
                    Administrator Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">

                    <User className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-4 h-4
                      text-slate-400
                      pointer-events-none
                    " />

                    <input
                      required
                      type="text"
                      autoComplete="username"
                      placeholder="Enter administrator name"
                      value={formData.name}
                      onChange={(e) =>
                        updateField('name', e.target.value)
                      }
                      className="
                        w-full min-w-0
                        pl-10 pr-3
                        py-3
                        rounded-xl
                        border border-slate-300
                        bg-white
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition-all duration-200
                        hover:border-slate-400
                        focus:border-blue-600
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />

                  </div>

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}
                <div className="min-w-0">

                  <label className="
                    block
                    mb-1.5
                    text-xs
                    font-bold
                    text-slate-700
                  ">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">

                    <Lock className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      w-4 h-4
                      text-slate-400
                      pointer-events-none
                    " />

                    <input
                      required
                      type="password"
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
                      className="
                        w-full min-w-0
                        pl-10 pr-3
                        py-3
                        rounded-xl
                        border border-slate-300
                        bg-white
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition-all duration-200
                        hover:border-slate-400
                        focus:border-blue-600
                        focus:ring-4
                        focus:ring-blue-50
                      "
                    />

                  </div>

                  {isRegistering && (
                    <p className="
                      mt-1.5
                      text-[10px] sm:text-[11px]
                      text-slate-500
                      leading-relaxed
                    ">
                      Password must contain at least 8 characters.
                    </p>
                  )}

                </div>


                {/* =================================================
                    AUTHORIZATION CODE
                ================================================= */}
                {isRegistering && (
                  <div className="
                    rounded-xl
                    border border-amber-200
                    bg-amber-50
                    p-3.5 sm:p-4
                  ">

                    <div className="
                      flex items-start
                      gap-2.5
                      mb-3
                    ">

                      <div className="
                        w-8 h-8
                        shrink-0
                        rounded-lg
                        bg-amber-100
                        flex items-center justify-center
                      ">
                        <KeySquare className="
                          w-4 h-4
                          text-amber-700
                        " />
                      </div>

                      <div className="min-w-0">

                        <label className="
                          block
                          text-xs
                          font-bold
                          text-amber-900
                        ">
                          Authorization Code
                          <span className="text-red-600 ml-1">
                            *
                          </span>
                        </label>

                        <p className="
                          mt-0.5
                          text-[9px] sm:text-[10px]
                          text-amber-700
                          leading-relaxed
                        ">
                          Required for administrator registration
                        </p>

                      </div>

                    </div>


                    <input
                      required
                      type="password"
                      autoComplete="off"
                      placeholder="Enter authorization code"
                      value={formData.adminSecret}
                      onChange={(e) =>
                        updateField('adminSecret', e.target.value)
                      }
                      className="
                        w-full min-w-0
                        px-3 py-3
                        rounded-xl
                        border border-amber-300
                        bg-white
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition-all duration-200
                        hover:border-amber-400
                        focus:border-amber-500
                        focus:ring-4
                        focus:ring-amber-100
                      "
                    />

                    <p className="
                      mt-2.5
                      text-[9px] sm:text-[10px]
                      leading-relaxed
                      text-amber-800
                    ">
                      This code should only be provided to authorized
                      hostel administrative personnel.
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
                    group
                    w-full
                    min-h-[48px]
                    flex items-center justify-center gap-2
                    px-4 py-3
                    rounded-xl
                    bg-blue-700
                    hover:bg-blue-800
                    active:bg-blue-900
                    text-white
                    text-xs sm:text-sm
                    font-bold
                    shadow-sm
                    transition-all duration-200
                    hover:shadow-md
                    focus:outline-none
                    focus:ring-4
                    focus:ring-blue-100
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                    disabled:hover:shadow-sm
                  "
                >

                  {loading ? (
                    <>
                      <Loader2 className="
                        w-4 h-4
                        animate-spin
                        shrink-0
                      " />

                      <span className="truncate">
                        {isRegistering
                          ? 'Creating Account...'
                          : 'Signing In...'}
                      </span>
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="w-4 h-4 shrink-0" />

                      <span className="truncate">
                        Create Administrator Account
                      </span>

                      <ChevronRight className="
                        hidden sm:block
                        w-4 h-4
                        opacity-70
                        group-hover:translate-x-0.5
                        transition-transform
                      " />
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 shrink-0" />

                      <span className="truncate">
                        Sign In to Admin Portal
                      </span>

                      <ChevronRight className="
                        hidden sm:block
                        w-4 h-4
                        opacity-70
                        group-hover:translate-x-0.5
                        transition-transform
                      " />
                    </>
                  )}

                </button>

              </form>

            </div>


            {/* =====================================================
                SECURITY FOOTER
            ===================================================== */}
            <div className="
              border-t border-slate-200
              bg-slate-50
              px-4 sm:px-6
              py-3.5 sm:py-4
            ">

              <div className="flex items-start gap-2.5 sm:gap-3">

                <div className="
                  w-8 h-8
                  shrink-0
                  rounded-lg
                  bg-blue-100
                  flex items-center justify-center
                ">
                  <ShieldCheck className="
                    w-4 h-4
                    text-blue-700
                  " />
                </div>

                <div className="min-w-0">

                  <p className="
                    text-[11px]
                    font-bold
                    text-slate-700
                  ">
                    Secure administrative access
                  </p>

                  <p className="
                    mt-0.5
                    text-[9px] sm:text-[10px]
                    text-slate-500
                    leading-relaxed
                  ">
                    This section is intended only for authorized hostel
                    administration personnel.
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =======================================================
              QUICK INFORMATION
          ======================================================= */}
          <div className="
            mt-4 sm:mt-5
            grid grid-cols-2
            gap-2.5 sm:gap-3
          ">

            {/* Portal */}
            <div className="
              min-w-0
              bg-white
              border border-slate-200
              rounded-xl
              p-3 sm:p-3.5
              flex items-center gap-2.5
              shadow-sm
            ">

              <div className="
                w-8 h-8
                shrink-0
                rounded-lg
                bg-blue-50
                flex items-center justify-center
              ">
                <Building2 className="
                  w-4 h-4
                  text-blue-600
                " />
              </div>

              <div className="min-w-0">

                <p className="
                  text-[8px] sm:text-[9px]
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-wide
                ">
                  Portal
                </p>

                <p className="
                  mt-0.5
                  text-[10px] sm:text-xs
                  font-semibold
                  text-slate-800
                  truncate
                ">
                  Hostel Administration
                </p>

              </div>

            </div>


            {/* Access */}
            <div className="
              min-w-0
              bg-white
              border border-slate-200
              rounded-xl
              p-3 sm:p-3.5
              flex items-center gap-2.5
              shadow-sm
            ">

              <div className="
                w-8 h-8
                shrink-0
                rounded-lg
                bg-emerald-50
                flex items-center justify-center
              ">
                <ShieldCheck className="
                  w-4 h-4
                  text-emerald-600
                " />
              </div>

              <div className="min-w-0">

                <p className="
                  text-[8px] sm:text-[9px]
                  font-bold
                  text-slate-400
                  uppercase
                  tracking-wide
                ">
                  Access
                </p>

                <p className="
                  mt-0.5
                  text-[10px] sm:text-xs
                  font-semibold
                  text-slate-800
                ">
                  Restricted
                </p>

              </div>

            </div>

          </div>

        </div>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}
      <footer className="
        border-t
        border-slate-200
        bg-white
      ">

        <div className="
          max-w-7xl
          mx-auto
          px-3 sm:px-6
          py-3 sm:py-4
          text-center
        ">

          <p className="
            text-[8px] sm:text-[9px]
            text-slate-400
            tracking-wide
          ">
            2026 @ALL RIGHTS ARE RESERVED.
          </p>

        </div>

      </footer>

    </div>
  );
}