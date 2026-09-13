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

  /* =========================================================
     LOAD HOSTELS
  ========================================================= */

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

  /* =========================================================
     HELPERS
  ========================================================= */

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

  /* =========================================================
     FACULTY
  ========================================================= */

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

  /* =========================================================
     DEPARTMENT
  ========================================================= */

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

  /* =========================================================
     STATE
  ========================================================= */

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

  /* =========================================================
     PHOTO UPLOAD
  ========================================================= */

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

  /* =========================================================
     REGISTRATION VALIDATION
  ========================================================= */

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

  /* =========================================================
     LOGIN / REGISTER
  ========================================================= */

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

  /* =========================================================
     FORGOT PASSWORD - REQUEST OTP
  ========================================================= */

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

  /* =========================================================
     RESET PASSWORD
  ========================================================= */

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

  /* =========================================================
     COMPACT DESIGN SYSTEM
  ========================================================= */

  const inputClass =
    'w-full min-w-0 h-10 sm:h-11 rounded-lg border border-slate-300 bg-white px-3 text-[13px] sm:text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100';

  const selectClass =
    'w-full min-w-0 h-10 sm:h-11 rounded-lg border border-slate-300 bg-white px-3 text-[13px] sm:text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 cursor-pointer';

  const disabledSelectClass =
    'w-full min-w-0 h-10 sm:h-11 rounded-lg border border-slate-200 bg-slate-100 px-3 text-[13px] sm:text-sm text-slate-400 outline-none cursor-not-allowed';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-100 text-slate-900 font-sans flex flex-col">

      {/* =====================================================
          COMPACT TOP BAR
      ===================================================== */}

      <div className="bg-slate-950 text-slate-300 shrink-0">

        <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 lg:px-6 py-1.5 sm:py-2">

          <div className="flex items-center justify-between gap-2">

            <div className="flex items-center gap-1.5 min-w-0">

              <span className="relative flex w-1.5 h-1.5 sm:w-2 sm:h-2 shrink-0">
                <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-60 animate-ping" />
                <span className="relative rounded-full bg-emerald-400 w-full h-full" />
              </span>

              <span className="truncate text-[8px] sm:text-[10px] font-bold uppercase tracking-wider">
                Mess Records & Fee Portal
              </span>

            </div>

            <div className="flex items-center gap-1.5 text-[8px] sm:text-[10px] text-slate-400 shrink-0">

              <ShieldCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />

              <span className="hidden xs:inline sm:inline">
                Secure Student Access
              </span>

              <span className="xs:hidden sm:hidden">
                Secure
              </span>

            </div>

          </div>

        </div>

      </div>


      {/* =====================================================
          COMPACT HEADER
      ===================================================== */}

      <header className="bg-white border-b border-slate-200 shrink-0">

        <div className="max-w-6xl mx-auto w-full px-3 sm:px-5 lg:px-6 py-2.5 sm:py-3.5">

          <div className="flex items-center justify-between gap-2.5">

            {/* BRAND */}

            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">

              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-700 flex items-center justify-center shrink-0 shadow-sm">

                <Landmark className="w-4.5 h-4.5 sm:w-5.5 sm:h-5.5 text-white" />

              </div>

              <div className="min-w-0">

                <div className="flex items-center gap-1.5 min-w-0">

                  <h1 className="text-[13px] sm:text-lg lg:text-xl font-bold text-slate-950 truncate leading-tight">
                    Hostel & Mess Management
                  </h1>

                  <span className="hidden xs:inline-flex shrink-0 rounded-md bg-blue-50 border border-blue-100 px-1.5 py-0.5 text-[7px] sm:text-[9px] font-bold uppercase text-blue-700">
                    Student
                  </span>

                </div>

                <p className="text-[8px] sm:text-[10px] lg:text-xs text-slate-500 mt-0.5 truncate">
                  Student services & mess records
                </p>

              </div>

            </div>


            {/* ADMIN SWITCH */}

            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="shrink-0 inline-flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg border border-slate-300 bg-white px-2 sm:px-3 py-2 sm:py-2.5 text-[9px] sm:text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 active:bg-slate-100 transition focus:outline-none focus:ring-2 focus:ring-blue-100"
            >

              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />

              <span className="hidden sm:inline">
                Admin / Warden
              </span>

              <span className="sm:hidden">
                Admin
              </span>

              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />

            </button>

          </div>

        </div>

      </header>


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="flex-1 w-full min-w-0 px-2.5 sm:px-4 lg:px-6 py-3 sm:py-5 lg:py-7">

        <div className="w-full max-w-3xl mx-auto min-w-0">

          {/* =================================================
              MAIN AUTH CARD
          ================================================= */}

          <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-[0_6px_25px_rgba(15,23,42,0.06)] overflow-hidden">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="px-3.5 sm:px-5 lg:px-6 py-3 sm:py-4 border-b border-slate-200 bg-slate-50">

              <div className="flex items-center justify-between gap-2.5">

                <div className="flex items-center gap-2 min-w-0">

                  <div
                    className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      forgotPasswordStep > 0
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >

                    {forgotPasswordStep > 0 ? (
                      <KeyRound className="w-4 h-4" />
                    ) : isRegistering ? (
                      <UserPlus className="w-4 h-4" />
                    ) : (
                      <LogIn className="w-4 h-4" />
                    )}

                  </div>

                  <div className="min-w-0">

                    <h2 className="text-[13px] sm:text-base font-bold text-slate-950 leading-tight truncate">
                      {forgotPasswordStep > 0
                        ? 'Reset Password'
                        : isRegistering
                        ? 'Create Student Account'
                        : 'Student Sign In'}
                    </h2>

                    <p className="text-[9px] sm:text-[11px] text-slate-500 mt-0.5 truncate">
                      {forgotPasswordStep > 0
                        ? 'Recover your student account'
                        : isRegistering
                        ? 'Register your academic and hostel details'
                        : 'Access your hostel and mess account'}
                    </p>

                  </div>

                </div>


                {/* MODE SWITCH */}

                {forgotPasswordStep === 0 && (
                  <div className="flex shrink-0 rounded-lg bg-slate-200 p-0.5">

                    <button
                      type="button"
                      onClick={() => switchMode(false)}
                      className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md text-[9px] sm:text-xs font-bold transition ${
                        !isRegistering
                          ? 'bg-white text-blue-700 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-md text-[9px] sm:text-xs font-bold transition ${
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
                FORM AREA
            ================================================= */}

            <div className="p-3 sm:p-5 lg:p-6 min-w-0">

              {/* ERROR */}

              {error && (
                <div className="mb-3 sm:mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 sm:px-3 py-2.5 text-red-800">

                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />

                  <div className="min-w-0">

                    <p className="text-[11px] sm:text-xs font-bold">
                      Unable to continue
                    </p>

                    <p className="text-[10px] sm:text-xs text-red-700 mt-0.5 leading-relaxed break-words">
                      {error}
                    </p>

                  </div>

                </div>
              )}


              {/* SUCCESS */}

              {successMsg && (
                <div className="mb-3 sm:mb-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 sm:px-3 py-2.5 text-emerald-800">

                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />

                  <div className="min-w-0">

                    <p className="text-[11px] sm:text-xs font-bold">
                      Success
                    </p>

                    <p className="text-[10px] sm:text-xs text-emerald-700 mt-0.5 leading-relaxed break-words">
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
                  className="space-y-3 sm:space-y-4"
                >

                  <InfoBox
                    icon={<Mail className="w-4 h-4" />}
                    title="Password recovery"
                    text="Enter your Student ID. A verification OTP will be sent to your registered email address."
                    tone="blue"
                  />

                  <div>

                    <FieldLabel
                      icon={<IdCard className="w-3.5 h-3.5" />}
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

                  <div className="grid grid-cols-2 gap-2.5 pt-1">

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep(0);
                        resetMessages();
                      }}
                      className="h-10 sm:h-11 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="h-10 sm:h-11 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-3 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}

                      <span>
                        {loading
                          ? 'Sending...'
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
                  className="space-y-3 sm:space-y-4"
                >

                  <InfoBox
                    icon={<KeyRound className="w-4 h-4" />}
                    title="Verify and create a new password"
                    text="Enter the OTP received on your registered email address."
                    tone="amber"
                  />

                  <div>

                    <FieldLabel
                      icon={<Key className="w-3.5 h-3.5" />}
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
                      icon={<Lock className="w-3.5 h-3.5" />}
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
                      icon={<ShieldCheck className="w-3.5 h-3.5" />}
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
                    className="w-full h-10 sm:h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition disabled:opacity-60"
                  >

                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}

                    <span>
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
                    className="w-full text-[10px] sm:text-xs font-semibold text-blue-700 hover:text-blue-800"
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
                  className="space-y-3 sm:space-y-4"
                >

                  {/* =================================================
                      REGISTRATION
                  ================================================= */}

                  {isRegistering && (
                    <>

                      {/* PROFILE PHOTO */}

                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:p-3">

                        <div className="flex items-center gap-3">

                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0">

                            {formData.profilePhoto ? (
                              <img
                                src={
                                  formData.profilePhoto
                                }
                                alt="Profile preview"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User className="w-7 h-7 text-slate-400" />
                            )}

                          </div>

                          <div className="min-w-0 flex-1">

                            <p className="text-xs sm:text-sm font-bold text-slate-800">
                              Profile Photograph
                              <span className="text-red-500 ml-1">
                                *
                              </span>
                            </p>

                            <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                              Clear photograph for your student profile.
                            </p>

                            <label className="mt-1.5 inline-flex items-center gap-1.5 rounded-md bg-blue-700 px-2.5 py-1.5 text-[10px] sm:text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer transition">

                              <ImagePlus className="w-3.5 h-3.5" />

                              {formData.profilePhoto
                                ? 'Replace'
                                : 'Upload'}

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

                          </div>

                        </div>

                      </div>


                      {/* PERSONAL */}

                      <FormSection
                        icon={
                          <User className="w-3.5 h-3.5" />
                        }
                        title="Personal Information"
                        description="Basic personal details"
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <FieldBlock>
                            <FieldLabel
                              icon={<User className="w-3.5 h-3.5" />}
                              label="Full Name"
                              required
                            />

                            <input
                              required
                              type="text"
                              placeholder="Enter full name"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  name: e.target.value,
                                })
                              }
                              className={inputClass}
                            />
                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<User className="w-3.5 h-3.5" />}
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
                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Users className="w-3.5 h-3.5" />}
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
                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Calendar className="w-3.5 h-3.5" />}
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
                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Globe className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Mail className="w-3.5 h-3.5" />}
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

                          </FieldBlock>

                        </div>

                      </FormSection>


                      {/* STUDENT ID */}

                      <div>

                        <FieldLabel
                          icon={<IdCard className="w-3.5 h-3.5" />}
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

                        <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                          This ID will be used to sign in.
                        </p>

                      </div>


                      {/* ACADEMIC */}

                      <FormSection
                        icon={
                          <GraduationCap className="w-3.5 h-3.5" />
                        }
                        title="Academic Information"
                        description="Faculty, department, programme and session"
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <FieldBlock>
                            <FieldLabel
                              icon={<Compass className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<BookOpen className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<GraduationCap className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Layers className="w-3.5 h-3.5" />}
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

                          </FieldBlock>

                        </div>

                      </FormSection>


                      {/* RESIDENTIAL */}

                      <FormSection
                        icon={
                          <Building2 className="w-3.5 h-3.5" />
                        }
                        title="Residential Information"
                        description="Hostel, roll number and student details"
                      >

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                          <FieldBlock>
                            <FieldLabel
                              icon={<Hash className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Building2 className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<User className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<Phone className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<MapPin className="w-3.5 h-3.5" />}
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

                          </FieldBlock>


                          <FieldBlock>
                            <FieldLabel
                              icon={<ShieldCheck className="w-3.5 h-3.5" />}
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

                            <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1 leading-relaxed">
                              {isOutsidePunjab
                                ? 'General for out-of-state domicile.'
                                : 'Select applicable category.'}
                            </p>

                          </FieldBlock>

                        </div>

                      </FormSection>

                    </>
                  )}


                  {/* =================================================
                      LOGIN STUDENT ID
                  ================================================= */}

                  {!isRegistering && (
                    <div>

                      <FieldLabel
                        icon={<IdCard className="w-3.5 h-3.5" />}
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

                      <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                        Enter the Student ID used during registration.
                      </p>

                    </div>
                  )}


                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div>

                    <FieldLabel
                      icon={<Lock className="w-3.5 h-3.5" />}
                      label="Password"
                      required
                    />

                    <input
                      required
                      type="password"
                      placeholder={
                        isRegistering
                          ? 'Create your password'
                          : 'Enter your password'
                      }
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

                    {isRegistering && (
                      <p className="text-[9px] sm:text-[10px] text-slate-500 mt-1">
                        Minimum 6 characters.
                      </p>
                    )}

                  </div>


                  {/* FORGOT PASSWORD */}

                  {!isRegistering && (
                    <div className="flex justify-end -mt-1">

                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordStep(
                            1
                          );
                          resetMessages();
                        }}
                        className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-blue-700 hover:text-blue-800"
                      >

                        <HelpCircle className="w-3.5 h-3.5" />

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
                    className="w-full h-10 sm:h-11 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white px-4 text-xs sm:text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >

                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />

                        <span>
                          {isRegistering
                            ? 'Creating account...'
                            : 'Signing in...'}
                        </span>
                      </>
                    ) : isRegistering ? (
                      <>
                        <UserPlus className="w-4 h-4 shrink-0" />

                        <span>
                          Create Student Account
                        </span>

                        <ChevronRight className="hidden sm:block w-4 h-4 opacity-70" />
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 shrink-0" />

                        <span>
                          Sign In
                        </span>

                        <ChevronRight className="hidden sm:block w-4 h-4 opacity-70" />
                      </>
                    )}

                  </button>

                </form>
              )}

            </div>


            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 bg-slate-50 px-3 sm:px-5 py-2.5 sm:py-3">

              <div className="flex items-center justify-between gap-2 text-[8px] sm:text-[10px] text-slate-500">

                <div className="flex items-center gap-1.5 min-w-0">

                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />

                  <span className="truncate">
                    Secure student account
                  </span>

                </div>

                <span className="hidden sm:block truncate text-right">
                  Mess records & payment portal
                </span>

              </div>

            </div>

          </div>


          {/* =================================================
              HELP
          ================================================= */}

          <div className="text-center mt-2.5 sm:mt-3 px-2 text-[9px] sm:text-[10px] text-slate-500 leading-relaxed">

            Need administrative assistance?

            <span className="mx-1">•</span>

            <Mail className="inline-block w-3 h-3 mr-0.5 align-middle" />

            adminconnect.org@gmail.com

          </div>

        </div>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white shrink-0">

        <div className="max-w-6xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 text-center text-[8px] sm:text-[9px] text-slate-400">

          2026 @ALL RIGHTS RESERVED.

        </div>

      </footer>

    </div>
  );
}


/* =========================================================
   FIELD LABEL
========================================================= */

function FieldLabel({
  icon,
  label,
  required = false,
}) {
  return (
    <label className="flex items-center gap-1.5 mb-1 text-[10px] sm:text-xs font-bold text-slate-700 min-w-0">

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
   FIELD BLOCK
========================================================= */

function FieldBlock({ children }) {
  return (
    <div className="min-w-0">
      {children}
    </div>
  );
}


/* =========================================================
   FORM SECTION
========================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="rounded-lg sm:rounded-xl border border-slate-200 bg-white overflow-hidden min-w-0">

      <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 sm:px-3.5 sm:py-2.5">

        <div className="flex items-center gap-2 min-w-0">

          <div className="w-7 h-7 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
            {icon}
          </div>

          <div className="min-w-0">

            <h3 className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
              {title}
            </h3>

            {description && (
              <p className="text-[8px] sm:text-[9px] text-slate-500 mt-0.5 truncate">
                {description}
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="p-3 sm:p-3.5 space-y-3 min-w-0">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   INFORMATION BOX
========================================================= */

function InfoBox({
  icon,
  title,
  text,
  tone = 'blue',
}) {
  const styles =
    tone === 'amber'
      ? {
          wrapper:
            'border-amber-200 bg-amber-50',
          icon:
            'bg-white text-amber-700',
        }
      : {
          wrapper:
            'border-blue-100 bg-blue-50',
          icon:
            'bg-white text-blue-700',
        };

  return (
    <div
      className={`rounded-lg border p-2.5 sm:p-3 ${styles.wrapper}`}
    >

      <div className="flex items-center gap-2.5">

        <div
          className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 ${styles.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">

          <h3 className="text-[11px] sm:text-xs font-bold text-slate-900">
            {title}
          </h3>

          <p className="text-[9px] sm:text-[10px] text-slate-600 leading-relaxed mt-0.5">
            {text}
          </p>

        </div>

      </div>

    </div>
  );
}