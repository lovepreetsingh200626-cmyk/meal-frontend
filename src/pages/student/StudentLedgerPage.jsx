import React, { useEffect, useMemo, useState } from 'react';
import API from '../../services/api';
import {
  FileText,
  Calendar,
  IndianRupee,
  Wallet,
  Landmark,
  ShieldCheck,
  Printer,
  Filter,
  Clock,
  Loader2,
  ChevronRight,
  Receipt,
  Utensils,
  RefreshCw,
  Info,
  CheckCircle2
} from 'lucide-react';

export default function StudentLedgerPage({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [error, setError] = useState('');

  const userId = user?._id || user?.id || user?.userId;

  useEffect(() => {
    const fetchLedger = async () => {
      if (!userId) {
        setLoading(false);
        setError('Student information could not be loaded.');
        return;
      }

      try {
        setLoading(true);
        setError('');

        const res = await API.get(`/meals/user/${userId}`);

        setHistory(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to load meal ledger:', err);

        setError(
          err?.response?.data?.message ||
            'Unable to load your mess ledger. Please try again.'
        );

        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [userId]);

  /* -----------------------------
     Helpers
  ----------------------------- */

  const formatCurrency = (amount) => {
    const value = Number(amount) || 0;

    return `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return '—';

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatMonth = (monthValue) => {
    if (!monthValue || monthValue.length < 7) return monthValue;

    const date = new Date(`${monthValue}-01T00:00:00`);

    if (Number.isNaN(date.getTime())) return monthValue;

    return date.toLocaleDateString('en-IN', {
      month: 'long',
      year: 'numeric'
    });
  };

  const formatLogTime = (record) => {
    if (record?.time) return record.time;

    const rawTimestamp = record?.createdAt || record?.updatedAt;

    if (!rawTimestamp) return null;

    try {
      const parsed = new Date(rawTimestamp);

      if (Number.isNaN(parsed.getTime())) return null;

      return parsed.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return null;
    }
  };

  /* -----------------------------
     Meal Status
  ----------------------------- */

  const isMealTaken = (record, meal) => {
    const value =
      record?.[meal] ??
      record?.meals?.[meal] ??
      record?.mealStatus?.[meal];

    return (
      value === true ||
      value === 'true' ||
      value === 1 ||
      value === '1' ||
      value === 'Taken' ||
      value === 'taken'
    );
  };

  /* -----------------------------
     Month Filter
  ----------------------------- */

  const availableMonths = useMemo(() => {
    const months = new Set();

    history.forEach((record) => {
      if (
        record?.date &&
        typeof record.date === 'string' &&
        record.date.length >= 7
      ) {
        months.add(record.date.substring(0, 7));
      }
    });

    return Array.from(months).sort().reverse();
  }, [history]);

  const filteredHistory = useMemo(() => {
    if (selectedMonth === 'ALL') {
      return history;
    }

    return history.filter(
      (record) =>
        record?.date &&
        typeof record.date === 'string' &&
        record.date.startsWith(selectedMonth)
    );
  }, [history, selectedMonth]);

  /* -----------------------------
     Calculations
  ----------------------------- */

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);

  const currentMonthBill = useMemo(() => {
    return history
      .filter(
        (record) =>
          record?.date &&
          typeof record.date === 'string' &&
          record.date.startsWith(currentMonthPrefix)
      )
      .reduce(
        (sum, record) => sum + (Number(record.dailyTotalCost) || 0),
        0
      );
  }, [history, currentMonthPrefix]);

  const totalSpentAllTime = useMemo(() => {
    return history.reduce(
      (sum, record) => sum + (Number(record.dailyTotalCost) || 0),
      0
    );
  }, [history]);

  const filteredTotal = useMemo(() => {
    return filteredHistory.reduce(
      (sum, record) => sum + (Number(record.dailyTotalCost) || 0),
      0
    );
  }, [filteredHistory]);

  const totalDays = history.length;
  const filteredDays = filteredHistory.length;

  const averageDailyCost = useMemo(() => {
    if (!history.length) return 0;

    return totalSpentAllTime / history.length;
  }, [history, totalSpentAllTime]);

  /* -----------------------------
     Actions
  ----------------------------- */

  const handlePrint = () => {
    window.print();
  };

  const handleRefresh = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError('');

      const res = await API.get(`/meals/user/${userId}`);

      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to refresh ledger:', err);

      setError(
        err?.response?.data?.message ||
          'Unable to refresh the ledger. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* -----------------------------
     Loading
  ----------------------------- */

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto mb-5 h-14 w-14 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-blue-700 animate-spin" />
          </div>

          <h2 className="text-lg font-bold text-slate-900">
            Loading mess ledger
          </h2>

          <p className="text-sm text-slate-500 mt-2">
            Please wait while your meal records are being retrieved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-10 print:bg-white">

      {/* Institutional Strip */}
      <div className="bg-slate-950 text-slate-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4 py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-[11px] sm:text-xs">
          <div className="flex items-center gap-2">
            <Landmark className="w-3.5 h-3.5" />

            <span className="font-medium">
              University Hostel Mess Management System
            </span>
          </div>

          <span className="text-slate-400">
            Student Financial & Meal Ledger
          </span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-6">

        {/* Error */}
        {error && (
          <div className="bg-white border border-red-200 rounded-2xl shadow-sm p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
              <Info className="w-5 h-5 text-red-600" />
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Unable to load ledger
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>
            </div>

            <button
              onClick={handleRefresh}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition"
            >
              <RefreshCw className="w-4 h-4" />
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:border-0 print:shadow-none">
          <div className="p-5 sm:p-6 border-b border-slate-100">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div className="flex items-start gap-4">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-700" />
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
                      Mess Ledger
                    </h1>

                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                      <ShieldCheck className="w-3 h-3" />
                      Official Record
                    </span>
                  </div>

                  <p className="text-sm text-slate-500 mt-1">
                    Detailed record of your registered meals and daily mess
                    charges.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 print:hidden">
                <button
                  onClick={handleRefresh}
                  className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                >
                  <RefreshCw className="w-4 h-4" />

                  <span className="hidden sm:inline">
                    Refresh
                  </span>
                </button>

                <button
                  onClick={handlePrint}
                  className="inline-flex items-center justify-center gap-2 h-10 px-3 sm:px-4 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  <Printer className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>

          {/* Student Information */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50/70">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Student
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {user?.name || 'Student'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Student ID
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {user?.studentId || user?.rollNo || '—'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Hostel
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1 truncate">
                  {user?.hostelNo ||
                    user?.hostelId?.hostelNumber ||
                    '—'}
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Total Records
                </p>

                <p className="text-sm font-semibold text-slate-800 mt-1">
                  {totalDays} days
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-3">

          {/* Current Month */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-blue-700" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Current Month
              </span>
            </div>

            <p className="text-xs font-medium text-slate-500 mt-4">
              Current Month Bill
            </p>

            <p className="text-2xl font-bold text-slate-950 mt-1">
              {formatCurrency(currentMonthBill)}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              {formatMonth(currentMonthPrefix)}
            </p>
          </div>

          {/* Total */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5">
            <div className="flex items-center justify-between">

              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-700" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                All Time
              </span>
            </div>

            <p className="text-xs font-medium text-slate-500 mt-4">
              Total Mess Charges
            </p>

            <p className="text-2xl font-bold text-slate-950 mt-1">
              {formatCurrency(totalSpentAllTime)}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Across {totalDays} recorded day
              {totalDays === 1 ? '' : 's'}
            </p>
          </div>

          {/* Average */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center justify-between">

              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-amber-700" />
              </div>

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Average
              </span>
            </div>

            <p className="text-xs font-medium text-slate-500 mt-4">
              Average Daily Cost
            </p>

            <p className="text-2xl font-bold text-slate-950 mt-1">
              {formatCurrency(averageDailyCost)}
            </p>

            <p className="text-xs text-slate-400 mt-2">
              Based on available ledger records
            </p>
          </div>
        </section>

        {/* Ledger */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden print:shadow-none">

          {/* Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">

            <div>
              <div className="flex items-center gap-2">
                <Receipt className="w-4 h-4 text-blue-700" />

                <h2 className="font-bold text-slate-900">
                  Daily Meal Ledger
                </h2>
              </div>

              <p className="text-xs text-slate-500 mt-1">
                {selectedMonth === 'ALL'
                  ? `${filteredDays} record${
                      filteredDays === 1 ? '' : 's'
                    }`
                  : `${filteredDays} record${
                      filteredDays === 1 ? '' : 's'
                    } for ${formatMonth(selectedMonth)}`}
              </p>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full sm:w-56 h-10 pl-9 pr-8 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 appearance-none"
              >
                <option value="ALL">
                  All Months
                </option>

                {availableMonths.map((month) => (
                  <option key={month} value={month}>
                    {formatMonth(month)}
                  </option>
                ))}
              </select>

              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
            </div>
          </div>

          {/* Selected Month */}
          <div className="px-4 sm:px-5 py-3 bg-blue-50/50 border-b border-blue-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-blue-700" />

              <span className="text-slate-600">
                Showing:
              </span>

              <span className="font-semibold text-slate-900">
                {selectedMonth === 'ALL'
                  ? 'All available records'
                  : formatMonth(selectedMonth)}
              </span>
            </div>

            <div className="text-sm font-bold text-blue-800">
              {formatCurrency(filteredTotal)}
            </div>
          </div>

          {/* Empty */}
          {filteredHistory.length === 0 ? (
            <div className="px-6 py-16 text-center">

              <div className="mx-auto h-14 w-14 rounded-2xl bg-slate-100 flex items-center justify-center">
                <FileText className="w-7 h-7 text-slate-400" />
              </div>

              <h3 className="mt-4 text-base font-bold text-slate-800">
                No ledger records found
              </h3>

              <p className="max-w-md mx-auto text-sm text-slate-500 mt-2">
                There are no meal records available for the selected period.
              </p>

              {selectedMonth !== 'ALL' && (
                <button
                  onClick={() => setSelectedMonth('ALL')}
                  className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 text-white text-sm font-semibold hover:bg-slate-800 transition print:hidden"
                >
                  View All Records
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">

                <table className="w-full text-left">

                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500">
                        Meals
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-center">
                        Breakfast
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-center">
                        Lunch
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-center">
                        Dinner
                      </th>

                      <th className="px-5 py-3 text-[10px] uppercase tracking-wider font-bold text-slate-500 text-right">
                        Daily Total
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredHistory.map((record, index) => {

                      const total =
                        Number(record?.dailyTotalCost) || 0;

                      const breakfastTaken = isMealTaken(
                        record,
                        'breakfast'
                      );

                      const lunchTaken = isMealTaken(
                        record,
                        'lunch'
                      );

                      const dinnerTaken = isMealTaken(
                        record,
                        'dinner'
                      );

                      const mealCount = [
                        breakfastTaken,
                        lunchTaken,
                        dinnerTaken
                      ].filter(Boolean).length;

                      return (
                        <tr
                          key={
                            record?._id ||
                            `${record?.date}-${index}`
                          }
                          className="hover:bg-slate-50/80 transition"
                        >

                          {/* Date */}
                          <td className="px-5 py-4 whitespace-nowrap">

                            <div className="flex items-center gap-3">

                              <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                                <Calendar className="w-4 h-4 text-slate-500" />
                              </div>

                              <div>

                                <p className="text-sm font-semibold text-slate-800">
                                  {formatDate(record?.date)}
                                </p>

                                {formatLogTime(record) && (
                                  <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                                    <Clock className="w-3 h-3" />
                                    {formatLogTime(record)}
                                  </div>
                                )}

                              </div>

                            </div>
                          </td>

                          {/* Meal Count */}
                          <td className="px-5 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-100 px-2.5 py-1 text-xs font-bold text-blue-700">
                              <Utensils className="w-3 h-3" />
                              {mealCount}/3
                            </span>

                          </td>

                          {/* Breakfast */}
                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={breakfastTaken} />
                          </td>

                          {/* Lunch */}
                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={lunchTaken} />
                          </td>

                          {/* Dinner */}
                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={dinnerTaken} />
                          </td>

                          {/* Daily Total */}
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <span className="text-sm font-bold text-slate-950">
                              {formatCurrency(total)}
                            </span>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                  <tfoot>
                    <tr className="bg-slate-50 border-t border-slate-200">

                      <td
                        colSpan="5"
                        className="px-5 py-4 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        Filtered Total
                      </td>

                      <td className="px-5 py-4 text-right text-base font-bold text-slate-950">
                        {formatCurrency(filteredTotal)}
                      </td>

                    </tr>
                  </tfoot>

                </table>
              </div>

              {/* Mobile */}
              <div className="md:hidden divide-y divide-slate-100">

                {filteredHistory.map((record, index) => {

                  const total =
                    Number(record?.dailyTotalCost) || 0;

                  const breakfastTaken = isMealTaken(
                    record,
                    'breakfast'
                  );

                  const lunchTaken = isMealTaken(
                    record,
                    'lunch'
                  );

                  const dinnerTaken = isMealTaken(
                    record,
                    'dinner'
                  );

                  const mealCount = [
                    breakfastTaken,
                    lunchTaken,
                    dinnerTaken
                  ].filter(Boolean).length;

                  return (
                    <div
                      key={
                        record?._id ||
                        `${record?.date}-${index}`
                      }
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="flex items-center gap-3">

                          <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                            <Calendar className="w-4 h-4 text-slate-500" />
                          </div>

                          <div>
                            <p className="text-sm font-bold text-slate-900">
                              {formatDate(record?.date)}
                            </p>

                            {formatLogTime(record) && (
                              <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatLogTime(record)}
                              </p>
                            )}
                          </div>

                        </div>

                        <div className="text-right">

                          <p className="text-sm font-bold text-slate-950">
                            {formatCurrency(total)}
                          </p>

                          <span className="text-[10px] text-slate-400">
                            {mealCount}/3 meals
                          </span>

                        </div>

                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-4">

                        <MobileMealStatus
                          label="Breakfast"
                          taken={breakfastTaken}
                        />

                        <MobileMealStatus
                          label="Lunch"
                          taken={lunchTaken}
                        />

                        <MobileMealStatus
                          label="Dinner"
                          taken={dinnerTaken}
                        />

                      </div>

                    </div>
                  );
                })}

                <div className="p-4 bg-slate-50 flex items-center justify-between">

                  <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    Filtered Total
                  </span>

                  <span className="text-base font-bold text-slate-950">
                    {formatCurrency(filteredTotal)}
                  </span>

                </div>
              </div>
            </>
          )}
        </section>

        {/* Information */}
        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 print:hidden">

          <div className="flex items-start gap-3">

            <div className="h-9 w-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <Info className="w-4 h-4 text-blue-700" />
            </div>

            <div>

              <h3 className="text-sm font-bold text-slate-900">
                Ledger information
              </h3>

              <p className="text-xs leading-5 text-slate-500 mt-1">
                A green tick indicates that the meal was registered as
                taken. The daily total represents the total mess charge
                recorded for that day.
              </p>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="text-center pt-2 pb-4 print:hidden">

          <div className="flex items-center justify-center gap-2 text-slate-400">

            <ShieldCheck className="w-3.5 h-3.5" />

            <span className="text-[10px] font-semibold uppercase tracking-wider">
              Secure Student Record
            </span>

          </div>

          <p className="text-[10px] text-slate-400 mt-1">
            Hostel Mess Management System
          </p>

        </footer>

      </main>
    </div>
  );
}

/* --------------------------------
   Desktop Meal Status
--------------------------------- */

function MealStatus({ taken }) {
  if (taken) {
    return (
      <span
        className="inline-flex items-center justify-center gap-1.5 min-w-[82px] rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700"
        title="Meal taken"
      >
        <CheckCircle2 className="w-4 h-4" />
        Taken
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center justify-center min-w-[82px] rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-400"
      title="Meal not taken"
    >
      —
    </span>
  );
}

/* --------------------------------
   Mobile Meal Status
--------------------------------- */

function MobileMealStatus({ label, taken }) {
  return (
    <div
      className={`rounded-xl border p-2.5 ${
        taken
          ? 'bg-emerald-50/60 border-emerald-100'
          : 'bg-slate-50 border-slate-100'
      }`}
    >
      <div className="flex items-center gap-1.5">

        <span
          className={`h-2 w-2 rounded-full ${
            taken ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        />

        <span
          className={`text-[10px] font-bold ${
            taken
              ? 'text-emerald-800'
              : 'text-slate-400'
          }`}
        >
          {label}
        </span>

      </div>

      <div
        className={`flex items-center gap-1 mt-1 text-xs font-bold ${
          taken
            ? 'text-emerald-700'
            : 'text-slate-400'
        }`}
      >
        {taken ? (
          <>
            <CheckCircle2 className="w-3.5 h-3.5" />
            Taken
          </>
        ) : (
          'Not taken'
        )}
      </div>
    </div>
  );
}