import React, { useEffect, useMemo, useState } from 'react';
import API from '../services/api';

import {
    User,
    Phone,
    Save,
    CheckCircle2,
    AlertCircle,
    Building2,
    IdCard,
    GraduationCap,
    Mail,
    BriefcaseBusiness,
    Lock,
    X,
    Loader2,
    ShieldCheck,
    UsersRound,
    Camera
} from 'lucide-react';

import { UNIVERSITY_FACULTIES_HIERARCHY } from '../data/coursesData';

export default function ProfileModal({ user, onClose, onUpdateUser }) {

    const isAdmin = user?.role === 'admin';

    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [hostelsList, setHostelsList] = useState([]);
    const [hostelsLoading, setHostelsLoading] = useState(true);

    /* ============================================================
       Faculty list
    ============================================================ */

    const faculties = useMemo(() => {
        return Array.isArray(UNIVERSITY_FACULTIES_HIERARCHY)
            ? UNIVERSITY_FACULTIES_HIERARCHY
            : [];
    }, []);

    /* ============================================================
       Initial faculty detection
    ============================================================ */

    const getInitialFaculty = () => {

        const savedFaculty =
            user?.faculty ||
            user?.facultyName ||
            '';

        if (savedFaculty) {

            const directMatch = faculties.find(
                faculty => faculty.name === savedFaculty
            );

            if (directMatch) {
                return directMatch.name;
            }
        }

        const savedDepartment = user?.department || '';

        if (savedDepartment) {

            const departmentMatch = faculties.find(faculty =>
                Array.isArray(faculty.departments) &&
                faculty.departments.some(
                    department => department.name === savedDepartment
                )
            );

            if (departmentMatch) {
                return departmentMatch.name;
            }
        }

        return '';
    };

    /* ============================================================
       Form State
    ============================================================ */

    const [formData, setFormData] = useState({
        name: user?.name || '',
        mobileNo: user?.mobileNo || user?.phone || '',
        email: user?.email || '',
        gender: user?.gender || '',

        dob: user?.dob
            ? String(user.dob).split('T')[0]
            : '',

        /* Student fields */

        studentId: user?.studentId || '',
        rollNo: user?.rollNo || '',
        hostelNo: user?.hostelNo || '',
        university: user?.university || '',
        session: user?.session || '',
        category: user?.category || '',

        /* Academic fields */

        faculty: getInitialFaculty(),
        facultyName: getInitialFaculty(),
        department: user?.department || '',

        /* Admin fields */

        teacherId: user?.teacherId || user?.employeeId || '',
        employeeId: user?.employeeId || user?.teacherId || '',
        designation: user?.designation || '',

        wardenHostel:
            user?.wardenHostel ||
            user?.hostelNo ||
            '',

        /* Family */

        fatherName: user?.fatherName || '',
        motherName: user?.motherName || '',

        /* Profile */

        profilePhoto: user?.profilePhoto || '',

        /* Security */

        isMobileLocked: Boolean(user?.isMobileLocked),
        isEmailLocked: Boolean(user?.isEmailLocked)
    });

    /* ============================================================
       Load Hostels
    ============================================================ */

    useEffect(() => {

        const fetchHostels = async () => {

            try {

                setHostelsLoading(true);

                const response = await API.get('/hostels');

                const hostels = Array.isArray(response.data)
                    ? response.data
                    : [];

                setHostelsList(hostels);

            } catch (err) {

                console.error('Failed to load hostels:', err);

                setHostelsList([]);

            } finally {

                setHostelsLoading(false);

            }
        };

        fetchHostels();

    }, []);

    /* ============================================================
       Departments belonging to selected faculty
    ============================================================ */

    const availableDepartments = useMemo(() => {

        if (!formData.faculty) {
            return [];
        }

        const selectedFaculty = faculties.find(
            faculty => faculty.name === formData.faculty
        );

        if (!selectedFaculty) {
            return [];
        }

        return Array.isArray(selectedFaculty.departments)
            ? selectedFaculty.departments
            : [];

    }, [faculties, formData.faculty]);

    /* ============================================================
       Keep department valid when faculty changes
    ============================================================ */

    useEffect(() => {

        if (!formData.department) {
            return;
        }

        if (availableDepartments.length === 0) {
            return;
        }

        const departmentExists = availableDepartments.some(
            department => department.name === formData.department
        );

        if (!departmentExists) {

            setFormData(prev => ({
                ...prev,
                department: ''
            }));

        }

    }, [availableDepartments, formData.department]);

    /* ============================================================
       Generic input change
    ============================================================ */

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        setError('');
        setSuccess('');
    };

    /* ============================================================
       Faculty change
    ============================================================ */

    const handleFacultyChange = (e) => {

        const facultyName = e.target.value;

        setFormData(prev => ({
            ...prev,
            faculty: facultyName,
            facultyName: facultyName,
            department: ''
        }));

        setError('');
        setSuccess('');
    };

    /* ============================================================
       Department change
    ============================================================ */

    const handleDepartmentChange = (e) => {

        const departmentName = e.target.value;

        const isValidDepartment = availableDepartments.some(
            department => department.name === departmentName
        );

        if (!isValidDepartment && departmentName !== '') {

            setError(
                'Please select a department belonging to the selected faculty.'
            );

            return;
        }

        setFormData(prev => ({
            ...prev,
            department: departmentName
        }));

        setError('');
        setSuccess('');
    };

    /* ============================================================
       Hostel change
    ============================================================ */

    const handleHostelChange = (e) => {

        setFormData(prev => ({
            ...prev,
            wardenHostel: e.target.value
        }));

        setError('');
        setSuccess('');
    };

    /* ============================================================
       Profile Photo Upload
    ============================================================ */

    const handlePhotoUpload = (e) => {

        const file = e.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {

            setError('Please select a valid image file.');

            setTimeout(() => {
                setError('');
            }, 4000);

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
                            height *
                            (MAX_DIMENSION / width);

                        width = MAX_DIMENSION;
                    }

                } else {

                    if (height > MAX_DIMENSION) {

                        width =
                            width *
                            (MAX_DIMENSION / height);

                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');

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

                setFormData(prev => ({
                    ...prev,
                    profilePhoto: compressedBase64
                }));
            };
        };

        reader.readAsDataURL(file);
    };

    /* ============================================================
       Remove Photo
    ============================================================ */

    const handleRemovePhoto = () => {

        setFormData(prev => ({
            ...prev,
            profilePhoto: ''
        }));
    };

    /* ============================================================
       Submit
    ============================================================ */

    const handleSubmit = async (e) => {

        e.preventDefault();

        setError('');
        setSuccess('');

        /* Admin validation */

        if (isAdmin) {

            if (!formData.faculty) {

                setError('Please select a faculty.');

                return;
            }

            if (!formData.department) {

                setError('Please select a department.');

                return;
            }

            const selectedFaculty = faculties.find(
                faculty => faculty.name === formData.faculty
            );

            const departmentBelongsToFaculty =
                selectedFaculty &&
                Array.isArray(selectedFaculty.departments) &&
                selectedFaculty.departments.some(
                    department =>
                        department.name === formData.department
                );

            if (!departmentBelongsToFaculty) {

                setError(
                    'The selected department does not belong to the selected faculty.'
                );

                return;
            }

            if (
                formData.wardenHostel &&
                hostelsList.length > 0
            ) {

                const hostelExists = hostelsList.some(
                    hostel =>
                        String(hostel.hostelNumber) ===
                        String(formData.wardenHostel)
                );

                if (!hostelExists) {

                    setError(
                        'Please select a valid hostel from the hostel list.'
                    );

                    return;
                }
            }
        }

        try {

            setSaving(true);

            let response;

            if (isAdmin) {

                /* Admin payload */

                const adminPayload = {

                    name: formData.name.trim(),

                    email: formData.email.trim(),

                    mobileNo: formData.mobileNo.trim(),

                    gender: formData.gender,

                    dob: formData.dob,

                    profilePhoto: formData.profilePhoto,

                    teacherId:
                        formData.teacherId.trim(),

                    employeeId:
                        formData.employeeId.trim() ||
                        formData.teacherId.trim(),

                    designation:
                        formData.designation,

                    department:
                        formData.department,

                    faculty:
                        formData.faculty,

                    facultyName:
                        formData.faculty,

                    wardenHostel:
                        formData.wardenHostel,

                    fatherName:
                        formData.fatherName.trim(),

                    motherName:
                        formData.motherName.trim(),

                    isMobileLocked:
                        formData.isMobileLocked,

                    isEmailLocked:
                        formData.isEmailLocked
                };

                response = await API.put(
                    `/auth/admin-profile/${user?._id || user?.id}`,
                    adminPayload
                );

            } else {

                /* Student payload */

                const studentPayload = {

                    name:
                        formData.name.trim(),

                    mobileNo:
                        formData.mobileNo.trim(),

                    email:
                        formData.email.trim(),

                    gender:
                        formData.gender,

                    dob:
                        formData.dob,

                    studentId:
                        formData.studentId,

                    rollNo:
                        formData.rollNo,

                    hostelNo:
                        formData.hostelNo,

                    university:
                        formData.university,

                    department:
                        formData.department,

                    faculty:
                        formData.faculty,

                    facultyName:
                        formData.facultyName,

                    session:
                        formData.session,

                    category:
                        formData.category,

                    fatherName:
                        formData.fatherName.trim(),

                    motherName:
                        formData.motherName.trim(),

                    profilePhoto:
                        formData.profilePhoto,

                    isMobileLocked:
                        formData.isMobileLocked,

                    isEmailLocked:
                        formData.isEmailLocked
                };

                response = await API.put(
                    `/auth/profile/${user?._id || user?.id}`,
                    studentPayload
                );
            }

            /* Get updated user/admin from response */

            const updatedUser =
                response?.data?.user ||
                response?.data?.admin ||
                response?.data?.updatedUser ||
                response?.data?.updatedAdmin ||
                {
                    ...user,
                    ...formData
                };

            /* Preserve role and ID */

            const finalUser = {

                ...user,

                ...updatedUser,

                role:
                    updatedUser.role ||
                    user?.role,

                _id:
                    updatedUser._id ||
                    user?._id,

                id:
                    updatedUser.id ||
                    user?.id
            };

            /* Update localStorage */

            localStorage.setItem(
                'user',
                JSON.stringify(finalUser)
            );

            /* Notify other components */

            window.dispatchEvent(
                new Event('userUpdated')
            );

            /* Update parent */

            if (onUpdateUser) {
                onUpdateUser(finalUser);
            }

            setSuccess(
                'Profile updated successfully.'
            );

            setTimeout(() => {

                onClose();

            }, 1200);

        } catch (err) {

            console.error(
                'Profile update error:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Failed to update profile. Please try again.'
            );

        } finally {

            setSaving(false);
        }
    };

    /* ============================================================
       Responsive classes
    ============================================================ */

    const inputClass =
        'w-full min-w-0 h-11 sm:h-12 px-3 sm:px-4 bg-white border border-slate-300 rounded-lg sm:rounded-xl text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition';

    const disabledInputClass =
        'w-full min-w-0 h-11 sm:h-12 px-3 sm:px-4 bg-slate-100 border border-slate-300 rounded-lg sm:rounded-xl text-sm font-medium text-slate-500 outline-none cursor-not-allowed';

    const labelClass =
        'block text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5 sm:mb-2';

    /* ============================================================
       Render
    ============================================================ */

    return (

        <div
            className="
                fixed inset-0 z-[100]
                flex items-start sm:items-center justify-center
                bg-slate-950/60
                backdrop-blur-sm
                p-0 sm:p-3 md:p-6
                overflow-y-auto
                overflow-x-hidden
            "
        >

            <div
                className="
                    relative
                    w-full
                    min-w-0
                    max-w-4xl
                    h-[100dvh]
                    sm:h-auto
                    max-h-[100dvh]
                    sm:max-h-[95vh]
                    overflow-hidden
                    bg-slate-50
                    rounded-none
                    sm:rounded-2xl
                    shadow-2xl
                    border-0
                    sm:border
                    border-slate-200
                    flex
                    flex-col
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        sticky top-0 z-20
                        shrink-0
                        bg-white
                        border-b border-slate-200
                        px-3
                        sm:px-5
                        md:px-7
                        py-3
                        sm:py-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            justify-between
                            gap-2
                            sm:gap-4
                            min-w-0
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-2
                                sm:gap-3
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    w-9 h-9
                                    sm:w-11 sm:h-11
                                    rounded-lg
                                    sm:rounded-xl
                                    bg-blue-50
                                    border border-blue-100
                                    flex
                                    items-center
                                    justify-center
                                    shrink-0
                                "
                            >

                                <User
                                    size={19}
                                    className="sm:hidden text-blue-700"
                                />

                                <User
                                    size={22}
                                    className="hidden sm:block text-blue-700"
                                />

                            </div>

                            <div className="min-w-0">

                                <h2
                                    className="
                                        text-base
                                        sm:text-lg
                                        md:text-xl
                                        font-bold
                                        text-slate-900
                                        truncate
                                    "
                                >
                                    {isAdmin
                                        ? 'Administrator Profile'
                                        : 'Student Profile'}
                                </h2>

                                <p
                                    className="
                                        text-[10px]
                                        sm:text-xs
                                        text-slate-500
                                        mt-0.5
                                        truncate
                                    "
                                >
                                    Update your institutional profile information
                                </p>

                            </div>

                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                w-9 h-9
                                sm:w-10 sm:h-10
                                rounded-lg
                                sm:rounded-xl
                                flex
                                items-center
                                justify-center
                                text-slate-500
                                hover:bg-slate-100
                                hover:text-slate-800
                                active:bg-slate-200
                                transition
                                shrink-0
                            "
                            title="Close"
                            aria-label="Close profile"
                        >
                            <X size={20} />
                        </button>

                    </div>

                </div>

                {/* ==================================================
                    CONTENT
                ================================================== */}

                <div
                    className="
                        flex-1
                        min-h-0
                        overflow-y-auto
                        overflow-x-hidden
                        overscroll-contain
                    "
                >

                    <form
                        onSubmit={handleSubmit}
                        className="
                            w-full
                            min-w-0
                            p-3
                            sm:p-5
                            md:p-7
                            space-y-4
                            sm:space-y-6
                        "
                    >

                        {/* ==================================================
                            ALERTS
                        ================================================== */}

                        {error && (

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2.5
                                    sm:gap-3
                                    p-3
                                    sm:p-4
                                    rounded-lg
                                    sm:rounded-xl
                                    bg-red-50
                                    border border-red-200
                                    text-red-700
                                    min-w-0
                                "
                            >

                                <AlertCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm
                                        font-medium
                                        break-words
                                        min-w-0
                                    "
                                >
                                    {error}
                                </p>

                            </div>

                        )}

                        {success && (

                            <div
                                className="
                                    flex
                                    items-start
                                    gap-2.5
                                    sm:gap-3
                                    p-3
                                    sm:p-4
                                    rounded-lg
                                    sm:rounded-xl
                                    bg-emerald-50
                                    border border-emerald-200
                                    text-emerald-700
                                    min-w-0
                                "
                            >

                                <CheckCircle2
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                />

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm
                                        font-medium
                                        break-words
                                        min-w-0
                                    "
                                >
                                    {success}
                                </p>

                            </div>

                        )}

                        {/* ==================================================
                            PROFILE PHOTO + BASIC INFORMATION
                        ================================================== */}

                        <section
                            className="
                                bg-white
                                border border-slate-200
                                rounded-xl
                                sm:rounded-2xl
                                p-3
                                sm:p-5
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    mb-4
                                    sm:mb-5
                                "
                            >

                                <User
                                    size={18}
                                    className="text-blue-700 shrink-0"
                                />

                                <h3
                                    className="
                                        font-bold
                                        text-slate-900
                                        text-sm
                                        sm:text-base
                                    "
                                >
                                    Basic Information
                                </h3>

                            </div>

                            <div
                                className="
                                    flex
                                    flex-col
                                    sm:flex-row
                                    gap-4
                                    sm:gap-6
                                    min-w-0
                                "
                            >

                                {/* ==================================================
                                    PHOTO
                                ================================================== */}

                                <div
                                    className="
                                        flex
                                        flex-row
                                        sm:flex-col
                                        items-center
                                        justify-center
                                        sm:justify-start
                                        gap-4
                                        sm:gap-0
                                        w-full
                                        sm:w-36
                                        shrink-0
                                    "
                                >

                                    <div className="relative shrink-0">

                                        <div
                                            className="
                                                w-24 h-24
                                                sm:w-28 sm:h-28
                                                rounded-full
                                                overflow-hidden
                                                bg-slate-100
                                                border-4 border-white
                                                shadow-md
                                                ring-1 ring-slate-200
                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            {formData.profilePhoto ? (

                                                <img
                                                    src={formData.profilePhoto}
                                                    alt="Profile"
                                                    className="
                                                        w-full
                                                        h-full
                                                        object-cover
                                                    "
                                                />

                                            ) : (

                                                <User
                                                    size={38}
                                                    className="text-slate-400"
                                                />

                                            )}

                                        </div>

                                        {formData.profilePhoto && (

                                            <button
                                                type="button"
                                                onClick={handleRemovePhoto}
                                                className="
                                                    absolute
                                                    -right-1
                                                    -top-1
                                                    w-7
                                                    h-7
                                                    rounded-full
                                                    bg-red-600
                                                    text-white
                                                    flex
                                                    items-center
                                                    justify-center
                                                    shadow-md
                                                    active:scale-95
                                                    transition
                                                "
                                                title="Remove photo"
                                                aria-label="Remove photo"
                                            >
                                                <X size={14} />
                                            </button>

                                        )}

                                    </div>

                                    <div
                                        className="
                                            flex
                                            flex-col
                                            items-start
                                            sm:items-center
                                            min-w-0
                                        "
                                    >

                                        <label
                                            className="
                                                inline-flex
                                                items-center
                                                justify-center
                                                gap-2
                                                px-3
                                                py-2.5
                                                rounded-lg
                                                bg-blue-50
                                                border border-blue-100
                                                text-blue-700
                                                text-xs
                                                sm:text-sm
                                                font-bold
                                                cursor-pointer
                                                hover:bg-blue-100
                                                active:bg-blue-200
                                                transition
                                                max-w-full
                                            "
                                        >

                                            <Camera size={15} />

                                            <span className="truncate">
                                                Change Photo
                                            </span>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handlePhotoUpload}
                                                className="hidden"
                                            />

                                        </label>

                                        <p
                                            className="
                                                text-[10px]
                                                text-slate-400
                                                text-left
                                                sm:text-center
                                                mt-2
                                                leading-relaxed
                                                max-w-[180px]
                                            "
                                        >
                                            JPG/PNG • Automatically compressed
                                        </p>

                                    </div>

                                </div>

                                {/* ==================================================
                                    BASIC FIELDS
                                ================================================== */}

                                <div
                                    className="
                                        flex-1
                                        min-w-0
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-3
                                        sm:gap-4
                                    "
                                >

                                    {/* Full Name */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Full Name
                                        </label>

                                        <div className="relative">

                                            <User
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                            <input
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className={`${inputClass} pl-9 sm:pl-10`}
                                                placeholder="Enter full name"
                                            />

                                        </div>

                                    </div>

                                    {/* Gender */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Gender
                                        </label>

                                        <select
                                            name="gender"
                                            value={formData.gender}
                                            onChange={handleChange}
                                            className={inputClass}
                                        >

                                            <option value="">
                                                Select Gender
                                            </option>

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

                                    {/* DOB */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Date of Birth
                                        </label>

                                        <input
                                            type="date"
                                            name="dob"
                                            value={formData.dob}
                                            onChange={handleChange}
                                            className={inputClass}
                                        />

                                    </div>

                                    {/* Student fields */}

                                    {!isAdmin && (

                                        <>

                                            <div className="min-w-0">

                                                <label className={labelClass}>
                                                    Student ID
                                                </label>

                                                <input
                                                    value={formData.studentId}
                                                    disabled
                                                    className={disabledInputClass}
                                                />

                                            </div>

                                            <div className="min-w-0">

                                                <label className={labelClass}>
                                                    Roll Number
                                                </label>

                                                <input
                                                    value={formData.rollNo}
                                                    disabled
                                                    className={disabledInputClass}
                                                />

                                            </div>

                                        </>

                                    )}

                                </div>

                            </div>

                        </section>

                        {/* ==================================================
                            ADMINISTRATIVE INFORMATION
                        ================================================== */}

                        {isAdmin && (

                            <section
                                className="
                                    bg-white
                                    border border-slate-200
                                    rounded-xl
                                    sm:rounded-2xl
                                    p-3
                                    sm:p-5
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-2
                                        mb-4
                                        sm:mb-5
                                    "
                                >

                                    <ShieldCheck
                                        size={18}
                                        className="
                                            text-blue-700
                                            shrink-0
                                            mt-0.5
                                        "
                                    />

                                    <div className="min-w-0">

                                        <h3
                                            className="
                                                font-bold
                                                text-slate-900
                                                text-sm
                                                sm:text-base
                                            "
                                        >
                                            Administrative Information
                                        </h3>

                                        <p
                                            className="
                                                text-[10px]
                                                sm:text-xs
                                                text-slate-500
                                                mt-0.5
                                            "
                                        >
                                            Institutional designation and responsibility
                                        </p>

                                    </div>

                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-3
                                        sm:gap-4
                                    "
                                >

                                    {/* Teacher ID */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Teacher / Employee ID
                                        </label>

                                        <div className="relative">

                                            <IdCard
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                            <input
                                                name="teacherId"
                                                value={formData.teacherId}
                                                onChange={handleChange}
                                                className={`${inputClass} pl-9 sm:pl-10`}
                                                placeholder="Enter teacher ID"
                                            />

                                        </div>

                                    </div>

                                    {/* Designation */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Designation
                                        </label>

                                        <div className="relative">

                                            <BriefcaseBusiness
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                    pointer-events-none
                                                "
                                            />

                                            <select
                                                name="designation"
                                                value={formData.designation}
                                                onChange={handleChange}
                                                className={`${inputClass} pl-9 sm:pl-10`}
                                            >

                                                <option value="">
                                                    Select Designation
                                                </option>

                                                <option value="Professor">
                                                    Professor
                                                </option>

                                                <option value="Associate Professor">
                                                    Associate Professor
                                                </option>

                                                <option value="Assistant Professor">
                                                    Assistant Professor
                                                </option>

                                                <option value="Warden">
                                                    Warden
                                                </option>

                                                <option value="Chief Warden">
                                                    Chief Warden
                                                </option>

                                                <option value="Other">
                                                    Other
                                                </option>

                                            </select>

                                        </div>

                                    </div>

                                    {/* Hostel */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Hostel In-Charge
                                        </label>

                                        <div className="relative">

                                            <Building2
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                    pointer-events-none
                                                "
                                            />

                                            <select
                                                value={formData.wardenHostel}
                                                onChange={handleHostelChange}
                                                disabled={hostelsLoading}
                                                className={`${inputClass} pl-9 sm:pl-10 disabled:bg-slate-100 disabled:text-slate-400`}
                                            >

                                                <option value="">
                                                    {hostelsLoading
                                                        ? 'Loading hostels...'
                                                        : 'Select Hostel'}
                                                </option>

                                                {hostelsList.map(hostel => (

                                                    <option
                                                        key={hostel._id}
                                                        value={hostel.hostelNumber}
                                                    >
                                                        {hostel.hostelNumber}
                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                        <p
                                            className="
                                                mt-1.5
                                                text-[10px]
                                                sm:text-[11px]
                                                text-slate-500
                                                leading-relaxed
                                            "
                                        >
                                            Select the hostel for which this administrator is responsible.
                                        </p>

                                    </div>

                                    {/* Faculty */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Faculty
                                        </label>

                                        <div className="relative">

                                            <GraduationCap
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                    pointer-events-none
                                                "
                                            />

                                            <select
                                                name="faculty"
                                                value={formData.faculty}
                                                onChange={handleFacultyChange}
                                                required
                                                className={`${inputClass} pl-9 sm:pl-10`}
                                            >

                                                <option value="">
                                                    Select Faculty
                                                </option>

                                                {faculties.map(faculty => (

                                                    <option
                                                        key={faculty.id || faculty.name}
                                                        value={faculty.name}
                                                    >
                                                        {faculty.name}
                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                    </div>

                                    {/* Department */}

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Department
                                        </label>

                                        <div className="relative">

                                            <Building2
                                                size={17}
                                                className="
                                                    absolute
                                                    left-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                    pointer-events-none
                                                "
                                            />

                                            <select
                                                name="department"
                                                value={formData.department}
                                                onChange={handleDepartmentChange}
                                                disabled={!formData.faculty}
                                                required
                                                className={`${inputClass} pl-9 sm:pl-10 disabled:bg-slate-100 disabled:text-slate-400`}
                                            >

                                                <option value="">

                                                    {!formData.faculty
                                                        ? 'Select faculty first'
                                                        : availableDepartments.length === 0
                                                            ? 'No departments available'
                                                            : 'Select Department'}

                                                </option>

                                                {availableDepartments.map(department => (

                                                    <option
                                                        key={department.id || department.name}
                                                        value={department.name}
                                                    >
                                                        {department.name}
                                                    </option>

                                                ))}

                                            </select>

                                        </div>

                                        <p
                                            className="
                                                mt-1.5
                                                text-[10px]
                                                sm:text-[11px]
                                                text-slate-500
                                                leading-relaxed
                                            "
                                        >

                                            {!formData.faculty
                                                ? 'Choose a faculty to view its departments.'
                                                : `${availableDepartments.length} department${availableDepartments.length === 1 ? '' : 's'} available in this faculty.`}

                                        </p>

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* ==================================================
                            STUDENT ACADEMIC INFORMATION
                        ================================================== */}

                        {!isAdmin && (

                            <section
                                className="
                                    bg-white
                                    border border-slate-200
                                    rounded-xl
                                    sm:rounded-2xl
                                    p-3
                                    sm:p-5
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        mb-4
                                        sm:mb-5
                                    "
                                >

                                    <GraduationCap
                                        size={18}
                                        className="text-blue-700 shrink-0"
                                    />

                                    <h3
                                        className="
                                            font-bold
                                            text-slate-900
                                            text-sm
                                            sm:text-base
                                        "
                                    >
                                        Academic Information
                                    </h3>

                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-3
                                        sm:gap-4
                                    "
                                >

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Faculty
                                        </label>

                                        <input
                                            value={
                                                formData.faculty ||
                                                formData.facultyName
                                            }
                                            disabled
                                            className={disabledInputClass}
                                        />

                                    </div>

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Department
                                        </label>

                                        <input
                                            value={formData.department}
                                            disabled
                                            className={disabledInputClass}
                                        />

                                    </div>

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            University
                                        </label>

                                        <input
                                            value={formData.university}
                                            disabled
                                            className={disabledInputClass}
                                        />

                                    </div>

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Academic Session
                                        </label>

                                        <input
                                            value={formData.session}
                                            disabled
                                            className={disabledInputClass}
                                        />

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* ==================================================
                            FAMILY INFORMATION - ADMIN
                        ================================================== */}

                        {isAdmin && (

                            <section
                                className="
                                    bg-white
                                    border border-slate-200
                                    rounded-xl
                                    sm:rounded-2xl
                                    p-3
                                    sm:p-5
                                    min-w-0
                                "
                            >

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-2
                                        mb-4
                                        sm:mb-5
                                    "
                                >

                                    <UsersRound
                                        size={18}
                                        className="
                                            text-blue-700
                                            shrink-0
                                            mt-0.5
                                        "
                                    />

                                    <div className="min-w-0">

                                        <h3
                                            className="
                                                font-bold
                                                text-slate-900
                                                text-sm
                                                sm:text-base
                                            "
                                        >
                                            Family Information
                                        </h3>

                                        <p
                                            className="
                                                text-[10px]
                                                sm:text-xs
                                                text-slate-500
                                                mt-0.5
                                            "
                                        >
                                            Parent / family information
                                        </p>

                                    </div>

                                </div>

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        sm:grid-cols-2
                                        gap-3
                                        sm:gap-4
                                    "
                                >

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Father's Name
                                        </label>

                                        <input
                                            name="fatherName"
                                            value={formData.fatherName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Enter father's name"
                                        />

                                    </div>

                                    <div className="min-w-0">

                                        <label className={labelClass}>
                                            Mother's Name
                                        </label>

                                        <input
                                            name="motherName"
                                            value={formData.motherName}
                                            onChange={handleChange}
                                            className={inputClass}
                                            placeholder="Enter mother's name"
                                        />

                                    </div>

                                </div>

                            </section>

                        )}

                        {/* ==================================================
                            CONTACT INFORMATION
                        ================================================== */}

                        <section
                            className="
                                bg-white
                                border border-slate-200
                                rounded-xl
                                sm:rounded-2xl
                                p-3
                                sm:p-5
                                min-w-0
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    mb-4
                                    sm:mb-5
                                "
                            >

                                <Phone
                                    size={18}
                                    className="text-blue-700 shrink-0"
                                />

                                <h3
                                    className="
                                        font-bold
                                        text-slate-900
                                        text-sm
                                        sm:text-base
                                    "
                                >
                                    Contact Information
                                </h3>

                            </div>

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-3
                                    sm:gap-4
                                "
                            >

                                {/* Mobile */}

                                <div className="min-w-0">

                                    <label className={labelClass}>
                                        Mobile Number
                                    </label>

                                    <div className="relative">

                                        <Phone
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-1/2
                                                -translate-y-1/2
                                                text-slate-400
                                            "
                                        />

                                        <input
                                            name="mobileNo"
                                            value={formData.mobileNo}
                                            onChange={handleChange}
                                            disabled={formData.isMobileLocked}
                                            className={`${formData.isMobileLocked
                                                ? disabledInputClass
                                                : inputClass
                                                } pl-9 sm:pl-10 pr-9`}
                                            placeholder="Enter mobile number"
                                        />

                                        {formData.isMobileLocked && (

                                            <Lock
                                                size={15}
                                                className="
                                                    absolute
                                                    right-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                        )}

                                    </div>

                                    {formData.isMobileLocked && (

                                        <p
                                            className="
                                                mt-1.5
                                                text-[10px]
                                                sm:text-[11px]
                                                text-amber-600
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >

                                            <Lock size={11} />

                                            Mobile number is locked.

                                        </p>

                                    )}

                                </div>

                                {/* Email */}

                                <div className="min-w-0">

                                    <label className={labelClass}>
                                        Email Address
                                    </label>

                                    <div className="relative">

                                        <Mail
                                            size={17}
                                            className="
                                                absolute
                                                left-3
                                                top-1/2
                                                -translate-y-1/2
                                                text-slate-400
                                            "
                                        />

                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            disabled={formData.isEmailLocked}
                                            className={`${formData.isEmailLocked
                                                ? disabledInputClass
                                                : inputClass
                                                } pl-9 sm:pl-10 pr-9`}
                                            placeholder="Enter email address"
                                        />

                                        {formData.isEmailLocked && (

                                            <Lock
                                                size={15}
                                                className="
                                                    absolute
                                                    right-3
                                                    top-1/2
                                                    -translate-y-1/2
                                                    text-slate-400
                                                "
                                            />

                                        )}

                                    </div>

                                    {formData.isEmailLocked && (

                                        <p
                                            className="
                                                mt-1.5
                                                text-[10px]
                                                sm:text-[11px]
                                                text-amber-600
                                                flex
                                                items-center
                                                gap-1
                                            "
                                        >

                                            <Lock size={11} />

                                            Email address is locked.

                                        </p>

                                    )}

                                </div>

                            </div>

                        </section>

                        {/* ==================================================
                            SECURITY NOTICE
                        ================================================== */}

                        <div
                            className="
                                flex
                                items-start
                                gap-2.5
                                sm:gap-3
                                p-3
                                sm:p-4
                                bg-slate-100
                                border border-slate-200
                                rounded-lg
                                sm:rounded-xl
                                min-w-0
                            "
                        >

                            <ShieldCheck
                                size={19}
                                className="
                                    text-blue-700
                                    mt-0.5
                                    shrink-0
                                "
                            />

                            <div className="min-w-0">

                                <p
                                    className="
                                        text-xs
                                        sm:text-sm
                                        font-bold
                                        text-slate-800
                                    "
                                >
                                    Profile Security
                                </p>

                                <p
                                    className="
                                        text-[11px]
                                        sm:text-xs
                                        text-slate-500
                                        mt-1
                                        leading-relaxed
                                    "
                                >
                                    Locked contact details cannot be changed from the profile panel. Contact the system administrator if a locked detail needs correction.
                                </p>

                            </div>

                        </div>

                        {/* ==================================================
                            ACTION BUTTONS
                        ================================================== */}

                        <div
                            className="
                                flex
                                flex-col-reverse
                                sm:flex-row
                                justify-end
                                gap-2.5
                                sm:gap-3
                                pt-1
                                sm:pt-2
                                pb-1
                            "
                        >

                            <button
                                type="button"
                                onClick={onClose}
                                disabled={saving}
                                className="
                                    w-full
                                    sm:w-auto
                                    min-h-11
                                    px-5
                                    py-2.5
                                    sm:py-3
                                    rounded-lg
                                    sm:rounded-xl
                                    border border-slate-300
                                    bg-white
                                    text-slate-700
                                    text-sm
                                    font-bold
                                    hover:bg-slate-50
                                    active:bg-slate-100
                                    transition
                                    disabled:opacity-50
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={saving}
                                className="
                                    w-full
                                    sm:w-auto
                                    min-h-11
                                    inline-flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-6
                                    py-2.5
                                    sm:py-3
                                    rounded-lg
                                    sm:rounded-xl
                                    bg-blue-700
                                    text-white
                                    text-sm
                                    font-bold
                                    hover:bg-blue-800
                                    active:bg-blue-900
                                    transition
                                    disabled:opacity-60
                                    disabled:cursor-not-allowed
                                    shadow-sm
                                "
                            >

                                {saving ? (

                                    <>

                                        <Loader2
                                            size={17}
                                            className="animate-spin"
                                        />

                                        Saving...

                                    </>

                                ) : (

                                    <>

                                        <Save size={17} />

                                        Save Changes

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