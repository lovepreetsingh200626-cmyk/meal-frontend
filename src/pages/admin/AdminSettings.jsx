import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import {
    Settings,
    Save,
    AlertCircle,
    CheckCircle2,
    Loader2,
    RefreshCw,
    Building2,
    Utensils,
    IndianRupee,
    Info,
    X,
    ShieldCheck
} from 'lucide-react';

export default function AdminSettings() {
    const [hostelsList, setHostelsList] = useState([]);
    const [targetHostelId, setTargetHostelId] = useState('');

    const [dietRates, setDietRates] = useState({
        breakfast: 37,
        lunch: 37,
        dinner: 37
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // ---------------------------------------------------------
    // FETCH HOSTELS
    // ---------------------------------------------------------

    const fetchHostels = async () => {
        setLoading(true);
        setErrorMsg('');

        try {
            const { data } = await API.get('/hostels');
            setHostelsList(data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to load residence configuration.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
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
    // SELECT HOSTEL
    // ---------------------------------------------------------

    const handleHostelChange = (e) => {
        const hostelId = e.target.value;

        setTargetHostelId(hostelId);

        const selectedHostel = hostelsList.find(
            (hostel) => hostel._id === hostelId
        );

        if (selectedHostel?.mealCosts) {
            setDietRates({
                breakfast:
                    Number(selectedHostel.mealCosts.breakfast) || 0,

                lunch:
                    Number(selectedHostel.mealCosts.lunch) || 0,

                dinner:
                    Number(selectedHostel.mealCosts.dinner) || 0
            });
        } else {
            setDietRates({
                breakfast: 37,
                lunch: 37,
                dinner: 37
            });
        }
    };

    // ---------------------------------------------------------
    // UPDATE RATES
    // ---------------------------------------------------------

    const handleUpdateRates = async (e) => {
        e.preventDefault();

        if (!targetHostelId) {
            showError('Please select a residence first.');
            return;
        }

        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');

        try {
            await API.put(
                `/hostels/${targetHostelId}/rates`,
                {
                    mealCosts: dietRates
                }
            );

            showSuccess(
                'Meal tariff schedule updated successfully.'
            );

            await fetchHostels();

        } catch (err) {
            console.error(err);

            showError(
                'Failed to update meal tariff schedule.'
            );
        } finally {
            setSaving(false);
        }
    };

    // ---------------------------------------------------------
    // GET SELECTED HOSTEL
    // ---------------------------------------------------------

    const selectedHostel = hostelsList.find(
        (hostel) =>
            hostel._id === targetHostelId
    );

    // ---------------------------------------------------------
    // CALCULATE DAILY TOTAL
    // ---------------------------------------------------------

    const dailyTotal =
        Number(dietRates.breakfast || 0) +
        Number(dietRates.lunch || 0) +
        Number(dietRates.dinner || 0);

    // ---------------------------------------------------------
    // RATE CARD
    // ---------------------------------------------------------

    const RateCard = ({
        label,
        value,
        icon: Icon,
        onChange
    }) => (
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-4">

            <div className="mb-3 flex items-center justify-between gap-2 sm:mb-4">

                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 sm:h-10 sm:w-10">
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                            Meal
                        </p>

                        <p className="truncate text-xs font-black text-slate-800 sm:text-sm">
                            {label}
                        </p>
                    </div>

                </div>

                <IndianRupee className="h-4 w-4 shrink-0 text-slate-300" />

            </div>

            <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-slate-500 sm:text-[10px]">
                Tariff Amount
            </label>

            <div className="relative">

                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                </span>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={value}
                    onChange={onChange}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-2 font-mono text-sm font-black text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-12 sm:pr-3 sm:text-base"
                />

            </div>

        </div>
    );

    // ---------------------------------------------------------
    // MAIN UI
    // ---------------------------------------------------------

    return (
        <div className="mx-auto w-full min-w-0 max-w-5xl space-y-4 pb-8 animate-in fade-in duration-300 sm:space-y-6">

            {/* =================================================
                ALERTS
            ================================================= */}

            {errorMsg && (
                <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs text-red-800 shadow-sm sm:items-center sm:gap-3 sm:px-4 sm:text-sm">

                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />

                    <span className="min-w-0 flex-1 font-semibold">
                        {errorMsg}
                    </span>

                    <button
                        onClick={() => setErrorMsg('')}
                        className="shrink-0 rounded-lg p-1 transition hover:bg-red-100"
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div>
            )}

            {successMsg && (
                <div className="flex min-w-0 items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs text-emerald-800 shadow-sm sm:items-center sm:gap-3 sm:px-4 sm:text-sm">

                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />

                    <span className="min-w-0 flex-1 font-semibold">
                        {successMsg}
                    </span>

                    <button
                        onClick={() => setSuccessMsg('')}
                        className="shrink-0 rounded-lg p-1 transition hover:bg-emerald-100"
                    >
                        <X className="h-4 w-4" />
                    </button>

                </div>
            )}

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">

                <div className="min-w-0">

                    <div className="mb-2 inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-blue-700 sm:px-3 sm:text-[10px]">

                        <Settings className="h-3.5 w-3.5 shrink-0" />

                        System Configuration

                    </div>

                    <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-3xl">
                        Mess Tariff Settings
                    </h1>

                    <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 sm:text-sm">
                        Configure breakfast, lunch and dinner
                        charges for each residential hostel.
                    </p>

                </div>

                <button
                    type="button"
                    onClick={fetchHostels}
                    disabled={loading}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >

                    <RefreshCw
                        className={`h-4 w-4 ${
                            loading ? 'animate-spin' : ''
                        }`}
                    />

                    Refresh

                </button>

            </div>

            {/* =================================================
                INFORMATION BANNER
            ================================================= */}

            <div className="flex min-w-0 gap-2.5 rounded-2xl border border-blue-100 bg-blue-50 p-3 sm:gap-3 sm:p-4">

                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:h-9 sm:w-9">

                    <Info className="h-4 w-4" />

                </div>

                <div className="min-w-0">

                    <p className="text-xs font-black text-blue-900">
                        Tariff configuration
                    </p>

                    <p className="mt-1 text-[10px] leading-5 text-blue-700 sm:text-[11px]">
                        Changes made here affect the meal-cost
                        calculation for the selected residence.
                        Review the amounts carefully before saving.
                    </p>

                </div>

            </div>

            {/* =================================================
                MAIN CONFIGURATION CARD
            ================================================= */}

            <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* HEADER */}

                <div className="border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5">

                    <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 sm:h-11 sm:w-11">

                            <Building2 className="h-5 w-5" />

                        </div>

                        <div className="min-w-0">

                            <h2 className="text-sm font-black text-slate-900 sm:text-base">
                                Residence Configuration
                            </h2>

                            <p className="mt-0.5 text-[10px] leading-4 text-slate-500 sm:text-xs">
                                Select a hostel to view or modify
                                its current meal tariffs.
                            </p>

                        </div>

                    </div>

                </div>

                {/* BODY */}

                <div className="p-3.5 sm:p-6">

                    {loading ? (

                        <div className="flex min-h-[260px] flex-col items-center justify-center sm:min-h-[300px]">

                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 sm:h-12 sm:w-12">

                                <Loader2 className="h-5 w-5 animate-spin text-blue-700 sm:h-6 sm:w-6" />

                            </div>

                            <p className="mt-4 text-sm font-bold text-slate-700">
                                Loading residences...
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Retrieving tariff configuration.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* HOSTEL SELECTOR */}

                            <div>

                                <label className="mb-2 block text-[9px] font-bold uppercase tracking-wider text-slate-600 sm:text-[10px]">
                                    Select Residence
                                </label>

                                <select
                                    value={targetHostelId}
                                    onChange={handleHostelChange}
                                    className="h-11 w-full min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 sm:h-12"
                                >

                                    <option value="">
                                        Select a residence...
                                    </option>

                                    {hostelsList.map(
                                        (hostel) => (
                                            <option
                                                key={hostel._id}
                                                value={hostel._id}
                                            >
                                                {hostel.hostelNumber}
                                                {' — '}
                                                {hostel.name ||
                                                    hostel.type}
                                            </option>
                                        )
                                    )}

                                </select>

                            </div>

                            {/* SELECTED HOSTEL */}

                            {targetHostelId && (
                                <div className="mt-4 flex min-w-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3.5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:p-4">

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:h-10 sm:w-10">

                                            <Building2 className="h-5 w-5" />

                                        </div>

                                        <div className="min-w-0">

                                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                                                Selected Residence
                                            </p>

                                            <p className="truncate text-sm font-black text-slate-800">
                                                {selectedHostel?.hostelNumber ||
                                                    'Residence'}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-[9px] font-bold text-emerald-700 sm:text-[10px]">

                                        <ShieldCheck className="h-3.5 w-3.5" />

                                        Configuration Ready

                                    </div>

                                </div>
                            )}

                            {/* RATE FORM */}

                            {targetHostelId ? (

                                <form
                                    onSubmit={handleUpdateRates}
                                    className="mt-5 sm:mt-6"
                                >

                                    <div className="mb-4">

                                        <h3 className="text-sm font-black text-slate-900">
                                            Meal Tariffs
                                        </h3>

                                        <p className="mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs">
                                            Set the amount charged for
                                            each daily meal.
                                        </p>

                                    </div>

                                    <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 sm:gap-4">

                                        <RateCard
                                            label="Breakfast"
                                            value={
                                                dietRates.breakfast
                                            }
                                            icon={Utensils}
                                            onChange={(e) =>
                                                setDietRates({
                                                    ...dietRates,
                                                    breakfast:
                                                        Number(
                                                            e.target.value
                                                        )
                                                })
                                            }
                                        />

                                        <RateCard
                                            label="Lunch"
                                            value={
                                                dietRates.lunch
                                            }
                                            icon={Utensils}
                                            onChange={(e) =>
                                                setDietRates({
                                                    ...dietRates,
                                                    lunch:
                                                        Number(
                                                            e.target.value
                                                        )
                                                })
                                            }
                                        />

                                        <RateCard
                                            label="Dinner"
                                            value={
                                                dietRates.dinner
                                            }
                                            icon={Utensils}
                                            onChange={(e) =>
                                                setDietRates({
                                                    ...dietRates,
                                                    dinner:
                                                        Number(
                                                            e.target.value
                                                        )
                                                })
                                            }
                                        />

                                    </div>

                                    {/* DAILY TOTAL */}

                                    <div className="mt-4 flex min-w-0 flex-col gap-2.5 rounded-2xl border border-slate-200 bg-slate-900 p-3.5 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:p-4">

                                        <div className="min-w-0">

                                            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">
                                                Total Daily Meal Cost
                                            </p>

                                            <p className="mt-1 text-[10px] text-slate-300 sm:text-xs">
                                                Breakfast + Lunch + Dinner
                                            </p>

                                        </div>

                                        <div className="flex items-center gap-1 text-xl font-black text-white sm:text-2xl">

                                            <span className="text-sm text-slate-400">
                                                ₹
                                            </span>

                                            {dailyTotal.toFixed(2)}

                                        </div>

                                    </div>

                                    {/* SAVE BUTTON */}

                                    <div className="mt-4 flex min-w-0 flex-col gap-3 border-t border-slate-100 pt-4 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-5">

                                        <div className="flex min-w-0 items-start gap-2 text-[9px] leading-4 text-slate-400 sm:text-[10px]">

                                            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />

                                            <span>
                                                Only authorized administrators
                                                can modify tariff values.
                                            </span>

                                        </div>

                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:px-6"
                                        >

                                            {saving ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-4 w-4" />
                                                    Save Tariff Schedule
                                                </>
                                            )}

                                        </button>

                                    </div>

                                </form>

                            ) : (

                                <div className="mt-5 flex min-h-[210px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-4 text-center sm:mt-6 sm:min-h-[240px] sm:px-6">

                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-slate-400 shadow-sm sm:h-14 sm:w-14">

                                        <Settings className="h-5 w-5 sm:h-6 sm:w-6" />

                                    </div>

                                    <h3 className="mt-4 text-sm font-black text-slate-700">
                                        Select a residence
                                    </h3>

                                    <p className="mt-1 max-w-sm text-[11px] leading-5 text-slate-400 sm:text-xs">
                                        Choose a hostel from the selector
                                        above to configure its breakfast,
                                        lunch and dinner rates.
                                    </p>

                                </div>

                            )}

                        </>

                    )}

                </div>

            </div>

            {/* =================================================
                CURRENT RESIDENCES OVERVIEW
            ================================================= */}

            {!loading && hostelsList.length > 0 && (
                <div className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-4 py-4 sm:px-6">

                        <div className="flex min-w-0 items-center gap-3">

                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                                <Building2 className="h-4 w-4" />

                            </div>

                            <div className="min-w-0">

                                <h2 className="text-sm font-black text-slate-900">
                                    Residence Tariff Overview
                                </h2>

                                <p className="text-[10px] text-slate-500 sm:text-[11px]">
                                    Current configured rates by hostel.
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="divide-y divide-slate-100">

                        {hostelsList.map((hostel) => {

                            const breakfast =
                                Number(
                                    hostel.mealCosts?.breakfast ?? 37
                                );

                            const lunch =
                                Number(
                                    hostel.mealCosts?.lunch ?? 37
                                );

                            const dinner =
                                Number(
                                    hostel.mealCosts?.dinner ?? 37
                                );

                            const total =
                                breakfast +
                                lunch +
                                dinner;

                            const isSelected =
                                hostel._id ===
                                targetHostelId;

                            return (
                                <div
                                    key={hostel._id}
                                    className={`flex min-w-0 flex-col gap-3 p-3.5 transition sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:p-4 ${
                                        isSelected
                                            ? 'bg-blue-50/50'
                                            : 'hover:bg-slate-50'
                                    }`}
                                >

                                    <div className="flex min-w-0 items-center gap-3">

                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">

                                            <Building2 className="h-4 w-4" />

                                        </div>

                                        <div className="min-w-0">

                                            <p className="truncate text-xs font-black text-slate-800">
                                                {hostel.hostelNumber}
                                            </p>

                                            <p className="truncate text-[10px] text-slate-400">
                                                {hostel.name ||
                                                    hostel.type ||
                                                    'Residence'}
                                            </p>

                                        </div>

                                    </div>

                                    <div className="grid min-w-0 grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-2">

                                        <div className="min-w-0 rounded-lg bg-slate-50 px-1.5 py-2 text-center sm:px-3">

                                            <p className="truncate text-[7px] font-bold uppercase text-slate-400 sm:text-[8px]">
                                                Breakfast
                                            </p>

                                            <p className="mt-0.5 text-[10px] font-black text-slate-700 sm:text-xs">
                                                ₹{breakfast}
                                            </p>

                                        </div>

                                        <div className="min-w-0 rounded-lg bg-slate-50 px-1.5 py-2 text-center sm:px-3">

                                            <p className="truncate text-[7px] font-bold uppercase text-slate-400 sm:text-[8px]">
                                                Lunch
                                            </p>

                                            <p className="mt-0.5 text-[10px] font-black text-slate-700 sm:text-xs">
                                                ₹{lunch}
                                            </p>

                                        </div>

                                        <div className="min-w-0 rounded-lg bg-slate-50 px-1.5 py-2 text-center sm:px-3">

                                            <p className="truncate text-[7px] font-bold uppercase text-slate-400 sm:text-[8px]">
                                                Dinner
                                            </p>

                                            <p className="mt-0.5 text-[10px] font-black text-slate-700 sm:text-xs">
                                                ₹{dinner}
                                            </p>

                                        </div>

                                        <div className="hidden rounded-lg bg-blue-50 px-3 py-2 text-center sm:block">

                                            <p className="text-[8px] font-bold uppercase text-blue-400">
                                                Daily Total
                                            </p>

                                            <p className="mt-0.5 text-xs font-black text-blue-700">
                                                ₹{total}
                                            </p>

                                        </div>

                                    </div>

                                </div>
                            );
                        })}

                    </div>

                </div>
            )}

        </div>
    );
}