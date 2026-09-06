import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';

import {
    Users,
    Search,
    Filter,
    Pencil,
    KeyRound,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Loader2,
    User as UserIcon,
    Home,
    Mail,
    Phone,
    Check,
    ImagePlus,
    X,
    CreditCard,
    Lock,
    RefreshCw,
    GraduationCap,
    CalendarDays,
    MapPin,
    UserRound,
    ShieldCheck,
    IndianRupee,
    CircleDollarSign,
} from 'lucide-react';

import { UNIVERSITY_FACULTIES_HIERARCHY } from '../../data/coursesData';
import { ACADEMIC_SESSIONS } from '../../data/sessionsData';
import { INDIAN_STATES } from '../../data/statesData';
import { WORLD_COUNTRIES } from '../../data/countriesData';
import ConfirmModal from '../../components/ConfirmModal';

const ROLL_NUMBERS = Array.from(
    { length: 999 },
    (_, i) => String(i + 1).padStart(3, '0')
);

/* -------------------------------------------------------------------------- */
/* SMALL UI COMPONENTS                                                        */
/* -------------------------------------------------------------------------- */

function StatCard({ icon: Icon, label, value, description, iconClass = '' }) {
    return (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
            <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-4">
                <div className="min-w-0">
                    <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500 sm:text-[11px] sm:tracking-[0.16em]">
                        {label}
                    </p>

                    <p className="mt-2 truncate text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        {value}
                    </p>

                    {description && (
                        <p className="mt-1 hidden text-xs text-slate-500 sm:block">
                            {description}
                        </p>
                    )}
                </div>

                <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 sm:h-11 sm:w-11 ${iconClass}`}
                >
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
            </div>
        </div>
    );
}

function SectionHeader({ icon: Icon, title, description }) {
    return (
        <div className="mb-4 flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
                <Icon className="h-4 w-4" />
            </div>

            <div className="min-w-0">
                <h4 className="text-sm font-black text-slate-900">
                    {title}
                </h4>

                {description && (
                    <p className="mt-0.5 text-xs text-slate-500">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

function Field({ label, required = false, children }) {
    return (
        <div className="min-w-0">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wide text-slate-600">
                {label}
                {required && <span className="ml-1 text-red-500">*</span>}
            </label>

            {children}
        </div>
    );
}

function StatusBadge({ paid }) {
    if (paid) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Paid
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-red-700">
            <AlertCircle className="h-3.5 w-3.5" />
            Pending
        </span>
    );
}

/* -------------------------------------------------------------------------- */
/* MAIN COMPONENT                                                             */
/* -------------------------------------------------------------------------- */

export default function AdminUsers() {
    const [usersList, setUsersList] = useState([]);
    const [paymentsList, setPaymentsList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [hostelsList, setHostelsList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {},
    });

    /* ---------------------------------------------------------------------- */
    /* PASSWORD MODAL                                                         */
    /* ---------------------------------------------------------------------- */

    const [passwordModal, setPasswordModal] = useState({
        isOpen: false,
        targetId: null,
        targetName: '',
        newPassword: '',
    });

    /* ---------------------------------------------------------------------- */
    /* EDIT USER MODAL                                                        */
    /* ---------------------------------------------------------------------- */

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);

    const [editFormData, setEditFormData] = useState({
        name: '',
        newRollNo: '',
        studentId: '',
        mobileNo: '',
        dob: '',
        gender: 'Male',
        hostelNo: 'BH1',
        university: '',
        department: '',
        session: '',
        category: 'General',
        email: '',
        fatherName: '',
        motherName: '',
        facultyId: '',
        facultyName: '',
        domicileState: 'Punjab',
        nationality: 'India',
        profilePhoto: '',
    });

    const [adminAvailableDepartments, setAdminAvailableDepartments] =
        useState([]);

    const [adminAvailableProgrammes, setAdminAvailableProgrammes] =
        useState([]);

    /* ---------------------------------------------------------------------- */
    /* NOTIFICATIONS                                                          */
    /* ---------------------------------------------------------------------- */

    const showError = (message) => {
        setErrorMsg(message);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    const showSuccess = (message) => {
        setSuccessMsg(message);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    /* ---------------------------------------------------------------------- */
    /* FETCH DATA                                                             */
    /* ---------------------------------------------------------------------- */

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const [
                resUsers,
                resPayments,
                resMeals,
                resHostels,
            ] = await Promise.all([
                API.get('/auth/users'),
                API.get('/payments/admin/all-payments'),
                API.get('/meals/all'),
                API.get('/hostels'),
            ]);

            setUsersList(resUsers.data || []);
            setPaymentsList(resPayments.data || []);
            setMealsList(resMeals.data || []);
            setHostelsList(resHostels.data || []);
        } catch (err) {
            console.error(err);
            showError('Failed to fetch student directory data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    /* ---------------------------------------------------------------------- */
    /* CURRENT MONTH                                                          */
    /* ---------------------------------------------------------------------- */

    const currentMonthPrefix = useMemo(() => {
        const now = new Date();

        return `${now.getFullYear()}-${String(
            now.getMonth() + 1
        ).padStart(2, '0')}`;
    }, []);

    /* ---------------------------------------------------------------------- */
    /* FEE STATUS                                                             */
    /* ---------------------------------------------------------------------- */

    const calculateMemberFeeStatus = (student) => {
        const now = new Date();

        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        const monthPrefix = `${currentYear}-${String(
            currentMonth + 1
        ).padStart(2, '0')}`;

        const matchingPayment = paymentsList.find((payment) => {
            const matchUser =
                payment.userId === student._id ||
                payment.userId?._id === student._id ||
                payment.studentId === student.studentId ||
                payment.rollNo === student.rollNo;

            const matchMonth =
                payment.month === monthPrefix ||
                (payment.createdAt &&
                    payment.createdAt.startsWith(monthPrefix));

            return matchUser && matchMonth;
        });

        if (matchingPayment) {
            return {
                isPaid: true,
                paymentRecord: matchingPayment,
                fine: 0,
                statusLabel: 'PAID',
            };
        }

        const deadlineDate = new Date(
            currentYear,
            currentMonth + 1,
            15,
            23,
            59,
            59
        );

        let fine = 0;

        if (now > deadlineDate) {
            const monthsOverdue =
                (now.getFullYear() - deadlineDate.getFullYear()) * 12 +
                (now.getMonth() - deadlineDate.getMonth()) +
                1;

            fine = Math.max(1, monthsOverdue) * 10;
        }

        return {
            isPaid: false,
            paymentRecord: null,
            fine,
            statusLabel: 'UNPAID',
        };
    };

    /* ---------------------------------------------------------------------- */
    /* DESK PAYMENT                                                           */
    /* ---------------------------------------------------------------------- */

    const handleRecordDeskSettlement = (student) => {
        const baseCharge =
            student.gender === 'Female' ||
            student.category?.toLowerCase().includes('girl')
                ? 1000
                : 1100;

        const studentMeals = mealsList.filter(
            (meal) =>
                (meal.userId === student._id ||
                    meal.userId?._id === student._id) &&
                meal.date?.startsWith(currentMonthPrefix)
        );

        const mealsCost = studentMeals.reduce(
            (sum, meal) => sum + (Number(meal.dailyTotalCost) || 0),
            0
        );

        const totalPayable =
            mealsCost > baseCharge
                ? baseCharge + mealsCost
                : baseCharge;

        setConfirmModal({
            isOpen: true,
            title: 'Confirm Cash Payment',
            message: `Record ₹${totalPayable.toLocaleString()} as a physical desk payment for ${student.name} (Roll ${student.rollNo})?`,

            onConfirm: async () => {
                try {
                    const payload = {
                        userId: student._id,
                        studentName: student.name,
                        rollNo: student.rollNo,
                        studentId: student.studentId || 'N/A',
                        hostelNo: student.hostelNo || 'BH1',

                        receiptNo: `DESK/REC/${Math.floor(
                            100000 + Math.random() * 900000
                        )}`,

                        txnId: `CASH-DESK-${Date.now()
                            .toString()
                            .slice(-6)}`,

                        paymentChannel:
                            'Physical Desk Cash Settlement',

                        amount: totalPayable,
                        month: currentMonthPrefix,
                        date: new Date().toLocaleString(),
                    };

                    await API.post('/payments/record', payload);

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));

                    showSuccess(
                        `Payment recorded successfully for ${student.name}.`
                    );

                    const res = await API.get(
                        '/payments/admin/all-payments'
                    );

                    setPaymentsList(res.data || []);
                } catch (err) {
                    console.error(err);

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false,
                    }));

                    showError(
                        'Failed to record the payment on the server.'
                    );
                }
            },
        });
    };

    /* ---------------------------------------------------------------------- */
    /* DELETE STUDENT                                                         */
    /* ---------------------------------------------------------------------- */

    const promptRemoveStudent = (studentRef, targetName) => {
        const targetId =
            typeof studentRef === 'object'
                ? studentRef?._id || studentRef?.id
                : studentRef;

        setConfirmModal({
            isOpen: true,
            title: 'Delete Student Record',
            message: `Are you sure you want to permanently remove ${targetName} from the student directory? This action cannot be undone.`,

            onConfirm: async () => {
                setConfirmModal((prev) => ({
                    ...prev,
                    isOpen: false,
                }));

                try {
                    await API.delete(`/auth/users/${targetId}`);

                    setUsersList((prev) =>
                        prev.filter(
                            (user) =>
                                user._id !== targetId &&
                                user.id !== targetId
                        )
                    );

                    showSuccess(
                        `${targetName}'s student record was deleted successfully.`
                    );
                } catch (err) {
                    console.error(err);

                    showError(
                        'Failed to delete the student record.'
                    );
                }
            },
        });
    };

    /* ---------------------------------------------------------------------- */
    /* PASSWORD RESET                                                         */
    /* ---------------------------------------------------------------------- */

    const promptResetPassword = (studentRef, targetName) => {
        const targetId =
            typeof studentRef === 'object'
                ? studentRef?._id || studentRef?.id
                : studentRef;

        setPasswordModal({
            isOpen: true,
            targetId,
            targetName,
            newPassword: '',
        });
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        const {
            targetId,
            targetName,
            newPassword,
        } = passwordModal;

        if (!newPassword || newPassword.trim().length < 8) {
            showError(
                'Password must contain at least 8 characters.'
            );
            return;
        }

        try {
            const { data } = await API.put(
                `/auth/users/${targetId}/password`,
                {
                    newPassword: newPassword.trim(),
                }
            );

            showSuccess(
                data.message ||
                    `Password updated successfully for ${targetName}.`
            );

            setPasswordModal({
                isOpen: false,
                targetId: null,
                targetName: '',
                newPassword: '',
            });
        } catch (err) {
            console.error(err);

            showError(
                err.response?.data?.message ||
                    'Failed to update the password.'
            );
        }
    };

    /* ---------------------------------------------------------------------- */
    /* OPEN EDIT MODAL                                                        */
    /* ---------------------------------------------------------------------- */

    const openEditModal = (student) => {
        setEditingUserId(student._id || student.id);

        let matchedFaculty =
            UNIVERSITY_FACULTIES_HIERARCHY.find(
                (faculty) =>
                    faculty.name === student.facultyName ||
                    faculty.name === student.faculty
            );

        if (!matchedFaculty && student.department) {
            matchedFaculty =
                UNIVERSITY_FACULTIES_HIERARCHY.find(
                    (faculty) =>
                        faculty.departments.some(
                            (department) =>
                                department.name ===
                                student.department
                        )
                );
        }

        const departments = matchedFaculty
            ? matchedFaculty.departments
            : [];

        setAdminAvailableDepartments(departments);

        const matchedDepartment = departments.find(
            (department) =>
                department.name === student.department
        );

        const programmes = matchedDepartment
            ? matchedDepartment.programmes
            : [];

        setAdminAvailableProgrammes(programmes);

        const nationality = student.nationality || 'India';
        const domicile = student.domicileState || 'Punjab';

        const restrictCategory =
            nationality !== 'India' ||
            domicile !== 'Punjab';

        setEditFormData({
            name: student.name || '',
            newRollNo: student.rollNo || '',
            studentId: student.studentId || '',
            mobileNo: student.mobileNo || '',

            dob: student.dob
                ? String(student.dob).split('T')[0]
                : '',

            gender: student.gender || 'Male',
            hostelNo: student.hostelNo || 'BH1',
            university: student.university || '',
            department: student.department || '',
            session: student.session || '',

            category: restrictCategory
                ? 'General'
                : student.category || 'General',

            email: student.email || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',

            facultyId: matchedFaculty
                ? matchedFaculty.id
                : '',

            facultyName: matchedFaculty
                ? matchedFaculty.name
                : student.facultyName ||
                  student.faculty ||
                  '',

            domicileState: domicile,
            nationality,
            profilePhoto: student.profilePhoto || '',
        });

        setIsEditModalOpen(true);
    };

    /* ---------------------------------------------------------------------- */
    /* FACULTY CHANGE                                                         */
    /* ---------------------------------------------------------------------- */

    const handleAdminFacultyChange = (facultyId) => {
        const selectedFaculty =
            UNIVERSITY_FACULTIES_HIERARCHY.find(
                (faculty) => faculty.id === facultyId
            );

        const departments = selectedFaculty
            ? selectedFaculty.departments
            : [];

        setAdminAvailableDepartments(departments);
        setAdminAvailableProgrammes([]);

        setEditFormData((prev) => ({
            ...prev,
            facultyId,
            facultyName: selectedFaculty
                ? selectedFaculty.name
                : '',
            department: '',
            university: '',
        }));
    };

    /* ---------------------------------------------------------------------- */
    /* DEPARTMENT CHANGE                                                      */
    /* ---------------------------------------------------------------------- */

    const handleAdminDepartmentChange = (departmentName) => {
        const matchedDepartment =
            adminAvailableDepartments.find(
                (department) =>
                    department.name === departmentName
            );

        const programmes = matchedDepartment
            ? matchedDepartment.programmes
            : [];

        setAdminAvailableProgrammes(programmes);

        setEditFormData((prev) => ({
            ...prev,
            department: departmentName,
            university: '',
        }));
    };

    /* ---------------------------------------------------------------------- */
    /* PHOTO UPLOAD                                                           */
    /* ---------------------------------------------------------------------- */

    const handlePhotoUpload = (e) => {
        const file = e.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith('image/')) {
            showError('Please select a valid image file.');
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

                setEditFormData((prev) => ({
                    ...prev,
                    profilePhoto: compressedBase64,
                }));
            };
        };

        reader.readAsDataURL(file);
    };

    /* ---------------------------------------------------------------------- */
    /* EDIT SUBMIT                                                            */
    /* ---------------------------------------------------------------------- */

    const handleEditSubmit = async (e) => {
        e.preventDefault();

        try {
            const { data } = await API.put(
                `/auth/users/${editingUserId}`,
                editFormData
            );

            setUsersList((prev) =>
                prev.map((user) =>
                    user._id === editingUserId ||
                    user.id === editingUserId
                        ? data.user
                        : user
                )
            );

            setIsEditModalOpen(false);

            showSuccess(
                'Student profile updated successfully.'
            );
        } catch (err) {
            console.error(err);

            showError(
                err.response?.data?.message ||
                    'Failed to update student profile.'
            );
        }
    };

    /* ---------------------------------------------------------------------- */
    /* REVOKE PAYMENT                                                         */
    /* ---------------------------------------------------------------------- */

    const handleRevokeSettlement = (
        paymentRef,
        studentName
    ) => {
        const paymentId =
            typeof paymentRef === 'object'
                ? paymentRef?._id || paymentRef?.id
                : paymentRef;

        if (!paymentId) return;

        setConfirmModal({
            isOpen: true,
            title: 'Revoke Payment',
            message: `Revoke the current payment clearance for ${studentName}? The student will return to pending status.`,

            onConfirm: async () => {
                setConfirmModal((prev) => ({
                    ...prev,
                    isOpen: false,
                }));

                try {
                    await API.delete(
                        `/payments/${paymentId}`
                    )
                        .catch(() =>
                            API.delete(
                                `/payments/admin/${paymentId}`
                            )
                        )
                        .catch(() =>
                            API.delete(
                                `/payments/record/${paymentId}`
                            )
                        );

                    setPaymentsList((prev) =>
                        prev.filter(
                            (payment) =>
                                payment._id !== paymentId &&
                                payment.id !== paymentId
                        )
                    );

                    showSuccess(
                        `Payment clearance revoked for ${studentName}.`
                    );
                } catch (err) {
                    console.error(err);

                    showError(
                        'Failed to revoke the payment.'
                    );
                }
            },
        });
    };

    /* ---------------------------------------------------------------------- */
    /* FILTERED USERS                                                         */
    /* ---------------------------------------------------------------------- */

    const filteredUsers = useMemo(() => {
        const search = searchTerm
            .trim()
            .toLowerCase();

        return usersList
            .filter((user) => {
                const matchesSearch =
                    !search ||
                    user.name
                        ?.toLowerCase()
                        .includes(search) ||
                    user.rollNo
                        ?.toString()
                        .toLowerCase()
                        .includes(search) ||
                    user.studentId
                        ?.toString()
                        .toLowerCase()
                        .includes(search);

                const matchesHostel =
                    selectedHostelFilter === 'ALL' ||
                    user.hostelNo ===
                        selectedHostelFilter;

                return (
                    matchesSearch &&
                    matchesHostel
                );
            })
            .sort(
                (a, b) =>
                    (Number(a.rollNo) || 0) -
                    (Number(b.rollNo) || 0)
            );
    }, [
        usersList,
        searchTerm,
        selectedHostelFilter,
    ]);

    /* ---------------------------------------------------------------------- */
    /* DASHBOARD STATS                                                        */
    /* ---------------------------------------------------------------------- */

    const statistics = useMemo(() => {
        let paid = 0;

        usersList.forEach((student) => {
            if (
                calculateMemberFeeStatus(student)
                    .isPaid
            ) {
                paid++;
            }
        });

        const hostelResidents = usersList.filter(
            (user) => user.hostelNo
        ).length;

        return {
            total: usersList.length,
            residents: hostelResidents,
            paid,
            pending: Math.max(
                usersList.length - paid,
                0
            ),
        };
    }, [
        usersList,
        paymentsList,
    ]);

    const isGeneralRestricted =
        editFormData.nationality !== 'India' ||
        editFormData.domicileState !== 'Punjab';

    /* ---------------------------------------------------------------------- */
    /* RENDER                                                                 */
    /* ---------------------------------------------------------------------- */

    return (
        <div className="w-full min-w-0 space-y-4 pb-8 sm:space-y-6">
            {/* ---------------------------------------------------------------- */}
            {/* NOTIFICATIONS                                                     */}
            {/* ---------------------------------------------------------------- */}

            {errorMsg && (
                <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-red-800 shadow-sm sm:px-4">
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />

                    <div className="min-w-0">
                        <p className="text-sm font-bold">
                            Action failed
                        </p>

                        <p className="mt-0.5 break-words text-xs">
                            {errorMsg}
                        </p>
                    </div>

                    <button
                        onClick={() => setErrorMsg('')}
                        className="ml-auto shrink-0 rounded-lg p-1 hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {successMsg && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-emerald-800 shadow-sm sm:px-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />

                    <div className="min-w-0">
                        <p className="text-sm font-bold">
                            Action completed
                        </p>

                        <p className="mt-0.5 break-words text-xs">
                            {successMsg}
                        </p>
                    </div>

                    <button
                        onClick={() => setSuccessMsg('')}
                        className="ml-auto shrink-0 rounded-lg p-1 hover:bg-emerald-100"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* ---------------------------------------------------------------- */}
            {/* PAGE HEADER                                                       */}
            {/* ---------------------------------------------------------------- */}

            <div className="flex min-w-0 flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-600 sm:text-xs sm:tracking-[0.18em]">
                        <Users className="h-4 w-4 shrink-0" />
                        User Management
                    </div>

                    <h1 className="text-xl font-black tracking-tight text-slate-950 sm:text-3xl">
                        Student Directory
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-500 sm:text-sm">
                        Manage student profiles, academic
                        information, hostel allocation and
                        monthly fee clearance.
                    </p>
                </div>

                <button
                    onClick={() => fetchData(true)}
                    disabled={loading || refreshing}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            refreshing
                                ? 'animate-spin'
                                : ''
                        }`}
                    />
                    Refresh Directory
                </button>
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* STAT CARDS                                                        */}
            {/* ---------------------------------------------------------------- */}

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
                <StatCard
                    icon={Users}
                    label="Total Students"
                    value={statistics.total}
                    description="Registered accounts"
                    iconClass="text-blue-600"
                />

                <StatCard
                    icon={Home}
                    label="Hostel Residents"
                    value={statistics.residents}
                    description="Students with residence"
                    iconClass="text-violet-600"
                />

                <StatCard
                    icon={CircleDollarSign}
                    label="Paid This Month"
                    value={statistics.paid}
                    description="Current month cleared"
                    iconClass="text-emerald-600"
                />

                <StatCard
                    icon={AlertCircle}
                    label="Pending Fees"
                    value={statistics.pending}
                    description="Requires clearance"
                    iconClass="text-red-600"
                />
            </div>

            {/* ---------------------------------------------------------------- */}
            {/* DIRECTORY CARD                                                    */}
            {/* ---------------------------------------------------------------- */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                {/* TOOLBAR */}

                <div className="min-w-0 border-b border-slate-200 p-3 sm:p-5">
                    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="min-w-0">
                            <h2 className="flex items-center gap-2 text-base font-black text-slate-900">
                                <UserRound className="h-5 w-5 shrink-0 text-blue-600" />
                                Student Records
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Showing {filteredUsers.length} of{' '}
                                {usersList.length} records
                            </p>
                        </div>

                        <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
                            {/* SEARCH */}

                            <div className="relative min-w-0">
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <input
                                    type="text"
                                    placeholder="Search name, roll or ID..."
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-64"
                                />
                            </div>

                            {/* HOSTEL FILTER */}

                            <div className="relative min-w-0">
                                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    value={
                                        selectedHostelFilter
                                    }
                                    onChange={(e) =>
                                        setSelectedHostelFilter(
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-9 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
                                >
                                    <option value="ALL">
                                        All Hostels
                                    </option>

                                    {hostelsList.map(
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
                                            </option>
                                        )
                                    )}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TABLE */}

                <div className="w-full overflow-x-auto">
                    {loading ? (
                        <div className="flex min-h-[320px] flex-col items-center justify-center px-4 sm:min-h-[420px]">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <Loader2 className="h-6 w-6 animate-spin" />
                            </div>

                            <p className="mt-4 text-center text-sm font-bold text-slate-700">
                                Loading student directory...
                            </p>

                            <p className="mt-1 text-center text-xs text-slate-400">
                                Fetching records and payment
                                information
                            </p>
                        </div>
                    ) : (
                        <table className="w-full min-w-[1100px] text-left">
                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">
                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Roll / ID
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Academic
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Hostel
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Contact
                                    </th>

                                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Fee Status
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan="7"
                                            className="py-20 text-center"
                                        >
                                            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
                                                <Users className="h-6 w-6 text-slate-400" />
                                            </div>

                                            <p className="mt-4 text-sm font-bold text-slate-700">
                                                No students found
                                            </p>

                                            <p className="mt-1 text-xs text-slate-400">
                                                Try changing your search
                                                or hostel filter.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map(
                                        (student) => {
                                            const feeStatus =
                                                calculateMemberFeeStatus(
                                                    student
                                                );

                                            return (
                                                <tr
                                                    key={
                                                        student._id
                                                    }
                                                    className="group transition hover:bg-slate-50/70"
                                                >
                                                    {/* STUDENT */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                                                                {student.profilePhoto ? (
                                                                    <img
                                                                        src={
                                                                            student.profilePhoto
                                                                        }
                                                                        alt={
                                                                            student.name
                                                                        }
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <UserIcon className="h-5 w-5 text-slate-400" />
                                                                )}
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-bold text-slate-900">
                                                                    {student.name ||
                                                                        'Unnamed Student'}
                                                                </p>

                                                                <p className="mt-0.5 text-[11px] text-slate-500">
                                                                    {student.gender ||
                                                                        'N/A'}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* ROLL / ID */}

                                                    <td className="px-5 py-4">
                                                        <p className="font-mono text-sm font-black text-slate-900">
                                                            {student.rollNo ||
                                                                '—'}
                                                        </p>

                                                        <p className="mt-1 text-[10px] font-medium text-slate-400">
                                                            {student.studentId
                                                                ? `ID: ${student.studentId}`
                                                                : 'No student ID'}
                                                        </p>
                                                    </td>

                                                    {/* ACADEMIC */}

                                                    <td className="max-w-[250px] px-5 py-4">
                                                        <p className="truncate text-sm font-semibold text-slate-800">
                                                            {student.university ||
                                                                'Course not specified'}
                                                        </p>

                                                        <p className="mt-1 truncate text-[11px] text-slate-500">
                                                            {student.department ||
                                                                'Department N/A'}
                                                        </p>

                                                        <div className="mt-1 flex items-center gap-2">
                                                            <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-blue-700">
                                                                {student.session ||
                                                                    'Session N/A'}
                                                            </span>

                                                            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold text-slate-600">
                                                                {student.category ||
                                                                    'General'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* HOSTEL */}

                                                    <td className="px-5 py-4">
                                                        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5">
                                                            <Home className="h-3.5 w-3.5 text-slate-500" />

                                                            <span className="text-xs font-bold text-slate-700">
                                                                {student.hostelNo ||
                                                                    'N/A'}
                                                            </span>
                                                        </div>
                                                    </td>

                                                    {/* CONTACT */}

                                                    <td className="px-5 py-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                                                                <Phone className="h-3.5 w-3.5 text-slate-400" />
                                                                {student.mobileNo
                                                                    ? `+91 ${student.mobileNo}`
                                                                    : 'N/A'}
                                                            </div>

                                                            {student.email && (
                                                                <div className="flex max-w-[190px] items-center gap-2">
                                                                    <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                                                                    <span className="truncate text-[11px] text-slate-500">
                                                                        {
                                                                            student.email
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* FEE */}

                                                    <td className="px-5 py-4 text-center">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <StatusBadge
                                                                paid={
                                                                    feeStatus.isPaid
                                                                }
                                                            />

                                                            {feeStatus.isPaid ? (
                                                                <>
                                                                    <span className="text-[10px] font-medium text-slate-400">
                                                                        {feeStatus
                                                                            .paymentRecord
                                                                            ?.paymentChannel
                                                                            ?.includes(
                                                                                'Desk'
                                                                            )
                                                                            ? 'Cash Desk'
                                                                            : 'Online Payment'}
                                                                    </span>

                                                                    <button
                                                                        onClick={() =>
                                                                            handleRevokeSettlement(
                                                                                feeStatus.paymentRecord,
                                                                                student.name
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                                                    >
                                                                        <X className="h-3 w-3" />
                                                                        Revoke
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    {feeStatus.fine >
                                                                        0 && (
                                                                        <span className="text-[10px] font-bold text-red-500">
                                                                            +₹
                                                                            {
                                                                                feeStatus.fine
                                                                            }{' '}
                                                                            fine
                                                                        </span>
                                                                    )}

                                                                    <button
                                                                        onClick={() =>
                                                                            handleRecordDeskSettlement(
                                                                                student
                                                                            )
                                                                        }
                                                                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                                                                    >
                                                                        <CreditCard className="h-3.5 w-3.5" />
                                                                        Mark Paid
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>

                                                    {/* ACTIONS */}

                                                    <td className="px-5 py-4">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button
                                                                onClick={() =>
                                                                    openEditModal(
                                                                        student
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                                                                title="Edit student"
                                                            >
                                                                <Pencil className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    promptResetPassword(
                                                                        student,
                                                                        student.name
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-amber-200 hover:bg-amber-50 hover:text-amber-600"
                                                                title="Reset password"
                                                            >
                                                                <KeyRound className="h-4 w-4" />
                                                            </button>

                                                            <button
                                                                onClick={() =>
                                                                    promptRemoveStudent(
                                                                        student,
                                                                        student.name
                                                                    )
                                                                }
                                                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                                                                title="Delete student"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        }
                                    )
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* TABLE FOOTER */}

                {!loading && filteredUsers.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                        <span>
                            {filteredUsers.length} student
                            {filteredUsers.length !== 1
                                ? 's'
                                : ''}{' '}
                            displayed
                        </span>

                        <span className="font-medium">
                            Current month: {currentMonthPrefix}
                        </span>
                    </div>
                )}
            </div>

            {/* ================================================================== */}
            {/* EDIT MODAL                                                         */}
            {/* ================================================================== */}

            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-2 backdrop-blur-sm sm:p-5">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="my-2 flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-0 sm:max-h-[94vh]"
                    >
                        {/* MODAL HEADER */}

                        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-6 sm:py-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-blue-600">
                                    Student Management
                                </p>

                                <h3 className="mt-1 text-base font-black text-slate-900 sm:text-lg">
                                    Edit Student Profile
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Update academic, personal and
                                    residential information.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsEditModalOpen(false)
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 hover:text-slate-900"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* MODAL BODY */}

                        <form
                            onSubmit={handleEditSubmit}
                            className="min-h-0 overflow-y-auto p-4 sm:p-6"
                        >
                            <div className="space-y-6">
                                {/* PROFILE PHOTO */}

                                <div className="flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                                    <div className="relative">
                                        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-slate-200 shadow-md">
                                            {editFormData.profilePhoto ? (
                                                <img
                                                    src={
                                                        editFormData.profilePhoto
                                                    }
                                                    alt="Student"
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <UserIcon className="h-9 w-9 text-slate-400" />
                                            )}
                                        </div>

                                        <label className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border-2 border-white bg-blue-600 text-white shadow-md transition hover:bg-blue-700">
                                            <ImagePlus className="h-4 w-4" />

                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={
                                                    handlePhotoUpload
                                                }
                                            />
                                        </label>
                                    </div>

                                    <p className="mt-3 text-xs font-semibold text-slate-700">
                                        Profile Photo
                                    </p>

                                    <p className="mt-1 text-center text-[10px] text-slate-400">
                                        Image automatically compressed
                                        before upload
                                    </p>
                                </div>

                                {/* PERSONAL INFORMATION */}

                                <section>
                                    <SectionHeader
                                        icon={UserRound}
                                        title="Personal Information"
                                        description="Basic student and family details"
                                    />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field
                                            label="Full Name"
                                            required
                                        >
                                            <input
                                                required
                                                type="text"
                                                value={
                                                    editFormData.name
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            name: e
                                                                .target
                                                                .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            />
                                        </Field>

                                        <Field
                                            label="Father's Name"
                                            required
                                        >
                                            <input
                                                required
                                                type="text"
                                                value={
                                                    editFormData.fatherName
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            fatherName:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            />
                                        </Field>

                                        <Field
                                            label="Mother's Name"
                                            required
                                        >
                                            <input
                                                required
                                                type="text"
                                                value={
                                                    editFormData.motherName
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            motherName:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            />
                                        </Field>

                                        <Field
                                            label="Date of Birth"
                                            required
                                        >
                                            <input
                                                required
                                                type="date"
                                                value={
                                                    editFormData.dob
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            dob: e
                                                                .target
                                                                .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            />
                                        </Field>

                                        <Field label="Gender">
                                            <select
                                                value={
                                                    editFormData.gender
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            gender: e
                                                                .target
                                                                .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
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
                                        </Field>

                                        <Field label="Nationality">
                                            <select
                                                value={
                                                    editFormData.nationality
                                                }
                                                onChange={(e) => {
                                                    const nationality =
                                                        e.target.value;

                                                    const restrict =
                                                        nationality !==
                                                            'India' ||
                                                        editFormData.domicileState !==
                                                            'Punjab';

                                                    setEditFormData({
                                                        ...editFormData,
                                                        nationality,
                                                        category:
                                                            restrict
                                                                ? 'General'
                                                                : editFormData.category,
                                                    });
                                                }}
                                                className="input-modern"
                                            >
                                                {WORLD_COUNTRIES.map(
                                                    (
                                                        country
                                                    ) => (
                                                        <option
                                                            key={
                                                                country
                                                            }
                                                            value={
                                                                country
                                                            }
                                                        >
                                                            {
                                                                country
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>
                                    </div>
                                </section>

                                {/* CONTACT */}

                                <section>
                                    <SectionHeader
                                        icon={Phone}
                                        title="Contact Information"
                                        description="Registered communication details"
                                    />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field
                                            label="Email Address"
                                            required
                                        >
                                            <input
                                                required
                                                type="email"
                                                value={
                                                    editFormData.email
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            email: e
                                                                .target
                                                                .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            />
                                        </Field>

                                        <Field
                                            label="Mobile Number"
                                            required
                                        >
                                            <input
                                                required
                                                type="tel"
                                                maxLength="10"
                                                value={
                                                    editFormData.mobileNo
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            mobileNo:
                                                                e.target.value.replace(
                                                                    /\D/g,
                                                                    ''
                                                                ),
                                                        }
                                                    )
                                                }
                                                className="input-modern font-mono"
                                            />
                                        </Field>
                                    </div>
                                </section>

                                {/* ACADEMIC */}

                                <section className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 sm:p-5">
                                    <SectionHeader
                                        icon={GraduationCap}
                                        title="Academic Information"
                                        description="University, faculty, department and programme"
                                    />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field
                                            label="Campus Roll Number"
                                            required
                                        >
                                            <select
                                                required
                                                value={
                                                    editFormData.newRollNo
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            newRollNo:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern font-mono"
                                            >
                                                <option value="">
                                                    Select roll number
                                                </option>

                                                {ROLL_NUMBERS.map(
                                                    (number) => (
                                                        <option
                                                            key={
                                                                number
                                                            }
                                                            value={
                                                                number
                                                            }
                                                        >
                                                            {number}
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>

                                        <Field
                                            label="Student ID"
                                            required
                                        >
                                            <input
                                                required
                                                type="text"
                                                value={
                                                    editFormData.studentId
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            studentId:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern font-mono"
                                            />
                                        </Field>

                                        <div className="md:col-span-2">
                                            <Field label="Faculty">
                                                <select
                                                    value={
                                                        editFormData.facultyId
                                                    }
                                                    onChange={(e) =>
                                                        handleAdminFacultyChange(
                                                            e
                                                                .target
                                                                .value
                                                        )
                                                    }
                                                    className="input-modern"
                                                >
                                                    <option value="">
                                                        Select faculty
                                                    </option>

                                                    {UNIVERSITY_FACULTIES_HIERARCHY.map(
                                                        (
                                                            faculty
                                                        ) => (
                                                            <option
                                                                key={
                                                                    faculty.id
                                                                }
                                                                value={
                                                                    faculty.id
                                                                }
                                                            >
                                                                {
                                                                    faculty.name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </Field>
                                        </div>

                                        <Field label="Department">
                                            <select
                                                disabled={
                                                    !editFormData.facultyId
                                                }
                                                value={
                                                    editFormData.department
                                                }
                                                onChange={(e) =>
                                                    handleAdminDepartmentChange(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                className="input-modern disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                            >
                                                <option value="">
                                                    {editFormData.facultyId
                                                        ? 'Select department'
                                                        : 'Choose faculty first'}
                                                </option>

                                                {adminAvailableDepartments.map(
                                                    (
                                                        department
                                                    ) => (
                                                        <option
                                                            key={
                                                                department.name
                                                            }
                                                            value={
                                                                department.name
                                                            }
                                                        >
                                                            {
                                                                department.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>

                                        <Field label="Degree Programme">
                                            <select
                                                disabled={
                                                    !editFormData.department
                                                }
                                                value={
                                                    editFormData.university
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            university:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                                            >
                                                <option value="">
                                                    {editFormData.department
                                                        ? 'Select course'
                                                        : 'Choose department first'}
                                                </option>

                                                {adminAvailableProgrammes.map(
                                                    (
                                                        programme
                                                    ) => (
                                                        <option
                                                            key={
                                                                programme.id
                                                            }
                                                            value={
                                                                programme.name
                                                            }
                                                        >
                                                            {
                                                                programme.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>

                                        <Field
                                            label="Academic Session"
                                            required
                                        >
                                            <select
                                                required
                                                value={
                                                    editFormData.session
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            session:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern font-mono"
                                            >
                                                <option value="">
                                                    Select session
                                                </option>

                                                {ACADEMIC_SESSIONS.map(
                                                    (
                                                        session
                                                    ) => (
                                                        <option
                                                            key={
                                                                session.id
                                                            }
                                                            value={
                                                                session.id
                                                            }
                                                        >
                                                            {
                                                                session.name
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>
                                    </div>
                                </section>

                                {/* RESIDENTIAL */}

                                <section>
                                    <SectionHeader
                                        icon={Home}
                                        title="Residential & Category"
                                        description="Hostel allocation and social category"
                                    />

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                        <Field label="Hostel">
                                            <select
                                                value={
                                                    editFormData.hostelNo
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            hostelNo:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern"
                                            >
                                                {hostelsList.map(
                                                    (
                                                        hostel
                                                    ) => (
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
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>

                                        <Field
                                            label="Domicile State"
                                            required
                                        >
                                            <select
                                                required
                                                value={
                                                    editFormData.domicileState
                                                }
                                                onChange={(e) => {
                                                    const domicile =
                                                        e.target.value;

                                                    const restrict =
                                                        editFormData.nationality !==
                                                            'India' ||
                                                        domicile !==
                                                            'Punjab';

                                                    setEditFormData({
                                                        ...editFormData,
                                                        domicileState:
                                                            domicile,
                                                        category:
                                                            restrict
                                                                ? 'General'
                                                                : editFormData.category,
                                                    });
                                                }}
                                                className="input-modern"
                                            >
                                                {INDIAN_STATES.map(
                                                    (
                                                        state
                                                    ) => (
                                                        <option
                                                            key={
                                                                state
                                                            }
                                                            value={
                                                                state
                                                            }
                                                        >
                                                            {
                                                                state
                                                            }
                                                        </option>
                                                    )
                                                )}
                                            </select>
                                        </Field>

                                        <Field label="Social Category">
                                            <select
                                                disabled={
                                                    isGeneralRestricted
                                                }
                                                value={
                                                    editFormData.category
                                                }
                                                onChange={(e) =>
                                                    setEditFormData(
                                                        {
                                                            ...editFormData,
                                                            category:
                                                                e
                                                                    .target
                                                                    .value,
                                                        }
                                                    )
                                                }
                                                className="input-modern disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
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

                                            {isGeneralRestricted && (
                                                <p className="mt-1.5 text-[10px] font-medium text-amber-600">
                                                    Non-Punjab or
                                                    international
                                                    candidates are
                                                    classified as
                                                    General.
                                                </p>
                                            )}
                                        </Field>
                                    </div>
                                </section>
                            </div>

                            {/* MODAL FOOTER */}

                            <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsEditModalOpen(
                                            false
                                        )
                                    }
                                    className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.98]"
                                >
                                    <Check className="h-4 w-4" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================== */}
            {/* PASSWORD MODAL                                                     */}
            {/* ================================================================== */}

            {passwordModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/60 p-3 backdrop-blur-sm sm:p-4">
                    <div
                        role="dialog"
                        aria-modal="true"
                        className="my-2 w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl sm:my-0"
                    >
                        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                                    <Lock className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                    <h3 className="text-sm font-black text-slate-900">
                                        Reset Password
                                    </h3>

                                    <p className="mt-0.5 truncate text-[11px] text-slate-500">
                                        {passwordModal.targetName}
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPasswordModal({
                                        isOpen: false,
                                        targetId: null,
                                        targetName: '',
                                        newPassword: '',
                                    })
                                }
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handlePasswordSubmit}
                            className="p-4 sm:p-5"
                        >
                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-xs leading-relaxed text-amber-800">
                                    Enter a new password for this
                                    student. The password must contain
                                    at least 8 characters.
                                </p>
                            </div>

                            <div className="mt-5">
                                <Field
                                    label="New Password"
                                    required
                                >
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                        <input
                                            required
                                            minLength={8}
                                            type="password"
                                            placeholder="Minimum 8 characters"
                                            value={
                                                passwordModal.newPassword
                                            }
                                            onChange={(e) =>
                                                setPasswordModal(
                                                    {
                                                        ...passwordModal,
                                                        newPassword:
                                                            e
                                                                .target
                                                                .value,
                                                    }
                                                )
                                            }
                                            className="input-modern pl-10"
                                        />
                                    </div>
                                </Field>
                            </div>

                            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setPasswordModal({
                                            isOpen: false,
                                            targetId: null,
                                            targetName: '',
                                            newPassword: '',
                                        })
                                    }
                                    className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-blue-700"
                                >
                                    <KeyRound className="h-4 w-4" />
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* ================================================================== */}
            {/* CONFIRMATION MODAL                                                 */}
            {/* ================================================================== */}

            {confirmModal.isOpen && (
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
            )}

            {/* ================================================================== */}
            {/* GLOBAL INPUT STYLES                                                 */}
            {/* ================================================================== */}

            <style>{`
                .input-modern {
                    width: 100%;
                    height: 42px;
                    border-radius: 10px;
                    border: 1px solid rgb(226 232 240);
                    background: white;
                    padding: 0 12px;
                    font-size: 13px;
                    font-weight: 500;
                    color: rgb(15 23 42);
                    outline: none;
                    transition: all 0.15s ease;
                }

                .input-modern::placeholder {
                    color: rgb(148 163 184);
                }

                .input-modern:focus {
                    border-color: rgb(59 130 246);
                    box-shadow: 0 0 0 3px rgb(219 234 254);
                }

                .input-modern:disabled {
                    cursor: not-allowed;
                    background: rgb(248 250 252);
                    color: rgb(148 163 184);
                }
            `}</style>
        </div>
    );
}