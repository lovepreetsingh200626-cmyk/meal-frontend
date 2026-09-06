import React, { useState } from 'react';
import API from '../services/api';
import {
  User, Lock, LogIn, UserPlus, AlertCircle, CheckCircle2,
  ShieldCheck, KeySquare, Landmark, ShieldAlert, Loader2, ArrowLeft, AlertTriangle
} from 'lucide-react';

export default function AdminAuthModal({ onLoginSuccess, onSwitchToStudent }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    adminSecret: ''
  });

  const resetMessages = () => { setError(''); setSuccessMsg(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (!formData.name.trim()) { setError('Magistracy Validation: Officer Designation / Admin Name is mandatory.'); setLoading(false); return; }
    if (!formData.password || formData.password.length < 8) { setError('Security Directive: Executive password must be at least 8 characters.'); setLoading(false); return; }

    try {
      if (isRegistering) {
        await API.post('/auth/register-admin', {
          name: formData.name.trim(),
          password: formData.password,
          adminSecret: formData.adminSecret.trim()
        });
        setSuccessMsg('Executive Commission Ratified. Officer dossier committed to council registry.');
        setTimeout(() => { setIsRegistering(false); resetMessages(); }, 1600);
      } else {
        const { data } = await API.post('/auth/login', {
          name: formData.name.trim(),
          password: formData.password,
          role: 'admin'
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication Rejection: Executive credentials failed security validation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-slate-900 selection:text-white flex flex-col">
      
      {/* 1. STATE GOVERNMENT & SUPERVISORY STRIP WITH RIGHT-ALIGNED ROLLING NOTICE */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2.5 border-b-2 border-amber-500/80 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 z-50 select-none shadow-sm">
        <div className="flex items-center gap-2.5 uppercase tracking-widest text-slate-200 font-mono shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>mess records & fee payment portal • hostels </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-amber-300 font-black hidden md:inline">Supervisory Magistracy Clearance Gate</span>
        </div>
        
        {/* RIGHT-ALIGNED ROLLING NOTICE TICKER */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-end overflow-hidden">
          <div className="max-w-[320px] sm:max-w-[420px] bg-slate-900 border border-amber-500/40 px-3 py-1 rounded-xs overflow-hidden shrink-0 shadow-inner flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
            <div className="whitespace-nowrap overflow-hidden">
              <div className="inline-block animate-[marquee_20s_linear_infinite] uppercase font-mono tracking-wider font-extrabold text-[9px] text-amber-300">
                NOTICE: ADMIN PORTAL ONLY. STUDENTS MUST USE THE student portal login
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PORTAL HEADER */}
      <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border-2 border-amber-600 rounded-xs flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
            <Landmark className="w-6 h-6 text-amber-400 mb-0.5" />
            <span className="text-[6px] font-black tracking-widest text-amber-200 uppercase">SEAL</span>
          </div>
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl md:text-2xl font-black text-blue-950 uppercase tracking-tight font-serif">
                Central Student Hostel Mess &amp; Diet Audit Ledger
              </h1>
              <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 hidden sm:inline-block font-mono">
                Executive Officer Desk
              </span>
            </div>
            <h2 className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wide mt-0.5 font-sans">
              Comptroller of Accounts • Supervisory Committee Authentication
            </h2>
          </div>
        </div>

        {/* HIGH-VISIBILITY STUDENT SWITCH BUTTON */}
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <button
            type="button"
            onClick={onSwitchToStudent}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-950 text-emerald-300 border-2 border-emerald-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-95 font-mono"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Student / Candidate Portal Gate</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN FORM CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <div className="bg-white border-2 border-slate-300 w-full max-w-md shadow-md border-t-4 border-t-slate-950 relative">

          {/* FORM TAB HEADER */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-slate-950 uppercase tracking-wider flex items-center gap-2 font-serif">
                {isRegistering ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    <span>Executive Officer Commissioning</span>
                  </>
                ) : (
                  <>
                    <KeySquare className="w-4 h-4 text-amber-600" />
                    <span>Executive Magistracy Authentication</span>
                  </>
                )}
              </h3>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight mt-0.5">
                Authorized Committee Personnel Only
              </p>
            </div>

            <div className="flex text-xs font-black border border-slate-300 bg-slate-200 overflow-hidden shrink-0 shadow-xs">
              <button 
                type="button" 
                onClick={() => { setIsRegistering(false); resetMessages(); }} 
                className={`px-3 py-1.5 cursor-pointer flex items-center gap-1 uppercase transition ${!isRegistering ? 'bg-slate-900 text-white border-b border-amber-400' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <LogIn className="w-3 h-3" />
                <span>SIGN IN</span>
              </button>
              <button 
                type="button" 
                onClick={() => { setIsRegistering(true); resetMessages(); }} 
                className={`px-3 py-1.5 border-l border-slate-300 cursor-pointer flex items-center gap-1 uppercase transition ${isRegistering ? 'bg-slate-900 text-white border-b border-amber-400' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                <UserPlus className="w-3 h-3" />
                <span>COMMISSION</span>
              </button>
            </div>
          </div>

          <div className="p-6 sm:p-8">

            {error && (
              <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs mb-6 flex gap-3 font-bold uppercase shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
                <div>
                  <p className="font-black">Security Rejection</p>
                  <p className="font-medium normal-case text-[11px] mt-0.5 text-red-900">{error}</p>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs mb-6 flex gap-3 font-bold uppercase shadow-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                <div>
                  <p className="font-black">Magistracy Certified</p>
                  <p className="font-medium normal-case text-[11px] mt-0.5 text-emerald-900">{successMsg}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-slate-50 border border-slate-300 p-3 mb-2">
                <span className="text-[9px] font-black text-amber-800 uppercase tracking-wider flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span> login to admin portal</span>
                </span>
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-700" /> 
                  <span>Officer Commission / Name</span> 
                  <span className="text-red-700">*</span>
                </label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. Chief Warden Office" 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })} 
                  className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 uppercase outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950" 
                />
              </div>

              <div>
                <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> 
                  <span>Executive Password</span> 
                  <span className="text-red-700">*</span>
                </label>
                <input 
                  required 
                  type="password" 
                  placeholder="••••••••" 
                  value={formData.password} 
                  onChange={e => setFormData({ ...formData, password: e.target.value })} 
                  className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-slate-950 focus:ring-1 focus:ring-slate-950" 
                />
              </div>

              {isRegistering && (
                <div className="bg-amber-50 border-2 border-amber-400 p-4 mt-2">
                  <label className="text-[9px] font-black text-amber-950 uppercase tracking-wider flex items-center gap-1.5">
                    <KeySquare className="w-3.5 h-3.5 text-amber-800" /> 
                    <span>Council Authorization Secret Code</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    placeholder="Institutional clearance code"
                    value={formData.adminSecret} 
                    onChange={e => setFormData({ ...formData, adminSecret: e.target.value })} 
                    className="w-full mt-1 border border-amber-500 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-amber-700 bg-white" 
                  />
                  <p className="text-[9px] text-amber-900 mt-1 uppercase font-semibold">
                    * Code issued exclusively by the University Registrar and Directorate of Hostels.
                  </p>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading} 
                className="w-full mt-6 bg-slate-950 hover:bg-slate-900 active:bg-slate-950 text-white font-black py-3.5 text-xs uppercase tracking-widest transition cursor-pointer disabled:opacity-70 shadow-xs border-b-2 border-amber-500 flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Verifying Magistracy...</span>
                  </>
                ) : isRegistering ? (
                  <>
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Ratify Executive Commission</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-amber-400" />
                    <span>Authenticate Supervisory Desk</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-slate-50 border-t border-slate-300 p-3.5 text-center text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
            <span>Supervisory Magistracy • Restricted Administrative Sector</span>
          </div>
        </div>
      </div>
    </div>
  );
}