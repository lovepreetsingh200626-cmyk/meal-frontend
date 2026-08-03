import React, { useState } from 'react';
import API from '../services/api';
import { 
  User, 
  Phone, 
  Calendar, 
  ImagePlus, 
  ArrowLeft, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  Building,
  IdCard,
  GraduationCap,
  Mail,
  BookOpen,
  Layers
} from 'lucide-react';

export default function StudentProfile({ user, onUpdateSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill form with existing user data including academic details
  const [formData, setFormData] = useState({
    name: user.name || '',
    gender: user.gender || 'Male',
    mobileNo: user.mobileNo || '',
    dob: user.dob || '',
    profilePhoto: user.profilePhoto || '',
    studentId: user.studentId || '',
    university: user.university || '',
    department: user.department || '',
    session: user.session || '',
    category: user.category || 'General',
    email: user.email || ''
  });

  // Handle Photo Upload & Convert to Base64
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, profilePhoto: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    if (!formData.name.trim() || !/^[a-zA-Z\s]{2,}$/.test(formData.name.trim())) {
      setErrorMsg('Please enter a valid Name using letters only.');
      setLoading(false);
      return;
    }
    if (!/^\d{10}$/.test(formData.mobileNo)) {
      setErrorMsg('Mobile number must be exactly 10 numeric digits.');
      setLoading(false);
      return;
    }

    try {
      const { data } = await API.put(`/auth/profile/${user._id}`, formData);
      console.log(data)
      setSuccessMsg('Profile updated successfully!');
      
      setTimeout(() => {
        onUpdateSuccess(data.user);
      }, 1500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

  // Lock checks (True if already filled in database)
  const isStudentIdLocked = !!user.studentId;
  const isUniversityLocked = !!user.university;
  const isDepartmentLocked = !!user.department;
  const isSessionLocked = !!user.session;
  const isCategoryLocked = !!user.category && user.category !== '';
  const isEmailLocked = !!user.email;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 font-sans relative overflow-hidden">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none" />

      <div className="max-w-2xl mx-auto relative z-10">
        
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Profile</h1>
            <p className="text-slate-500 text-sm mt-1.5">Update your personal and academic information.</p>
          </div>

          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-2xl text-sm mb-6 flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="relative group cursor-pointer">
                <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 flex items-center justify-center">
                  {formData.profilePhoto ? (
                    <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-slate-400" />
                  )}
                </div>
                
                <label className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <ImagePlus className="w-6 h-6 mb-1" />
                  <span className="text-[10px] font-bold">Change</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handlePhotoChange} 
                  />
                </label>
              </div>
            </div>

            {/* Read-Only Fields (Roll No & Hostel) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 opacity-70">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Roll Number (Locked)</label>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> {user.rollNo}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 opacity-70">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hostel (Locked)</label>
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Building className="w-4 h-4" /> {user.hostelNo}
                </div>
              </div>
            </div>

            {/* Student ID Field (Locks after first save) */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student ID</label>
              <div className="relative mt-1 group">
                <IdCard className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.studentId}
                  disabled={isStudentIdLocked}
                  placeholder="Enter your official Student ID"
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm transition ${
                    isStudentIdLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                  }`}
                  onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                />
              </div>
              {!isStudentIdLocked && (
                <p className="text-[11px] font-semibold text-amber-600 mt-1">
                  * Note: Can only be set once. Requires admin override to change later.
                </p>
              )}
            </div>

            {/* University / College */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">University / College</label>
              <div className="relative mt-1 group">
                <GraduationCap className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.university}
                  disabled={isUniversityLocked}
                  placeholder="e.g. Guru Nanak Dev University Amritsar"
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm transition ${
                    isUniversityLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                  }`}
                  onChange={e => setFormData({ ...formData, university: e.target.value })}
                />
              </div>
              {!isUniversityLocked && <p className="text-[11px] font-semibold text-amber-600 mt-1">* One-time entry. Locked after save.</p>}
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Department / Course</label>
              <div className="relative mt-1 group">
                <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.department}
                  disabled={isDepartmentLocked}
                  placeholder="e.g. B.Tech Electronics & Communication Engineering"
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm transition ${
                    isDepartmentLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                  }`}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              {!isDepartmentLocked && <p className="text-[11px] font-semibold text-amber-600 mt-1">* One-time entry. Locked after save.</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Session */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Session / Batch</label>
                <div className="relative mt-1 group">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.session}
                    disabled={isSessionLocked}
                    placeholder="e.g. 2024-2028"
                    className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm transition ${
                      isSessionLocked 
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                    }`}
                    onChange={e => setFormData({ ...formData, session: e.target.value })}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                <div className="relative mt-1">
                  <select
                    value={formData.category}
                    disabled={isCategoryLocked}
                    className={`w-full border rounded-xl py-3 px-3.5 text-sm transition cursor-pointer ${
                      isCategoryLocked 
                        ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                        : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white'
                    }`}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="BC">BC</option>
                    <option value="OBC">OBC</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
              <div className="relative mt-1 group">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={formData.email}
                  disabled={isEmailLocked}
                  placeholder="student@example.com"
                  className={`w-full border rounded-xl py-3 pl-11 pr-4 text-sm transition ${
                    isEmailLocked 
                      ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed opacity-80' 
                      : 'bg-slate-50 border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                  }`}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              {!isEmailLocked && <p className="text-[11px] font-semibold text-amber-600 mt-1">* One-time entry. Locked after save.</p>}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
              <div className="relative mt-1 group">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                <input
                  required
                  type="text"
                  value={formData.name}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                <div className="relative mt-1 group">
                  <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                  <input
                    required
                    type="tel"
                    maxLength="10"
                    value={formData.mobileNo}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
                    onChange={e => {
                      const onlyNumbers = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, mobileNo: onlyNumbers });
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                <div className="relative mt-1 group">
                  <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                  <input
                    type="date"
                    value={formData.dob}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer"
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
              <select
                className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Profile Updates</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}