import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  FileText, TrendingUp, CreditCard, ChevronRight, 
  Receipt, Calendar, IndianRupee, Wallet, Landmark, 
  ShieldCheck, ShieldAlert, Printer, Filter, ArrowUpRight,
  Clock
} from 'lucide-react';

export default function StudentLedgerPage({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('ALL');

  const userId = user?._id || user?.id || user?.userId;

  useEffect(() => {
    if (userId) {
      setLoading(true);
      API.get(`/meals/user/${userId}`)
        .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [userId]);

  // Extract unique available statement months (YYYY-MM) from ledger records
  const availableMonths = useMemo(() => {
    const months = new Set();
    history.forEach(r => {
      if (r?.date && typeof r.date === 'string' && r.date.length >= 7) {
        months.add(r.date.substring(0, 7));
      }
    });
    return Array.from(months).sort().reverse();
  }, [history]);

  // Filter records based on active month statement selection
  const filteredHistory = useMemo(() => {
    if (selectedMonth === 'ALL') return history;
    return history.filter(r => r?.date && r.date.startsWith(selectedMonth));
  }, [history, selectedMonth]);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthBill = useMemo(() => {
    return history
      .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
      .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);
  }, [history, currentMonthPrefix]);

  const totalSpentAllTime = useMemo(() => {
    return history.reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);
  }, [history]);

  const chartData = useMemo(() => {
    return [...filteredHistory].slice(0, 30).reverse();
  }, [filteredHistory]);

  const handlePrint = () => {
    window.print();
  };

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

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans selection:bg-blue-950 selection:text-white">
      
      {/* 1. TOP STATUTORY AUDIT STRIP */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 z-50 select-none print:hidden">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Central Residential Mess Cooperative</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-300 font-black hidden md:inline">Comptroller Audit Division &bull; Dietary Ledger</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
          <span>Ledger Statute: <strong className="text-white">AUDIT 4.2</strong></span>
          <span className="text-slate-600">•</span>
          <span>Status: <strong className="text-emerald-400">CERTIFIED RECORDS</strong></span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        
        {/* 2. OFFICIAL EXPENDITURE STATEMENT BANNER */}
        <div className="bg-white border-2 border-slate-300 shadow-xs p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-t-4 border-t-blue-950">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-950 border-2 border-amber-500 text-amber-300 flex items-center justify-center font-serif shrink-0 shadow-xs mt-0.5">
              <Landmark className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2 py-0.5 font-mono">
                  Official Statement
                </span>
                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                  Statute 4.2 Verified
                </span>
              </div>
              <h1 className="text-lg md:text-xl font-black text-blue-950 uppercase tracking-tight font-serif mt-1">
                Audited Dietary Expenditure Register
              </h1>
              <p className="text-xs font-mono font-bold text-slate-600 uppercase mt-0.5">
                Member: <span className="text-blue-950 font-serif font-black">{user?.name}</span> &bull; Roll: <span className="text-slate-900">{user?.rollNo || 'N/A'}</span> &bull; Residence: <span className="text-slate-900">{user?.hostelNo || 'CAMPUS RESIDENCE'}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-black py-2.5 px-3.5 text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer shadow-xs active:scale-95"
              title="Print Certified Statement"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print Statement</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/student/payments')}
              className="bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 px-4 text-xs uppercase tracking-widest flex items-center gap-2 transition cursor-pointer shadow-xs border-b-2 border-amber-500 active:scale-95"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Settle Dues &amp; Invoices</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>

        {/* 3. AUDITED SUMMARY METRIC MATRIX */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-300 p-5 border-l-4 border-l-blue-950 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Total Certified Entries</p>
                <p className="text-3xl font-black text-slate-950 font-serif mt-1">{history.length}</p>
              </div>
              <span className="p-2.5 bg-slate-100 text-slate-700 border border-slate-200"><Calendar className="w-5 h-5" /></span>
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase mt-2">Recorded Attendance Days</p>
          </div>

          <div className="bg-white border border-slate-300 p-5 border-l-4 border-l-amber-600 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Current Billing Cycle</p>
                <p className="text-3xl font-black text-blue-950 font-serif mt-1">₹{currentMonthBill.toLocaleString()}/-</p>
              </div>
              <span className="p-2.5 bg-amber-50 text-amber-800 border border-amber-200"><Wallet className="w-5 h-5" /></span>
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase mt-2">Cycle: {currentMonthPrefix}</p>
          </div>

          <div className="bg-white border border-slate-300 p-5 border-l-4 border-l-emerald-700 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Cumulative Expenditure</p>
                <p className="text-3xl font-black text-emerald-800 font-serif mt-1">₹{totalSpentAllTime.toLocaleString()}/-</p>
              </div>
              <span className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200"><IndianRupee className="w-5 h-5" /></span>
            </div>
            <p className="text-[9px] font-mono text-slate-500 uppercase mt-2">All-Time Residential Levy</p>
          </div>
        </div>

        {/* 4. 30-DAY FINANCIAL ANALYTICS GRAPH */}
        <div className="bg-white border border-slate-300 shadow-xs print:hidden">
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
              <TrendingUp className="w-4 h-4 text-amber-600" /> Daily Expenditure Trend (Recent Active Logs)
            </h2>
            <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
              Chronological Cost Trajectory
            </span>
          </div>
          <div className="p-5 h-64 w-full">
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">
                No ledger records available for expenditure plotting
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="ledgerCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={20} />
                  <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '1px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} 
                    itemStyle={{ color: '#0f172a' }} 
                  />
                  <Area type="monotone" dataKey="dailyTotalCost" name="Daily Total" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#ledgerCost)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 5. FORMAL EXPENDITURE LEDGER TABLE */}
        <div className="bg-white border-2 border-slate-300 shadow-xs overflow-hidden">
          
          {/* Table Control Header */}
          <div className="bg-slate-50 border-b border-slate-300 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                <FileText className="w-4 h-4 text-amber-600" /> Formal Dietary Attendance &amp; Expense Ledger
              </h2>
              <p className="text-[9px] font-mono text-slate-500 uppercase mt-0.5">
                Displaying {filteredHistory.length} audited statement record{filteredHistory.length === 1 ? '' : 's'}
              </p>
            </div>

            {/* Monthly Statement Cycle Filter */}
            {availableMonths.length > 0 && (
              <div className="flex items-center gap-2 print:hidden">
                <label className="text-[9px] font-black text-slate-600 uppercase font-mono flex items-center gap-1">
                  <Filter className="w-3 h-3 text-amber-600" /> Statement Cycle:
                </label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-white border border-slate-400 py-1 px-2.5 text-xs font-mono font-bold text-slate-900 uppercase outline-none focus:border-blue-950 cursor-pointer"
                >
                  <option value="ALL">ALL STATEMENTS</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-500 text-xs font-mono font-bold uppercase tracking-wider">
              Retrieving ledger records from central audit registry...
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs font-mono font-bold uppercase tracking-widest">
              No expenditure entries logged for the selected cycle.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[28rem] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-900 text-white sticky top-0 border-b-2 border-slate-950 z-10 select-none">
                  <tr className="uppercase font-black text-[10px] tracking-wider">
                    <th className="p-3 border-r border-slate-800">Date &amp; Time Logged</th>
                    <th className="p-3 border-r border-slate-800">Dietary Attendance</th>
                    <th className="p-3 border-r border-slate-800">Approved Supplementary Extras</th>
                    <th className="p-3 text-right">Audited Total (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-medium">
                  {filteredHistory.map((rec) => {
                    const logTime = formatLogTime(rec);
                    return (
                      <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 border-r border-slate-200 text-slate-900 font-mono font-bold whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-slate-950 font-bold tracking-tight">{rec.date}</span>
                            {logTime ? (
                              <span className="text-[10px] font-mono text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                <span>{logTime}</span>
                              </span>
                            ) : (
                              <span className="text-[9px] font-mono text-slate-400 font-normal">Time unrecorded</span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-200">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {rec.meals?.breakfast ? (
                              <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">
                                B: Breakfast
                              </span>
                            ) : null}
                            {rec.meals?.lunch ? (
                              <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">
                                L: Lunch
                              </span>
                            ) : null}
                            {rec.meals?.dinner ? (
                              <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">
                                D: Dinner
                              </span>
                            ) : null}
                            {rec.appliedDietRule === '1_DIET_BUMPED_TO_2' && (
                              <span className="text-[8px] bg-amber-50 text-amber-900 border border-amber-300 px-1.5 py-0.5 font-black uppercase ml-1">
                                Statute 4.2 Dual-Diet Quota
                              </span>
                            )}
                            {!rec.meals?.breakfast && !rec.meals?.lunch && !rec.meals?.dinner && (
                              <span className="text-[9px] font-mono text-slate-400 uppercase">
                                No standard diets logged
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 border-r border-slate-200 text-slate-700 uppercase font-mono text-[11px]">
                          {rec.extras && rec.extras.length > 0 ? (
                            rec.extras.map(e => `${e.itemName} (₹${e.cost})`).join('; ')
                          ) : (
                            <span className="text-slate-400">NIL</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-black text-blue-950 font-serif text-sm whitespace-nowrap">
                          ₹{rec.dailyTotalCost || 0}/-
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Statement Footer Summary */}
          <div className="bg-slate-100 border-t border-slate-300 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-mono">
            <span className="text-slate-600 uppercase font-bold">
              Ledger Cycle: <strong className="text-slate-900">{selectedMonth === 'ALL' ? 'Cumulative Permanent Ledger' : selectedMonth}</strong>
            </span>
            <span className="text-blue-950 font-serif font-black text-sm">
              Statement Subtotal: ₹{filteredHistory.reduce((s, r) => s + (Number(r.dailyTotalCost) || 0), 0).toLocaleString()}/-
            </span>
          </div>
        </div>

      </main>

      {/* 6. STATUTORY FOOTER WATERMARK */}
      <footer className="mt-8 text-center text-[9px] font-mono text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1.5 select-none print:hidden">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
        <span>Central Autonomous Cooperative Registry &bull; Certified Student Residential Records</span>
      </footer>
    </div>
  );
}