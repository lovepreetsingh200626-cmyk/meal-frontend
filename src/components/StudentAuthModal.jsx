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
  Eye,
  EyeOff,
  Home,
  Utensils,
  CreditCard,
  UserRound,
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

  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    setShowPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);

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

    const studentId =
      formData.studentId.trim();

    if (!studentId) {
      setError('Student ID is required.');
      setLoading(false);
      return;
    }

    if (studentId.length > 13) {
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
    } else if (!formData.password) {
      setError('Password is required.');
      setLoading(false);
      return;
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

          nationality:
            formData.nationality,

          email:
            formData.email.trim(),

          studentId,

          rollNo:
            formData.rollNo,

          hostelNo:
            formData.hostelNo,

          gender:
            formData.gender,

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
            formData.domicileState === 'Punjab'
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
          studentId,
          password: formData.password,
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
    formData.domicileState !== 'Punjab';

  /* =========================================================
     COMMON STYLES
  ========================================================= */

  const inputClass =
    'mt-1.5 w-full min-w-0 min-h-[46px] rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-50 disabled:cursor-not-allowed disabled:bg-slate-50';

  const selectClass =
    'mt-1.5 w-full min-w-0 min-h-[46px] rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-50 cursor-pointer';

  const disabledSelectClass =
    'mt-1.5 w-full min-w-0 min-h-[46px] rounded-xl border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-400 outline-none cursor-not-allowed';

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#eef4fb] text-slate-900">

      {/* =====================================================
          TOP BRAND BAR
      ===================================================== */}

      <div className="bg-[#07152d] text-slate-300">

        <div className="mx-auto flex min-h-[56px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">

          <div className="flex min-w-0 items-center gap-2.5">

            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 ring-1 ring-blue-400/20">
              <Landmark className="h-4 w-4 text-blue-300" />
            </div>

            <div className="min-w-0">

              <p className="truncate text-[10px] font-bold uppercase tracking-[0.12em] text-slate-200 sm:text-xs">
                GNDU Hostel Services
              </p>

              <p className="hidden text-[9px] text-slate-500 sm:block">
                Mess Records & Fee Payment Portal
              </p>

            </div>

          </div>

          <div className="flex shrink-0 items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-400" />

            <span className="hidden text-[9px] font-semibold uppercase tracking-wider text-slate-400 sm:inline">
              Student Access
            </span>

          </div>

        </div>

      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="border-b border-slate-200 bg-white">

        <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            {/* Brand */}

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-700 shadow-sm sm:h-14 sm:w-14">
                <Home className="h-5 w-5 text-white sm:h-7 sm:w-7" />
              </div>

              <div className="min-w-0">

                <div className="flex flex-wrap items-center gap-2">

                  <h1 className="text-lg font-bold tracking-tight text-slate-950 sm:text-2xl">
                    Hostel & Mess Services
                  </h1>

                  <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wide text-blue-700 sm:text-[9px]">
                    Student Portal
                  </span>

                </div>

                <p className="mt-1 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                  Your personal hostel, mess and fee management account
                </p>

              </div>

            </div>

            {/* Admin switch */}

            <button
              type="button"
              onClick={onSwitchToAdmin}
              className="
                inline-flex min-h-10 w-full items-center
                justify-center gap-2 rounded-xl
                border border-slate-300 bg-white
                px-4 py-2.5 text-xs font-bold
                text-slate-700 shadow-sm transition
                hover:border-blue-300 hover:bg-blue-50
                hover:text-blue-700
                focus:outline-none focus:ring-4
                focus:ring-blue-50
                sm:w-auto sm:text-sm
              "
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Admin / Warden Login</span>
              <ChevronRight className="h-4 w-4 shrink-0" />
            </button>

          </div>

        </div>

      </header>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="w-full px-3 py-5 sm:px-6 sm:py-8 lg:px-8 lg:py-10">

        <div className="mx-auto w-full max-w-5xl">

          {/* =================================================
              DESKTOP / MOBILE INTRO
          ================================================= */}

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">

            <InfoCard
              icon={Home}
              title="Hostel Services"
              text="Manage your residential details"
            />

            <InfoCard
              icon={Utensils}
              title="Mess Records"
              text="View meals and daily records"
            />

            <InfoCard
              icon={CreditCard}
              title="Fee Payments"
              text="Track your mess fee status"
            />

          </div>

          {/* =================================================
              AUTH CARD
          ================================================= */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_15px_45px_rgba(15,23,42,0.08)]">

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="border-b border-slate-200 bg-slate-50 px-4 py-5 sm:px-7 sm:py-6">

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                <div className="flex min-w-0 items-start gap-3">

                  <div
                    className={`
                      flex h-11 w-11 shrink-0 items-center
                      justify-center rounded-xl
                      ${
                        forgotPasswordStep > 0
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }
                    `}
                  >
                    {forgotPasswordStep > 0 ? (
                      <KeyRound className="h-5 w-5" />
                    ) : isRegistering ? (
                      <UserPlus className="h-5 w-5" />
                    ) : (
                      <LogIn className="h-5 w-5" />
                    )}
                  </div>

                  <div className="min-w-0">

                    <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-blue-700 sm:text-[10px]">
                      {forgotPasswordStep > 0
                        ? 'Account Recovery'
                        : isRegistering
                        ? 'New Student Registration'
                        : 'Student Authentication'}
                    </p>

                    <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl">

                      {forgotPasswordStep > 0
                        ? 'Reset Password'
                        : isRegistering
                        ? 'Create Student Account'
                        : 'Welcome Back'}

                    </h2>

                    <p className="mt-1 text-[10px] leading-relaxed text-slate-500 sm:text-xs">

                      {forgotPasswordStep > 0
                        ? 'Recover access to your student account'
                        : isRegistering
                        ? 'Register your academic and hostel information'
                        : 'Sign in to access your hostel and mess dashboard'}

                    </p>

                  </div>

                </div>

                {/* Mode switch */}

                {forgotPasswordStep === 0 && (

                  <div className="grid w-full grid-cols-2 gap-1 rounded-xl bg-slate-200 p-1 sm:w-auto">

                    <button
                      type="button"
                      onClick={() => switchMode(false)}
                      className={`
                        min-h-10 rounded-lg px-4 py-2
                        text-xs font-bold transition
                        ${
                          !isRegistering
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }
                      `}
                    >
                      Sign In
                    </button>

                    <button
                      type="button"
                      onClick={() => switchMode(true)}
                      className={`
                        min-h-10 rounded-lg px-4 py-2
                        text-xs font-bold transition
                        ${
                          isRegistering
                            ? 'bg-white text-blue-700 shadow-sm'
                            : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                        }
                      `}
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

            <div className="p-4 sm:p-7">

              {/* ERROR */}

              {error && (
                <MessageBox
                  type="error"
                  message={error}
                />
              )}

              {/* SUCCESS */}

              {successMsg && (
                <MessageBox
                  type="success"
                  message={successMsg}
                />
              )}

              {/* =================================================
                  FORGOT PASSWORD STEP 1
              ================================================= */}

              {forgotPasswordStep === 1 && (

                <form
                  onSubmit={handleRequestOTP}
                  className="mx-auto max-w-xl space-y-5"
                >

                  <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-700">
                        <Mail className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Password recovery
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Enter your Student ID. A verification OTP will be sent to your registered email address.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div>

                    <FieldLabel
                      icon={<IdCard className="h-4 w-4" />}
                      label="Student ID"
                      required
                    />

                    <input
                      required
                      type="text"
                      maxLength={13}
                      autoComplete="username"
                      placeholder="Enter your Student ID"
                      value={resetData.studentId}
                      onChange={(e) =>
                        setResetData({
                          ...resetData,
                          studentId: e.target.value,
                        })
                      }
                      className={`${inputClass} uppercase`}
                    />

                  </div>

                  <div className="flex flex-col-reverse gap-3 sm:flex-row">

                    <button
                      type="button"
                      onClick={() => {
                        setForgotPasswordStep(0);
                        resetMessages();
                      }}
                      className="min-h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>

                    <button
                      type="submit"
                      disabled={loading}
                      className="min-h-11 flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4" />
                      )}

                      {loading
                        ? 'Sending OTP...'
                        : 'Send OTP'}

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
                  className="mx-auto max-w-xl space-y-5"
                >

                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">

                    <div className="flex items-start gap-3">

                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-700">
                        <KeyRound className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-slate-900">
                          Verify and create a new password
                        </h3>

                        <p className="mt-1 text-xs leading-relaxed text-slate-600">
                          Enter the OTP received on your registered email address.
                        </p>
                      </div>

                    </div>

                  </div>

                  <div>

                    <FieldLabel
                      icon={<Key className="h-4 w-4" />}
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
                      className={`${inputClass} text-center font-bold tracking-[0.4em]`}
                    />

                  </div>

                  <PasswordInput
                    label="New Password"
                    icon={<Lock className="h-4 w-4" />}
                    value={resetData.newPassword}
                    onChange={(value) =>
                      setResetData({
                        ...resetData,
                        newPassword: value,
                      })
                    }
                    placeholder="Enter new password"
                    show={showNewPassword}
                    setShow={setShowNewPassword}
                    inputClass={inputClass}
                  />

                  <PasswordInput
                    label="Confirm Password"
                    icon={<ShieldCheck className="h-4 w-4" />}
                    value={resetData.confirmPassword}
                    onChange={(value) =>
                      setResetData({
                        ...resetData,
                        confirmPassword: value,
                      })
                    }
                    placeholder="Re-enter new password"
                    show={showConfirmPassword}
                    setShow={setShowConfirmPassword}
                    inputClass={inputClass}
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="min-h-12 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4" />
                    )}

                    {loading
                      ? 'Updating Password...'
                      : 'Reset Password'}

                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPasswordStep(1);
                      resetMessages();
                    }}
                    className="w-full text-xs font-bold text-blue-700 hover:text-blue-800"
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
                  className="space-y-5"
                >

                  {/* =================================================
                      REGISTRATION SECTION
                  ================================================= */}

                  {isRegistering && (
                    <>

                      {/* PROFILE PHOTO */}

                      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">

                        <div className="flex flex-col items-center gap-4 sm:flex-row">

                          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-sm">

                            {formData.profilePhoto ? (
                              <img
                                src={formData.profilePhoto}
                                alt="Profile preview"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <UserRound className="h-10 w-10 text-slate-300" />
                            )}

                          </div>

                          <div className="min-w-0 flex-1 text-center sm:text-left">

                            <p className="text-sm font-bold text-slate-900">
                              Profile Photograph
                              <span className="ml-1 text-red-500">
                                *
                              </span>
                            </p>

                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              Upload a clear photograph for your student profile.
                            </p>

                            <label className="mt-3 inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-800">

                              <ImagePlus className="h-4 w-4" />

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
                                onChange={handlePhotoUpload}
                              />

                            </label>

                            <p className="mt-2 text-[10px] text-slate-400">
                              Image is automatically resized before upload.
                            </p>

                          </div>

                        </div>

                      </div>

                      {/* PERSONAL */}

                      <FormSection
                        icon={<User className="h-4 w-4" />}
                        title="Personal Information"
                        description="Enter your basic personal details."
                      >

                        <div>

                          <FieldLabel
                            icon={<User className="h-4 w-4" />}
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div>

                            <FieldLabel
                              icon={<User className="h-4 w-4" />}
                              label="Father's Name"
                              required
                            />

                            <input
                              required
                              type="text"
                              placeholder="Father's name"
                              value={formData.fatherName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  fatherName: e.target.value,
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                          <div>

                            <FieldLabel
                              icon={<Users className="h-4 w-4" />}
                              label="Mother's Name"
                              required
                            />

                            <input
                              required
                              type="text"
                              placeholder="Mother's name"
                              value={formData.motherName}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  motherName: e.target.value,
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div>

                            <FieldLabel
                              icon={<Calendar className="h-4 w-4" />}
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
                              icon={<Globe className="h-4 w-4" />}
                              label="Nationality"
                              required
                            />

                            <select
                              required
                              value={formData.nationality}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  nationality: e.target.value,
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
                            icon={<Mail className="h-4 w-4" />}
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

                          <p className="mt-1.5 flex items-start gap-1.5 text-[10px] leading-relaxed text-slate-500">
                            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
                            Your registered email is used for password recovery.
                          </p>

                        </div>

                      </FormSection>

                      {/* STUDENT ID */}

                      <FormSection
                        icon={<IdCard className="h-4 w-4" />}
                        title="Student Identity"
                        description="Your Student ID will be used to sign in."
                      >

                        <div>

                          <FieldLabel
                            icon={<IdCard className="h-4 w-4" />}
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
                                studentId: e.target.value,
                              })
                            }
                            className={`${inputClass} uppercase`}
                          />

                        </div>

                      </FormSection>

                      {/* ACADEMIC */}

                      <FormSection
                        icon={<GraduationCap className="h-4 w-4" />}
                        title="Academic Information"
                        description="Select your faculty, department, programme and session."
                      >

                        <div>

                          <FieldLabel
                            icon={<Compass className="h-4 w-4" />}
                            label="Faculty"
                            required
                          />

                          <select
                            required
                            value={formData.facultyId}
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

                        <div>

                          <FieldLabel
                            icon={<BookOpen className="h-4 w-4" />}
                            label="Department"
                            required
                          />

                          <select
                            required
                            disabled={!formData.facultyId}
                            value={formData.department}
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
                              (department, index) => (
                                <option
                                  key={`${department.name}-${index}`}
                                  value={department.name}
                                >
                                  {department.name}
                                </option>
                              )
                            )}

                          </select>

                        </div>

                        <div>

                          <FieldLabel
                            icon={<GraduationCap className="h-4 w-4" />}
                            label="Degree / Programme"
                            required
                          />

                          <select
                            required
                            disabled={!formData.department}
                            value={formData.university}
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

                        <div>

                          <FieldLabel
                            icon={<Layers className="h-4 w-4" />}
                            label="Academic Session"
                            required
                          />

                          <select
                            required
                            value={formData.session}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                session: e.target.value,
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

                      {/* RESIDENTIAL */}

                      <FormSection
                        icon={<Building2 className="h-4 w-4" />}
                        title="Residential Information"
                        description="Enter your hostel and campus details."
                      >

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div>

                            <FieldLabel
                              icon={<Hash className="h-4 w-4" />}
                              label="Roll Number"
                              required
                            />

                            <select
                              required
                              value={formData.rollNo}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  rollNo: e.target.value,
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

                          <div>

                            <FieldLabel
                              icon={<Building2 className="h-4 w-4" />}
                              label="Hostel"
                              required
                            />

                            <select
                              required
                              value={formData.hostelNo}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  hostelNo: e.target.value,
                                })
                              }
                              className={selectClass}
                            >

                              {hostels.length > 0 ? (
                                hostels.map((hostel) => (
                                  <option
                                    key={hostel._id}
                                    value={hostel.hostelNumber}
                                  >
                                    {hostel.hostelNumber}

                                    {hostel.type
                                      ? ` (${String(
                                          hostel.type
                                        ).toUpperCase()})`
                                      : ''}
                                  </option>
                                ))
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

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div>

                            <FieldLabel
                              icon={<User className="h-4 w-4" />}
                              label="Gender"
                              required
                            />

                            <select
                              required
                              value={formData.gender}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  gender: e.target.value,
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

                          <div>

                            <FieldLabel
                              icon={<Phone className="h-4 w-4" />}
                              label="Mobile Number"
                              required
                            />

                            <input
                              required
                              type="tel"
                              inputMode="numeric"
                              maxLength={10}
                              placeholder="10-digit number"
                              value={formData.mobileNo}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  mobileNo:
                                    e.target.value
                                      .replace(/\D/g, '')
                                      .slice(0, 10),
                                })
                              }
                              className={inputClass}
                            />

                          </div>

                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                          <div>

                            <FieldLabel
                              icon={<MapPin className="h-4 w-4" />}
                              label="Domicile State"
                              required
                            />

                            <select
                              required
                              value={formData.domicileState}
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

                          <div>

                            <FieldLabel
                              icon={<ShieldCheck className="h-4 w-4" />}
                              label="Category"
                              required
                            />

                            <select
                              required
                              disabled={isOutsidePunjab}
                              value={formData.category}
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

                            <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
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
                      LOGIN STUDENT ID
                  ================================================= */}

                  {!isRegistering && (

                    <div className="mx-auto w-full max-w-xl">

                      <FieldLabel
                        icon={<IdCard className="h-4 w-4" />}
                        label="Student ID"
                        required
                      />

                      <input
                        required
                        type="text"
                        maxLength={13}
                        autoComplete="username"
                        placeholder="Enter your Student ID"
                        value={formData.studentId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentId:
                              e.target.value,
                          })
                        }
                        disabled={loading}
                        className={`${inputClass} uppercase`}
                      />

                      <p className="mt-1.5 text-[10px] leading-relaxed text-slate-500">
                        Enter the Student ID you used during registration.
                      </p>

                    </div>

                  )}

                  {/* =================================================
                      PASSWORD
                  ================================================= */}

                  <div className="mx-auto w-full max-w-xl">

                    <PasswordInput
                      label="Password"
                      icon={<Lock className="h-4 w-4" />}
                      value={formData.password}
                      onChange={(value) =>
                        setFormData({
                          ...formData,
                          password: value,
                        })
                      }
                      placeholder={
                        isRegistering
                          ? 'Create your password'
                          : 'Enter your password'
                      }
                      show={showPassword}
                      setShow={setShowPassword}
                      inputClass={inputClass}
                    />

                    {isRegistering && (
                      <p className="mt-1.5 text-[10px] text-slate-500">
                        Password should contain at least 6 characters.
                      </p>
                    )}

                  </div>

                  {/* =================================================
                      FORGOT PASSWORD
                  ================================================= */}

                  {!isRegistering && (

                    <div className="mx-auto flex w-full max-w-xl justify-end">

                      <button
                        type="button"
                        onClick={() => {
                          setForgotPasswordStep(1);
                          resetMessages();
                        }}
                        className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50 hover:text-blue-800"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        Forgot password?
                      </button>

                    </div>

                  )}

                  {/* =================================================
                      SUBMIT
                  ================================================= */}

                  <div className="mx-auto w-full max-w-xl pt-1">

                    <button
                      type="submit"
                      disabled={loading}
                      className="
                        group flex min-h-[51px] w-full
                        items-center justify-center gap-2
                        rounded-xl bg-blue-700 px-4 py-3
                        text-sm font-bold text-white
                        shadow-sm transition-all
                        hover:bg-blue-800 hover:shadow-md
                        focus:outline-none
                        focus:ring-4 focus:ring-blue-100
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                      "
                    >

                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />

                          <span>
                            {isRegistering
                              ? 'Creating account...'
                              : 'Signing in...'}
                          </span>
                        </>
                      ) : isRegistering ? (
                        <>
                          <UserPlus className="h-4 w-4" />

                          <span>
                            Create Student Account
                          </span>

                          <ChevronRight className="hidden h-4 w-4 opacity-60 sm:block" />
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />

                          <span>
                            Sign In to Student Portal
                          </span>

                          <ChevronRight className="hidden h-4 w-4 opacity-60 sm:block" />
                        </>
                      )}

                    </button>

                  </div>

                </form>

              )}

            </div>

            {/* =================================================
                CARD FOOTER
            ================================================= */}

            <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 sm:px-7">

              <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">

                <div className="flex items-center gap-2">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  </div>

                  <div>

                    <p className="text-[10px] font-bold text-slate-700">
                      Secure student account
                    </p>

                    <p className="text-[9px] text-slate-400">
                      Your account is protected
                    </p>

                  </div>

                </div>

                <div className="text-center text-[9px] text-slate-400 sm:text-right">
                  Hostel • Mess • Payments • Complaints
                </div>

              </div>

            </div>

          </div>

          {/* =================================================
              HELP
          ================================================= */}

          <div className="mt-4 text-center text-[10px] leading-relaxed text-slate-500 sm:mt-5 sm:text-xs">

            Need administrative assistance?

            <span className="mx-1 font-semibold text-slate-700">
              Contact Hostel Administration
            </span>

            <span className="mx-1 hidden sm:inline">•</span>

            <span className="inline-flex items-center gap-1 font-medium text-blue-700">
              <Mail className="h-3.5 w-3.5" />
              adminconnect.org@gmail.com
            </span>

          </div>

        </div>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-3 sm:flex-row sm:px-6 lg:px-8">

          <p className="text-[8px] uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
            GNDU Hostel Services
          </p>

          <p className="text-[8px] text-slate-400 sm:text-[9px]">
            2026 © ALL RIGHTS RESERVED.
          </p>

        </div>

      </footer>

    </div>
  );
}

/* =============================================================
   FIELD LABEL
============================================================= */

function FieldLabel({
  icon,
  label,
  required = false,
}) {
  return (
    <label className="flex min-w-0 items-center gap-2 text-xs font-bold text-slate-700">

      <span className="shrink-0 text-blue-600">
        {icon}
      </span>

      <span className="truncate">
        {label}
      </span>

      {required && (
        <span className="shrink-0 text-red-500">
          *
        </span>
      )}

    </label>
  );
}

/* =============================================================
   FORM SECTION
============================================================= */

function FormSection({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3.5">

        <div className="flex items-start gap-3">

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
            {icon}
          </div>

          <div className="min-w-0">

            <h3 className="text-sm font-bold text-slate-900">
              {title}
            </h3>

            {description && (
              <p className="mt-0.5 text-[10px] leading-relaxed text-slate-500 sm:text-xs">
                {description}
              </p>
            )}

          </div>

        </div>

      </div>

      <div className="space-y-4 p-4">
        {children}
      </div>

    </section>
  );
}

/* =============================================================
   PASSWORD INPUT
============================================================= */

function PasswordInput({
  label,
  icon,
  value,
  onChange,
  placeholder,
  show,
  setShow,
  inputClass,
}) {
  return (
    <div>

      <FieldLabel
        icon={icon}
        label={label}
        required
      />

      <div className="relative">

        <input
          required
          type={show ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={placeholder}
          value={value}
          onChange={(e) =>
            onChange(e.target.value)
          }
          className={`${inputClass} pr-12`}
        />

        <button
          type="button"
          onClick={() =>
            setShow((prev) => !prev)
          }
          className="
            absolute right-1.5 top-1/2
            flex h-9 w-9 -translate-y-1/2
            items-center justify-center
            rounded-lg text-slate-400
            transition hover:bg-slate-100
            hover:text-slate-700
            focus:outline-none
            focus:ring-2 focus:ring-blue-200
          "
          aria-label={
            show
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>

      </div>

    </div>
  );
}

/* =============================================================
   MESSAGE BOX
============================================================= */

function MessageBox({
  type,
  message,
}) {
  const isError = type === 'error';

  return (
    <div
      className={`
        mb-5 flex items-start gap-3 rounded-xl
        border p-3.5
        ${
          isError
            ? 'border-red-200 bg-red-50'
            : 'border-emerald-200 bg-emerald-50'
        }
      `}
    >

      <div
        className={`
          flex h-8 w-8 shrink-0 items-center
          justify-center rounded-lg
          ${
            isError
              ? 'bg-red-100'
              : 'bg-emerald-100'
          }
        `}
      >

        {isError ? (
          <AlertCircle className="h-4 w-4 text-red-600" />
        ) : (
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        )}

      </div>

      <div className="min-w-0">

        <p
          className={`
            text-xs font-bold
            ${
              isError
                ? 'text-red-800'
                : 'text-emerald-800'
            }
          `}
        >
          {isError
            ? 'Unable to continue'
            : 'Success'}
        </p>

        <p
          className={`
            mt-1 break-words
            text-xs leading-relaxed
            ${
              isError
                ? 'text-red-700'
                : 'text-emerald-700'
            }
          `}
        >
          {message}
        </p>

      </div>

    </div>
  );
}

/* =============================================================
   INFO CARD
============================================================= */

function InfoCard({
  icon: Icon,
  title,
  text,
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
        <Icon className="h-4 w-4 text-blue-700" />
      </div>

      <div className="min-w-0">

        <p className="truncate text-xs font-bold text-slate-800">
          {title}
        </p>

        <p className="mt-0.5 truncate text-[9px] text-slate-400">
          {text}
        </p>

      </div>

    </div>
  );
}