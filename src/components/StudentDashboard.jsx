import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  Utensils, Calendar, PlusCircle, Trash2, LogOut, CheckCircle2, Phone, IndianRupee, 
  Building, Receipt, AlertCircle, Wallet, MessageSquareWarning, Send, BellRing, 
  TrendingUp, FileText, GraduationCap, BookOpen, Layers, ShieldCheck, CreditCard, Download,
  Banknote, Check, Loader2, RefreshCw, Users, Compass, MapPin, User as UserIcon
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

  // Global / stats overview state
  const [usersList, setUsersList] = useState([]);
  const [filteredMeals, setFilteredMeals] = useState([]);
  const [totalCampusRevenue, setTotalCampusRevenue] = useState(0);
  const [totalFeeCollected, setTotalFeeCollected] = useState(0);

  // Logo loading states
  const [logoLoaded, setLogoLoaded] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Complaint States
  const [complaints, setComplaints] = useState([]);
  const [complaintsList, setComplaintsList] = useState([]);
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  // Notice Board States
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
      setSuccessMsg('Dashboard data refreshed successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setErrorMsg('Failed to refresh dashboard data.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSyncing(false);
    }
  };

  const fetchHostelDetails = async () => {
    try {
      const { data } = await API.get(`/hostels/${user.hostelNo}`);
      setHostelData(data);
    } catch (err) { console.error(err); }
  };

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data } = await API.get(`/meals/user/${user._id}`);
      setHistory(data || []);
    } catch (err) { 
      console.error(err); 
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get(`/complaints/user/${user._id}`);
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
      setErrorMsg('You must select at least one standard meal to save a log.');
      setTimeout(() => setErrorMsg(''), 4000);
      return; 
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/meals/log', {
        userId: user._id,
        hostelId: user.hostelId?._id || user.hostelId,
        date: selectedDate,
        meals,
        extras,
        role: 'student'
      });
      await fetchHistory();
      await fetchOverviewStats();
      setSuccessMsg('Meal record saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving record');
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
        userId: user._id,
        hostelId: user.hostelId?._id || user.hostelId,
        hostelNo: user.hostelNo,
        category: complaintCategory,
        subject: complaintSubject,
        description: complaintDesc,
        photoProof: complaintPhoto
      });
      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setSuccessMsg('Complaint submitted successfully to hostel wardens!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
      fetchOverviewStats();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit complaint.');
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
  const relevantNotices = notices.filter(n => n.hostelNo === 'ALL' || n.hostelNo === user.hostelNo);
  const chartData = [...history].slice(0, 30).reverse();

  return (
    <div className="min-h-screen bg-gray-200 text-gray-900 pb-16 font-sans selection:bg-blue-900 selection:text-white flex flex-col">
      
      {/* GOVT TOP STRIP */}
      <div className="bg-blue-950 text-white py-1.5 px-4 md:px-8 text-[11px] font-semibold flex justify-between tracking-wide z-50">
        <div className="uppercase hidden md:block">Government of Punjab • Higher Education Department</div>
        <div className="uppercase md:hidden">Govt of Punjab • Dept of Ed.</div>
        <div className="flex gap-4">
          <span className="text-orange-300">STUDENT ACADEMIC PORTAL</span>
        </div>
      </div>

      {/* UNIVERSITY EMBLEM HEADER */}
      <div className="bg-white border-b-4 border-orange-600 shadow-sm px-4 py-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 z-40">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-orange-500 shrink-0 relative overflow-hidden shadow-inner">
            {!logoLoaded && !logoError && (
              <div className="absolute inset-0 bg-blue-950 animate-pulse flex items-center justify-center text-[9px] uppercase tracking-wider text-orange-300">
                Loading...
              </div>
            )}
            <img 
              src="https://upload.wikimedia.org/wikipedia/en/thumb/4/47/Guru_Nanak_Dev_University_logo.png/220px-Guru_Nanak_Dev_University_logo.png" 
              alt="GNDU Emblem" 
              className={`w-full h-full object-contain p-1 transition-opacity duration-300 ${logoLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setLogoLoaded(true)}
              onError={() => setLogoError(true)}
            />
            {logoError && <Building className="w-8 h-8 text-orange-400" />}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-2xl font-black text-blue-900 uppercase tracking-tight">Guru Nanak Dev University, Amritsar</h1>
            <h2 className="text-sm font-bold text-gray-600 uppercase">Directorate of Hostels & Mess Operations</h2>
            <span className="text-[10px] font-bold bg-green-700 text-white px-2 py-0.5 mt-1 inline-block">NAAC Accredited A++ Grade</span>
          </div>
        </div>

        {/* Digital QR Pass */}
        <div className="hidden md:flex flex-col items-center p-1 bg-white border-2 border-gray-400 shadow-sm">
          <QRCode value={user.studentId || user.rollNo || ''} size={52} bgColor="#ffffff" fgColor="#000000" level="L" />
          <span className="text-[8px] font-bold text-gray-600 uppercase mt-0.5 tracking-widest">Digital Pass</span>
        </div>
      </div>

      {/* ACTION NAVBAR */}
      <div className="bg-gray-100 border-b border-gray-300 px-4 md:px-8 py-3 flex flex-wrap gap-3 items-center justify-between shadow-sm sticky top-0 z-30">
        <div onClick={onOpenProfile} className="flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-sm transition">
          <div className="w-10 h-10 bg-blue-900 text-white font-bold text-lg flex items-center justify-center border border-blue-950 overflow-hidden shadow-xs shrink-0">
            {user.profilePhoto ? <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-white" />}
          </div>
          <div className="hidden sm:block">
            <h3 className="font-bold text-blue-900 text-sm uppercase">{user.name}</h3>
            <p className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
              Roll: <span className="text-gray-900">{user.rollNo}</span> | ID: {user.studentId}
            </p>
          </div>
        </div>

        {/* ALWAYS VISIBLE BUTTONS */}
        <div className="flex flex-wrap items-center justify-end gap-2 flex-1">
          <button 
            type="button" 
            onClick={() => navigate('/student/payments')}
            className="bg-green-700 hover:bg-green-800 text-white px-3 py-2 text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-xs rounded-sm shrink-0"
          >
            <CreditCard className="w-4 h-4" /> <span className="hidden sm:inline">Fee Desk</span>
          </button>

          {/* PERMANENT REFRESH BUTTON */}
          <button 
            type="button" 
            onClick={handleSyncData}
            disabled={syncing}
            className="bg-blue-900 hover:bg-blue-800 text-white px-3 py-2 text-xs font-bold uppercase transition flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60 rounded-sm shrink-0"
            title="Refresh Dashboard Data"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} /> 
            <span>Refresh</span>
          </button>

          <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-bold bg-red-800 hover:bg-red-900 text-white px-3 py-2 uppercase transition cursor-pointer shadow-xs rounded-sm shrink-0">
            <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>

      {/* POLICY STRIP */}
      <div className="bg-red-800 py-1.5 border-b-2 border-red-950 z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-white" />
          <marquee scrollAmount="6" className="text-[12px] font-bold tracking-widest text-white uppercase flex-1">
            MANDATORY MESS POLICY: Even if you do not eat a single meal in a month, you will still have to pay a minimum basic charge of ₹1100 for Boys and ₹1000 for Girls.
          </marquee>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-6 w-full">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-blue-900 shadow-sm">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registered Members</p><p className="text-2xl font-black text-gray-900 mt-0.5">{usersList.length}</p></div>
                <Users className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-orange-500 shadow-sm">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Meal Entries</p><p className="text-2xl font-black text-blue-900 mt-0.5">{filteredMeals.length}</p></div>
                <Utensils className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-green-700 shadow-sm">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Cooperative Revenue</p><p className="text-2xl font-black text-green-700 mt-0.5">₹{totalCampusRevenue.toLocaleString()}</p></div>
                <IndianRupee className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-emerald-600 shadow-sm">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Fee Settlements</p><p className="text-2xl font-black text-emerald-700 mt-0.5">₹{totalFeeCollected.toLocaleString()}</p></div>
                <CreditCard className="w-6 h-6 text-gray-400" />
            </div>
            <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-red-700 shadow-sm">
                <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Pending Grievances</p><p className="text-2xl font-black text-red-700 mt-0.5">{complaintsList.filter(c => c.status === 'Pending').length}</p></div>
                <MessageSquareWarning className="w-6 h-6 text-gray-400" />
            </div>
        </div>

        {/* STUDENT DOSSIER BANNER */}
        <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-5 mb-6 border-l-4 border-l-blue-900">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-900 text-white flex items-center justify-center font-black text-xl border border-blue-950 shadow-inner">
                {user.profilePhoto ? <img src={user.profilePhoto} alt="" className="w-full h-full object-cover" /> : user?.name?.charAt(0)}
              </div>
              <div>
                <h2 className="text-base font-black text-blue-900 uppercase tracking-wide">{user.name}</h2>
                <p className="text-[11px] font-bold text-gray-600 uppercase">
                  Roll Number: <span className="text-gray-900">{user.rollNo}</span> | Student ID: <span className="text-gray-900">{user.studentId || 'N/A'}</span>
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-900 border border-blue-300 px-3 py-1">
                Hostel Allotment: {user.hostelNo}
              </span>

              {/* SECONDARY SYNC BUTTON INSIDE DOSSIER */}
              <button 
                onClick={handleSyncData}
                disabled={syncing}
                className="flex items-center gap-1.5 text-[11px] font-bold bg-gray-800 hover:bg-gray-900 text-white px-3 py-1.5 uppercase transition cursor-pointer shadow-xs disabled:opacity-60"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
                <span>Sync Data</span>
              </button>

              <button 
                onClick={() => navigate('/student/payments')} 
                className="flex items-center gap-1.5 text-[11px] font-bold bg-orange-600 hover:bg-orange-700 text-white px-3 py-1.5 uppercase transition cursor-pointer shadow-xs"
              >
                <Receipt className="w-3.5 h-3.5" />
                <span>Open Invoicing Desk</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-bold uppercase">
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5 text-blue-900" /> Course / Program</span>
              <span className="text-blue-900 font-black">{user.university || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><Compass className="w-3.5 h-3.5 text-blue-900" /> Faculty</span>
              <span className="text-gray-900 font-black">{user.facultyName || user.faculty || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><BookOpen className="w-3.5 h-3.5 text-blue-900" /> Department Branch</span>
              <span className="text-gray-900 font-black">{user.department || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><Layers className="w-3.5 h-3.5 text-blue-900" /> Academic Session</span>
              <span className="text-gray-900 font-black">{user.session || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><UserIcon className="w-3.5 h-3.5 text-blue-900" /> Father's Name</span>
              <span className="text-gray-900 font-black">{user.fatherName || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-blue-900" /> Mother's Name</span>
              <span className="text-gray-900 font-black">{user.motherName || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-blue-900" /> Domicile State</span>
              <span className="text-gray-900 font-black">{user.domicileState || 'N/A'}</span>
            </div>
            <div className="bg-gray-50 border border-gray-300 p-3">
              <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> Social Category</span>
              <span className="text-orange-700 font-black">{user.category || 'General'}</span>
            </div>
          </div>
        </div>

        {errorMsg && <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-900 px-4 py-3 text-xs font-bold uppercase mb-4 flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
        {successMsg && <div className="bg-green-50 border border-green-300 border-l-4 border-l-green-700 text-green-900 px-4 py-3 text-xs font-bold uppercase mb-4 flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-blue-900 shadow-sm">
            <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Logged Days</p><p className="text-2xl font-black text-gray-900 mt-0.5">{history.length}</p></div>
            <Calendar className="w-6 h-6 text-gray-400" />
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-orange-500 shadow-sm">
            <div>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Month Bill</p>
              {loadingHistory ? (
                <div className="flex items-center gap-1 text-blue-900 mt-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /><span className="text-xs uppercase font-bold">Syncing...</span></div>
              ) : (
                <p className="text-2xl font-black text-blue-900 mt-0.5">₹{currentMonthBill}</p>
              )}
            </div>
            <Wallet className="w-6 h-6 text-gray-400" />
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-green-700 shadow-sm">
            <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accumulated Bill</p><p className="text-2xl font-black text-green-700 mt-0.5">₹{totalSpentAllTime}</p></div>
            <IndianRupee className="w-6 h-6 text-gray-400" />
          </div>
          <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-gray-600 shadow-sm">
            <div><p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Registered Mobile</p><p className="text-lg font-black text-gray-900 mt-0.5">+91 {user.mobileNo}</p></div>
            <Phone className="w-6 h-6 text-gray-400" />
          </div>
        </div>

        {/* NOTICE BOARD FEED */}
        {relevantNotices.length > 0 && (
          <div className="bg-blue-950 border border-blue-900 text-white rounded-sm p-5 mb-6 border-l-4 border-l-orange-500 shadow-sm">
            <div className="flex items-center gap-2 mb-4 border-b border-blue-900 pb-2">
              <BellRing className="w-4 h-4 text-orange-400" />
              <h2 className="font-bold text-sm tracking-widest uppercase">Official Notice Board</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relevantNotices.map(notice => (
                <div key={notice._id} className="bg-white/5 border border-white/10 p-4 rounded-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold bg-orange-600 text-white px-2 py-0.5 uppercase">Target: {notice.hostelNo}</span>
                    <span className="text-[10px] text-gray-300 font-bold uppercase">{new Date(notice.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1 uppercase tracking-wide">{notice.title}</h3>
                  <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{notice.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Meal Entry Form */}
          <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
            <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
              <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
                <Utensils className="w-4 h-4 text-orange-600" /> Daily Meal Logger
              </h2>
            </div>
            <div className="p-5">
              <div className="mb-4">
                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Select Date</label>
                <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-sm font-bold text-gray-800 outline-none focus:border-blue-900" />
              </div>

              <div className="space-y-2 mb-6">
                {[
                  { key: 'breakfast', label: 'Breakfast', cost: bRate }, 
                  { key: 'lunch', label: 'Lunch', cost: lRate }, 
                  { key: 'dinner', label: 'Dinner', cost: dRate }
                ].map(meal => (
                  <div key={meal.key} onClick={() => handleMealToggle(meal.key)} className={`flex items-center justify-between p-3 rounded-sm border cursor-pointer select-none transition-colors ${meals[meal.key] ? 'bg-blue-50 border-blue-900 text-blue-900' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 border flex items-center justify-center ${meals[meal.key] ? 'bg-blue-900 border-blue-900' : 'bg-white border-gray-400'}`}>{meals[meal.key] && <CheckCircle2 className="w-3 h-3 text-white" />}</div>
                      <span className="font-bold text-sm uppercase">{meal.label}</span>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 border ${meals[meal.key] ? 'border-blue-900 bg-blue-100 text-blue-900' : 'border-gray-300 bg-gray-100 text-gray-500'}`}>₹{meal.cost}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-300 pt-4 mb-5">
                <h3 className="text-[10px] font-bold uppercase text-gray-500 mb-2 tracking-wider">Extra Food Items</h3>
                <div className="flex gap-2 mb-3">
                  <input type="text" placeholder="e.g. Milk" value={extraName} onChange={e => setExtraName(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900" />
                  <input type="number" placeholder="₹" value={extraCost} onChange={e => setExtraCost(e.target.value)} className="w-20 bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900" />
                  <button type="button" onClick={addExtraItem} className="bg-gray-200 hover:bg-gray-300 text-gray-800 border border-gray-400 px-3 py-2 rounded-sm cursor-pointer"><PlusCircle className="w-4 h-4" /></button>
                </div>
                {extras.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto border border-gray-300 p-2 bg-gray-50">
                    {extras.map((ex, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-white px-2.5 py-1.5 border border-gray-300 text-[11px] font-bold text-gray-800 uppercase">
                        <span>{ex.itemName}</span>
                        <div className="flex items-center gap-3"><span className="text-blue-900">₹{ex.cost}</span><button onClick={() => removeExtraItem(idx)} className="text-gray-400 hover:text-red-700 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-gray-100 border border-gray-300 rounded-sm p-3 mb-5">
                <div className="flex items-center justify-between"><span className="text-xs font-bold text-gray-600 uppercase">Computed Day Total:</span><span className="text-xl font-black text-blue-900">₹{liveCalc.total}</span></div>
                {liveCalc.mealCount === 1 && <p className="text-[9px] font-bold text-red-700 mt-1 uppercase">* Minimum 2 diets rule: Additional ₹{liveCalc.penaltyCost} unselected meal charge applied.</p>}
              </div>

              <button onClick={handleSaveEntry} disabled={saving} className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-3 uppercase tracking-wider text-xs rounded-sm transition-colors cursor-pointer disabled:opacity-70 shadow-sm">
                {saving ? 'Processing...' : 'Submit Daily Record'}
              </button>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            
            {/* 30-DAY SPENDING ANALYTICS CHART */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
              <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-600" /> 30-Day Spending Analytics
                </h2>
              </div>
              <div className="p-5 h-64 w-full">
                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold uppercase">Insufficient Data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                      <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={20} />
                      <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} 
                        itemStyle={{ color: '#1e3a8a' }}
                      />
                      <Area type="monotone" dataKey="dailyTotalCost" name="Daily Cost" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Ledger Table */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
              <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange-600" /> Formal Expenditure Ledger
                </h2>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-xs font-bold uppercase">No records found.</div>
              ) : (
                <div className="overflow-x-auto max-h-80 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-gray-200 sticky top-0 border-b-2 border-gray-400">
                      <tr className="text-gray-800 uppercase font-black tracking-wider">
                        <th className="p-3 border-r border-gray-300">Date</th>
                        <th className="p-3 border-r border-gray-300">Meals Attended</th>
                        <th className="p-3 border-r border-gray-300">Extras</th>
                        <th className="p-3 text-right">Total (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-300 font-medium">
                      {history.map((rec) => (
                        <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 border-r border-gray-300 text-gray-900 font-bold">{rec.date}</td>
                          <td className="p-3 border-r border-gray-300">
                            <div className="flex items-center gap-1.5">
                              {rec.meals.breakfast && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">B</span>}
                              {rec.meals.lunch && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">L</span>}
                              {rec.meals.dinner && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">D</span>}
                              {rec.appliedDietRule === '1_DIET_BUMPED_TO_2' && <span className="text-[9px] bg-red-50 text-red-800 border border-red-200 px-1 font-bold uppercase ml-1">Min 2 Diets</span>}
                            </div>
                          </td>
                          <td className="p-3 border-r border-gray-300 text-gray-700 uppercase">{rec.extras?.length > 0 ? rec.extras.map(e => `${e.itemName} (₹${e.cost})`).join(', ') : 'NIL'}</td>
                          <td className="p-3 text-right font-black text-blue-900">₹{rec.dailyTotalCost || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Grievance Redressal Mechanism */}
            <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
              <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between mb-4">
                <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4 text-orange-600" /> Grievance Redressal Mechanism
                </h2>
              </div>

              <div className="px-5 pb-5">
                <form onSubmit={handleComplaintSubmit} className="space-y-4 mb-8 border border-gray-300 p-5 bg-gray-50">
                  <h3 className="text-[11px] font-black uppercase text-gray-800 border-b border-gray-300 pb-2 mb-3 tracking-widest">Lodge New Grievance</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Grievance Category</label>
                      <select value={complaintCategory} onChange={e => setComplaintCategory(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer">
                        <option value="Food Quality">Food Quality</option>
                        <option value="Cleanliness">Cleanliness & Hygiene</option>
                        <option value="Timing">Mess Timings</option>
                        <option value="Staff Behavior">Staff Behavior</option>
                        <option value="Other">Other Issue</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Subject</label>
                      <input required type="text" placeholder="Brief subject" value={complaintSubject} onChange={e => setComplaintSubject(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900" />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Detailed Description</label>
                    <textarea required rows="2" placeholder="Elaborate on the issue..." value={complaintDesc} onChange={e => setComplaintDesc(e.target.value)} className="w-full bg-white border border-gray-400 rounded-sm px-3 py-2 text-xs outline-none focus:border-blue-900 resize-none" />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Evidentiary Photo (Optional)</label>
                    <div className="flex items-center gap-3">
                      <input type="file" accept="image/*" onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) { alert('Limit: 2MB.'); return; }
                        const reader = new FileReader();
                        reader.onloadend = () => setComplaintPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }} className="text-[10px] file:mr-4 file:py-1.5 file:px-3 file:border file:border-gray-400 file:bg-gray-200 file:text-gray-800 file:uppercase file:font-bold hover:file:bg-gray-300 cursor-pointer w-full max-w-xs" />
                      {complaintPhoto && <span className="text-[10px] text-green-700 font-bold uppercase shrink-0">Attached ✓</span>}
                    </div>
                  </div>

                  <button type="submit" disabled={submittingComplaint} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-5 py-2.5 rounded-sm text-[11px] uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70 mt-2 shadow-sm">
                    <Send className="w-3.5 h-3.5" /> <span>{submittingComplaint ? 'Transmitting...' : 'Register Grievance'}</span>
                  </button>
                </form>

                <h3 className="text-[11px] font-black uppercase text-gray-800 border-b border-gray-300 pb-2 mb-4 tracking-widest">Grievance Status History</h3>
                {complaints.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 text-xs font-bold uppercase">No records found.</div>
                ) : (
                  <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
                    {complaints.map(c => (
                      <div key={c._id} className="border border-gray-300 p-4 bg-white space-y-2">
                        <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">Ref: {c.category}</span>
                          <span className={`text-[9px] font-black px-2 py-0.5 uppercase border ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-300' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-red-100 text-red-800 border-red-300'}`}>{c.status}</span>
                        </div>
                        <div>
                          <h4 className="font-black text-gray-900 text-xs uppercase">{c.subject}</h4>
                          <p className="text-xs text-gray-700 mt-1 font-medium">{c.description}</p>
                        </div>
                        {c.photoProof && (
                          <div className="mt-2 pt-2 border-t border-gray-100"><a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-16 h-16 object-cover border border-gray-300" /></a></div>
                        )}
                        {c.adminRemark && (
                          <div className="bg-gray-100 border-l-4 border-gray-500 p-2 text-[11px] text-gray-800 mt-2 font-medium">
                            <strong className="uppercase">Authority Remark:</strong> {c.adminRemark}
                          </div>
                        )}
                        <p className="text-[9px] text-gray-400 text-right uppercase font-bold mt-2 pt-2 border-t border-gray-100">{new Date(c.createdAt).toLocaleDateString()}</p>
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