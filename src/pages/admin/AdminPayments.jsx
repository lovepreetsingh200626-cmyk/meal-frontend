import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import {
    CreditCard,
    Filter,
    Printer,
    Trash2,
    X,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Landmark,
    RefreshCw,
    Receipt,
    IndianRupee,
    Users,
    ShieldCheck,
    ChevronDown,
    WalletCards
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminPayments() {
    const [paymentsList, setPaymentsList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
    const [receiptModalData, setReceiptModalData] = useState(null);

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // ---------------------------------------------------------
    // FETCH DATA
    // ---------------------------------------------------------

    const fetchData = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const [resPay, resUsers] = await Promise.all([
                API.get('/payments/admin/all-payments'),
                API.get('/auth/users')
            ]);

            setPaymentsList(resPay.data || []);
            setUsersList(resUsers.data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to fetch payment records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
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
    // RESOLVE STUDENT ID
    // ---------------------------------------------------------

    const getStudentIdFromRoster = (payment) => {
        if (
            payment?.studentId &&
            payment.studentId !== 'N/A'
        ) {
            return payment.studentId;
        }

        const matchedUser = usersList.find((u) => {
            const idMatch =
                payment.userId &&
                (
                    u._id === payment.userId ||
                    u._id === payment.userId?._id ||
                    u.id === payment.userId
                );

            const rollMatch =
                payment.rollNo &&
                u.rollNo &&
                String(u.rollNo).trim() ===
                    String(payment.rollNo).trim();

            return idMatch || rollMatch;
        });

        return (
            matchedUser?.studentId ||
            payment.userId?.studentId ||
            'N/A'
        );
    };

    // ---------------------------------------------------------
    // REVOKE PAYMENT
    // ---------------------------------------------------------

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
            title: 'Revoke Payment Clearance',
            message: `Confirm revocation of the payment clearance for ${studentName}? The transaction will be removed from the payment ledger.`,

            onConfirm: async () => {
                setConfirmModal((prev) => ({
                    ...prev,
                    isOpen: false
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
                            (p) =>
                                p._id !== paymentId &&
                                p.id !== paymentId
                        )
                    );

                    showSuccess(
                        `Payment clearance for ${studentName} was revoked successfully.`
                    );
                } catch (err) {
                    console.error(err);

                    showError(
                        'Failed to revoke payment clearance.'
                    );
                }
            }
        });
    };

    // ---------------------------------------------------------
    // FILTER PAYMENTS
    // ---------------------------------------------------------

    const filteredPayments = useMemo(() => {
        return paymentsList.filter(
            (payment) =>
                selectedHostelFilter === 'ALL' ||
                payment.hostelNo === selectedHostelFilter
        );
    }, [
        paymentsList,
        selectedHostelFilter
    ]);

    // ---------------------------------------------------------
    // PAYMENT STATISTICS
    // ---------------------------------------------------------

    const statistics = useMemo(() => {
        const totalAmount = filteredPayments.reduce(
            (sum, payment) =>
                sum + (Number(payment.amount) || 0),
            0
        );

        const uniqueStudents = new Set(
            filteredPayments.map(
                (payment) =>
                    payment.userId?._id ||
                    payment.userId ||
                    payment.rollNo ||
                    payment.studentId
            )
        );

        const channels = new Set(
            filteredPayments.map(
                (payment) =>
                    payment.paymentChannel ||
                    payment.paymentMode ||
                    'Treasury Desk'
            )
        );

        return {
            transactions: filteredPayments.length,
            totalAmount,
            students: uniqueStudents.size,
            channels: channels.size
        };
    }, [filteredPayments]);

    // ---------------------------------------------------------
    // FORMAT DATE
    // ---------------------------------------------------------

    const formatDateTime = (payment) => {
        const value =
            payment?.createdAt ||
            payment?.paymentDate ||
            payment?.date;

        if (!value) return 'N/A';

        try {
            const date = new Date(value);

            if (isNaN(date.getTime())) {
                return 'N/A';
            }

            return date.toLocaleString('en-IN', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
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
        description
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

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
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

            {/* -------------------------------------------------
                ALERTS
            ------------------------------------------------- */}

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

            {/* -------------------------------------------------
                PAGE HEADER
            ------------------------------------------------- */}

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

                <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        <WalletCards className="h-3.5 w-3.5" />
                        Finance Management
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Payment Clearances
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Review student fee settlements, verify
                        payment references and manage financial
                        clearance records.
                    </p>
                </div>

                <button
                    onClick={fetchData}
                    disabled={loading}
                    className="print:hidden inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 lg:self-auto"
                >
                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading ? 'animate-spin' : ''
                        }`}
                    />
                    Refresh
                </button>

            </div>

            {/* -------------------------------------------------
                STATISTICS
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={Receipt}
                    label="Transactions"
                    value={statistics.transactions}
                    description="Recorded settlements"
                />

                <StatCard
                    icon={IndianRupee}
                    label="Collected Amount"
                    value={`₹${statistics.totalAmount.toLocaleString(
                        'en-IN'
                    )}`}
                    description="Across filtered records"
                />

                <StatCard
                    icon={Users}
                    label="Students"
                    value={statistics.students}
                    description="Unique payers"
                />

                <StatCard
                    icon={ShieldCheck}
                    label="Payment Channels"
                    value={statistics.channels}
                    description="Channels represented"
                />

            </div>

            {/* -------------------------------------------------
                PAYMENT LEDGER
            ------------------------------------------------- */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TOOLBAR */}

                <div className="border-b border-slate-200 bg-white p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>
                            <h2 className="text-base font-black text-slate-900">
                                Financial Settlement Ledger
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredPayments.length}{' '}
                                payment records currently displayed
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

                            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        </div>

                    </div>
                </div>

                {/* TABLE */}

                <div className="overflow-x-auto">

                    {loading ? (

                        <div className="flex min-h-[360px] flex-col items-center justify-center">

                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                                <Loader2 className="h-6 w-6 animate-spin text-blue-700" />
                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-700">
                                Loading payment records...
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Synchronizing the financial ledger.
                            </p>

                        </div>

                    ) : filteredPayments.length === 0 ? (

                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                <CreditCard className="h-7 w-7 text-slate-400" />
                            </div>

                            <h3 className="mt-4 text-base font-black text-slate-800">
                                No payment records found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                No financial settlements match
                                the currently selected hostel.
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
                                    Show All Payments
                                </button>
                            )}

                        </div>

                    ) : (

                        <table className="w-full min-w-[1100px] border-collapse text-left">

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Date & Time
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Receipt / Reference
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Hostel
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Payment Channel
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Amount
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500 print:hidden">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredPayments.map((payment) => {

                                    const resolvedStudentId =
                                        getStudentIdFromRoster(
                                            payment
                                        );

                                    const studentName =
                                        payment.studentName ||
                                        payment.userId?.name ||
                                        'Candidate';

                                    const rollNo =
                                        payment.rollNo ||
                                        payment.userId?.rollNo ||
                                        'N/A';

                                    const hostel =
                                        payment.hostelNo ||
                                        'N/A';

                                    const channel =
                                        payment.paymentChannel ||
                                        payment.paymentMode ||
                                        'Treasury Desk';

                                    return (
                                        <tr
                                            key={
                                                payment._id ||
                                                payment.id
                                            }
                                            className="group transition hover:bg-slate-50/80"
                                        >

                                            {/* DATE */}

                                            <td className="px-5 py-4 align-top">

                                                <div className="flex items-start gap-3">

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                        <CreditCard className="h-4 w-4" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-semibold text-slate-700">
                                                            {formatDateTime(
                                                                payment
                                                            )}
                                                        </p>

                                                        <p className="mt-1 text-[10px] text-slate-400">
                                                            Settlement recorded
                                                        </p>
                                                    </div>

                                                </div>

                                            </td>

                                            {/* RECEIPT */}

                                            <td className="px-5 py-4 align-top">

                                                <p className="font-mono text-sm font-black text-blue-700">
                                                    {payment.receiptNo ||
                                                        'N/A'}
                                                </p>

                                                <p className="mt-1 max-w-[180px] truncate font-mono text-[10px] text-slate-400">
                                                    {payment.txnId ||
                                                        'No transaction reference'}
                                                </p>

                                            </td>

                                            {/* STUDENT */}

                                            <td className="px-5 py-4 align-top">

                                                <p className="text-sm font-bold text-slate-800">
                                                    {studentName}
                                                </p>

                                                <div className="mt-1 flex flex-wrap gap-2">

                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                                                        Roll {rollNo}
                                                    </span>

                                                    <span className="rounded-md bg-blue-50 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-700">
                                                        ID {resolvedStudentId}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* HOSTEL */}

                                            <td className="px-5 py-4 text-center align-top">

                                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] font-black text-slate-700">
                                                    {hostel}
                                                </span>

                                            </td>

                                            {/* CHANNEL */}

                                            <td className="px-5 py-4 align-top">

                                                <div className="flex items-center gap-2">

                                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                                                        <Landmark className="h-4 w-4" />
                                                    </div>

                                                    <span className="max-w-[180px] text-xs font-semibold text-slate-700">
                                                        {channel}
                                                    </span>

                                                </div>

                                            </td>

                                            {/* AMOUNT */}

                                            <td className="px-5 py-4 text-right align-top">

                                                <p className="text-base font-black text-slate-900">
                                                    ₹
                                                    {Number(
                                                        payment.amount
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </p>

                                                <span className="mt-0.5 block text-[9px] font-bold uppercase tracking-wider text-emerald-600">
                                                    Cleared
                                                </span>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4 text-right align-top print:hidden">

                                                <div className="flex justify-end gap-1.5 opacity-70 transition group-hover:opacity-100">

                                                    <button
                                                        onClick={() =>
                                                            setReceiptModalData(
                                                                {
                                                                    ...payment,
                                                                    studentId:
                                                                        resolvedStudentId
                                                                }
                                                            )
                                                        }
                                                        className="flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[10px] font-bold text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        title="View receipt"
                                                    >
                                                        <Printer className="h-4 w-4" />
                                                        <span className="hidden lg:inline">
                                                            Receipt
                                                        </span>
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleRevokeSettlement(
                                                                payment,
                                                                studentName
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
                                                        title="Revoke payment"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                })}

                            </tbody>

                        </table>
                    )}

                </div>

                {/* FOOTER */}

                {!loading &&
                    filteredPayments.length > 0 && (
                        <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                            <span>
                                Showing{' '}
                                <strong className="text-slate-700">
                                    {filteredPayments.length}
                                </strong>{' '}
                                payment transactions
                            </span>

                            <span>
                                Total collected:{' '}
                                <strong className="text-slate-800">
                                    ₹
                                    {statistics.totalAmount.toLocaleString(
                                        'en-IN'
                                    )}
                                </strong>
                            </span>

                        </div>
                    )}

            </div>

            {/* -------------------------------------------------
                RECEIPT MODAL
            ------------------------------------------------- */}

            {receiptModalData && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >

                    <div className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-4 print:hidden sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Receipt className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-slate-900">
                                        Payment Receipt
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Official financial clearance record
                                    </p>
                                </div>

                            </div>

                            <button
                                onClick={() =>
                                    setReceiptModalData(null)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        {/* RECEIPT */}

                        <div className="overflow-y-auto p-5 sm:p-6">

                            <div className="rounded-xl border border-slate-300 bg-white">

                                {/* RECEIPT BRANDING */}

                                <div className="border-b border-slate-200 px-5 py-5 text-center">

                                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-950 text-white">
                                        <Landmark className="h-6 w-6" />
                                    </div>

                                    <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                        Hostel Mess Management
                                    </p>

                                    <h2 className="mt-1 text-sm font-black uppercase text-slate-900">
                                        Payment Clearance Receipt
                                    </h2>

                                    <div className="mx-auto mt-3 h-px w-16 bg-blue-600" />

                                </div>

                                {/* RECEIPT META */}

                                <div className="grid grid-cols-2 gap-3 border-b border-slate-200 bg-slate-50 p-4">

                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                            Receipt Number
                                        </p>

                                        <p className="mt-1 font-mono text-xs font-black text-blue-700">
                                            {receiptModalData.receiptNo ||
                                                'N/A'}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                            Transaction ID
                                        </p>

                                        <p className="mt-1 truncate font-mono text-xs font-bold text-slate-700">
                                            {receiptModalData.txnId ||
                                                'N/A'}
                                        </p>
                                    </div>

                                    <div className="col-span-2">
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                                            Payment Date
                                        </p>

                                        <p className="mt-1 text-xs font-semibold text-slate-700">
                                            {formatDateTime(
                                                receiptModalData
                                            )}
                                        </p>
                                    </div>

                                </div>

                                {/* STUDENT DETAILS */}

                                <div className="space-y-3 p-4 sm:p-5">

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Student Name
                                        </span>

                                        <span className="text-right text-xs font-black uppercase text-slate-800">
                                            {receiptModalData.studentName ||
                                                receiptModalData.userId
                                                    ?.name ||
                                                'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Roll Number
                                        </span>

                                        <span className="font-mono text-xs font-bold text-slate-700">
                                            {receiptModalData.rollNo ||
                                                receiptModalData.userId
                                                    ?.rollNo ||
                                                'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Student ID
                                        </span>

                                        <span className="font-mono text-xs font-black text-blue-700">
                                            {receiptModalData.studentId ||
                                                'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Hostel
                                        </span>

                                        <span className="font-mono text-xs font-bold text-slate-700">
                                            {receiptModalData.hostelNo ||
                                                'N/A'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[10px] font-bold uppercase text-slate-400">
                                            Payment Channel
                                        </span>

                                        <span className="max-w-[200px] text-right text-xs font-bold text-slate-700">
                                            {receiptModalData.paymentChannel ||
                                                receiptModalData.paymentMode ||
                                                'Treasury Desk Settlement'}
                                        </span>
                                    </div>

                                </div>

                                {/* TOTAL */}

                                <div className="mx-4 mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:mx-5">

                                    <div className="flex items-center justify-between gap-4">

                                        <div>
                                            <p className="text-[9px] font-bold uppercase tracking-wider text-blue-500">
                                                Total Remitted
                                            </p>

                                            <p className="mt-1 text-xs font-bold text-slate-700">
                                                Payment successfully recorded
                                            </p>
                                        </div>

                                        <p className="text-2xl font-black text-blue-800">
                                            ₹
                                            {Number(
                                                receiptModalData.amount
                                            ).toLocaleString(
                                                'en-IN'
                                            )}
                                        </p>

                                    </div>

                                </div>

                                {/* STATUS */}

                                <div className="border-t border-slate-200 p-4 text-center">

                                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[9px] font-black uppercase tracking-wider text-emerald-700">
                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                        Payment Cleared
                                    </span>

                                </div>

                            </div>

                        </div>

                        {/* MODAL ACTIONS */}

                        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-200 bg-slate-50 p-4 print:hidden sm:flex-row sm:justify-end">

                            <button
                                onClick={() =>
                                    window.print()
                                }
                                className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:flex-none"
                            >
                                <Printer className="h-4 w-4" />
                                Print Receipt
                            </button>

                            <button
                                onClick={() =>
                                    setReceiptModalData(null)
                                }
                                className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                            >
                                Close
                            </button>

                        </div>

                    </div>

                </div>
            )}

            {/* -------------------------------------------------
                CONFIRM MODAL
            ------------------------------------------------- */}

            {confirmModal.isOpen && (
                <ConfirmModal
                    isOpen={confirmModal.isOpen}
                    title={confirmModal.title}
                    message={confirmModal.message}
                    onConfirm={confirmModal.onConfirm}
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