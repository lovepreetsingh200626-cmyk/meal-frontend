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
    KeyRound
} from 'lucide-react';

export default function AdminDashboard({ user, onLogout }) {
    const [usersList, setUsersList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // UI Tabs & Filters
    const [activeTab, setActiveTab] = useState('users'); // 'users' | 'meals'
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    useEffect(() => {
        fetchUsers();
        fetchAllMeals();
    }, []);

    // 1. Fetch All Users (Students)
    const fetchUsers = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/auth/users');
            setUsersList(data || []);
        } catch (err) {
            console.error('Failed to fetch users:', err);
            setErrorMsg(err.response?.data?.message || 'Could not load users list.');
            setTimeout(() => setErrorMsg(''), 4000);
        } finally {
            setLoading(false);
        }
    };

    // 2. Fetch All Campus Meal Logs
    const fetchAllMeals = async () => {
        try {
            const { data } = await API.get('/meals/all');
            setMealsList(data || []);
        } catch (err) {
            console.error('Failed to fetch meals:', err);
        }
    };

    // 3. Toggle Student Role (student <-> admin)
    const handleRoleChange = async (targetRollNo, currentRole) => {
        const newRole = currentRole === 'admin' ? 'student' : 'admin';

        try {
            await API.put('/auth/update-role', {
                targetRollNo: targetRollNo,
                newRole: newRole
            });

            setSuccessMsg(`Roll No ${targetRollNo} updated to ${newRole.toUpperCase()}!`);
            setTimeout(() => setSuccessMsg(''), 4000);

            setUsersList(prev =>
                prev.map(u => u.rollNo === targetRollNo ? { ...u, role: newRole } : u)
            );
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update role.');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    // 4. Remove Student Completely
    const handleRemoveStudent = async (targetRollNo, targetName) => {
        const confirmDelete = window.confirm(
            `Are you sure you want to permanently remove student Roll No ${targetRollNo} (${targetName})?`
        );
        if (!confirmDelete) return;

        try {
            await API.delete(`/auth/users/${targetRollNo}`);
            setSuccessMsg(`Student Roll No ${targetRollNo} removed successfully.`);
            setTimeout(() => setSuccessMsg(''), 4000);

            // Remove from local state immediately
            setUsersList(prev => prev.filter(u => u.rollNo !== targetRollNo));
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to remove student.');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    // 5. Admin: Change/Reset a Student's Password
    const handleResetPassword = async (targetRollNo, targetName) => {
        const newPassword = window.prompt(
            `Enter a new password (min. 8 characters) for Roll No ${targetRollNo} (${targetName}):`
        );

        // If admin clicks cancel or leaves empty
        if (newPassword === null) return;
        if (newPassword.trim().length < 8) {
            alert('Password must be at least 8 characters long.');
            return;
        }

        try {
            const { data } = await API.put(`/auth/users/${targetRollNo}/password`, {
                newPassword: newPassword.trim()
            });
            setSuccessMsg(data.message || `Password reset successfully for Roll No ${targetRollNo}!`);
            setTimeout(() => setSuccessMsg(''), 4000);
        } catch (err) {
            setErrorMsg(err.response?.data?.message || 'Failed to update password.');
            setTimeout(() => setErrorMsg(''), 4000);
        }
    };

    // Filtered & SORTED BY ROLL NUMBER (Ascending Order 0 -> 999)
    const filteredUsers = usersList
        .filter(u => {
            const matchesSearch =
                (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (u.rollNo && u.rollNo.toString().includes(searchTerm));
            const matchesHostel = selectedHostelFilter === 'ALL' || u.hostelNo === selectedHostelFilter;
            return matchesSearch && matchesHostel;
        })
        .sort((a, b) => {
            const rollA = Number(a.rollNo) || 0;
            const rollB = Number(b.rollNo) || 0;
            return rollA - rollB;
        });

    const filteredMeals = mealsList.filter(m => {
        const matchesHostel = selectedHostelFilter === 'ALL' || m.hostelId?.hostelNumber === selectedHostelFilter;
        return matchesHostel;
    });

    // Calculate Campus-Wide Stats
    const totalCampusRevenue = filteredMeals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);

    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">

            {/* Top Admin Navigation Banner (Hidden when printing) */}
            <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm print:hidden">
                <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-xl bg-amber-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-amber-600/20">
                            👑
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="font-extrabold text-slate-900 text-base leading-tight">{user.name || 'Administrator'}</h1>
                                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 uppercase">
                                    Executive Admin
                                </span>
                            </div>
                            <p className="text-xs font-medium text-slate-500 mt-0.5">
                                GNDU Amritsar • Campus Dining & Attendance Authority
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchUsers}
                            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg transition cursor-pointer border border-slate-200"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                            <span>Refresh</span>
                        </button>

                        <button
                            onClick={onLogout}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg transition cursor-pointer"
                        >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 mt-8 relative z-10">

                {/* Printable Header Stamp (Only visible on paper printouts) */}
                <div className="hidden print:block text-center border-b-2 border-slate-800 pb-4 mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-wider text-black">Guru Nanak Dev University, Amritsar</h1>
                    <p className="text-sm font-semibold">Campus Hostel Mess & Student Authorization Audit Report</p>
                    <div className="flex justify-between text-xs mt-3 border-t pt-2">
                        <span><strong>Generated By:</strong> {user.name} (Admin)</span>
                        <span><strong>Hostel Filter:</strong> {selectedHostelFilter}</span>
                        <span><strong>Date:</strong> {new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Quick Admin Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 print:grid-cols-3">
                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Students</p>
                        <p className="text-3xl font-extrabold text-slate-900 mt-1.5">{usersList.length} <span className="text-xs font-medium text-slate-500">accounts</span></p>
                    </div>

                    <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm">
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Meal Entries</p>
                        <p className="text-3xl font-extrabold text-blue-600 mt-1.5">{filteredMeals.length} <span className="text-xs font-medium text-slate-500">logs</span></p>
                    </div>

                    <div className="bg-blue-600 text-white border border-blue-700 p-6 rounded-2xl shadow-sm flex flex-col justify-between">
                        <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Campus Mess Revenue</p>
                        <p className="text-3xl font-extrabold text-white mt-1.5">₹{totalCampusRevenue}</p>
                    </div>
                </div>

                {/* Status Alerts */}
                {errorMsg && (
                    <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3 print:hidden">
                        <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3 print:hidden">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* Action Bar: Tabs, Search & Filters (Hidden when printing) */}
                <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">

                    {/* Tab Controls */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'users'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Users className="w-3.5 h-3.5" />
                            <span>Student Directory & Roles</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('meals')}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                activeTab === 'meals'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            <Utensils className="w-3.5 h-3.5" />
                            <span>Campus Mess Ledger</span>
                        </button>
                    </div>

                    {/* Search & Hostel Filters */}
                    <div className="flex flex-wrap items-center gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search name or roll no..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-1.5 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-600 w-48"
                            />
                        </div>

                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-lg px-2.5 py-1.5">
                            <Filter className="w-3.5 h-3.5 text-slate-500" />
                            <select
                                value={selectedHostelFilter}
                                onChange={(e) => setSelectedHostelFilter(e.target.value)}
                                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">All Hostels</option>
                                <option value="BH1">BH1 (Boys 1)</option>
                                <option value="BH2">BH2 (Boys 2)</option>
                                <option value="BH3">BH3 (Boys 3)</option>
                                <option value="GH1">GH1 (Girls 1)</option>
                                <option value="GH2">GH2 (Girls 2)</option>
                                <option value="GH3">GH3 (Girls 3)</option>
                                <option value="GH4">GH4 (Girls 4)</option>
                            </select>
                        </div>

                        <button
                            onClick={handlePrintReport}
                            className="flex items-center gap-1.5 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-lg transition cursor-pointer shadow-sm"
                        >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Print Report</span>
                        </button>
                    </div>
                </div>

                {/* TAB 1: USER DIRECTORY & ROLE UPDATER */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                <Users className="w-5 h-5 text-blue-600" />
                                <span>Student Directory (Ordered by Roll No)</span>
                            </h2>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                {filteredUsers.length} Students Found
                            </span>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <th className="pb-3 pl-2">Roll No</th>
                                        <th className="pb-3">Full Name</th>
                                        <th className="pb-3">Hostel</th>
                                        <th className="pb-3">Mobile No</th>
                                        <th className="pb-3">Current Role</th>
                                        <th className="pb-3 text-right pr-2 print:hidden">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="text-center py-12 text-slate-400 text-sm font-medium">
                                                No students found matching your filter.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u._id} className="hover:bg-blue-50/40 transition">
                                                <td className="py-3.5 pl-2 font-bold text-slate-900 uppercase">{u.rollNo}</td>
                                                <td className="py-3.5 font-semibold text-slate-800">{u.name}</td>
                                                <td className="py-3.5">
                                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded text-xs font-bold uppercase">
                                                        {u.hostelNo || 'BH1'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-slate-600 text-xs font-medium">+91 {u.mobileNo || 'N/A'}</td>
                                                <td className="py-3.5">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase border ${
                                                        u.role === 'admin'
                                                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {u.role || 'student'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5 text-right pr-2 print:hidden">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        {/* Promote / Demote Role Button */}
                                                        <button
                                                            onClick={() => handleRoleChange(u.rollNo, u.role)}
                                                            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                                                                u.role === 'admin'
                                                                    ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                                                                    : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-xs'
                                                            }`}
                                                        >
                                                            {u.role === 'admin' ? 'Demote to Student' : 'Promote to Admin'}
                                                        </button>

                                                        {/* Change/Reset Password Button */}
                                                        <button
                                                            onClick={() => handleResetPassword(u.rollNo, u.name)}
                                                            title="Reset Student Password"
                                                            className="text-xs font-bold p-1.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition cursor-pointer"
                                                        >
                                                            <KeyRound className="w-3.5 h-3.5" />
                                                        </button>

                                                        {/* Remove Student Button */}
                                                        <button
                                                            onClick={() => handleRemoveStudent(u.rollNo, u.name)}
                                                            title="Permanently Remove Student"
                                                            className="text-xs font-bold p-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB 2: CAMPUS-WIDE MESS LEDGER */}
                {activeTab === 'meals' && (
                    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden print:border-none print:shadow-none print:p-0">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-blue-600" />
                                <span>Campus-Wide Mess Ledger</span>
                            </h2>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                {filteredMeals.length} Meal Entries
                            </span>
                        </div>

                        <div className="overflow-x-auto print:overflow-visible">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                                        <th className="pb-3 pl-2">Date</th>
                                        <th className="pb-3">Student / Roll</th>
                                        <th className="pb-3">Hostel</th>
                                        <th className="pb-3">Meals Attended</th>
                                        <th className="pb-3 text-right pr-2">Day Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-sm">
                                    {filteredMeals.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-12 text-slate-400 text-sm font-medium">
                                                No meal logs found across the campus.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMeals.map((m) => (
                                            <tr key={m._id} className="hover:bg-blue-50/40 transition">
                                                <td className="py-3.5 pl-2 font-semibold text-slate-800">{m.date}</td>
                                                <td className="py-3.5 font-bold text-slate-900 uppercase">
                                                    {m.userId?.rollNo || 'UNKNOWN'} <span className="font-normal text-slate-500 text-xs">({m.userId?.name || 'N/A'})</span>
                                                </td>
                                                <td className="py-3.5">
                                                    <span className="bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-xs font-bold uppercase">
                                                        {m.hostelId?.hostelNumber || 'BH1'}
                                                    </span>
                                                </td>
                                                <td className="py-3.5">
                                                    <div className="flex gap-1.5">
                                                        {m.meals?.breakfast && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">B</span>}
                                                        {m.meals?.lunch && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">L</span>}
                                                        {m.meals?.dinner && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">D</span>}
                                                    </div>
                                                </td>
                                                <td className="py-3.5 text-right pr-2 font-bold text-emerald-600">
                                                    ₹{m.dailyTotalCost || 0}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Printable Footer Stamp */}
                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <span>GNDU Amritsar • Campus Administrator Authorization System</span>
                    </div>
                    <div className="hidden print:block text-black font-semibold">
                        Chief Warden Signature: _______________________
                    </div>
                </div>

            </div>
        </div>
    );
}