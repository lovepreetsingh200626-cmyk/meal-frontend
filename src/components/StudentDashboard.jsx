import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import QRCode from 'react-qr-code';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Utensils, Calendar, PlusCircle, Trash2, LogOut, CheckCircle2, Phone, IndianRupee, 
  Receipt, AlertCircle, Wallet, MessageSquareWarning, Send, BellRing, 
  TrendingUp, FileText, CreditCard, Check, Loader2, RefreshCw, Users, 
  User as UserIcon, Landmark, ShieldAlert
} from 'lucide-react';

export default function StudentDashboard({ user, onLogout, onOpenProfile }) {
  const navigate = useNavigate();
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [hostelData, setHostelData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Global overview stats
  const [usersList, setUsersList] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [totalCampusRevenue, setTotalCampusRevenue] = useState(0);
  const [totalFeeCollected, setTotalFeeCollected] = useState(0);

  // Complaints
  const [complaints, setComplaints] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Notices
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchHostelDetails();
    fetchHistory();
    fetchComplaints();
    fetchNotices();
    fetchOverviewStats();
  }, [user]);

  const handleSyncData = async () => {
    setSyncing(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await Promise.all([
        fetchHostelDetails(),
        fetchHistory(),
        fetchComplaints(),
        fetchNotices(),
        fetchOverviewStats()
      ]);
      setSuccessMsg('Statutory portal ledger synchronized successfully with Central Registry.');
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg('Failed to synchronize candidate ledger data.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const fetchHostelDetails = async () => {
    try {
      const { data } = await API.get(`/hostels/${user?.hostelNo}`);
      setHostelData(data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await API.get(`/meals/user/${user?._id}`);
      setHistory(data || []);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get(`/complaints/user/${user?._id}`);
      setComplaints(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchNotices = async () => {
    try {
      const { data } = await API.get('/notices');
      setNotices(data || []);
    } catch (err) { console.error(err); }
  };

  const fetchOverviewStats = async () => {
    try {
      const [uRes, mRes, pRes, cRes] = await Promise.all([
        API.get('/auth/users').catch(() => ({ data: [] })),
        API.get('/meals/all').catch(() => ({ data: [] })),
        API.get('/payments/admin/all-payments').catch(() => ({ data: [] })),
        API.get('/complaints/all').catch(() => ({ data: [] }))
      ]);

      const allUsers = uRes.data || [];
      const allMeals = mRes.data || [];
      const allPayments = pRes.data || [];
      const allComplaints = cRes.data || [];

      setUsersList(allUsers);
      setFilteredMeals(allMeals);
      setComplaintsList(allComplaints);

      const rev = allMeals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);
      const fee = allPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      setTotalCampusRevenue(rev);
      setTotalFeeCollected(fee);
    } catch (err) {
      console.error('Failed to fetch overview stats', err);
    }
  };

  const handleMealToggle = (mealType) => {
    setMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
  };

  const addExtraItem = () => {
    if (!extraName || !extraCost) return;
    setExtras([...extras, { itemName: extraName, cost: Number(extraCost) }]);
    setExtraName('');
    setExtraCost('');
  };

  const removeExtraItem = (index) => {
    setExtras(extras.filter((_, idx) => idx !== index));
  };

  const bRate = hostelData?.mealCosts?.breakfast || 37;
  const lRate = hostelData?.mealCosts?.lunch || 37;
  const dRate = hostelData?.mealCosts?.dinner || 37;

  const calculateLiveTotal = () => {
    let mealCount = 0;
    let actualCost = 0;

    if (meals.breakfast) { mealCount++; actualCost += bRate; }
    if (meals.lunch) { mealCount++; actualCost += lRate; }
    if (meals.dinner) { mealCount++; actualCost += dRate; }

    let standardMealsCost = actualCost;
    let penaltyCost = 0;

    if (mealCount === 1) {
      const missedRates = [];
      if (!meals.breakfast) missedRates.push(bRate);
      if (!meals.lunch) missedRates.push(lRate);
      if (!meals.dinner) missedRates.push(dRate);
      penaltyCost = Math.min(...missedRates);
      standardMealsCost += penaltyCost;
    }

    const extrasCost = extras.reduce((sum, item) => sum + Number(item.cost), 0);
    return { total: standardMealsCost + extrasCost, mealCount, penaltyCost };
  };

  const handleSaveEntry = async () => {
    if (!meals.breakfast && !meals.lunch && !meals.dinner) {
      setErrorMsg('Statutory Quota Warning: Select at least one standard meal to record entry.');
      setTimeout(() => setErrorMsg(''), 4000);
      return; 
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/meals/log', {
        userId: user?._id,
        hostelId: user?.hostelId?._id || user?.hostelId,
        date: selectedDate,
        meals,
        extras,
        role: 'student'
      });
      await fetchHistory();
      await fetchOverviewStats();
      setSuccessMsg('Daily dietary attendance committed & synchronized with Cooperative Ledger.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction Error: Could not commit record to ledger.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;

    setSubmittingComplaint(true);
    try {
      await API.post('/complaints', {
        userId: user?._id,
        hostelId: user?.hostelId?._id || user?.hostelId,
        hostelNo: user?.hostelNo,
        category: complaintCategory,
        subject: complaintSubject,
        description: complaintDesc,
        photoProof: complaintPhoto
      });
      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setSuccessMsg('Grievance petition successfully logged in Student Welfare Board Docket.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
      fetchOverviewStats();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit grievance petition.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const totalSpentAllTime = history.reduce((sum, r) => sum + (r.dailyTotalCost || 0), 0);
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthBill = history
    .filter(r => r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (r.dailyTotalCost || 0), 0);

  const liveCalc = calculateLiveTotal();
  const relevantNotices = notices.filter(n => n.hostelNo === 'ALL' || n.hostelNo === user?.hostelNo);
  const chartData = [...history].slice(0, 30).reverse();

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans selection:bg-blue-950 selection:text-white flex flex-col">
      
      {/* 1. STATUTORY AUDIT STRIP */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 z-50 select-none">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Central Student Council • Directorate of Residential Affairs</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-300 font-black hidden md:inline">Autonomous Residential Cooperative Core</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
          <span>Portal Jurisdiction: <strong className="text-white">STUDENT ACADEMIC LEDGER</strong></span>
          <span className="text-slate-600">•</span>
          <span>Status: <strong className="text-emerald-400">SESSION ACTIVE</strong></span>
        </div>
      </div>

      {/* 2. STATUTORY SEAL HEADER */}
      <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4 z-40 select-none">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 rounded-xs flex flex-col items-center justify-center text-white shrink-0 shadow-xs">
            <Landmark className="w-6 h-6 text-amber-400 mb-0.5" />
            <span className="text-[6px] font-black tracking-widest text-amber-200 uppercase">SEAL</span>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-xl md:text-2xl font-black text-blue-950 uppercase tracking-tight font-serif">
              Central Residential Mess Cooperative
            </h1>
            <h2 className="text-xs md:text-sm font-bold text-slate-600 uppercase tracking-wide">
              Directorate of Student Residential Welfare &amp; Dietary Operations
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1 justify-center md:justify-start">
              <span className="text-[9px] font-black bg-emerald-800 text-white px-2 py-0.5 uppercase tracking-wider">
                Statute Enforced
              </span>
              <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 uppercase">
                Autonomous Residential Cooperative Core
              </span>
            </div>
          </div>
        </div>

        {/* Digital Identity Pass Token */}
        <div className="hidden md:flex flex-col items-center p-2 bg-slate-50 border-2 border-slate-400 shadow-xs">
          <QRCode value={user?.studentId || user?.rollNo || ''} size={50} bgColor="#f8fafc" fgColor="#0f172a" level="L" />
          <span className="text-[7px] font-mono font-black text-slate-700 uppercase mt-1 tracking-widest">
            ID: {user?.rollNo || 'PASS'}
          </span>
        </div>
      </header>

      {/* 3. CANDIDATE COMMAND NAVBAR */}
      <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex flex-wrap gap-3 items-center justify-between shadow-xs sticky top-0 z-30 select-none">
        <div 
          onClick={() => {
            if (onOpenProfile) onOpenProfile();
            else navigate('/student/profile');
          }} 
          className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-xs transition"
          title="Open Official Candidate Profile Dossier"
        >
          <div className="w-9 h-9 bg-blue-950 text-white font-bold text-sm flex items-center justify-center border border-amber-500/70 overflow-hidden shadow-xs shrink-0">
            {user?.profilePhoto ? <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-amber-400" />}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">{user?.name}</h3>
              <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1 py-0.2 rounded-xs">Verified</span>
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tight">
              Roll: <span className="text-amber-300 font-black">{user?.rollNo}</span> | Hostel: {user?.hostelNo}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2 flex-1">
          <button 
            type="button" 
            onClick={() => {
              if (onOpenProfile) onOpenProfile();
              else navigate('/student/profile');
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 shrink-0"
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>Profile Dossier</span>
          </button>

          <button 
            type="button" 
            onClick={() => navigate('/student/payments')}
            className="bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 text-white px-3.5 py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border-b-2 border-emerald-950 active:scale-95 shrink-0"
          >
            <CreditCard className="w-3.5 h-3.5 text-emerald-300" /> 
            <span>Fee Invoicing Desk</span>
          </button>

          <button 
            type="button" 
            onClick={handleSyncData}
            disabled={syncing}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 active:scale-95 shrink-0"
            title="Synchronize all ledger records with Central Server"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${syncing ? 'animate-spin' : ''}`} /> 
            <span>{syncing ? 'Syncing...' : 'Sync Registry'}</span>
          </button>

          <button 
            onClick={onLogout} 
            className="flex items-center gap-1.5 text-xs font-black bg-red-800 hover:bg-red-900 text-white px-3 py-1.5 uppercase tracking-widest transition cursor-pointer shadow-xs border border-red-950 active:scale-95 shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" /> 
            <span className="hidden sm:inline">Terminate Session</span>
          </button>
        </div>
      </div>

      {/* 4. STATUTORY DIRECTIVE BANNER */}
      <div className="bg-amber-700 text-white py-1.5 px-4 border-b-2 border-amber-900 z-20 shadow-xs select-none">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-200" />
          <div className="flex-1 overflow-hidden">
            <p className="text-[11px] font-mono font-bold tracking-wider uppercase text-white truncate">
              STATUTE 4.2 MANDATORY RESIDENTIAL QUOTA: Compulsory basic maintenance charge (₹1100 for Boys / ₹1000 for Girls) applies monthly regardless of meal consumption.
            </p>
          </div>
        </div>
      </div>

      {/* 5. MAIN DASHBOARD CONTENT */}
      <div className="max-w-7xl mx-auto px-4 mt-6 w-full space-y-6">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Campus Roster</p>
                <p className="text-2xl font-black text-slate-950 font-serif mt-1">{usersList.length}</p>
              </div>
              <span className="p-2 bg-slate-100 text-slate-700 border border-slate-200"><Users className="w-4 h-4" /></span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Certified Members</p>
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-amber-600 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logged Diet Entries</p>
                <p className="text-2xl font-black text-blue-950 font-serif mt-1">{filteredMeals.length}</p>
              </div>
              <span className="p-2 bg-amber-50 text-amber-800 border border-amber-200"><Utensils className="w-4 h-4" /></span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Campus Attendance</p>
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Audited Diet Levy</p>
                <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalCampusRevenue.toLocaleString()}</p>
              </div>
              <span className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200"><IndianRupee className="w-4 h-4" /></span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Cooperative Demand</p>
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-indigo-700 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Settled Clearances</p>
                <p className="text-2xl font-black text-indigo-900 font-serif mt-1">₹{totalFeeCollected.toLocaleString()}</p>
              </div>
              <span className="p-2 bg-indigo-50 text-indigo-800 border border-indigo-200"><CreditCard className="w-4 h-4" /></span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Remitted to Treasury</p>
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-red-700 shadow-xs">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Grievances</p>
                <p className="text-2xl font-black text-red-700 font-serif mt-1">{complaintsList.filter(c => c.status === 'Pending').length}</p>
              </div>
              <span className="p-2 bg-red-50 text-red-700 border border-red-200"><MessageSquareWarning className="w-4 h-4" /></span>
            </div>
            <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Hearings Pending</p>
          </div>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-800" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* 4-Box Metric Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Logged Diet Days</p>
              <p className="text-2xl font-black text-slate-950 font-serif mt-1">{history.length}</p>
            </div>
            <Calendar className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-amber-600 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Current Month Dues</p>
              {loadingHistory ? (
                <div className="flex items-center gap-1 text-blue-950 mt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span className="text-xs font-mono uppercase font-bold">Syncing...</span>
                </div>
              ) : (
                <p className="text-2xl font-black text-blue-950 font-serif mt-1">₹{currentMonthBill.toLocaleString()}/-</p>
              )}
            </div>
            <Wallet className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Accumulated Total</p>
              <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalSpentAllTime.toLocaleString()}/-</p>
            </div>
            <IndianRupee className="w-6 h-6 text-slate-400" />
          </div>

          <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-slate-700 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Registered Protocol</p>
              <p className="text-base font-black text-slate-900 font-mono mt-1">+91 {user?.mobileNo}</p>
            </div>
            <Phone className="w-6 h-6 text-slate-400" />
          </div>
        </div>

        {/* Notices */}
        {relevantNotices.length > 0 && (
          <div className="bg-blue-950 border border-blue-900 text-white p-5 border-l-4 border-l-amber-500 shadow-xs">
            <div className="flex items-center gap-2 mb-4 border-b border-blue-900 pb-2.5">
              <BellRing className="w-4 h-4 text-amber-400" />
              <h2 className="font-black text-xs tracking-widest uppercase font-serif text-slate-100">
                Official Notice Board &amp; Gazetted Directives
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantNotices.map(notice => (
                <div key={notice._id} className="bg-white/5 border border-white/10 p-4 rounded-xs shadow-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black bg-amber-600 text-white px-2 py-0.5 uppercase tracking-wider">
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

        {/* Logger + Timeline + Grievances */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Daily Meal Logger */}
          <div className="bg-white border border-slate-300 shadow-xs">
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
              <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                <Utensils className="w-4 h-4 text-amber-600" /> Daily Diet &amp; Attendance Log
              </h2>
            </div>
            
            <div className="p-5">
              <div className="mb-4">
                <label className="text-[9px] font-black text-slate-700 uppercase tracking-widest block mb-1">
                  Select Attendance Date
                </label>
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)} 
                  className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-950" 
                />
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { key: 'breakfast', label: 'Breakfast Diet', cost: bRate }, 
                  { key: 'lunch', label: 'Lunch Diet', cost: lRate }, 
                  { key: 'dinner', label: 'Dinner Diet', cost: dRate }
                ].map(meal => (
                  <div 
                    key={meal.key} 
                    onClick={() => handleMealToggle(meal.key)} 
                    className={`flex items-center justify-between p-3 border transition-colors cursor-pointer select-none ${
                      meals[meal.key] 
                        ? 'bg-blue-50 border-blue-950 text-blue-950 shadow-xs' 
                        : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border flex items-center justify-center ${meals[meal.key] ? 'bg-blue-950 border-blue-950 text-white' : 'bg-white border-slate-400'}`}>
                        {meals[meal.key] && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="font-black text-xs uppercase font-serif tracking-tight">{meal.label}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${meals[meal.key] ? 'border-blue-950 bg-blue-100 text-blue-950' : 'border-slate-300 bg-slate-100 text-slate-500'}`}>
                      ₹{meal.cost}/-
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 mb-5">
                <h3 className="text-[9px] font-black uppercase text-slate-700 mb-2 tracking-widest font-serif">
                  Approved Consumable Extras
                </h3>
                <div className="flex gap-2 mb-3">
                  <input 
                    type="text" 
                    placeholder="e.g. Milk, Egg, Curd" 
                    value={extraName} 
                    onChange={e => setExtraName(e.target.value)} 
                    className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950 uppercase placeholder:normal-case placeholder:font-normal" 
                  />
                  <input 
                    type="number" 
                    placeholder="₹" 
                    value={extraCost} 
                    onChange={e => setExtraCost(e.target.value)} 
                    className="w-20 bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" 
                  />
                  <button 
                    type="button" 
                    onClick={addExtraItem} 
                    className="bg-blue-950 hover:bg-blue-900 text-white px-3 py-2 cursor-pointer transition flex items-center justify-center border-b border-amber-500"
                    title="Append Extra Item"
                  >
                    <PlusCircle className="w-4 h-4 text-amber-300" />
                  </button>
                </div>

                {extras.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-slate-300 p-2 bg-slate-50">
                    {extras.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 border border-slate-200 text-[11px] font-bold text-slate-900 uppercase font-mono">
                        <span>{ex.itemName}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-blue-950 font-black">₹{ex.cost}/-</span>
                          <button onClick={() => removeExtraItem(idx)} className="text-slate-400 hover:text-red-700 cursor-pointer">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-100 border border-slate-300 p-3 mb-5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 uppercase font-serif">Computed Daily Total:</span>
                  <span className="text-xl font-black text-blue-950 font-serif">₹{liveCalc.total}/-</span>
                </div>
                {liveCalc.mealCount === 1 && (
                  <p className="text-[9px] font-bold text-amber-900 mt-1 uppercase font-mono leading-tight">
                    * Statute 4.2 minimum 2 diets rule: Additional ₹{liveCalc.penaltyCost} unselected meal charge applied.
                  </p>
                )}
              </div>

              <button 
                onClick={handleSaveEntry} 
                disabled={saving} 
                className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-3 uppercase tracking-widest text-xs transition-colors cursor-pointer disabled:opacity-70 shadow-xs border-b-2 border-amber-500 active:scale-95"
              >
                {saving ? 'Registering Entry...' : 'Commit Daily Attendance'}
              </button>
            </div>
          </div>

          {/* Timeline & Grievance Docket */}
          <div className="space-y-6 lg:col-span-2">
            
            {/* Fiscal Timeline */}
            <div className="bg-white border border-slate-300 shadow-xs">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                  <TrendingUp className="w-4 h-4 text-amber-600" /> Candidate 30-Day Spending Timeline
                </h2>
              </div>
              <div className="p-5 h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                    Insufficient ledger records for timeline display
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
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
                      <Area type="monotone" dataKey="dailyTotalCost" name="Daily Expenditure" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Attendance & Expense Ledger */}
            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                  <FileText className="w-4 h-4 text-amber-600" /> Formal Dietary Attendance &amp; Expense Ledger
                </h2>
                <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                  {history.length} Certified Entries
                </span>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No dietary records logged on file.</div>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-900 text-white sticky top-0 border-b-2 border-slate-950 z-10 select-none">
                      <tr className="uppercase font-black text-[10px] tracking-wider">
                        <th className="p-3 border-r border-slate-800">Date Logged</th>
                        <th className="p-3 border-r border-slate-800">Diet Attendance</th>
                        <th className="p-3 border-r border-slate-800">Supplementary Extras</th>
                        <th className="p-3 text-right">Audited Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-medium">
                      {history.map((rec) => (
                        <tr key={rec._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3 border-r border-slate-200 text-slate-900 font-mono font-bold">{rec.date}</td>
                          <td className="p-3 border-r border-slate-200">
                            <div className="flex items-center gap-1.5">
                              {rec.meals?.breakfast && <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">B</span>}
                              {rec.meals?.lunch && <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">L</span>}
                              {rec.meals?.dinner && <span className="bg-white border border-slate-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">D</span>}
                              {rec.appliedDietRule === '1_DIET_BUMPED_TO_2' && (
                                <span className="text-[8px] bg-amber-50 text-amber-900 border border-amber-300 px-1 font-black uppercase ml-1">
                                  Quota Applied
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-3 border-r border-slate-200 text-slate-700 uppercase font-mono text-[11px]">
                            {rec.extras?.length > 0 ? rec.extras.map(e => `${e.itemName} (₹${e.cost})`).join('; ') : 'NIL'}
                          </td>
                          <td className="p-3 text-right font-black text-blue-950 font-serif text-sm">
                            ₹{rec.dailyTotalCost || 0}/-
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Grievances */}
            <div className="bg-white border border-slate-300 shadow-xs">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between mb-4">
                <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                  <MessageSquareWarning className="w-4 h-4 text-amber-600" /> Student Welfare Board • Grievance Docket
                </h2>
              </div>

              <div className="px-5 pb-5">
                <form onSubmit={handleComplaintSubmit} className="space-y-4 mb-8 border border-slate-300 p-5 bg-slate-50 shadow-xs">
                  <h3 className="text-[11px] font-black uppercase text-blue-950 border-b border-slate-300 pb-2 mb-3 tracking-widest font-serif">
                    Lodge Formal Grievance Petition
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Grievance Classification</label>
                      <select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950 cursor-pointer">
                        <option value="Food Quality">Food Quality &amp; Standards</option>
                        <option value="Cleanliness">Hygiene &amp; Mess Sanitation</option>
                        <option value="Timing">Mess Serving Timings</option>
                        <option value="Staff Behavior">Staff Conduct &amp; Management</option>
                        <option value="Other">Other Administrative Petition</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Formal Subject</label>
                      <input required type="text" placeholder="Subject of petition..." value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Detailed Representation of Grievance</label>
                    <textarea required rows="2" placeholder="State relevant facts, dates, and details for board inquiry..." value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 resize-none font-medium" />
                  </div>

                  <div>
                    <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Evidentiary Attachment (Max 2MB)</label>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { alert('Evidentiary limit exceeded: Max 2MB.'); return; }
                        const reader = new FileReader();
                        reader.onloadend = () => setComplaintPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }} className="text-[10px] file:mr-4 file:py-1.5 file:px-3 file:border file:border-slate-400 file:bg-slate-200 file:text-slate-800 file:uppercase file:font-black hover:file:bg-slate-300 cursor-pointer w-full max-w-xs" />
                      {complaintPhoto && <span className="text-[10px] text-emerald-800 font-bold uppercase shrink-0">Attached ✓</span>}
                    </div>
                  </div>

                  <button type="submit" disabled={submittingComplaint} className="bg-blue-950 hover:bg-blue-900 text-white font-black px-6 py-2.5 text-[10px] uppercase tracking-widest transition flex items-center gap-2 cursor-pointer disabled:opacity-70 border-b-2 border-amber-500 active:scale-95 shadow-xs">
                    <Send className="w-3.5 h-3.5" /> <span>{submittingComplaint ? 'Transmitting Petition...' : 'Register Petition with Board'}</span>
                  </button>
                </form>

                <h3 className="text-[11px] font-black uppercase text-slate-800 border-b border-slate-300 pb-2 mb-4 tracking-widest font-serif">
                  Adjudication Status History
                </h3>
                {complaints.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-widest">No grievance petitions logged on candidate docket.</div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-1">
                    {complaints.map(c => (
                      <div key={c._id} className="border border-slate-300 p-4 bg-white space-y-2 border-l-4 border-l-blue-950 shadow-xs">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                          <span className="text-[9px] font-mono font-bold text-slate-600 uppercase tracking-wider">Docket Category: {c.category}</span>
                          <span className={`text-[8px] font-black px-2 py-0.5 uppercase border ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-red-50 text-red-900 border-red-300'}`}>{c.status}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs uppercase font-serif">{c.subject}</h4>
                          <p className="text-xs text-slate-700 mt-1 font-medium leading-relaxed">{c.description}</p>
                        </div>
                        {c.photoProof && (
                          <div className="mt-2 pt-2 border-t border-slate-100"><a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-16 h-16 object-cover border border-slate-300" /></a></div>
                        )}
                        {c.adminRemark && (
                          <div className="bg-slate-50 border-l-4 border-slate-700 p-2.5 text-[11px] text-slate-800 mt-2 font-medium">
                            <strong className="uppercase font-serif text-blue-950 block mb-0.5">Board Finding:</strong> {c.adminRemark}
                          </div>
                        )}
                        <p className="text-[9px] text-slate-400 text-right uppercase font-mono font-bold mt-2 pt-2 border-t border-slate-100">{new Date(c.createdAt).toLocaleDateString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}