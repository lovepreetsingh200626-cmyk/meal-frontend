import React, { useState } from 'react';
import API from '../services/api';
import { 
    Users, ShieldCheck, FileText, CreditCard, MessageSquareWarning, 
    BellRing, Settings, LayoutDashboard, LogOut, Landmark, Award, X, ImagePlus 
} from 'lucide-react';

// Import your modularized admin sub-pages from client/src/pages/admin/
import AdminOverview from '../pages/admin/AdminOverview';
import AdminUsers from '../pages/admin/AdminUsers';
import AdminMeals from '../pages/admin/AdminMeals';
import AdminPayments from '../pages/admin/AdminPayments';
import AdminComplaints from '../pages/admin/AdminComplaints';
import AdminNotices from '../pages/admin/AdminNotices';
import AdminSettings from '../pages/admin/AdminSettings';

export default function AdminDashboard({ user, onLogout, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [isAdminEditModalOpen, setIsAdminEditModalOpen] = useState(false);
    const [adminEditFormData, setAdminEditFormData] = useState({
        name: user?.name || '', 
        mobileNo: user?.mobileNo || '', 
        dob: user?.dob ? String(user.dob).split('T')[0] : '', 
        profilePhoto: user?.profilePhoto || ''
    });

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
            const { data } = await API.put(`/auth/admins/${user._id}`, adminEditFormData);
            setSuccessMsg('Executive profile ratified successfully.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            if (onUpdateUser) onUpdateUser(data.admin);
            setIsAdminEditModalOpen(false);
        } catch (err) { 
            setErrorMsg('Failed to commit profile updates.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans flex flex-col selection:bg-blue-950 selection:text-white">
            
            {/* 1. NATIONAL / STATUTORY EMBLEM STRIP */}
            <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex justify-between items-center z-50 print:hidden select-none">
                <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Autonomous Hostel Cooperative Registry</span>
                    <span className="text-slate-600 hidden md:inline">|</span>
                    <span className="text-amber-300 font-black hidden md:inline">Executive Comptroller of Residential Accounts</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    <span>Portal Clearance: <strong className="text-white">SUPERVISORY ACCESS</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Statute Ref: <strong className="text-amber-400">SEC-2026/A</strong></span>
                </div>
            </div>

            {/* 2. EXECUTIVE COMPLIANCE HEADER */}
            <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-40 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 p-1 rounded-xs flex flex-col items-center justify-center text-center shadow-xs shrink-0 select-none">
                        <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />
                        <span className="text-[7px] font-black tracking-widest text-amber-200 uppercase leading-none">AUDIT</span>
                        <span className="text-[5px] font-bold tracking-tight text-white uppercase leading-none mt-0.5">COUNCIL</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg md:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                                Central Student Hostel Mess &amp; Diet Audit Ledger
                            </h1>
                            <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2 py-0.5 hidden sm:inline-block">
                                Executive Desk
                            </span>
                        </div>
                        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5 flex items-center gap-2">
                            <span>Executive Committee for Residential Welfare &amp; Comptroller of Accounts</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-amber-800 font-extrabold">Autonomous Cooperative Jurisdiction</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    <button 
                        onClick={onLogout} 
                        className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-xs active:scale-95"
                    >
                        <LogOut className="w-3.5 h-3.5" /> 
                        <span>Terminate Session</span>
                    </button>
                </div>
            </header>

            {/* 3. SUPERVISORY OFFICER IDENTIFIER STRIP (ADMIN PROFILE CLICK TARGET) */}
            <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-slate-800 z-30 print:hidden">
                <div 
                    onClick={() => setIsAdminEditModalOpen(true)} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-xs transition"
                    title="Click to edit Admin Profile & Portrait"
                >
                    <div className="w-8 h-8 bg-blue-950 text-amber-400 font-bold flex items-center justify-center border border-amber-600/50 overflow-hidden shrink-0">
                        {user?.profilePhoto ? <img src={user.profilePhoto} alt="Admin" className="w-full h-full object-cover" /> : <Award className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">{user?.name || 'Executive Officer'}</h3>
                            <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-xs">Verified</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Chief Warden &amp; Executive Secretary • Click here to edit profile
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase text-slate-400">
                    <span>Assigned Sector: <strong className="text-white">All Residences (Campus Core)</strong></span>
                    <span>•</span>
                    <span>Audit Mode: <strong className="text-emerald-400">Realtime Reconciled</strong></span>
                </div>
            </div>

            {/* 4. MAIN OPERATIONAL CONTAINER */}
            <div className="max-w-7xl mx-auto px-4 mt-6 w-full space-y-6">
                
                {errorMsg && (
                    <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* STATUTORY NAVIGATION TABS */}
                <div className="bg-white border border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
                    <div className="flex flex-wrap gap-1">
                        <button 
                            onClick={() => setActiveTab('dashboard')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <LayoutDashboard className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Executive Dashboard
                        </button>
                        <button 
                            onClick={() => setActiveTab('users')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'users' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <Users className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Member Directory
                        </button>
                        <button 
                            onClick={() => setActiveTab('meals')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'meals' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <FileText className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Master Ledger
                        </button>
                        <button 
                            onClick={() => setActiveTab('payments')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'payments' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <CreditCard className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Fee Clearances
                        </button>
                        <button 
                            onClick={() => setActiveTab('complaints')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'complaints' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <MessageSquareWarning className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Grievance Docket
                        </button>
                        <button 
                            onClick={() => setActiveTab('notices')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'notices' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <BellRing className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Directives
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <Settings className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Statutory Tariffs
                        </button>
                    </div>
                </div>

                {/* DYNAMIC VIEW ROUTER */}
                <main>
                    {activeTab === 'dashboard' && <AdminOverview />}
                    {activeTab === 'users' && <AdminUsers />}
                    {activeTab === 'meals' && <AdminMeals />}
                    {activeTab === 'payments' && <AdminPayments />}
                    {activeTab === 'complaints' && <AdminComplaints />}
                    {activeTab === 'notices' && <AdminNotices />}
                    {activeTab === 'settings' && <AdminSettings />}
                </main>
            </div>

            {/* AMEND OFFICER PROFILE MODAL */}
            {isAdminEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-sm shadow-2xl relative border-t-4 border-amber-600 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Executive Officer Profile</h3>
                            <button onClick={() => setIsAdminEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleAdminEditSubmit} className="p-6 pt-0 space-y-4">
                            <div className="flex flex-col items-center justify-center mb-4 border border-slate-300 p-4 bg-slate-50">
                                <div className="relative group cursor-pointer border-2 border-blue-950 p-1 bg-white">
                                    <div className="w-20 h-20 bg-slate-200 overflow-hidden flex items-center justify-center">
                                        {adminEditFormData.profilePhoto ? <img src={adminEditFormData.profilePhoto} alt="" className="w-full h-full object-cover" /> : <Award className="w-8 h-8 text-slate-400" />}
                                    </div>
                                    <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImagePlus className="w-4 h-4 mb-0.5" /><span className="text-[8px] font-bold uppercase">Update Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handleAdminPhotoChange} />
                                    </label>
                                </div>
                            </div>
                            <div><label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Commissioned Name</label><input required type="text" value={adminEditFormData.name} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, name: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950 uppercase" /></div>
                            <div><label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Official Mobile Protocol</label><input type="tel" maxLength="10" value={adminEditFormData.mobileNo} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" /></div>
                            <div><label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Date of Birth</label><input type="date" max="2010-12-31" value={adminEditFormData.dob} onChange={(e) => setAdminEditFormData({ ...adminEditFormData, dob: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono outline-none focus:border-blue-950 cursor-pointer" /></div>
                            <button type="submit" className="w-full mt-2 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-amber-500 active:scale-95">Ratify Credentials</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}