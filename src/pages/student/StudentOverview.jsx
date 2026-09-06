import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import QRCode from 'react-qr-code';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  BellRing, CreditCard, ChevronRight,
  Calendar, IndianRupee, CheckCircle2, 
  AlertCircle, Loader2, Landmark, FileText,
  Stamp, Fingerprint, Activity, Clock, ShieldCheck, Layers, Building, MessageSquareWarning
} from 'lucide-react';

export default function StudentOverview({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const studentId = user?._id || user?.id || user?.userId;
    if (studentId) {
      setLoadingHistory(true);
      
      Promise.all([
        API.get(`/meals/user/${studentId}`),
        API.get('/notices')
      ])
      .then(([mealsRes, noticesRes]) => {
        setHistory(Array.isArray(mealsRes.data) ? mealsRes.data : []);
        setNotices(Array.isArray(noticesRes.data) ? noticesRes.data : []);
      })
      .catch(err => {
        console.error(err);
        setErrorMsg('Failed to synchronize candidate dossiers from central registry.');
      })
      .finally(() => {
        setTimeout(() => setLoadingHistory(false), 500); 
      });
    }
  }, [user]);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  
  // STATUTORY FEE CALCULATION LOGIC (Identical to Payment Page)
  const currentMonthRecords = history.filter(r => r && r.date && r.date.startsWith(currentMonthPrefix));
  let totalDietCost = 0;
  let totalExtrasCost = 0;

  currentMonthRecords.forEach(rec => {
    let dailyExtraCost = 0;
    if (rec.extras && rec.extras.length > 0) {
      dailyExtraCost = rec.extras.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    }
    totalExtrasCost += dailyExtraCost;
    totalDietCost += ((Number(rec.dailyTotalCost) || 0) - dailyExtraCost);
  });

  const baseMaintenanceFee = (user?.gender?.toLowerCase() === 'female' || user?.category?.toLowerCase().includes('girl')) ? 1000 : 1100;
  const extraDietsCost = totalDietCost > baseMaintenanceFee ? (totalDietCost - baseMaintenanceFee) : 0;
  const totalMonthlyPayable = baseMaintenanceFee + extraDietsCost + totalExtrasCost;

  const totalSpentAllTime = history.reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);
  const relevantNotices = notices.filter(n => n.hostelNo === 'ALL' || n.hostelNo === user?.hostelNo);
  const chartData = [...history].slice(0, 30).reverse();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans space-y-6 selection:bg-blue-950 selection:text-white">
      
      <div className="bg-orange-600 py-1.5 border-b-2 border-orange-800 shadow-xs select-none relative z-10 overflow-hidden">
        <marquee scrollamount="5" className="text-[11px] font-bold tracking-widest text-white uppercase font-mono">
          STATUTE 4.2 MANDATORY RESIDENTIAL QUOTA: COMPULSORY BASIC MAINTENANCE CHARGE (₹1100 FOR BOYS / ₹1000 FOR GIRLS) APPLIES MONTHLY REGARDLESS OF MEAL CONSUMPTION • FALSIFICATION OF IDENTITY IS A PUNISHABLE OFFENSE.
        </marquee>
      </div>

      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-2 space-y-6">
        
        {loadingHistory ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] bg-white border-2 border-slate-300 shadow-sm border-t-4 border-t-blue-950 w-full animate-in fade-in duration-300 mt-2">
                <Loader2 className="w-10 h-10 animate-spin text-orange-600 mb-4" />
                <p className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-600">Accessing Master Candidate Dossier...</p>
            </div>
        ) : (
            <div className="space-y-6 animate-in fade-in duration-500">
                
                {errorMsg && (
                    <div className="bg-orange-50 border border-orange-300 border-l-4 border-l-orange-600 text-orange-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 shadow-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
                    
                    <div className="lg:col-span-8 bg-white border-2 border-slate-300 shadow-sm relative overflow-hidden flex flex-col justify-between">
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
                            <Landmark className="w-96 h-96" />
                        </div>
                        
                        <div className="bg-blue-950 text-white px-5 py-2.5 flex items-center justify-between border-b-4 border-orange-500 z-10 relative">
                            <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-orange-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest font-serif">Certified Residential E-Dossier</span>
                            </div>
                            <span className="text-[8px] font-mono font-bold bg-white/10 px-2 py-0.5 uppercase tracking-wider border border-white/20">
                                Validated Digital Token
                            </span>
                        </div>

                        <div className="p-5 sm:p-6 flex flex-col sm:flex-row gap-6 relative z-10 flex-1">
                            <div className="flex flex-col items-center gap-3 shrink-0">
                                <div className="w-28 h-28 bg-slate-100 border-[3px] border-slate-400 p-1 shadow-xs relative">
                                    {user?.profilePhoto ? (
                                        <img src={user.profilePhoto} alt="Candidate" className="w-full h-full object-cover grayscale-[20%] contrast-125" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-slate-200">
                                            <Fingerprint className="w-12 h-12 text-slate-400" />
                                        </div>
                                    )}
                                    <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-1 border-2 border-white rounded-full" title="Identity Verified">
                                        <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                </div>
                                <div className="bg-white border border-slate-300 p-1.5 shadow-xs w-full flex justify-center">
                                    <QRCode value={user?.studentId || user?.rollNo || 'ID'} size={72} bgColor="#ffffff" fgColor="#0f172a" level="L" />
                                </div>
                                <span className="text-[8px] font-mono font-black text-slate-500 uppercase tracking-widest">Scan to Verify</span>
                            </div>

                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h2 className="text-2xl sm:text-3xl font-black text-blue-950 uppercase tracking-tight font-serif leading-none mb-1">
                                        {user?.name || 'CANDIDATE RECORD'}
                                    </h2>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                                        <Stamp className="w-3 h-3 text-orange-600" />
                                        Candidate Registry Identity Details
                                    </p>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-4">
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Statutory ID Number</p>
                                            <p className="text-sm font-black text-slate-900 font-mono bg-slate-50 border border-slate-200 px-2 py-1">{user?.studentId || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Campus Roll Number</p>
                                            <p className="text-sm font-black text-slate-900 font-mono bg-slate-50 border border-slate-200 px-2 py-1">{user?.rollNo || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Academic Department</p>
                                            <p className="text-xs font-bold text-slate-800 uppercase leading-tight mt-1">{user?.department || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Degree & Session</p>
                                            <p className="text-xs font-bold text-slate-800 uppercase leading-tight mt-1">{user?.university || 'N/A'} ({user?.session || 'N/A'})</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-4 border-t border-slate-200 grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-2">
                                        <Building className="w-6 h-6 text-slate-300 shrink-0" />
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Allotted Residence</p>
                                            <p className="text-[11px] font-black text-blue-950 uppercase">{user?.hostelNo || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Layers className="w-6 h-6 text-slate-300 shrink-0" />
                                        <div>
                                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider">Social Category</p>
                                            <p className="text-[11px] font-black text-orange-700 uppercase">{user?.category || 'General'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 bg-white border-2 border-slate-300 shadow-sm flex flex-col justify-between relative">
                        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200">
                            <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest font-mono flex items-center gap-1.5">
                                <Activity className="w-3.5 h-3.5 text-orange-600" /> Fiscal Compliance
                            </h3>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col justify-center items-center text-center space-y-4">
                            <div>
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                                    Current Billing Cycle Assessment
                                </span>
                                <span className="text-4xl font-black text-blue-950 font-serif tracking-tighter block leading-none">
                                    ₹{totalMonthlyPayable.toLocaleString()}
                                </span>
                                <span className="text-[9px] font-mono font-bold bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 uppercase tracking-wider mt-2 inline-block">
                                    Outstanding Dues
                                </span>
                            </div>

                            <p className="text-[9px] text-slate-500 font-medium leading-relaxed px-4">
                                This audited sum includes the mandatory base maintenance fee of ₹{baseMaintenanceFee} plus any applicable dietary excesses (₹{extraDietsCost}) and extra items (₹{totalExtrasCost}).
                            </p>
                        </div>

                        <div className="p-4 border-t border-slate-200 bg-slate-50">
                            <button
                                type="button"
                                onClick={() => navigate('/student/payments')}
                                className="w-full bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-black px-4 py-3.5 text-[11px] uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-4 border-emerald-950 shadow-xs active:scale-[0.98]"
                            >
                                <CreditCard className="w-4 h-4 text-emerald-300 shrink-0" />
                                <span>Proceed to Treasury Gateway</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border-2 border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs flex items-center justify-between group hover:bg-slate-50 transition cursor-default">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Logged Diet Days</p>
                            <p className="text-2xl font-black text-slate-950 font-serif mt-1">{history.length}</p>
                        </div>
                        <span className="p-2.5 bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-blue-100 group-hover:text-blue-950 transition"><Calendar className="w-5 h-5" /></span>
                    </div>

                    <div className="bg-white border-2 border-slate-300 p-4 border-l-4 border-l-orange-600 shadow-xs flex items-center justify-between group hover:bg-slate-50 transition cursor-default">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Month Diet Consumption</p>
                            <p className="text-2xl font-black text-blue-950 font-serif mt-1">₹{totalDietCost.toLocaleString()}</p>
                        </div>
                        <span className="p-2.5 bg-orange-50 text-orange-800 border border-orange-200 group-hover:bg-orange-100 group-hover:text-orange-950 transition"><FileText className="w-5 h-5" /></span>
                    </div>

                    <div className="bg-white border-2 border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs flex items-center justify-between group hover:bg-slate-50 transition cursor-default">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Cumulative Expenditure</p>
                            <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalSpentAllTime.toLocaleString()}</p>
                        </div>
                        <span className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 group-hover:bg-emerald-100 group-hover:text-emerald-950 transition"><IndianRupee className="w-5 h-5" /></span>
                    </div>

                    <div className="bg-white border-2 border-slate-300 p-4 border-l-4 border-l-slate-700 shadow-xs flex items-center justify-between group hover:bg-slate-50 transition cursor-pointer" onClick={() => navigate('/student/complaints')} title="View Grievance Docket">
                        <div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Active Petitions</p>
                            <p className="text-2xl font-black text-slate-900 font-serif mt-1 text-left border-b border-transparent group-hover:border-slate-400 inline-block pb-0.5">View Docket ➔</p>
                        </div>
                        <span className="p-2.5 bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200 group-hover:text-slate-900 transition"><MessageSquareWarning className="w-5 h-5" /></span>
                    </div>
                </div>

                <div className="bg-white border-2 border-slate-300 shadow-xs">
                    <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
                            Candidate 30-Day Fiscal Trajectory &amp; Consumption Graph
                        </h2>
                        <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                            Currency Standard: INR (Statutory Tariff)
                        </span>
                    </div>
                    <div className="p-5 h-72 w-full bg-white">
                        {chartData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                                <Activity className="w-8 h-8 opacity-20" />
                                <span className="text-xs font-bold uppercase tracking-widest">
                                    Insufficient ledger records for timeline generation.
                                </span>
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="studentColorCost" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4}/>
                                            <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={25} />
                                    <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                    <Tooltip 
                                        contentStyle={{ borderRadius: '1px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} 
                                        itemStyle={{ color: '#0f172a' }}
                                    />
                                    <Area type="monotone" dataKey="dailyTotalCost" name="Daily Dietary Expense" stroke="#1e3a8a" strokeWidth={2.5} fillOpacity={1} fill="url(#studentColorCost)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {relevantNotices.length > 0 && (
                    <div className="bg-blue-950 border-2 border-blue-900 text-white p-5 border-l-4 border-l-orange-500 shadow-md">
                        <div className="flex items-center gap-2 mb-4 border-b border-blue-900 pb-3">
                            <BellRing className="w-5 h-5 text-orange-400" />
                            <h2 className="font-black text-sm tracking-widest uppercase font-serif text-slate-100">
                                Official Notice Board &amp; Gazetted Directives
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {relevantNotices.map(notice => (
                                <div key={notice._id} className="bg-white/5 border border-white/10 p-4 shadow-xs hover:bg-white/10 transition flex flex-col justify-between h-full">
                                    <div>
                                        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
                                            <span className="text-[8px] font-black bg-orange-600 text-white px-2 py-0.5 uppercase tracking-wider">
                                                Target: {notice.hostelNo}
                                            </span>
                                            <span className="text-[9px] font-mono text-slate-400 font-bold uppercase flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notice.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-[13px] text-white mb-2 uppercase tracking-wide font-serif leading-tight">
                                            {notice.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">
                                            {notice.content}
                                        </p>
                                    </div>
                                    <div className="mt-4 pt-2 border-t border-white/10 text-right">
                                        <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">Issued by Executive Committee</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        )}
      </main>
    </div>
  );
}