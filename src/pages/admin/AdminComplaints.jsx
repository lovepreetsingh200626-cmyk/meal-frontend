import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import {
    MessageSquareWarning,
    Filter,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Eye,
    RefreshCw,
    ClipboardList,
    Clock3,
    CircleCheck,
    Search,
    ShieldAlert,
    FileWarning
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminComplaints() {
    const [complaintsList, setComplaintsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [complaintStatus, setComplaintStatus] = useState('Pending');
    const [adminRemark, setAdminRemark] = useState('');

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const [previewModalImg, setPreviewModalImg] = useState(null);

    // ---------------------------------------------------------
    // FETCH COMPLAINTS
    // ---------------------------------------------------------

    const fetchComplaints = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const { data } = await API.get('/complaints/all');
            setComplaintsList(data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load grievance records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, []);

    // ---------------------------------------------------------
    // NOTIFICATIONS
    // ---------------------------------------------------------

    const showSuccess = (message) => {
        setSuccessMsg(message);
        setTimeout(() => setSuccessMsg(''), 4000);
    };

    const showError = (message) => {
        setErrorMsg(message);
        setTimeout(() => setErrorMsg(''), 4000);
    };

    // ---------------------------------------------------------
    // OPEN COMPLAINT
    // ---------------------------------------------------------

    const openComplaintModal = (complaint) => {
        setActiveComplaint(complaint);
        setComplaintStatus(
            complaint.status || 'Pending'
        );
        setAdminRemark(
            complaint.adminRemark || ''
        );
        setIsComplaintModalOpen(true);
    };

    // ---------------------------------------------------------
    // UPDATE COMPLAINT
    // ---------------------------------------------------------

    const handleComplaintUpdateSubmit = async (e) => {
        e.preventDefault();

        if (!activeComplaint?._id) return;

        try {
            const { data } = await API.put(
                `/complaints/${activeComplaint._id}`,
                {
                    status: complaintStatus,
                    adminRemark
                }
            );

            setSuccessMsg(
                'Grievance disposition updated successfully.'
            );

            setTimeout(
                () => setSuccessMsg(''),
                4000
            );

            setComplaintsList((prev) =>
                prev.map((complaint) =>
                    complaint._id === activeComplaint._id
                        ? data.complaint
                        : complaint
                )
            );

            setIsComplaintModalOpen(false);
            setActiveComplaint(null);
        } catch (err) {
            console.error(err);

            showError(
                'Failed to update grievance disposition.'
            );
        }
    };

    // ---------------------------------------------------------
    // DELETE COMPLAINT
    // ---------------------------------------------------------

    const promptDeleteComplaint = (complaintId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Grievance Record',
            message:
                'Are you sure you want to remove this grievance from the active redressal docket? This action cannot be undone.',

            onConfirm: async () => {
                try {
                    await API.delete(
                        `/complaints/${complaintId}`
                    );

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    setComplaintsList((prev) =>
                        prev.filter(
                            (complaint) =>
                                complaint._id !== complaintId
                        )
                    );

                    showSuccess(
                        'Grievance record removed successfully.'
                    );
                } catch (err) {
                    console.error(err);

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    showError(
                        'Failed to remove grievance record.'
                    );
                }
            }
        });
    };

    // ---------------------------------------------------------
    // FILTER
    // ---------------------------------------------------------

    const filteredComplaints = useMemo(() => {
        return complaintsList.filter(
            (complaint) =>
                selectedHostelFilter === 'ALL' ||
                complaint.hostelNo === selectedHostelFilter
        );
    }, [
        complaintsList,
        selectedHostelFilter
    ]);

    // ---------------------------------------------------------
    // STATISTICS
    // ---------------------------------------------------------

    const statistics = useMemo(() => {
        const pending = filteredComplaints.filter(
            (c) =>
                !c.status ||
                c.status === 'Pending'
        ).length;

        const inProgress = filteredComplaints.filter(
            (c) =>
                c.status === 'In Progress'
        ).length;

        const resolved = filteredComplaints.filter(
            (c) =>
                c.status === 'Resolved'
        ).length;

        return {
            total: filteredComplaints.length,
            pending,
            inProgress,
            resolved
        };
    }, [filteredComplaints]);

    // ---------------------------------------------------------
    // STATUS HELPERS
    // ---------------------------------------------------------

    const getStatusConfig = (status) => {
        switch (status) {
            case 'Resolved':
                return {
                    label: 'Resolved',
                    icon: CircleCheck,
                    wrapper:
                        'border-emerald-200 bg-emerald-50',
                    text: 'text-emerald-700',
                    dot: 'bg-emerald-500'
                };

            case 'In Progress':
                return {
                    label: 'In Progress',
                    icon: Clock3,
                    wrapper:
                        'border-blue-200 bg-blue-50',
                    text: 'text-blue-700',
                    dot: 'bg-blue-500'
                };

            default:
                return {
                    label: 'Pending',
                    icon: Clock3,
                    wrapper:
                        'border-amber-200 bg-amber-50',
                    text: 'text-amber-700',
                    dot: 'bg-amber-500'
                };
        }
    };

    // ---------------------------------------------------------
    // DATE FORMATTER
    // ---------------------------------------------------------

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';

        try {
            const date = new Date(dateValue);

            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            return date.toLocaleDateString(
                'en-IN',
                {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                }
            );
        } catch {
            return 'N/A';
        }
    };

    // ---------------------------------------------------------
    // STAT CARD
    // ---------------------------------------------------------

    const StatCard = ({
        icon: Icon,
        label,
        value,
        description,
        iconClass
    }) => (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between gap-3">

                <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                        {label}
                    </p>

                    <p className="mt-2 text-2xl font-black tracking-tight text-slate-900">
                        {value}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-500">
                        {description}
                    </p>
                </div>

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon className="h-5 w-5" />
                </div>

            </div>

        </div>
    );

    // ---------------------------------------------------------
    // MAIN UI
    // ---------------------------------------------------------

    return (
        <div className="space-y-6 animate-in fade-in duration-300">

            {/* =================================================
                ALERTS
            ================================================= */}

            {errorMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">

                    <AlertCircle className="h-5 w-5 shrink-0" />

                    <span className="font-semibold">
                        {errorMsg}
                    </span>

                    <button
                        onClick={() => setErrorMsg('')}
                        className="ml-auto rounded-lg p-1 transition hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div>
            )}

            {successMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm">

                    <CheckCircle2 className="h-5 w-5 shrink-0" />

                    <span className="font-semibold">
                        {successMsg}
                    </span>

                    <button
                        onClick={() => setSuccessMsg('')}
                        className="ml-auto rounded-lg p-1 transition hover:bg-emerald-100"
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div>
            )}

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">

                        <MessageSquareWarning className="h-3.5 w-3.5" />

                        Student Welfare

                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Grievance Management
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Review student complaints, inspect
                        submitted evidence and manage redressal
                        status from one central dashboard.
                    </p>

                </div>

                <button
                    onClick={fetchComplaints}
                    disabled={loading}
                    className="print:hidden inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
                >

                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading
                                ? 'animate-spin'
                                : ''
                        }`}
                    />

                    Refresh

                </button>

            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={ClipboardList}
                    label="Total Cases"
                    value={statistics.total}
                    description="Cases in current view"
                    iconClass="bg-blue-50 text-blue-700"
                />

                <StatCard
                    icon={Clock3}
                    label="Pending"
                    value={statistics.pending}
                    description="Awaiting action"
                    iconClass="bg-amber-50 text-amber-700"
                />

                <StatCard
                    icon={ShieldAlert}
                    label="In Progress"
                    value={statistics.inProgress}
                    description="Under active review"
                    iconClass="bg-blue-50 text-blue-700"
                />

                <StatCard
                    icon={CircleCheck}
                    label="Resolved"
                    value={statistics.resolved}
                    description="Successfully closed"
                    iconClass="bg-emerald-50 text-emerald-700"
                />

            </div>

            {/* =================================================
                GRIEVANCE LEDGER
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TOOLBAR */}

                <div className="border-b border-slate-200 bg-white p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>

                            <h2 className="text-base font-black text-slate-900">
                                Student Grievance Docket
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                Review and manage submitted
                                complaints and evidence.
                            </p>

                        </div>

                        <div className="print:hidden relative">

                            <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                            <select
                                value={selectedHostelFilter}
                                onChange={(e) =>
                                    setSelectedHostelFilter(
                                        e.target.value
                                    )
                                }
                                className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-52"
                            >

                                <option value="ALL">
                                    All Hostels
                                </option>

                                <option value="BH1">BH1</option>
                                <option value="BH2">BH2</option>
                                <option value="BH3">BH3</option>

                                <option value="GH1">GH1</option>
                                <option value="GH2">GH2</option>
                                <option value="GH3">GH3</option>
                                <option value="GH4">GH4</option>

                            </select>

                            <Search className="pointer-events-none absolute right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-slate-400" />

                        </div>

                    </div>

                </div>

                {/* CONTENT */}

                {loading ? (

                    <div className="flex min-h-[360px] flex-col items-center justify-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-700">
                            Loading grievance records...
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Synchronizing the welfare docket.
                        </p>

                    </div>

                ) : filteredComplaints.length === 0 ? (

                    <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                            <FileWarning className="h-7 w-7 text-slate-400" />
                        </div>

                        <h3 className="mt-4 text-base font-black text-slate-800">
                            No grievance records found
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                            There are no complaints matching
                            the selected hostel filter.
                        </p>

                        {selectedHostelFilter !== 'ALL' && (
                            <button
                                onClick={() =>
                                    setSelectedHostelFilter(
                                        'ALL'
                                    )
                                }
                                className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                            >
                                Show All Cases
                            </button>
                        )}

                    </div>

                ) : (

                    <div className="grid max-h-[65vh] grid-cols-1 gap-4 overflow-y-auto bg-slate-50/60 p-4 sm:p-5 xl:grid-cols-2">

                        {filteredComplaints.map(
                            (complaint) => {

                                const statusConfig =
                                    getStatusConfig(
                                        complaint.status
                                    );

                                const StatusIcon =
                                    statusConfig.icon;

                                return (
                                    <div
                                        key={
                                            complaint._id
                                        }
                                        className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                    >

                                        {/* CARD TOP */}

                                        <div className="border-b border-slate-100 p-4 sm:p-5">

                                            <div className="flex items-start justify-between gap-3">

                                                <div className="flex min-w-0 items-center gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                        <MessageSquareWarning className="h-5 w-5" />
                                                    </div>

                                                    <div className="min-w-0">

                                                        <div className="flex flex-wrap items-center gap-2">

                                                            <span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-600">
                                                                {complaint.category ||
                                                                    'General'}
                                                            </span>

                                                            <span className="rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-[9px] font-bold text-slate-600">
                                                                {complaint.hostelNo ||
                                                                    'N/A'}
                                                            </span>

                                                        </div>

                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            Case submitted{' '}
                                                            {formatDate(
                                                                complaint.createdAt
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>

                                                <span
                                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold ${statusConfig.wrapper} ${statusConfig.text}`}
                                                >

                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${statusConfig.dot}`}
                                                    />

                                                    {statusConfig.label}

                                                </span>

                                            </div>

                                        </div>

                                        {/* CARD BODY */}

                                        <div className="flex flex-1 flex-col p-4 sm:p-5">

                                            <h3 className="text-sm font-black text-slate-900">
                                                {complaint.subject ||
                                                    'Untitled Complaint'}
                                            </h3>

                                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                                {complaint.description ||
                                                    'No description provided.'}
                                            </p>

                                            {/* PHOTO PROOF */}

                                            {complaint.photoProof && (
                                                <div className="mt-4">

                                                    <div className="mb-2 flex items-center gap-2">

                                                        <Eye className="h-3.5 w-3.5 text-blue-600" />

                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                                            Evidence Attached
                                                        </span>

                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setPreviewModalImg(
                                                                complaint.photoProof
                                                            )
                                                        }
                                                        className="group/image relative h-28 w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 sm:h-32"
                                                    >

                                                        <img
                                                            src={
                                                                complaint.photoProof
                                                            }
                                                            alt="Complaint evidence"
                                                            className="h-full w-full object-cover transition duration-300 group-hover/image:scale-105"
                                                        />

                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950/50 opacity-0 transition group-hover/image:opacity-100">

                                                            <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[10px] font-bold text-slate-800 shadow-lg">
                                                                <Eye className="h-3.5 w-3.5" />
                                                                Inspect Evidence
                                                            </span>

                                                        </div>

                                                    </button>

                                                </div>
                                            )}

                                            {/* STUDENT DETAILS */}

                                            <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3">

                                                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                                    <div>

                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                            Complainant
                                                        </p>

                                                        <p className="mt-0.5 text-xs font-black text-slate-800">
                                                            {complaint.userId?.name ||
                                                                'Unknown Student'}
                                                        </p>

                                                    </div>

                                                    <div className="text-left sm:text-right">

                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                            Roll Number
                                                        </p>

                                                        <p className="mt-0.5 font-mono text-xs font-bold text-blue-700">
                                                            {complaint.userId?.rollNo ||
                                                                'N/A'}
                                                        </p>

                                                    </div>

                                                </div>

                                                {complaint.userId?.mobileNo && (
                                                    <div className="mt-2 border-t border-slate-200 pt-2">

                                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                                            Contact
                                                        </p>

                                                        <p className="mt-0.5 font-mono text-xs font-semibold text-slate-600">
                                                            +91{' '}
                                                            {
                                                                complaint
                                                                    .userId
                                                                    .mobileNo
                                                            }
                                                        </p>

                                                    </div>
                                                )}

                                            </div>

                                            {/* ADMIN REMARK */}

                                            {complaint.adminRemark && (
                                                <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 p-3">

                                                    <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">
                                                        Administrative Remark
                                                    </p>

                                                    <p className="mt-1 text-xs leading-5 text-slate-700">
                                                        {
                                                            complaint.adminRemark
                                                        }
                                                    </p>

                                                </div>
                                            )}

                                            {/* ACTIONS */}

                                            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">

                                                <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-400">

                                                    <StatusIcon className="h-3.5 w-3.5" />

                                                    {statusConfig.label}

                                                </div>

                                                <div className="flex items-center gap-2 print:hidden">

                                                    <button
                                                        onClick={() =>
                                                            openComplaintModal(
                                                                complaint
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-3.5 py-2 text-[10px] font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
                                                    >
                                                        <ClipboardList className="h-3.5 w-3.5" />
                                                        Manage
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            promptDeleteComplaint(
                                                                complaint._id
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                                                        title="Delete grievance"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                </div>

                                            </div>

                                        </div>

                                    </div>
                                );
                            }
                        )}

                    </div>
                )}

                {/* FOOTER */}

                {!loading &&
                    filteredComplaints.length > 0 && (
                        <div className="flex flex-col gap-2 border-t border-slate-200 bg-white px-5 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                            <span>
                                Showing{' '}
                                <strong className="text-slate-700">
                                    {
                                        filteredComplaints.length
                                    }
                                </strong>{' '}
                                grievance cases
                            </span>

                            <span>
                                Pending:{' '}
                                <strong className="text-amber-600">
                                    {statistics.pending}
                                </strong>
                                {' · '}
                                Resolved:{' '}
                                <strong className="text-emerald-600">
                                    {statistics.resolved}
                                </strong>
                            </span>

                        </div>
                    )}

            </div>

            {/* =================================================
                ADJUDICATE MODAL
            ================================================= */}

            {isComplaintModalOpen &&
                activeComplaint && (
                    <div
                        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                        role="dialog"
                        aria-modal="true"
                    >

                        <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                            {/* HEADER */}

                            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                        <ClipboardList className="h-5 w-5" />
                                    </div>

                                    <div>

                                        <h3 className="text-sm font-black text-slate-900">
                                            Manage Grievance
                                        </h3>

                                        <p className="mt-0.5 text-[11px] text-slate-500">
                                            Update case disposition
                                        </p>

                                    </div>

                                </div>

                                <button
                                    onClick={() =>
                                        setIsComplaintModalOpen(
                                            false
                                        )
                                    }
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                                >
                                    <X className="h-5 w-5" />
                                </button>

                            </div>

                            {/* FORM */}

                            <form
                                onSubmit={
                                    handleComplaintUpdateSubmit
                                }
                                className="overflow-y-auto p-5 sm:p-6"
                            >

                                {/* CASE SUMMARY */}

                                <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4">

                                    <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                        Complaint
                                    </p>

                                    <h4 className="mt-1 text-sm font-black text-slate-900">
                                        {
                                            activeComplaint.subject
                                        }
                                    </h4>

                                    <p className="mt-2 text-xs leading-5 text-slate-600">
                                        {
                                            activeComplaint.description
                                        }
                                    </p>

                                </div>

                                {/* STATUS */}

                                <div>

                                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                        Redressal Status
                                    </label>

                                    <select
                                        value={
                                            complaintStatus
                                        }
                                        onChange={(e) =>
                                            setComplaintStatus(
                                                e.target.value
                                            )
                                        }
                                        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                    >

                                        <option value="Pending">
                                            Pending Committee Assignment
                                        </option>

                                        <option value="In Progress">
                                            Active Formal Inquiry
                                        </option>

                                        <option value="Resolved">
                                            Adjudicated &amp; Resolved
                                        </option>

                                    </select>

                                </div>

                                {/* REMARK */}

                                <div className="mt-4">

                                    <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                        Administrative Remark
                                    </label>

                                    <textarea
                                        rows="5"
                                        value={
                                            adminRemark
                                        }
                                        onChange={(e) =>
                                            setAdminRemark(
                                                e.target.value
                                            )
                                        }
                                        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                        placeholder="Enter administrative findings, actions taken or directives..."
                                    />

                                </div>

                                {/* SUBMIT */}

                                <button
                                    type="submit"
                                    className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
                                >

                                    <CheckCircle2 className="h-4 w-4" />

                                    Save Disposition

                                </button>

                            </form>

                        </div>

                    </div>
                )}

            {/* =================================================
                IMAGE PREVIEW MODAL
            ================================================= */}

            {previewModalImg && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    onClick={() =>
                        setPreviewModalImg(null)
                    }
                >

                    <div
                        className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">

                            <div className="flex items-center gap-2">

                                <Eye className="h-4 w-4 text-blue-400" />

                                <span className="text-xs font-bold text-white">
                                    Evidence Inspection
                                </span>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setPreviewModalImg(null)
                                }
                                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        <div className="flex max-h-[78vh] items-center justify-center overflow-auto bg-slate-950 p-3">

                            <img
                                src={previewModalImg}
                                alt="Complaint evidence"
                                className="max-h-[72vh] max-w-full rounded-lg object-contain"
                            />

                        </div>

                    </div>

                </div>
            )}

            {/* =================================================
                CONFIRM MODAL
            ================================================= */}

            {confirmModal.isOpen && (
                <ConfirmModal
                    isOpen={
                        confirmModal.isOpen
                    }
                    title={
                        confirmModal.title
                    }
                    message={
                        confirmModal.message
                    }
                    onConfirm={
                        confirmModal.onConfirm
                    }
                    onClose={() =>
                        setConfirmModal({
                            ...confirmModal,
                            isOpen: false
                        })
                    }
                />
            )}

        </div>
    );
}