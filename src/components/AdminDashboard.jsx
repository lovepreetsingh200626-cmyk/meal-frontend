import React, { useState, useEffect } from 'react';
import API from '../services/api';
import ConfirmModal from './ConfirmModal';
import * as XLSX from 'xlsx';
import { UNIVERSITY_FACULTIES_HIERARCHY } from '../data/coursesData';
import { ACADEMIC_SESSIONS } from '../data/sessionsData';
import { INDIAN_STATES } from '../data/statesData';
import { WORLD_COUNTRIES } from '../data/countriesData';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import {
    Users, Building, ShieldCheck, Search, LogOut, Utensils, IndianRupee,
    Calendar, Printer, CheckCircle2, AlertCircle, Filter, RefreshCw, Trash2,
    KeyRound, Pencil, X, ImagePlus, User as UserIcon, Phone, MessageSquareWarning,
    BellRing, Send, TrendingUp, FileText, Download, Settings, Save, GraduationCap,
    BookOpen, Layers, CreditCard, Receipt, Compass, Globe, MapPin, Check
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout, onUpdateUser }) {
    const [usersList, setUsersList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [adminsList, setAdminsList] = useState([]); 
    const [complaintsList, setComplaintsList] = useState([]); 
    const [noticesList, setNoticesList] = useState([]); 
    const [paymentsList, setPaymentsList] = useState([]);
    
    const [hostelsList, setHostelsList] = useState([]);
    const [targetHostelId, setTargetHostelId] = useState('');
    const [dietRates, setDietRates] = useState({ breakfast: 37, lunch: 37, dinner: 37 });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [activeTab, setActiveTab] = useState('users'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => {}
    });

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '', newRollNo: '', studentId: '', mobileNo: '', dob: '',
        gender: 'Male', hostelNo: 'BH1', university: '', department: '',
        session: '', category: 'General', email: '', fatherName: '', motherName: '', facultyId: '', facultyName: '', domicileState: 'Punjab', nationality: 'India'
    });

    const [adminAvailableDepartments, setAdminAvailableDepartments] = useState([]);
    const [adminAvailableProgrammes, setAdminAvailableProgrammes] = useState([]);

    const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminEditFormData, setAdminEditFormData] = useState({
        name: '', mobileNo: '', dob: '', profilePhoto: ''
    });

    const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealEditData, setMealEditData] = useState({
        date: '', meals: { breakfast: false, lunch: false, dinner: false }, extras: []
    });

    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [complaintStatus, setComplaintStatus] = useState('Pending');
    const [adminRemark, setAdminRemark] = useState('');

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeHostel, setNoticeHostel] = useState('ALL');
    const [postingNotice, setPostingNotice] = useState(false);

    useEffect(() => {
        fetchUsers(); fetchAllMeals(); fetchAdmins(); fetchComplaints(); fetchNotices(); fetchHostels(); fetchPayments();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/auth/users');
            setUsersList(data || []);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const fetchAllMeals = async () => {
        try { const { data } = await API.get('/meals/all'); setMealsList(data || []); } catch (err) { console.error(err); }
    };

    const fetchAdmins = async () => {
        try { const { data } = await API.get('/auth/admins'); setAdminsList(Array.isArray(data) ? data : data.admins || []); } catch (err) { console.error(err); }
    };

    const fetchComplaints = async () => {
        try { const { data } = await API.get('/complaints/all'); setComplaintsList(data || []); } catch (err) { console.error(err); }
    };

    const fetchNotices = async () => {
        try { const { data } = await API.get('/notices'); setNoticesList(data || []); } catch (err) { console.error(err); }
    };

    const fetchHostels = async () => {
        try { const { data } = await API.get('/hostels'); setHostelsList(data || []); } 
        catch (err) { console.error(err); }
    };

    const fetchPayments = async () => {
        try { const { data } = await API.get('/payments/admin/all-payments'); setPaymentsList(data || []); } 
        catch (err) { console.error(err); }
    };

    const calculateMemberFeeStatus = (student) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); 
        const currentMonthPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}`;

        const matchingPayment = paymentsList.find(p => {
            const matchUser = p.userId === student._id || p.userId?._id === student._id || p.studentId === student.studentId || p.rollNo === student.rollNo;
            const matchMonth = p.month === currentMonthPrefix || (p.createdAt && p.createdAt.startsWith(currentMonthPrefix));
            return matchUser && matchMonth;
        });

        if (matchingPayment) {
            return { isPaid: true, paymentRecord: matchingPayment, fine: 0, statusLabel: 'PAID' };
        }

        const deadlineDate = new Date(currentYear, currentMonth + 1, 15, 23, 59, 59);

        let fine = 0;
        if (now > deadlineDate) {
            const monthsOverdue = (now.getFullYear() - deadlineDate.getFullYear()) * 12 + (now.getMonth() - deadlineDate.getMonth()) + 1;
            fine = Math.max(1, monthsOverdue) * 10;
        }

        return { isPaid: false, paymentRecord: null, fine, statusLabel: 'UNPAID' };
    };

    // MANUAL DESK SETTLEMENT HANDLER
    const handleRecordDeskSettlement = (student) => {
        const baseCharge = (student.gender === 'female' || student.category?.toLowerCase().includes('girl')) ? 1000 : 1100;
        const currentMonthPrefix = new Date().toISOString().substring(0, 7);
        
        // Sum meals for this student for the month
        const studentMeals = mealsList.filter(m => {
            const matchUser = m.userId === student._id || m.userId?._id === student._id;
            return matchUser && m.date && m.date.startsWith(currentMonthPrefix);
        });
        const mealsCost = studentMeals.reduce((sum, m) => sum + (Number(m.dailyTotalCost) || 0), 0);
        const totalPayable = mealsCost > baseCharge ? baseCharge + mealsCost : baseCharge;

        setConfirmModal({
            isOpen: true,
            title: 'Confirm Desk Cash Settlement',
            message: `Record physical desk clearance of ₹${totalPayable} for ${student.name} (${student.rollNo})?`,
            onConfirm: async () => {
                try {
                    const payload = {
                        userId: student._id,
                        studentName: student.name,
                        rollNo: student.rollNo,
                        hostelNo: student.hostelNo || 'BH1',
                        receiptNo: `DESK/REC/${Math.floor(100000 + Math.random() * 900000)}`,
                        txnId: `CASH-DESK-${Date.now().toString().slice(-6)}`,
                        paymentChannel: 'Physical Desk Cash Settlement',
                        amount: totalPayable,
                        month: currentMonthPrefix,
                        date: new Date().toLocaleString()
                    };
                    await API.post('/payments/record', payload);
                    setSuccessMsg(`Desk payment recorded for ${student.name}!`);
                    setTimeout(() => setSuccessMsg(''), 4000);
                    fetchPayments();
                } catch (err) {
                    setErrorMsg('Failed to record settlement.');
                    setTimeout(() => setErrorMsg(''), 4000);
                }
            }
        });
    };

    // REVOKE SETTLEMENT / RESET TO UNPAID
    const handleRevokeSettlement = (paymentId, studentName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Revoke Payment / Reset to Unpaid',
            message: `Are you sure you want to remove this transaction record for ${studentName}? This will reset their status back to UNPAID.`,
            onConfirm: async () => {
                try {
                    await API.delete(`/payments/${paymentId}`);
                    setSuccessMsg('Payment record purged. Student marked UNPAID.');
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setPaymentsList(prev => prev.filter(p => p._id !== paymentId));
                } catch (err) {
                    setErrorMsg('Failed to remove record.');
                    setTimeout(() => setErrorMsg(''), 4000);
                }
            }
        });
    };

    const promptRemoveStudent = (targetId, targetName) => {
        setConfirmModal({
            isOpen: true,
            title: 'Purge Member Record',
            message: `Are you sure you wish to permanently purge member record (${targetName}) from the cooperative database?`,
            onConfirm: async () => {
                try {
                    await API.delete(`/auth/users/${targetId}`);
                    setSuccessMsg(`Member removed successfully.`); setTimeout(() => setSuccessMsg(''), 4000);
                    setUsersList(prev => prev.filter(u => u.studentId !== targetId && u._id !== targetId));
                } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
            }
        });
    };

    const handleResetPassword = async (targetId, targetName) => {
        const newPassword = window.prompt(`Enter new password (min. 8 chars) for (${targetName}):`);
        if (newPassword === null || newPassword.trim().length < 8) return alert('Password must be at least 8 characters long.');
        try {
            const { data } = await API.put(`/auth/users/${targetId}/password`, { newPassword: newPassword.trim() });
            setSuccessMsg(data.message || 'Password reset successfully!'); setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openEditModal = (student) => {
        setEditingUserId(student.studentId || student._id);

        let matchedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.name === student.facultyName || f.name === student.faculty);
        if (!matchedFac && student.department) {
            matchedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.departments.some(d => d.name === student.department));
        }
        const depts = matchedFac ? matchedFac.departments : [];
        setAdminAvailableDepartments(depts);

        let matchedDept = depts.find(d => d.name === student.department);
        const progs = matchedDept ? matchedDept.programmes : [];
        setAdminAvailableProgrammes(progs);

        setEditFormData({ 
            name: student.name || '', 
            newRollNo: student.rollNo || '', 
            studentId: student.studentId || '', 
            mobileNo: student.mobileNo || '', 
            dob: student.dob || '', 
            gender: student.gender || 'Male', 
            hostelNo: student.hostelNo || 'BH1', 
            university: student.university || '', 
            department: student.department || '', 
            session: student.session || '', 
            category: student.category || 'General', 
            email: student.email || '',
            fatherName: student.fatherName || '',
            motherName: student.motherName || '',
            facultyId: matchedFac ? matchedFac.id : '',
            facultyName: matchedFac ? matchedFac.name : (student.facultyName || student.faculty || ''),
            domicileState: student.domicileState || 'Punjab',
            nationality: student.nationality || 'India'
        });
        setIsEditModalOpen(true);
    };

    const handleAdminFacultyChange = (fId) => {
        const selectedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.id === fId);
        const depts = selectedFac ? selectedFac.departments : [];
        setAdminAvailableDepartments(depts);
        setAdminAvailableProgrammes([]);
        setEditFormData(prev => ({
            ...prev,
            facultyId: fId,
            facultyName: selectedFac ? selectedFac.name : '',
            department: '',
            university: ''
        }));
    };

    const handleAdminDepartmentChange = (deptName) => {
        const matchedDept = adminAvailableDepartments.find(d => d.name === deptName);
        const progs = matchedDept ? matchedDept.programmes : [];
        setAdminAvailableProgrammes(progs);
        setEditFormData(prev => ({
            ...prev,
            department: deptName,
            university: ''
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/users/${editingUserId}`, editFormData);
            setSuccessMsg('Member record updated successfully!'); setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.map(u => (u.studentId === editingUserId || u._id === editingUserId) ? data.user : u));
            setIsEditModalOpen(false); fetchUsers();
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed to update.'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openAdminEditModal = (adminAccount) => {
        setEditingAdmin(adminAccount);
        setAdminEditFormData({ name: adminAccount.name || '', mobileNo: adminAccount.mobileNo || '', dob: adminAccount.dob || '', profilePhoto: adminAccount.profilePhoto || '' });
        setIsAdminEditModalOpen(true);
    };

    const handleAdminPhotoChange = (e) => {
        const file = e.target.files[0]; if (!file) return;
        const reader = new FileReader(); reader.onloadend = () => setAdminEditFormData(prev => ({ ...prev, profilePhoto: reader.result })); reader.readAsDataURL(file);
    };

    const handleAdminEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/admins/${editingAdmin._id}`, adminEditFormData);
            setSuccessMsg('Committee profile updated!'); setTimeout(() => setSuccessMsg(''), 4000);
            setAdminsList(prev => prev.map(a => a._id === editingAdmin._id ? data.admin : a));
            if (user && editingAdmin._id === user._id && onUpdateUser) onUpdateUser(data.admin);
            setIsAdminEditModalOpen(false);
        } catch (err) { setErrorMsg('Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const promptRemoveAdmin = (adminId, adminName) => {
        if (adminId === user._id) return alert('Cannot delete your own active committee account.');
        setConfirmModal({
            isOpen: true,
            title: 'Revoke Committee Clearance',
            message: `Are you sure you wish to permanently remove administrator (${adminName})?`,
            onConfirm: async () => {
                try {
                    await API.delete(`/auth/admins/${adminId}`); setSuccessMsg('Administrator removed.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setAdminsList(prev => prev.filter(a => a._id !== adminId));
                } catch (err) { setErrorMsg('Failed'); setTimeout(() => setErrorMsg(''), 4000); }
            }
        });
    };

    const openMealEditModal = (meal) => {
        setEditingMeal(meal); 
        setMealEditData({ 
            date: meal.date, 
            meals: { ...meal.meals }, 
            extras: meal.extras ? [...meal.extras] : [] 
        }); 
        setIsMealEditModalOpen(true);
    };

    const handleMealEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/meals/${editingMeal._id}`, mealEditData);
            setSuccessMsg('Meal record updated by Committee Authority!'); setTimeout(() => setSuccessMsg(''), 4000);
            setMealsList(prev => prev.map(m => m._id === editingMeal._id ? data.meal : m)); 
            setIsMealEditModalOpen(false);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed to update record.'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const promptRemoveMealLog = (mealId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Purge Meal Ledger Record',
            message: 'Are you sure you want to delete this historical meal log?',
            onConfirm: async () => {
                try {
                    await API.delete(`/meals/${mealId}`); setSuccessMsg('Meal log deleted.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setMealsList(prev => prev.filter(m => m._id !== mealId));
                } catch (err) { setErrorMsg('Failed'); setTimeout(() => setErrorMsg(''), 4000); }
            }
        });
    };

    const openComplaintModal = (c) => {
        setActiveComplaint(c); setComplaintStatus(c.status || 'Pending'); setAdminRemark(c.adminRemark || ''); setIsComplaintModalOpen(true);
    };

    const handleComplaintUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/complaints/${activeComplaint._id}`, { status: complaintStatus, adminRemark });
            setSuccessMsg('Grievance status updated!'); setTimeout(() => setSuccessMsg(''), 4000);
            setComplaintsList(prev => prev.map(c => c._id === activeComplaint._id ? data.complaint : c)); setIsComplaintModalOpen(false);
        } catch (err) { setErrorMsg('Failed to update complaint'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const promptDeleteComplaint = (cId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Delete Grievance Filing',
            message: 'Are you sure you want to purge this grievance record?',
            onConfirm: async () => {
                try {
                    await API.delete(`/complaints/${cId}`); setSuccessMsg('Complaint deleted.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setComplaintsList(prev => prev.filter(c => c._id !== cId));
                } catch (err) { setErrorMsg('Failed'); setTimeout(() => setErrorMsg(''), 4000); }
            }
        });
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault(); if (!noticeTitle.trim() || !noticeContent.trim()) return;
        setPostingNotice(true);
        try {
            const { data } = await API.post('/notices', { title: noticeTitle, content: noticeContent, hostelNo: noticeHostel, postedBy: user.name || 'Committee Admin' });
            setSuccessMsg('Notice posted successfully!'); setTimeout(() => setSuccessMsg(''), 4000);
            setNoticeTitle(''); setNoticeContent(''); setNoticesList(prev => [data.notice, ...prev]);
        } catch (err) { setErrorMsg('Failed to post notice.'); setTimeout(() => setErrorMsg(''), 4000); } finally { setPostingNotice(false); }
    };

    const promptDeleteNotice = (noticeId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Revoke Official Decree',
            message: 'Are you sure you want to revoke and delete this broadcast notice?',
            onConfirm: async () => {
                try {
                    await API.delete(`/notices/${noticeId}`); setSuccessMsg('Notice deleted.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setNoticesList(prev => prev.filter(n => n._id !== noticeId));
                } catch (err) { setErrorMsg('Failed to delete notice.'); setTimeout(() => setErrorMsg(''), 4000); }
            }
        });
    };

    const handleUpdateRates = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/hostels/${targetHostelId}/rates`, { mealCosts: dietRates });
            setSuccessMsg('Official Diet Rates Updated Successfully!'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchHostels(); 
        } catch (err) { 
            setErrorMsg('Failed to update rates.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const handleExportLedger = () => {
        if (filteredMeals.length === 0) {
            alert("No ledger records available to export based on current filters.");
            return;
        }

        const exportData = filteredMeals.map(m => ({
            "Date Logged": m.date,
            "Member Name": m.userId?.name || 'N/A',
            "Roll Number": m.userId?.rollNo || 'N/A',
            "Residence": m.hostelId?.hostelNumber || m.hostelNo || 'N/A',
            "Breakfast": m.meals?.breakfast ? 'Yes' : 'No',
            "Lunch": m.meals?.lunch ? 'Yes' : 'No',
            "Dinner": m.meals?.dinner ? 'Yes' : 'No',
            "Extra Items": m.extras?.length > 0 ? m.extras.map(e => `${e.itemName} (₹${e.cost})`).join(' | ') : 'NIL',
            "Total Daily Cost (INR)": m.dailyTotalCost || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Mess_Ledger");
        
        XLSX.writeFile(workbook, `Student_Mess_Ledger_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredUsers = usersList.filter(u => {
        const matchesSearch = (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || (u.rollNo && u.rollNo.toString().includes(searchTerm)) || (u.studentId && u.studentId.includes(searchTerm));
        const matchesHostel = selectedHostelFilter === 'ALL' || u.hostelNo === selectedHostelFilter;
        return matchesSearch && matchesHostel;
    }).sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));

    const filteredMeals = mealsList.filter(m => selectedHostelFilter === 'ALL' || m.hostelId?.hostelNumber === selectedHostelFilter);
    const filteredAdmins = adminsList.filter(a => a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredComplaints = complaintsList.filter(c => selectedHostelFilter === 'ALL' || c.hostelNo === selectedHostelFilter);
    const filteredPayments = paymentsList.filter(p => selectedHostelFilter === 'ALL' || p.hostelNo === selectedHostelFilter);

    const totalCampusRevenue = filteredMeals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);
    const totalFeeCollected = filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const handlePrintReport = () => window.print();

    const revenueByDate = filteredMeals.reduce((acc, curr) => {
        acc[curr.date] = (acc[curr.date] || 0) + (curr.dailyTotalCost || 0);
        return acc;
    }, {});
    const chartData = Object.keys(revenueByDate).sort().map(date => ({ date, revenue: revenueByDate[date] })).slice(-30);

    return (
        <div className="min-h-screen bg-gray-200 text-gray-900 pb-16 font-sans flex flex-col selection:bg-blue-900 selection:text-white">
            
            {/* PRIVATE TOP STRIP */}
            <div className="bg-amber-950 text-white py-1.5 px-4 md:px-8 text-[11px] font-semibold flex justify-between tracking-wide z-50 print:hidden">
                <div className="uppercase hidden md:block">🛡️ Private & Unofficial Student Utility • Independent Mess Tracker</div>
                <div className="uppercase md:hidden">Private Student Utility</div>
                <div className="flex gap-4">
                    <span className="text-orange-300">EXECUTIVE COMMITTEE PORTAL</span>
                </div>
            </div>

            {/* HEADER WITH "MESS" CIRCLE EMBLEM */}
            <div className="bg-white border-b-4 border-orange-600 shadow-sm px-4 py-4 md:px-8 flex items-center justify-between gap-4 z-40 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-blue-900 rounded-full flex items-center justify-center text-white text-xs font-black border-2 border-orange-500 shrink-0 shadow-inner tracking-widest">
                        MESS
                    </div>
                    <div>
                        <h1 className="text-xl md:text-2xl font-black text-blue-900 uppercase tracking-tight">Student Mess & Diet Ledger System</h1>
                        <h2 className="text-xs md:text-sm font-bold text-gray-600 uppercase mt-0.5">Independent Student Cooperative Committee</h2>
                        <span className="text-[10px] font-bold bg-amber-700 text-white px-2 py-0.5 mt-1.5 inline-block">Private & Unofficial Utility</span>
                    </div>
                </div>
            </div>

            {/* ACTION NAVBAR */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm sticky top-0 z-30 print:hidden">
                <div onClick={() => openAdminEditModal(user)} className="flex items-center gap-3 cursor-pointer hover:bg-gray-200 px-2 py-1 rounded-sm transition">
                    <div className="w-10 h-10 bg-blue-900 text-white font-bold text-lg flex items-center justify-center border border-blue-950 overflow-hidden">
                        {user.profilePhoto ? <img src={user.profilePhoto} alt="Admin" className="w-full h-full object-cover" /> : '👑'}
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 text-sm uppercase">{user.name || 'Administrator'}</h3>
                        <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wide">Chief Committee Warden</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => { fetchUsers(); fetchAllMeals(); fetchAdmins(); fetchComplaints(); fetchNotices(); fetchHostels(); fetchPayments(); }} className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold bg-white border border-gray-400 px-3 py-1.5 uppercase text-gray-800 hover:bg-gray-50 transition cursor-pointer">
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> <span>Sync Data</span>
                    </button>
                    <button onClick={onLogout} className="flex items-center gap-1.5 text-[11px] font-bold bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3 py-1.5 uppercase transition cursor-pointer">
                        <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Secure Logout</span>
                    </button>
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

                {/* EXECUTIVE ANALYTICS CHART */}
                <div className="bg-white border border-gray-300 rounded-sm shadow-sm mb-6 print:hidden">
                    <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                        <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-orange-600" /> Cooperative Revenue Timeline (30 Days)
                        </h2>
                    </div>
                    <div className="p-5 h-64 w-full">
                        {chartData.length === 0 ? (
                        <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold uppercase">Insufficient Data</div>
                        ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4}/>
                                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={20} />
                                <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                <Tooltip contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} itemStyle={{ color: '#1e3a8a' }} />
                                <Area type="monotone" dataKey="revenue" name="Daily Revenue" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        )}
                    </div>
                </div>

                {errorMsg && <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-900 px-4 py-3 text-xs font-bold uppercase mb-4 flex items-center gap-3 print:hidden"><AlertCircle className="w-4 h-4 shrink-0" /><span>{errorMsg}</span></div>}
                {successMsg && <div className="bg-green-50 border border-green-300 border-l-4 border-l-green-700 text-green-900 px-4 py-3 text-xs font-bold uppercase mb-4 flex items-center gap-3 print:hidden"><CheckCircle2 className="w-4 h-4 shrink-0" /><span>{successMsg}</span></div>}

                {/* TABS & FILTERS */}
                <div className="bg-gray-100 border border-gray-300 rounded-sm mb-6 flex flex-wrap items-center justify-between p-2 print:hidden">
                    <div className="flex flex-wrap gap-1">
                        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'users' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><Users className="w-3 h-3 inline-block mr-1 mb-0.5" /> Directory</button>
                        <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'admins' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><ShieldCheck className="w-3 h-3 inline-block mr-1 mb-0.5" /> Committee</button>
                        <button onClick={() => setActiveTab('meals')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'meals' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><FileText className="w-3 h-3 inline-block mr-1 mb-0.5" /> Ledger</button>
                        <button onClick={() => setActiveTab('payments')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'payments' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><CreditCard className="w-3 h-3 inline-block mr-1 mb-0.5" /> Fee Settlements ({paymentsList.length})</button>
                        <button onClick={() => setActiveTab('complaints')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'complaints' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><MessageSquareWarning className="w-3 h-3 inline-block mr-1 mb-0.5" /> Grievances ({complaintsList.filter(c => c.status === 'Pending').length})</button>
                        <button onClick={() => setActiveTab('notices')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'notices' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><BellRing className="w-3 h-3 inline-block mr-1 mb-0.5" /> Notices</button>
                        <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeTab === 'settings' ? 'bg-blue-900 text-white border border-blue-950' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`}><Settings className="w-3 h-3 inline-block mr-1 mb-0.5" /> Configurations</button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-2 md:mt-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
                            <input type="text" placeholder="Search ID or Roll..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-white border border-gray-400 px-2 py-1.5 pl-8 text-[11px] font-bold uppercase text-gray-800 focus:outline-none focus:border-blue-900 w-40" />
                        </div>
                        {activeTab !== 'admins' && activeTab !== 'notices' && activeTab !== 'settings' && (
                            <div className="flex items-center bg-white border border-gray-400 px-2 py-1.5">
                                <Filter className="w-3 h-3 text-gray-500 mr-1.5" />
                                <select value={selectedHostelFilter} onChange={(e) => setSelectedHostelFilter(e.target.value)} className="bg-transparent text-[11px] font-bold uppercase text-gray-800 focus:outline-none cursor-pointer">
                                    <option value="ALL">ALL RESIDENCES</option>
                                    <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                                    <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                                </select>
                            </div>
                        )}
                        <button onClick={handleExportLedger} className="flex items-center gap-1.5 text-[11px] font-bold bg-green-700 hover:bg-green-800 text-white border border-green-900 px-3 py-1.5 uppercase transition cursor-pointer shadow-sm">
                            <Download className="w-3.5 h-3.5" /> Export Excel
                        </button>
                        <button onClick={handlePrintReport} className="flex items-center gap-1.5 text-[11px] font-bold bg-gray-800 hover:bg-gray-900 text-white border border-black px-3 py-1.5 uppercase transition cursor-pointer shadow-sm">
                            <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                    </div>
                </div>

                {/* --- CONTENT TABS --- */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><Users className="w-4 h-4 text-orange-600" /> Authorized Member Directory</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{filteredUsers.length} Records</span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-gray-200 sticky top-0 border-b-2 border-gray-400 z-10">
                                    <tr className="text-gray-800 uppercase font-black tracking-wider">
                                        <th className="p-3 border-r border-gray-300 w-16 text-center">Roll</th>
                                        <th className="p-3 border-r border-gray-300">Member Info</th>
                                        <th className="p-3 border-r border-gray-300">Academic Dossier</th>
                                        <th className="p-3 border-r border-gray-300 w-24 text-center">Residence</th>
                                        <th className="p-3 border-r border-gray-300">Contact</th>
                                        <th className="p-3 border-r border-gray-300 text-center w-48">Fee Status & Desk Settlement</th>
                                        <th className="p-3 text-right print:hidden">Action Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300 font-medium">
                                    {filteredUsers.map((u) => {
                                        const feeStatus = calculateMemberFeeStatus(u);
                                        return (
                                            <tr key={u._id} className="hover:bg-gray-50 transition">
                                                <td className="p-3 border-r border-gray-300 text-center font-black text-gray-900 uppercase">{u.rollNo}</td>
                                                <td className="p-3 border-r border-gray-300">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 border border-gray-400 bg-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                                            {u.profilePhoto ? <img src={u.profilePhoto} alt="Student" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-gray-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-blue-900 uppercase tracking-wide">{u.name}</div>
                                                            <div className="text-[9px] text-gray-500 font-bold uppercase">{u.studentId ? `ID: ${u.studentId}` : 'NO ID'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-gray-300 uppercase">
                                                    <div className="font-bold text-gray-900 text-[11px]">{u.university || 'B.Tech ECE'}</div>
                                                    <div className="text-[9px] text-gray-500 font-medium">{u.department || 'N/A'} • {u.session || 'N/A'} • <span className="text-orange-700 font-bold">{u.category || 'General'}</span></div>
                                                </td>
                                                <td className="p-3 border-r border-gray-300 text-center"><span className="bg-white border border-gray-400 px-2 py-0.5 text-[10px] font-black uppercase text-gray-800">{u.hostelNo}</span></td>
                                                <td className="p-3 border-r border-gray-300 font-bold text-gray-700">
                                                    <div>+91 {u.mobileNo || 'N/A'}</div>
                                                    <div className="text-[9px] text-gray-500 font-normal lowercase">{u.email || ''}</div>
                                                </td>
                                                <td className="p-3 border-r border-gray-300 text-center">
                                                    {feeStatus.isPaid ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 px-2 py-0.5 text-[10px] font-black uppercase inline-block">
                                                                ✓ PAID
                                                            </span>
                                                            <span className="text-[8px] text-gray-500 uppercase font-bold">
                                                                {feeStatus.paymentRecord?.paymentChannel?.includes('Desk') ? 'Desk Cash Clearance' : 'Digital Clearance'}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleRevokeSettlement(feeStatus.paymentRecord._id, u.name)} 
                                                                className="text-[8px] font-bold text-red-700 hover:underline uppercase cursor-pointer"
                                                            >
                                                                [Reset to Unpaid]
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="bg-red-100 text-red-900 border border-red-300 px-2 py-0.5 text-[10px] font-black uppercase">
                                                                ✕ UNPAID
                                                            </span>
                                                            {feeStatus.fine > 0 && (
                                                                <span className="text-[9px] font-bold text-red-700">
                                                                    Fine: +₹{feeStatus.fine}
                                                                </span>
                                                            )}
                                                            <button 
                                                                onClick={() => handleRecordDeskSettlement(u)} 
                                                                className="mt-1 bg-blue-900 hover:bg-blue-800 text-white px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded-xs cursor-pointer shadow-xs"
                                                                title="Student brought slip: record cash deposit at desk"
                                                            >
                                                                Accept Cash at Desk
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right print:hidden">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEditModal(u)} className="p-1 border border-gray-400 bg-gray-100 hover:bg-blue-900 hover:text-white transition cursor-pointer" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => handleResetPassword(u.studentId || u._id, u.name)} className="p-1 border border-orange-300 bg-orange-50 text-orange-800 hover:bg-orange-600 hover:text-white transition cursor-pointer" title="Key"><KeyRound className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => promptRemoveStudent(u.studentId || u._id, u.name)} className="p-1 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'admins' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-orange-600" /> Authorized Committee Personnel</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{filteredAdmins.length} Records</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-gray-200 border-b-2 border-gray-400">
                                    <tr className="text-gray-800 uppercase font-black tracking-wider">
                                        <th className="p-3 border-r border-gray-300">Identity Profile</th>
                                        <th className="p-3 border-r border-gray-300 text-center w-24">Clearance</th>
                                        <th className="p-3 border-r border-gray-300">Contact</th>
                                        <th className="p-3 border-r border-gray-300">D.O.B.</th>
                                        <th className="p-3 text-right print:hidden">Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300 font-medium">
                                    {filteredAdmins.map((a) => (
                                        <tr key={a._id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 border-r border-gray-300"><div className="flex items-center gap-3"><div className="w-8 h-8 border border-gray-400 bg-gray-100 overflow-hidden flex items-center justify-center">{a.profilePhoto ? <img src={a.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-gray-400" />}</div><span className="font-bold text-blue-900 uppercase">{a.name}</span></div></td>
                                            <td className="p-3 border-r border-gray-300 text-center"><span className="bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 text-[9px] font-black uppercase">{a.role}</span></td>
                                            <td className="p-3 border-r border-gray-300 font-bold text-gray-700">{a.mobileNo ? `+91 ${a.mobileNo}` : 'NIL'}</td>
                                            <td className="p-3 border-r border-gray-300 font-bold text-gray-700">{a.dob || 'NIL'}</td>
                                            <td className="p-3 text-right print:hidden">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openAdminEditModal(a)} className="p-1.5 border border-gray-400 bg-gray-100 hover:bg-blue-900 hover:text-white transition"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => promptRemoveAdmin(a._id, a.name)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'meals' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><FileText className="w-4 h-4 text-orange-600" /> Master Expenditure Ledger</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{filteredMeals.length} Logs</span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-gray-200 sticky top-0 border-b-2 border-gray-400 z-10">
                                    <tr className="text-gray-800 uppercase font-black tracking-wider">
                                        <th className="p-3 border-r border-gray-300">Date Logged</th>
                                        <th className="p-3 border-r border-gray-300">Member Info</th>
                                        <th className="p-3 border-r border-gray-300 text-center w-20">Residence</th>
                                        <th className="p-3 border-r border-gray-300 text-center">Meals</th>
                                        <th className="p-3 border-r border-gray-300">Miscellaneous</th>
                                        <th className="p-3 text-right w-32">Daily Charge</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300 font-medium">
                                    {filteredMeals.map((m) => (
                                        <tr key={m._id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 border-r border-gray-300 font-bold text-gray-800">{m.date}</td>
                                            <td className="p-3 border-r border-gray-300 font-bold text-blue-900 uppercase">{m.userId?.rollNo || 'N/A'} <span className="font-medium text-[10px] text-gray-500">({m.userId?.name})</span></td>
                                            <td className="p-3 border-r border-gray-300 text-center"><span className="bg-white border border-gray-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-gray-800">{m.hostelId?.hostelNumber}</span></td>
                                            <td className="p-3 border-r border-gray-300">
                                                <div className="flex items-center justify-center gap-1">
                                                    {m.meals?.breakfast && <span className="bg-blue-100 border border-blue-300 text-blue-900 px-1.5 py-0.5 font-black uppercase">B</span>}
                                                    {m.meals?.lunch && <span className="bg-blue-100 border border-blue-300 text-blue-900 px-1.5 py-0.5 font-black uppercase">L</span>}
                                                    {m.meals?.dinner && <span className="bg-blue-100 border border-blue-300 text-blue-900 px-1.5 py-0.5 font-black uppercase">D</span>}
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-gray-300 text-[10px] text-gray-700 uppercase font-bold">{m.extras?.length > 0 ? m.extras.map(e => `${e.itemName}(₹${e.cost})`).join(', ') : 'NIL'}</td>
                                            <td className="p-3 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <span className="font-black text-blue-900 text-sm">₹{m.dailyTotalCost || 0}</span>
                                                    <div className="flex print:hidden gap-1">
                                                        <button onClick={() => openMealEditModal(m)} className="p-1 border border-gray-400 bg-gray-100 hover:bg-blue-900 hover:text-white transition" title="Authority Edit"><Pencil className="w-3 h-3" /></button>
                                                        <button onClick={() => promptRemoveMealLog(m._id)} className="p-1 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition" title="Delete Log"><Trash2 className="w-3 h-3" /></button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* --- FEE SETTLEMENTS LEDGER TAB --- */}
                {activeTab === 'payments' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><CreditCard className="w-4 h-4 text-orange-600" /> Master Fee Settlements & Receipts</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{filteredPayments.length} Transactions</span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-gray-200 sticky top-0 border-b-2 border-gray-400 z-10">
                                    <tr className="text-gray-800 uppercase font-black tracking-wider">
                                        <th className="p-3 border-r border-gray-300">Timestamp</th>
                                        <th className="p-3 border-r border-gray-300">Receipt / Ref</th>
                                        <th className="p-3 border-r border-gray-300">Member Particulars</th>
                                        <th className="p-3 border-r border-gray-300 text-center w-20">Residence</th>
                                        <th className="p-3 border-r border-gray-300">Payment Channel</th>
                                        <th className="p-3 border-r border-gray-300 text-center">Settled Amount</th>
                                        <th className="p-3 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-300 font-medium">
                                    {filteredPayments.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-12 text-gray-400 uppercase font-bold text-xs">No payment records found.</td></tr>
                                    ) : (
                                        filteredPayments.map((p) => (
                                            <tr key={p._id} className="hover:bg-gray-50 transition">
                                                <td className="p-3 border-r border-gray-300 text-gray-800">{new Date(p.createdAt || p.paymentDate).toLocaleString()}</td>
                                                <td className="p-3 border-r border-gray-300">
                                                    <div className="font-black text-blue-900">{p.receiptNo}</div>
                                                    <div className="text-[9px] font-mono text-gray-500">{p.txnId}</div>
                                                </td>
                                                <td className="p-3 border-r border-gray-300 uppercase font-bold text-gray-900">
                                                    {p.studentName || p.userId?.name} <span className="text-[10px] text-gray-500">({p.rollNo || p.userId?.rollNo})</span>
                                                </td>
                                                <td className="p-3 border-r border-gray-300 text-center"><span className="bg-white border border-gray-400 px-1.5 py-0.5 text-[9px] font-black uppercase text-gray-800">{p.hostelNo}</span></td>
                                                <td className="p-3 border-r border-gray-300 font-bold uppercase text-orange-800">{p.paymentChannel || p.paymentMode || 'Desk Cash'}</td>
                                                <td className="p-3 border-r border-gray-300 text-center font-black text-blue-900 text-sm">₹{Number(p.amount).toLocaleString()}/-</td>
                                                <td className="p-3 text-right">
                                                    <button 
                                                        onClick={() => handleRevokeSettlement(p._id, p.studentName || 'Student')} 
                                                        className="p-1 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"
                                                        title="Delete Record (Reset Student to Unpaid)"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'complaints' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><MessageSquareWarning className="w-4 h-4 text-orange-600" /> Grievance Resolution Desk</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{filteredComplaints.length} Filings</span>
                        </div>
                        {filteredComplaints.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-xs font-bold uppercase">No records found.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 max-h-[60vh] overflow-y-auto">
                                {filteredComplaints.map(c => (
                                    <div key={c._id} className="border border-gray-300 p-4 bg-gray-50 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-center justify-between border-b border-gray-200 pb-2 mb-2">
                                                <span className="text-[10px] font-black bg-white border border-gray-300 px-2 py-0.5 uppercase tracking-wide">{c.category} • {c.hostelNo}</span>
                                                <span className={`text-[9px] font-black px-2 py-0.5 uppercase border tracking-wider ${c.status === 'Resolved' ? 'bg-green-100 text-green-800 border-green-300' : c.status === 'In Progress' ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-red-100 text-red-800 border-red-300'}`}>{c.status}</span>
                                            </div>
                                            <h3 className="font-black text-gray-900 text-xs uppercase mb-1">{c.subject}</h3>
                                            <p className="text-[11px] text-gray-700 font-medium leading-relaxed">{c.description}</p>
                                        </div>
                                        {c.photoProof && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-12 h-12 object-cover border border-gray-400" /></a>
                                                <div className="text-[9px] text-gray-500 font-bold uppercase mt-1">Evidentiary Attachment</div>
                                            </div>
                                        )}
                                        <div className="bg-white border border-gray-300 p-3 text-[10px] uppercase font-bold mt-4">
                                            <p className="text-gray-500">Applicant: <span className="text-blue-900">{c.userId?.name} (Roll: {c.userId?.rollNo})</span></p>
                                            <p className="text-gray-500 mt-1">Contact: <span className="text-gray-800">+91 {c.userId?.mobileNo}</span></p>
                                            {c.adminRemark && <div className="mt-2 pt-2 border-t border-gray-200 text-orange-800">Note: <span className="text-gray-700">{c.adminRemark}</span></div>}
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-300">
                                            <span className="text-[9px] text-gray-500 font-bold tracking-wider">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-2 print:hidden">
                                                <button onClick={() => openComplaintModal(c)} className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-1.5 text-[9px] uppercase tracking-wider cursor-pointer transition">Status Update</button>
                                                <button onClick={() => promptDeleteComplaint(c._id)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'notices' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between mb-4">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><BellRing className="w-4 h-4 text-orange-600" /> Public Notice Dispatcher</h2>
                            <span className="text-[10px] font-black text-gray-600 uppercase border border-gray-300 bg-white px-2 py-0.5">{noticesList.length} Broadcasts</span>
                        </div>

                        <form onSubmit={handleNoticeSubmit} className="bg-gray-50 border border-gray-300 p-5 m-4">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-2 mb-4">Publish Official Decree</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Decree Title</label>
                                    <input required type="text" placeholder="e.g. Special Dinner on Sunday" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Target Jurisdiction</label>
                                    <select value={noticeHostel} onChange={e => setNoticeHostel(e.target.value)} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer">
                                        <option value="ALL">All Residences (Campus-Wide)</option>
                                        <option value="BH1">BH1 Only</option><option value="BH2">BH2 Only</option><option value="BH3">BH3 Only</option>
                                        <option value="GH1">GH1 Only</option><option value="GH2">GH2 Only</option><option value="GH3">GH3 Only</option><option value="GH4">GH4 Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Decree Content</label>
                                <textarea required rows="3" placeholder="Provide formal details..." value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 resize-none" />
                            </div>
                            <button type="submit" disabled={postingNotice} className="mt-4 bg-blue-900 hover:bg-blue-800 text-white font-bold px-6 py-2.5 text-[10px] tracking-wider uppercase transition flex items-center gap-2 cursor-pointer disabled:opacity-70">
                                <Send className="w-3.5 h-3.5" /> <span>{postingNotice ? 'Transmitting...' : 'Dispatch Decree'}</span>
                            </button>
                        </form>

                        <div className="px-4 pb-4">
                            <h3 className="text-[11px] font-black uppercase text-gray-800 border-b border-gray-300 pb-2 mb-4 tracking-widest">Broadcast Log</h3>
                            {noticesList.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 text-xs font-bold uppercase">No records found.</div>
                            ) : (
                                <div className="space-y-3">
                                    {noticesList.map(n => (
                                        <div key={n._id} className="border border-gray-300 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[9px] font-black bg-orange-100 text-orange-900 border border-orange-300 px-2 py-0.5 uppercase tracking-wider">Target: {n.hostelNo}</span>
                                                    <span className="text-[9px] text-gray-500 font-bold uppercase">Date: {new Date(n.createdAt).toLocaleDateString()} | Authority: {n.postedBy}</span>
                                                </div>
                                                <h4 className="font-black text-gray-900 text-xs uppercase mb-1">{n.title}</h4>
                                                <p className="text-[11px] text-gray-700 font-medium whitespace-pre-wrap">{n.content}</p>
                                            </div>
                                            <button onClick={() => promptDeleteNotice(n._id)} title="Revoke Decree" className="p-2 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* SETTINGS CONFIGURATIONS */}
                {activeTab === 'settings' && (
                    <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
                        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between mb-4">
                            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2"><Settings className="w-4 h-4 text-orange-600" /> Administrative Configurations</h2>
                        </div>

                        <div className="p-6">
                            <div className="max-w-xl mx-auto border border-gray-300 bg-gray-50 p-6 shadow-sm">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-800 border-b border-gray-300 pb-2 mb-5">Update Official Diet Rates</h3>
                                
                                <div className="mb-5">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Select Jurisdiction (Residence)</label>
                                    <select 
                                        className="w-full bg-white border border-gray-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-900 cursor-pointer"
                                        onChange={(e) => {
                                            const h = hostelsList.find(x => x._id === e.target.value);
                                            setTargetHostelId(e.target.value);
                                            if (h?.mealCosts) {
                                                setDietRates(h.mealCosts);
                                            } else {
                                                setDietRates({ breakfast: 37, lunch: 37, dinner: 37 });
                                            }
                                        }}
                                        value={targetHostelId}
                                    >
                                        <option value="">-- SELECT RESIDENCE --</option>
                                        {hostelsList.map(h => (
                                            <option key={h._id} value={h._id}>{h.hostelNumber} - {h.name || h.type}</option>
                                        ))}
                                    </select>
                                </div>

                                {targetHostelId && (
                                    <form onSubmit={handleUpdateRates}>
                                        <div className="grid grid-cols-3 gap-4 mb-5">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Breakfast (₹)</label>
                                                <input type="number" required value={dietRates.breakfast} onChange={e => setDietRates({...dietRates, breakfast: Number(e.target.value)})} className="w-full bg-white border border-gray-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-900" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Lunch (₹)</label>
                                                <input type="number" required value={dietRates.lunch} onChange={e => setDietRates({...dietRates, lunch: Number(e.target.value)})} className="w-full bg-white border border-gray-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-900" />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Dinner (₹)</label>
                                                <input type="number" required value={dietRates.dinner} onChange={e => setDietRates({...dietRates, dinner: Number(e.target.value)})} className="w-full bg-white border border-gray-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-900" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 text-[11px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer">
                                            <Save className="w-3.5 h-3.5" /> Authorize Rate Change
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* EDIT STUDENT MODAL WITH PROPER DATE INPUT */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg shadow-2xl relative border-t-4 border-orange-600 max-h-[90vh] flex flex-col">
                        <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Update Member Record</h3>
                                <p className="text-[9px] font-bold text-gray-500 mt-0.5 uppercase">Administrative Override Engaged</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Candidate Full Name</label>
                                <input required type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 uppercase font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Father's Name</label>
                                    <input type="text" value={editFormData.fatherName} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 uppercase font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Mother's Name</label>
                                    <input type="text" value={editFormData.motherName} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 uppercase font-medium" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Roll Number</label>
                                    <input required type="text" value={editFormData.newRollNo} onChange={(e) => setEditFormData({ ...editFormData, newRollNo: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 uppercase font-bold" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Student ID Number</label>
                                    <input type="text" value={editFormData.studentId} onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 font-bold" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        max="2010-12-31" 
                                        value={editFormData.dob} 
                                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} 
                                        className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Gender</label>
                                    <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer">
                                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* HIERARCHICAL SELECTORS FOR EDITING */}
                            <div className="space-y-3 border-t border-b border-gray-300 py-3 my-2 bg-gray-50 p-3">
                                <div>
                                    <label className="text-[10px] font-bold text-blue-900 uppercase block mb-1">1. Select Faculty</label>
                                    <select
                                        value={editFormData.facultyId}
                                        onChange={e => handleAdminFacultyChange(e.target.value)}
                                        className="w-full bg-white border border-gray-400 p-2 text-xs uppercase focus:border-blue-900 rounded-sm cursor-pointer font-bold"
                                    >
                                        <option value="">-- SELECT FACULTY --</option>
                                        {UNIVERSITY_FACULTIES_HIERARCHY.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-blue-900 uppercase block mb-1">2. Select Department</label>
                                    <select
                                        disabled={!editFormData.facultyId}
                                        value={editFormData.department}
                                        onChange={e => handleAdminDepartmentChange(e.target.value)}
                                        className={`w-full bg-white border border-gray-400 p-2 text-xs uppercase rounded-sm font-bold ${!editFormData.facultyId ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <option value="">{editFormData.facultyId ? '-- SELECT DEPARTMENT --' : '-- FIRST CHOOSE FACULTY --'}</option>
                                        {adminAvailableDepartments.map((dept, idx) => (
                                            <option key={idx} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-blue-900 uppercase block mb-1">3. Course / Programme Name</label>
                                    <select
                                        disabled={!editFormData.department}
                                        value={editFormData.university}
                                        onChange={e => setEditFormData({ ...editFormData, university: e.target.value })}
                                        className={`w-full bg-white border border-gray-400 p-2 text-xs uppercase rounded-sm font-bold ${!editFormData.department ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <option value="">{editFormData.department ? '-- SELECT COURSE / DEGREE --' : '-- FIRST CHOOSE DEPARTMENT --'}</option>
                                        {adminAvailableProgrammes.map(course => (
                                            <option key={course.id} value={course.name}>[{course.id}] {course.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Academic Session</label>
                                    <select
                                        value={editFormData.session}
                                        onChange={e => setEditFormData({ ...editFormData, session: e.target.value })}
                                        className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer font-bold"
                                    >
                                        <option value="">-- SELECT SESSION --</option>
                                        {ACADEMIC_SESSIONS.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Nationality</label>
                                    <select
                                        value={editFormData.nationality}
                                        onChange={e => setEditFormData({ ...editFormData, nationality: e.target.value })}
                                        className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer font-bold"
                                    >
                                        {WORLD_COUNTRIES.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Domicile State</label>
                                    <select
                                        value={editFormData.domicileState}
                                        onChange={e => setEditFormData({ ...editFormData, domicileState: e.target.value })}
                                        className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer font-bold uppercase"
                                    >
                                        {INDIAN_STATES.map(st => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Category</label>
                                    <select value={editFormData.category || 'General'} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer uppercase font-bold">
                                        <option value="General">General</option><option value="SC">SC</option><option value="BC">BC</option><option value="OBC">OBC</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Residence Hall</label>
                                    <select value={editFormData.hostelNo} onChange={(e) => setEditFormData({ ...editFormData, hostelNo: e.target.value })} className="w-full bg-white border border-gray-400 px-2 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer uppercase font-bold">
                                        <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                                        <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Registered Email ID</label>
                                    <input type="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Mobile No</label>
                                    <input required type="tel" maxLength="10" value={editFormData.mobileNo} onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 font-medium" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-bold py-3 text-[11px] uppercase tracking-widest cursor-pointer transition">Commit Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT ADMIN MODAL */}
            {isAdminEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm shadow-2xl relative border-t-4 border-orange-600">
                        <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Committee Profile</h3>
                            <button onClick={() => setIsAdminEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleAdminEditSubmit} className="p-6 pt-0 space-y-4">
                            <div className="flex flex-col items-center justify-center mb-4 border border-gray-300 p-4 bg-gray-50">
                                <div className="relative group cursor-pointer border-2 border-blue-900 p-1 bg-white">
                                    <div className="w-20 h-20 bg-gray-200 overflow-hidden flex items-center justify-center">
                                        {adminEditFormData.profilePhoto ? <img src={adminEditFormData.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-gray-400" />}
                                    </div>
                                    <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImagePlus className="w-4 h-4 mb-0.5" /><span className="text-[8px] font-bold uppercase">Update</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAdminPhotoChange} />
                                    </label>
                                </div>
                            </div>
                            <div><label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Official Name</label><input required type="text" value={adminEditFormData.name} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, name: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900" /></div>
                            <div><label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Contact No</label><input type="tel" maxLength="10" value={adminEditFormData.mobileNo} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900" /></div>
                            <div><label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Date of Birth</label><input type="date" max="2010-12-31" value={adminEditFormData.dob} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, dob: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 cursor-pointer" /></div>
                            <button type="submit" className="w-full mt-2 bg-blue-900 hover:bg-blue-800 text-white font-bold py-2.5 text-[11px] uppercase tracking-widest transition">Apply Profile Update</button>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MEAL MODAL */}
            {isMealEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-orange-600">
                        <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Committee Meal Override</h3>
                            <button onClick={() => setIsMealEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleMealEditSubmit} className="p-6 pt-0 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Date Logged</label>
                                <input type="date" value={mealEditData.date} onChange={(e) => setMealEditData({ ...mealEditData, date: e.target.value })} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Toggle Standard Diets (Click to Check/Uncheck)</label>
                                {['breakfast', 'lunch', 'dinner'].map((mKey) => (
                                    <div 
                                        key={mKey} 
                                        onClick={() => setMealEditData({ 
                                            ...mealEditData, 
                                            meals: { ...mealEditData.meals, [mKey]: !mealEditData.meals[mKey] } 
                                        })} 
                                        className={`flex items-center justify-between p-2.5 border cursor-pointer select-none transition ${mealEditData.meals[mKey] ? 'bg-blue-50 border-blue-900 text-blue-900' : 'bg-gray-50 border-gray-300 text-gray-600'}`}
                                    >
                                        <span className="uppercase font-bold text-xs">{mKey}</span>
                                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 border ${mealEditData.meals[mKey] ? 'bg-blue-900 text-white border-blue-950' : 'bg-gray-200 text-gray-500 border-gray-300'}`}>
                                            {mealEditData.meals[mKey] ? 'Authorized Active' : 'Revoked / Omitted'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white font-bold py-2.5 text-[11px] uppercase tracking-widest transition">
                                Commit Executive Alteration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* RESOLVE COMPLAINT MODAL */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-orange-600">
                        <div className="bg-gray-100 border-b border-gray-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest">Process Grievance</h3>
                            <button onClick={() => setIsComplaintModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleComplaintUpdateSubmit} className="p-6 pt-0 space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Grievance Status Phase</label>
                                <select value={complaintStatus} onChange={e => setComplaintStatus(e.target.value)} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-900 cursor-pointer">
                                    <option value="Pending">Pending Assignment</option>
                                    <option value="In Progress">Active Investigation</option>
                                    <option value="Resolved">Formally Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Committee Statement</label>
                                <textarea rows="3" value={adminRemark} onChange={e => setAdminRemark(e.target.value)} className="w-full bg-white border border-gray-400 px-3 py-2 text-xs outline-none focus:border-blue-900 resize-none" placeholder="Provide formal remarks..." />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 text-[11px] uppercase tracking-widest transition">Stamp & Update Records</button>
                        </form>
                    </div>
                </div>
            )}

            {/* GLOBAL CONFIRMATION POPUP MODAL */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen} 
                title={confirmModal.title} 
                message={confirmModal.message} 
                onConfirm={confirmModal.onConfirm} 
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} 
            />
        </div>
    );
}