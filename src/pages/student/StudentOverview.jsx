import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import QRCode from 'react-qr-code';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

import {
  BellRing,
  CreditCard,
  Calendar,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Landmark,
  FileText,
  Fingerprint,
  Activity,
  Clock,
  ShieldCheck,
  Layers,
  Building,
  MessageSquareWarning,
  RefreshCw,
  ArrowRight
} from 'lucide-react';

export default function StudentOverview({ user }) {
  const navigate = useNavigate();

  const [history, setHistory] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const studentId = user?._id || user?.id || user?.userId;

  // --------------------------------------------------
  // LOCAL DATE HELPERS
  // --------------------------------------------------

  const getLocalDate = () => {
    const date = new Date();

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const getCurrentMonthPrefix = () => {
    return getLocalDate().substring(0, 7);
  };

  // --------------------------------------------------
  // FETCH DASHBOARD DATA
  // --------------------------------------------------

  const fetchDashboardData = async (showFullLoader = false) => {
    if (!studentId) return;

    try {
      if (showFullLoader) {
        setLoadingHistory(true);
      } else {
        setRefreshing(true);
      }

      setErrorMsg('');

      const [mealsRes, noticesRes] = await Promise.all([
        API.get(`/meals/user/${studentId}`),
        API.get('/notices')
      ]);

      setHistory(
        Array.isArray(mealsRes.data)
          ? mealsRes.data
          : []
      );

      setNotices(
        Array.isArray(noticesRes.data)
          ? noticesRes.data
          : []
      );
    } catch (error) {
      console.error('Student overview error:', error);

      setErrorMsg(
        'Unable to load your latest mess information. Please try again.'
      );
    } finally {
      if (showFullLoader) {
        setTimeout(() => {
          setLoadingHistory(false);
        }, 350);
      } else {
        setRefreshing(false);
      }
    }
  };

  useEffect(() => {
    fetchDashboardData(true);
  }, [studentId]);

  // --------------------------------------------------
  // MONTHLY BILLING CALCULATION
  // --------------------------------------------------

  const currentMonthPrefix = getCurrentMonthPrefix();

  const currentMonthRecords = useMemo(() => {
    return history.filter(
      record =>
        record &&
        record.date &&
        record.date.startsWith(currentMonthPrefix)
    );
  }, [history, currentMonthPrefix]);

  const {
    totalDietCost,
    totalExtrasCost,
    totalMonthlyPayable,
    totalSpentAllTime,
    extraDietsCost,
    baseMaintenanceFee
  } = useMemo(() => {
    let dietCost = 0;
    let extrasCost = 0;

    currentMonthRecords.forEach(record => {
      let dailyExtraCost = 0;

      if (
        Array.isArray(record.extras) &&
        record.extras.length > 0
      ) {
        dailyExtraCost = record.extras.reduce(
          (sum, item) => sum + (Number(item?.cost) || 0),
          0
        );
      }

      extrasCost += dailyExtraCost;

      const dailyTotal = Number(record.dailyTotalCost) || 0;

      dietCost += Math.max(
        0,
        dailyTotal - dailyExtraCost
      );
    });

    const gender = user?.gender?.toLowerCase() || '';
    const category = user?.category?.toLowerCase() || '';

    const maintenanceFee =
      gender === 'female' ||
      category.includes('girl')
        ? 1000
        : 1100;

    const additionalDietCost =
      dietCost > maintenanceFee
        ? dietCost - maintenanceFee
        : 0;

    const monthlyPayable =
      maintenanceFee +
      additionalDietCost +
      extrasCost;

    const allTimeSpent = history.reduce(
      (sum, record) =>
        sum + (Number(record?.dailyTotalCost) || 0),
      0
    );

    return {
      totalDietCost: dietCost,
      totalExtrasCost: extrasCost,
      totalMonthlyPayable: monthlyPayable,
      totalSpentAllTime: allTimeSpent,
      extraDietsCost: additionalDietCost,
      baseMaintenanceFee: maintenanceFee
    };
  }, [currentMonthRecords, history, user]);

  // --------------------------------------------------
  // NOTICES
  // --------------------------------------------------

  const relevantNotices = useMemo(() => {
    return notices.filter(notice => {
      if (notice?.hostelNo === 'ALL') return true;

      return (
        notice?.hostelNo &&
        notice.hostelNo === user?.hostelNo
      );
    });
  }, [notices, user]);

  // --------------------------------------------------
  // CHART
  // --------------------------------------------------

  const chartData = useMemo(() => {
    return [...history]
      .filter(record => record?.date)
      .sort(
        (a, b) =>
          new Date(a.date) - new Date(b.date)
      )
      .slice(-30);
  }, [history]);

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

  if (loadingHistory) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-4">
            <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
          </div>

          <h2 className="text-sm font-bold text-slate-900">
            Loading your dashboard
          </h2>

          <p className="text-xs text-slate-500 mt-1">
            Please wait while we fetch your latest mess records.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-12">
      <main className="max-w-7xl mx-auto px-3 sm:px-6 py-5 space-y-5">

        {/* -------------------------------------------- */}
        {/* ERROR MESSAGE */}
        {/* -------------------------------------------- */}

        {errorMsg && (
          <div className="bg-white border border-red-200 rounded-xl shadow-sm px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-red-600" />
              </div>

              <p className="text-xs font-semibold text-red-800">
                {errorMsg}
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboardData(false)}
              disabled={refreshing}
              className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              Retry
            </button>
          </div>
        )}

        {/* -------------------------------------------- */}
        {/* PAGE HEADER */}
        {/* -------------------------------------------- */}

        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Landmark className="w-4 h-4 text-blue-700" />
                </div>

                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Student Mess Portal
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Welcome, {user?.name || 'Student'}
              </h1>

              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                View your mess activity, monthly charges and latest notices.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchDashboardData(false)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  refreshing ? 'animate-spin' : ''
                }`}
              />
              Refresh
            </button>

          </div>
        </div>

        {/* -------------------------------------------- */}
        {/* PROFILE + MONTHLY BILL */}
        {/* -------------------------------------------- */}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* STUDENT PROFILE */}

          <section className="lg:col-span-8 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-700" />

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Student Profile
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Your registered university information
                  </p>
                </div>
              </div>

              <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-full px-2.5 py-1">
                <CheckCircle2 className="w-3 h-3" />
                Active
              </span>
            </div>

            <div className="p-5 sm:p-6">

              <div className="flex flex-col sm:flex-row gap-5">

                {/* PHOTO + QR */}

                <div className="flex sm:flex-col items-center gap-4 sm:gap-3 shrink-0">

                  <div className="relative">

                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">

                      {user?.profilePhoto ? (
                        <img
                          src={user.profilePhoto}
                          alt="Student profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Fingerprint className="w-10 h-10 text-slate-300" />
                        </div>
                      )}

                    </div>

                    <span
                      className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center"
                      title="Profile verified"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </span>

                  </div>

                  <div className="bg-white border border-slate-200 rounded-xl p-2">
                    <QRCode
                      value={
                        user?.studentId ||
                        user?.rollNo ||
                        'STUDENT'
                      }
                      size={68}
                      bgColor="#ffffff"
                      fgColor="#0f172a"
                      level="L"
                    />
                  </div>

                </div>

                {/* DETAILS */}

                <div className="flex-1 min-w-0">

                  <div className="mb-5">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                      {user?.name || 'Student'}
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      {user?.department || 'Department not available'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Student ID
                      </p>

                      <p className="text-sm font-bold text-slate-900 font-mono mt-1 break-all">
                        {user?.studentId || 'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Roll Number
                      </p>

                      <p className="text-sm font-bold text-slate-900 font-mono mt-1 break-all">
                        {user?.rollNo || 'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Department
                      </p>

                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {user?.department || 'N/A'}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        University / Session
                      </p>

                      <p className="text-sm font-semibold text-slate-800 mt-1">
                        {user?.university || 'N/A'}
                        {' / '}
                        {user?.session || 'N/A'}
                      </p>
                    </div>

                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Building className="w-4 h-4 text-blue-700" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Hostel
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {user?.hostelNo || 'Not assigned'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-orange-700" />
                      </div>

                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          Category
                        </p>

                        <p className="text-sm font-bold text-slate-900">
                          {user?.category || 'General'}
                        </p>
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </section>

          {/* MONTHLY BILL */}

          <section className="lg:col-span-4 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">

            <div className="px-5 py-4 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />

                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Monthly Mess Charges
                  </h2>

                  <p className="text-[11px] text-slate-500">
                    Current billing cycle
                  </p>
                </div>
              </div>
            </div>

            <div className="p-5 flex-1">

              <div className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-center">

                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Estimated Payable
                </p>

                <div className="flex items-center justify-center gap-1 mt-2">
                  <IndianRupee className="w-6 h-6 text-blue-700" />

                  <span className="text-3xl sm:text-4xl font-black text-slate-900">
                    {totalMonthlyPayable.toLocaleString('en-IN')}
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 mt-2">
                  Base fee + additional diet + extra items
                </p>

              </div>

              <div className="mt-4 space-y-2">

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Base maintenance
                  </span>

                  <span className="font-bold text-slate-900">
                    ₹{baseMaintenanceFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Additional diet
                  </span>

                  <span className="font-bold text-slate-900">
                    ₹{extraDietsCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Extra items
                  </span>

                  <span className="font-bold text-slate-900">
                    ₹{totalExtrasCost.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Total
                  </span>

                  <span className="text-sm font-black text-blue-700">
                    ₹{totalMonthlyPayable.toLocaleString('en-IN')}
                  </span>
                </div>

              </div>

            </div>

            <div className="p-4 border-t border-slate-200">

              <button
                type="button"
                onClick={() => navigate('/student/payments')}
                className="w-full inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl px-4 py-3 text-xs font-bold transition"
              >
                <CreditCard className="w-4 h-4" />
                View Payments
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </button>

            </div>

          </section>

        </div>

        {/* -------------------------------------------- */}
        {/* STAT CARDS */}
        {/* -------------------------------------------- */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* LOGGED DAYS */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Logged Diet Days
                </p>

                <p className="text-2xl font-black text-slate-900 mt-2">
                  {history.length}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Total recorded days
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-700" />
              </div>

            </div>
          </div>

          {/* MONTH DIET */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  This Month Diet
                </p>

                <p className="text-2xl font-black text-slate-900 mt-2">
                  ₹{totalDietCost.toLocaleString('en-IN')}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Recorded meal charges
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-orange-700" />
              </div>

            </div>
          </div>

          {/* TOTAL SPENT */}

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">
            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Total Mess Spending
                </p>

                <p className="text-2xl font-black text-slate-900 mt-2">
                  ₹{totalSpentAllTime.toLocaleString('en-IN')}
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Across all recorded days
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <IndianRupee className="w-5 h-5 text-emerald-700" />
              </div>

            </div>
          </div>

          {/* COMPLAINTS */}

          <button
            type="button"
            onClick={() => navigate('/student/complaints')}
            className="text-left bg-white border border-slate-200 rounded-2xl shadow-sm p-4 hover:border-blue-200 hover:shadow-md transition group"
          >
            <div className="flex items-start justify-between gap-3">

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Complaints
                </p>

                <p className="text-sm font-bold text-slate-900 mt-2 group-hover:text-blue-700 transition">
                  View Complaints
                </p>

                <p className="text-[11px] text-slate-400 mt-1">
                  Submit or track an issue
                </p>
              </div>

              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center group-hover:bg-blue-50 transition">
                <MessageSquareWarning className="w-5 h-5 text-slate-600 group-hover:text-blue-700 transition" />
              </div>

            </div>
          </button>

        </div>

        {/* -------------------------------------------- */}
        {/* 30 DAY CHART */}
        {/* -------------------------------------------- */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">

            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-700" />

                <h2 className="text-sm font-bold text-slate-900">
                  Mess Spending Trend
                </h2>
              </div>

              <p className="text-[11px] text-slate-500 mt-1">
                Daily mess expenditure for the latest 30 recorded days
              </p>
            </div>

            <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
              INR
            </span>

          </div>

          <div className="p-4 sm:p-5 h-72 sm:h-80">

            {chartData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">

                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <Activity className="w-6 h-6 text-slate-300" />
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  No mess records available
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Your spending chart will appear after meals are recorded.
                </p>

              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 0
                  }}
                >

                  <defs>
                    <linearGradient
                      id="studentOverviewArea"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.18}
                      />

                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 10,
                      fill: '#64748b'
                    }}
                    tickLine={false}
                    axisLine={false}
                    minTickGap={25}
                  />

                  <YAxis
                    tick={{
                      fontSize: 10,
                      fill: '#64748b'
                    }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={value => `₹${value}`}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#0f172a',
                      boxShadow:
                        '0 8px 24px rgba(15, 23, 42, 0.08)'
                    }}
                    formatter={value => [
                      `₹${Number(value || 0).toLocaleString('en-IN')}`,
                      'Daily Cost'
                    ]}
                  />

                  <Area
                    type="monotone"
                    dataKey="dailyTotalCost"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    fill="url(#studentOverviewArea)"
                    fillOpacity={1}
                  />

                </AreaChart>
              </ResponsiveContainer>
            )}

          </div>

        </section>

        {/* -------------------------------------------- */}
        {/* NOTICE BOARD */}
        {/* -------------------------------------------- */}

        <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3">

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <BellRing className="w-4 h-4 text-blue-700" />
              </div>

              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Notice Board
                </h2>

                <p className="text-[11px] text-slate-500">
                  Latest notices for students
                </p>
              </div>

            </div>

            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
              {relevantNotices.length} notice
              {relevantNotices.length !== 1 ? 's' : ''}
            </span>

          </div>

          <div className="p-4 sm:p-5">

            {relevantNotices.length === 0 ? (
              <div className="py-10 text-center">

                <div className="mx-auto w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                  <BellRing className="w-6 h-6 text-slate-300" />
                </div>

                <p className="text-sm font-semibold text-slate-600">
                  No new notices
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  There are currently no notices for your hostel.
                </p>

              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                {relevantNotices.map(notice => (

                  <article
                    key={notice._id}
                    className="border border-slate-200 rounded-xl p-4 hover:border-blue-200 hover:shadow-sm transition"
                  >

                    <div className="flex items-center justify-between gap-2 mb-3">

                      <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-2.5 py-1 uppercase">
                        <Building className="w-3 h-3" />
                        {notice.hostelNo === 'ALL'
                          ? 'All Hostels'
                          : notice.hostelNo}
                      </span>

                      <span className="text-[9px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />

                        {notice.createdAt
                          ? new Date(
                              notice.createdAt
                            ).toLocaleDateString('en-IN')
                          : 'Recent'}
                      </span>

                    </div>

                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {notice.title || 'Notice'}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed mt-2 whitespace-pre-wrap">
                      {notice.content || 'No additional details provided.'}
                    </p>

                  </article>

                ))}

              </div>
            )}

          </div>

        </section>

        {/* -------------------------------------------- */}
        {/* QUICK ACTIONS */}
        {/* -------------------------------------------- */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          <button
            type="button"
            onClick={() => navigate('/student/ledger')}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition group"
          >
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-700" />
              </div>

              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  Meal Ledger
                </p>

                <p className="text-[10px] text-slate-500">
                  View meal history
                </p>
              </div>

            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 transition" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/payments')}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition group"
          >
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-emerald-700" />
              </div>

              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  Payments
                </p>

                <p className="text-[10px] text-slate-500">
                  Check payment details
                </p>
              </div>

            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 transition" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/student/complaints')}
            className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:border-blue-200 hover:shadow-sm transition group"
          >
            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center">
                <MessageSquareWarning className="w-4 h-4 text-orange-700" />
              </div>

              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">
                  Complaints
                </p>

                <p className="text-[10px] text-slate-500">
                  Report a mess issue
                </p>
              </div>

            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-700 transition" />
          </button>

        </section>

      </main>
    </div>
  );
}