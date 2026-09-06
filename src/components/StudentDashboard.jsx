import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
    LayoutDashboard, FileText, CreditCard, MessageSquareWarning, 
    BellRing, LogOut, Landmark, Award, X, ImagePlus, User as UserIcon, CheckCircle2, AlertCircle, Loader2
} from 'lucide-react';

// Import your student modular sub-pages from client/src/pages/student/
import StudentOverview from '../pages/student/StudentOverview';
import StudentLedger from '../pages/student/StudentLedger';
import StudentPayments from '../pages/student/StudentPayments';
import StudentComplaints from '../pages/student/StudentComplaints';
import StudentNotices from '../pages/student/StudentNotices';

export default function StudentDashboard({ user, onLogout, onUpdateUser }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [profileFormData, setProfileFormData] = useState({
        name: user?.name || '', 
        mobileNo: user?.mobileNo || '', 
        email: user?.email || '',
        profilePhoto: user?.profilePhoto || ''
    });

    // Pro-Level Self-Loading Transition Trigger on Tab Switch
    const handleTabSwitch = (tabName) => {
        if (activeTab === tabName) return;
        setIsTransitioning(true);
        setActiveTab(tabName);
        
        // Simulates the exact archive retrieval pause seen in the admin dashboard
        setTimeout(() => {
            setIsTransitioning(false);
        }, 500); 
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]; 
        if (!file) return;
        const reader = new FileReader(); 
        reader.onloadend = () => setProfileFormData(prev => ({ ...prev, profilePhoto: reader.result })); 
        reader.readAsDataURL(file);
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/users/${user._id}`, profileFormData);
            setSuccessMsg('Candidate dossier amended successfully.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            if (onUpdateUser) onUpdateUser(data.user);
            setIsProfileModalOpen(false);
        } catch (err) { 
            setErrorMsg('Failed to commit profile updates.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans flex flex-col selection:bg-blue-950 selection:text-white">
            
            {/* 1. STATE GOVERNMENT & STATUTORY EMBLEM STRIP */}
            <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/80 flex justify-between items-center z-50 print:hidden select-none">
                <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Government of Punjab • Department of Higher Education</span>
                    <span className="text-slate-600 hidden md:inline">|</span>
                    <span className="text-amber-300 font-black hidden md:inline">Candidate Residential Portal</span>
                </div>
                <div className="flex items-center gap-3 text-[9px] font-mono uppercase tracking-wider text-slate-400">
                    <span>Student Status: <strong className="text-emerald-400">ACTIVE RESIDENT</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Roll No: <strong className="text-white">{user?.rollNo || 'N/A'}</strong></span>
                </div>
            </div>

            {/* 2. OFFICIAL INSTITUTIONAL HEADER */}
            <header className="bg-white border-b-2 border-slate-300 shadow-xs px-4 md:px-8 py-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-40 print:hidden">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-950 via-slate-900 to-blue-900 border-2 border-amber-600 p-1 rounded-xs flex flex-col items-center justify-center text-center shadow-xs shrink-0 select-none">
                        <Landmark className="w-5 h-5 text-amber-400 mb-0.5" />
                        <span className="text-[7px] font-black tracking-widest text-amber-200 uppercase leading-none">PUNJAB</span>
                        <span className="text-[5px] font-bold tracking-tight text-white uppercase leading-none mt-0.5">HOSTELS</span>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-lg md:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                                Central Student Hostel Mess &amp; Diet Audit Ledger
                            </h1>
                            <span className="text-[9px] font-black uppercase bg-emerald-50 text-emerald-900 border border-emerald-300 px-2 py-0.5 hidden sm:inline-block">
                                Certified Resident Desk
                            </span>
                        </div>
                        <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide mt-0.5 flex items-center gap-2">
                            <span>Student Residential &amp; Mess Cooperative Association</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-amber-800 font-extrabold">{user?.university || 'University Campus'}</span>
                        </h2>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    <button 
                        onClick={onLogout} 
                        className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-xs active:scale-95"
                    >
                        <LogOut className="w-3.5 h-3.5" /> 
                        <span>Sign Out</span>
                    </button>
                </div>
            </header>

            {/* 3. STUDENT PROFILE IDENTIFIER STRIP */}
            <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-slate-800 z-30 print:hidden">
                <div 
                    onClick={() => setIsProfileModalOpen(true)} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-xs transition"
                    title="Click to edit personal candidate dossier"
                >
                    <div className="w-8 h-8 bg-blue-950 text-amber-400 font-bold flex items-center justify-center border border-amber-600/50 overflow-hidden shrink-0">
                        {user?.profilePhoto ? <img src={user.profilePhoto} alt="Student" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">{user?.name || 'Candidate'}</h3>
                            <span className="text-[8px] font-black uppercase bg-blue-600 text-white px-1.5 py-0.2 rounded-xs">Edit Dossier ✏️</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            ID: <strong className="text-amber-300 font-mono">{user?.studentId || 'N/A'}</strong> • Residence: <strong className="text-white font-mono">{user?.hostelNo || 'N/A'}</strong>
                        </p>
                    </div>
                </div>

                <div className="hidden lg:flex items-center gap-4 text-[10px] font-mono uppercase text-slate-400">
                    <span>Department: <strong className="text-white">{user?.department || 'N/A'}</strong></span>
                    <span>•</span>
                    <span>Roll: <strong className="text-amber-400">{user?.rollNo || 'N/A'}</strong></span>
                </div>
            </div>

            {/* 4. MAIN OPERATIONAL CONTAINER */}
            <div className="max-w-7xl mx-auto px-4 mt-6 w-full space-y-6">
                
                {errorMsg && (
                    <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-800" />
                        <span>{errorMsg}</span>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                        <span>{successMsg}</span>
                    </div>
                )}

                {/* STUDENT NAVIGATION TABS */}
                <div className="bg-white border border-slate-300 p-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs print:hidden">
                    <div className="flex flex-wrap gap-1">
                        <button 
                            onClick={() => handleTabSwitch('dashboard')} 
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <LayoutDashboard className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Candidate Dashboard
                        </button>
                        <button 
                            onClick={() => handleTabSwitch('ledger')} 
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'ledger' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <FileText className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            My Diet Ledger
                        </button>
                        <button 
                            onClick={() => handleTabSwitch('payments')} 
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'payments' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <CreditCard className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Fee Clearances
                        </button>
                        <button 
                            onClick={() => handleTabSwitch('complaints')} 
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'complaints' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <MessageSquareWarning className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Grievance Redressal
                        </button>
                        <button 
                            onClick={() => handleTabSwitch('notices')} 
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'notices' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <BellRing className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Campus Directives
                        </button>
                    </div>
                </div>

                {/* DYNAMIC VIEW ROUTER WITH PRO-LEVEL FULL-SCREEN TRANSITION LOADER */}
                <main className="min-h-[50vh]">
                    {isTransitioning ? (
                        <div className="flex flex-col items-center justify-center min-h-[50vh] bg-white border-2 border-slate-300 shadow-sm border-t-4 border-t-blue-950 w-full animate-in fade-in duration-200">
                            <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
                            <p className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-700">
                                {activeTab === 'dashboard' && 'Accessing Candidate Dashboard...'}
                                {activeTab === 'ledger' && 'Accessing Dietary Ledger...'}
                                {activeTab === 'payments' && 'Accessing Fee Clearance Records...'}
                                {activeTab === 'complaints' && 'Accessing Grievance Docket...'}
                                {activeTab === 'notices' && 'Accessing Statutory Directives...'}
                            </p>
                        </div>
                    ) : (
                        <div className="animate-in fade-in duration-300">
                            {activeTab === 'dashboard' && <StudentOverview user={user} />}
                            {activeTab === 'ledger' && <StudentLedger user={user} />}
                            {activeTab === 'payments' && <StudentPayments user={user} />}
                            {activeTab === 'complaints' && <StudentComplaints user={user} />}
                            {activeTab === 'notices' && <StudentNotices user={user} />}
                        </div>
                    )}
                </main>
            </div>

            {/* EDIT CANDIDATE PROFILE DOSSIER MODAL */}
            {isProfileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-sm shadow-2xl relative border-t-4 border-blue-950 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Candidate Dossier Settings</h3>
                            <button onClick={() => setIsProfileModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleProfileSubmit} className="p-6 pt-0 space-y-4">
                            <div className="flex flex-col items-center justify-center mb-4 border border-slate-300 p-4 bg-slate-50">
                                <div className="relative group cursor-pointer border-2 border-blue-950 p-1 bg-white">
                                    <div className="w-20 h-20 bg-slate-200 overflow-hidden flex items-center justify-center">
                                        {profileFormData.profilePhoto ? <img src={profileFormData.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-400" />}
                                    </div>
                                    <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImagePlus className="w-4 h-4 mb-0.5" /><span className="text-[8px] font-bold uppercase">Update Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Candidate Full Name</label>
                                <input required type="text" value={profileFormData.name} onChange={(e) => setProfileFormData({ ...profileFormData, name: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Mobile Protocol</label>
                                <input type="tel" maxLength="10" value={profileFormData.mobileNo} onChange={(e) => setProfileFormData({ ...profileFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Registered Email</label>
                                <input type="email" value={profileFormData.email} onChange={(e) => setProfileFormData({ ...profileFormData, email: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-medium outline-none focus:border-blue-950" />
                            </div>
                            <button type="submit" className="w-full mt-2 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-amber-500 active:scale-95">Commit Alterations</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}