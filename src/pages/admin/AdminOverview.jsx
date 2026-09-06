import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';

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
    Users,
    Utensils,
    IndianRupee,
    CreditCard,
    MessageSquareWarning,
    TrendingUp,
    Loader2,
    Activity,
    CalendarDays,
    UserRound,
    Building2,
    GraduationCap,
    BadgeCheck,
    Mail,
    Phone,
    BriefcaseBusiness,
    IdCard,
    UserRoundCheck
} from 'lucide-react';

export default function AdminOverview() {

    const [stats, setStats] = useState({
        users: 0,
        meals: [],
        payments: [],
        complaints: 0
    });

    const [loading, setLoading] = useState(true);

    /* 
     * ============================================================
     * ADMIN / WARDEN PROFILE
     * ============================================================
     */

    const [currentUser, setCurrentUser] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem('user') || '{}'
            );
        } catch {
            return {};
        }
    });

    /*
     * Keep overview synchronized when ProfileModal updates
     * the administrator profile.
     */

    useEffect(() => {

        const handleUserUpdated = () => {

            try {

                const updatedUser = JSON.parse(
                    localStorage.getItem('user') || '{}'
                );

                setCurrentUser(updatedUser);

            } catch {

                setCurrentUser({});

            }

        };

        window.addEventListener(
            'userUpdated',
            handleUserUpdated
        );

        return () => {

            window.removeEventListener(
                'userUpdated',
                handleUserUpdated
            );

        };

    }, []);

    /*
     * ============================================================
     * DASHBOARD DATA
     * ============================================================
     */

    useEffect(() => {

        const fetchDashboardData = async () => {

            try {

                const [
                    resUsers,
                    resMeals,
                    resPayments,
                    resComplaints
                ] = await Promise.all([

                    API.get('/auth/users'),

                    API.get('/meals/all'),

                    API.get(
                        '/payments/admin/all-payments'
                    ),

                    API.get('/complaints/all')

                ]);

                setStats({

                    users:
                        resUsers.data?.length || 0,

                    meals:
                        resMeals.data || [],

                    payments:
                        resPayments.data || [],

                    complaints:
                        (resComplaints.data || [])
                            .filter(
                                c => c.status === 'Pending'
                            )
                            .length

                });

            } catch (err) {

                console.error(
                    'Dashboard fetch error:',
                    err
                );

            } finally {

                setLoading(false);

            }

        };

        fetchDashboardData();

    }, []);

    /*
     * ============================================================
     * FINANCIAL CALCULATIONS
     * ============================================================
     */

    const getMealCost = meal => {

        return (
            Number(
                meal?.dailyTotal ??
                meal?.dailyTotalCost ??
                0
            ) || 0
        );

    };

    const totalCampusRevenue = useMemo(() => {

        return stats.meals.reduce(
            (sum, meal) => {

                return sum + getMealCost(meal);

            },
            0
        );

    }, [stats.meals]);

    const totalFeeCollected = useMemo(() => {

        return stats.payments.reduce(
            (sum, payment) => {

                return (
                    sum +
                    (
                        Number(
                            payment?.amount
                        ) || 0
                    )
                );

            },
            0
        );

    }, [stats.payments]);

    /*
     * ============================================================
     * CHART DATA
     * ============================================================
     */

    const chartData = useMemo(() => {

        const revenueByDate =
            stats.meals.reduce(
                (acc, meal) => {

                    if (!meal?.date) {
                        return acc;
                    }

                    const cost =
                        getMealCost(meal);

                    acc[meal.date] =
                        (acc[meal.date] || 0) +
                        cost;

                    return acc;

                },
                {}
            );

        return Object.keys(revenueByDate)
            .sort()
            .map(date => ({
                date,
                revenue:
                    revenueByDate[date]
            }))
            .slice(-30);

    }, [stats.meals]);

    const averageDailyRevenue = useMemo(() => {

        if (!chartData.length) {
            return 0;
        }

        return (
            totalCampusRevenue /
            chartData.length
        );

    }, [
        chartData,
        totalCampusRevenue
    ]);

    /*
     * ============================================================
     * HELPERS
     * ============================================================
     */

    const formatCurrency = value => {

        return `₹${Number(
            value || 0
        ).toLocaleString('en-IN')}`;

    };

    const getValue = value => {

        return value || 'Not provided';

    };

    /*
     * ============================================================
     * PROFILE PHOTO
     * ============================================================
     */

    const profilePhoto =
        currentUser.profilePhoto ||
        currentUser.photo ||
        currentUser.avatar;

    /*
     * ============================================================
     * CONTACT NUMBER
     * ============================================================
     */

    const contactNumber =
        currentUser.mobileNo ||
        currentUser.phone ||
        currentUser.mobile ||
        '';

    /*
     * ============================================================
     * LOADING STATE
     * ============================================================
     */

    if (loading) {

        return (

            <div className="min-h-[55vh] bg-white border border-slate-200 rounded-2xl flex flex-col items-center justify-center">

                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">

                    <Loader2
                        className="w-6 h-6 text-blue-900 animate-spin"
                    />

                </div>

                <p className="text-sm font-bold text-slate-800">
                    Loading dashboard
                </p>

                <p className="text-xs text-slate-500 mt-1">
                    Fetching the latest mess records...
                </p>

            </div>

        );

    }

    return (

        <div className="space-y-6 animate-in fade-in duration-300">

            {/* =====================================================
                PAGE HEADER
            ====================================================== */}

            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">

                <div>

                    <div className="flex items-center gap-2 mb-2">

                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">

                            <Building2 className="w-4 h-4" />

                        </div>

                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                            Hostel Administration
                        </span>

                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                        Executive Dashboard
                    </h1>

                    <p className="text-sm text-slate-500 mt-1">
                        Administrative overview of hostel operations,
                        meals, payments and grievances.
                    </p>

                </div>

                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm w-fit">

                    <span className="relative flex h-2.5 w-2.5">

                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>

                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>

                    </span>

                    <span className="text-xs font-semibold text-slate-600">
                        System synchronized
                    </span>

                </div>

            </div>


            {/* =====================================================
                WARDEN / ADMIN PROFILE
            ====================================================== */}

            <section className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                {/* PROFILE HEADER */}

                <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50/70">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="w-9 h-9 rounded-lg bg-blue-900 text-white flex items-center justify-center">

                                    <UserRoundCheck className="w-5 h-5" />

                                </div>

                                <div>

                                    <h2 className="text-sm sm:text-base font-bold text-slate-900">
                                        Warden / In-Charge Profile
                                    </h2>

                                    <p className="text-xs text-slate-500">
                                        Essential administrative information
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-900 w-fit">

                            <BadgeCheck className="w-4 h-4" />

                            <span className="text-xs font-bold">
                                Authorized Administrator
                            </span>

                        </div>

                    </div>

                </div>


                {/* PROFILE BODY */}

                <div className="p-5 sm:p-6">

                    <div className="flex flex-col lg:flex-row gap-6">

                        {/* =================================================
                            PROFILE IDENTITY
                        ================================================== */}

                        <div className="lg:w-[280px] shrink-0">

                            <div className="flex flex-col items-center text-center p-5 bg-slate-50 border border-slate-200 rounded-xl">

                                {/* PROFILE IMAGE */}

                                {profilePhoto ? (

                                    <img
                                        src={profilePhoto}
                                        alt="Administrator"
                                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                                    />

                                ) : (

                                    <div className="w-24 h-24 rounded-full bg-blue-900 text-white flex items-center justify-center border-4 border-white shadow-md">

                                        <UserRound className="w-11 h-11" />

                                    </div>

                                )}

                                <h3 className="text-lg font-bold text-slate-900 mt-4">
                                    {getValue(currentUser.name)}
                                </h3>

                                <p className="text-sm font-semibold text-blue-900 mt-1">
                                    {getValue(currentUser.designation)}
                                </p>

                                <div className="flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg">

                                    <IdCard className="w-3.5 h-3.5 text-slate-500" />

                                    <span className="text-xs font-semibold text-slate-600">
                                        ID: {getValue(
                                            currentUser.teacherId ||
                                            currentUser.employeeId
                                        )}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* =================================================
                            MANDATORY PROFILE INFORMATION
                        ================================================== */}

                        <div className="flex-1">

                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">

                                {/* NAME */}

                                <ProfileField
                                    icon={UserRound}
                                    label="Full Name"
                                    value={currentUser.name}
                                />

                                {/* TEACHER / EMPLOYEE ID */}

                                <ProfileField
                                    icon={IdCard}
                                    label="Teacher / Employee ID"
                                    value={
                                        currentUser.teacherId ||
                                        currentUser.employeeId
                                    }
                                />

                                {/* DESIGNATION */}

                                <ProfileField
                                    icon={GraduationCap}
                                    label="Designation"
                                    value={
                                        currentUser.designation
                                    }
                                />

                                {/* HOSTEL */}

                                <ProfileField
                                    icon={Building2}
                                    label="Warden In-Charge"
                                    value={
                                        currentUser.wardenHostel ||
                                        currentUser.hostelNo
                                    }
                                    highlight
                                />

                                {/* DEPARTMENT */}

                                <ProfileField
                                    icon={BriefcaseBusiness}
                                    label="Department"
                                    value={
                                        currentUser.department
                                    }
                                />

                                {/* EMAIL */}

                                <ProfileField
                                    icon={Mail}
                                    label="Official Email"
                                    value={
                                        currentUser.email
                                    }
                                />

                                {/* PHONE */}

                                <ProfileField
                                    icon={Phone}
                                    label="Contact Number"
                                    value={
                                        contactNumber
                                    }
                                />

                            </div>

                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
                DASHBOARD KPI CARDS
            ====================================================== */}

            <div>

                <div className="flex items-center gap-2 mb-3">

                    <Activity className="w-4 h-4 text-blue-900" />

                    <h2 className="text-sm font-bold text-slate-900">
                        Operational Summary
                    </h2>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">

                    {/* USERS */}

                    <StatCard
                        label="Registered Members"
                        value={
                            stats.users.toLocaleString(
                                'en-IN'
                            )
                        }
                        description="Registered student accounts"
                        icon={Users}
                        iconClass="bg-blue-50 text-blue-900"
                    />

                    {/* MEALS */}

                    <StatCard
                        label="Meal Records"
                        value={
                            stats.meals.length.toLocaleString(
                                'en-IN'
                            )
                        }
                        description="Total recorded meal entries"
                        icon={Utensils}
                        iconClass="bg-amber-50 text-amber-700"
                    />

                    {/* MEAL COST */}

                    <StatCard
                        label="Meal Cost"
                        value={
                            formatCurrency(
                                totalCampusRevenue
                            )
                        }
                        description="Total recorded meal expenditure"
                        icon={IndianRupee}
                        iconClass="bg-emerald-50 text-emerald-700"
                    />

                    {/* PAYMENTS */}

                    <StatCard
                        label="Payments Collected"
                        value={
                            formatCurrency(
                                totalFeeCollected
                            )
                        }
                        description="Total recorded payments"
                        icon={CreditCard}
                        iconClass="bg-indigo-50 text-indigo-700"
                    />

                    {/* COMPLAINTS */}

                    <StatCard
                        label="Pending Complaints"
                        value={stats.complaints}
                        description="Complaints awaiting action"
                        icon={MessageSquareWarning}
                        iconClass="bg-red-50 text-red-700"
                    />

                </div>

            </div>


            {/* =====================================================
                FINANCIAL & RECORD SUMMARY
            ====================================================== */}

            <div>

                <div className="flex items-center gap-2 mb-3">

                    <TrendingUp className="w-4 h-4 text-blue-900" />

                    <h2 className="text-sm font-bold text-slate-900">
                        Financial & Record Summary
                    </h2>

                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                    {/* RECORDED DAYS */}

                    <SummaryCard
                        label="Recorded Days"
                        value={
                            chartData.length
                        }
                        description="Days represented in the chart"
                    />

                    {/* AVERAGE DAILY COST */}

                    <SummaryCard
                        label="Average Daily Cost"
                        value={
                            formatCurrency(
                                averageDailyRevenue
                            )
                        }
                        description="Average across recorded days"
                    />

                    {/* PAYMENT RECORDS */}

                    <SummaryCard
                        label="Payment Records"
                        value={
                            stats.payments.length.toLocaleString(
                                'en-IN'
                            )
                        }
                        description="Total payment transactions"
                    />

                </div>

            </div>


            {/* =====================================================
                REVENUE GRAPH
                MOVED TO THE VERY BOTTOM
            ====================================================== */}

            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                <div className="px-5 py-4 border-b border-slate-200">

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                        <div>

                            <div className="flex items-center gap-2">

                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-900 flex items-center justify-center">

                                    <TrendingUp className="w-4 h-4" />

                                </div>

                                <div>

                                    <h2 className="text-sm font-bold text-slate-900">
                                        Meal Cost Trend
                                    </h2>

                                    <p className="text-xs text-slate-500 mt-0.5">
                                        Daily meal expenditure for the latest 30 recorded days
                                    </p>

                                </div>

                            </div>

                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-500">

                            <CalendarDays className="w-4 h-4" />

                            <span>
                                Currency: INR
                            </span>

                        </div>

                    </div>

                </div>


                <div className="p-4 sm:p-6 h-[280px] sm:h-[340px]">

                    {chartData.length === 0 ? (

                        <div className="h-full flex flex-col items-center justify-center">

                            <TrendingUp className="w-8 h-8 text-slate-300 mb-3" />

                            <p className="text-sm font-semibold text-slate-500">
                                No revenue data available
                            </p>

                            <p className="text-xs text-slate-400 mt-1 text-center">
                                Chart data will appear once meal records are available.
                            </p>

                        </div>

                    ) : (

                        <ResponsiveContainer
                            width="100%"
                            height="100%"
                        >

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
                                        id="revenueGradient"
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                    >

                                        <stop
                                            offset="0%"
                                            stopColor="#1e3a8a"
                                            stopOpacity={0.28}
                                        />

                                        <stop
                                            offset="100%"
                                            stopColor="#1e3a8a"
                                            stopOpacity={0.02}
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
                                    minTickGap={30}
                                />

                                <YAxis
                                    tick={{
                                        fontSize: 10,
                                        fill: '#64748b'
                                    }}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={
                                        value =>
                                            `₹${value}`
                                    }
                                />

                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        fontSize: '12px',
                                        boxShadow:
                                            '0 4px 12px rgba(15, 23, 42, 0.08)'
                                    }}
                                    formatter={
                                        value => [
                                            formatCurrency(
                                                value
                                            ),
                                            'Meal Cost'
                                        ]
                                    }
                                />

                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#1e3a8a"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGradient)"
                                    dot={false}
                                    activeDot={{
                                        r: 5
                                    }}
                                />

                            </AreaChart>

                        </ResponsiveContainer>

                    )}

                </div>

            </div>

        </div>

    );

}


/* ================================================================
   PROFILE FIELD
================================================================ */

function ProfileField({
    icon: Icon,
    label,
    value,
    highlight = false
}) {

    return (

        <div
            className={`rounded-xl border p-4 ${
                highlight
                    ? 'border-blue-200 bg-blue-50/50'
                    : 'border-slate-200 bg-white'
            }`}
        >

            <div className="flex items-start gap-3">

                <div
                    className={`w-9 h-9 shrink-0 rounded-lg flex items-center justify-center ${
                        highlight
                            ? 'bg-blue-100 text-blue-900'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                >

                    <Icon className="w-4 h-4" />

                </div>

                <div className="min-w-0">

                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide">
                        {label}
                    </p>

                    <p
                        className={`text-sm font-semibold mt-1 break-words ${
                            value
                                ? 'text-slate-800'
                                : 'text-slate-400 italic'
                        }`}
                    >
                        {value || 'Not provided'}
                    </p>

                </div>

            </div>

        </div>

    );

}


/* ================================================================
   STAT CARD
================================================================ */

function StatCard({
    label,
    value,
    description,
    icon: Icon,
    iconClass
}) {

    return (

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">

            <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                        {label}
                    </p>

                    <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2 truncate">
                        {value}
                    </p>

                </div>

                <div
                    className={`w-10 h-10 shrink-0 rounded-lg flex items-center justify-center ${iconClass}`}
                >

                    <Icon className="w-5 h-5" />

                </div>

            </div>

            <p className="text-xs text-slate-500 mt-3">
                {description}
            </p>

        </div>

    );

}


/* ================================================================
   SUMMARY CARD
================================================================ */

function SummaryCard({
    label,
    value,
    description
}) {

    return (

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">

            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                {label}
            </p>

            <p className="text-xl font-bold text-slate-900 mt-1">
                {value}
            </p>

            <p className="text-xs text-slate-500 mt-1">
                {description}
            </p>

        </div>

    );

}