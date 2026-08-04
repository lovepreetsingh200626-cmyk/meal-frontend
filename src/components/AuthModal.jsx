import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  User, 
  Lock, 
  Phone, 
  Building2, 
  LogIn, 
  UserPlus, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck,
  Mail,
  KeyRound,
  IdCard,
  Hash,
  MessageSquareText,
  Unlock
} from 'lucide-react';

export default function AuthModal({ onLoginSuccess }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [forgotPasswordStep, setForgotPasswordStep] = useState(0); 

  const [formData, setFormData] = useState({
    name: '',
    email: '', 
    studentId: '',
    rollNo: '',
    hostelNo: 'BH1',
    gender: 'Male',
    mobileNo: '',
    password: '',
    adminSecret: ''
  });

  const [resetData, setResetData] = useState({
    studentId: '',
    otp: '',
    newPassword: '',
    confirmPassword: ''
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

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (isAdminMode) {
      if (!formData.name.trim() || !/^[a-zA-Z\s]{2,}$/.test(formData.name.trim())) {
        setError('Please enter a valid Admin Name using letters only (minimum 2 characters).');
        setLoading(false);
        return;
      }
      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      if (isRegistering && !formData.adminSecret.trim()) {
        setError('Please enter the Admin Authorization Secret Code.');
        setLoading(false);
        return;
      }
    } else {
      // Student ID is required for both Login and Registration
      if (!formData.studentId.trim()) {
        setError('Student ID is required.');
        setLoading(false);
        return;
      }
      if (formData.studentId.trim().length > 13) {
        setError('Student ID cannot exceed 13 digits.');
        setLoading(false);
        return;
      }

      if (!formData.password || formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }

      // Roll Number and other details are ONLY required when Registering
      if (isRegistering) {
        if (!formData.rollNo.trim()) {
          setError('Roll Number is required.');
          setLoading(false);
          return;
        }
        if (formData.rollNo.trim().length > 3) {
          setError('Roll Number cannot exceed 3 digits.');
          setLoading(false);
          return;
        }

        if (!formData.name.trim() || !/^[a-zA-Z\s]{2,}$/.test(formData.name.trim())) {
          setError('Please enter a valid Full Name using letters only (minimum 2 characters).');
          setLoading(false);
          return;
        }
        
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
          setError('Please enter a valid email address.');
          setLoading(false);
          return;
        }

        if (!/^\d{10}$/.test(formData.mobileNo)) {
          setError('Mobile number must be exactly 10 numeric digits (0-9).');
          setLoading(false);
          return;
        }

        const hostelPrefix = formData.hostelNo.toUpperCase().substring(0, 2);
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
    }

    try {
      if (isRegistering) {
        const endpoint = isAdminMode ? '/auth/register-admin' : '/auth/register';
        const payload = isAdminMode
          ? {
              name: formData.name.trim(),
              password: formData.password,
              adminSecret: formData.adminSecret.trim()
            }
          : {
              name: formData.name.trim(),
              email: formData.email.trim(), 
              studentId: formData.studentId.trim(),
              rollNo: formData.rollNo.trim(),
              hostelNo: formData.hostelNo,
              gender: formData.gender,
              mobileNo: formData.mobileNo.trim(),
              password: formData.password
            };

        await API.post(endpoint, payload);
        setSuccessMsg(`${isAdminMode ? 'Admin' : 'Student'} account created successfully! Switching to login...`);
        setTimeout(() => {
          setIsRegistering(false);
          resetMessages();
        }, 1500);
      } else {
        const loginPayload = isAdminMode
          ? { name: formData.name.trim(), password: formData.password, role: 'admin' }
          : { studentId: formData.studentId.trim(), password: formData.password, role: 'student' }; // REMOVED rollNo from login payload

        const { data } = await API.post('/auth/login', loginPayload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || err.response?.data?.error || (err.message === 'Network Error' ? 'Cannot connect to backend server' : null);
      if (serverMessage && serverMessage.includes('E11000')) {
        setError(isAdminMode ? 'An account with this Admin Name already exists!' : 'An account with this Student ID already exists!');
      } else {
        setError(serverMessage || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const { data } = await API.post('/auth/forgot-password', { studentId: resetData.studentId });
      setSuccessMsg(data.message || 'OTP sent successfully!');
      setTimeout(() => {
        setForgotPasswordStep(2);
        resetMessages();
      }, 3500); 
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.newPassword.length < 8) {
      return setError('Password must be at least 8 characters long.');
    }
    if (resetData.newPassword !== resetData.confirmPassword) {
      return setError('New passwords do not match.');
    }

    setLoading(true);
    resetMessages();
    try {
      const { data } = await API.post('/auth/reset-password', {
        studentId: resetData.studentId,
        otp: resetData.otp,
        newPassword: resetData.newPassword
      });
      setSuccessMsg(data.message || 'Password reset successfully!');
      setTimeout(() => {
        setForgotPasswordStep(0);
        setResetData({ studentId: '', otp: '', newPassword: '', confirmPassword: '' });
        resetMessages();
      }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const selectedHostelObj = hostels.find(h => h.hostelNumber === formData.hostelNo);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden font-sans selection:bg-blue-600 selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none" />

      <div className={`bg-white border w-full max-w-lg rounded-3xl p-8 shadow-xl relative z-10 transition-all duration-300 ${
        isAdminMode ? 'border-amber-200/80' : 'border-slate-200/80'
      }`}>

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
            isAdminMode ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'
          }`}>
            <Sparkles className="w-3.5 h-3.5" />
            {isAdminMode ? 'GNDU Executive Admin Portal' : 'Campus Dining & Attendance Portal'}
          </span>

          {forgotPasswordStep === 0 && (
            <button
              type="button"
              onClick={() => { setIsAdminMode(!isAdminMode); resetMessages(); }}
              className={`text-xs font-semibold px-3 py-1 rounded-lg border transition cursor-pointer ${
                isAdminMode ? 'bg-amber-600 text-white border-amber-700 shadow-xs hover:bg-amber-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isAdminMode ? '← Student Portal' : '👑 Admin Portal'}
            </button>
          )}
        </div>

        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {forgotPasswordStep > 0
              ? 'Reset Password'
              : isAdminMode
                ? isRegistering ? 'Register Administrator' : 'Administrator Login'
                : isRegistering ? 'Join Your Hostel Portal' : 'Welcome Back'}
          </h1>
          <p className="text-slate-500 text-sm mt-1.5">
            {forgotPasswordStep === 1 && 'Enter your Student ID to receive a secure OTP on your registered email.'}
            {forgotPasswordStep === 2 && 'Enter the OTP and create a new secure password.'}
            {forgotPasswordStep === 0 && (isAdminMode
              ? (isRegistering ? 'Create a privileged campus administrator account.' : 'Sign in with your admin credentials.')
              : (isRegistering ? 'Register once to track your daily meals and attendance.' : 'Sign in to manage your mess ledger.')
            )}
          </p>
        </div>

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

        {forgotPasswordStep === 1 && (
          <form onSubmit={handleRequestOTP} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
              <div className="relative mt-1 group">
                <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input required type="text" maxLength="13" placeholder="Enter your Student ID" value={resetData.studentId} onChange={e => setResetData({ ...resetData, studentId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-sm disabled:opacity-50 flex justify-center items-center gap-2">
              {loading ? 'Sending OTP...' : <><Mail className="w-4 h-4"/> Send OTP via Email</>}
            </button>
            <button type="button" onClick={() => { setForgotPasswordStep(0); resetMessages(); }} className="w-full text-sm text-slate-500 font-semibold hover:text-slate-800 transition cursor-pointer">
              Cancel & Return to Login
            </button>
          </form>
        )}

        {forgotPasswordStep === 2 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">6-Digit OTP</label>
              <div className="relative mt-1 group">
                <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input required type="text" maxLength="6" placeholder="Enter OTP received on email" value={resetData.otp} onChange={e => setResetData({ ...resetData, otp: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 tracking-widest font-bold" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Password</label>
              <div className="relative mt-1 group">
                <Unlock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input required type="password" placeholder="Min 8 characters" value={resetData.newPassword} onChange={e => setResetData({ ...resetData, newPassword: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirm Password</label>
              <div className="relative mt-1 group">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input required type="password" placeholder="Confirm your new password" value={resetData.confirmPassword} onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl transition cursor-pointer text-sm shadow-sm disabled:opacity-50">
              {loading ? 'Verifying...' : 'Verify OTP & Reset Password'}
            </button>
            <button type="button" onClick={() => { setForgotPasswordStep(0); resetMessages(); }} className="w-full text-sm text-slate-500 font-semibold hover:text-slate-800 transition cursor-pointer">
              Cancel & Return to Login
            </button>
          </form>
        )}

        {forgotPasswordStep === 0 && (
          <>
            <div className="grid grid-cols-2 p-1 bg-slate-100 border border-slate-200 rounded-2xl mb-6">
              <button type="button" onClick={() => { setIsRegistering(false); resetMessages(); }} className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${!isRegistering ? (isAdminMode ? 'bg-amber-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm') : 'text-slate-600 hover:text-slate-900'}`}>
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button type="button" onClick={() => { setIsRegistering(true); resetMessages(); }} className={`py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${isRegistering ? (isAdminMode ? 'bg-amber-600 text-white shadow-sm' : 'bg-blue-600 text-white shadow-sm') : 'text-slate-600 hover:text-slate-900'}`}>
                <UserPlus className="w-4 h-4" /> Register
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isAdminMode ? (
                <>
                  <div>
                    <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">Admin Name</label>
                    <div className="relative mt-1 group">
                      <User className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500 group-focus-within:text-amber-700 transition" />
                      <input required type="text" placeholder="e.g. Chief Warden" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-amber-50/40 border border-amber-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-amber-600" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-amber-800 uppercase tracking-wider">Password</label>
                    <div className="relative mt-1 group">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-500 group-focus-within:text-amber-700 transition" />
                      <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-amber-50/40 border border-amber-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-amber-600" />
                    </div>
                  </div>
                  {isRegistering && (
                    <div className="bg-amber-50/80 border border-amber-300 p-3.5 rounded-xl animate-fadeIn">
                      <label className="text-xs font-bold text-amber-900 uppercase tracking-wider block mb-1">Admin Authorization Secret</label>
                      <div className="relative group">
                        <KeyRound className="absolute left-3.5 top-3.5 w-4 h-4 text-amber-600 group-focus-within:text-amber-800 transition" />
                        <input required type="password" placeholder="Enter Admin Secret Code" value={formData.adminSecret} onChange={e => setFormData({ ...formData, adminSecret: e.target.value })} className="w-full bg-white border border-amber-300 rounded-lg py-2.5 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-amber-600" />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* FULL NAME & EMAIL (ONLY on Register) */}
                  {isRegistering && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                        <div className="relative mt-1 group">
                          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                          <input required type="text" placeholder="Lovepreet Singh" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                        <div className="relative mt-1 group">
                          <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                          <input required type="email" placeholder="student@example.com" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
                        </div>
                      </div>
                    </>
                  )}

                  {/* STUDENT ID (Login & Register) */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
                    <div className="relative mt-1 group">
                      <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                      <input required type="text" maxLength="13" placeholder="Enter your official Student ID" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
                    </div>
                  </div>

                  {/* ROLL NO & HOSTEL DETAILS (ONLY on Register) */}
                  {isRegistering && (
                    <>
                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Roll Number</label>
                        <div className="relative mt-1 group">
                          <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                          <input required type="text" maxLength="3" placeholder="Enter your Roll Number" value={formData.rollNo} onChange={e => setFormData({ ...formData, rollNo: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 uppercase" />
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Hostel</label>
                        <div className="relative mt-1 group">
                          <Building2 className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                          <select className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-3 text-slate-900 text-sm focus:outline-none focus:border-blue-600 cursor-pointer" value={formData.hostelNo} onChange={e => setFormData({ ...formData, hostelNo: e.target.value })}>
                            {hostels.length > 0 ? hostels.map(h => <option key={h._id} value={h.hostelNumber}>{h.hostelNumber} — {h.name} ({h.type.toUpperCase()})</option>) : <><option value="BH1">BH1 (Boys Hostel 1)</option><option value="BH2">BH2 (Boys Hostel 2)</option><option value="GH1">GH1 (Girls Hostel 1)</option></>}
                          </select>
                        </div>
                        {selectedHostelObj && (
                          <div className="mt-2 flex justify-between text-xs px-3 py-2 bg-blue-50/80 border border-blue-100 rounded-lg text-blue-900">
                            <span>Standard Daily Rates:</span><span className="font-bold">B: ₹{selectedHostelObj.mealCosts?.breakfast || 40} | L: ₹{selectedHostelObj.mealCosts?.lunch || 60} | D: ₹{selectedHostelObj.mealCosts?.dinner || 60}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                          <select className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-slate-900 text-sm focus:outline-none focus:border-blue-600 cursor-pointer" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option></select>
                        </div>
                        <div>
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                          <div className="relative mt-1 group">
                            <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                            <input required type="tel" maxLength="10" placeholder="10-digit no." value={formData.mobileNo} onChange={e => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* PASSWORD (Login & Register) */}
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                    <div className="relative mt-1 group">
                      <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                      <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600" />
                    </div>
                  </div>
                </>
              )}

              {!isRegistering && !isAdminMode && (
                <div className="flex justify-end mt-1">
                  <button type="button" onClick={() => { setForgotPasswordStep(1); resetMessages(); }} className="text-xs font-bold text-blue-600 hover:text-blue-800 transition cursor-pointer">
                    Forgot Password?
                  </button>
                </div>
              )}

              <button type="submit" disabled={loading} className={`w-full mt-4 text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer text-sm ${isAdminMode ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'}`}>
                {loading ? <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</span> : isRegistering ? <><span>{isAdminMode ? 'Register Admin Account' : 'Create Student Account'}</span><ArrowRight className="w-4 h-4" /></> : <><span>{isAdminMode ? 'Sign In to Executive Portal' : 'Sign In to Dashboard'}</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          </>
        )}

        {/* SECURITY FOOTER */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col gap-3 items-center justify-center text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600/80" />
            <span>Encrypted MERN Authentication • GNDU Amritsar Dining</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-500">
            <span>Need Tech Support? Contact:</span>
            <a href="mailto:adminconnect.org@gmail.com?subject=GNDU%20Mess%20Portal%20Issue" className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 transition-colors duration-150 font-semibold">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>adminconnect.org@gmail.com</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}