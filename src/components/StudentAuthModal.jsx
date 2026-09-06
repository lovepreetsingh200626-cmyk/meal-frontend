import React, { useEffect, useState } from 'react';
import API from '../services/api';

import { UNIVERSITY_FACULTIES_HIERARCHY } from '../data/coursesData';
import { ACADEMIC_SESSIONS } from '../data/sessionsData';
import { INDIAN_STATES } from '../data/statesData';
import { WORLD_COUNTRIES } from '../data/countriesData';

import {
  User,
  Lock,
  Phone,
  Building2,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Mail,
  IdCard,
  Hash,
  GraduationCap,
  BookOpen,
  Layers,
  ShieldCheck,
  ImagePlus,
  MapPin,
  Globe,
  Calendar,
  Compass,
  KeyRound,
  Key,
  Users,
  HelpCircle,
  Landmark,
  Loader2,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';

const ROLL_NUMBERS = Array.from(
  { length: 999 },
  (_, i) => String(i + 1).padStart(3, '0')
);

export default function StudentAuthModal({
  onLoginSuccess,
  onSwitchToAdmin,
}) {
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
    password: '',
  });

  const [availableDepartments, setAvailableDepartments] = useState([]);
  const [availableProgrammes, setAvailableProgrammes] = useState([]);

  const [resetData, setResetData] = useState({
    studentId: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  /* ---------------------------------------------------------
     LOAD HOSTELS
  --------------------------------------------------------- */

  useEffect(() => {
    API.get('/hostels')
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setHostels(res.data);

          setFormData((prev) => ({
            ...prev,
            hostelNo: res.data[0].hostelNumber,
          }));
        }
      })
      .catch((err) => {
        console.error('Failed to load hostels:', err);
      });
  }, []);

  /* ---------------------------------------------------------
     HELPERS
  --------------------------------------------------------- */

  const resetMessages = () => {
    setError('');
    setSuccessMsg('');
  };

  const switchMode = (registering) => {
    setIsRegistering(registering);
    setForgotPasswordStep(0);
    resetMessages();

    setFormData((prev) => ({
      ...prev,
      password: '',
    }));
  };

  /* ---------------------------------------------------------
     FACULTY
  --------------------------------------------------------- */

  const handleFacultyChange = (facultyId) => {
    const selectedFaculty =
      UNIVERSITY_FACULTIES_HIERARCHY.find(
        (faculty) => faculty.id === facultyId
      );

    const departments =
      selectedFaculty?.departments || [];

    setAvailableDepartments(departments);
    setAvailableProgrammes([]);

    setFormData((prev) => ({
      ...prev,
      facultyId,
      facultyName: selectedFaculty?.name || '',
      department: '',
      university: '',
    }));
  };

  /* ---------------------------------------------------------
     DEPARTMENT
  --------------------------------------------------------- */

  const handleDepartmentChange = (departmentName) => {
    const matchedDepartment =
      availableDepartments.find(
        (department) =>
          department.name === departmentName
      );

    const programmes =
      matchedDepartment?.programmes || [];

    setAvailableProgrammes(programmes);

    setFormData((prev) => ({
      ...prev,
      department: departmentName,
      university: '',
    }));
  };

  /* ---------------------------------------------------------
     STATE
  --------------------------------------------------------- */

  const handleStateChange = (selectedState) => {
    setFormData((prev) => ({
      ...prev,
      domicileState: selectedState,
      category:
        selectedState === 'Punjab'
          ? prev.category
          : 'General',
    }));
  };

  /* ---------------------------------------------------------
     PHOTO UPLOAD
  --------------------------------------------------------- */

  const handlePhotoUpload = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError(
        'Please select a valid image file such as JPG, PNG or WebP.'
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.src = readerEvent.target.result;

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

        const context = canvas.getContext('2d');

        if (!context) {
          setError(
            'Unable to process the selected image.'
          );
          return;
        }

        context.drawImage(
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
          profilePhoto: compressedBase64,
        }));
      };
    };

    reader.readAsDataURL(file);
  };

  /* ---------------------------------------------------------
     REGISTRATION VALIDATION
  --------------------------------------------------------- */

  const validateRegistration = () => {
    const studentId =
      formData.studentId.trim();

    if (!studentId) {
      return 'Student ID is required.';
    }

    if (studentId.length > 13) {
      return 'Student ID cannot exceed 13 characters.';
    }

    if (!formData.name.trim()) {
      return 'Please enter your full name.';
    }

    if (!formData.fatherName.trim()) {
      return "Please enter your father's name.";
    }

    if (!formData.motherName.trim()) {
      return "Please enter your mother's name.";
    }

    if (!formData.dob) {
      return 'Please select your date of birth.';
    }

    if (!formData.email.trim()) {
      return 'Please enter your email address.';
    }

    if (!formData.profilePhoto) {
      return 'Please upload your profile photograph.';
    }

    if (!formData.facultyId) {
      return 'Please select your faculty.';
    }

    if (!formData.department.trim()) {
      return 'Please select your department.';
    }

    if (!formData.university.trim()) {
      return 'Please select your degree programme.';
    }

    if (!formData.session.trim()) {
      return 'Please select your academic session.';
    }

    if (!formData.rollNo) {
      return 'Please select your roll number.';
    }

    if (!formData.hostelNo) {
      return 'Please select your hostel.';
    }

    if (!formData.mobileNo.trim()) {
      return 'Please enter your mobile number.';
    }

    if (formData.mobileNo.length !== 10) {
      return 'Mobile number must contain exactly 10 digits.';
    }

    if (!formData.password) {
      return 'Please create a password.';
    }

    if (formData.password.length < 6) {
      return 'Password should contain at least 6 characters.';
    }

    return '';
  };

  /* ---------------------------------------------------------
     LOGIN / REGISTER
  --------------------------------------------------------- */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    resetMessages();

    if (!formData.studentId.trim()) {
      setError('Student ID is required.');
      setLoading(false);
      return;
    }

    if (formData.studentId.trim().length > 13) {
      setError(
        'Student ID cannot exceed 13 characters.'
      );
      setLoading(false);
      return;
    }

    if (isRegistering) {
      const validationError =
        validateRegistration();

      if (validationError) {
        setError(validationError);
        setLoading(false);
        return;
      }
    }

    try {
      if (isRegistering) {
        const payload = {
          name: formData.name.trim(),
          fatherName:
            formData.fatherName.trim(),
          motherName:
            formData.motherName.trim(),
          dob: formData.dob,
          nationality: formData.nationality,
          email: formData.email.trim(),
          studentId:
            formData.studentId.trim(),
          rollNo: formData.rollNo,
          hostelNo: formData.hostelNo,
          gender: formData.gender,
          mobileNo:
            formData.mobileNo.trim(),
          university:
            formData.university.trim(),
          department:
            formData.department.trim(),
          faculty:
            formData.facultyName.trim(),
          facultyName:
            formData.facultyName.trim(),
          session:
            formData.session.trim(),
          domicileState:
            formData.domicileState,
          category:
            formData.domicileState ===
            'Punjab'
              ? formData.category
              : 'General',
          profilePhoto:
            formData.profilePhoto,
          password:
            formData.password,
        };

        await API.post(
          '/auth/register',
          payload
        );

        setSuccessMsg(
          'Registration successful. You can now sign in using your Student ID and password.'
        );

        setTimeout(() => {
          setIsRegistering(false);

          resetMessages();

          setFormData((prev) => ({
            ...prev,
            password: '',
          }));
        }, 1800);
      } else {
        const loginPayload = {
          studentId:
            formData.studentId.trim(),
          password:
            formData.password,
          role: 'student',
        };

        const { data } =
          await API.post(
            '/auth/login',
            loginPayload
          );

        localStorage.setItem(
          'token',
          data.token
        );

        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to complete the request. Please check your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     FORGOT PASSWORD - REQUEST OTP
  --------------------------------------------------------- */

  const handleRequestOTP = async (event) => {
    event.preventDefault();

    setLoading(true);
    resetMessages();

    if (!resetData.studentId.trim()) {
      setError(
        'Please enter your Student ID.'
      );
      setLoading(false);
      return;
    }

    try {
      const { data } =
        await API.post(
          '/auth/forgot-password',
          {
            studentId:
              resetData.studentId.trim(),
          }
        );

      setSuccessMsg(data.message);

      setTimeout(() => {
        setForgotPasswordStep(2);
        resetMessages();
      }, 2500);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to send the verification code.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------------------------------------------------
     RESET PASSWORD
  --------------------------------------------------------- */

  const handleResetPassword = async (event) => {
    event.preventDefault();

    setLoading(true);
    resetMessages();

    if (resetData.otp.length !== 6) {
      setError(
        'Please enter the 6-digit OTP.'
      );
      setLoading(false);
      return;
    }

    if (
      resetData.newPassword.length < 6
    ) {
      setError(
        'New password should contain at least 6 characters.'
      );
      setLoading(false);
      return;
    }

    if (
      resetData.newPassword !==
      resetData.confirmPassword
    ) {
      setError(
        'New password and confirmation password do not match.'
      );
      setLoading(false);
      return;
    }

    try {
      const { data } =
        await API.post(
          '/auth/reset-password',
          resetData
        );

      setSuccessMsg(data.message);

      setTimeout(() => {
        setForgotPasswordStep(0);

        setResetData({
          studentId: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
        });

        resetMessages();
      }, 2200);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Unable to reset your password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const isOutsidePunjab =
    formData.domicileState !==
    'Punjab';

  /* ---------------------------------------------------------
     STYLES
  --------------------------------------------------------- */

  const inputClass =
    'w-full min-w-0 mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

  const selectClass =
    'w-full min-w-0 mt-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer';

  const disabledSelectClass =
    'w-full min-w-0 mt-1.5 rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed';

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-100 text-slate-900 font-sans flex flex-col">

      {/* =====================================================
          TOP INFORMATION BAR
      ===================================================== */}

      <div className="bg-slate-900 text-slate-300 px-3 sm:px-6 lg:px-8 py-2">

        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-[10px] sm:text-[11px]">

          <div className="flex items-center gap-2 min-w-0">

            <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />

            <span className="truncate">
              MESS RECORDS AND FEE PAYMENT PORTAL
            </span>

          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-400 shrink-0">

            <ShieldCheck className="w-3.5 h-3.5" />

            <span>
              Secure Student Access
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200">

        <div className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-5">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 sm:gap-5">

            <div className="flex items-center gap-3 sm:gap-4 min-w-0">

              <div className="w-11 h-11 sm:w-16 sm:h-16 rounded-xl bg-blue-700 flex items-center justify-center shadow-sm shrink-0">

                <Landmark className="w-6 h-6 sm:w-8 sm:h-8 text-white" />

              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">

                  <h1 className="text-base sm:text-xl md:text-2xl font-bold text-slate-900 leading-tight">
                    Hostel & Mess Management
                  </h1>

                  <span className="inline-flex items-center rounded-full bg-blue-50 border border-blue-100 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-semibold text-blue-700">
                    Student Portal
                  </span>

                </div>

                <p className="text-[11px] sm:text-sm text-slate-500 mt-1">
                  Students portal
                </p>

              </div>

            </div>

            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="w-full md:w-auto min-h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition"
            >

              <ShieldCheck className="w-4 h-4 shrink-0" />

              <span className="truncate">
                Admin / Warden Login
              </span>

              <ChevronRight className="w-4 h-4 shrink-0" />

            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 w-full min-w-0 px-3 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10">

        <div className="w-full max-w-2xl mx-auto min-w-0">

          {/* MAIN CARD */}

          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-sm overflow-hidden">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="px-4 sm:px-7 py-4 sm:py-5 border-b border-slate-200 bg-slate-50">

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">

                <div className="min-w-0">

                  <div className="flex items-center gap-2 min-w-0">

                    {forgotPasswordStep > 0 ? (

                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">

                        <KeyRound className="w-4 h-4" />

                      </div>

                    ) : (

                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">

                        {isRegistering ? (
                          <UserPlus className="w-4 h-4" />
                        ) : (
                          <LogIn className="w-4 h-4" />
                        )}

                      </div>

                    )}

                    <div className="min-w-0">

                      <h2 className="text-sm sm:text-lg font-bold text-slate-900 leading-tight">

                        {forgotPasswordStep > 0
                          ? 'Reset Password'
                          : isRegistering
                          ? 'Create Student Account'
                          : 'Student Sign In'}

                      </h2>

                      <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">

                        {forgotPasswordStep > 0
                          ? 'Recover access to your student account'
                          : isRegistering
                          ? 'Register your hostel and academic details'
                          : 'Access your hostel and mess account'}

                      </p>

                    </div>

                  </div>

                </div>

                {forgotPasswordStep === 0 && (

                  <div className="flex w-full sm:w-auto rounded-lg bg-slate-200 p-1 shrink-0">

                    <button
                      type="button"
                      onClick={() =>
                        switchMode(false)
                      }
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition ${
                        !isRegistering
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        switchMode(true)
                      }
                      className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition ${
                        isRegistering
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Register
                    </button>

                  </div>

                )}

              </div>

            </div>

            {/* =================================================
                FORM CONTENT
            ================================================= */}

            <div className="p-4 sm:p-7 min-w-0">

              {/* ERROR */}

              {error && (

                <div className="mb-4 sm:mb-5 flex items-start gap-2.5 sm:gap-3 rounded-xl border border-red-200 bg-red-50 px-3 sm:px-4 py-3 text-red-800 min-w-0">

                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">

                    <AlertCircle className="w-4 h-4 text-red-600" />

                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      Unable to continue
                    </p>

                    <p className="text-xs leading-relaxed mt-0.5 text-red-700 break-words">
                      {error}
                    </p>

                  </div>

                </div>

              )}

              {/* SUCCESS */}

              {successMsg && (

                <div className="mb-4 sm:mb-5 flex items-start gap-2.5 sm:gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 sm:px-4 py-3 text-emerald-800 min-w-0">

                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">

                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />

                  </div>

                  <div className="min-w-0">

                    <p className="text-sm font-semibold">
                      Success
                    </p>

                    <p className="text-xs leading-relaxed mt-0.5 text-emerald-700 break-words">
                      {successMsg}
                    </p>

                  </div>

                </div>

              )}

              {/* =================================================
                  FORGOT PASSWORD STEP 1
              ================================================= */}

              {forgotPasswordStep === 1 && (

                <form
                  onSubmit={handleRequestOTP}
                  className="space-y-4 sm:space-y-5"
                >

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 sm:p-4">

                    <div className="flex gap-3">

                      <div className="w-9 h-9 rounded-lg bg-white text-blue-700 flex items-center justify-center shrink-0">

                        <Mail className="w-4 h-4" />

                      </div>

                      <div className="min-w-0">

                        <h3 className="text-sm font-semibold text-slate-900">
                          Password recovery
                        </h3>

                        <p className="text-xs text-slate-600 leading-relaxed mt-1">
                          Enter your Student ID. A verification OTP will be sent to your registered email address.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div>

                    <FieldLabel
                      icon={<IdCard className="w-4 h-4" />}
                      label="Student ID"
                      required
                    />

                    <input
                      required
                      type="text"
                      maxLength={13}
                      placeholder="Enter your Student ID"
                      value={resetData.studentId}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          studentId:
                            e.target.value,
                        })
                      }
                      className={`${inputClass} uppercase`}
                    />

                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3 pt-1 sm:pt-2">

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep(0);
                        resetMessages();
                      }}
                      className="flex-1 min-h-10 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >

                      <ArrowLeft className="w-4 h-4" />

                      Back

                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 min-h-10 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60"
                    >

                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                      ) : (
                        <Mail className="w-4 h-4 shrink-0" />
                      )}

                      <span className="truncate">
                        {loading
                          ? 'Sending OTP...'
                          : 'Send OTP'}
                      </span>

                    </button>

                  </div>

                </form>

              )}

              {/* =================================================
                  FORGOT PASSWORD STEP 2
              ================================================= */}

              {forgotPasswordStep === 2 && (

                <form
                  onSubmit={handleResetPassword}
                  className="space-y-4 sm:space-y-5"
                >

                  <div className="rounded-xl border border-amber-100 bg-amber-50 p-3 sm:p-4">

                    <div className="flex gap-3">

                      <div className="w-9 h-9 rounded-lg bg-white text-amber-700 flex items-center justify-center shrink-0">

                        <KeyRound className="w-4 h-4" />

                      </div>

                      <div className="min-w-0">

                        <h3 className="text-sm font-semibold text-slate-900">
                          Verify and create a new password
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                          Enter the OTP received on your registered email address.
                        </p>

                      </div>

                    </div>

                  </div>

                  <div>

                    <FieldLabel
                      icon={<Key className="w-4 h-4" />}
                      label="Verification OTP"
                      required
                    />

                    <input
                      required
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={resetData.otp}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          otp: e.target.value
                            .replace(/\D/g, '')
                            .slice(0, 6),
                        })
                      }
                      className={`${inputClass} text-center tracking-[0.4em] font-bold`}
                    />

                  </div>

                  <div>

                    <FieldLabel
                      icon={<Lock className="w-4 h-4" />}
                      label="New Password"
                      required
                    />

                    <input
                      required
                      type="password"
                      placeholder="Enter new password"
                      value={
                        resetData.newPassword
                      }
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          newPassword:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    />

                  </div>

                  <div>

                    <FieldLabel
                      icon={
                        <ShieldCheck className="w-4 h-4" />
                      }
                      label="Confirm Password"
                      required
                    />

                    <input
                      required
                      type="password"
                      placeholder="Re-enter new password"
                      value={
                        resetData.confirmPassword
                      }
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          confirmPassword:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    />

                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60"
                  >

                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    )}

                    <span className="truncate">
                      {loading
                        ? 'Updating Password...'
                        : 'Reset Password'}
                    </span>

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep(1);
                      resetMessages();
                    }}
                    className="w-full text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-800 break-words"
                  >
                    Use a different Student ID
                  </button>

                </form>

              )}

              {/* =================================================
                  LOGIN / REGISTER
              ================================================= */}

              {forgotPasswordStep === 0 && (

                <form
                  onSubmit={handleSubmit}
                  className="space-y-4 sm:space-y-5"
                >

                  {/* =================================================
                      REGISTER ONLY
                  ================================================= */}

                  {isRegistering && (

                    <>

                      {/* PROFILE PHOTO */}

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                          <div className="w-20 h-20 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 mx-auto sm:mx-0">

                            {formData.profilePhoto ? (

                              <img
                                src={
                                  formData.profilePhoto
                                }
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />

                            ) : (

                              <User className="w-9 h-9 text-slate-400" />

                            )}

                          </div>

                          <div className="flex-1 min-w-0 text-center sm:text-left">

                            <label className="block text-sm font-semibold text-slate-800">

                              Profile Photograph

                              <span className="text-red-500 ml-1">
                                *
                              </span>

                            </label>

                            <p className="text-xs text-slate-500 mt-1 mb-3 leading-relaxed">
                              Upload a clear photograph for your student profile.
                            </p>

                            <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer transition">

                              <ImagePlus className="w-4 h-4" />

                              {formData.profilePhoto
                                ? 'Replace Photo'
                                : 'Upload Photo'}

                              <input
                                type="file"
                                accept="image/*"
                                required={
                                  !formData.profilePhoto
                                }
                                className="hidden"
                                onChange={
                                  handlePhotoUpload
                                }
                              />

                            </label>

                            <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                              Image is automatically resized before upload.
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* PERSONAL INFORMATION */}

                      <FormSection
                        icon={
                          <User className="w-4 h-4" />
                        }
                        title="Personal Information"
                        description="Enter your basic personal details."
                      >

                        <div>

                          <FieldLabel
                            icon={
                              <User className="w-4 h-4" />
                            }
                            label="Full Name"
                            required
                          />

                          <input
                            required
                            type="text"
                            placeholder="Enter your full name"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                name: e.target.value,
                              })
                            }
                            className={inputClass}
                          />

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                          <div>

                            <FieldLabel
                              icon={
                                <User className="w-4 h-4" />
                              }
                              label="Father's Name"
                              required
                            />

                            <input
                              required
                              type="text"
                              placeholder="Father's name"
                              value={
                                formData.fatherName
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fatherName:
                                    e.target.value,
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                          <div>

                            <FieldLabel
                              icon={
                                <Users className="w-4 h-4" />
                              }
                              label="Mother's Name"
                              required
                            />

                            <input
                              required
                              type="text"
                              placeholder="Mother's name"
                              value={
                                formData.motherName
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  motherName:
                                    e.target.value,
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                          <div>

                            <FieldLabel
                              icon={
                                <Calendar className="w-4 h-4" />
                              }
                              label="Date of Birth"
                              required
                            />

                            <input
                              required
                              type="date"
                              max="2010-12-31"
                              value={formData.dob}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  dob: e.target.value,
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                          <div>

                            <FieldLabel
                              icon={
                                <Globe className="w-4 h-4" />
                              }
                              label="Nationality"
                              required
                            />

                            <select
                              required
                              value={
                                formData.nationality
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  nationality:
                                    e.target.value,
                                })
                              }
                              className={selectClass}
                            >

                              {WORLD_COUNTRIES.map(
                                (country) => (

                                  <option
                                    key={country}
                                    value={country}
                                  >
                                    {country}
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                        </div>

                        <div>

                          <FieldLabel
                            icon={
                              <Mail className="w-4 h-4" />
                            }
                            label="Email Address"
                            required
                          />

                          <input
                            required
                            type="email"
                            placeholder="yourname@example.com"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className={inputClass}
                          />

                          <div className="flex items-start gap-1.5 mt-2 text-xs text-slate-500 min-w-0">

                            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-blue-500" />

                            <span className="break-words">
                              Your registered email is used for password recovery.
                            </span>

                          </div>

                        </div>

                      </FormSection>

                      {/* STUDENT ID - REGISTER */}

                      <div>

                        <FieldLabel
                          icon={
                            <IdCard className="w-4 h-4" />
                          }
                          label="Student ID"
                          required
                        />

                        <input
                          required
                          type="text"
                          maxLength={13}
                          placeholder="e.g. 2024ECE102"
                          value={formData.studentId}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              studentId:
                                e.target.value,
                            })
                          }
                          className={`${inputClass} uppercase`}
                        />

                        <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                          This ID will be used to sign in to your student account.
                        </p>

                      </div>

                      {/* ACADEMIC INFORMATION */}

                      <FormSection
                        icon={
                          <GraduationCap className="w-4 h-4" />
                        }
                        title="Academic Information"
                        description="Select your faculty, department and programme."
                      >

                        {/* FACULTY */}

                        <div>

                          <FieldLabel
                            icon={
                              <Compass className="w-4 h-4" />
                            }
                            label="Faculty"
                            required
                          />

                          <select
                            required
                            value={
                              formData.facultyId
                            }
                            onChange={(e) =>
                              handleFacultyChange(
                                e.target.value
                              )
                            }
                            className={selectClass}
                          >

                            <option value="">
                              Select faculty
                            </option>

                            {UNIVERSITY_FACULTIES_HIERARCHY.map(
                              (faculty) => (

                                <option
                                  key={faculty.id}
                                  value={faculty.id}
                                >
                                  {faculty.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                        {/* DEPARTMENT */}

                        <div>

                          <FieldLabel
                            icon={
                              <BookOpen className="w-4 h-4" />
                            }
                            label="Department"
                            required
                          />

                          <select
                            required
                            disabled={
                              !formData.facultyId
                            }
                            value={
                              formData.department
                            }
                            onChange={(e) =>
                              handleDepartmentChange(
                                e.target.value
                              )
                            }
                            className={
                              !formData.facultyId
                                ? disabledSelectClass
                                : selectClass
                            }
                          >

                            <option value="">
                              {formData.facultyId
                                ? 'Select department'
                                : 'Select faculty first'}
                            </option>

                            {availableDepartments.map(
                              (
                                department,
                                index
                              ) => (

                                <option
                                  key={`${department.name}-${index}`}
                                  value={
                                    department.name
                                  }
                                >
                                  {department.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                        {/* PROGRAMME */}

                        <div>

                          <FieldLabel
                            icon={
                              <GraduationCap className="w-4 h-4" />
                            }
                            label="Degree / Programme"
                            required
                          />

                          <select
                            required
                            disabled={
                              !formData.department
                            }
                            value={
                              formData.university
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                university:
                                  e.target.value,
                              })
                            }
                            className={
                              !formData.department
                                ? disabledSelectClass
                                : selectClass
                            }
                          >

                            <option value="">
                              {formData.department
                                ? 'Select degree programme'
                                : 'Select department first'}
                            </option>

                            {availableProgrammes.map(
                              (course) => (

                                <option
                                  key={course.id}
                                  value={course.name}
                                >
                                  [{course.id}] {course.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                        {/* SESSION */}

                        <div>

                          <FieldLabel
                            icon={
                              <Layers className="w-4 h-4" />
                            }
                            label="Academic Session"
                            required
                          />

                          <select
                            required
                            value={
                              formData.session
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                session:
                                  e.target.value,
                              })
                            }
                            className={selectClass}
                          >

                            <option value="">
                              Select academic session
                            </option>

                            {ACADEMIC_SESSIONS.map(
                              (session) => (

                                <option
                                  key={session.id}
                                  value={session.id}
                                >
                                  {session.name}
                                </option>

                              )
                            )}

                          </select>

                        </div>

                      </FormSection>

                      {/* RESIDENTIAL INFORMATION */}

                      <FormSection
                        icon={
                          <Building2 className="w-4 h-4" />
                        }
                        title="Residential Information"
                        description="Enter your hostel and campus details."
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                          {/* ROLL NUMBER */}

                          <div>

                            <FieldLabel
                              icon={
                                <Hash className="w-4 h-4" />
                              }
                              label="Roll Number"
                              required
                            />

                            <select
                              required
                              value={
                                formData.rollNo
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  rollNo:
                                    e.target.value,
                                })
                              }
                              className={selectClass}
                            >

                              <option value="">
                                Select roll number
                              </option>

                              {ROLL_NUMBERS.map(
                                (number) => (

                                  <option
                                    key={number}
                                    value={number}
                                  >
                                    {number}
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                          {/* HOSTEL */}

                          <div>

                            <FieldLabel
                              icon={
                                <Building2 className="w-4 h-4" />
                              }
                              label="Hostel"
                              required
                            />

                            <select
                              required
                              value={
                                formData.hostelNo
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hostelNo:
                                    e.target.value,
                                })
                              }
                              className={selectClass}
                            >

                              {hostels.length > 0 ? (

                                hostels.map(
                                  (hostel) => (

                                    <option
                                      key={
                                        hostel._id
                                      }
                                      value={
                                        hostel.hostelNumber
                                      }
                                    >

                                      {
                                        hostel.hostelNumber
                                      }

                                      {hostel.type
                                        ? ` (${String(
                                            hostel.type
                                          ).toUpperCase()})`
                                        : ''}

                                    </option>

                                  )
                                )

                              ) : (

                                <>

                                  <option value="BH1">
                                    BH1 (BOYS 1)
                                  </option>

                                  <option value="GH1">
                                    GH1 (GIRLS 1)
                                  </option>

                                </>

                              )}

                            </select>

                          </div>

                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                          {/* GENDER */}

                          <div>

                            <FieldLabel
                              icon={
                                <User className="w-4 h-4" />
                              }
                              label="Gender"
                              required
                            />

                            <select
                              value={
                                formData.gender
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  gender:
                                    e.target.value,
                                })
                              }
                              className={selectClass}
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

                          {/* MOBILE */}

                          <div>

                            <FieldLabel
                              icon={
                                <Phone className="w-4 h-4" />
                              }
                              label="Mobile Number"
                              required
                            />

                            <input
                              required
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              placeholder="10-digit number"
                              value={
                                formData.mobileNo
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mobileNo:
                                    e.target.value
                                      .replace(
                                        /\D/g,
                                        ''
                                      )
                                      .slice(
                                        0,
                                        10
                                      ),
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                        </div>

                        {/* DOMICILE + CATEGORY */}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

                          {/* DOMICILE */}

                          <div>

                            <FieldLabel
                              icon={
                                <MapPin className="w-4 h-4" />
                              }
                              label="Domicile State"
                              required
                            />

                            <select
                              required
                              value={
                                formData.domicileState
                              }
                              onChange={(e) =>
                                handleStateChange(
                                  e.target.value
                                )
                              }
                              className={selectClass}
                            >

                              {INDIAN_STATES.map(
                                (state) => (

                                  <option
                                    key={state}
                                    value={state}
                                  >
                                    {state}
                                  </option>

                                )
                              )}

                            </select>

                          </div>

                          {/* CATEGORY */}

                          <div>

                            <FieldLabel
                              icon={
                                <ShieldCheck className="w-4 h-4" />
                              }
                              label="Category"
                              required
                            />

                            <select
                              value={
                                formData.category
                              }
                              disabled={
                                isOutsidePunjab
                              }
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  category:
                                    e.target.value,
                                })
                              }
                              className={
                                isOutsidePunjab
                                  ? disabledSelectClass
                                  : selectClass
                              }
                            >

                              <option value="General">
                                General
                              </option>

                              <option value="SC">
                                SC
                              </option>

                              <option value="BC">
                                BC
                              </option>

                              <option value="OBC">
                                OBC
                              </option>

                              <option value="Other">
                                Other
                              </option>

                            </select>

                            <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">

                              {isOutsidePunjab
                                ? 'Category is set to General for out-of-state domicile.'
                                : 'Select the applicable category.'}

                            </p>

                          </div>

                        </div>

                      </FormSection>

                    </>

                  )}

                  {/* =================================================
                      STUDENT ID - LOGIN ONLY
                  ================================================= */}

                  {!isRegistering && (

                    <div>

                      <FieldLabel
                        icon={
                          <IdCard className="w-4 h-4" />
                        }
                        label="Student ID"
                        required
                      />

                      <input
                        required
                        type="text"
                        maxLength={13}
                        placeholder="Enter your Student ID"
                        value={
                          formData.studentId
                        }
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentId:
                              e.target.value,
                          })
                        }
                        className={`${inputClass} uppercase`}
                      />

                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                        Enter the Student ID you used during registration.
                      </p>

                    </div>

                  )}

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div>

                    <FieldLabel
                      icon={
                        <Lock className="w-4 h-4" />
                      }
                      label="Password"
                      required
                    />

                    <input
                      required
                      type="password"
                      placeholder="Enter your Password"
                      value={
                        formData.password
                      }
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          password:
                            e.target.value,
                        })
                      }
                      className={inputClass}
                    />

                  </div>

                  {/* =================================================
                      FORGOT PASSWORD
                  ================================================= */}

                  {!isRegistering && (

                    <div className="flex justify-end">

                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordStep(
                            1
                          );
                          resetMessages();
                        }}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-blue-700 hover:text-blue-800 transition"
                      >

                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />

                        Forgot password?

                      </button>

                    </div>

                  )}

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full min-h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white px-4 py-3 text-sm font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >

                    {loading ? (

                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />

                        <span className="truncate">
                          {isRegistering
                            ? 'Creating account...'
                            : 'Signing in...'}
                        </span>
                      </>

                    ) : isRegistering ? (

                      <>
                        <UserPlus className="w-4 h-4 shrink-0" />

                        <span className="truncate">
                          Create Student Account
                        </span>
                      </>

                    ) : (

                      <>
                        <LogIn className="w-4 h-4 shrink-0" />

                        <span>
                          Sign In
                        </span>
                      </>

                    )}

                  </button>

                </form>

              )}

            </div>

            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 bg-slate-50 px-4 sm:px-7 py-3.5">

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] sm:text-[11px] text-slate-500 text-center sm:text-left">

                <div className="flex items-center gap-1.5">

                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                  <span>
                    Secure student account
                  </span>

                </div>

                <span className="break-words">
                  Mess records & payment portal (student dashboard)
                </span>

              </div>

            </div>

          </div>

          {/* =================================================
              BOTTOM HELP
          ================================================= */}

          <div className="text-center mt-4 sm:mt-5 px-2 text-[11px] sm:text-xs text-slate-500 break-words leading-relaxed">

            Need administrative assistance? Contact:{' '}

            <Mail className="inline-block w-3.5 h-3.5 mr-1 align-middle" />

            adminconnect.org@gmail.com

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-slate-500">

          2026 @ALL RIGHTS RESERVED.

        </div>

      </footer>

    </div>
  );
}

/* =========================================================
   REUSABLE FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required = false,
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 min-w-0">

      <span className="text-blue-600 shrink-0">
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>

      {required && (
        <span className="text-red-500 shrink-0">
          *
        </span>
      )}

    </label>
  );
}

/* =========================================================
   REUSABLE FORM SECTION
========================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">

      <div className="bg-slate-50 border-b border-slate-200 px-3 sm:px-4 py-3.5">

        <div className="flex items-start gap-3 min-w-0">

          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">

            {icon}

          </div>

          <div className="min-w-0">

            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            {description && (

              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 leading-relaxed">
                {description}
              </p>

            )}

          </div>

        </div>

      </div>

      <div className="p-3 sm:p-4 space-y-4 min-w-0">
        {children}
      </div>

    </section>
  );
}