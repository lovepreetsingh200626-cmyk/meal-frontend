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
  Building2
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
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col">

      {/* Top institutional bar */}
      <div className="bg-slate-950 text-slate-300 border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2">

          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-semibold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />

            <span>
              Mess Records & Fee Payment Portal
            </span>

            <span className="hidden sm:inline text-slate-600">
              •
            </span>

            <span className="hidden sm:inline text-slate-400">
              Hostel Administration
            </span>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Authorized administrative access</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

          <div className="flex flex-col md:flex-row items-center justify-between gap-5">

            <div className="flex items-center gap-4">

              {/* Institution mark */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-blue-950 flex items-center justify-center shadow-sm shrink-0">
                <Landmark className="w-7 h-7 text-white" />
              </div>

              <div className="text-center md:text-left">

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 tracking-tight">
                    Hostel Mess & Diet Management
                  </h1>

                  <span className="px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold uppercase tracking-wide">
                    Admin
                  </span>
                </div>

                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Administrative portal for hostel mess records, payments and student services
                </p>
              </div>
            </div>

            {/* Student portal */}
            <button
              type="button"
              onClick={onSwitchToStudent}
              className="
                w-full md:w-auto
                inline-flex items-center justify-center gap-2
                px-4 py-2.5
                rounded-xl
                border border-slate-300
                bg-white
                text-slate-700
                text-xs font-bold
                hover:bg-slate-50
                hover:border-slate-400
                transition
                shadow-sm
              "
            >
              <ArrowLeft className="w-4 h-4" />
              Student Portal
            </button>

          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-12">

        <div className="w-full max-w-md">

          {/* Login card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="px-5 sm:px-7 py-5 border-b border-slate-200 bg-slate-50">

              <div className="flex items-start justify-between gap-4">

                <div>
                  <div className="flex items-center gap-2.5">

                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      {isRegistering ? (
                        <UserPlus className="w-5 h-5" />
                      ) : (
                        <LogIn className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <h2 className="text-base sm:text-lg font-bold text-slate-900">
                        {isRegistering
                          ? 'Create Admin Account'
                          : 'Administrator Sign In'}
                      </h2>

                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isRegistering
                          ? 'Register an authorized administrator'
                          : 'Sign in to manage hostel operations'}
                      </p>
                    </div>

                  </div>
                </div>

              </div>

              {/* Mode switch */}
              <div className="mt-5 grid grid-cols-2 p-1 bg-slate-200 rounded-xl">

                <button
                  type="button"
                  onClick={() => switchMode(false)}
                  className={`
                    flex items-center justify-center gap-1.5
                    py-2 rounded-lg
                    text-xs font-bold
                    transition
                    ${
                      !isRegistering
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => switchMode(true)}
                  className={`
                    flex items-center justify-center gap-1.5
                    py-2 rounded-lg
                    text-xs font-bold
                    transition
                    ${
                      isRegistering
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }
                  `}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Register
                </button>

              </div>
            </div>

            {/* Form */}
            <div className="p-5 sm:p-7">

              {/* Error */}
              {error && (
                <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3.5 flex gap-3">

                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />

                  <div>
                    <p className="text-xs font-bold text-red-800">
                      Authentication Failed
                    </p>

                    <p className="mt-1 text-xs text-red-700 leading-relaxed">
                      {error}
                    </p>
                  </div>

                </div>
              )}

              {/* Success */}
              {successMsg && (
                <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 flex gap-3">

                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />

                  <div>
                    <p className="text-xs font-bold text-emerald-800">
                      Account Created
                    </p>

                    <p className="mt-1 text-xs text-emerald-700 leading-relaxed">
                      {successMsg}
                    </p>
                  </div>

                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >

                {/* Admin name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Administrator Name
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">

                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

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
                        w-full
                        pl-10 pr-3
                        py-3
                        rounded-xl
                        border border-slate-300
                        bg-white
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition
                        focus:border-blue-600
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Password
                    <span className="text-red-500 ml-1">*</span>
                  </label>

                  <div className="relative">

                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

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
                        w-full
                        pl-10 pr-3
                        py-3
                        rounded-xl
                        border border-slate-300
                        bg-white
                        text-sm
                        text-slate-900
                        placeholder:text-slate-400
                        outline-none
                        transition
                        focus:border-blue-600
                        focus:ring-2
                        focus:ring-blue-100
                      "
                    />

                  </div>

                  {isRegistering && (
                    <p className="mt-1.5 text-[11px] text-slate-500">
                      Password must contain at least 8 characters.
                    </p>
                  )}
                </div>

                {/* Authorization code */}
                {isRegistering && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex items-center gap-2 mb-2">

                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                        <KeySquare className="w-4 h-4 text-amber-700" />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-amber-900">
                          Authorization Code
                          <span className="text-red-600 ml-1">*</span>
                        </label>

                        <p className="text-[10px] text-amber-700">
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
                        w-full
                        px-3 py-3
                        rounded-xl
                        border border-amber-300
                        bg-white
                        text-sm
                        outline-none
                        focus:border-amber-500
                        focus:ring-2
                        focus:ring-amber-100
                      "
                    />

                    <p className="mt-2 text-[10px] leading-relaxed text-amber-800">
                      This code should only be provided to authorized hostel
                      administrative personnel.
                    </p>

                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    w-full
                    flex items-center justify-center gap-2
                    px-4 py-3
                    rounded-xl
                    bg-blue-700
                    hover:bg-blue-800
                    active:bg-blue-900
                    text-white
                    text-sm font-bold
                    shadow-sm
                    transition
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>
                        {isRegistering
                          ? 'Creating Account...'
                          : 'Signing In...'}
                      </span>
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Create Administrator Account</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Sign In to Admin Portal</span>
                    </>
                  )}

                </button>

              </form>
            </div>

            {/* Security footer */}
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-4">

              <div className="flex items-start gap-3">

                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />

                <div>
                  <p className="text-[11px] font-semibold text-slate-700">
                    Secure administrative access
                  </p>

                  <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                    This section is intended only for authorized hostel
                    administration personnel.
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Bottom information */}
          <div className="mt-5 grid grid-cols-2 gap-3">

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5">
              <Building2 className="w-4 h-4 text-blue-600 shrink-0" />

              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                  Portal
                </p>
                <p className="text-xs font-semibold text-slate-800">
                  Hostel Administration
                </p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-3 flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />

              <div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                  Access
                </p>
                <p className="text-xs font-semibold text-slate-800">
                  Restricted
                </p>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 text-center">

          <p className="text-[9px] text-slate-400 mt-1">
            2026 @ALL RIGHTS ARE RESERVED.
             </p>

        </div>
      </footer>

    </div>
  );
}