import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { UNIVERSITY_FACULTIES_HIERARCHY } from '../data/coursesData';
import { ACADEMIC_SESSIONS } from '../data/sessionsData';
import { INDIAN_STATES } from '../data/statesData';
import { WORLD_COUNTRIES } from '../data/countriesData';
import {
  User, Lock, Phone, Building2, LogIn, UserPlus,
  AlertCircle, CheckCircle2, Mail, IdCard, Hash, Unlock,
  GraduationCap, BookOpen, Layers, ShieldCheck, Camera, ImagePlus,
  MapPin, Globe, Calendar, Compass, KeyRound, Key, Users, KeySquare, HelpCircle
} from 'lucide-react';

const ROLL_NUMBERS = Array.from({ length: 999 }, (_, i) => String(i + 1).padStart(3, '0'));

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
    password: '',
    adminSecret: ''
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
      setError('Please upload a valid image file (JPG, PNG, WebP).');
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, profilePhoto: compressedBase64 }));
      };
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    resetMessages();

    if (isAdminMode) {
      if (!formData.name.trim()) { setError('Admin Name required.'); setLoading(false); return; }
      if (!formData.password || formData.password.length < 8) { setError('Password minimum 8 characters.'); setLoading(false); return; }
    } else {
      if (!formData.studentId.trim()) { setError('Student ID required.'); setLoading(false); return; }
      if (formData.studentId.trim().length > 13) { setError('Max 13 digits for Student ID.'); setLoading(false); return; }
      if (isRegistering) {
        if (!formData.rollNo) { setError('Roll Number is required.'); setLoading(false); return; }
        if (!formData.fatherName.trim()) { setError("Father's Name is required."); setLoading(false); return; }
        if (!formData.motherName.trim()) { setError("Mother's Name is required."); setLoading(false); return; }
        if (!formData.dob) { setError('Date of Birth is required.'); setLoading(false); return; }
        if (!formData.facultyId) { setError('Faculty selection is required.'); setLoading(false); return; }
        if (!formData.department.trim()) { setError('Department selection is required.'); setLoading(false); return; }
        if (!formData.university.trim()) { setError('Course / Programme selection is required.'); setLoading(false); return; }
        if (!formData.session.trim()) { setError('Academic Session is required.'); setLoading(false); return; }
        if (!formData.mobileNo.trim() || formData.mobileNo.length !== 10) { setError('Valid 10-digit mobile number is required.'); setLoading(false); return; }
      }
    }

    try {
      if (isRegistering) {
        const endpoint = isAdminMode ? '/auth/register-admin' : '/auth/register';
        const payload = isAdminMode
          ? { name: formData.name.trim(), password: formData.password, adminSecret: formData.adminSecret.trim() }
          : {
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

        await API.post(endpoint, payload);
        setSuccessMsg('Registration Successful. Switching to login.');
        setTimeout(() => { setIsRegistering(false); resetMessages(); }, 1500);
      } else {
        const loginPayload = isAdminMode
          ? { name: formData.name.trim(), password: formData.password, role: 'admin' }
          : { studentId: formData.studentId.trim(), password: formData.password, role: 'student' };

        const { data } = await API.post('/auth/login', loginPayload);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication Failed.');
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
      setTimeout(() => { setForgotPasswordStep(2); resetMessages(); }, 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP.');
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
      setTimeout(() => { setForgotPasswordStep(0); resetMessages(); }, 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset.');
    } finally {
      setLoading(false);
    }
  };

  const isOutsidePunjab = formData.domicileState !== 'Punjab';

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 font-sans selection:bg-blue-900 selection:text-white flex flex-col">

      {/* PRIVATE TOP STRIP */}
      <div className="bg-amber-950 text-white py-1.5 px-4 md:px-8 text-[11px] font-semibold flex justify-between tracking-wide">
        <div className="uppercase flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
          <span>Private &amp; Unofficial Student Utility • Independent Mess Tracker</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setIsAdminMode(!isAdminMode); resetMessages(); }} className="hover:underline uppercase text-orange-300 cursor-pointer flex items-center gap-1">
            {isAdminMode ? <User className="w-3 h-3" /> : <KeyRound className="w-3 h-3" />}
            {isAdminMode ? 'Switch to Member Portal' : 'Committee Admin Login'}
          </button>
        </div>
      </div>

      {/* PORTAL HEADER */}
      <div className="bg-white border-b-4 border-orange-600 shadow-sm px-4 py-4 md:px-8 flex flex-col md:flex-row items-center gap-4">
        <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-orange-500 shrink-0 tracking-widest shadow-inner">
          MESS
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Student Mess &amp; Diet Ledger System</h1>
          <h2 className="text-sm font-bold text-gray-600 uppercase">Independent Student Cooperative Committee</h2>
          <span className="text-[10px] font-bold bg-amber-700 text-white px-2 py-0.5 mt-1 inline-block">Private &amp; Unofficial Utility</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 py-10">
        <div className="bg-white border border-gray-300 w-full max-w-lg shadow-md rounded-sm">

          {/* FORM HEADER */}
          <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex justify-between items-center">
            <h3 className="text-lg font-bold text-blue-900 uppercase tracking-wide flex items-center gap-2">
              {forgotPasswordStep > 0 ? (
                <>
                  <KeyRound className="w-4 h-4 text-orange-600" /> Password Recovery
                </>
              ) : isAdminMode ? (
                isRegistering ? (
                  <>
                    <UserPlus className="w-4 h-4 text-orange-600" /> Committee Admin Registration
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-orange-600" /> Committee Admin Login
                  </>
                )
              ) : isRegistering ? (
                <>
                  <UserPlus className="w-4 h-4 text-blue-900" /> Member Registration Form
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-blue-900" /> Member Login Portal
                </>
              )}
            </h3>
            {forgotPasswordStep === 0 && (
              <div className="flex text-xs font-bold border border-gray-400 bg-white rounded-sm overflow-hidden">
                <button type="button" onClick={() => { setIsRegistering(false); resetMessages(); }} className={`px-4 py-1.5 cursor-pointer flex items-center gap-1.5 ${!isRegistering ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <LogIn className="w-3.5 h-3.5" /> LOGIN
                </button>
                <button type="button" onClick={() => { setIsRegistering(true); resetMessages(); }} className={`px-4 py-1.5 border-l border-gray-400 cursor-pointer flex items-center gap-1.5 ${isRegistering ? 'bg-blue-900 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <UserPlus className="w-3.5 h-3.5" /> REGISTER
                </button>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 max-h-[75vh] overflow-y-auto">
            {error && <div className="bg-red-50 border-l-4 border-red-700 text-red-900 px-4 py-3 text-sm mb-6 flex gap-3 font-medium"><AlertCircle className="w-5 h-5 shrink-0" /><span>{error}</span></div>}
            {successMsg && <div className="bg-green-50 border-l-4 border-green-700 text-green-900 px-4 py-3 text-sm mb-6 flex gap-3 font-medium"><CheckCircle2 className="w-5 h-5 shrink-0" /><span>{successMsg}</span></div>}

            {/* FORGOT PASSWORD FLOW */}
            {forgotPasswordStep === 1 && (
              <form onSubmit={handleRequestOTP} className="space-y-5">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <IdCard className="w-3.5 h-3.5 text-blue-900" /> Student ID Number <span className="text-red-600">*</span>
                  </label>
                  <input required type="text" maxLength="13" value={resetData.studentId} onChange={e => setResetData({ ...resetData, studentId: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:outline-none focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setForgotPasswordStep(0); resetMessages(); }} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2.5 text-sm uppercase rounded-sm border border-gray-300 cursor-pointer">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 text-sm uppercase rounded-sm cursor-pointer flex items-center justify-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{loading ? 'Sending...' : 'Request OTP'}</span>
                  </button>
                </div>
              </form>
            )}

            {forgotPasswordStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-blue-900" /> 6-Digit OTP <span className="text-red-600">*</span>
                  </label>
                  <input required type="text" maxLength="6" value={resetData.otp} onChange={e => setResetData({ ...resetData, otp: e.target.value.replace(/\D/g, '') })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm font-bold tracking-widest focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-blue-900" /> New Password <span className="text-red-600">*</span>
                  </label>
                  <input required type="password" value={resetData.newPassword} onChange={e => setResetData({ ...resetData, newPassword: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> Confirm Password <span className="text-red-600">*</span>
                  </label>
                  <input required type="password" value={resetData.confirmPassword} onChange={e => setResetData({ ...resetData, confirmPassword: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                </div>
                <button type="submit" disabled={loading} className="w-full mt-2 bg-green-700 hover:bg-green-800 text-white font-bold py-3 text-sm uppercase rounded-sm cursor-pointer flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Resetting...' : 'Submit & Reset'}</span>
                </button>
              </form>
            )}

            {/* NORMAL LOGIN / REGISTER FLOW */}
            {forgotPasswordStep === 0 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {isAdminMode ? (
                  <>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-600" /> Designation / Admin Name <span className="text-red-600">*</span>
                      </label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-orange-600" /> Secure Password <span className="text-red-600">*</span>
                      </label>
                      <input required type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                    </div>
                    {isRegistering && (
                      <div className="bg-orange-50 border border-orange-200 p-4 mt-2 rounded-sm">
                        <label className="text-xs font-bold text-orange-900 uppercase flex items-center gap-1.5">
                          <KeySquare className="w-3.5 h-3.5 text-orange-700" /> Authorization Secret Code <span className="text-red-600">*</span>
                        </label>
                        <input required type="password" value={formData.adminSecret} onChange={e => setFormData({ ...formData, adminSecret: e.target.value })} className="w-full mt-1 border border-orange-400 p-2.5 text-sm focus:border-orange-600 rounded-sm" />
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {isRegistering && (
                      <>
                        {/* PHOTO UPLOAD BOX */}
                        <div className="border border-gray-300 p-3 bg-gray-50 flex items-center gap-4">
                          <div className="w-16 h-16 bg-gray-200 border-2 border-blue-900 overflow-hidden flex items-center justify-center shrink-0">
                            {formData.profilePhoto ? (
                              <img src={formData.profilePhoto} alt="Upload Preview" className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-800 uppercase block mb-1 flex items-center gap-1.5">
                              <Camera className="w-3.5 h-3.5 text-blue-900" /> Member Photograph <span className="text-red-600">*</span>
                            </label>
                            <label className="inline-flex items-center gap-1.5 bg-blue-900 hover:bg-blue-800 text-white px-3 py-1.5 text-[11px] font-bold uppercase rounded-xs cursor-pointer shadow-xs">
                              <ImagePlus className="w-3.5 h-3.5" />
                              <span>{formData.profilePhoto ? 'Change Image' : 'Select Photo'}</span>
                              <input type="file" accept="image/*" required={!formData.profilePhoto} className="hidden" onChange={handlePhotoUpload} />
                            </label>
                            <p className="text-[9px] text-gray-500 uppercase mt-1">Automatic compression enabled (Max 400px)</p>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-blue-900" /> Candidate Full Name <span className="text-red-600">*</span>
                          </label>
                          <input required type="text" placeholder="e.g. Lovepreet Singh" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                        </div>

                        {/* PARENTAL DETAILS */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-900" /> Father's Name <span className="text-red-600">*</span>
                            </label>
                            <input required type="text" placeholder="e.g. Gurdeep Singh" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase focus:border-blue-900 rounded-sm" />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-blue-900" /> Mother's Name <span className="text-red-600">*</span>
                            </label>
                            <input required type="text" placeholder="e.g. Harpreet Kaur" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase focus:border-blue-900 rounded-sm" />
                          </div>
                        </div>

                        {/* DOB & NATIONALITY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-900" /> Date of Birth <span className="text-red-600">*</span>
                            </label>
                            <input 
                              required 
                              type="date" 
                              max="2010-12-31"
                              value={formData.dob} 
                              onChange={e => setFormData({ ...formData, dob: e.target.value })} 
                              className="w-full mt-1 border border-gray-400 p-2 text-sm bg-white focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm cursor-pointer" 
                            />
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Globe className="w-3.5 h-3.5 text-blue-900" /> Nationality <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              value={formData.nationality}
                              onChange={e => setFormData({ ...formData, nationality: e.target.value })}
                              className="w-full mt-1 border border-gray-400 p-2.5 text-sm bg-white uppercase focus:border-blue-900 rounded-sm cursor-pointer"
                            >
                              {WORLD_COUNTRIES.map(country => (
                                <option key={country} value={country}>
                                  {country}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-blue-900" /> Registered Email ID <span className="text-red-600">*</span>
                          </label>
                          <input required type="email" placeholder="student@mess.coop" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                          <p className="text-[10px] font-bold text-red-600 mt-1 uppercase tracking-tight flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Important: Enter an active, accurate email address. It is strictly required to receive OTP for password recovery.</span>
                          </p>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                        <IdCard className="w-3.5 h-3.5 text-blue-900" /> Student ID Number <span className="text-red-600">*</span>
                      </label>
                      <input required type="text" maxLength="13" placeholder="e.g. 2024ECE102" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                    </div>

                    {isRegistering && (
                      <>
                        {/* 3-TIER HIERARCHY SELECTORS */}
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Compass className="w-3.5 h-3.5 text-blue-900" /> 1. Select Faculty <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              value={formData.facultyId}
                              onChange={e => handleFacultyChange(e.target.value)}
                              className="w-full mt-1 border border-gray-400 p-2.5 text-xs bg-white uppercase focus:border-blue-900 rounded-sm cursor-pointer"
                            >
                              <option value="">-- SELECT FACULTY --</option>
                              {UNIVERSITY_FACULTIES_HIERARCHY.map(f => (
                                <option key={f.id} value={f.id}>
                                  {f.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5 text-blue-900" /> 2. Select Department <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              disabled={!formData.facultyId}
                              value={formData.department}
                              onChange={e => handleDepartmentChange(e.target.value)}
                              className={`w-full mt-1 border border-gray-400 p-2.5 text-xs uppercase rounded-sm ${
                                !formData.facultyId 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white focus:border-blue-900 cursor-pointer'
                              }`}
                            >
                              <option value="">{formData.facultyId ? '-- SELECT DEPARTMENT --' : '-- FIRST CHOOSE FACULTY --'}</option>
                              {availableDepartments.map((dept, idx) => (
                                <option key={idx} value={dept.name}>
                                  {dept.name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-blue-900" /> 3. Course / Programme Name <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              disabled={!formData.department}
                              value={formData.university}
                              onChange={e => setFormData({ ...formData, university: e.target.value })}
                              className={`w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase rounded-sm ${
                                !formData.department 
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                  : 'bg-white focus:border-blue-900 cursor-pointer'
                              }`}
                            >
                              <option value="">{formData.department ? '-- SELECT COURSE / DEGREE --' : '-- FIRST CHOOSE DEPARTMENT --'}</option>
                              {availableProgrammes.map(course => (
                                <option key={course.id} value={course.name}>
                                  [{course.id}] {course.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* ACADEMIC SESSION */}
                        <div>
                          <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5 text-blue-900" /> Academic Session <span className="text-red-600">*</span>
                          </label>
                          <select
                            required
                            value={formData.session}
                            onChange={e => setFormData({ ...formData, session: e.target.value })}
                            className="w-full mt-1 border border-gray-400 p-2.5 text-xs bg-white uppercase focus:border-blue-900 rounded-sm cursor-pointer"
                          >
                            <option value="">-- SELECT ACADEMIC SESSION --</option>
                            {ACADEMIC_SESSIONS.map(s => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* DOMICILE STATE & SOCIAL CATEGORY */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-blue-900" /> Domicile State <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              value={formData.domicileState}
                              onChange={e => handleStateChange(e.target.value)}
                              className="w-full mt-1 border border-gray-400 p-2.5 text-sm bg-white uppercase focus:border-blue-900 rounded-sm cursor-pointer"
                            >
                              {INDIAN_STATES.map(st => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> Category <span className="text-red-600">*</span>
                            </label>
                            <select
                              value={formData.category}
                              disabled={isOutsidePunjab}
                              onChange={e => setFormData({ ...formData, category: e.target.value })}
                              className={`w-full mt-1 border border-gray-400 p-2.5 text-sm uppercase rounded-sm ${
                                isOutsidePunjab
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed border-gray-300'
                                  : 'bg-white text-gray-900 focus:border-blue-900 cursor-pointer'
                              }`}
                            >
                              <option value="General">General</option>
                              <option value="SC">SC</option>
                              <option value="BC">BC</option>
                              <option value="OBC">OBC</option>
                              <option value="Other">Other</option>
                            </select>
                            {isOutsidePunjab ? (
                              <p className="text-[10px] font-bold text-amber-700 mt-1 uppercase tracking-tight">
                                * Out-of-Punjab candidates are treated as General category by state norms.
                              </p>
                            ) : (
                              <p className="text-[10px] text-gray-500 mt-1 uppercase">
                                Punjab Domicile: Select your state reservation category.
                              </p>
                            )}
                          </div>
                        </div>

                        {/* ROLL NUMBER (001 TO 999) & RESIDENCE HALL */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Hash className="w-3.5 h-3.5 text-blue-900" /> Roll Number <span className="text-red-600">*</span>
                            </label>
                            <select
                              required
                              value={formData.rollNo}
                              onChange={e => setFormData({ ...formData, rollNo: e.target.value })}
                              className="w-full mt-1 border border-gray-400 p-2.5 text-sm bg-white uppercase focus:border-blue-900 rounded-sm cursor-pointer"
                            >
                              <option value="">-- ROLL (001-999) --</option>
                              {ROLL_NUMBERS.map(num => (
                                <option key={num} value={num}>
                                  {num}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-blue-900" /> Residence Hall <span className="text-red-600">*</span>
                            </label>
                            <select value={formData.hostelNo} onChange={e => setFormData({ ...formData, hostelNo: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm bg-white focus:border-blue-900 rounded-sm cursor-pointer">
                              {hostels.length > 0 ? hostels.map(h => <option key={h._id} value={h.hostelNumber}>{h.hostelNumber} ({h.type.toUpperCase()})</option>) : <><option value="BH1">BH1</option><option value="GH1">GH1</option></>}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <User className="w-3.5 h-3.5 text-blue-900" /> Gender <span className="text-red-600">*</span>
                            </label>
                            <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm bg-white focus:border-blue-900 rounded-sm cursor-pointer">
                              <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                            </select>
                          </div>
                          <div>
                            <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-blue-900" /> Mobile No. <span className="text-red-600">*</span>
                            </label>
                            <input required type="tel" maxLength="10" placeholder="10-digit mobile" value={formData.mobileNo} onChange={e => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 rounded-sm" />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-blue-900" /> Account Password <span className="text-red-600">*</span>
                      </label>
                      <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full mt-1 border border-gray-400 p-2.5 text-sm focus:border-blue-900 focus:ring-1 focus:ring-blue-900 rounded-sm" />
                    </div>
                  </>
                )}

                {!isRegistering && !isAdminMode && (
                  <div className="text-right">
                    <button type="button" onClick={() => { setForgotPasswordStep(1); resetMessages(); }} className="text-xs font-bold text-blue-800 hover:underline cursor-pointer inline-flex items-center gap-1">
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Forgot Password?</span>
                    </button>
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full mt-6 bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 text-sm uppercase tracking-wide rounded-sm shadow-sm disabled:opacity-70 transition-colors cursor-pointer flex items-center justify-center gap-2">
                  {loading ? (
                    <span>Processing Request...</span>
                  ) : isRegistering ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Submit Registration Form</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Login to Portal</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          <div className="bg-gray-50 border-t border-gray-300 p-4 text-center text-[10px] text-gray-500 uppercase tracking-wide flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span>© {new Date().getFullYear()} Student Mess Cooperative. All Rights Reserved. (Private Unofficial Utility)</span>
          </div>
        </div>
      </div>
    </div>
  );
}