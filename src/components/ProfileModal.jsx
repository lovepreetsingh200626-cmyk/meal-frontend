import React, { useState } from 'react';
import API from '../services/api';
import { 
  User, 
  Phone, 
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
  Lock, 
  Landmark, 
  X, 
  Loader2, 
  FileText,
  Calendar
} from 'lucide-react';

export default function ProfileModal({ user, onClose, onUpdateUser }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isMobileLocked = Boolean(user?.isMobileLocked || user?.mobileChanged);
  const isEmailLocked = Boolean(user?.isEmailLocked || user?.emailChanged);

  const formattedDob = user?.dob ? String(user.dob).split('T')[0] : 'N/A';

  const [formData, setFormData] = useState({
    mobileNo: user?.mobileNo || '',
    email: user?.email || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const userId = user?._id || user?.id || user?.userId;
    if (!userId) {
      setErrorMsg('Authentication Session Error: Candidate ID token missing.');
      setLoading(false);
      return;
    }

    if (!/^\d{10}$/.test(formData.mobileNo)) {
      setErrorMsg('Validation: Registered mobile number must be exactly 10 digits.');
      setLoading(false);
      return;
    }

    if (isMobileLocked && formData.mobileNo !== (user?.mobileNo || '')) {
      setErrorMsg('Security Constraint: Mobile number has already been permanently sealed.');
      setLoading(false);
      return;
    }

    if (isEmailLocked && formData.email !== (user?.email || '')) {
      setErrorMsg('Security Constraint: Email address has already been permanently sealed.');
      setLoading(false);
      return;
    }

    const mobileEdited = formData.mobileNo !== (user?.mobileNo || '');
    const emailEdited = formData.email !== (user?.email || '');

    // Identity and statutory fields are strictly locked from the registered user record
    const submissionPayload = {
      name: user?.name,
      gender: user?.gender,
      profilePhoto: user?.profilePhoto,
      dob: user?.dob,
      fatherName: user?.fatherName,
      motherName: user?.motherName,
      studentId: user?.studentId,
      rollNo: user?.rollNo,
      hostelNo: user?.hostelNo,
      university: user?.university,
      department: user?.department,
      facultyName: user?.facultyName || user?.faculty,
      session: user?.session,
      domicileState: user?.domicileState,
      category: user?.category,
      nationality: user?.nationality,
      mobileNo: formData.mobileNo.trim(),
      email: formData.email.trim(),
      isMobileLocked: isMobileLocked || mobileEdited,
      isEmailLocked: isEmailLocked || emailEdited
    };

    try {
      const { data } = await API.put(`/auth/profile/${userId}`, submissionPayload);
      const updated = data.user || data.updatedUser || submissionPayload;
      setSuccessMsg('Candidate records ratified and synchronized successfully.');
      if (onUpdateUser) onUpdateUser(updated);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error committing profile changes to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
      <div className="bg-white w-full max-w-2xl border-2 border-slate-300 border-t-4 border-t-blue-950 shadow-2xl relative max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-950 text-amber-400 flex items-center justify-center border border-blue-900 shrink-0">
              <Landmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">
                Candidate Profile Dossier
              </h3>
              <p className="text-[9px] font-mono text-slate-500 uppercase">
                Roll: {user?.rollNo || 'N/A'} &bull; Statute 2.4 Audit Record
              </p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="w-7 h-7 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
            title="Close Dossier"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {errorMsg && (
            <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 p-3 text-xs font-bold uppercase flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-800" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 p-3 text-xs font-bold uppercase flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Sealed Identification Strip */}
          <div className="border border-slate-300 p-3.5 bg-slate-50 flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-200 border-2 border-blue-950 overflow-hidden flex items-center justify-center shrink-0 shadow-xs relative">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt="Certified Identification" className="w-full h-full object-cover" />
              ) : (
                <User className="w-8 h-8 text-slate-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase text-blue-950 font-serif">{user?.name}</span>
                <span className="text-[8px] font-black uppercase bg-emerald-800 text-white px-1.5 py-0.2 rounded-xs">
                  Certified
                </span>
              </div>
              <p className="text-[10px] font-mono font-bold text-slate-500 uppercase mt-0.5">
                Roll: {user?.rollNo || 'N/A'} &bull; Gender: {user?.gender || 'N/A'}
              </p>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono uppercase text-slate-500 bg-slate-200 border border-slate-300 px-1.5 py-0.2 mt-1">
                <Lock className="w-2.5 h-2.5 text-slate-600" /> Photo, Name, Gender &amp; DOB Sealed at Registration
              </span>
            </div>
          </div>

          {/* Immutable Registry Dossier */}
          <div className="border border-slate-300 bg-slate-50 p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
              <span className="text-[10px] font-black uppercase text-blue-950 font-serif">
                Immutable Registry Dossier (Statute Sealed)
              </span>
              <span className="text-[8px] font-mono bg-slate-200 text-slate-600 px-1.5 py-0.2 uppercase font-bold flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Locked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Candidate Name</span>
                <span className="font-bold text-blue-950 uppercase font-serif">{user?.name || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Gender</span>
                <span className="font-bold text-slate-800 uppercase">{user?.gender || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Date of Birth</span>
                <span className="font-mono font-bold text-slate-800">{formattedDob}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Student ID Number</span>
                <span className="font-mono font-bold text-slate-800">{user?.studentId || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Father's Name</span>
                <span className="font-bold text-slate-800 uppercase">{user?.fatherName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Mother's Name</span>
                <span className="font-bold text-slate-800 uppercase">{user?.motherName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Residence Hall</span>
                <span className="font-mono font-bold text-slate-800">{user?.hostelNo || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Faculty Jurisdiction</span>
                <span className="font-bold text-slate-800 uppercase">{user?.facultyName || user?.faculty || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Degree / Course</span>
                <span className="font-bold text-slate-800 uppercase font-serif">{user?.university || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Department Branch</span>
                <span className="font-bold text-slate-800 uppercase">{user?.department || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Academic Session</span>
                <span className="font-mono font-bold text-slate-800">{user?.session || 'N/A'}</span>
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Social Category</span>
                <span className="font-black text-amber-800 uppercase">{user?.category || 'General'}</span>
              </div>
            </div>
          </div>

          {/* Permitted Contact Protocol Updates */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border-b border-slate-200 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-blue-950 font-serif">
                Contact Protocol (Single Amendment Permitted)
              </span>
              <span className="text-[8px] font-mono text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 uppercase">
                Single-Edit Protocol
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Mobile Number */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider">
                    Registered Mobile <span className="text-red-700">*</span>
                  </label>
                  {isMobileLocked ? (
                    <span className="text-[8px] font-black uppercase text-red-800 bg-red-50 border border-red-200 px-1 py-0.2 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono uppercase text-amber-800 bg-amber-50 border border-amber-300 px-1 py-0.2">
                      1 Edit Allowed
                    </span>
                  )}
                </div>
                <input
                  required
                  type="tel"
                  maxLength="10"
                  disabled={isMobileLocked}
                  value={formData.mobileNo}
                  className={`w-full py-2 px-3 text-xs font-mono font-bold outline-none ${
                    isMobileLocked
                      ? 'bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed select-none'
                      : 'bg-white border border-slate-400 text-slate-900 focus:border-blue-950'
                  }`}
                  onChange={e => setFormData({ ...formData, mobileNo: e.target.value.replace(/\D/g, '') })}
                />
              </div>

              {/* Email Address */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider">
                    Registered Email <span className="text-red-700">*</span>
                  </label>
                  {isEmailLocked ? (
                    <span className="text-[8px] font-black uppercase text-red-800 bg-red-50 border border-red-200 px-1 py-0.2 flex items-center gap-1">
                      <Lock className="w-2.5 h-2.5" /> Locked
                    </span>
                  ) : (
                    <span className="text-[8px] font-mono uppercase text-amber-800 bg-amber-50 border border-amber-300 px-1 py-0.2">
                      1 Edit Allowed
                    </span>
                  )}
                </div>
                <input
                  required
                  type="email"
                  disabled={isEmailLocked}
                  value={formData.email}
                  className={`w-full py-2 px-3 text-xs font-bold outline-none ${
                    isEmailLocked
                      ? 'bg-slate-100 border border-slate-300 text-slate-500 cursor-not-allowed select-none'
                      : 'bg-white border border-slate-400 text-slate-900 focus:border-blue-950'
                  }`}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading || (isMobileLocked && isEmailLocked)}
                className="w-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black py-3 text-xs uppercase tracking-widest transition cursor-pointer border-b-2 border-amber-500 shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Ratifying Contact Record...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 text-amber-400" />
                    <span>Ratify &amp; Synchronize Record Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}