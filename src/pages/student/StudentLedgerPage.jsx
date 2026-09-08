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

  const getRecordTotal = (record) => {
    return Number(
      record?.dailyTotal ??
        record?.dailyTotalCost ??
        0
    ) || 0;
  };

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

    const rawTimestamp =
      record?.createdAt || record?.updatedAt;

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

  const currentMonthPrefix =
    new Date().toISOString().substring(0, 7);

  const currentMonthBill = useMemo(() => {
    return history
      .filter(
        (record) =>
          record?.date &&
          typeof record.date === 'string' &&
          record.date.startsWith(currentMonthPrefix)
      )
      .reduce(
        (sum, record) => sum + getRecordTotal(record),
        0
      );
  }, [history, currentMonthPrefix]);

  const totalSpentAllTime = useMemo(() => {
    return history.reduce(
      (sum, record) => sum + getRecordTotal(record),
      0
    );
  }, [history]);

  const filteredTotal = useMemo(() => {
    return filteredHistory.reduce(
      (sum, record) => sum + getRecordTotal(record),
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
      <div className="flex min-h-[45vh] w-full min-w-0 items-center justify-center px-3">
        <div className="w-full max-w-[270px] rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
          <div className="mx-auto mb-2.5 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
            <Loader2 className="h-4 w-4 animate-spin text-blue-700" />
          </div>

          <h2 className="text-[13px] font-bold text-slate-900">
            Loading mess ledger
          </h2>

          <p className="mt-1 text-[10px] leading-4 text-slate-500">
            Retrieving your meal records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full min-w-0 overflow-x-hidden bg-slate-100 font-sans text-slate-900 print:bg-white">

      {/* Institutional Strip */}
      <div className="bg-slate-950 text-slate-200 print:hidden">
        <div className="mx-auto flex min-h-7 max-w-6xl items-center px-2.5 sm:min-h-8 sm:px-3">
          <div className="flex min-w-0 items-center gap-1.5">
            <Landmark className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3" />

            <span className="truncate text-[8px] font-medium sm:text-[9px]">
              University Hostel Mess Management System
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl min-w-0 space-y-2 px-2 py-2 sm:space-y-5 sm:px-4 sm:py-5 lg:py-7">

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-white p-2.5 shadow-sm sm:rounded-xl sm:p-3">
            <div className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-50">
                <Info className="h-3.5 w-3.5 text-red-600" />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold text-red-800 sm:text-xs">
                  Unable to load ledger
                </p>

                <p className="mt-0.5 break-words text-[9px] leading-3.5 text-red-600 sm:text-[10px]">
                  {error}
                </p>
              </div>
            </div>

            <button
              onClick={handleRefresh}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 text-[10px] font-semibold text-white transition hover:bg-red-700 sm:w-auto sm:text-xs"
            >
              <RefreshCw className="h-3 w-3" />
              Retry
            </button>
          </div>
        )}

        {/* Header */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm print:border-0 print:shadow-none sm:rounded-xl">

          <div className="h-0.5 bg-blue-800 print:hidden" />

          <div className="p-2.5 sm:p-5">

            <div className="flex items-center gap-2">

              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 sm:h-11 sm:w-11 sm:rounded-xl">
                <FileText className="h-3.5 w-3.5 text-blue-700 sm:h-5 sm:w-5" />
              </div>

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-1.5">

                  <h1 className="truncate text-[14px] font-bold text-slate-950 sm:text-xl">
                    Mess Ledger
                  </h1>

                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[6px] font-bold uppercase text-emerald-700 sm:px-2 sm:text-[9px]">
                    <ShieldCheck className="h-2 w-2 sm:h-3 sm:w-3" />
                    Official
                  </span>

                </div>

                <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-xs">
                  Your registered meals and daily mess charges.
                </p>

              </div>

            </div>

            <div className="mt-2 grid grid-cols-2 gap-1.5 print:hidden sm:mt-4 sm:flex sm:justify-end sm:gap-2">

              <button
                onClick={handleRefresh}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white px-2 text-[9px] font-semibold text-slate-700 transition hover:bg-slate-50 sm:h-10 sm:rounded-lg sm:px-3 sm:text-xs"
              >
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Refresh
              </button>

              <button
                onClick={handlePrint}
                className="inline-flex h-8 items-center justify-center gap-1 rounded-md bg-slate-950 px-2 text-[9px] font-semibold text-white transition hover:bg-slate-800 sm:h-10 sm:rounded-lg sm:px-3 sm:text-xs"
              >
                <Printer className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                Print
              </button>

            </div>
          </div>

          {/* Student Info */}
          <div className="border-t border-slate-100 bg-slate-50 px-2.5 py-2 sm:px-5 sm:py-3">

            <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4 sm:gap-4">

              <StudentInfo
                label="Student"
                value={user?.name || 'Student'}
              />

              <StudentInfo
                label="Student ID"
                value={user?.studentId || user?.rollNo || '—'}
              />

              <StudentInfo
                label="Hostel"
                value={
                  user?.hostelNo ||
                  user?.hostelId?.hostelNumber ||
                  '—'
                }
              />

              <StudentInfo
                label="Records"
                value={`${totalDays} day${totalDays === 1 ? '' : 's'}`}
              />

            </div>
          </div>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-2 gap-1.5 sm:gap-3 lg:grid-cols-3">

          <SummaryCard
            icon={
              <Wallet className="h-3 w-3 text-blue-700 sm:h-4 sm:w-4" />
            }
            iconBg="bg-blue-50"
            label="This Month"
            title="Current Bill"
            value={formatCurrency(currentMonthBill)}
            footer={formatMonth(currentMonthPrefix)}
          />

          <SummaryCard
            icon={
              <IndianRupee className="h-3 w-3 text-emerald-700 sm:h-4 sm:w-4" />
            }
            iconBg="bg-emerald-50"
            label="All Time"
            title="Total Charges"
            value={formatCurrency(totalSpentAllTime)}
            footer={`${totalDays} recorded day${totalDays === 1 ? '' : 's'}`}
          />

          <div className="col-span-2 lg:col-span-1">
            <SummaryCard
              icon={
                <Receipt className="h-3 w-3 text-amber-700 sm:h-4 sm:w-4" />
              }
              iconBg="bg-amber-50"
              label="Average"
              title="Daily Cost"
              value={formatCurrency(averageDailyCost)}
              footer="Based on available records"
            />
          </div>

        </section>

        {/* Ledger */}
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm print:shadow-none sm:rounded-xl">

          {/* Toolbar */}
          <div className="border-b border-slate-200 p-2.5 sm:p-4 print:hidden">

            <div className="flex items-center gap-2">

              <div className="min-w-0 flex-1">

                <div className="flex items-center gap-1">

                  <Receipt className="h-3 w-3 shrink-0 text-blue-700" />

                  <h2 className="truncate text-[11px] font-bold text-slate-900 sm:text-sm">
                    Daily Meal Ledger
                  </h2>

                </div>

                <p className="mt-0.5 truncate text-[8px] text-slate-500 sm:text-[11px]">
                  {selectedMonth === 'ALL'
                    ? `${filteredDays} record${filteredDays === 1 ? '' : 's'}`
                    : `${filteredDays} record${filteredDays === 1 ? '' : 's'} • ${formatMonth(selectedMonth)}`}
                </p>

              </div>

              <div className="relative w-[108px] shrink-0 sm:w-[170px]">

                <Filter className="pointer-events-none absolute left-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400" />

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="h-8 w-full appearance-none rounded-md border border-slate-200 bg-white pl-7 pr-6 text-[9px] font-semibold text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:h-10 sm:rounded-lg sm:text-xs"
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

                <ChevronRight className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 rotate-90 text-slate-400" />

              </div>

            </div>
          </div>

          {/* Selected Month */}
          <div className="border-b border-blue-100 bg-blue-50/50 px-2.5 py-1.5 sm:px-4 sm:py-2.5">

            <div className="flex items-center justify-between gap-2">

              <div className="flex min-w-0 items-center gap-1 text-[9px] sm:text-xs">

                <Calendar className="h-3 w-3 shrink-0 text-blue-700" />

                <span className="text-slate-500">
                  Showing
                </span>

                <span className="truncate font-bold text-slate-900">
                  {selectedMonth === 'ALL'
                    ? 'All records'
                    : formatMonth(selectedMonth)}
                </span>

              </div>

              <span className="shrink-0 text-[11px] font-bold text-blue-800 sm:text-sm">
                {formatCurrency(filteredTotal)}
              </span>

            </div>
          </div>

          {/* Empty State */}
          {filteredHistory.length === 0 ? (
            <div className="px-3 py-8 text-center sm:py-14">

              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                <FileText className="h-4 w-4 text-slate-400" />
              </div>

              <h3 className="mt-2.5 text-[11px] font-bold text-slate-800 sm:text-sm">
                No ledger records found
              </h3>

              <p className="mx-auto mt-1 max-w-sm text-[9px] leading-4 text-slate-500 sm:text-xs">
                No meal records are available for the selected period.
              </p>

              {selectedMonth !== 'ALL' && (
                <button
                  onClick={() => setSelectedMonth('ALL')}
                  className="mt-3 inline-flex h-8 items-center justify-center gap-1 rounded-md bg-slate-950 px-3 text-[9px] font-semibold text-white transition hover:bg-slate-800 print:hidden"
                >
                  View All Records
                  <ChevronRight className="h-3 w-3" />
                </button>
              )}

            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">

                <table className="w-full text-left">

                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Meals
                      </th>

                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Breakfast
                      </th>

                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Lunch
                      </th>

                      <th className="px-5 py-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Dinner
                      </th>

                      <th className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Daily Total
                      </th>

                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {filteredHistory.map((record, index) => {

                      const total = getRecordTotal(record);

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
                          className="transition hover:bg-slate-50/80"
                        >

                          <td className="whitespace-nowrap px-5 py-4">

                            <div className="flex items-center gap-3">

                              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                                <Calendar className="h-4 w-4 text-slate-500" />
                              </div>

                              <div>
                                <p className="text-sm font-semibold text-slate-800">
                                  {formatDate(record?.date)}
                                </p>

                                {formatLogTime(record) && (
                                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-400">
                                    <Clock className="h-3 w-3" />
                                    {formatLogTime(record)}
                                  </div>
                                )}
                              </div>

                            </div>
                          </td>

                          <td className="px-5 py-4">

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                              <Utensils className="h-3 w-3" />
                              {mealCount}/3
                            </span>

                          </td>

                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={breakfastTaken} />
                          </td>

                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={lunchTaken} />
                          </td>

                          <td className="px-5 py-4 text-center">
                            <MealStatus taken={dinnerTaken} />
                          </td>

                          <td className="whitespace-nowrap px-5 py-4 text-right">
                            <span className="text-sm font-bold text-slate-950">
                              {formatCurrency(total)}
                            </span>
                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                  <tfoot>
                    <tr className="border-t border-slate-200 bg-slate-50">

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

              {/* Mobile Ledger */}
              <div className="md:hidden">

                {filteredHistory.map((record, index) => {

                  const total = getRecordTotal(record);

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
                      className="border-b border-slate-100 px-2.5 py-2 sm:px-3 sm:py-2.5"
                    >

                      {/* Date + Amount */}
                      <div className="flex items-center justify-between gap-2">

                        <div className="flex min-w-0 items-center gap-1.5">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100">
                            <Calendar className="h-3 w-3 text-slate-500" />
                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-[10px] font-bold text-slate-900">
                              {formatDate(record?.date)}
                            </p>

                            {formatLogTime(record) && (
                              <p className="mt-0.5 flex items-center gap-0.5 text-[7px] text-slate-400">
                                <Clock className="h-2 w-2" />
                                {formatLogTime(record)}
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="shrink-0 text-right">

                          <p className="text-[11px] font-bold text-slate-950">
                            {formatCurrency(total)}
                          </p>

                          <p className="mt-0 text-[7px] text-slate-400">
                            {mealCount}/3 meals
                          </p>

                        </div>

                      </div>

                      {/* Meal Status */}
                      <div className="mt-1.5 grid grid-cols-3 gap-1">

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

                {/* Mobile Total */}
                <div className="flex items-center justify-between bg-slate-50 px-2.5 py-2">

                  <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    Filtered Total
                  </span>

                  <span className="text-[11px] font-bold text-slate-950">
                    {formatCurrency(filteredTotal)}
                  </span>

                </div>

              </div>
            </>
          )}
        </section>

        {/* Information */}
        <section className="rounded-lg border border-slate-200 bg-white p-2.5 shadow-sm print:hidden sm:rounded-xl sm:p-4">

          <div className="flex items-start gap-2">

            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50">
              <Info className="h-3 w-3 text-blue-700" />
            </div>

            <div className="min-w-0">

              <h3 className="text-[10px] font-bold text-slate-900 sm:text-xs">
                Ledger information
              </h3>

              <p className="mt-0.5 text-[8px] leading-3.5 text-slate-500 sm:text-[11px]">
                A green tick indicates that the meal was registered as taken.
                The daily total represents the total mess charge recorded for
                that day.
              </p>

            </div>

          </div>

        </section>

        {/* Footer */}
        <footer className="pb-1 pt-0 text-center print:hidden sm:pb-4 sm:pt-1">

          <div className="flex items-center justify-center gap-1 text-slate-400">

            <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3" />

            <span className="text-[7px] font-semibold uppercase tracking-wider sm:text-[8px]">
              Secure Student Record
            </span>

          </div>

          <p className="mt-0.5 text-[7px] text-slate-400 sm:text-[8px]">
            Hostel Mess Management System
          </p>

        </footer>

      </main>
    </div>
  );
}

/* --------------------------------
   Student Information
--------------------------------- */

function StudentInfo({ label, value }) {
  return (
    <div className="min-w-0">
      <p className="text-[7px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
        {label}
      </p>

      <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-800 sm:text-xs">
        {value}
      </p>
    </div>
  );
}

/* --------------------------------
   Summary Card
--------------------------------- */

function SummaryCard({
  icon,
  iconBg,
  label,
  title,
  value,
  footer
}) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-2 shadow-sm sm:rounded-2xl sm:p-4">

      <div className="flex items-center justify-between gap-1">

        <div
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md sm:h-9 sm:w-9 sm:rounded-xl ${iconBg}`}
        >
          {icon}
        </div>

        <span className="truncate text-[6px] font-bold uppercase tracking-wider text-slate-400 sm:text-[9px]">
          {label}
        </span>

      </div>

      <p className="mt-1.5 text-[8px] font-medium text-slate-500 sm:mt-3 sm:text-[11px]">
        {title}
      </p>

      <p className="mt-0.5 truncate text-[12px] font-bold text-slate-950 sm:text-xl">
        {value}
      </p>

      <p className="mt-0.5 truncate text-[7px] text-slate-400 sm:mt-1.5 sm:text-[10px]">
        {footer}
      </p>

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
        className="inline-flex min-w-[82px] items-center justify-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700"
        title="Meal taken"
      >
        <CheckCircle2 className="h-4 w-4" />
        Taken
      </span>
    );
  }

  return (
    <span
      className="inline-flex min-w-[82px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-400"
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
      className={`min-w-0 rounded-[5px] border px-1 py-1 ${
        taken
          ? 'border-emerald-100 bg-emerald-50/60'
          : 'border-slate-100 bg-slate-50'
      }`}
    >

      <div className="flex items-center gap-0.5">

        <span
          className={`h-0.5 w-0.5 shrink-0 rounded-full ${
            taken ? 'bg-emerald-500' : 'bg-slate-300'
          }`}
        />

        <span
          className={`truncate text-[6px] font-bold ${
            taken
              ? 'text-emerald-800'
              : 'text-slate-400'
          }`}
        >
          {label}
        </span>

      </div>

      <div
        className={`mt-0.5 flex items-center gap-0.5 text-[7px] font-bold ${
          taken
            ? 'text-emerald-700'
            : 'text-slate-400'
        }`}
      >

        {taken ? (
          <>
            <CheckCircle2 className="h-2 w-2 shrink-0" />
            Taken
          </>
        ) : (
          'Not taken'
        )}

      </div>

    </div>
  );
}