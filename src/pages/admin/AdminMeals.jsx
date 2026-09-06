import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import * as XLSX from 'xlsx';
import {
    FileText,
    Clock,
    Pencil,
    Trash2,
    Download,
    Printer,
    X,
    Filter,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Utensils,
    CalendarDays,
    IndianRupee,
    Database,
    RefreshCw,
    Coffee,
    Sun,
    Moon,
    ChevronDown
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminMeals() {
    const [mealsList, setMealsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);

    const [mealEditData, setMealEditData] = useState({
        date: '',
        meals: {
            breakfast: false,
            lunch: false,
            dinner: false
        },
        extras: []
    });

    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    // ---------------------------------------------------------
    // FETCH MEALS
    // ---------------------------------------------------------

    const fetchAllMeals = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const { data } = await API.get('/meals/all');
            setMealsList(data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load meal ledger records.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllMeals();
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
    // TIME FORMAT
    // ---------------------------------------------------------

    const formatLogTime = (rec) => {
        if (rec?.time) return rec.time;

        const rawTimestamp = rec?.createdAt || rec?.updatedAt;

        if (!rawTimestamp) return null;

        try {
            const parsed = new Date(rawTimestamp);

            if (isNaN(parsed.getTime())) return null;

            return parsed.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch {
            return null;
        }
    };

    // ---------------------------------------------------------
    // FILTERED MEALS
    // ---------------------------------------------------------

    const filteredMeals = useMemo(() => {
        return mealsList.filter(
            (meal) =>
                selectedHostelFilter === 'ALL' ||
                meal.hostelId?.hostelNumber === selectedHostelFilter ||
                meal.hostelNo === selectedHostelFilter
        );
    }, [mealsList, selectedHostelFilter]);

    // ---------------------------------------------------------
    // STATISTICS
    // ---------------------------------------------------------

    const statistics = useMemo(() => {
        const totalCost = filteredMeals.reduce(
            (sum, meal) => sum + (Number(meal.dailyTotalCost) || 0),
            0
        );

        const breakfastCount = filteredMeals.filter(
            (meal) => meal.meals?.breakfast
        ).length;

        const lunchCount = filteredMeals.filter(
            (meal) => meal.meals?.lunch
        ).length;

        const dinnerCount = filteredMeals.filter(
            (meal) => meal.meals?.dinner
        ).length;

        const extraCount = filteredMeals.reduce(
            (sum, meal) => sum + (meal.extras?.length || 0),
            0
        );

        return {
            totalRecords: filteredMeals.length,
            totalCost,
            breakfastCount,
            lunchCount,
            dinnerCount,
            extraCount
        };
    }, [filteredMeals]);

    // ---------------------------------------------------------
    // EXPORT EXCEL
    // ---------------------------------------------------------

    const handleExportLedger = () => {
        if (filteredMeals.length === 0) {
            showError('No ledger records available under the selected filter.');
            return;
        }

        const exportData = filteredMeals.map((m) => ({
            'Audit Date': m.date,
            'Log Time': formatLogTime(m) || 'N/A',
            'Candidate Full Name': m.userId?.name || 'N/A',
            'Hostel Roll Number': m.userId?.rollNo || 'N/A',
            'Statutory Student ID': m.userId?.studentId || 'N/A',
            'Residence':
                m.hostelId?.hostelNumber ||
                m.hostelNo ||
                'N/A',
            'Breakfast': m.meals?.breakfast ? 'YES' : 'NO',
            'Lunch': m.meals?.lunch ? 'YES' : 'NO',
            'Dinner': m.meals?.dinner ? 'YES' : 'NO',
            'Approved Extras':
                m.extras?.length > 0
                    ? m.extras
                          .map(
                              (e) =>
                                  `${e.itemName} (INR ${e.cost})`
                          )
                          .join('; ')
                    : 'NIL',
            'Daily Amount (INR)': m.dailyTotalCost || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);

        const workbook = XLSX.utils.book_new();

        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            'Mess_Ledger'
        );

        XLSX.writeFile(
            workbook,
            `Mess_Ledger_${new Date()
                .toISOString()
                .split('T')[0]}.xlsx`
        );

        showSuccess('Ledger exported successfully.');
    };

    // ---------------------------------------------------------
    // PRINT
    // ---------------------------------------------------------

    const handlePrintReport = () => {
        window.print();
    };

    // ---------------------------------------------------------
    // OPEN EDIT MODAL
    // ---------------------------------------------------------

    const openMealEditModal = (meal) => {
        setEditingMeal(meal);

        setMealEditData({
            date: meal.date,
            meals: {
                breakfast: Boolean(meal.meals?.breakfast),
                lunch: Boolean(meal.meals?.lunch),
                dinner: Boolean(meal.meals?.dinner)
            },
            extras: meal.extras ? [...meal.extras] : []
        });

        setIsMealEditModalOpen(true);
    };

    // ---------------------------------------------------------
    // UPDATE MEAL
    // ---------------------------------------------------------

    const handleMealEditSubmit = async (e) => {
        e.preventDefault();

        if (!editingMeal?._id) return;

        try {
            const { data } = await API.put(
                `/meals/${editingMeal._id}`,
                mealEditData
            );

            setMealsList((prev) =>
                prev.map((meal) =>
                    meal._id === editingMeal._id
                        ? data.meal
                        : meal
                )
            );

            setIsMealEditModalOpen(false);
            setEditingMeal(null);

            showSuccess('Meal ledger entry updated successfully.');
        } catch (err) {
            console.error(err);

            showError(
                err.response?.data?.message ||
                    'Failed to update meal ledger entry.'
            );
        }
    };

    // ---------------------------------------------------------
    // DELETE MEAL
    // ---------------------------------------------------------

    const promptRemoveMealLog = (mealId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Meal Record',
            message:
                'Are you sure you want to permanently delete this daily meal record? This action cannot be undone.',

            onConfirm: async () => {
                try {
                    await API.delete(`/meals/${mealId}`);

                    setMealsList((prev) =>
                        prev.filter(
                            (meal) => meal._id !== mealId
                        )
                    );

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    showSuccess(
                        'Meal ledger record deleted successfully.'
                    );
                } catch (err) {
                    console.error(err);

                    setConfirmModal((prev) => ({
                        ...prev,
                        isOpen: false
                    }));

                    showError(
                        'Failed to delete meal ledger record.'
                    );
                }
            }
        });
    };

    // ---------------------------------------------------------
    // MEAL BADGE
    // ---------------------------------------------------------

    const MealBadge = ({ type, active }) => {
        if (!active) return null;

        const config = {
            breakfast: {
                label: 'Breakfast',
                icon: Coffee
            },
            lunch: {
                label: 'Lunch',
                icon: Sun
            },
            dinner: {
                label: 'Dinner',
                icon: Moon
            }
        };

        const item = config[type];
        const Icon = item.icon;

        return (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold text-slate-700">
                <Icon className="h-3.5 w-3.5 text-blue-700" />
                {item.label}
            </span>
        );
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

                    {description && (
                        <p className="mt-1 text-[11px] text-slate-500">
                            {description}
                        </p>
                    )}
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
                NOTIFICATIONS
            ------------------------------------------------- */}

            {errorMsg && (
                <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span className="font-semibold">
                        {errorMsg}
                    </span>

                    <button
                        onClick={() => setErrorMsg('')}
                        className="ml-auto rounded-lg p-1 hover:bg-red-100"
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
                        className="ml-auto rounded-lg p-1 hover:bg-emerald-100"
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
                        <Database className="h-3.5 w-3.5" />
                        Meal Management
                    </div>

                    <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Mess Meal Ledger
                    </h1>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                        Monitor, review and manage daily student meal
                        records and associated costs.
                    </p>
                </div>

                <div className="flex items-center gap-2 print:hidden">
                    <button
                        onClick={fetchAllMeals}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${
                                loading ? 'animate-spin' : ''
                            }`}
                        />
                        Refresh
                    </button>
                </div>
            </div>

            {/* -------------------------------------------------
                STATISTICS
            ------------------------------------------------- */}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    icon={FileText}
                    label="Total Records"
                    value={statistics.totalRecords}
                    description="Visible meal entries"
                />

                <StatCard
                    icon={IndianRupee}
                    label="Total Recorded Cost"
                    value={`₹${statistics.totalCost.toLocaleString('en-IN')}`}
                    description="Across filtered records"
                />

                <StatCard
                    icon={Utensils}
                    label="Meal Servings"
                    value={
                        statistics.breakfastCount +
                        statistics.lunchCount +
                        statistics.dinnerCount
                    }
                    description="Breakfast, lunch & dinner"
                />

                <StatCard
                    icon={CalendarDays}
                    label="Extra Items"
                    value={statistics.extraCount}
                    description="Additional consumables"
                />

            </div>

            {/* -------------------------------------------------
                MAIN LEDGER
            ------------------------------------------------- */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* TOOLBAR */}

                <div className="border-b border-slate-200 bg-white p-4 sm:p-5">

                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                        <div>
                            <h2 className="text-base font-black text-slate-900">
                                Daily Meal Records
                            </h2>

                            <p className="mt-1 text-xs text-slate-500">
                                {filteredMeals.length} records currently
                                displayed
                            </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row print:hidden">

                            {/* HOSTEL FILTER */}

                            <div className="relative">
                                <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                                <select
                                    value={selectedHostelFilter}
                                    onChange={(e) =>
                                        setSelectedHostelFilter(
                                            e.target.value
                                        )
                                    }
                                    className="h-10 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-9 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:w-48"
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

                            {/* EXPORT */}

                            <button
                                onClick={handleExportLedger}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700"
                            >
                                <Download className="h-4 w-4" />
                                Export Excel
                            </button>

                            {/* PRINT */}

                            <button
                                onClick={handlePrintReport}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                            >
                                <Printer className="h-4 w-4" />
                                Print
                            </button>

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
                                Loading meal records...
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                                Please wait while the ledger is synchronized.
                            </p>
                        </div>
                    ) : filteredMeals.length === 0 ? (

                        <div className="flex min-h-[360px] flex-col items-center justify-center px-6 text-center">

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                                <FileText className="h-7 w-7 text-slate-400" />
                            </div>

                            <h3 className="mt-4 text-base font-black text-slate-800">
                                No meal records found
                            </h3>

                            <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">
                                There are no meal records matching the
                                currently selected hostel filter.
                            </p>

                            {selectedHostelFilter !== 'ALL' && (
                                <button
                                    onClick={() =>
                                        setSelectedHostelFilter('ALL')
                                    }
                                    className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                                >
                                    Show All Records
                                </button>
                            )}

                        </div>
                    ) : (

                        <table className="w-full min-w-[1050px] border-collapse text-left">

                            <thead>
                                <tr className="border-b border-slate-200 bg-slate-50">

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Date & Time
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Student
                                    </th>

                                    <th className="px-5 py-4 text-center text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Hostel
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Meals
                                    </th>

                                    <th className="px-5 py-4 text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Extras
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Daily Cost
                                    </th>

                                    <th className="px-5 py-4 text-right text-[10px] font-black uppercase tracking-wider text-slate-500 print:hidden">
                                        Actions
                                    </th>

                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">

                                {filteredMeals.map((meal) => {

                                    const logTime =
                                        formatLogTime(meal);

                                    const hostel =
                                        meal.hostelId?.hostelNumber ||
                                        meal.hostelNo ||
                                        'N/A';

                                    const studentName =
                                        meal.userId?.name ||
                                        'Unknown Student';

                                    const rollNo =
                                        meal.userId?.rollNo ||
                                        'N/A';

                                    const studentId =
                                        meal.userId?.studentId;

                                    return (
                                        <tr
                                            key={meal._id}
                                            className="group transition hover:bg-slate-50/80"
                                        >

                                            {/* DATE */}

                                            <td className="px-5 py-4 align-top">

                                                <div className="flex items-start gap-3">

                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                                        <CalendarDays className="h-4 w-4" />
                                                    </div>

                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">
                                                            {meal.date}
                                                        </p>

                                                        {logTime ? (
                                                            <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-400">
                                                                <Clock className="h-3 w-3" />
                                                                {logTime}
                                                            </p>
                                                        ) : (
                                                            <p className="mt-1 text-[10px] text-slate-400">
                                                                Time not recorded
                                                            </p>
                                                        )}
                                                    </div>

                                                </div>

                                            </td>

                                            {/* STUDENT */}

                                            <td className="px-5 py-4 align-top">

                                                <p className="text-sm font-bold text-slate-800">
                                                    {studentName}
                                                </p>

                                                <div className="mt-1 flex flex-wrap items-center gap-2">

                                                    <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold text-slate-600">
                                                        Roll {rollNo}
                                                    </span>

                                                    {studentId && (
                                                        <span className="text-[10px] text-slate-400">
                                                            ID: {studentId}
                                                        </span>
                                                    )}

                                                </div>

                                            </td>

                                            {/* HOSTEL */}

                                            <td className="px-5 py-4 text-center align-top">

                                                <span className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-[10px] font-black text-slate-700">
                                                    {hostel}
                                                </span>

                                            </td>

                                            {/* MEALS */}

                                            <td className="px-5 py-4 align-top">

                                                <div className="flex max-w-[270px] flex-wrap gap-1.5">

                                                    <MealBadge
                                                        type="breakfast"
                                                        active={
                                                            meal.meals
                                                                ?.breakfast
                                                        }
                                                    />

                                                    <MealBadge
                                                        type="lunch"
                                                        active={
                                                            meal.meals?.lunch
                                                        }
                                                    />

                                                    <MealBadge
                                                        type="dinner"
                                                        active={
                                                            meal.meals
                                                                ?.dinner
                                                        }
                                                    />

                                                    {!meal.meals?.breakfast &&
                                                        !meal.meals?.lunch &&
                                                        !meal.meals?.dinner && (
                                                            <span className="text-[11px] text-slate-400">
                                                                No standard meals
                                                            </span>
                                                        )}

                                                </div>

                                            </td>

                                            {/* EXTRAS */}

                                            <td className="px-5 py-4 align-top">

                                                {meal.extras?.length > 0 ? (
                                                    <div className="space-y-1.5">

                                                        {meal.extras.map(
                                                            (
                                                                extra,
                                                                index
                                                            ) => (
                                                                <div
                                                                    key={
                                                                        index
                                                                    }
                                                                    className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-2.5 py-1.5"
                                                                >
                                                                    <span className="text-[10px] font-bold text-slate-700">
                                                                        {
                                                                            extra.itemName
                                                                        }
                                                                    </span>

                                                                    <span className="text-[10px] font-black text-amber-700">
                                                                        ₹
                                                                        {
                                                                            extra.cost
                                                                        }
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}

                                                    </div>
                                                ) : (
                                                    <span className="text-[11px] text-slate-400">
                                                        No extras
                                                    </span>
                                                )}

                                            </td>

                                            {/* COST */}

                                            <td className="px-5 py-4 text-right align-top">

                                                <p className="text-base font-black text-slate-900">
                                                    ₹
                                                    {Number(
                                                        meal.dailyTotalCost
                                                    ).toLocaleString(
                                                        'en-IN'
                                                    )}
                                                </p>

                                                <p className="mt-0.5 text-[9px] font-medium uppercase tracking-wider text-slate-400">
                                                    assessed amount
                                                </p>

                                            </td>

                                            {/* ACTIONS */}

                                            <td className="px-5 py-4 text-right align-top print:hidden">

                                                <div className="flex justify-end gap-1.5 opacity-70 transition group-hover:opacity-100">

                                                    <button
                                                        onClick={() =>
                                                            openMealEditModal(
                                                                meal
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                                                        title="Edit meal record"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            promptRemoveMealLog(
                                                                meal._id
                                                            )
                                                        }
                                                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-100 bg-red-50 text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
                                                        title="Delete meal record"
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

                {/* TABLE FOOTER */}

                {!loading && filteredMeals.length > 0 && (
                    <div className="flex flex-col gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3 text-[11px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">

                        <span>
                            Showing{' '}
                            <strong className="text-slate-700">
                                {filteredMeals.length}
                            </strong>{' '}
                            meal records
                        </span>

                        <span>
                            Total recorded cost:{' '}
                            <strong className="text-slate-800">
                                ₹
                                {statistics.totalCost.toLocaleString(
                                    'en-IN'
                                )}
                            </strong>
                        </span>

                    </div>
                )}

            </div>

            {/* -------------------------------------------------
                EDIT MEAL MODAL
            ------------------------------------------------- */}

            {isMealEditModalOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                >

                    <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">

                        {/* MODAL HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">

                            <div className="flex items-center gap-3">

                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
                                    <Pencil className="h-5 w-5" />
                                </div>

                                <div>
                                    <h3 className="text-sm font-black text-slate-900">
                                        Edit Meal Record
                                    </h3>

                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                        Update the selected daily meal entry.
                                    </p>
                                </div>

                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setIsMealEditModalOpen(false)
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                            >
                                <X className="h-5 w-5" />
                            </button>

                        </div>

                        {/* MODAL BODY */}

                        <form
                            onSubmit={handleMealEditSubmit}
                            className="space-y-6 p-5 sm:p-6"
                        >

                            {/* DATE */}

                            <div>
                                <label className="mb-2 block text-xs font-bold text-slate-700">
                                    Record Date
                                </label>

                                <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                                    <CalendarDays className="mr-2 h-4 w-4 text-slate-400" />
                                    {mealEditData.date || 'N/A'}
                                </div>
                            </div>

                            {/* MEALS */}

                            <div>
                                <div className="mb-3">
                                    <label className="text-xs font-bold text-slate-700">
                                        Standard Meals
                                    </label>

                                    <p className="mt-1 text-[11px] text-slate-400">
                                        Select which standard meals were
                                        recorded for this entry.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">

                                    {[
                                        {
                                            key: 'breakfast',
                                            label: 'Breakfast',
                                            icon: Coffee
                                        },
                                        {
                                            key: 'lunch',
                                            label: 'Lunch',
                                            icon: Sun
                                        },
                                        {
                                            key: 'dinner',
                                            label: 'Dinner',
                                            icon: Moon
                                        }
                                    ].map(
                                        ({
                                            key,
                                            label,
                                            icon: Icon
                                        }) => {

                                            const active =
                                                mealEditData
                                                    .meals[key];

                                            return (
                                                <button
                                                    type="button"
                                                    key={key}
                                                    onClick={() =>
                                                        setMealEditData(
                                                            (prev) => ({
                                                                ...prev,
                                                                meals: {
                                                                    ...prev.meals,
                                                                    [key]:
                                                                        !prev
                                                                            .meals[
                                                                            key
                                                                        ]
                                                                }
                                                            })
                                                        )
                                                    }
                                                    className={`flex flex-col items-center justify-center rounded-xl border p-4 transition ${
                                                        active
                                                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                            : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-white'
                                                    }`}
                                                >

                                                    <Icon className="h-5 w-5" />

                                                    <span className="mt-2 text-xs font-bold">
                                                        {label}
                                                    </span>

                                                    <span
                                                        className={`mt-1 text-[9px] font-bold uppercase ${
                                                            active
                                                                ? 'text-blue-600'
                                                                : 'text-slate-400'
                                                        }`}
                                                    >
                                                        {active
                                                            ? 'Recorded'
                                                            : 'Not Recorded'}
                                                    </span>

                                                </button>
                                            );
                                        }
                                    )}

                                </div>
                            </div>

                            {/* EXTRAS INFO */}

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-amber-600 shadow-sm">
                                        <IndianRupee className="h-4 w-4" />
                                    </div>

                                    <div>
                                        <p className="text-xs font-bold text-slate-700">
                                            Additional Items
                                        </p>

                                        {mealEditData.extras?.length >
                                        0 ? (
                                            <div className="mt-2 space-y-1">

                                                {mealEditData.extras.map(
                                                    (
                                                        extra,
                                                        index
                                                    ) => (
                                                        <div
                                                            key={index}
                                                            className="flex items-center justify-between text-[11px]"
                                                        >
                                                            <span className="text-slate-600">
                                                                {
                                                                    extra.itemName
                                                                }
                                                            </span>

                                                            <span className="font-bold text-slate-800">
                                                                ₹
                                                                {
                                                                    extra.cost
                                                                }
                                                            </span>
                                                        </div>
                                                    )
                                                )}

                                            </div>
                                        ) : (
                                            <p className="mt-1 text-[11px] text-slate-400">
                                                No additional items recorded.
                                            </p>
                                        )}
                                    </div>

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        setIsMealEditModalOpen(false)
                                    }
                                    className="h-10 rounded-xl border border-slate-200 bg-white px-5 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    className="h-10 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
                                >
                                    Save Changes
                                </button>

                            </div>

                        </form>

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