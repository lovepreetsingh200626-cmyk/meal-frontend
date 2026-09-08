import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import ConfirmModal from '../../components/ConfirmModal';

import {
  MessageSquareWarning,
  Send,
  AlertCircle,
  CheckCircle2,
  FileText,
  Clock3,
  Check,
  Loader2,
  ShieldAlert,
  Landmark,
  ShieldCheck,
  Paperclip,
  Eye,
  X,
  Trash2,
  ClipboardList,
  Utensils,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export default function StudentComplaintsPage({ user }) {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const [previewModalImg, setPreviewModalImg] = useState(null);

  // Form
  const [complaintCategory, setComplaintCategory] =
    useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');

  const userId = user?._id || user?.id || user?.userId;

  const hostelId =
    typeof user?.hostelId === 'object'
      ? user?.hostelId?._id ||
        user?.hostelId?.hostelNumber ||
        'BH1'
      : user?.hostelId || user?.hostelNo || 'BH1';

  const hostelNo =
    user?.hostelNo ||
    user?.hostelId?.hostelNumber ||
    'CAMPUS RESIDENCE';

  // ---------------------------------------------------------
  // FETCH COMPLAINTS
  // ---------------------------------------------------------

  const fetchComplaints = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data } = await API.get(`/complaints/user/${userId}`);

      setComplaints(Array.isArray(data) ? data : []);
      setErrorMsg('');
    } catch (err) {
      console.error('Failed to load complaints:', err);

      setErrorMsg(
        err.response?.data?.message ||
          'Unable to load your grievance records.'
      );
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // ---------------------------------------------------------
  // PHOTO UPLOAD
  // ---------------------------------------------------------

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg(
        'Please select a valid image file such as JPG, PNG, or WebP.'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be 2MB or less.');
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      setComplaintPhoto(reader.result);
      setErrorMsg('');
    };

    reader.readAsDataURL(file);
  };

  // ---------------------------------------------------------
  // SUBMIT COMPLAINT
  // ---------------------------------------------------------

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!complaintSubject.trim()) {
      setErrorMsg('Please enter a complaint subject.');
      return;
    }

    if (!complaintDesc.trim()) {
      setErrorMsg('Please describe your complaint.');
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
        photoProof: complaintPhoto,
      });

      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setComplaintCategory('Food Quality');

      setSuccessMsg(
        'Your complaint has been successfully submitted.'
      );

      await fetchComplaints();

      setTimeout(() => {
        setSuccessMsg('');
      }, 4500);
    } catch (err) {
      console.error('Complaint submission failed:', err);

      setErrorMsg(
        err.response?.data?.message ||
          'Failed to submit your complaint. Please try again.'
      );

      setTimeout(() => {
        setErrorMsg('');
      }, 5000);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  // ---------------------------------------------------------
  // WITHDRAW COMPLAINT
  // ---------------------------------------------------------

  const promptWithdrawComplaint = (complaintId) => {
    setConfirmModal({
      isOpen: true,
      title: 'Withdraw Complaint',
      message:
        'Are you sure you want to withdraw this complaint? This action will permanently remove it from your complaint history.',
      onConfirm: async () => {
        setConfirmModal((prev) => ({
          ...prev,
          isOpen: false,
        }));

        setErrorMsg('');
        setSuccessMsg('');

        try {
          await API.delete(`/complaints/${complaintId}`);

          setComplaints((prev) =>
            prev.filter((c) => c._id !== complaintId)
          );

          setSuccessMsg('Complaint withdrawn successfully.');

          setTimeout(() => {
            setSuccessMsg('');
          }, 4500);
        } catch (err) {
          console.error('Failed to withdraw complaint:', err);

          setErrorMsg(
            err.response?.data?.message ||
              'Failed to withdraw the complaint.'
          );

          setTimeout(() => {
            setErrorMsg('');
          }, 5000);
        }
      },
    });
  };

  // ---------------------------------------------------------
  // COUNTS
  // ---------------------------------------------------------

  const pendingCount = complaints.filter(
    (c) => c.status === 'Pending'
  ).length;

  const inProgressCount = complaints.filter(
    (c) => c.status === 'In Progress'
  ).length;

  const resolvedCount = complaints.filter(
    (c) => c.status === 'Resolved'
  ).length;

  // ---------------------------------------------------------
  // STATUS HELPERS
  // ---------------------------------------------------------

  const getStatusConfig = (status) => {
    if (status === 'Resolved') {
      return {
        label: 'Resolved',
        icon: CheckCircle2,
        wrapper:
          'bg-emerald-50 text-emerald-700 border-emerald-200',
        iconClass: 'text-emerald-600',
      };
    }

    if (status === 'In Progress') {
      return {
        label: 'In Progress',
        icon: Clock3,
        wrapper:
          'bg-blue-50 text-blue-700 border-blue-200',
        iconClass: 'text-blue-600',
      };
    }

    return {
      label: 'Pending',
      icon: Clock3,
      wrapper:
        'bg-amber-50 text-amber-700 border-amber-200',
      iconClass: 'text-amber-600',
    };
  };

  // ---------------------------------------------------------
  // CATEGORY ICON
  // ---------------------------------------------------------

  const getCategoryIcon = (category) => {
    if (category === 'Food Quality') {
      return Utensils;
    }

    if (category === 'Cleanliness') {
      return Sparkles;
    }

    return ClipboardList;
  };

  // ---------------------------------------------------------
  // LOADING
  // ---------------------------------------------------------

  if (loading) {
    return (
      <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 px-2.5 sm:px-4 py-3 sm:py-8">
        <div className="max-w-6xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm min-h-[45vh] sm:min-h-[55vh] flex flex-col items-center justify-center p-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3 sm:mb-4">
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700 animate-spin" />
            </div>

            <p className="text-sm font-semibold text-slate-800">
              Loading complaints
            </p>

            <p className="text-[11px] sm:text-xs text-slate-500 mt-1 text-center">
              Please wait while we retrieve your records.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------
  // MAIN UI
  // ---------------------------------------------------------

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-50 text-slate-900 pb-8 sm:pb-12">
      <main className="w-full max-w-6xl mx-auto px-2.5 sm:px-5 lg:px-6 py-3 sm:py-7 space-y-3 sm:space-y-5">

        {/* =====================================================
            PAGE HEADER
        ====================================================== */}

        <section className="w-full min-w-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">
          <div className="h-0.5 sm:h-1 bg-blue-900" />

          <div className="p-3 sm:p-6">

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">

              <div className="flex items-start gap-2.5 sm:gap-4 min-w-0">

                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                  <MessageSquareWarning className="w-4.5 h-4.5 sm:w-6 sm:h-6 text-blue-800" />
                </div>

                <div className="min-w-0">

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100 text-[8px] sm:text-[10px] font-bold uppercase tracking-wide">
                      <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      Student Support
                    </span>
                  </div>

                  <h1 className="text-base sm:text-2xl font-bold text-slate-900 mt-1.5 sm:mt-2 leading-tight">
                    Complaints &amp; Grievances
                  </h1>

                  <p className="text-[10px] sm:text-sm text-slate-500 mt-0.5 sm:mt-1 leading-relaxed">
                    Submit, track and manage your mess-related complaints.
                  </p>

                </div>
              </div>

              <button
                type="button"
                onClick={fetchComplaints}
                className="self-stretch sm:self-center inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-3.5 sm:py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[10px] sm:text-xs font-semibold text-slate-700 transition"
              >
                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                Refresh
              </button>
            </div>

            {/* STUDENT INFO */}
            <div className="mt-3.5 sm:mt-5 pt-3 sm:pt-4 border-t border-slate-100 grid grid-cols-3 gap-2.5 sm:gap-3">

              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Student
                </p>

                <p className="text-[11px] sm:text-sm font-semibold text-slate-800 mt-0.5 truncate">
                  {user?.name || 'Student'}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Roll No.
                </p>

                <p className="text-[11px] sm:text-sm font-semibold text-slate-800 mt-0.5 truncate">
                  {user?.rollNo || 'N/A'}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Residence
                </p>

                <p className="text-[11px] sm:text-sm font-semibold text-slate-800 mt-0.5 truncate">
                  {hostelNo}
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* =====================================================
            STAT CARDS
        ====================================================== */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">

          {/* TOTAL */}
          <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-1">

              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <ClipboardList className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
              </div>

              <span className="text-[8px] sm:text-[10px] font-bold uppercase text-slate-400">
                Total
              </span>

            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 sm:mt-3">
              {complaints.length}
            </p>

            <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Submitted complaints
            </p>
          </div>

          {/* PENDING */}
          <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-1">

              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                <Clock3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
              </div>

              <span className="text-[8px] sm:text-[10px] font-bold uppercase text-amber-600">
                Pending
              </span>

            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 sm:mt-3">
              {pendingCount}
            </p>

            <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Awaiting review
            </p>
          </div>

          {/* ACTIVE */}
          <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-1">

              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Clock3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              </div>

              <span className="text-[8px] sm:text-[10px] font-bold uppercase text-blue-600">
                Active
              </span>

            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 sm:mt-3">
              {inProgressCount}
            </p>

            <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Being reviewed
            </p>
          </div>

          {/* RESOLVED */}
          <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl p-2.5 sm:p-4 shadow-sm min-w-0">
            <div className="flex items-center justify-between gap-1">

              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
              </div>

              <span className="text-[8px] sm:text-[10px] font-bold uppercase text-emerald-600">
                Resolved
              </span>

            </div>

            <p className="text-xl sm:text-2xl font-bold text-slate-900 mt-2 sm:mt-3">
              {resolvedCount}
            </p>

            <p className="text-[9px] sm:text-xs text-slate-500 mt-0.5 truncate">
              Successfully resolved
            </p>
          </div>

        </section>

        {/* =====================================================
            ALERTS
        ====================================================== */}

        {errorMsg && (
          <div className="w-full min-w-0 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 flex items-start gap-2 sm:gap-3">

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold text-red-800">
                Unable to complete request
              </p>

              <p className="text-[10px] sm:text-xs text-red-700 mt-0.5 break-words leading-relaxed">
                {errorMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="ml-auto shrink-0 text-red-400 hover:text-red-600 p-0.5"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="w-full min-w-0 bg-emerald-50 border border-emerald-200 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 flex items-start gap-2 sm:gap-3">

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-800">
                Request successful
              </p>

              <p className="text-[10px] sm:text-xs text-emerald-700 mt-0.5 break-words leading-relaxed">
                {successMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-600 p-0.5"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        )}

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <section className="w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-5 items-start">

          {/* ===================================================
              FORM
          ==================================================== */}

          <div className="lg:col-span-5 w-full min-w-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">

            <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center gap-2.5 sm:gap-3">

              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
              </div>

              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                  Submit a Complaint
                </h2>

                <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">
                  Tell us about a mess-related issue.
                </p>
              </div>

            </div>

            <form
              onSubmit={handleComplaintSubmit}
              className="p-3 sm:p-5 space-y-3 sm:space-y-4"
            >

              {/* INFO */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg sm:rounded-xl p-2.5 sm:p-3.5 flex gap-2 sm:gap-3">

                <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700 shrink-0 mt-0.5" />

                <div className="min-w-0">
                  <p className="text-[10px] sm:text-xs font-semibold text-blue-900">
                    Before submitting
                  </p>

                  <p className="text-[9px] sm:text-[11px] leading-relaxed text-blue-800 mt-0.5">
                    Please provide clear and factual information so the
                    mess administration can review your complaint quickly.
                  </p>
                </div>

              </div>

              {/* CATEGORY */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
                  Complaint Category
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <select
                  value={complaintCategory}
                  onChange={(e) =>
                    setComplaintCategory(e.target.value)
                  }
                  className="w-full min-w-0 bg-white border border-slate-300 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                >
                  <option value="Food Quality">
                    Food Quality &amp; Preparation
                  </option>

                  <option value="Cleanliness">
                    Cleanliness &amp; Hygiene
                  </option>

                  <option value="Timing">
                    Serving Hours &amp; Timing
                  </option>

                  <option value="Staff Behavior">
                    Staff Behaviour
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>

              {/* SUBJECT */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
                  Subject
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <input
                  required
                  type="text"
                  maxLength={120}
                  placeholder="Briefly describe the issue"
                  value={complaintSubject}
                  onChange={(e) =>
                    setComplaintSubject(e.target.value)
                  }
                  className="w-full min-w-0 bg-white border border-slate-300 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>

              {/* DESCRIPTION */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
                  Description
                  <span className="text-red-500 ml-1">*</span>
                </label>

                <textarea
                  required
                  rows={5}
                  maxLength={1500}
                  placeholder="Explain what happened, when it happened, and any relevant details..."
                  value={complaintDesc}
                  onChange={(e) =>
                    setComplaintDesc(e.target.value)
                  }
                  className="w-full min-w-0 bg-white border border-slate-300 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 transition resize-none"
                />

                <p className="text-[8px] sm:text-[10px] text-slate-400 text-right mt-1">
                  {complaintDesc.length}/1500
                </p>
              </div>

              {/* PHOTO */}
              <div>
                <label className="block text-[10px] sm:text-xs font-semibold text-slate-700 mb-1 sm:mb-1.5">
                  Photo Evidence
                  <span className="text-slate-400 font-normal ml-1">
                    (Optional)
                  </span>
                </label>

                <div className="border border-dashed border-slate-300 rounded-lg sm:rounded-xl p-2.5 sm:p-3 bg-slate-50">

                  <div className="flex flex-wrap items-center gap-2 sm:gap-3">

                    <label className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[10px] sm:text-xs font-semibold text-slate-700 cursor-pointer transition">

                      <Paperclip className="w-3 h-3 sm:w-3.5 sm:h-3.5" />

                      {complaintPhoto
                        ? 'Change Photo'
                        : 'Attach Photo'}

                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handlePhotoUpload}
                      />

                    </label>

                    {complaintPhoto && (
                      <>
                        <span className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          Photo attached
                        </span>

                        <button
                          type="button"
                          onClick={() => setComplaintPhoto('')}
                          className="text-[10px] sm:text-xs font-semibold text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </>
                    )}

                  </div>

                  <p className="text-[8px] sm:text-[10px] text-slate-400 mt-1.5 sm:mt-2">
                    JPG, PNG or WebP • Maximum 2MB
                  </p>

                </div>
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={submittingComplaint}
                className="w-full min-h-10 sm:min-h-0 inline-flex items-center justify-center gap-1.5 sm:gap-2 bg-blue-900 hover:bg-blue-800 disabled:bg-blue-900/60 text-white rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed"
              >
                {submittingComplaint ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                    Submitting Complaint...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Submit Complaint
                  </>
                )}
              </button>

            </form>
          </div>

          {/* ===================================================
              COMPLAINT HISTORY
          ==================================================== */}

          <div className="lg:col-span-7 w-full min-w-0 bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">

            <div className="px-3 py-3 sm:px-5 sm:py-4 border-b border-slate-100 flex items-center justify-between gap-2">

              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">

                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                  <MessageSquareWarning className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-700" />
                </div>

                <div className="min-w-0">
                  <h2 className="text-xs sm:text-sm font-bold text-slate-900">
                    My Complaints
                  </h2>

                  <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5">
                    Track your submitted complaints.
                  </p>
                </div>

              </div>

              <span className="shrink-0 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 text-slate-600 text-[8px] sm:text-[10px] font-bold">
                {complaints.length} record
                {complaints.length === 1 ? '' : 's'}
              </span>

            </div>

            <div className="p-3 sm:p-5">

              {complaints.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-lg sm:rounded-xl bg-slate-50 py-10 sm:py-14 px-4 sm:px-5 text-center">

                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center mx-auto mb-2.5 sm:mb-3">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-slate-300" />
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-700">
                    No complaints yet
                  </p>

                  <p className="text-[10px] sm:text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    Your submitted complaints will appear here along
                    with their current status and responses.
                  </p>

                </div>
              ) : (
                <div className="space-y-2.5 sm:space-y-3 max-h-[38rem] overflow-y-auto pr-0.5 sm:pr-1">

                  {complaints.map((c) => {
                    const status = getStatusConfig(c.status);
                    const StatusIcon = status.icon;

                    const CategoryIcon =
                      getCategoryIcon(c.category);

                    return (
                      <article
                        key={c._id}
                        className="w-full min-w-0 border border-slate-200 rounded-lg sm:rounded-xl p-3 sm:p-4 bg-white hover:border-slate-300 hover:shadow-sm transition"
                      >

                        {/* TOP */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3">

                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                              <span className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md bg-slate-100 text-slate-600 text-[8px] sm:text-[10px] font-semibold max-w-full">

                                <CategoryIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />

                                <span className="truncate">
                                  {c.category}
                                </span>

                              </span>

                              <span className="text-[8px] sm:text-[10px] font-mono text-slate-400">
                                #{String(c._id)
                                  .slice(-6)
                                  .toUpperCase()}
                              </span>

                            </div>

                            <h3 className="text-xs sm:text-sm font-bold text-slate-900 mt-1.5 sm:mt-2 break-words leading-snug">
                              {c.subject}
                            </h3>

                          </div>

                          {/* STATUS */}
                          <span
                            className={`inline-flex items-center gap-1 self-start px-2 py-1 sm:px-2.5 sm:py-1 rounded-full border text-[8px] sm:text-[10px] font-bold whitespace-nowrap ${status.wrapper}`}
                          >
                            <StatusIcon
                              className={`w-2.5 h-2.5 sm:w-3 sm:h-3 ${status.iconClass}`}
                            />

                            {status.label}
                          </span>

                        </div>

                        {/* DESCRIPTION */}
                        <p className="text-[10px] sm:text-sm text-slate-600 leading-relaxed mt-2.5 sm:mt-3 whitespace-pre-wrap break-words">
                          {c.description}
                        </p>

                        {/* ADMIN RESPONSE */}
                        {c.adminRemark ? (
                          <div className="mt-3 sm:mt-4 bg-blue-50 border border-blue-100 rounded-lg p-2.5 sm:p-3">

                            <p className="text-[8px] sm:text-[10px] font-bold uppercase tracking-wide text-blue-800">
                              Administration Response
                            </p>

                            <p className="text-[10px] sm:text-xs text-blue-900 leading-relaxed mt-1 break-words">
                              {c.adminRemark}
                            </p>

                          </div>
                        ) : (
                          <div className="mt-3 sm:mt-4 bg-slate-50 border border-slate-100 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5">

                            <p className="text-[9px] sm:text-[11px] text-slate-500 leading-relaxed">
                              Your complaint is awaiting an administrative response.
                            </p>

                          </div>
                        )}

                        {/* FOOTER */}
                        <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 sm:gap-3">

                          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[8px] sm:text-[10px] text-slate-400">

                            <span>
                              Submitted:{' '}
                              {c.createdAt
                                ? new Date(
                                    c.createdAt
                                  ).toLocaleDateString()
                                : 'N/A'}
                            </span>

                            {c.photoProof && (
                              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                                <Paperclip className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Evidence attached
                              </span>
                            )}

                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                            {c.photoProof && (
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModalImg(
                                    c.photoProof
                                  )
                                }
                                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[8px] sm:text-[10px] font-semibold transition"
                              >
                                <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                View Photo
                              </button>
                            )}

                            {c.status === 'Pending' && (
                              <button
                                type="button"
                                onClick={() =>
                                  promptWithdrawComplaint(
                                    c._id
                                  )
                                }
                                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-700 text-[8px] sm:text-[10px] font-semibold transition"
                              >
                                <Trash2 className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                Withdraw
                              </button>
                            )}

                          </div>
                        </div>

                      </article>
                    );
                  })}

                </div>
              )}

            </div>
          </div>

        </section>

        {/* =====================================================
            FOOTNOTE
        ====================================================== */}

        <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px] text-slate-400 px-2 text-center">
          <Landmark className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />

          <span>
            Student Mess Grievance &amp; Support System
          </span>
        </div>

      </main>

      {/* =====================================================
          IMAGE PREVIEW
      ====================================================== */}

      {previewModalImg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-2.5 sm:p-5 overflow-y-auto"
          onClick={() => setPreviewModalImg(null)}
        >

          <div
            className="bg-white rounded-xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="px-3 py-2.5 sm:px-4 sm:py-3 border-b border-slate-200 flex items-center justify-between gap-3">

              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-slate-900">
                  Complaint Evidence
                </p>

                <p className="text-[9px] sm:text-[11px] text-slate-500 truncate">
                  Attached photographic evidence
                </p>
              </div>

              <button
                type="button"
                onClick={() => setPreviewModalImg(null)}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition shrink-0"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </div>

            <div className="bg-slate-100 p-2.5 sm:p-5 max-h-[80vh] overflow-auto flex items-center justify-center">

              <img
                src={previewModalImg}
                alt="Complaint evidence"
                className="max-w-full max-h-[72vh] object-contain rounded-lg"
              />

            </div>

          </div>
        </div>
      )}

      {/* =====================================================
          CONFIRM MODAL
      ====================================================== */}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onClose={() =>
          setConfirmModal((prev) => ({
            ...prev,
            isOpen: false,
          }))
        }
      />

    </div>
  );
}