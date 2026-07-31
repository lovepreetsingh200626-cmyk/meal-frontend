import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  User, 
  Lock, 
  Phone, 
  Hash, 
  Building2, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    rollNo: '',
    hostelNo: 'BH1',
    gender: 'Male',
    mobileNo: '',
    password: ''
  });

  useEffect(() => {
    API.get('/hostels')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setHostels(res.data);
          setFormData(prev => ({ ...prev, hostelNo: res.data[0].hostelNumber }));
        }
      })
      .catch(err => console.error('Could not fetch hostels:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    // --- FRONTEND GENDER/HOSTEL VALIDATION GUARD ---
    if (isRegistering) {
      const hostelPrefix = formData.hostelNo.toUpperCase().substring(0, 2);
      console.log(hostelPrefix)
      
      if (formData.gender === 'Female' && hostelPrefix === 'BH') {
        setError('Female students cannot select a Boys Hostel (BH). Please select a Girls Hostel.');
        setLoading(false);
        return;
      }

      if (formData.gender === 'Male' && hostelPrefix === 'GH') {
        setError('Male students cannot select a Girls Hostel (GH). Please select a Boys Hostel.');
        setLoading(false);
        return;
      }
    }
    // -----------------------------------------------

    try {
      if (isRegistering) {
        await API.post('/auth/register', formData);
        setSuccessMsg('Account created successfully! Switching to login...');
        setTimeout(() => {
          setIsRegistering(false);
          setSuccessMsg('');
        }, 1500);
      } else {
        const { data } = await API.post('/auth/login', {
          rollNo: formData.rollNo,
          password: formData.password
        });
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      const serverMessage = 
        err.response?.data?.message || 
        err.response?.data?.error || 
        (err.message === 'Network Error' ? 'Cannot connect to backend server (Port 5000)' : null);

      if (serverMessage && serverMessage.includes('E11000')) {
        setError('An account with this Roll Number already exists!');
      } else {
        setError(serverMessage || 'Something went wrong. Please try again.');
      }
      console.error('Auth Error Details:', err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  // Find currently selected hostel details for dynamic pricing preview
  const selectedHostelObj = hostels.find(h => h.hostelNumber === formData.hostelNo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Soft Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none" />

      {/* Main Card */}
      <div className="bg-white border border-slate-200/80 w-full max-w-lg rounded-3xl p-8 shadow-xl relative z-10 transition-all duration-300">
        
        {/* Dynamic Header Badge */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Sparkles className="w-3.5 h-3.5" /> Campus Dining & Attendance Portal
          </span>
        </div>

        {/* Title & Description */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isRegistering ? 'Join Your Hostel Portal' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            {isRegistering 
              ? 'Register once to track your daily meals, extras, and attendance.' 
              : 'Sign in to manage your mess ledger and daily check-ins.'}
          </p>
        </div>

        {/* Animated Segmented Controller / Switcher */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => { setIsRegistering(false); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              !isRegistering 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegistering(true); setError(''); setSuccessMsg(''); }}
            className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              isRegistering 
                ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Register
          </button>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative mt-1 group">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input
                  required
                  type="text"
                  placeholder="Lovepreet Singh"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number</label>
            <div className="relative mt-1 group">
              <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
              <input
                required
                type="text"
                placeholder="2024ECE01"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 uppercase text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
              />
            </div>
          </div>

          {isRegistering && (
            <>
              {/* Dynamic Hostel Selection with Live Cost Preview */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Hostel</label>
                <div className="relative mt-1 group">
                  <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-3 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer"
                    value={formData.hostelNo}
                    onChange={e => setFormData({ ...formData, hostelNo: e.target.value })}
                  >
                    {hostels.length > 0 ? (
                      hostels.map(h => (
                        <option key={h._id} value={h.hostelNumber} className="bg-white text-slate-800">
                          {h.hostelNumber} — {h.name} ({h.type.toUpperCase()})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="BH1" className="bg-white text-slate-800">BH1 (Boys Hostel 1)</option>
                        <option value="BH2" className="bg-white text-slate-800">BH2 (Boys Hostel 2)</option>
                        <option value="GH1" className="bg-white text-slate-800">GH1 (Girls Hostel 1)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Micro-preview of mess prices for selected hostel */}
                {selectedHostelObj && (
                  <div className="mt-2 flex items-center justify-between text-xs px-3 py-2 bg-blue-50/80 border border-blue-100 rounded-lg text-blue-900">
                    <span>Standard Daily Rates:</span>
                    <span className="font-bold">
                      B: ₹{selectedHostelObj.mealCosts?.breakfast || 40} | L: ₹{selectedHostelObj.mealCosts?.lunch || 60} | D: ₹{selectedHostelObj.mealCosts?.dinner || 60}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male" className="bg-white text-slate-800">Male</option>
                    <option value="Female" className="bg-white text-slate-800">Female</option>
                    <option value="Other" className="bg-white text-slate-800">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                  <div className="relative mt-1 group">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                    <input
                      required
                      type="tel"
                      placeholder="10-digit no."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                      onChange={e => setFormData({ ...formData, mobileNo: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
            <div className="relative mt-1 group">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
              <input
                required
                type="password"
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-sm"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : isRegistering ? (
              <>
                <span>Create Student Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security / Info Footer */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-400">
          <ShieldCheck className="w-4 h-4 text-blue-600/80" />
          <span>Encrypted MERN Authentication • GNDU Amritsar Dining</span>
        </div>
      </div>
    </div>
  );
}