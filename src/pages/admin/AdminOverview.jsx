import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api'; 
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, Utensils, IndianRupee, CreditCard, MessageSquareWarning, TrendingUp, Loader2 } from 'lucide-react';

export default function AdminOverview() {
    const [stats, setStats] = useState({ users: 0, meals: [], payments: [], complaints: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch all data for the KPI calculations
                const [resUsers, resMeals, resPayments, resComplaints] = await Promise.all([
                    API.get('/auth/users'),
                    API.get('/meals/all'),
                    API.get('/payments/admin/all-payments'),
                    API.get('/complaints/all')
                ]);

                setStats({
                    users: resUsers.data?.length || 0,
                    meals: resMeals.data || [],
                    payments: resPayments.data || [],
                    complaints: (resComplaints.data || []).filter(c => c.status === 'Pending').length
                });
            } catch (err) {
                console.error("Dashboard fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
    }, []);

    const totalCampusRevenue = useMemo(() => {
        return stats.meals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);
    }, [stats.meals]);

    const totalFeeCollected = useMemo(() => {
        return stats.payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }, [stats.payments]);

    const chartData = useMemo(() => {
        const revenueByDate = stats.meals.reduce((acc, curr) => {
            if (curr.date) {
                acc[curr.date] = (acc[curr.date] || 0) + (curr.dailyTotalCost || 0);
            }
            return acc;
        }, {});
        return Object.keys(revenueByDate).sort().map(date => ({ date, revenue: revenueByDate[date] })).slice(-30);
    }, [stats.meals]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-20 text-blue-950 bg-white border border-slate-300 shadow-sm min-h-[50vh]">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p className="font-bold font-mono uppercase text-xs tracking-widest">Aggregating Institutional Ledger Data...</p>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* 5-Column Institutional KPI Metric Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                
                <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Registered Members</p>
                            <p className="text-2xl font-black text-slate-950 font-serif mt-1">{stats.users}</p>
                        </div>
                        <span className="p-2 bg-slate-100 text-slate-700 border border-slate-200"><Users className="w-4 h-4" /></span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Active Student Dossiers</p>
                </div>

                <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-amber-600 shadow-xs">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Logged Diet Entries</p>
                            <p className="text-2xl font-black text-blue-950 font-serif mt-1">{stats.meals.length}</p>
                        </div>
                        <span className="p-2 bg-amber-50 text-amber-800 border border-amber-200"><Utensils className="w-4 h-4" /></span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Attendance Registers</p>
                </div>

                <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Audited Diet Demand</p>
                            <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalCampusRevenue.toLocaleString()}</p>
                        </div>
                        <span className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200"><IndianRupee className="w-4 h-4" /></span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Aggregate Diet Levy</p>
                </div>

                <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-indigo-700 shadow-xs">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Settled Clearances</p>
                            <p className="text-2xl font-black text-indigo-900 font-serif mt-1">₹{totalFeeCollected.toLocaleString()}</p>
                        </div>
                        <span className="p-2 bg-indigo-50 text-indigo-800 border border-indigo-200"><CreditCard className="w-4 h-4" /></span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Remitted to Treasury</p>
                </div>

                <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-red-700 shadow-xs">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Active Grievances</p>
                            <p className="text-2xl font-black text-red-700 font-serif mt-1">{stats.complaints}</p>
                        </div>
                        <span className="p-2 bg-red-50 text-red-700 border border-red-200"><MessageSquareWarning className="w-4 h-4" /></span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Hearings Pending</p>
                </div>
            </div>

            {/* EXECUTIVE ANALYTICS CHART - REVENUE TIMELINE */}
            <div className="bg-white border border-slate-300 shadow-xs print:hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                        <TrendingUp className="w-4 h-4 text-amber-600" />
                        <span>Cooperative Fiscal Timeline • 30-Day Consolidated Revenue Audit</span>
                    </h2>
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                        Currency Standard: INR (Statutory Tariff Enforced)
                    </span>
                </div>
                <div className="p-5 h-64 w-full bg-white">
                    {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                            Insufficient ledger data for timeline generation
                        </div>
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35}/>
                                        <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={25} />
                                <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip contentStyle={{ borderRadius: '1px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} itemStyle={{ color: '#0f172a' }} />
                                <Area type="monotone" dataKey="revenue" name="Audited Revenue" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </div>
        </div>
    );
}