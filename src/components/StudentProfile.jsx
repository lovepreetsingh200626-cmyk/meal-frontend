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
  Layers,
  ShieldAlert,
  Users,
  MapPin,
  Compass,
  Globe,
  Lock
} from 'lucide-react';

export default function StudentProfile({ user, onUpdateSuccess, onBack }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // 1-Time Change Lock Flags (Persistent from User Model)
  const isMobileLocked = Boolean(user?.isMobileLocked || user?.mobileChanged);
  const isEmailLocked = Boolean(user?.isEmailLocked || user?.emailChanged);

  // Pre-fill form with existing user data
  const [formData, setFormData] = useState({
    name: user?.name || '',
    fatherName: user?.fatherName || '',
    motherName: user?.motherName || '',
    gender: user?.gender || 'Male',
    mobileNo: user?.mobileNo || '',
    dob: user?.dob || '',
    nationality: user?.nationality || 'India',
    profilePhoto: user?.profilePhoto || '',
    studentId: user?.studentId || '',
    university: user?.university || '',
    department: user?.department || '',
    facultyName: user?.facultyName || user?.faculty || '',
    session: user?.session || '',
    domicileState: user?.domicileState || 'Punjab',
    category: user?.category || 'General',
    email: user?.email || ''
  });

  // Handle Photo Upload with Automatic Canvas Compression
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please upload a valid image file (JPG, PNG, WebP).');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be less than 2MB.');
      setTimeout(() => setErrorMsg(''), 4000);
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
    setErrorMsg('');
    setSuccessMsg('');

    const userId = user?._id || user?.id || user?.userId;
    if (!userId) {
      setErrorMsg('Session Error: User ID not found. Please re-login.');
      setLoading(false);
      return;
    }

    if (!formData.name.trim() || !/^[a-zA-Z\s.]{2,}$/.test(formData.name.trim())) {
      setErrorMsg('Please enter a valid Name using letters only.');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNo)) {
      setErrorMsg('Mobile number must be exactly 10 numeric digits.');
      setLoading(false);
      return;
    }

    // Prevent submitting modifications to locked items
    if (isMobileLocked && formData.mobileNo !== (user?.mobileNo || '')) {
      setErrorMsg('Security Notice: Mobile number is locked and cannot be edited.');
      setLoading(false);
      return;
    }

    if (isEmailLocked && formData.email !== (user?.email || '')) {
      setErrorMsg('Security Notice: Email address is locked and cannot be edited.');
      setLoading(false);
      return;
    }

    // Determine if this update permanently consumes the 1-time change
    const mobileEdited = formData.mobileNo !== (user?.mobileNo || '');
    const emailEdited = formData.email !== (user?.email || '');

    const submissionPayload = {
      ...formData,
      name: formData.name.trim(),
      isMobileLocked: isMobileLocked || mobileEdited,
      isEmailLocked: isEmailLocked || emailEdited
    };

    try {
      const { data } = await API.put(`/auth/profile/${userId}`, submissionPayload);
      setSuccessMsg('Profile records updated and synced successfully!');
      
      setTimeout(() => {
        if (onUpdateSuccess) onUpdateSuccess(data.user || data.updatedUser || submissionPayload);
      }, 1500);

    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating profile.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setLoading(false);
    }
  };

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
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Student Profile</h1>
            <p className="text-slate-500 text-sm mt-1.5">View your academic dossier and manage verified personal records.</p>
          </div>

          {/* ADMIN RESTRICTION NOTICE */}
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-3 rounded-2xl text-xs mb-6 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-blue-700 shrink-0" />
            <span>Academic records, faculty, parental names, IDs, and category profiles are locked. Updates to institutional fields are handled exclusively by the Committee Administrator.</span>
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
            
            {/* AVATAR UPLOAD */}
            <div className="flex flex-col items-center justify-center mb-6">
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
              <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">Click avatar to replace photograph (Max 2MB)</p>
            </div>

            {/* Read-Only Fields (Roll No & Hostel) */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 opacity-90">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Roll Number (Locked)</label>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <ShieldCheck className="w-4 h-4 text-blue-600" /> {user?.rollNo || 'N/A'}
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 opacity-90">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Hostel (Locked)</label>
                <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
                  <Building className="w-4 h-4 text-blue-600" /> {user?.hostelNo || 'N/A'}
                </div>
              </div>
            </div>

            {/* Fully Read-Only Academic & Family Records Fields */}
            <div className="space-y-4 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-5">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Institutional & Parental Dossier (Admin Locked)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Father's Name</label>
                  <div className="relative mt-1">
                    <User className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.fatherName}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Mother's Name</label>
                  <div className="relative mt-1">
                    <Users className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.motherName}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID Number</label>
                <div className="relative mt-1">
                  <IdCard className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.studentId}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Faculty Name</label>
                <div className="relative mt-1">
                  <Compass className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.facultyName}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Course / Degree Program</label>
                <div className="relative mt-1">
                  <GraduationCap className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.university}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department Branch</label>
                <div className="relative mt-1">
                  <BookOpen className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={formData.department}
                    disabled
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Session</label>
                  <div className="relative mt-1">
                    <Layers className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.session}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Nationality</label>
                  <div className="relative mt-1">
                    <Globe className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.nationality}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Domicile State</label>
                  <div className="relative mt-1">
                    <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={formData.domicileState}
                      disabled
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-600 cursor-not-allowed font-medium uppercase"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Social Category</label>
                <input
                  type="text"
                  value={formData.category}
                  disabled
                  className="w-full mt-1 bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3.5 text-sm text-orange-800 cursor-not-allowed font-bold uppercase"
                />
              </div>
            </div>

            {/* Editable Personal Fields */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">Editable Personal Information</h3>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Candidate Name</label>
                <div className="relative mt-1 group">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                  <input
                    required
                    type="text"
                    value={formData.name}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition uppercase font-bold"
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
              </div>

              {/* CONTACT FIELDS WITH 1-TIME EDIT ENFORCEMENT */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* MOBILE NUMBER */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mobile Number</label>
                    {isMobileLocked ? (
                      <span className="text-[9px] font-black uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        1 Change Allowed
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                    <input
                      required
                      type="tel"
                      maxLength="10"
                      disabled={isMobileLocked}
                      value={formData.mobileNo}
                      className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm font-medium transition ${
                        isMobileLocked 
                          ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed select-none' 
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                      }`}
                      onChange={e => {
                        const onlyNumbers = e.target.value.replace(/\D/g, '');
                        setFormData({ ...formData, mobileNo: onlyNumbers });
                      }}
                    />
                  </div>
                </div>

                {/* OFFICIAL EMAIL */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Official Email</label>
                    {isEmailLocked ? (
                      <span className="text-[9px] font-black uppercase text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Lock className="w-2.5 h-2.5" /> Locked
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                        1 Change Allowed
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                    <input
                      required
                      type="email"
                      disabled={isEmailLocked}
                      value={formData.email}
                      className={`w-full rounded-xl py-3 pl-11 pr-4 text-sm font-medium transition ${
                        isEmailLocked 
                          ? 'bg-slate-100 border border-slate-200 text-slate-500 cursor-not-allowed select-none' 
                          : 'bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white'
                      }`}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date of Birth</label>
                  <div className="relative mt-1 group">
                    <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition" />
                    <input
                      type="date"
                      max="2010-12-31"
                      value={formData.dob}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl py-3 pl-11 pr-4 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer font-medium"
                      onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                  <select
                    className="w-full mt-1 bg-slate-50 border border-slate-300 rounded-xl py-3 px-3.5 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white transition cursor-pointer font-medium uppercase"
                    value={formData.gender}
                    onChange={e => setFormData({ ...formData, gender: e.target.value })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || (isMobileLocked && isEmailLocked && formData.name === user?.name && formData.dob === user?.dob && formData.gender === user?.gender && formData.profilePhoto === user?.profilePhoto)}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-semibold py-3.5 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-sm"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Updating Ledger Records...
                </span>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Personal Updates</span>
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}