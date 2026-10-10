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
  Lock,
  UserRound,
  Info,
  BriefcaseBusiness,
  IndianRupee,
  FileCheck2,
  Percent,
  Award
} from 'lucide-react';

export default function StudentProfile({
  user,
  onUpdateSuccess,
  onBack
}) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // =========================================================
  // 1-TIME CHANGE LOCKS
  // =========================================================

  const isMobileLocked = Boolean(
    user?.isMobileLocked || user?.mobileChanged
  );

  const isEmailLocked = Boolean(
    user?.isEmailLocked || user?.emailChanged
  );

  // =========================================================
  // FORM DATA
  // =========================================================

  const [formData, setFormData] = useState({
    // -------------------------------------------------------
    // PERSONAL
    // -------------------------------------------------------
    name: user?.name || '',
    fatherName: user?.fatherName || '',
    motherName: user?.motherName || '',
    gender: user?.gender || 'Male',
    mobileNo: user?.mobileNo || '',
    dob: user?.dob || '',
    nationality: user?.nationality || 'India',
    profilePhoto: user?.profilePhoto || '',
    email: user?.email || '',

    // -------------------------------------------------------
    // IDENTIFICATION
    // -------------------------------------------------------
    studentId: user?.studentId || '',
    rollNo: user?.rollNo || '',
    hostelNo: user?.hostelNo || '',

    // -------------------------------------------------------
    // ACADEMIC
    // -------------------------------------------------------
    university: user?.university || '',
    department: user?.department || '',
    facultyName: user?.facultyName || user?.faculty || '',
    session: user?.session || '',
    currentYear: user?.currentYear || '',
    currentSemester: user?.currentSemester || '',

    // -------------------------------------------------------
    // PREVIOUS QUALIFICATION
    // -------------------------------------------------------
    previousQualification: user?.previousQualification || '',
    previousQualificationYear:
      user?.previousQualificationYear || '',
    previousPercentage:
      user?.previousPercentage ?? '',
    previousCgpa:
      user?.previousCgpa ?? '',

    // -------------------------------------------------------
    // CURRENT PERFORMANCE
    // -------------------------------------------------------
    percentage: user?.percentage ?? '',
    cgpa: user?.cgpa ?? '',

    // -------------------------------------------------------
    // STUDENT DEMOGRAPHIC
    // -------------------------------------------------------
    domicileState: user?.domicileState || 'Punjab',
    category: user?.category || 'General',

    // -------------------------------------------------------
    // FAMILY
    // -------------------------------------------------------
    parentOccupation: user?.parentOccupation || '',

    // -------------------------------------------------------
    // FINANCIAL
    // -------------------------------------------------------
    annualFamilyIncome:
      user?.annualFamilyIncome ?? '',
    incomeCertificateNumber:
      user?.incomeCertificateNumber || '',
    incomeCertificateDate:
      user?.incomeCertificateDate || ''
  });

  // =========================================================
  // ERROR HELPER
  // =========================================================

  const showError = (message) => {
    setErrorMsg(message);
    setSuccessMsg('');

    setTimeout(() => {
      setErrorMsg('');
    }, 5000);
  };

  // =========================================================
  // SUCCESS HELPER
  // =========================================================

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
  };

  // =========================================================
  // PHOTO UPLOAD + COMPRESSION
  // =========================================================

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showError(
        'Please upload a valid image file such as JPG, PNG or WebP.'
      );
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showError('Image size must be less than 2MB.');
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
            height =
              height * (MAX_DIMENSION / width);

            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width =
              width * (MAX_DIMENSION / height);

            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');

        if (!ctx) {
          showError(
            'Unable to process the selected image.'
          );
          return;
        }

        ctx.drawImage(
          img,
          0,
          0,
          width,
          height
        );

        const compressedBase64 =
          canvas.toDataURL(
            'image/jpeg',
            0.85
          );

        setFormData((prev) => ({
          ...prev,
          profilePhoto: compressedBase64
        }));

        showSuccess(
          'Profile photo selected successfully.'
        );
      };

      img.onerror = () => {
        showError(
          'Unable to read this image. Please try another photo.'
        );
      };
    };

    reader.onerror = () => {
      showError(
        'Unable to read the selected file.'
      );
    };

    reader.readAsDataURL(file);
  };

  // =========================================================
  // FORM CHANGE
  // =========================================================

  const updateField = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // =========================================================
  // NUMBER FIELD HELPERS
  // =========================================================

  const handleNumberChange = (
    field,
    value,
    maxLength = null
  ) => {
    let cleanValue = value.replace(/[^\d.]/g, '');

    const parts = cleanValue.split('.');

    if (parts.length > 2) {
      cleanValue =
        parts[0] + '.' + parts.slice(1).join('');
    }

    if (maxLength) {
      cleanValue =
        cleanValue.substring(0, maxLength);
    }

    updateField(field, cleanValue);
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const userId =
      user?._id ||
      user?.id ||
      user?.userId;

    if (!userId) {
      showError(
        'Session error: User ID was not found. Please log in again.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // NAME VALIDATION
    // =======================================================

    const cleanName =
      formData.name.trim();

    if (
      !cleanName ||
      !/^[a-zA-Z\s.]{2,}$/.test(cleanName)
    ) {
      showError(
        'Please enter a valid name using letters only.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // MOBILE VALIDATION
    // =======================================================

    if (
      !/^\d{10}$/.test(
        formData.mobileNo
      )
    ) {
      showError(
        'Mobile number must contain exactly 10 digits.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // EMAIL VALIDATION
    // =======================================================

    const cleanEmail =
      formData.email.trim();

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        cleanEmail
      )
    ) {
      showError(
        'Please enter a valid email address.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // MOBILE LOCK VALIDATION
    // =======================================================

    if (
      isMobileLocked &&
      formData.mobileNo !==
        (user?.mobileNo || '')
    ) {
      showError(
        'Your mobile number is locked and cannot be changed again.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // EMAIL LOCK VALIDATION
    // =======================================================

    if (
      isEmailLocked &&
      cleanEmail !==
        (user?.email || '')
    ) {
      showError(
        'Your email address is locked and cannot be changed again.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // CHECK EDITS
    // =======================================================

    const mobileEdited =
      formData.mobileNo !==
      (user?.mobileNo || '');

    const emailEdited =
      cleanEmail !==
      (user?.email || '');

    // =======================================================
    // ACADEMIC VALIDATION
    // =======================================================

    if (
      formData.currentYear !== '' &&
      (
        Number.isNaN(
          Number(formData.currentYear)
        ) ||
        Number(formData.currentYear) < 1
      )
    ) {
      showError(
        'Current academic year must be a valid number.'
      );

      setLoading(false);
      return;
    }

    if (
      formData.currentSemester !== '' &&
      (
        Number.isNaN(
          Number(formData.currentSemester)
        ) ||
        Number(formData.currentSemester) < 1
      )
    ) {
      showError(
        'Current semester must be a valid number.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // PREVIOUS PERCENTAGE
    // =======================================================

    if (
      formData.previousPercentage !== '' &&
      (
        Number(formData.previousPercentage) < 0 ||
        Number(formData.previousPercentage) > 100
      )
    ) {
      showError(
        'Previous percentage must be between 0 and 100.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // PREVIOUS CGPA
    // =======================================================

    if (
      formData.previousCgpa !== '' &&
      (
        Number(formData.previousCgpa) < 0 ||
        Number(formData.previousCgpa) > 10
      )
    ) {
      showError(
        'Previous CGPA must be between 0 and 10.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // CURRENT PERCENTAGE
    // =======================================================

    if (
      formData.percentage !== '' &&
      (
        Number(formData.percentage) < 0 ||
        Number(formData.percentage) > 100
      )
    ) {
      showError(
        'Current percentage must be between 0 and 100.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // CURRENT CGPA
    // =======================================================

    if (
      formData.cgpa !== '' &&
      (
        Number(formData.cgpa) < 0 ||
        Number(formData.cgpa) > 10
      )
    ) {
      showError(
        'Current CGPA must be between 0 and 10.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // FAMILY INCOME
    // =======================================================

    if (
      formData.annualFamilyIncome !== '' &&
      Number(formData.annualFamilyIncome) < 0
    ) {
      showError(
        'Annual family income cannot be negative.'
      );

      setLoading(false);
      return;
    }

    // =======================================================
    // PAYLOAD
    // =======================================================

    const submissionPayload = {
      ...formData,

      name: cleanName,
      email: cleanEmail,

      // Permanently lock after first successful change.
      isMobileLocked:
        isMobileLocked || mobileEdited,

      isEmailLocked:
        isEmailLocked || emailEdited,

      // Convert numeric fields to numbers
      // when values are provided.
      currentYear:
        formData.currentYear === ''
          ? ''
          : Number(formData.currentYear),

      currentSemester:
        formData.currentSemester === ''
          ? ''
          : Number(formData.currentSemester),

      previousQualificationYear:
        formData.previousQualificationYear === ''
          ? ''
          : Number(
              formData.previousQualificationYear
            ),

      previousPercentage:
        formData.previousPercentage === ''
          ? ''
          : Number(
              formData.previousPercentage
            ),

      previousCgpa:
        formData.previousCgpa === ''
          ? ''
          : Number(formData.previousCgpa),

      percentage:
        formData.percentage === ''
          ? ''
          : Number(formData.percentage),

      cgpa:
        formData.cgpa === ''
          ? ''
          : Number(formData.cgpa),

      annualFamilyIncome:
        formData.annualFamilyIncome === ''
          ? ''
          : Number(
              formData.annualFamilyIncome
            )
    };

    // =======================================================
    // API REQUEST
    // =======================================================

    try {
      const { data } =
        await API.put(
          `/auth/profile/${userId}`,
          submissionPayload
        );

      const updatedUser =
        data?.user ||
        data?.updatedUser ||
        submissionPayload;

      showSuccess(
        'Your profile has been updated successfully.'
      );

      setTimeout(() => {
        if (onUpdateSuccess) {
          onUpdateSuccess(updatedUser);
        }
      }, 1200);
    } catch (err) {
      showError(
        err?.response?.data?.message ||
        'Unable to update your profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // READ ONLY FIELD
  // =========================================================

  const ReadOnlyField = ({
    label,
    value,
    icon: Icon,
    fullWidth = false
  }) => (
    <div
      className={
        fullWidth
          ? 'sm:col-span-2'
          : ''
      }
    >
      <label className="block text-xs font-semibold text-slate-500 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          type="text"
          value={
            value !== undefined &&
            value !== null &&
            value !== ''
              ? value
              : 'Not available'
          }
          disabled
          className="
            w-full
            bg-slate-100
            border border-slate-200
            rounded-xl
            py-3
            pl-10
            pr-4
            text-sm
            text-slate-600
            cursor-not-allowed
            font-medium
            outline-none
          "
        />
      </div>
    </div>
  );

  // =========================================================
  // EDITABLE TEXT FIELD
  // =========================================================

  const EditableField = ({
    label,
    value,
    field,
    icon: Icon,
    type = 'text',
    placeholder = '',
    required = false
  }) => (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5">
        {label}
      </label>

      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />

        <input
          required={required}
          type={type}
          value={value}
          onChange={(e) =>
            updateField(
              field,
              e.target.value
            )
          }
          placeholder={placeholder}
          className="
            w-full
            bg-white
            border border-slate-300
            rounded-xl
            py-3
            pl-10
            pr-4
            text-sm
            text-slate-900
            font-medium
            outline-none
            transition
            focus:border-blue-600
            focus:ring-2
            focus:ring-blue-100
          "
        />
      </div>
    </div>
  );

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">

      {/* =====================================================
          TOP HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex items-center gap-3">

            <div className="
              w-10
              h-10
              rounded-xl
              bg-blue-700
              flex
              items-center
              justify-center
              shadow-sm
            ">
              <Building className="w-5 h-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">
                Hostel & Mess Management
              </p>

              <p className="text-xs text-slate-500">
                Guru Nanak Dev University, Amritsar
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

        {/* BACK */}

        <button
          type="button"
          onClick={onBack}
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-600
            hover:text-blue-700
            transition
            mb-6
          "
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* PAGE TITLE */}

        <div className="mb-6">

          <div className="flex items-center gap-3 mb-2">

            <div className="
              w-11
              h-11
              rounded-xl
              bg-blue-50
              border
              border-blue-100
              flex
              items-center
              justify-center
            ">
              <UserRound className="w-5 h-5 text-blue-700" />
            </div>

            <div>

              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Student Profile
              </h1>

              <p className="text-sm text-slate-500 mt-0.5">
                Manage your personal information and maintain
                your institutional profile.
              </p>

            </div>

          </div>

        </div>

        {/* ===================================================
            PROFILE CARD
        =================================================== */}

        <div className="
          bg-white
          border border-slate-200
          rounded-2xl
          shadow-sm
          overflow-hidden
        ">

          {/* =================================================
              PROFILE HEADER
          ================================================= */}

          <div className="
            px-5
            sm:px-8
            py-6
            border-b
            border-slate-200
            bg-slate-50/70
          ">

            <div className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              gap-5
            ">

              {/* AVATAR */}

              <div className="relative group shrink-0">

                <div className="
                  w-24
                  h-24
                  rounded-full
                  overflow-hidden
                  bg-white
                  border-4
                  border-white
                  ring-1
                  ring-slate-200
                  shadow-sm
                  flex
                  items-center
                  justify-center
                ">

                  {formData.profilePhoto ? (
                    <img
                      src={formData.profilePhoto}
                      alt="Student profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}

                </div>

                <label className="
                  absolute
                  inset-0
                  rounded-full
                  bg-slate-900/70
                  text-white
                  flex
                  flex-col
                  items-center
                  justify-center
                  opacity-0
                  group-hover:opacity-100
                  transition
                  cursor-pointer
                ">

                  <ImagePlus className="w-5 h-5" />

                  <span className="text-[10px] font-semibold mt-1">
                    Change photo
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />

                </label>

              </div>

              {/* PROFILE SUMMARY */}

              <div className="flex-1">

                <h2 className="text-lg font-bold text-slate-900">
                  {formData.name || 'Student'}
                </h2>

                <div className="flex flex-wrap items-center gap-2 mt-2">

                  <span className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    rounded-lg
                    bg-blue-50
                    border border-blue-100
                    text-xs
                    font-semibold
                    text-blue-700
                  ">
                    <IdCard className="w-3.5 h-3.5" />
                    {formData.studentId ||
                      'Student ID unavailable'}
                  </span>

                  <span className="
                    inline-flex
                    items-center
                    gap-1.5
                    px-2.5
                    py-1
                    rounded-lg
                    bg-slate-100
                    border border-slate-200
                    text-xs
                    font-semibold
                    text-slate-600
                  ">
                    <Building className="w-3.5 h-3.5" />
                    {formData.hostelNo ||
                      'Hostel unavailable'}
                  </span>

                </div>

                <p className="text-xs text-slate-500 mt-3">
                  JPG, PNG or WebP • Maximum file size 2MB
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              NOTICES
          ================================================= */}

          <div className="px-5 sm:px-8 pt-6">

            {/* INSTITUTIONAL */}

            <div className="
              flex
              gap-3
              p-4
              rounded-xl
              bg-blue-50
              border
              border-blue-100
              text-blue-900
            ">

              <ShieldAlert className="
                w-5
                h-5
                text-blue-700
                shrink-0
                mt-0.5
              " />

              <div>

                <p className="text-sm font-semibold">
                  Institutional records
                </p>

                <p className="
                  text-xs
                  sm:text-sm
                  text-blue-800/80
                  mt-1
                  leading-relaxed
                ">
                  Student ID, roll number, hostel assignment,
                  academic programme, category, domicile and
                  institutional records are
                  maintained as official student records.
                </p>

              </div>

            </div>

            {/* SECURITY */}

            <div className="
              flex
              gap-3
              p-4
              rounded-xl
              bg-amber-50
              border
              border-amber-100
              text-amber-900
              mt-3
            ">

              <Info className="
                w-5
                h-5
                text-amber-700
                shrink-0
                mt-0.5
              " />

              <div>

                <p className="text-sm font-semibold">
                  Contact information security
                </p>

                <p className="
                  text-xs
                  sm:text-sm
                  text-amber-800/80
                  mt-1
                  leading-relaxed
                ">
                  Mobile number and email address can each be
                  changed only once. After a successful change,
                  that field becomes permanently locked.
                </p>

              </div>

            </div>

          </div>

          {/* =================================================
              MESSAGES
          ================================================= */}

          {(errorMsg || successMsg) && (
            <div className="px-5 sm:px-8 pt-5">

              {errorMsg && (
                <div className="
                  flex
                  items-start
                  gap-3
                  p-4
                  rounded-xl
                  bg-rose-50
                  border
                  border-rose-200
                  text-rose-800
                ">

                  <AlertCircle className="
                    w-5
                    h-5
                    text-rose-600
                    shrink-0
                    mt-0.5
                  " />

                  <div>

                    <p className="text-sm font-semibold">
                      Update could not be completed
                    </p>

                    <p className="text-sm mt-0.5">
                      {errorMsg}
                    </p>

                  </div>

                </div>
              )}

              {successMsg && (
                <div className="
                  flex
                  items-start
                  gap-3
                  p-4
                  rounded-xl
                  bg-emerald-50
                  border
                  border-emerald-200
                  text-emerald-800
                ">

                  <CheckCircle2 className="
                    w-5
                    h-5
                    text-emerald-600
                    shrink-0
                    mt-0.5
                  " />

                  <div>

                    <p className="text-sm font-semibold">
                      Profile updated
                    </p>

                    <p className="text-sm mt-0.5">
                      {successMsg}
                    </p>

                  </div>

                </div>
              )}

            </div>
          )}

          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleSubmit}
            className="p-5 sm:p-8 space-y-8"
          >

            {/* =================================================
                STUDENT IDENTIFICATION
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <ShieldCheck className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Student Identification
                  </h3>

                  <p className="text-xs text-slate-500">
                    University-managed information
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Student ID"
                  value={formData.studentId}
                  icon={IdCard}
                />

                <ReadOnlyField
                  label="Roll Number"
                  value={formData.rollNo}
                  icon={ShieldCheck}
                />

                <ReadOnlyField
                  label="Hostel"
                  value={formData.hostelNo}
                  icon={Building}
                />

              </div>

            </section>

            {/* =================================================
                ACADEMIC INFORMATION
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <GraduationCap className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Academic Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your current academic details
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Faculty"
                  value={formData.facultyName}
                  icon={Compass}
                  fullWidth
                />

                <ReadOnlyField
                  label="Course / Degree Programme"
                  value={formData.university}
                  icon={GraduationCap}
                  fullWidth
                />

                <ReadOnlyField
                  label="Department"
                  value={formData.department}
                  icon={BookOpen}
                />

                <ReadOnlyField
                  label="Academic Session"
                  value={formData.session}
                  icon={Layers}
                />

                <ReadOnlyField
                  label="Current Year"
                  value={formData.currentYear}
                  icon={Award}
                />

                <ReadOnlyField
                  label="Current Semester"
                  value={formData.currentSemester}
                  icon={Layers}
                />

              </div>

            </section>

            {/* =================================================
                PREVIOUS QUALIFICATION
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <FileCheck2 className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Previous Qualification
                  </h3>

                  <p className="text-xs text-slate-500">
                    Your previous qualification details
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Previous Qualification"
                  value={
                    formData.previousQualification
                  }
                  icon={GraduationCap}
                />

                <ReadOnlyField
                  label="Qualification Year"
                  value={
                    formData.previousQualificationYear
                  }
                  icon={Calendar}
                />

                <ReadOnlyField
                  label="Previous Percentage"
                  value={
                    formData.previousPercentage !== ''
                      ? `${formData.previousPercentage}%`
                      : ''
                  }
                  icon={Percent}
                />

                <ReadOnlyField
                  label="Previous CGPA"
                  value={formData.previousCgpa}
                  icon={Award}
                />

              </div>

            </section>

            {/* =================================================
                CURRENT ACADEMIC PERFORMANCE
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <Award className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Current Academic Performance
                  </h3>

                  <p className="text-xs text-slate-500">
                    Current academic record used for eligibility checks
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Current Percentage"
                  value={
                    formData.percentage !== ''
                      ? `${formData.percentage}%`
                      : ''
                  }
                  icon={Percent}
                />

                <ReadOnlyField
                  label="Current CGPA"
                  value={formData.cgpa}
                  icon={Award}
                />

              </div>

            </section>

            {/* =================================================
                FAMILY & DEMOGRAPHIC
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <Users className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Family & Demographic Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Official student demographic information
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Father's Name"
                  value={formData.fatherName}
                  icon={User}
                />

                <ReadOnlyField
                  label="Mother's Name"
                  value={formData.motherName}
                  icon={Users}
                />

                <ReadOnlyField
                  label="Nationality"
                  value={formData.nationality}
                  icon={Globe}
                />

                <ReadOnlyField
                  label="Domicile State"
                  value={formData.domicileState}
                  icon={MapPin}
                />

                <ReadOnlyField
                  label="Category"
                  value={formData.category}
                  icon={Layers}
                />

                <ReadOnlyField
                  label="Parent Occupation"
                  value={formData.parentOccupation}
                  icon={BriefcaseBusiness}
                />

              </div>

            </section>

            {/* =================================================
                FAMILY FINANCIAL INFORMATION
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-slate-100
                  flex
                  items-center
                  justify-center
                ">
                  <IndianRupee className="w-4 h-4 text-slate-600" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Family Financial Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    Optional family financial information
                  </p>

                </div>

              </div>

              <div className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              ">

                <ReadOnlyField
                  label="Annual Family Income"
                  value={
                    formData.annualFamilyIncome !== ''
                      ? `₹ ${Number(
                          formData.annualFamilyIncome
                        ).toLocaleString('en-IN')}`
                      : ''
                  }
                  icon={IndianRupee}
                />

                <ReadOnlyField
                  label="Income Certificate Number"
                  value={
                    formData.incomeCertificateNumber
                  }
                  icon={FileCheck2}
                />

                <ReadOnlyField
                  label="Income Certificate Date"
                  value={
                    formData.incomeCertificateDate
                  }
                  icon={Calendar}
                />

              </div>

            </section>

            {/* =================================================
                EDITABLE PERSONAL INFORMATION
            ================================================= */}

            <section>

              <div className="flex items-center gap-2 mb-4">

                <div className="
                  w-8
                  h-8
                  rounded-lg
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                ">
                  <UserRound className="w-4 h-4 text-blue-700" />
                </div>

                <div>

                  <h3 className="text-sm font-bold text-slate-900">
                    Personal Information
                  </h3>

                  <p className="text-xs text-slate-500">
                    You can update the following information
                  </p>

                </div>

              </div>

              <div className="space-y-5">

                {/* NAME */}

                <EditableField
                  label="Full Name"
                  value={formData.name}
                  field="name"
                  icon={User}
                  placeholder="Enter your full name"
                  required
                />

                {/* MOBILE + EMAIL */}

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-5
                ">

                  {/* MOBILE */}

                  <div>

                    <div className="
                      flex
                      items-center
                      justify-between
                      mb-1.5
                    ">

                      <label className="
                        text-xs
                        font-semibold
                        text-slate-600
                      ">
                        Mobile Number
                      </label>

                      {isMobileLocked ? (
                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          px-2
                          py-1
                          rounded-md
                          bg-slate-100
                          border
                          border-slate-200
                          text-[10px]
                          font-bold
                          text-slate-500
                        ">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="
                          px-2
                          py-1
                          rounded-md
                          bg-amber-50
                          border
                          border-amber-100
                          text-[10px]
                          font-bold
                          text-amber-700
                        ">
                          1 change available
                        </span>
                      )}

                    </div>

                    <div className="relative">

                      <Phone className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        w-4
                        h-4
                        text-slate-400
                      " />

                      <input
                        required
                        type="tel"
                        maxLength={10}
                        inputMode="numeric"
                        disabled={isMobileLocked}
                        value={formData.mobileNo}
                        onChange={(e) => {

                          const onlyNumbers =
                            e.target.value.replace(
                              /\D/g,
                              ''
                            );

                          updateField(
                            'mobileNo',
                            onlyNumbers
                          );

                        }}
                        className={`
                          w-full
                          rounded-xl
                          py-3
                          pl-10
                          pr-4
                          text-sm
                          font-medium
                          outline-none
                          transition

                          ${
                            isMobileLocked
                              ? `
                                bg-slate-100
                                border border-slate-200
                                text-slate-500
                                cursor-not-allowed
                              `
                              : `
                                bg-white
                                border border-slate-300
                                text-slate-900
                                focus:border-blue-600
                                focus:ring-2
                                focus:ring-blue-100
                              `
                          }
                        `}
                      />

                    </div>

                  </div>

                  {/* EMAIL */}

                  <div>

                    <div className="
                      flex
                      items-center
                      justify-between
                      mb-1.5
                    ">

                      <label className="
                        text-xs
                        font-semibold
                        text-slate-600
                      ">
                        Email Address
                      </label>

                      {isEmailLocked ? (
                        <span className="
                          inline-flex
                          items-center
                          gap-1
                          px-2
                          py-1
                          rounded-md
                          bg-slate-100
                          border
                          border-slate-200
                          text-[10px]
                          font-bold
                          text-slate-500
                        ">
                          <Lock className="w-3 h-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="
                          px-2
                          py-1
                          rounded-md
                          bg-amber-50
                          border
                          border-amber-100
                          text-[10px]
                          font-bold
                          text-amber-700
                        ">
                          1 change available
                        </span>
                      )}

                    </div>

                    <div className="relative">

                      <Mail className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        w-4
                        h-4
                        text-slate-400
                      " />

                      <input
                        required
                        type="email"
                        disabled={isEmailLocked}
                        value={formData.email}
                        onChange={(e) =>
                          updateField(
                            'email',
                            e.target.value
                          )
                        }
                        className={`
                          w-full
                          rounded-xl
                          py-3
                          pl-10
                          pr-4
                          text-sm
                          font-medium
                          outline-none
                          transition

                          ${
                            isEmailLocked
                              ? `
                                bg-slate-100
                                border border-slate-200
                                text-slate-500
                                cursor-not-allowed
                              `
                              : `
                                bg-white
                                border border-slate-300
                                text-slate-900
                                focus:border-blue-600
                                focus:ring-2
                                focus:ring-blue-100
                              `
                          }
                        `}
                        placeholder="student@example.com"
                      />

                    </div>

                  </div>

                </div>

                {/* DOB + GENDER */}

                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-5
                ">

                  {/* DOB */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-slate-600
                      mb-1.5
                    ">
                      Date of Birth
                    </label>

                    <div className="relative">

                      <Calendar className="
                        absolute
                        left-3.5
                        top-1/2
                        -translate-y-1/2
                        w-4
                        h-4
                        text-slate-400
                      " />

                      <input
                        type="date"
                        max="2010-12-31"
                        value={formData.dob}
                        onChange={(e) =>
                          updateField(
                            'dob',
                            e.target.value
                          )
                        }
                        className="
                          w-full
                          bg-white
                          border border-slate-300
                          rounded-xl
                          py-3
                          pl-10
                          pr-4
                          text-sm
                          text-slate-900
                          font-medium
                          outline-none
                          focus:border-blue-600
                          focus:ring-2
                          focus:ring-blue-100
                          transition
                        "
                      />

                    </div>

                  </div>

                  {/* GENDER */}

                  <div>

                    <label className="
                      block
                      text-xs
                      font-semibold
                      text-slate-600
                      mb-1.5
                    ">
                      Gender
                    </label>

                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        updateField(
                          'gender',
                          e.target.value
                        )
                      }
                      className="
                        w-full
                        bg-white
                        border border-slate-300
                        rounded-xl
                        py-3
                        px-3.5
                        text-sm
                        text-slate-900
                        font-medium
                        outline-none
                        focus:border-blue-600
                        focus:ring-2
                        focus:ring-blue-100
                        transition
                        cursor-pointer
                      "
                    >
                      <option value="Male">
                        Male
                      </option>

                      <option value="Female">
                        Female
                      </option>

                      <option value="Other">
                        Other
                      </option>
                    </select>

                  </div>

                </div>

              </div>

            </section>

            {/* =================================================
                SAVE BUTTON
            ================================================= */}

            <div className="
              pt-2
              border-t
              border-slate-200
              flex
              justify-end
            ">

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full
                  sm:w-auto
                  sm:min-w-[220px]
                  bg-blue-700
                  hover:bg-blue-800
                  active:bg-blue-900
                  disabled:bg-blue-400
                  disabled:cursor-not-allowed
                  text-white
                  font-semibold
                  py-3
                  px-6
                  rounded-xl
                  transition
                  flex
                  items-center
                  justify-center
                  gap-2
                  shadow-sm
                "
              >

                {loading ? (
                  <>
                    <span className="
                      w-4
                      h-4
                      border-2
                      border-white/30
                      border-t-white
                      rounded-full
                      animate-spin
                    " />

                    Updating profile...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </form>

        </div>

        {/* =====================================================
            FOOTER NOTE
        ===================================================== */}

        <div className="
          flex
          items-center
          justify-center
          gap-2
          text-xs
          text-slate-400
          mt-6
          text-center
        ">

          <ShieldCheck className="w-4 h-4" />

          Your profile information is protected by the
          portal's access controls.

        </div>

      </main>

    </div>
  );
}
