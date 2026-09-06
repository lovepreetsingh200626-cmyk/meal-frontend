import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UNIVERSITY_FACULTIES_HIERARCHY } from '../data/coursesData';
import { ACADEMIC_SESSIONS } from '../data/sessionsData';
import { INDIAN_STATES } from '../data/statesData';
import { WORLD_COUNTRIES } from '../data/countriesData';
import {
  User, Lock, Phone, Building2, LogIn, UserPlus,
  AlertCircle, CheckCircle2, Mail, IdCard, Hash,
  GraduationCap, BookOpen, Layers, ShieldCheck, Camera, ImagePlus,
  MapPin, Globe, Calendar, Compass, KeyRound, Key, Users, HelpCircle,
  Landmark, ShieldAlert, FileText, Check, Loader2, Award, ChevronRight, ArrowLeft
} from 'lucide-react';

const ROLL_NUMBERS = Array.from({ length: 999 }, (_, i) => String(i + 1).padStart(3, '0'));

export default function StudentAuthModal({ onLoginSuccess, onSwitchToAdmin }) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [hostels, setHostels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);

  const [formData, setFormData] = useState({
    name: '',
    fatherName: '',
    motherName: '',
    dob: '',
    nationality: 'India',
    email: '',
    studentId: '',
    rollNo: '',
    hostelNo: 'BH1',
    gender: 'Male',
    mobileNo: '',
    university: '',
    facultyId: '',
    facultyName: '',
    department: '',
    session: '',
    domicileState: 'Punjab',
    category: 'General',
    profilePhoto: '',
    password: ''
  });

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableProgrammes, setAvailableProgrammes] = useState([]);

  const [resetData, setResetData] = useState({
    studentId: '', otp: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => {
    API.get('/hostels')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setHostels(res.data);
          setFormData(prev => ({ ...prev, hostelNo: res.data[0].hostelNumber }));
        }
      }).catch(err => console.error(err));
  }, []);

  const resetMessages = () => { setError(''); setSuccessMsg(''); };

  const handleFacultyChange = (fId) => {
    const selectedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.id === fId);
    const depts = selectedFac ? selectedFac.departments : [];
    setAvailableDepartments(depts);
    setAvailableProgrammes([]);
    setFormData(prev => ({
      ...prev,
      facultyId: fId,
      facultyName: selectedFac ? selectedFac.name : '',
      department: '',
      university: ''
    }));
  };

  const handleDepartmentChange = (deptName) => {
    const matchedDept = availableDepartments.find(d => d.name === deptName);
    const progs = matchedDept ? matchedDept.programmes : [];
    setAvailableProgrammes(progs);
    setFormData(prev => ({
      ...prev,
      department: deptName,
      university: ''
    }));
  };

  const handleStateChange = (selectedState) => {
    setFormData(prev => ({
      ...prev,
      domicileState: selectedState,
      category: selectedState === 'Punjab' ? prev.category : 'General'
    }));
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Statutory Upload Error: File must be an official image document (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
        setFormData(prev => ({ ...prev, profilePhoto: compressedBase64 }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (!formData.studentId.trim()) { setError('Registry Requirement: Official Student ID Number is mandatory.'); setLoading(false); return; }
    if (formData.studentId.trim().length > 13) { setError('Statute Limit: Student ID cannot exceed 13 alphanumeric characters.'); setLoading(false); return; }
    if (isRegistering) {
      if (!formData.rollNo) { setError('Registry Requirement: Campus Roll Number selection is mandatory.'); setLoading(false); return; }
      if (!formData.fatherName.trim()) { setError("Dossier Field Required: Candidate Father's Name is mandatory."); setLoading(false); return; }
      if (!formData.motherName.trim()) { setError("Dossier Field Required: Candidate Mother's Name is mandatory."); setLoading(false); return; }
      if (!formData.dob) { setError('Dossier Field Required: Certified Date of Birth is mandatory.'); setLoading(false); return; }
      if (!formData.facultyId) { setError('Academic Record Required: Faculty Jurisdiction selection is mandatory.'); setLoading(false); return; }
      if (!formData.department.trim()) { setError('Academic Record Required: Department Branch selection is mandatory.'); setLoading(false); return; }
      if (!formData.university.trim()) { setError('Academic Record Required: Programme / Degree Course selection is mandatory.'); setLoading(false); return; }
      if (!formData.session.trim()) { setError('Academic Record Required: Certified Academic Session is mandatory.'); setLoading(false); return; }
      if (!formData.mobileNo.trim() || formData.mobileNo.length !== 10) { setError('Communication Protocol: A valid 10-digit registered mobile number is required.'); setLoading(false); return; }
    }

    try {
      if (isRegistering) {
        const payload = {
          name: formData.name.trim(),
          fatherName: formData.fatherName.trim(),
          motherName: formData.motherName.trim(),
          dob: formData.dob,
          nationality: formData.nationality,
          email: formData.email.trim(),
          studentId: formData.studentId.trim(),
          rollNo: formData.rollNo,
          hostelNo: formData.hostelNo,
          gender: formData.gender,
          mobileNo: formData.mobileNo.trim(),
          university: formData.university.trim(),
          department: formData.department.trim(),
          faculty: formData.facultyName.trim(),
          facultyName: formData.facultyName.trim(),
          session: formData.session.trim(),
          domicileState: formData.domicileState,
          category: formData.domicileState === 'Punjab' ? formData.category : 'General',
          profilePhoto: formData.profilePhoto,
          password: formData.password
        };

        await API.post('/auth/register', payload);
        setSuccessMsg('Registration Ratified. Candidate dossier committed to Central Ledger. Redirecting to access gate.');
        setTimeout(() => { setIsRegistering(false); resetMessages(); }, 1600);
      } else {
        const loginPayload = { studentId: formData.studentId.trim(), password: formData.password, role: 'student' };
        const { data } = await API.post('/auth/login', loginPayload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication Rejection: Credentials failed validation check against registry.');
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
      setSuccessMsg(data.message);
      setTimeout(() => { setForgotPasswordStep(2); resetMessages(); }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Dispatch Error: Failed to transmit verification token.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();
    try {
      const { data } = await API.post('/auth/reset-password', resetData);
      setSuccessMsg(data.message);
      setTimeout(() => { setForgotPasswordStep(0); resetMessages(); }, 2200);
    } catch (err) {
      setError(err.response?.data?.message || 'Verification Error: Failed to overwrite credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isOutsidePunjab = formData.domicileState !== 'Punjab';

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans selection:bg-blue-950 selection:text-white flex flex-col">
      
      {/* 1. STATE GOVERNMENT & STATUTORY EMBLEM STRIP */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2.5 border-b-2 border-orange-500/80 flex justify-between items-center z-50 select-none shadow-sm">
        <div className="flex items-center gap-2.5 uppercase tracking-widest text-slate-200 font-mono">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>mess records & fee payment portal • hostels </span>
          <span className="text-slate-700 hidden md:inline">|</span>
          <span className="text-orange-400 font-black hidden md:inline">Candidate Residential Access Portal</span>
        </div>
      </div>

      {/* 2. PORTAL HEADER */}
      <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-orange-600 rounded-xs flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
            <Landmark className="w-6 h-6 text-orange-400 mb-0.5" />
            <span className="text-[6px] font-black tracking-widest text-orange-200 uppercase">SEAL</span>
          </div>
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
              <h1 className="text-xl md:text-2xl font-black text-blue-950 uppercase tracking-tight font-serif">
                Central Student Hostel Mess &amp; Diet Audit Ledger
              </h1>
              <span className="text-[8px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2 py-0.5 hidden sm:inline-block font-mono">
                Candidate Portal
              </span>
            </div>
            <h2 className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wide mt-0.5 font-sans">
              Independent Student Cooperative Association • Certified Residential Registry
            </h2>
          </div>
        </div>

        {/* HIGH-VISIBILITY ADMIN SWITCH BANNER BUTTON */}
        <div className="w-full md:w-auto flex justify-center md:justify-end">
          <button
            type="button"
            onClick={onSwitchToAdmin}
            className="w-full md:w-auto bg-slate-900 hover:bg-slate-950 text-amber-300 border-2 border-amber-500 px-4 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer transition active:scale-95 font-mono"
          >
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Admin / Warden Login Portal</span>
          </button>
        </div>
      </header>

      {/* 3. MAIN FORM CONTAINER */}
      <div className="flex-1 flex items-center justify-center p-4 py-8 sm:py-12">
        <div className="bg-white border-2 border-slate-300 w-full max-w-xl shadow-md border-t-4 border-t-blue-950 relative">

          {/* FORM TAB HEADER */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 select-none">
            <div>
              <h3 className="text-xs sm:text-sm font-black text-blue-950 uppercase tracking-wider flex items-center gap-2 font-serif">
                {forgotPasswordStep > 0 ? (
                  <>
                    <KeyRound className="w-4 h-4 text-orange-600" />
                    <span>Statutory Credential Recovery Protocol</span>
                  </>
                ) : isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4 text-blue-950" />
                    <span>Candidate Academic &amp; Residential Enrollment</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 text-blue-950" />
                    <span>Candidate Ledger Authentication Gate</span>
                  </>
                )}
              </h3>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight mt-0.5">
                Official Autonomous Cooperative Record
              </p>
            </div>

            {forgotPasswordStep === 0 && (
              <div className="flex text-xs font-black border border-slate-300 bg-slate-200 overflow-hidden shrink-0 shadow-xs">
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(false); resetMessages(); }} 
                  className={`px-4 py-1.5 cursor-pointer flex items-center gap-1.5 uppercase transition ${!isRegistering ? 'bg-blue-950 text-white border-b border-orange-500' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <LogIn className="w-3 h-3" />
                  <span>LOGIN</span>
                </button>
                <button 
                  type="button" 
                  onClick={() => { setIsRegistering(true); resetMessages(); }} 
                  className={`px-4 py-1.5 border-l border-slate-300 cursor-pointer flex items-center gap-1.5 uppercase transition ${isRegistering ? 'bg-blue-950 text-white border-b border-orange-500' : 'text-slate-700 hover:bg-slate-100'}`}
                >
                  <UserPlus className="w-3 h-3" />
                  <span>REGISTER</span>
                </button>
              </div>
            )}
          </div>

          <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="bg-orange-50 border border-orange-300 border-l-4 border-l-orange-600 text-orange-950 px-4 py-3 text-xs mb-6 flex gap-3 font-bold uppercase shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-black">Authentication Directive</p>
                  <p className="font-medium normal-case text-[11px] mt-0.5 text-orange-900">{error}</p>
                </div>
              </div>
            )}
            {successMsg && (
              <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 px-4 py-3 text-xs mb-6 flex gap-3 font-bold uppercase shadow-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                <div>
                  <p className="font-black">Ledger Certified</p>
                  <p className="font-medium normal-case text-[11px] mt-0.5 text-emerald-900">{successMsg}</p>
                </div>
              </div>
            )}

            {/* FORGOT PASSWORD: STEP 1 */}
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div className="bg-orange-50 border border-orange-300 p-3.5 text-xs text-orange-950 mb-2 border-l-4 border-l-orange-600">
                  <p className="font-bold uppercase font-serif flex items-center gap-1.5 text-[11px]">
                    <ShieldAlert className="w-4 h-4 text-orange-600" />
                    <span>Statutory Verification Protocol</span>
                  </p>
                  <p className="text-[11px] font-medium mt-1 leading-relaxed text-orange-900">
                    Enter your certified Student ID Number. A one-time verification password (OTP) will be dispatched to your registered institutional email address on file.
                  </p>
                </div>

                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>Statutory Student ID Number</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    maxLength="13" 
                    placeholder="e.g. 2024ECE102"
                    value={resetData.studentId} 
                    onChange={e => setResetData({ ...resetData, studentId: e.target.value })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-mono font-bold text-slate-900 uppercase outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                  />
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={() => { setForgotPasswordStep(0); resetMessages(); }} 
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black py-2.5 text-xs uppercase tracking-wider border border-slate-300 cursor-pointer active:scale-95 transition"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5 border-b-2 border-orange-500 shadow-xs active:scale-95 disabled:opacity-60 transition"
                  >
                    <Mail className="w-3.5 h-3.5 text-orange-400" />
                    <span>{loading ? 'Dispatching...' : 'Transmit OTP'}</span>
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD: STEP 2 */}
            {forgotPasswordStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>6-Digit Verification Token (OTP)</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    maxLength="6" 
                    placeholder="000000"
                    value={resetData.otp} 
                    onChange={e => setResetData({ ...resetData, otp: e.target.value.replace(/\D/g, '') })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-sm font-mono font-black tracking-widest text-slate-900 outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950 text-center" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>New Account Password</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    placeholder="Min. 8 characters"
                    value={resetData.newPassword} 
                    onChange={e => setResetData({ ...resetData, newPassword: e.target.value })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                  />
                </div>
                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>Confirm New Password</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    placeholder="Re-enter password"
                    value={resetData.confirmPassword} 
                    onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full mt-2 bg-emerald-800 hover:bg-emerald-700 text-white font-black py-3 text-xs uppercase tracking-widest cursor-pointer flex items-center justify-center gap-1.5 border-b-2 border-emerald-950 shadow-xs active:scale-95 disabled:opacity-60 transition"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                  <span>{loading ? 'Ratifying...' : 'Authenticate & Reset Key'}</span>
                </button>
              </form>
            )}

            {/* NORMAL CANDIDATE LOGIN / REGISTRATION */}
            {forgotPasswordStep === 0 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {isRegistering && (
                  <>
                    {/* MEMBER PHOTOGRAPH */}
                    <div className="border border-slate-300 p-3.5 bg-slate-50 flex items-center gap-4">
                      <div className="w-16 h-16 bg-slate-200 border-2 border-blue-950 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                        {formData.profilePhoto ? (
                          <img src={formData.profilePhoto} alt="Upload Preview" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-800 uppercase block mb-1 flex items-center gap-1.5">
                          <Camera className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Certified Candidate Photograph</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <label className="inline-flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-white px-3 py-1.5 text-[10px] font-black uppercase cursor-pointer border-b border-orange-500 shadow-xs active:scale-95 transition">
                          <ImagePlus className="w-3.5 h-3.5 text-orange-400" />
                          <span>{formData.profilePhoto ? 'Replace Photograph' : 'Upload Certified Image'}</span>
                          <input type="file" accept="image/*" required={!formData.profilePhoto} className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        <p className="text-[8px] font-mono text-slate-500 uppercase mt-1">Automatic canvas scaling (400px JPEG standard)</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-950" /> 
                        <span>Candidate Full Name</span> 
                        <span className="text-red-700">*</span>
                      </label>
                      <input 
                        required 
                        type="text" 
                        placeholder="e.g. Lovepreet Singh" 
                        value={formData.name} 
                        onChange={e => setFormData({ ...formData, name: e.target.value })} 
                        className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 uppercase outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Father's Name</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <input 
                          required 
                          type="text" 
                          placeholder="e.g. Gurdeep Singh" 
                          value={formData.fatherName} 
                          onChange={e => setFormData({ ...formData, fatherName: e.target.value })} 
                          className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 uppercase outline-none focus:border-blue-950" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Mother's Name</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <input 
                          required 
                          type="text" 
                          placeholder="e.g. Harpreet Kaur" 
                          value={formData.motherName} 
                          onChange={e => setFormData({ ...formData, motherName: e.target.value })} 
                          className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 uppercase outline-none focus:border-blue-950" 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Date of Birth</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <input 
                          required 
                          type="date" 
                          max="2010-12-31"
                          value={formData.dob} 
                          onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-mono font-bold bg-white outline-none focus:border-blue-950 cursor-pointer" 
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Nationality</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          value={formData.nationality}
                          onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          {WORLD_COUNTRIES.map(country => (
                            <option key={country} value={country}>{country}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-blue-950" /> 
                        <span>Registered Email Address</span> 
                        <span className="text-red-700">*</span>
                      </label>
                      <input 
                        required 
                        type="email" 
                        placeholder="candidate@academic.gndu.ac.in" 
                        value={formData.email} 
                        onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-950" 
                      />
                      <p className="text-[9px] font-bold text-orange-800 mt-1 uppercase tracking-tight flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>Binding: Recovery tokens are routed strictly to this certified address.</span>
                      </p>
                    </div>
                  </>
                )}

                {/* STUDENT ID INPUT */}
                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>Statutory Student ID Number</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="text" 
                    maxLength="13" 
                    placeholder="e.g. 2024ECE102" 
                    value={formData.studentId} 
                    onChange={e => setFormData({ ...formData, studentId: e.target.value })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-mono font-bold text-slate-900 uppercase outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                  />
                </div>

                {isRegistering && (
                  <>
                    <div className="space-y-3.5 border border-slate-300 p-3.5 bg-slate-50">
                      <div>
                        <label className="text-[9px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>1. Select Faculty Jurisdiction</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          value={formData.facultyId}
                          onChange={e => handleFacultyChange(e.target.value)}
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          <option value="">-- SELECT FACULTY JURISDICTION --</option>
                          {UNIVERSITY_FACULTIES_HIERARCHY.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>2. Select Department Branch</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          disabled={!formData.facultyId}
                          value={formData.department}
                          onChange={e => handleDepartmentChange(e.target.value)}
                          className={`w-full mt-1 border border-slate-400 p-2 text-xs font-bold uppercase ${
                            !formData.facultyId 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-white focus:border-blue-950 cursor-pointer'
                          }`}
                        >
                          <option value="">{formData.facultyId ? '-- SELECT DEPARTMENT --' : '-- FIRST CHOOSE FACULTY --'}</option>
                          {availableDepartments.map((dept, idx) => (
                            <option key={idx} value={dept.name}>{dept.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[9px] font-black text-blue-950 uppercase tracking-wider flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>3. Course / Degree Programme</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          disabled={!formData.department}
                          value={formData.university}
                          onChange={e => setFormData({ ...formData, university: e.target.value })}
                          className={`w-full mt-1 border border-slate-400 p-2 text-xs font-bold uppercase ${
                            !formData.department 
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                              : 'bg-white focus:border-blue-950 cursor-pointer'
                          }`}
                        >
                          <option value="">{formData.department ? '-- SELECT DEGREE COURSE --' : '-- FIRST CHOOSE DEPARTMENT --'}</option>
                          {availableProgrammes.map(course => (
                            <option key={course.id} value={course.name}>[{course.id}] {course.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-blue-950" /> 
                        <span>Academic Session Batch</span> 
                        <span className="text-red-700">*</span>
                      </label>
                      <select
                        required
                        value={formData.session}
                        onChange={e => setFormData({ ...formData, session: e.target.value })}
                        className="w-full mt-1 border border-slate-400 p-2 text-xs font-mono font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                      >
                        <option value="">-- SELECT ACADEMIC SESSION --</option>
                        {ACADEMIC_SESSIONS.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>State of Domicile</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          value={formData.domicileState}
                          onChange={e => handleStateChange(e.target.value)}
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          {INDIAN_STATES.map(st => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Social Category</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          value={formData.category}
                          disabled={isOutsidePunjab}
                          onChange={e => setFormData({ ...formData, category: e.target.value })}
                          className={`w-full mt-1 border border-slate-400 p-2 text-xs font-bold uppercase ${
                            isOutsidePunjab
                              ? 'bg-slate-100 text-slate-500 cursor-not-allowed border-slate-300'
                              : 'bg-white text-slate-900 focus:border-blue-950 cursor-pointer'
                          }`}
                        >
                          <option value="General">General</option>
                          <option value="SC">SC</option>
                          <option value="BC">BC</option>
                          <option value="OBC">OBC</option>
                          <option value="Other">Other</option>
                        </select>
                        {isOutsidePunjab ? (
                          <p className="text-[8px] font-bold text-orange-800 mt-1 uppercase tracking-tight font-mono">
                            * Out-of-state candidates are classified as General by state norm.
                          </p>
                        ) : (
                          <p className="text-[8px] text-slate-500 mt-1 uppercase font-mono">
                            Punjab Domicile: Select approved reservation quota.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Hash className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Campus Roll Number</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select
                          required
                          value={formData.rollNo}
                          onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-mono font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          <option value="">-- ROLL (001-999) --</option>
                          {ROLL_NUMBERS.map(num => (
                            <option key={num} value={num}>{num}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Residence Hall</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select 
                          value={formData.hostelNo} 
                          onChange={e => setFormData({ ...formData, hostelNo: e.target.value })} 
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          {hostels.length > 0 ? (
                            hostels.map(h => (
                              <option key={h._id} value={h.hostelNumber}>{h.hostelNumber} ({h.type.toUpperCase()})</option>
                            ))
                          ) : (
                            <>
                              <option value="BH1">BH1 (BOYS 1)</option>
                              <option value="GH1">GH1 (GIRLS 1)</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3.5">
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Candidate Gender</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <select 
                          value={formData.gender} 
                          onChange={e => setFormData({ ...formData, gender: e.target.value })} 
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-bold bg-white uppercase outline-none focus:border-blue-950 cursor-pointer"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-blue-950" /> 
                          <span>Mobile Protocol</span> 
                          <span className="text-red-700">*</span>
                        </label>
                        <input 
                          required 
                          type="tel" 
                          maxLength="10" 
                          placeholder="10-digit number" 
                          value={formData.mobileNo} 
                          onChange={e => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })} 
                          className="w-full mt-1 border border-slate-400 p-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-950" 
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-950" /> 
                    <span>Account Access Key</span> 
                    <span className="text-red-700">*</span>
                  </label>
                  <input 
                    required 
                    type="password" 
                    placeholder="••••••••" 
                    value={formData.password} 
                    onChange={e => setFormData({ ...formData, password: e.target.value })} 
                    className="w-full mt-1 border border-slate-400 p-2.5 text-xs font-bold text-slate-900 outline-none focus:border-blue-950 focus:ring-1 focus:ring-blue-950" 
                  />
                </div>

                {!isRegistering && (
                  <div className="text-right pt-1">
                    <button 
                      type="button" 
                      onClick={() => { setForgotPasswordStep(1); resetMessages(); }} 
                      className="text-[10px] font-mono font-black uppercase text-blue-950 hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <HelpCircle className="w-3 h-3 text-orange-600" />
                      <span>Request Password Recovery?</span>
                    </button>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full mt-6 bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black py-3.5 text-xs uppercase tracking-widest transition cursor-pointer disabled:opacity-70 shadow-xs border-b-2 border-orange-500 flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                      <span>Authenticating Request...</span>
                    </>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="w-4 h-4 text-orange-400" />
                      <span>Ratify &amp; Commit Registration Dossier</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4 text-orange-400" />
                      <span>Authenticate &amp; Enter Ledger Portal</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-300 p-3.5 text-center text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 select-none">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span>Autonomous Student Cooperative Registry • Certified Residential Audit System</span>
          </div>
        </div>
      </div>
    </div>
  );
}