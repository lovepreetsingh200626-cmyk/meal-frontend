import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { 
    Users, Search, Filter, Pencil, KeyRound, Trash2, 
    Printer, AlertCircle, CheckCircle2, Loader2, User as UserIcon, 
    Home, Mail, Phone, Check, ShieldCheck, Camera, ImagePlus, X, CreditCard, Lock
} from 'lucide-react';
import { UNIVERSITY_FACULTIES_HIERARCHY } from '../../data/coursesData';
import { ACADEMIC_SESSIONS } from '../../data/sessionsData';
import { INDIAN_STATES } from '../../data/statesData';
import { WORLD_COUNTRIES } from '../../data/countriesData';
import ConfirmModal from '../../components/ConfirmModal';

const ROLL_NUMBERS = Array.from({ length: 999 }, (_, i) => String(i + 1).padStart(3, '0'));

export default function AdminUsers() {
    const [usersList, setUsersList] = useState([]);
    const [paymentsList, setPaymentsList] = useState([]);
    const [mealsList, setMealsList] = useState([]);
    const [hostelsList, setHostelsList] = useState([]);

    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    
    // Password Override Custom Modal State
    const [passwordModal, setPasswordModal] = useState({ isOpen: false, targetId: null, targetName: '', newPassword: '' });

    // Edit User State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '', newRollNo: '', studentId: '', mobileNo: '', dob: '',
        gender: 'Male', hostelNo: 'BH1', university: '', department: '',
        session: '', category: 'General', email: '', fatherName: '', motherName: '', 
        facultyId: '', facultyName: '', domicileState: 'Punjab', nationality: 'India',
        profilePhoto: ''
    });

    const [adminAvailableDepartments, setAdminAvailableDepartments] = useState([]);
    const [adminAvailableProgrammes, setAdminAvailableProgrammes] = useState([]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resUsers, resPayments, resMeals, resHostels] = await Promise.all([
                API.get('/auth/users'),
                API.get('/payments/admin/all-payments'),
                API.get('/meals/all'),
                API.get('/hostels')
            ]);
            setUsersList(resUsers.data || []);
            setPaymentsList(resPayments.data || []);
            setMealsList(resMeals.data || []);
            setHostelsList(resHostels.data || []);
        } catch (err) {
            console.error(err);
            setErrorMsg('Failed to fetch directory data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

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

        if (matchingPayment) return { isPaid: true, paymentRecord: matchingPayment, fine: 0, statusLabel: 'PAID' };

        const deadlineDate = new Date(currentYear, currentMonth + 1, 15, 23, 59, 59);
        let fine = 0;
        if (now > deadlineDate) {
            const monthsOverdue = (now.getFullYear() - deadlineDate.getFullYear()) * 12 + (now.getMonth() - deadlineDate.getMonth()) + 1;
            fine = Math.max(1, monthsOverdue) * 10;
        }

        return { isPaid: false, paymentRecord: null, fine, statusLabel: 'UNPAID' };
    };

    const handleRecordDeskSettlement = (student) => {
        const baseCharge = (student.gender === 'Female' || student.category?.toLowerCase().includes('girl')) ? 1000 : 1100;
        const currentMonthPrefix = new Date().toISOString().substring(0, 7);
        const studentMeals = mealsList.filter(m => (m.userId === student._id || m.userId?._id === student._id) && m.date?.startsWith(currentMonthPrefix));
        const mealsCost = studentMeals.reduce((sum, m) => sum + (Number(m.dailyTotalCost) || 0), 0);
        const totalPayable = mealsCost > baseCharge ? baseCharge + mealsCost : baseCharge;

        setConfirmModal({
            isOpen: true,
            title: 'Authorize Treasury Clearance',
            message: `Certify physical desk payment remittance of ₹${totalPayable.toLocaleString()} for candidate ${student.name} (Roll: ${student.rollNo})?`,
            onConfirm: async () => {
                try {
                    const payload = {
                        userId: student._id, studentName: student.name, rollNo: student.rollNo, studentId: student.studentId || 'N/A',
                        hostelNo: student.hostelNo || 'BH1', receiptNo: `DESK/REC/${Math.floor(100000 + Math.random() * 900000)}`,
                        txnId: `CASH-DESK-${Date.now().toString().slice(-6)}`, paymentChannel: 'Physical Desk Cash Settlement',
                        amount: totalPayable, month: currentMonthPrefix, date: new Date().toLocaleString()
                    };
                    await API.post('/payments/record', payload);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg(`Treasury counter remittance recorded for ${student.name}.`);
                    setTimeout(() => setSuccessMsg(''), 4000);
                    const res = await API.get('/payments/admin/all-payments');
                    setPaymentsList(res.data);
                } catch (err) {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to commit treasury clearance to server.');
                    setTimeout(() => setErrorMsg(''), 4000);
                }
            }
        });
    };

    const promptRemoveStudent = (studentRef, targetName) => {
        const targetId = typeof studentRef === 'object' ? (studentRef?._id || studentRef?.id) : studentRef;
        setConfirmModal({
            isOpen: true,
            title: 'Permanent Expulsion & Record Purge',
            message: `Execute irreversible removal of candidate (${targetName}) from the institutional cooperative database?`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await API.delete(`/auth/users/${targetId}`);
                    setSuccessMsg(`Candidate record successfully purged.`); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setUsersList(prev => prev.filter(u => u._id !== targetId && u.id !== targetId));
                } catch (err) { 
                    setErrorMsg('Failed to purge student dossier.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
    };

    // Trigger Custom Password Override Modal
    const promptResetPassword = (studentRef, targetName) => {
        const targetId = typeof studentRef === 'object' ? (studentRef?._id || studentRef?.id) : studentRef;
        setPasswordModal({
            isOpen: true,
            targetId: targetId,
            targetName: targetName,
            newPassword: ''
        });
    };

    // Execute Password Override Submission
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        const { targetId, targetName, newPassword } = passwordModal;

        if (!newPassword || newPassword.trim().length < 8) {
            setErrorMsg('Security Policy: Key must meet minimum complexity length of 8 characters.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        try {
            const { data } = await API.put(`/auth/users/${targetId}/password`, { newPassword: newPassword.trim() });
            setSuccessMsg(data.message || `Authentication key overwritten successfully for (${targetName}).`); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setPasswordModal({ isOpen: false, targetId: null, targetName: '', newPassword: '' });
        } catch (err) { 
            setErrorMsg(err.response?.data?.message || 'Failed to update credentials.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const openEditModal = (student) => {
        setEditingUserId(student._id || student.id);
        let matchedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.name === student.facultyName || f.name === student.faculty);
        if (!matchedFac && student.department) {
            matchedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.departments.some(d => d.name === student.department));
        }
        const depts = matchedFac ? matchedFac.departments : [];
        setAdminAvailableDepartments(depts);

        let matchedDept = depts.find(d => d.name === student.department);
        const progs = matchedDept ? matchedDept.programmes : [];
        setAdminAvailableProgrammes(progs);

        const initNat = student.nationality || 'India';
        const initDom = student.domicileState || 'Punjab';
        const restrictCat = initNat !== 'India' || initDom !== 'Punjab';

        setEditFormData({ 
            name: student.name || '', newRollNo: student.rollNo || '', studentId: student.studentId || '', 
            mobileNo: student.mobileNo || '', dob: student.dob ? String(student.dob).split('T')[0] : '', 
            gender: student.gender || 'Male', hostelNo: student.hostelNo || 'BH1', university: student.university || '', 
            department: student.department || '', session: student.session || '', 
            category: restrictCat ? 'General' : (student.category || 'General'), 
            email: student.email || '', fatherName: student.fatherName || '', motherName: student.motherName || '', 
            facultyId: matchedFac ? matchedFac.id : '', facultyName: matchedFac ? matchedFac.name : (student.facultyName || student.faculty || ''), 
            domicileState: initDom, nationality: initNat,
            profilePhoto: student.profilePhoto || ''
        });
        setIsEditModalOpen(true);
    };

    const handleAdminFacultyChange = (fId) => {
        const selectedFac = UNIVERSITY_FACULTIES_HIERARCHY.find(f => f.id === fId);
        const depts = selectedFac ? selectedFac.departments : [];
        setAdminAvailableDepartments(depts);
        setAdminAvailableProgrammes([]);
        setEditFormData(prev => ({ ...prev, facultyId: fId, facultyName: selectedFac ? selectedFac.name : '', department: '', university: '' }));
    };

    const handleAdminDepartmentChange = (deptName) => {
        const matchedDept = adminAvailableDepartments.find(d => d.name === deptName);
        const progs = matchedDept ? matchedDept.programmes : [];
        setAdminAvailableProgrammes(progs);
        setEditFormData(prev => ({ ...prev, department: deptName, university: '' }));
    };

    const handlePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setErrorMsg('Statutory Upload Error: File must be an official image document.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_DIMENSION = 400;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height *= MAX_DIMENSION / width;
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width *= MAX_DIMENSION / height;
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
                setEditFormData(prev => ({ ...prev, profilePhoto: compressedBase64 }));
            };
        };
        reader.readAsDataURL(file);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/auth/users/${editingUserId}`, editFormData);
            setSuccessMsg('Candidate academic dossier amended successfully.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.map(u => (u._id === editingUserId || u.id === editingUserId) ? data.user : u));
            setIsEditModalOpen(false); 
        } catch (err) { 
            setErrorMsg(err.response?.data?.message || 'Failed to commit academic updates.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const handleRevokeSettlement = (paymentRef, studentName) => {
        const paymentId = typeof paymentRef === 'object' ? (paymentRef?._id || paymentRef?.id) : paymentRef;
        if (!paymentId) return;

        setConfirmModal({
            isOpen: true,
            title: 'Revoke Financial Clearance',
            message: `Confirm revocation of statutory clearance voucher for (${studentName})? Status will reset to UNPAID.`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    await API.delete(`/payments/${paymentId}`).catch(() => API.delete(`/payments/admin/${paymentId}`)).catch(() => API.delete(`/payments/record/${paymentId}`));
                    setSuccessMsg(`Clearance voucher purged. ${studentName} reverted to UNPAID status.`);
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setPaymentsList(prev => prev.filter(p => p._id !== paymentId && p.id !== paymentId));
                } catch (err) {
                    setErrorMsg('Failed to revoke clearance voucher from ledger.');
                    setTimeout(() => setErrorMsg(''), 4000);
                }
            }
        });
    };

    const filteredUsers = useMemo(() => {
        return usersList.filter(u => {
            const matchesSearch = (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
                                  (u.rollNo && u.rollNo.toString().includes(searchTerm)) || 
                                  (u.studentId && u.studentId.includes(searchTerm));
            const matchesHostel = selectedHostelFilter === 'ALL' || u.hostelNo === selectedHostelFilter;
            return matchesSearch && matchesHostel;
        }).sort((a, b) => (Number(a.rollNo) || 0) - (Number(b.rollNo) || 0));
    }, [usersList, searchTerm, selectedHostelFilter]);

    const isGeneralRestricted = editFormData.nationality !== 'India' || editFormData.domicileState !== 'Punjab';

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* NOTIFICATION BANNERS */}
            {errorMsg && (
                <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span>
                </div>
            )}
            {successMsg && (
                <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3 print:hidden shadow-xs">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span>
                </div>
            )}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                            <Users className="w-4 h-4 text-amber-600" /> Statutory Member Roll &amp; Residential Directory
                        </h2>
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5 mt-1 inline-block">
                            {filteredUsers.length} Certified Records
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" placeholder="Search Roll, ID, Name..." 
                                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
                                className="bg-slate-50 border border-slate-300 px-2 py-1.5 pl-8 text-[11px] font-bold uppercase text-slate-900 focus:outline-none focus:border-blue-950 w-full md:w-44" 
                            />
                        </div>
                        <div className="flex items-center bg-slate-50 border border-slate-300 px-2 py-1.5 flex-1 md:flex-none">
                            <Filter className="w-3 h-3 text-slate-500 mr-1.5" />
                            <select 
                                value={selectedHostelFilter} onChange={(e) => setSelectedHostelFilter(e.target.value)} 
                                className="bg-transparent text-[10px] w-full font-black uppercase text-slate-800 focus:outline-none cursor-pointer"
                            >
                                <option value="ALL">ALL RESIDENCES</option>
                                {hostelsList.map(h => <option key={h._id} value={h.hostelNumber}>{h.hostelNumber}</option>)}
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-blue-950">
                            <Loader2 className="w-7 h-7 animate-spin mb-2" />
                            <p className="text-[11px] font-mono font-bold uppercase tracking-wider">Accessing Directory Archives...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse text-xs">
                            <thead className="bg-slate-900 text-white sticky top-0 border-b-2 border-slate-950 z-10 select-none">
                                <tr className="uppercase font-black text-[10px] tracking-wider">
                                    <th className="p-3 border-r border-slate-800 w-16 text-center">Roll</th>
                                    <th className="p-3 border-r border-slate-800">Candidate Dossier</th>
                                    <th className="p-3 border-r border-slate-800">Academic Particulars</th>
                                    <th className="p-3 border-r border-slate-800 w-24 text-center">Residence</th>
                                    <th className="p-3 border-r border-slate-800">Contact Protocol</th>
                                    <th className="p-3 border-r border-slate-800 text-center w-52">Statutory Fee Clearance Status</th>
                                    <th className="p-3 text-right print:hidden">Executive Commands</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 font-medium">
                                {filteredUsers.length === 0 ? (
                                    <tr><td colSpan="7" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No matching candidate records found.</td></tr>
                                ) : (
                                    filteredUsers.map((u) => {
                                        const feeStatus = calculateMemberFeeStatus(u);
                                        return (
                                            <tr key={u._id} className="hover:bg-slate-50/80 transition">
                                                <td className="p-3 border-r border-slate-200 text-center font-black text-blue-950 font-mono text-sm">{u.rollNo}</td>
                                                <td className="p-3 border-r border-slate-200">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                                            {u.profilePhoto ? <img src={u.profilePhoto} alt="Student" className="w-full h-full object-cover" /> : <UserIcon className="w-4 h-4 text-slate-400" />}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-blue-950 uppercase tracking-tight font-serif">{u.name}</div>
                                                            <div className="text-[9px] text-slate-500 font-mono font-bold uppercase">{u.studentId ? `ID: ${u.studentId}` : 'NO ID'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 uppercase">
                                                    <div className="font-bold text-slate-900 text-[11px]">{u.university || 'Course Enrolled'}</div>
                                                    <div className="text-[9px] text-slate-500 font-medium">{u.department || 'N/A'} • {u.session || 'N/A'} • <span className="text-amber-800 font-bold">{u.category || 'General'}</span></div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 text-center">
                                                    <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-[9px] font-black uppercase text-slate-800 font-mono">{u.hostelNo}</span>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 font-bold text-slate-700">
                                                    <div>+91 {u.mobileNo || 'N/A'}</div>
                                                    <div className="text-[9px] text-slate-500 font-normal lowercase">{u.email || ''}</div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 text-center">
                                                    {feeStatus.isPaid ? (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                                CLEARANCE RATIFIED
                                                            </span>
                                                            <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">
                                                                {feeStatus.paymentRecord?.paymentChannel?.includes('Desk') ? 'Treasury Cash Counter' : 'Digital Gateway Clearance'}
                                                            </span>
                                                            <button 
                                                                onClick={() => handleRevokeSettlement(feeStatus.paymentRecord, u.name)} 
                                                                className="mt-0.5 flex items-center gap-1 bg-white hover:bg-red-50 text-slate-500 hover:text-red-700 border border-slate-300 hover:border-red-300 px-2 py-1 text-[8px] font-black uppercase tracking-wider transition cursor-pointer active:scale-95 shadow-xs"
                                                                title="Revoke and set to UNPAID"
                                                            >
                                                                <X className="w-2.5 h-2.5" />
                                                                <span>Revoke to Unpaid</span>
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-1.5">
                                                            <span className="bg-red-50 text-red-900 border border-red-300 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                                                                <AlertCircle className="w-3 h-3 text-red-600" />
                                                                DUES OUTSTANDING
                                                            </span>
                                                            {feeStatus.fine > 0 && <span className="text-[8px] font-black text-red-700 bg-red-50 border border-red-200 px-1 py-0.2">Statutory Fine: +₹{feeStatus.fine}</span>}
                                                            <button 
                                                                onClick={() => handleRecordDeskSettlement(u)} 
                                                                className="mt-0.5 flex items-center gap-1.5 bg-blue-950 hover:bg-blue-900 text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest transition cursor-pointer border-b-2 border-amber-500 active:scale-95 shadow-xs"
                                                                title="Mark as PAID via Desk Settlement"
                                                            >
                                                                <CreditCard className="w-3 h-3 text-amber-400" />
                                                                <span>Mark as Paid</span>
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right print:hidden">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <button onClick={() => openEditModal(u)} className="p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer" title="Amend Candidate Record"><Pencil className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => promptResetPassword(u, u.name)} className="p-1.5 border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-600 hover:text-white transition cursor-pointer" title="Overwrite Authentication Key"><KeyRound className="w-3.5 h-3.5" /></button>
                                                        <button onClick={() => promptRemoveStudent(u, u.name)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer" title="Expel from Cooperative Registry"><Trash2 className="w-3.5 h-3.5" /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* EDIT USER MODAL - FULL PROFILE CONTROL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-2xl shadow-2xl relative border-t-4 border-amber-600 max-h-[90vh] flex flex-col rounded-xs">
                        
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Amend Candidate Academic Dossier</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-tight">Statutory Administrative Override</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-4 h-4" /></button>
                        </div>
                        
                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                            
                            {/* PHOTO UPLOAD BLOCK */}
                            <div className="flex flex-col items-center justify-center mb-4 border border-slate-300 p-4 bg-slate-50">
                                <div className="relative group cursor-pointer border-2 border-blue-950 p-1 bg-white shadow-sm">
                                    <div className="w-20 h-20 bg-slate-200 overflow-hidden flex items-center justify-center">
                                        {editFormData.profilePhoto ? <img src={editFormData.profilePhoto} alt="" className="w-full h-full object-cover" /> : <UserIcon className="w-8 h-8 text-slate-400" />}
                                    </div>
                                    <label className="absolute inset-0 bg-black/60 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <ImagePlus className="w-4 h-4 mb-0.5" /><span className="text-[8px] font-bold uppercase text-center leading-tight">Update<br/>Photo</span>
                                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                                    </label>
                                </div>
                                <p className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-2 tracking-widest">Auto-Compressing Registry Upload</p>
                            </div>

                            {/* PERSONAL DETAILS */}
                            <div className="border border-slate-300 p-4 space-y-3">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Candidate Full Name</label>
                                    <input required type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Father's Name</label>
                                        <input required type="text" value={editFormData.fatherName} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Mother's Name</label>
                                        <input required type="text" value={editFormData.motherName} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Date of Birth</label>
                                        <input required type="date" value={editFormData.dob} onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950 cursor-pointer" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Gender</label>
                                        <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Nationality</label>
                                        <select 
                                            value={editFormData.nationality} 
                                            onChange={(e) => {
                                                const nat = e.target.value;
                                                const restrict = nat !== 'India' || editFormData.domicileState !== 'Punjab';
                                                setEditFormData({ ...editFormData, nationality: nat, category: restrict ? 'General' : editFormData.category });
                                            }} 
                                            className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer"
                                        >
                                            {WORLD_COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* CONTACT DETAILS */}
                            <div className="border border-slate-300 p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Registered Email</label>
                                        <input required type="email" value={editFormData.email} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-medium outline-none focus:border-blue-950" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Mobile Protocol</label>
                                        <input required type="tel" maxLength="10" value={editFormData.mobileNo} onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" />
                                    </div>
                                </div>
                            </div>

                            {/* ACADEMIC DETAILS */}
                            <div className="border border-slate-300 p-4 space-y-3 bg-slate-50">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Campus Roll Number</label>
                                        <select
                                            required
                                            value={editFormData.newRollNo}
                                            onChange={(e) => setEditFormData({ ...editFormData, newRollNo: e.target.value })}
                                            className="w-full bg-white border border-slate-400 p-2 text-xs font-mono font-bold uppercase outline-none focus:border-blue-950 cursor-pointer"
                                        >
                                            <option value="">-- SELECT ROLL (001-999) --</option>
                                            {ROLL_NUMBERS.map(num => (
                                                <option key={num} value={num}>{num}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Statutory Student ID</label>
                                        <input required type="text" value={editFormData.studentId} onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" />
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">1. Faculty Jurisdiction</label>
                                    <select value={editFormData.facultyId} onChange={e => handleAdminFacultyChange(e.target.value)} className="w-full bg-white border border-slate-400 p-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                        <option value="">-- SELECT FACULTY --</option>
                                        {UNIVERSITY_FACULTIES_HIERARCHY.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">2. Department Branch</label>
                                    <select disabled={!editFormData.facultyId} value={editFormData.department} onChange={e => handleAdminDepartmentChange(e.target.value)} className="w-full bg-white border border-slate-400 p-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                        <option value="">{editFormData.facultyId ? '-- SELECT DEPT --' : '-- FIRST CHOOSE FACULTY --'}</option>
                                        {adminAvailableDepartments.map((d,i) => <option key={i} value={d.name}>{d.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">3. Degree Programme</label>
                                    <select disabled={!editFormData.department} value={editFormData.university} onChange={e => setEditFormData({ ...editFormData, university: e.target.value })} className="w-full bg-white border border-slate-400 p-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                        <option value="">{editFormData.department ? '-- SELECT COURSE --' : '-- FIRST CHOOSE DEPT --'}</option>
                                        {adminAvailableProgrammes.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Academic Session</label>
                                    <select required value={editFormData.session} onChange={(e) => setEditFormData({ ...editFormData, session: e.target.value })} className="w-full bg-white border border-slate-400 p-2 text-xs font-mono font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                        <option value="">-- SELECT SESSION --</option>
                                        {ACADEMIC_SESSIONS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* RESIDENTIAL & SOCIAL */}
                            <div className="border border-slate-300 p-4 space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Residence Hall</label>
                                        <select value={editFormData.hostelNo} onChange={(e) => setEditFormData({ ...editFormData, hostelNo: e.target.value })} className="w-full bg-white border border-slate-400 p-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                            {hostelsList.map(h => <option key={h._id} value={h.hostelNumber}>{h.hostelNumber}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">State of Domicile</label>
                                        <select required value={editFormData.domicileState} onChange={(e) => {
                                            const state = e.target.value;
                                            const restrict = editFormData.nationality !== 'India' || state !== 'Punjab';
                                            setEditFormData({ ...editFormData, domicileState: state, category: restrict ? 'General' : editFormData.category });
                                        }} className="w-full bg-white border border-slate-400 p-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                            {INDIAN_STATES.map(st => <option key={st} value={st}>{st}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Social Category</label>
                                    <select value={editFormData.category} disabled={isGeneralRestricted} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} className={`w-full p-2 text-xs font-bold uppercase outline-none border cursor-pointer ${isGeneralRestricted ? 'bg-slate-100 border-slate-300 text-slate-500' : 'bg-white border-slate-400 focus:border-blue-950 text-slate-900'}`}>
                                        <option value="General">General</option>
                                        <option value="SC">SC</option>
                                        <option value="BC">BC</option>
                                        <option value="OBC">OBC</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {isGeneralRestricted && <p className="text-[8px] font-bold text-amber-800 mt-1 uppercase font-mono tracking-tight">* Non-Punjab or International candidates are classified as General</p>}
                                </div>
                            </div>

                            <button type="submit" className="w-full mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-3 text-[10px] uppercase tracking-widest cursor-pointer transition border-b-2 border-emerald-950 active:scale-95 shadow-sm">
                                Commit Statutory Amendments &amp; Registry Update
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CUSTOM PASSWORD OVERRIDE MODAL */}
            {passwordModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-sm shadow-2xl relative border-t-4 border-amber-600 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Overwrite Authentication Key</h3>
                                <p className="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-tight">Candidate: {passwordModal.targetName}</p>
                            </div>
                            <button onClick={() => setPasswordModal({ isOpen: false, targetId: null, targetName: '', newPassword: '' })} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handlePasswordSubmit} className="p-6 pt-0 space-y-4">
                            <div className="bg-amber-50 border border-amber-300 p-3 text-[10px] font-bold uppercase text-amber-950 tracking-wide">
                                Administrative Directive: Enter new secure password (minimum 8 characters).
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">New Authentication Key <span className="text-red-700">*</span></label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                                    <input 
                                        required 
                                        type="password" 
                                        placeholder="••••••••" 
                                        minLength={8}
                                        value={passwordModal.newPassword} 
                                        onChange={(e) => setPasswordModal({ ...passwordModal, newPassword: e.target.value })} 
                                        className="w-full bg-white border border-slate-400 pl-9 pr-3 py-2 text-xs font-bold outline-none focus:border-blue-950" 
                                    />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-2 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-amber-500 active:scale-95 cursor-pointer">
                                Ratify New Key
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* CONFIRMATION MODAL */}
            {confirmModal.isOpen && (
                <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />
            )}
        </div>
    );
}