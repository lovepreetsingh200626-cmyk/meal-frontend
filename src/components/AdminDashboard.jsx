import React, { useState, useEffect } from 'react';
import API from '../services/api';
import {
    Users,
    Building,
    ShieldCheck,
    Search,
    LogOut,
    Utensils,
    IndianRupee,
    Calendar,
    Printer,
    CheckCircle2,
    AlertCircle,
    Filter,
    RefreshCw,
    Trash2,
    KeyRound,
    Pencil,
    X,
    ImagePlus,
    User as UserIcon,
    Phone,
    MessageSquareWarning,
    BellRing,
    Send
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout, onUpdateUser }) {
    const [usersList, setUsersList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [adminsList, setAdminsList] = useState([]); 
    const [complaintsList, setComplaintsList] = useState([]); 
    const [noticesList, setNoticesList] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // UI Tabs & Filters
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'admins' | 'meals' | 'complaints' | 'notices'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    // Student Edit Modal State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRollNo, setEditingRollNo] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        studentId: '',
        mobileNo: '',
        dob: '',
        gender: 'Male',
        hostelNo: 'BH1'
    });

    // Admin Edit Modal State
    const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState(null);
    const [adminEditFormData, setAdminEditFormData] = useState({
        name: '',
        mobileNo: '',
        dob: '',
        profilePhoto: ''
    });

    // Meal Log Edit Modal State
    const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealEditData, setMealEditData] = useState({
        date: '',
        meals: { breakfast: false, lunch: false, dinner: false },
        extras: []
    });

    // Complaint Resolution Modal State
    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [complaintStatus, setComplaintStatus] = useState('Pending');
    const [adminRemark, setAdminRemark] = useState('');

    // Notice Creation States
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeHostel, setNoticeHostel] = useState('ALL');
    const [postingNotice, setPostingNotice] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchAllMeals();
        fetchAdmins();
        fetchComplaints();
        fetchNotices();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/auth/users');
            setUsersList(data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAllMeals = async () => {
        try {
            const { data } = await API.get('/meals/all');
            setMealsList(data || []);
        } catch (err) { console.error(err); }
    };

    const fetchAdmins = async () => {
        try {
            const { data } = await API.get('/auth/admins');
            setAdminsList(Array.isArray(data) ? data : data.admins || []);
        } catch (err) { console.error(err); }
    };

    const fetchComplaints = async () => {
        try {
            const { data } = await API.get('/complaints/all');
            setComplaintsList(data || []);
        } catch (err) { console.error(err); }
    };

    const fetchNotices = async () => {
        try {
            const { data } = await API.get('/notices');
            setNoticesList(data || []);
        } catch (err) { console.error(err); }
    };

    const handleRoleChange = async (targetRollNo, currentRole) => {
        const newRole = currentRole === 'admin' ? 'student' : 'admin';
        try {
            await API.put('/auth/update-role', { targetRollNo, newRole });
            setSuccessMsg(`Roll No ${targetRollNo} updated to ${newRole.toUpperCase()}!`);
            setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.map(u => u.rollNo === targetRollNo ? { ...u, role: newRole } : u));
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleRemoveStudent = async (targetRollNo, targetName) => {
        if (!window.confirm(`Permanently remove student Roll No ${targetRollNo} (${targetName})?`)) return;
        try {
            await API.delete(`/auth/users/${targetRollNo}`);
            setSuccessMsg(`Student removed successfully.`);
            setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.filter(u => u.rollNo !== targetRollNo));
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleResetPassword = async (targetRollNo, targetName) => {
        const newPassword = window.prompt(`Enter new password (min. 8 chars) for Roll No ${targetRollNo} (${targetName}):`);
        if (newPassword === null || newPassword.trim().length < 8) return alert('Password must be at least 8 characters long.');
        try {
            const { data } = await API.put(`/auth/users/${targetRollNo}/password`, { newPassword: newPassword.trim() });
            setSuccessMsg(data.message || 'Password reset successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openEditModal = (student) => {
        setEditingRollNo(student.rollNo);
        setEditFormData({ name: student.name || '', studentId: student.studentId || '', mobileNo: student.mobileNo || '', dob: student.dob || '', gender: student.gender || 'Male', hostelNo: student.hostelNo || 'BH1' });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/users/${editingRollNo}`, editFormData);
            setSuccessMsg('Student updated successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.map(u => u.rollNo === editingRollNo ? data.user : u));
            setIsEditModalOpen(false);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openAdminEditModal = (adminAccount) => {
        setEditingAdmin(adminAccount);
        setAdminEditFormData({ name: adminAccount.name || '', mobileNo: adminAccount.mobileNo || '', dob: adminAccount.dob || '', profilePhoto: adminAccount.profilePhoto || '' });
        setIsAdminEditModalOpen(true);
    };

    const handleAdminPhotoChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => setAdminEditFormData(prev => ({ ...prev, profilePhoto: reader.result }));
        reader.readAsDataURL(file);
    };

    const handleAdminEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/admins/${editingAdmin._id}`, adminEditFormData);
            setSuccessMsg('Admin updated!');
            setTimeout(() => setSuccessMsg(''), 4000);
            setAdminsList(prev => prev.map(a => a._id === editingAdmin._id ? data.admin : a));
            if (user && editingAdmin._id === user._id && onUpdateUser) onUpdateUser(data.admin);
            setIsAdminEditModalOpen(false);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleRemoveAdmin = async (adminId, adminName) => {
        if (adminId === user._id) return alert('You cannot delete your own active admin account.');
        if (!window.confirm(`Permanently remove admin (${adminName})?`)) return;
        try {
            await API.delete(`/auth/admins/${adminId}`);
            setSuccessMsg('Admin removed.');
            setTimeout(() => setSuccessMsg(''), 4000);
            setAdminsList(prev => prev.filter(a => a._id !== adminId));
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openMealEditModal = (meal) => {
        setEditingMeal(meal);
        setMealEditData({ date: meal.date, meals: { ...meal.meals }, extras: meal.extras ? [...meal.extras] : [] });
        setIsMealEditModalOpen(true);
    };

    const handleMealEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/meals/${editingMeal._id}`, mealEditData);
            setSuccessMsg('Meal log updated!');
            setTimeout(() => setSuccessMsg(''), 4000);
            setMealsList(prev => prev.map(m => m._id === editingMeal._id ? data.meal : m));
            setIsMealEditModalOpen(false);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleRemoveMealLog = async (mealId) => {
        if (!window.confirm('Delete this meal log?')) return;
        try {
            await API.delete(`/meals/${mealId}`);
            setSuccessMsg('Meal log deleted.');
            setTimeout(() => setSuccessMsg(''), 4000);
            setMealsList(prev => prev.filter(m => m._id !== mealId));
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const openComplaintModal = (c) => {
        setActiveComplaint(c);
        setComplaintStatus(c.status || 'Pending');
        setAdminRemark(c.adminRemark || '');
        setIsComplaintModalOpen(true);
    };

    const handleComplaintUpdateSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/complaints/${activeComplaint._id}`, { status: complaintStatus, adminRemark });
            setSuccessMsg('Complaint status updated successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
            setComplaintsList(prev => prev.map(c => c._id === activeComplaint._id ? data.complaint : c));
            setIsComplaintModalOpen(false);
        } catch (err) { setErrorMsg(err.response?.data?.message || 'Failed to update complaint'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleDeleteComplaint = async (cId) => {
        if (!window.confirm('Delete this complaint?')) return;
        try {
            await API.delete(`/complaints/${cId}`);
            setSuccessMsg('Complaint deleted.');
            setTimeout(() => setSuccessMsg(''), 4000);
            setComplaintsList(prev => prev.filter(c => c._id !== cId));
        } catch (err) { setErrorMsg('Failed'); setTimeout(() => setErrorMsg(''), 4000); }
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault();
        if (!noticeTitle.trim() || !noticeContent.trim()) return;
        setPostingNotice(true);
        try {
            const { data } = await API.post('/notices', {
                title: noticeTitle,
                content: noticeContent,
                hostelNo: noticeHostel,
                postedBy: user.name || 'Executive Admin'
            });
            setSuccessMsg('Notice posted successfully!');
            setTimeout(() => setSuccessMsg(''), 4000);
            setNoticeTitle('');
            setNoticeContent('');
            setNoticesList(prev => [data.notice, ...prev]);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to post notice.');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setPostingNotice(false);
        }
    };

    const handleDeleteNotice = async (noticeId) => {
        if (!window.confirm('Are you sure you want to delete this notice?')) return;
        try {
            await API.delete(`/notices/${noticeId}`);
            setSuccessMsg('Notice deleted successfully.');
            setTimeout(() => setSuccessMsg(''), 4000);
            setNoticesList(prev => prev.filter(n => n._id !== noticeId));
        } catch (err) {
            setErrorMsg('Failed to delete notice.');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    // Filters
    const filteredUsers = usersList.filter(u => {
        const matchesSearch = (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || (u.rollNo && u.rollNo.toString().includes(searchTerm));
        const matchesHostel = selectedHostelFilter === 'ALL' || u.hostelNo === selectedHostelFilter;
        return matchesSearch && matchesHostel;
    }).sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));

    const filteredMeals = mealsList.filter(m => selectedHostelFilter === 'ALL' || m.hostelId?.hostelNumber === selectedHostelFilter);
    const filteredAdmins = adminsList.filter(a => a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredComplaints = complaintsList.filter(c => selectedHostelFilter === 'ALL' || c.hostelNo === selectedHostelFilter);

    const totalCampusRevenue = filteredMeals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);
    const handlePrintReport = () => window.print();

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">

            {/* Top Navigation */}
            <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-40 shadow-sm print:hidden">
                <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <div onClick={() => openAdminEditModal(user)} className="flex items-center gap-3.5 cursor-pointer group hover:opacity-80 transition" title="Edit Profile">
                        <div className="w-11 h-11 rounded-xl bg-amber-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-amber-600/20 overflow-hidden">
                            {user.profilePhoto ? <img src={user.profilePhoto} alt="Admin" className="w-full h-full object-cover" /> : '👑'}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-amber-600 transition-colors">{user.name || 'Administrator'}</h1>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase">Executive Admin</span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">GNDU Amritsar • Campus Dining & Attendance Authority</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button onClick={() => { fetchUsers(); fetchAllMeals(); fetchAdmins(); fetchComplaints(); fetchNotices(); }} className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition cursor-pointer border">
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> <span>Refresh</span>
                        </button>
                        <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg transition cursor-pointer">
                            <LogOut className="w-3.5 h-3.5" /> <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 mt-8 relative z-10">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 print:grid-cols-3">
                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Students</p><p className="text-3xl font-extrabold text-slate-900 mt-1.5">{usersList.length} <span className="text-xs font-medium text-slate-500">accounts</span></p></div>
                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm"><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meal Entries</p><p className="text-3xl font-extrabold text-blue-600 mt-1.5">{filteredMeals.length} <span className="text-xs font-medium text-slate-500">logs</span></p></div>
                    <div className="bg-blue-600 text-white border border-blue-700 p-6 rounded-2xl shadow-sm flex flex-col justify-between"><p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Campus Revenue</p><p className="text-3xl font-extrabold text-white mt-1.5">₹{totalCampusRevenue}</p></div>
                </div>

                {errorMsg && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3 print:hidden"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /><span>{errorMsg}</span></div>}
                {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3 print:hidden"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>{successMsg}</span></div>}

                {/* Action Bar */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => setActiveTab('users')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'users' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <Users className="w-3.5 h-3.5" /> Students
                        </button>
                        <button onClick={() => setActiveTab('admins')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'admins' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <ShieldCheck className="w-3.5 h-3.5" /> Admins
                        </button>
                        <button onClick={() => setActiveTab('meals')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'meals' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <Utensils className="w-3.5 h-3.5" /> Ledger
                        </button>
                        <button onClick={() => setActiveTab('complaints')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'complaints' ? 'bg-amber-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <MessageSquareWarning className="w-3.5 h-3.5" /> Complaints ({complaintsList.filter(c => c.status === 'Pending').length})
                        </button>
                        <button onClick={() => setActiveTab('notices')} className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${activeTab === 'notices' ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                            <BellRing className="w-3.5 h-3.5" /> Notice Board
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input type="text" placeholder="Search name or roll..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none w-48" />
                        </div>
                        {activeTab !== 'admins' && activeTab !== 'notices' && (
                            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                                <Filter className="w-3.5 h-3.5 text-slate-500" />
                                <select value={selectedHostelFilter} onChange={(e) => setSelectedHostelFilter(e.target.value)} className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer">
                                    <option value="ALL">All Hostels</option>
                                    <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                                    <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                                </select>
                            </div>
                        )}
                        <button onClick={handlePrintReport} className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg transition cursor-pointer shadow-sm">
                            <Printer className="w-3.5 h-3.5" /> Print
                        </button>
                    </div>
                </div>

                {/* TAB 1: USERS (With Student Profile Photos) */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Users className="w-5 h-5 text-blue-600" /> Student Directory</h2>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">{filteredUsers.length} Students</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <th className="pb-3 pl-2">Roll No</th>
                                        <th className="pb-3">Student Name & Photo</th>
                                        <th className="pb-3">Hostel</th>
                                        <th className="pb-3">Mobile No</th>
                                        <th className="pb-3">Role</th>
                                        <th className="pb-3 text-right pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredUsers.map((u) => (
                                        <tr key={u._id} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3.5 pl-2 font-bold uppercase">{u.rollNo}</td>
                                            <td className="py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                                        {u.profilePhoto ? (
                                                            <img src={u.profilePhoto} alt="Student" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserIcon className="w-5 h-5 text-slate-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{u.name}</div>
                                                        <div className="text-[10px] text-slate-500">{u.studentId ? `ID: ${u.studentId}` : 'No ID Set'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-3.5"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase">{u.hostelNo}</span></td>
                                            <td className="py-3.5 text-xs">+91 {u.mobileNo || 'N/A'}</td>
                                            <td className="py-3.5"><span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase border ${u.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'}`}>{u.role}</span></td>
                                            <td className="py-3.5 text-right pr-2">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => handleRoleChange(u.rollNo, u.role)} className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${u.role === 'admin' ? 'bg-amber-50 text-amber-800' : 'bg-blue-600 text-white'}`}>{u.role === 'admin' ? 'Demote' : 'Promote'}</button>
                                                    <button onClick={() => openEditModal(u)} className="p-1.5 rounded-lg border bg-slate-50 hover:bg-blue-600 hover:text-white transition" title="Edit Details"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleResetPassword(u.rollNo, u.name)} className="p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition" title="Reset Password"><KeyRound className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleRemoveStudent(u.rollNo, u.name)} className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition" title="Remove Student"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 1.5: ADMINS */}
                {activeTab === 'admins' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-amber-600" /> Administrator Directory</h2>
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border">{filteredAdmins.length} Admins</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <th className="pb-3 pl-2">Profile</th><th className="pb-3">Role</th><th className="pb-3">Mobile No</th><th className="pb-3">DOB</th><th className="pb-3 text-right pr-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredAdmins.map((a) => (
                                        <tr key={a._id} className="hover:bg-amber-50/40 transition">
                                            <td className="py-3.5 pl-2"><div className="flex items-center gap-3 cursor-pointer group" onClick={() => openAdminEditModal(a)}><div className="w-10 h-10 rounded-full border-2 border-white shadow-sm bg-slate-100 overflow-hidden flex items-center justify-center">{a.profilePhoto ? <img src={a.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-slate-400" />}</div><span className="font-semibold group-hover:text-amber-600">{a.name}</span></div></td>
                                            <td className="py-3.5"><span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-xs font-bold uppercase">{a.role}</span></td>
                                            <td className="py-3.5 text-xs">{a.mobileNo ? `+91 ${a.mobileNo}` : 'Not Set'}</td>
                                            <td className="py-3.5 text-xs">{a.dob || 'Not Set'}</td>
                                            <td className="py-3.5 text-right pr-2">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openAdminEditModal(a)} className="p-1.5 rounded-lg border bg-slate-50 hover:bg-amber-500 hover:text-white transition"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => handleRemoveAdmin(a._id, a.name)} className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: MEALS LEDGER */}
                {activeTab === 'meals' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Utensils className="w-5 h-5 text-blue-600" /> Campus-Wide Mess Ledger</h2>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">{filteredMeals.length} Entries</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <th className="pb-3 pl-2">Date</th><th className="pb-3">Student / Roll</th><th className="pb-3">Hostel</th><th className="pb-3">Meals Attended</th><th className="pb-3">Extras</th><th className="pb-3 text-right pr-2">Actions / Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredMeals.map((m) => (
                                        <tr key={m._id} className="hover:bg-blue-50/40 transition">
                                            <td className="py-3.5 pl-2 font-semibold">{m.date}</td>
                                            <td className="py-3.5 font-bold uppercase">{m.userId?.rollNo || 'N/A'} <span className="font-normal text-xs text-slate-500">({m.userId?.name})</span></td>
                                            <td className="py-3.5"><span className="bg-slate-100 px-2 py-0.5 rounded text-xs font-bold uppercase">{m.hostelId?.hostelNumber}</span></td>
                                            <td className="py-3.5"><div className="flex gap-1">{m.meals?.breakfast && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold">B</span>}{m.meals?.lunch && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold">L</span>}{m.meals?.dinner && <span className="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded text-xs font-bold">D</span>}</div></td>
                                            <td className="py-3.5 text-xs text-slate-600">{m.extras?.length > 0 ? m.extras.map(e => `${e.itemName}(₹${e.cost})`).join(', ') : 'None'}</td>
                                            <td className="py-3.5 text-right pr-2"><div className="flex items-center justify-end gap-3"><span className="font-bold text-emerald-600">₹{m.dailyTotalCost || 0}</span><button onClick={() => openMealEditModal(m)} className="p-1 rounded border bg-slate-50 hover:bg-blue-600 hover:text-white transition"><Pencil className="w-3.5 h-3.5" /></button><button onClick={() => handleRemoveMealLog(m._id)} className="p-1 rounded border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"><Trash2 className="w-3.5 h-3.5" /></button></div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 3: COMPLAINTS */}
                {activeTab === 'complaints' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><MessageSquareWarning className="w-5 h-5 text-amber-600" /> Campus Complaints Resolution Center</h2>
                            <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-3 py-1 rounded-full border">{filteredComplaints.length} Total Complaints</span>
                        </div>
                        {filteredComplaints.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-sm italic">No student complaints found.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredComplaints.map(c => (
                                    <div key={c._id} className="border border-slate-200 p-5 rounded-2xl bg-slate-50/50 shadow-xs flex flex-col justify-between space-y-3">
                                        <div className="space-y-1.5">
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold bg-white border px-2.5 py-0.5 rounded uppercase">{c.category} • {c.hostelNo}</span>
                                                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{c.status}</span>
                                            </div>
                                            <h3 className="font-extrabold text-slate-900 text-base">{c.subject}</h3>
                                            <p className="text-xs text-slate-600">{c.description}</p>
                                        </div>
                                        {c.photoProof && (
                                            <div className="bg-white p-2 border rounded-xl flex items-center gap-3">
                                                <a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-14 h-14 object-cover rounded-lg border" /></a>
                                                <span className="text-[11px] text-slate-500 font-semibold">Click thumbnail to inspect proof photo.</span>
                                            </div>
                                        )}
                                        <div className="bg-white border p-3 rounded-xl text-xs space-y-1">
                                            <p className="font-bold text-slate-700">Student: <span className="font-normal">{c.userId?.name} (Roll No: {c.userId?.rollNo})</span></p>
                                            <p className="font-bold text-slate-700">Mobile: <span className="font-normal">+91 {c.userId?.mobileNo}</span></p>
                                            {c.adminRemark && <p className="font-bold text-amber-900 mt-1">Remark: <span className="font-normal text-slate-700">{c.adminRemark}</span></p>}
                                        </div>
                                        <div className="flex items-center justify-between pt-2 border-t">
                                            <span className="text-[10px] text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-2">
                                                <button onClick={() => openComplaintModal(c)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition cursor-pointer">Resolve / Update</button>
                                                <button onClick={() => handleDeleteComplaint(c._id)} className="p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 4: NOTICE BOARD MANAGER */}
                {activeTab === 'notices' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                <BellRing className="w-5 h-5 text-blue-600" /> Campus Notice Board Manager
                            </h2>
                            <span className="text-xs font-semibold text-blue-800 bg-blue-100 px-3 py-1 rounded-full border">{noticesList.length} Active Notices</span>
                        </div>

                        {/* Notice Publishing Form */}
                        <form onSubmit={handleNoticeSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl mb-8 space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Publish New Notice</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Notice Title</label>
                                    <input required type="text" placeholder="e.g. Special Dinner on Sunday" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Target Audience / Hostel</label>
                                    <select value={noticeHostel} onChange={e => setNoticeHostel(e.target.value)} className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none cursor-pointer">
                                        <option value="ALL">All Hostels (Campus-Wide)</option>
                                        <option value="BH1">BH1 Only</option><option value="BH2">BH2 Only</option><option value="BH3">BH3 Only</option>
                                        <option value="GH1">GH1 Only</option><option value="GH2">GH2 Only</option><option value="GH3">GH3 Only</option><option value="GH4">GH4 Only</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase block mb-1">Notice Description / Content</label>
                                <textarea required rows="3" placeholder="Provide full details of the announcement..." value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full bg-white border rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none" />
                            </div>
                            <button type="submit" disabled={postingNotice} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-sm">
                                <Send className="w-3.5 h-3.5" /> <span>{postingNotice ? 'Publishing...' : 'Publish Notice'}</span>
                            </button>
                        </form>

                        {/* Posted Notices Feed */}
                        <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Published Notices History</h3>
                        {noticesList.length === 0 ? (
                            <div className="text-center py-12 text-slate-400 text-xs italic">No notices have been published yet.</div>
                        ) : (
                            <div className="space-y-4">
                                {noticesList.map(n => (
                                    <div key={n._id} className="border border-slate-200 bg-white p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-0.5 rounded uppercase">Target: {n.hostelNo}</span>
                                                <span className="text-[11px] text-slate-400 font-medium">Posted on {new Date(n.createdAt).toLocaleDateString()} by {n.postedBy}</span>
                                            </div>
                                            <h4 className="font-extrabold text-slate-900 text-base">{n.title}</h4>
                                            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{n.content}</p>
                                        </div>
                                        <button onClick={() => handleDeleteNotice(n._id)} title="Delete Notice" className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer shrink-0">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ================= MODALS ================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-extrabold text-slate-900">Edit Student Details</h3><button onClick={() => setIsEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full"><X className="w-4 h-4" /></button></div>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input required type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mt-1" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Student ID</label><input type="text" value={editFormData.studentId} onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mt-1" /></div>
                                <div><label className="text-xs font-bold text-slate-500 uppercase">Mobile No</label><input required type="tel" maxLength="10" value={editFormData.mobileNo} onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mt-1" /></div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">Save Changes</button>
                        </form>
                    </div>
                </div>
            )}

            {isAdminEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-extrabold text-slate-900">Admin Profile</h3><button onClick={() => setIsAdminEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full"><X className="w-4 h-4" /></button></div>
                        <form onSubmit={handleAdminEditSubmit} className="space-y-4">
                            <div className="flex flex-col items-center justify-center mb-2">
                                <div className="relative group cursor-pointer">
                                    <div className="w-24 h-24 rounded-full border-4 shadow-md overflow-hidden bg-slate-100 flex items-center justify-center">
                                        {adminEditFormData.profilePhoto ? <img src={adminEditFormData.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-10 h-10 text-slate-400" />}
                                    </div>
                                    <label className="absolute inset-0 bg-black/40 text-white rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImagePlus className="w-5 h-5 mb-0.5" /><span className="text-[9px] font-bold">Change</span><input type="file" accept="image/*" className="hidden" onChange={handleAdminPhotoChange} />
                                    </label>
                                </div>
                            </div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Admin Name</label><input required type="text" value={adminEditFormData.name} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, name: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm outline-none mt-1" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Mobile Number</label><input type="tel" maxLength="10" value={adminEditFormData.mobileNo} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full border rounded-xl px-4 py-2 text-sm outline-none mt-1" /></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">DOB</label><input type="date" value={adminEditFormData.dob} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, dob: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm outline-none mt-1" /></div>
                            <button type="submit" className="w-full mt-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-xl">Save Admin Details</button>
                        </form>
                    </div>
                </div>
            )}

            {isMealEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-extrabold text-slate-900">Edit Meal Log</h3><button onClick={() => setIsMealEditModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full"><X className="w-4 h-4" /></button></div>
                        <form onSubmit={handleMealEditSubmit} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Date</label><input type="date" value={mealEditData.date} onChange={(e) => setMealEditData({ ...mealEditData, date: e.target.value })} className="w-full border rounded-xl px-4 py-2 text-sm outline-none mt-1" /></div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Standard Meals</label>
                                {['breakfast', 'lunch', 'dinner'].map((mKey) => (
                                    <div key={mKey} onClick={() => setMealEditData({ ...mealEditData, meals: { ...mealEditData.meals, [mKey]: !mealEditData.meals[mKey] } })} className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer select-none ${mealEditData.meals[mKey] ? 'bg-blue-50 border-blue-600 text-blue-900' : 'bg-white'}`}>
                                        <span className="capitalize font-bold text-sm">{mKey}</span><span>{mealEditData.meals[mKey] ? 'Selected' : 'Unselected'}</span>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl">Update Meal Log</button>
                        </form>
                    </div>
                </div>
            )}

            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
                        <div className="flex items-center justify-between mb-6"><h3 className="text-xl font-extrabold text-slate-900">Resolve Complaint</h3><button onClick={() => setIsComplaintModalOpen(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full"><X className="w-4 h-4" /></button></div>
                        <form onSubmit={handleComplaintUpdateSubmit} className="space-y-4">
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Status</label><select value={complaintStatus} onChange={e => setComplaintStatus(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mt-1 bg-white"><option value="Pending">Pending</option><option value="In Progress">In Progress</option><option value="Resolved">Resolved</option></select></div>
                            <div><label className="text-xs font-bold text-slate-500 uppercase">Admin / Warden Remark</label><textarea rows="3" value={adminRemark} onChange={e => setAdminRemark(e.target.value)} className="w-full border rounded-xl px-4 py-2.5 text-sm outline-none mt-1 resize-none" /></div>
                            <button type="submit" className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl cursor-pointer">Save Complaint Status</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}