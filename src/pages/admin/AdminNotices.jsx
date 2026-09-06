import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import {
    BellRing,
    Send,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Megaphone,
    FileText,
    Users,
    Building2,
    X,
    CalendarDays,
    ShieldCheck
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminNotices() {
    const [noticesList, setNoticesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeHostel, setNoticeHostel] = useState('ALL');
    const [postingNotice, setPostingNotice] = useState(false);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // ---------------------------------------------------------
    // FETCH NOTICES
    // ---------------------------------------------------------

    const fetchNotices = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const { data } = await API.get('/notices');
            setNoticesList(data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load notice records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
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
    // CREATE NOTICE
    // ---------------------------------------------------------

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();

        if (!noticeTitle.trim() || !noticeContent.trim()) {
            return;
        }

        setPostingNotice(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            const { data } = await API.post('/notices', {
                title: noticeTitle.trim(),
                content: noticeContent.trim(),
                hostelNo: noticeHostel,
                postedBy: 'Executive Committee Authority'
            });

            setNoticeTitle('');
            setNoticeContent('');
            setNoticeHostel('ALL');

            setNoticesList((prev) => [
                data.notice,
                ...prev
            ]);

            showSuccess(
                'Notice published successfully.'
            );
        } catch (err) {
            console.error(err);

            showError(
                'Failed to publish notice.'
            );
        } finally {
            setPostingNotice(false);
        }
    };

    // ---------------------------------------------------------
    // DELETE NOTICE
    // ---------------------------------------------------------

    const promptDeleteNotice = (noticeId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Remove Notice',
            message:
                'Are you sure you want to remove this notice from the student notice board? This action cannot be undone.',

            onConfirm: async () => {
                try {
                    await API.delete(
                        `/notices/${noticeId}`
                    );

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    setNoticesList((prev) =>
                        prev.filter(
                            (notice) =>
                                notice._id !== noticeId
                        )
                    );

                    showSuccess(
                        'Notice removed successfully.'
                    );
                } catch (err) {
                    console.error(err);

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    showError(
                        'Failed to remove notice.'
                    );
                }
            }
        });
    };

    // ---------------------------------------------------------
    // STATISTICS
    // ---------------------------------------------------------

    const statistics = useMemo(() => {
        const campusWide = noticesList.filter(
            (notice) =>
                notice.hostelNo === 'ALL'
        ).length;

        const hostelSpecific =
            noticesList.length - campusWide;

        const hostels = new Set(
            noticesList
                .filter(
                    (notice) =>
                        notice.hostelNo &&
                        notice.hostelNo !== 'ALL'
                )
                .map(
                    (notice) =>
                        notice.hostelNo
                )
        ).size;

        return {
            total: noticesList.length,
            campusWide,
            hostelSpecific,
            hostels
        };
    }, [noticesList]);

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
                        onClick={() =>
                            setErrorMsg('')
                        }
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
                        onClick={() =>
                            setSuccessMsg('')
                        }
                        className="ml-auto rounded-lg p-1 transition hover:bg-emerald-100"
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div>
            )}

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>

                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">

                        <BellRing className="h-3.5 w-3.5" />

                        Communication Centre

                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Notice Management
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Publish official announcements and
                        distribute important information to
                        students across selected residences.
                    </p>

                </div>

                <button
                    onClick={fetchNotices}
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

                    Refresh Notices

                </button>

            </div>

            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={FileText}
                    label="Active Notices"
                    value={statistics.total}
                    description="Published announcements"
                    iconClass="bg-blue-50 text-blue-700"
                />

                <StatCard
                    icon={Users}
                    label="Campus Wide"
                    value={statistics.campusWide}
                    description="Visible to all residences"
                    iconClass="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    icon={Building2}
                    label="Residence Specific"
                    value={statistics.hostelSpecific}
                    description="Targeted announcements"
                    iconClass="bg-amber-50 text-amber-700"
                />

                <StatCard
                    icon={Megaphone}
                    label="Residences"
                    value={statistics.hostels}
                    description="Currently targeted"
                    iconClass="bg-violet-50 text-violet-700"
                />

            </div>

            {/* =================================================
                PUBLISH NOTICE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                            <Megaphone className="h-5 w-5" />
                        </div>

                        <div>

                            <h2 className="text-base font-black text-slate-900">
                                Publish New Notice
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Create an official announcement
                                for students.
                            </p>

                        </div>

                    </div>

                </div>

                <form
                    onSubmit={handleNoticeSubmit}
                    className="p-5 sm:p-6"
                >

                    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">

                        {/* TITLE */}

                        <div className="lg:col-span-2">

                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Notice Title
                            </label>

                            <input
                                required
                                type="text"
                                value={noticeTitle}
                                onChange={(e) =>
                                    setNoticeTitle(
                                        e.target.value
                                    )
                                }
                                placeholder="Enter the announcement title..."
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                        {/* TARGET */}

                        <div>

                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Target Residence
                            </label>

                            <select
                                value={noticeHostel}
                                onChange={(e) =>
                                    setNoticeHostel(
                                        e.target.value
                                    )
                                }
                                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="ALL">
                                    All Residences — Campus Wide
                                </option>

                                <option value="BH1">
                                    BH1 Only
                                </option>

                                <option value="BH2">
                                    BH2 Only
                                </option>

                                <option value="BH3">
                                    BH3 Only
                                </option>

                                <option value="GH1">
                                    GH1 Only
                                </option>

                                <option value="GH2">
                                    GH2 Only
                                </option>

                                <option value="GH3">
                                    GH3 Only
                                </option>

                                <option value="GH4">
                                    GH4 Only
                                </option>

                            </select>

                        </div>

                        {/* AUTHORITY */}

                        <div>

                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Publishing Authority
                            </label>

                            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">

                                <ShieldCheck className="h-4 w-4 text-blue-600" />

                                <span className="text-xs font-semibold text-slate-600">
                                    Executive Committee Authority
                                </span>

                            </div>

                        </div>

                        {/* CONTENT */}

                        <div className="lg:col-span-2">

                            <label className="mb-2 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                Notice Content
                            </label>

                            <textarea
                                required
                                rows="5"
                                value={noticeContent}
                                onChange={(e) =>
                                    setNoticeContent(
                                        e.target.value
                                    )
                                }
                                placeholder="Write the complete announcement, instructions, dates or other relevant information..."
                                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>

                    </div>

                    {/* SUBMIT */}

                    <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">

                        <p className="text-[11px] text-slate-400">
                            The notice will immediately become
                            visible to its selected audience.
                        </p>

                        <button
                            type="submit"
                            disabled={postingNotice}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {postingNotice ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Publishing...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Publish Notice
                                </>
                            )}

                        </button>

                    </div>

                </form>

            </div>

            {/* =================================================
                NOTICE ARCHIVE
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="flex flex-col gap-2 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">

                    <div>

                        <h2 className="text-base font-black text-slate-900">
                            Published Notices
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Current announcements available
                            on the student notice board.
                        </p>

                    </div>

                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[10px] font-bold text-slate-600">

                        <FileText className="h-3.5 w-3.5" />

                        {noticesList.length} Active

                    </div>

                </div>

                {loading ? (

                    <div className="flex min-h-[320px] flex-col items-center justify-center">

                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">

                            <Loader2 className="h-6 w-6 animate-spin text-blue-700" />

                        </div>

                        <p className="mt-4 text-sm font-bold text-slate-700">
                            Loading notices...
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                            Synchronizing announcement records.
                        </p>

                    </div>

                ) : noticesList.length === 0 ? (

                    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">

                            <BellRing className="h-7 w-7 text-slate-400" />

                        </div>

                        <h3 className="mt-4 text-base font-black text-slate-800">
                            No active notices
                        </h3>

                        <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                            Published announcements will
                            appear here.
                        </p>

                    </div>

                ) : (

                    <div className="grid grid-cols-1 gap-4 bg-slate-50/60 p-4 sm:p-5 xl:grid-cols-2">

                        {noticesList.map(
                            (notice) => (
                                <div
                                    key={notice._id}
                                    className="group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                                >

                                    {/* NOTICE HEADER */}

                                    <div className="border-b border-slate-100 p-4 sm:p-5">

                                        <div className="flex items-start justify-between gap-3">

                                            <div className="flex min-w-0 items-start gap-3">

                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">

                                                    <BellRing className="h-5 w-5" />

                                                </div>

                                                <div className="min-w-0">

                                                    <div className="flex flex-wrap items-center gap-2">

                                                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-700">

                                                            Target: {notice.hostelNo || 'ALL'}

                                                        </span>

                                                        <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[9px] font-bold text-emerald-700">

                                                            Published

                                                        </span>

                                                    </div>

                                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-slate-400">

                                                        <span className="inline-flex items-center gap-1">

                                                            <CalendarDays className="h-3 w-3" />

                                                            {formatDate(
                                                                notice.createdAt
                                                            )}

                                                        </span>

                                                        <span>
                                                            •
                                                        </span>

                                                        <span className="truncate">
                                                            {notice.postedBy ||
                                                                'Executive Committee Authority'}
                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                            <button
                                                onClick={() =>
                                                    promptDeleteNotice(
                                                        notice._id
                                                    )
                                                }
                                                title="Remove notice"
                                                className="print:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-red-50 text-red-600 transition hover:bg-red-600 hover:text-white"
                                            >

                                                <Trash2 className="h-4 w-4" />

                                            </button>

                                        </div>

                                    </div>

                                    {/* NOTICE CONTENT */}

                                    <div className="flex flex-1 flex-col p-4 sm:p-5">

                                        <h3 className="text-sm font-black leading-5 text-slate-900">
                                            {notice.title}
                                        </h3>

                                        <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-3">

                                            <p className="whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                                {notice.content}
                                            </p>

                                        </div>

                                        <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3 text-[10px] text-slate-400">

                                            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />

                                            <span>
                                                Officially published by{' '}
                                                <strong className="text-slate-600">
                                                    {notice.postedBy ||
                                                        'Executive Committee Authority'}
                                                </strong>
                                            </span>

                                        </div>

                                    </div>

                                </div>
                            )
                        )}

                    </div>
                )}

            </div>

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