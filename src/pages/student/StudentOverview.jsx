import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import QRCode from 'react-qr-code';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  BellRing, CreditCard, ChevronRight, GraduationCap, 
  BookOpen, Layers, ShieldCheck, Building, Receipt,
  Calendar, Wallet, IndianRupee, Phone, CheckCircle2, 
  AlertCircle, Loader2, Landmark, ShieldAlert, FileText
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
      API.get(`/meals/user/${studentId}`)
        .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
        .catch(err => {
          console.error(err);
          setErrorMsg('Failed to fetch candidate consumption history.');
        })
        .finally(() => setLoadingHistory(false));

      API.get('/notices')
        .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    }
  }, [user]);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthDietBill = history
    .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  const totalSpentAllTime = history.reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  // Mandatory monthly quota charge (Statute 4.2: ₹1100 for Boys / ₹1000 for Girls)
  const genderIsFemale = user?.gender?.toLowerCase() === 'female' || user?.category?.toLowerCase().includes('girl');
  const baseMaintenanceCharge = genderIsFemale ? 1000 : 1100;
  
  const totalMonthlyPayable = currentMonthDietBill > baseMaintenanceCharge 
    ? baseMaintenanceCharge + currentMonthDietBill 
    : baseMaintenanceCharge;

  const relevantNotices = notices.filter(n => n.hostelNo === 'ALL' || n.hostelNo === user?.hostelNo);
  const chartData = [...history].slice(0, 30).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans space-y-6">
      
      {/* Policy Marquee with lowercase scrollamount */}
      <div className="bg-orange-600 py-1.5 border-b-2 border-orange-800 shadow-xs select-none">
        <marquee scrollamount="6" className="text-[11px] font-bold tracking-widest text-white uppercase font-mono">
          STATUTE 4.2 MANDATORY RESIDENTIAL QUOTA: COMPULSORY BASIC MAINTENANCE CHARGE (₹1100 FOR BOYS / ₹1000 FOR GIRLS) APPLIES MONTHLY REGARDLESS OF MEAL CONSUMPTION.
        </marquee>
      </div>

      {errorMsg && (
        <div className="bg-orange-50 border border-orange-300 border-l-4 border-l-orange-600 text-orange-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* CANDIDATE IDENTITY & FEE CLEARANCE BANNER */}
      <div className="bg-white border-2 border-slate-300 border-t-4 border-t-blue-950 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-slate-200 border-2 border-blue-950 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
            {user?.profilePhoto ? (
              <img src={user.profilePhoto} alt="Candidate" className="w-full h-full object-cover" />
            ) : (
              <Landmark className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base md:text-lg font-black text-blue-950 uppercase tracking-tight font-serif">
                {user?.name || 'Candidate Resident'}
              </h2>
              <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider">
                ✓ Verified Resident
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">
              ID: <span className="text-blue-950 font-mono font-black">{user?.studentId || 'N/A'}</span> • Roll No: <span className="text-slate-900 font-mono font-black">{user?.rollNo || 'N/A'}</span>
            </p>
            <p className="text-[11px] text-slate-500 font-medium uppercase">
              Course: {user?.university || 'Degree Programme'} • Department: {user?.department || 'N/A'} ({user?.session || 'Session N/A'})
            </p>
          </div>
        </div>

        {/* Digital Pass & Quick Pay Action */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto justify-end border-t md:border-t-0 pt-4 md:pt-0 border-slate-200">
          <div className="flex flex-col items-center bg-slate-50 border border-slate-300 p-2">
            <QRCode value={user?.studentId || user?.rollNo || 'ID'} size={56} bgColor="#f8fafc" fgColor="#0f172a" level="L" />
            <span className="text-[7px] font-mono font-black text-slate-700 uppercase mt-1 tracking-widest">
              Official Pass Token
            </span>
          </div>
          
          <div className="flex flex-col gap-2 w-full sm:w-auto">
            <div className="bg-slate-900 text-white p-3 text-right border-b-2 border-orange-500">
              <span className="text-[9px] font-mono text-slate-400 uppercase block">Current Monthly Invoicing</span>
              <span className="text-lg font-serif font-black text-orange-400">₹{totalMonthlyPayable.toLocaleString()}/-</span>
            </div>
            <button
              type="button"
              onClick={() => navigate('/student/payments')}
              className="bg-emerald-800 hover:bg-emerald-900 text-white font-black px-5 py-2.5 text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-2 border-emerald-950 active:scale-95 shadow-xs"
            >
              <CreditCard className="w-4 h-4 text-emerald-300" />
              <span>Proceed to Fee Payment</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4-BOX METRIC SUMMARY CARD MATRIX */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Logged Diet Days</p>
            <p className="text-2xl font-black text-slate-950 font-serif mt-1">{history.length}</p>
          </div>
          <span className="p-2.5 bg-slate-100 text-slate-700 border border-slate-200"><Calendar className="w-5 h-5" /></span>
        </div>

        <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-orange-600 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Current Month Diet Bill</p>
            {loadingHistory ? (
              <div className="flex items-center gap-1.5 text-blue-950 mt-1">
                <Loader2 className="w-4 h-4 animate-spin text-orange-600" />
                <span className="text-xs font-mono uppercase font-bold">Syncing...</span>
              </div>
            ) : (
              <p className="text-2xl font-black text-blue-950 font-serif mt-1">₹{currentMonthDietBill.toLocaleString()}/-</p>
            )}
          </div>
          <span className="p-2.5 bg-orange-50 text-orange-800 border border-orange-200"><FileText className="w-5 h-5" /></span>
        </div>

        <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Accumulated Total</p>
            <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalSpentAllTime.toLocaleString()}/-</p>
          </div>
          <span className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200"><IndianRupee className="w-5 h-5" /></span>
        </div>

        <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-slate-700 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Registered Protocol</p>
            <p className="text-sm font-black text-slate-900 font-mono mt-1">+91 {user?.mobileNo || 'N/A'}</p>
          </div>
          <span className="p-2.5 bg-slate-100 text-slate-700 border border-slate-200"><Phone className="w-5 h-5" /></span>
        </div>

      </div>

      {/* Notices */}
      {relevantNotices.length > 0 && (
        <div className="bg-blue-950 border border-blue-900 text-white p-5 border-l-4 border-l-orange-500 shadow-xs">
          <div className="flex items-center gap-2 mb-4 border-b border-blue-900 pb-2.5">
            <BellRing className="w-4 h-4 text-orange-400" />
            <h2 className="font-black text-xs tracking-widest uppercase font-serif text-slate-100">
              Official Notice Board &amp; Gazetted Directives
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {relevantNotices.map(notice => (
              <div key={notice._id} className="bg-white/5 border border-white/10 p-4 rounded-xs shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] font-black bg-orange-600 text-white px-2 py-0.5 uppercase tracking-wider">
                    Target Jurisdiction: {notice.hostelNo}
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-black text-sm text-white mb-1 uppercase tracking-wide font-serif">{notice.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 30-DAY SPENDING TRAJECTORY GRAPH (PRO LEVEL) */}
      <div className="bg-white border border-slate-300 shadow-xs">
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
            <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
              Insufficient ledger records for timeline generation. Begin logging meals to populate graph.
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

    </div>
  );
}