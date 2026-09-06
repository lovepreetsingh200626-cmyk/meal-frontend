import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';
import { 
  MessageSquareWarning, Send, AlertCircle, CheckCircle2, 
  FileText, Clock, Check, Loader2, ShieldAlert, 
  Landmark, ShieldCheck, Paperclip, Eye, X, Trash2
} from 'lucide-react';

export default function StudentComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Modals State
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Form State
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');

  const userId = user?._id || user?.id || user?.userId;
  const hostelId = typeof user?.hostelId === 'object' 
    ? (user?.hostelId?._id || user?.hostelId?.hostelNumber || 'BH1') 
    : (user?.hostelId || user?.hostelNo || 'BH1');
  const hostelNo = user?.hostelNo || user?.hostelId?.hostelNumber || 'CAMPUS RESIDENCE';

  const fetchComplaints = useCallback(async () => {
    if (!userId) return;
    try {
      const { data } = await API.get(`/complaints/user/${userId}`);
      setComplaints(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load grievance docket:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Evidentiary Format Error: File must be an official image document (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Evidentiary Limit: Photographic evidence attachment must not exceed 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setComplaintPhoto(reader.result);
      setErrorMsg('');
    };
    reader.readAsDataURL(file);
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) {
      setErrorMsg('Statute Directive: Formal representation subject and inquiry details are mandatory.');
      return;
    }

    setSubmittingComplaint(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/complaints', {
        userId,
        hostelId,
        hostelNo,
        category: complaintCategory,
        subject: complaintSubject.trim(),
        description: complaintDesc.trim(),
        photoProof: complaintPhoto
      });

      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setSuccessMsg('Grievance petition recorded and queued on Student Welfare Board Docket.');
      setTimeout(() => setSuccessMsg(''), 4500);
      fetchComplaints();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction Error: Failed to register petition on docket.');
      setTimeout(() => setErrorMsg(''), 5000);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const promptWithdrawComplaint = (complaintId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Retract Grievance Petition',
      message: 'Do you wish to permanently retract and purge this grievance petition from the official docket?',
      onConfirm: async () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        setErrorMsg('');
        setSuccessMsg('');
        try {
          await API.delete(`/complaints/${complaintId}`);
          setSuccessMsg('Grievance petition successfully retracted and purged.');
          setTimeout(() => setSuccessMsg(''), 4500);
          setComplaints(prev => prev.filter(c => c._id !== complaintId));
        } catch (err) {
          setErrorMsg(err.response?.data?.message || 'Transaction Error: Failed to retract petition.');
          setTimeout(() => setErrorMsg(''), 5000);
        }
      }
    });
  };

  const pendingCount = complaints.filter(c => c.status === 'Pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans selection:bg-blue-950 selection:text-white">
      
      {/* 1. TOP STATUTORY AUDIT STRIP */}
      <div className="bg-slate-950 text-slate-300 text-[9px] sm:text-[10px] font-bold px-3 sm:px-8 py-2 border-b-2 border-amber-500/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 z-50 select-none">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="truncate">Central Residential Mess Cooperative</span>
        </div>
        <div className="flex items-center gap-2 text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-slate-400">
          <span>Statute: <strong className="text-white">STATUTE 5.1</strong></span>
        </div>
      </div>

      {/* FULL PAGE LOADER ENCAPSULATION */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-6 space-y-5">
        {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] bg-white border-2 border-slate-300 shadow-sm border-t-4 border-t-blue-950 w-full animate-in fade-in duration-300">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
                <p className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-600">Accessing Grievance Docket...</p>
            </div>
        ) : (
            <div className="space-y-5 animate-in fade-in duration-500">
              {/* 2. DOCKET HEADER */}
              <div className="bg-white border-2 border-slate-300 shadow-xs p-4 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t-4 border-t-blue-950">
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-950 border-2 border-amber-500 text-amber-300 flex items-center justify-center font-serif shrink-0 shadow-xs mt-0.5">
                    <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[8px] sm:text-[9px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2 py-0.5 font-mono">
                        Official Record
                      </span>
                      <span className="text-[8px] sm:text-[9px] font-mono font-bold text-slate-500 uppercase">
                        Statute 5.1 Redressal
                      </span>
                    </div>
                    <h1 className="text-base sm:text-xl font-black text-blue-950 uppercase tracking-tight font-serif mt-1">
                      Grievance &amp; Redressal Adjudication Docket
                    </h1>
                    <p className="text-[11px] sm:text-xs font-mono font-bold text-slate-600 uppercase mt-0.5 break-words">
                      Member: <span className="text-blue-950 font-serif font-black">{user?.name}</span> &bull; Roll: <span className="text-slate-900">{user?.rollNo || 'N/A'}</span> &bull; Residence: <span className="text-slate-900">{hostelNo}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* 3. DOCKET METRICS SUMMARY */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white border border-slate-300 p-3 sm:p-4 border-l-4 border-l-blue-950 shadow-xs">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Logged Petitions</p>
                  <p className="text-xl sm:text-2xl font-black text-slate-950 font-serif mt-1">{complaints.length}</p>
                </div>
                <div className="bg-white border border-slate-300 p-3 sm:p-4 border-l-4 border-l-red-700 shadow-xs">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Pending Review</p>
                  <p className="text-xl sm:text-2xl font-black text-red-700 font-serif mt-1">{pendingCount}</p>
                </div>
                <div className="bg-white border border-slate-300 p-3 sm:p-4 border-l-4 border-l-amber-600 shadow-xs">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Under Review</p>
                  <p className="text-xl sm:text-2xl font-black text-amber-700 font-serif mt-1">{inProgressCount}</p>
                </div>
                <div className="bg-white border border-slate-300 p-3 sm:p-4 border-l-4 border-l-emerald-700 shadow-xs">
                  <p className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Resolved</p>
                  <p className="text-xl sm:text-2xl font-black text-emerald-800 font-serif mt-1">{resolvedCount}</p>
                </div>
              </div>

              {/* NOTIFICATIONS */}
              {errorMsg && (
                <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 p-3.5 text-xs font-bold uppercase flex items-start gap-2.5 shadow-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
                  <div>
                    <p className="font-black">Docket Notice</p>
                    <p className="font-medium normal-case text-[11px] mt-0.5 text-red-900">{errorMsg}</p>
                  </div>
                </div>
              )}
              {successMsg && (
                <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 p-3.5 text-xs font-bold uppercase flex items-start gap-2.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
                  <div>
                    <p className="font-black">Action Confirmed</p>
                    <p className="font-medium normal-case text-[11px] mt-0.5 text-emerald-900">{successMsg}</p>
                  </div>
                </div>
              )}

              {/* 4. FORM AND LOGGED DOCKET SPLIT */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* PETITION SUBMISSION FORM */}
                <div className="lg:col-span-5 bg-white border-2 border-slate-300 shadow-xs">
                  <div className="bg-slate-50 border-b border-slate-300 px-4 sm:px-5 py-3.5 flex items-center justify-between">
                    <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                      <FileText className="w-4 h-4 text-amber-600" /> Lodge Grievance Petition
                    </h2>
                  </div>

                  <form onSubmit={handleComplaintSubmit} className="p-4 sm:p-5 space-y-4">
                    <div className="bg-amber-50 border border-amber-300 p-3 text-[11px] text-amber-950 leading-relaxed font-medium">
                      <span className="font-black uppercase font-serif block text-amber-900 mb-0.5 flex items-center gap-1 text-[10px]">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-700" /> Statute 5.1 Protocol:
                      </span>
                      State precise factual details regarding mess timing, preparation quality, or management conduct.
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider block mb-1">Grievance Category <span className="text-red-700">*</span></label>
                      <select value={complaintCategory} onChange={(e) => setComplaintCategory(e.target.value)} className="w-full bg-white border border-slate-400 py-2 px-3 text-xs font-bold text-slate-900 uppercase outline-none focus:border-blue-950 cursor-pointer">
                        <option value="Food Quality">Food Quality &amp; Preparation Standards</option>
                        <option value="Cleanliness">Hygiene &amp; Utensil Sanitation</option>
                        <option value="Timing">Serving Hours &amp; Meal Schedule</option>
                        <option value="Staff Behavior">Staff Conduct &amp; Management Oversight</option>
                        <option value="Other">Other Administrative Grievance</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider block mb-1">Subject Representation <span className="text-red-700">*</span></label>
                      <input required type="text" placeholder="Concise summary of petition..." value={complaintSubject} onChange={(e) => setComplaintSubject(e.target.value)} className="w-full bg-white border border-slate-400 py-2 px-3 text-xs font-bold text-slate-900 outline-none focus:border-blue-950" />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider block mb-1">Statement of Facts <span className="text-red-700">*</span></label>
                      <textarea required rows={4} placeholder="Detail dates, dietary session, staff members involved..." value={complaintDesc} onChange={(e) => setComplaintDesc(e.target.value)} className="w-full bg-white border border-slate-400 py-2 px-3 text-xs font-medium text-slate-900 outline-none focus:border-blue-950 resize-none" />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase tracking-wider block mb-1">Photographic Evidence (Optional, Max 2MB)</label>
                      <div className="flex flex-wrap items-center gap-3">
                        <label className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-400 text-slate-800 px-3 py-2 text-[10px] font-black uppercase cursor-pointer transition shadow-xs">
                          <Paperclip className="w-3.5 h-3.5 text-slate-600" />
                          <span>{complaintPhoto ? 'Change Attachment' : 'Attach Proof Document'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                        {complaintPhoto && (
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono text-emerald-800 font-bold uppercase">Attached ✓</span>
                            <button type="button" onClick={() => setComplaintPhoto('')} className="text-red-700 hover:text-red-900 text-xs font-black p-1">✕</button>
                          </div>
                        )}
                      </div>
                    </div>

                    <button type="submit" disabled={submittingComplaint} className="w-full mt-2 bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black py-3.5 text-xs uppercase tracking-widest transition cursor-pointer border-b-2 border-amber-500 shadow-xs flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60">
                      {submittingComplaint ? (
                        <><Loader2 className="w-4 h-4 animate-spin text-amber-400" /><span>Transmitting...</span></>
                      ) : (
                        <><Send className="w-4 h-4 text-amber-400" /><span>Register Petition on Docket</span></>
                      )}
                    </button>
                  </form>
                </div>

                {/* DOCKET HISTORY LIST */}
                <div className="lg:col-span-7 bg-white border-2 border-slate-300 shadow-xs">
                  <div className="bg-slate-50 border-b border-slate-300 px-4 sm:px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                        <MessageSquareWarning className="w-4 h-4 text-amber-600" /> Registered Docket Inquiries
                      </h2>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                      {complaints.length} Record{complaints.length === 1 ? '' : 's'}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    {complaints.length === 0 ? (
                      <div className="text-center py-12 border border-dashed border-slate-300 p-6 bg-slate-50">
                        <ShieldCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">No active or historical grievance petitions registered on file.</p>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[34rem] overflow-y-auto pr-1">
                        {complaints.map((c) => (
                          <div key={c._id} className="border-2 border-slate-300 p-3.5 sm:p-4 bg-white space-y-3 border-l-4 border-l-blue-950 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-2 gap-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[9px] font-mono font-bold text-slate-600 uppercase bg-slate-100 border border-slate-300 px-2 py-0.5">
                                  Classification: {c.category}
                                </span>
                                <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                                  Ref: #{String(c._id).substring(String(c._id).length - 6).toUpperCase()}
                                </span>
                              </div>
                              <span className={`text-[8px] font-black px-2.5 py-0.5 uppercase tracking-wider border inline-block ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-950 border-blue-300' : 'bg-red-50 text-red-900 border-red-300'}`}>
                                Status: {c.status}
                              </span>
                            </div>
                            
                            <div>
                              <h3 className="font-black text-xs uppercase font-serif text-slate-950">{c.subject}</h3>
                              <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed whitespace-pre-wrap">{c.description}</p>
                            </div>
                            
                            {/* Actions & Evidence */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                              {c.photoProof ? (
                                <button type="button" onClick={() => setPreviewModalImg(c.photoProof)} className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase bg-slate-100 hover:bg-slate-200 border border-slate-300 px-2 py-1 text-slate-800 transition cursor-pointer">
                                  <Eye className="w-3 h-3 text-blue-950" /><span>Inspect Attachment</span>
                                </button>
                              ) : <div></div>}

                              {c.status === 'Pending' && (
                                <button
                                  type="button"
                                  onClick={() => promptWithdrawComplaint(c._id)}
                                  className="flex items-center gap-1.5 text-[9px] font-mono font-bold uppercase bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-1 text-red-800 transition cursor-pointer"
                                  title="Permanently retract this petition"
                                >
                                  <Trash2 className="w-3 h-3 text-red-700" />
                                  <span>Retract Petition</span>
                                </button>
                              )}
                            </div>

                            {c.adminRemark ? (
                              <div className="bg-slate-50 border-l-4 border-slate-800 p-3 text-[11px] text-slate-800 space-y-0.5">
                                <span className="uppercase font-serif font-black text-blue-950 block text-[9px] tracking-wider">Committee Findings:</span>
                                <p className="font-medium text-slate-700 leading-relaxed">{c.adminRemark}</p>
                              </div>
                            ) : (
                              <div className="bg-slate-50/60 p-2 text-[10px] font-mono text-slate-400 uppercase italic">Awaiting formal review from Magistrate.</div>
                            )}
                            
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono uppercase pt-1 border-t border-slate-100">
                              <span>Lodged: {new Date(c.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
        )}
      </main>

      {/* 5. IMAGE PREVIEW MODAL */}
      {previewModalImg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-4 select-none">
          <div className="bg-white border-2 border-slate-300 shadow-2xl max-w-xl w-full p-3 sm:p-4 space-y-3 mx-2">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-black uppercase text-blue-950 font-serif">Evidentiary Attachment Inspection</span>
              <button type="button" onClick={() => setPreviewModalImg(null)} className="w-7 h-7 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold">✕</button>
            </div>
            <div className="max-h-[70vh] overflow-auto flex items-center justify-center bg-slate-100 p-2 border border-slate-300">
              <img src={previewModalImg} alt="Evidence" className="max-h-full max-w-full object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* 6. CONFIRMATION MODAL */}
      <ConfirmModal 
        isOpen={confirmModal.isOpen} 
        title={confirmModal.title} 
        message={confirmModal.message} 
        onConfirm={confirmModal.onConfirm} 
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
      />
    </div>
  );
}