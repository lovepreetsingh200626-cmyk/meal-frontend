import React, { useState, useEffect, useMemo } from 'react';
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
    BookOpen, Layers, CreditCard, Receipt, Compass, Globe, MapPin, Check,
    Landmark, ShieldAlert, Award, FileCheck2, ChevronRight, Lock, Clock, LayoutDashboard,
    RotateCcw
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

    const [activeTab, setActiveTab] = useState('dashboard'); 
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    // Printable Receipt Voucher Modal State
    const [receiptModalData, setReceiptModalData] = useState(null);

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

    // Cascading dropdown states for Edit Modal
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
        fetchUsers(); 
        fetchAllMeals(); 
        fetchAdmins(); 
        fetchComplaints(); 
        fetchNotices(); 
        fetchHostels(); 
        fetchPayments();
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

    // Lookup Student ID from Member Directory (usersList)
    const getStudentIdFromRoster = (payment) => {
        if (payment?.studentId && payment.studentId !== 'N/A') return payment.studentId;
        const matchedUser = usersList.find(u => {
            const idMatch = (payment.userId && (u._id === payment.userId || u._id === payment.userId?._id || u.id === payment.userId));
            const rollMatch = (payment.rollNo && u.rollNo && String(u.rollNo).trim() === String(payment.rollNo).trim());
            return idMatch || rollMatch;
        });
        return matchedUser?.studentId || payment.userId?.studentId || 'N/A';
    };

    const formatLogTime = (rec) => {
        if (rec?.time) return rec.time;
        const rawTimestamp = rec?.createdAt || rec?.updatedAt;
        if (!rawTimestamp) return null;
        try {
            const parsed = new Date(rawTimestamp);
            if (isNaN(parsed.getTime())) return null;
            return parsed.toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
            });
        } catch {
            return null;
        }
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
        
        const studentMeals = mealsList.filter(m => {
            const matchUser = m.userId === student._id || m.userId?._id === student._id;
            return matchUser && m.date && m.date.startsWith(currentMonthPrefix);
        });
        const mealsCost = studentMeals.reduce((sum, m) => sum + (Number(m.dailyTotalCost) || 0), 0);
        const totalPayable = mealsCost > baseCharge ? baseCharge + mealsCost : baseCharge;

        setConfirmModal({
            isOpen: true,
            title: 'Authorize Treasury Counter Clearance',
            message: `Certify physical desk payment remittance of ₹${totalPayable.toLocaleString()} for candidate ${student.name} (Roll: ${student.rollNo})? This commits clearance to the statutory ledger.`,
            onConfirm: async () => {
                try {
                    const payload = {
                        userId: student._id,
                        studentName: student.name,
                        rollNo: student.rollNo,
                        studentId: student.studentId || 'N/A',
                        hostelNo: student.hostelNo || 'BH1',
                        receiptNo: `DESK/REC/${Math.floor(100000 + Math.random() * 900000)}`,
                        txnId: `CASH-DESK-${Date.now().toString().slice(-6)}`,
                        paymentChannel: 'Physical Desk Cash Settlement',
                        amount: totalPayable,
                        month: currentMonthPrefix,
                        date: new Date().toLocaleString()
                    };
                    await API.post('/payments/record', payload);
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg(`Treasury counter remittance recorded for ${student.name}. Certified as PAID.`);
                    setTimeout(() => setSuccessMsg(''), 4000);
                    fetchPayments();
                } catch (err) {
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to commit treasury clearance to server.');
                    setTimeout(() => setErrorMsg(''), 4000);
                }
            }
        });
    };

    // REVOKE SETTLEMENT / RESET TO UNPAID
    const handleRevokeSettlement = (paymentRef, studentName) => {
        const paymentId = typeof paymentRef === 'object' ? (paymentRef?._id || paymentRef?.id) : paymentRef;
        
        if (!paymentId) {
            setErrorMsg('Reference Error: Unable to extract valid voucher ID.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Revoke Financial Clearance / Revert to Unpaid',
            message: `Confirm revocation of statutory clearance voucher for candidate (${studentName})? The transaction token will be deleted and status reset to UNPAID.`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    let deleted = false;
                    try {
                        await API.delete(`/payments/${paymentId}`);
                        deleted = true;
                    } catch (err1) {
                        if (err1.response?.status === 404) {
                            try {
                                await API.delete(`/payments/admin/${paymentId}`);
                                deleted = true;
                            } catch (err2) {
                                await API.delete(`/payments/record/${paymentId}`);
                                deleted = true;
                            }
                        } else {
                            throw err1;
                        }
                    }

                    if (deleted) {
                        setSuccessMsg(`Clearance voucher purged. ${studentName} reverted to UNPAID status.`);
                        setTimeout(() => setSuccessMsg(''), 4000);
                        setPaymentsList(prev => prev.filter(p => p._id !== paymentId && p.id !== paymentId));
                        await fetchPayments();
                    }
                } catch (err) {
                    setErrorMsg(err.response?.data?.message || 'Failed to revoke clearance voucher from ledger.');
                    setTimeout(() => setErrorMsg(''), 4000);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    // PERMANENT STUDENT EXPULSION
    const promptRemoveStudent = (studentRef, targetName) => {
        const targetId = typeof studentRef === 'object' ? (studentRef?._id || studentRef?.id) : studentRef;

        if (!targetId) {
            setErrorMsg('Registry Error: Missing candidate primary identifier.');
            setTimeout(() => setErrorMsg(''), 4000);
            return;
        }

        setConfirmModal({
            isOpen: true,
            title: 'Permanent Expulsion & Record Purge',
            message: `Execute irreversible removal of candidate (${targetName}) from the institutional cooperative database? All associated registry logs will be archived.`,
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                setLoading(true);
                try {
                    try {
                        await API.delete(`/auth/users/${targetId}`);
                    } catch (err1) {
                        if (err1.response?.status === 404) {
                            await API.delete(`/auth/user/${targetId}`);
                        } else {
                            throw err1;
                        }
                    }
                    setSuccessMsg(`Candidate record successfully purged from institutional registry.`); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setUsersList(prev => prev.filter(u => u._id !== targetId && u.id !== targetId));
                    await fetchUsers();
                } catch (err) { 
                    setErrorMsg(err.response?.data?.message || 'Failed to purge student dossier.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleResetPassword = async (studentRef, targetName) => {
        const targetId = typeof studentRef === 'object' ? (studentRef?._id || studentRef?.id) : studentRef;
        const newPassword = window.prompt(`Administrative Override: Enter updated authentication key (min. 8 chars) for (${targetName}):`);
        if (newPassword === null) return;
        if (newPassword.trim().length < 8) return alert('Security Policy: Key must meet minimum complexity length of 8 characters.');
        try {
            const { data } = await API.put(`/auth/users/${targetId}/password`, { newPassword: newPassword.trim() });
            setSuccessMsg(data.message || 'Authentication key overwritten successfully.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
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

        setEditFormData({ 
            name: student.name || '', 
            newRollNo: student.rollNo || '', 
            studentId: student.studentId || '', 
            mobileNo: student.mobileNo || '', 
            dob: student.dob ? String(student.dob).split('T')[0] : '', 
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
            setSuccessMsg('Candidate academic dossier amended successfully in cooperative registry.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setUsersList(prev => prev.map(u => (u._id === editingUserId || u.id === editingUserId) ? data.user : u));
            setIsEditModalOpen(false); 
            fetchUsers();
        } catch (err) { 
            setErrorMsg(err.response?.data?.message || 'Failed to commit academic updates.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const openAdminEditModal = (adminAccount) => {
        setEditingAdmin(adminAccount);
        setAdminEditFormData({ 
            name: adminAccount.name || '', 
            mobileNo: adminAccount.mobileNo || '', 
            dob: adminAccount.dob ? String(adminAccount.dob).split('T')[0] : '', 
            profilePhoto: adminAccount.profilePhoto || '' 
        });
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
            setSuccessMsg('Executive credentials and profile dossier ratified successfully.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setAdminsList(prev => prev.map(a => a._id === editingAdmin._id ? data.admin : a));
            if (user && editingAdmin._id === user._id && onUpdateUser) onUpdateUser(data.admin);
            setIsAdminEditModalOpen(false);
        } catch (err) { 
            setErrorMsg('Failed to commit executive profile alterations.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const promptRemoveAdmin = (adminId, adminName) => {
        if (adminId === user._id) return alert('Security Policy: Revocation of active supervisory session credentials is self-prohibited.');
        setConfirmModal({
            isOpen: true,
            title: 'Revoke Executive Committee Clearance',
            message: `Execute withdrawal of administrative privileges and credentials for official (${adminName})?`,
            onConfirm: async () => {
                try {
                    await API.delete(`/auth/admins/${adminId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg('Administrative clearance revoked. Officer purged from magistracy.'); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setAdminsList(prev => prev.filter(a => a._id !== adminId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to revoke administrative commission.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                }
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
            setSuccessMsg('Ledger entry amended under Executive Authority Decree.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setMealsList(prev => prev.map(m => m._id === editingMeal._id ? data.meal : m)); 
            setIsMealEditModalOpen(false);
        } catch (err) { 
            setErrorMsg(err.response?.data?.message || 'Failed to commit ledger correction.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const promptRemoveMealLog = (mealId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Purge Statutory Diet Ledger Record',
            message: 'Permanently expunge this daily attendance and dietary consumption record from the central audit ledger?',
            onConfirm: async () => {
                try {
                    await API.delete(`/meals/${mealId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg('Diet ledger entry purged successfully.'); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setMealsList(prev => prev.filter(m => m._id !== mealId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to purge dietary record.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
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
            setSuccessMsg('Grievance adjudication and committee finding recorded.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setComplaintsList(prev => prev.map(c => c._id === activeComplaint._id ? data.complaint : c)); 
            setIsComplaintModalOpen(false);
        } catch (err) { 
            setErrorMsg('Failed to update grievance disposition.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const promptDeleteComplaint = (cId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Dismiss & Archive Grievance Filing',
            message: 'Purge this grievance case file from the active redressal docket?',
            onConfirm: async () => {
                try {
                    await API.delete(`/complaints/${cId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg('Grievance filing purged from active docket.'); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setComplaintsList(prev => prev.filter(c => c._id !== cId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to dismiss grievance record.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
    };

    const handleNoticeSubmit = async (e) => {
        e.preventDefault(); 
        if (!noticeTitle.trim() || !noticeContent.trim()) return;
        setPostingNotice(true);
        try {
            const { data } = await API.post('/notices', { 
                title: noticeTitle.trim(), 
                content: noticeContent.trim(), 
                hostelNo: noticeHostel, 
                postedBy: user.name || 'Executive Committee Authority' 
            });
            setSuccessMsg('Executive directive promulgated and broadcasted across campus.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            setNoticeTitle(''); 
            setNoticeContent(''); 
            setNoticesList(prev => [data.notice, ...prev]);
        } catch (err) { 
            setErrorMsg('Failed to promulgate directive.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        } finally { 
            setPostingNotice(false); 
        }
    };

    const promptDeleteNotice = (noticeId) => {
        setConfirmModal({
            isOpen: true,
            title: 'Rescind Executive Directive',
            message: 'Officially revoke and withdraw this public decree from the student cooperative notice board?',
            onConfirm: async () => {
                try {
                    await API.delete(`/notices/${noticeId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setSuccessMsg('Executive directive rescinded successfully.'); 
                    setTimeout(() => setSuccessMsg(''), 4000);
                    setNoticesList(prev => prev.filter(n => n._id !== noticeId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                    setErrorMsg('Failed to rescind notice directive.'); 
                    setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
    };

    const handleUpdateRates = async (e) => {
        e.preventDefault();
        try {
            await API.put(`/hostels/${targetHostelId}/rates`, { mealCosts: dietRates });
            setSuccessMsg('Statutory tariff schedule promulgated and enforced across jurisdiction.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            fetchHostels(); 
        } catch (err) { 
            setErrorMsg('Failed to promulgate tariff rate schedule.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const handleExportLedger = () => {
        if (filteredMeals.length === 0) {
            alert("Administrative Notice: No ledger records available under the active jurisdictional criteria.");
            return;
        }

        const exportData = filteredMeals.map(m => ({
            "Audit Date": m.date,
            "Log Time": formatLogTime(m) || 'N/A',
            "Candidate Full Name": m.userId?.name || 'N/A',
            "Hostel Roll Number": m.userId?.rollNo || 'N/A',
            "Statutory Student ID": m.userId?.studentId || 'N/A',
            "Jurisdiction Residence": m.hostelId?.hostelNumber || m.hostelNo || 'N/A',
            "Breakfast Authorized": m.meals?.breakfast ? 'YES' : 'NO',
            "Lunch Authorized": m.meals?.lunch ? 'YES' : 'NO',
            "Dinner Authorized": m.meals?.dinner ? 'YES' : 'NO',
            "Approved Consumable Extras": m.extras?.length > 0 ? m.extras.map(e => `${e.itemName} (INR ${e.cost})`).join('; ') : 'NIL',
            "Audited Net Amount (INR)": m.dailyTotalCost || 0
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Statutory_Ledger_Audit");
        
        XLSX.writeFile(workbook, `Statutory_Mess_Ledger_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
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

    const filteredMeals = useMemo(() => {
        return mealsList.filter(m => selectedHostelFilter === 'ALL' || m.hostelId?.hostelNumber === selectedHostelFilter || m.hostelNo === selectedHostelFilter);
    }, [mealsList, selectedHostelFilter]);

    const filteredAdmins = useMemo(() => {
        return adminsList.filter(a => a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [adminsList, searchTerm]);

    const filteredComplaints = useMemo(() => {
        return complaintsList.filter(c => selectedHostelFilter === 'ALL' || c.hostelNo === selectedHostelFilter);
    }, [complaintsList, selectedHostelFilter]);

    const filteredPayments = useMemo(() => {
        return paymentsList.filter(p => selectedHostelFilter === 'ALL' || p.hostelNo === selectedHostelFilter);
    }, [paymentsList, selectedHostelFilter]);

    const totalCampusRevenue = useMemo(() => {
        return filteredMeals.reduce((sum, m) => sum + (m.dailyTotalCost || 0), 0);
    }, [filteredMeals]);

    const totalFeeCollected = useMemo(() => {
        return filteredPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
    }, [filteredPayments]);

    const handlePrintReport = () => window.print();

    const chartData = useMemo(() => {
        const revenueByDate = filteredMeals.reduce((acc, curr) => {
            acc[curr.date] = (acc[curr.date] || 0) + (curr.dailyTotalCost || 0);
            return acc;
        }, {});
        return Object.keys(revenueByDate).sort().map(date => ({ date, revenue: revenueByDate[date] })).slice(-30);
    }, [filteredMeals]);

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

            {/* 2. EXECUTIVE COMPLIANCE HEADER WITH AUTHENTIC COUNCIL EMBLEM */}
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

                {/* Session Synchronizer & Termination Strip */}
                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
                    <button 
                        onClick={() => { fetchUsers(); fetchAllMeals(); fetchAdmins(); fetchComplaints(); fetchNotices(); fetchHostels(); fetchPayments(); }} 
                        className="flex items-center gap-1.5 text-[10px] font-black bg-slate-100 border border-slate-300 px-3 py-2 uppercase tracking-wider text-slate-800 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
                        title="Resynchronize all statutory records with database"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-950' : ''}`} /> 
                        <span className="hidden sm:inline">Sync Registry</span>
                    </button>
                    <button 
                        onClick={onLogout} 
                        className="flex items-center gap-1.5 text-[10px] font-black bg-red-800 hover:bg-red-900 text-white border border-red-950 px-3.5 py-2 uppercase tracking-widest transition cursor-pointer shadow-xs active:scale-95"
                    >
                        <LogOut className="w-3.5 h-3.5" /> 
                        <span>Terminate Session</span>
                    </button>
                </div>
            </header>

            {/* 3. SUPERVISORY OFFICER IDENTIFIER STRIP */}
            <div className="bg-slate-900 text-white px-4 md:px-8 py-2.5 flex items-center justify-between border-b border-slate-800 z-30 print:hidden">
                <div 
                    onClick={() => openAdminEditModal(user)} 
                    className="flex items-center gap-3 cursor-pointer hover:bg-slate-800/80 px-2 py-1 rounded-xs transition"
                    title="Edit Official Credentials & Portrait"
                >
                    <div className="w-8 h-8 bg-blue-950 text-amber-400 font-bold flex items-center justify-center border border-amber-600/50 overflow-hidden shrink-0">
                        {user.profilePhoto ? <img src={user.profilePhoto} alt="Admin" className="w-full h-full object-cover" /> : <Award className="w-4 h-4" />}
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-black text-white text-xs uppercase tracking-wide font-serif">{user.name || 'Executive Officer'}</h3>
                            <span className="text-[8px] font-black uppercase bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-xs">Verified</span>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Chief Warden &amp; Executive Secretary • Statutory Clearance Desk
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
                
                {/* NOTIFICATION BANNERS */}
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

                {/* STATUTORY NAVIGATION TABS & JURISDICTION CONTROLS */}
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
                            Member Directory ({usersList.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('admins')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'admins' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <ShieldCheck className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Council Officers ({adminsList.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('meals')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'meals' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <FileText className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Master Ledger ({mealsList.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('payments')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'payments' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <CreditCard className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Fee Clearances ({paymentsList.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('complaints')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'complaints' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <MessageSquareWarning className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Grievance Docket ({complaintsList.filter(c => c.status === 'Pending').length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('notices')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'notices' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <BellRing className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Directives ({noticesList.length})
                        </button>
                        <button 
                            onClick={() => setActiveTab('settings')} 
                            className={`px-3.5 py-2 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-blue-950 text-white border-b-2 border-amber-500 shadow-xs' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                        >
                            <Settings className="w-3 h-3 inline-block mr-1.5 mb-0.5" /> 
                            Statutory Tariffs
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search Roll, ID, Name..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)} 
                                className="bg-slate-50 border border-slate-300 px-2 py-1.5 pl-8 text-[11px] font-bold uppercase text-slate-900 focus:outline-none focus:border-blue-950 w-44" 
                            />
                        </div>

                        {/* Jurisdictional Residence Filter */}
                        {activeTab !== 'admins' && activeTab !== 'notices' && activeTab !== 'settings' && (
                            <div className="flex items-center bg-slate-50 border border-slate-300 px-2 py-1.5">
                                <Filter className="w-3 h-3 text-slate-500 mr-1.5" />
                                <select 
                                    value={selectedHostelFilter} 
                                    onChange={(e) => setSelectedHostelFilter(e.target.value)} 
                                    className="bg-transparent text-[10px] font-black uppercase text-slate-800 focus:outline-none cursor-pointer"
                                >
                                    <option value="ALL">ALL RESIDENCES</option>
                                    <option value="BH1">BH1 (BOYS 1)</option><option value="BH2">BH2 (BOYS 2)</option><option value="BH3">BH3 (BOYS 3)</option>
                                    <option value="GH1">GH1 (GIRLS 1)</option><option value="GH2">GH2 (GIRLS 2)</option><option value="GH3">GH3 (GIRLS 3)</option><option value="GH4">GH4 (GIRLS 4)</option>
                                </select>
                            </div>
                        )}

                        {/* Export & Print */}
                        <button 
                            onClick={handleExportLedger} 
                            className="flex items-center gap-1.5 text-[10px] font-black bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-950 px-3 py-1.5 uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-95"
                        >
                            <Download className="w-3 h-3" /> Export Excel
                        </button>
                        <button 
                            onClick={handlePrintReport} 
                            className="flex items-center gap-1.5 text-[10px] font-black bg-slate-800 hover:bg-slate-900 text-white border border-black px-3 py-1.5 uppercase tracking-wider transition cursor-pointer shadow-xs active:scale-95"
                        >
                            <Printer className="w-3 h-3" /> Print
                        </button>
                    </div>
                </div>

                {/* ========================================================================= */}
                {/* 5. TAB 0: EXECUTIVE DASHBOARD OVERVIEW                                    */}
                {/* ========================================================================= */}
                {activeTab === 'dashboard' && (
                    <div className="space-y-6">
                        
                        {/* 5-Column Institutional KPI Metric Matrix */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                            
                            {/* Registered Members */}
                            <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-blue-950 shadow-xs">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Registered Members</p>
                                        <p className="text-2xl font-black text-slate-950 font-serif mt-1">{usersList.length}</p>
                                    </div>
                                    <span className="p-2 bg-slate-100 text-slate-700 border border-slate-200"><Users className="w-4 h-4" /></span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Active Student Dossiers</p>
                            </div>

                            {/* Meal Entries */}
                            <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-amber-600 shadow-xs">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Logged Diet Entries</p>
                                        <p className="text-2xl font-black text-blue-950 font-serif mt-1">{filteredMeals.length}</p>
                                    </div>
                                    <span className="p-2 bg-amber-50 text-amber-800 border border-amber-200"><Utensils className="w-4 h-4" /></span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Attendance Registers</p>
                            </div>

                            {/* Cooperative Revenue */}
                            <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-emerald-700 shadow-xs">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Audited Diet Demand</p>
                                        <p className="text-2xl font-black text-emerald-800 font-serif mt-1">₹{totalCampusRevenue.toLocaleString()}</p>
                                    </div>
                                    <span className="p-2 bg-emerald-50 text-emerald-800 border border-emerald-200"><IndianRupee className="w-4 h-4" /></span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Aggregate Diet Levy</p>
                            </div>

                            {/* Reconciled Settlements */}
                            <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-indigo-700 shadow-xs">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Settled Clearances</p>
                                        <p className="text-2xl font-black text-indigo-900 font-serif mt-1">₹{totalFeeCollected.toLocaleString()}</p>
                                    </div>
                                    <span className="p-2 bg-indigo-50 text-indigo-800 border border-indigo-200"><CreditCard className="w-4 h-4" /></span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Remitted to Treasury</p>
                            </div>

                            {/* Pending Grievances */}
                            <div className="bg-white border border-slate-300 p-4 border-l-4 border-l-red-700 shadow-xs">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-mono">Active Grievances</p>
                                        <p className="text-2xl font-black text-red-700 font-serif mt-1">{complaintsList.filter(c => c.status === 'Pending').length}</p>
                                    </div>
                                    <span className="p-2 bg-red-50 text-red-700 border border-red-200"><MessageSquareWarning className="w-4 h-4" /></span>
                                </div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase mt-2">Hearings Pending</p>
                            </div>

                        </div>

                        {/* EXECUTIVE ANALYTICS CHART - REVENUE TIMELINE */}
                        <div className="bg-white border border-slate-300 shadow-xs print:hidden">
                            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                    <TrendingUp className="w-4 h-4 text-amber-600" />
                                    <span>Cooperative Fiscal Timeline • 30-Day Consolidated Revenue Audit</span>
                                </h2>
                                <span className="text-[9px] font-mono font-bold text-slate-500 uppercase">
                                    Currency Standard: INR (Statutory Tariff Enforced)
                                </span>
                            </div>
                            <div className="p-5 h-64 w-full bg-white">
                                {chartData.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-slate-400 text-xs font-bold uppercase tracking-widest">
                                        Insufficient ledger data for timeline generation
                                    </div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.35}/>
                                                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                            <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={25} />
                                            <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                                            <Tooltip contentStyle={{ borderRadius: '1px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} itemStyle={{ color: '#0f172a' }} />
                                            <Area type="monotone" dataKey="revenue" name="Audited Revenue" stroke="#0f172a" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRevenue)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </div>

                    </div>
                )}

                {/* ========================================================================= */}
                {/* 6. TAB 1: AUTHORIZED MEMBER ROLL DIRECTORY                                */}
                {/* ========================================================================= */}
                {activeTab === 'users' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <Users className="w-4 h-4 text-amber-600" /> Statutory Member Roll &amp; Residential Directory
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {filteredUsers.length} Certified Records
                            </span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
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
                                        <tr><td colSpan="7" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No matching candidate records found in registry.</td></tr>
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
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="bg-emerald-100 text-emerald-950 border border-emerald-300 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider inline-block">
                                                                    ✓ CLEARANCE RATIFIED
                                                                </span>
                                                                <span className="text-[8px] text-slate-500 uppercase font-bold font-mono">
                                                                    {feeStatus.paymentRecord?.paymentChannel?.includes('Desk') ? 'Treasury Cash Counter' : 'Digital Gateway Clearance'}
                                                                </span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => setReceiptModalData(feeStatus.paymentRecord)}
                                                                        className="text-[8px] font-black text-blue-950 hover:underline uppercase cursor-pointer tracking-tight flex items-center gap-0.5"
                                                                    >
                                                                        <Printer className="w-2.5 h-2.5" /> [Receipt Slip]
                                                                    </button>
                                                                    <button 
                                                                        type="button"
                                                                        onClick={() => handleRevokeSettlement(feeStatus.paymentRecord, u.name)} 
                                                                        className="text-[8px] font-black text-red-700 hover:underline uppercase cursor-pointer tracking-tight"
                                                                    >
                                                                        [Reset to Unpaid]
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1">
                                                                <span className="bg-red-100 text-red-950 border border-red-300 px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider">
                                                                    ✕ DUES OUTSTANDING
                                                                </span>
                                                                {feeStatus.fine > 0 && (
                                                                    <span className="text-[8px] font-black text-red-700 bg-red-50 border border-red-200 px-1 py-0.2">
                                                                        Statutory Fine: +₹{feeStatus.fine}
                                                                    </span>
                                                                )}
                                                                <button 
                                                                    onClick={() => handleRecordDeskSettlement(u)} 
                                                                    className="mt-1 bg-blue-950 hover:bg-blue-900 text-white px-2 py-1 text-[8px] font-black uppercase tracking-widest transition cursor-pointer border-b border-amber-500 active:scale-95 shadow-xs"
                                                                    title="Ratify in-person cash remittance at treasury desk"
                                                                >
                                                                    Accept Cash at Desk
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-3 text-right print:hidden">
                                                        <div className="flex items-center justify-end gap-1">
                                                            <button onClick={() => openEditModal(u)} className="p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer" title="Amend Candidate Record"><Pencil className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => handleResetPassword(u, u.name)} className="p-1.5 border border-amber-300 bg-amber-50 text-amber-900 hover:bg-amber-600 hover:text-white transition cursor-pointer" title="Overwrite Authentication Key"><KeyRound className="w-3.5 h-3.5" /></button>
                                                            <button onClick={() => promptRemoveStudent(u, u.name)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer" title="Expel from Cooperative Registry"><Trash2 className="w-3.5 h-3.5" /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 7. TAB 2: COUNCIL OFFICERS & ADMINISTRATIVE MAGISTRACY                    */}
                {/* ========================================================================= */}
                {activeTab === 'admins' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <ShieldCheck className="w-4 h-4 text-amber-600" /> Authorized Committee Council &amp; Magistracy
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {filteredAdmins.length} Commissioned Officers
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-900 text-white border-b-2 border-slate-950 select-none">
                                    <tr className="uppercase font-black text-[10px] tracking-wider">
                                        <th className="p-3 border-r border-slate-800">Officer Identity Dossier</th>
                                        <th className="p-3 border-r border-slate-800 text-center w-32">Clearance Role</th>
                                        <th className="p-3 border-r border-slate-800">Registered Mobile</th>
                                        <th className="p-3 border-r border-slate-800">Date of Birth</th>
                                        <th className="p-3 text-right print:hidden">Audit Commands</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-medium">
                                    {filteredAdmins.map((a) => (
                                        <tr key={a._id} className="hover:bg-slate-50/80 transition">
                                            <td className="p-3 border-r border-slate-200">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 border border-slate-300 bg-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                                                        {a.profilePhoto ? <img src={a.profilePhoto} alt="" className="w-full h-full object-cover" /> : <Award className="w-4 h-4 text-slate-400" />}
                                                    </div>
                                                    <div>
                                                        <span className="font-black text-blue-950 uppercase font-serif text-xs">{a.name}</span>
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase">Executive Member</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-3 border-r border-slate-200 text-center">
                                                <span className="bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider">
                                                    {a.role || 'ADMINISTRATOR'}
                                                </span>
                                            </td>
                                            <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-700">{a.mobileNo ? `+91 ${a.mobileNo}` : 'NIL'}</td>
                                            <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-700">{a.dob || 'NIL'}</td>
                                            <td className="p-3 text-right print:hidden">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button onClick={() => openAdminEditModal(a)} className="p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer" title="Amend Officer Credentials"><Pencil className="w-3.5 h-3.5" /></button>
                                                    <button onClick={() => promptRemoveAdmin(a._id, a.name)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer" title="Revoke Commission"><Trash2 className="w-3.5 h-3.5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 8. TAB 3: MASTER EXPENDITURE LEDGER AUDIT REGISTER (WITH TIME & DATE)     */}
                {/* ========================================================================= */}
                {activeTab === 'meals' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <FileText className="w-4 h-4 text-amber-600" /> Comprehensive Daily Diet Consumption &amp; Expenditure Ledger
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {filteredMeals.length} Total Audit Logs
                            </span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-900 text-white sticky top-0 border-b-2 border-slate-950 z-10 select-none">
                                    <tr className="uppercase font-black text-[10px] tracking-wider">
                                        <th className="p-3 border-r border-slate-800">Date &amp; Log Time</th>
                                        <th className="p-3 border-r border-slate-800">Candidate Identifier</th>
                                        <th className="p-3 border-r border-slate-800 text-center w-24">Residence</th>
                                        <th className="p-3 border-r border-slate-800 text-center">Diets Consumed</th>
                                        <th className="p-3 border-r border-slate-800">Consumable Extras</th>
                                        <th className="p-3 text-right w-44">Daily Assessed Levy</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-medium">
                                    {filteredMeals.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No dietary records found in current jurisdiction.</td></tr>
                                    ) : (
                                        filteredMeals.map((m) => {
                                            const logTime = formatLogTime(m);
                                            return (
                                                <tr key={m._id} className="hover:bg-slate-50/80 transition">
                                                    <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-800 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <span className="text-slate-950 font-bold">{m.date}</span>
                                                            {logTime ? (
                                                                <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                                                                    <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                                                                    <span>{logTime}</span>
                                                                </span>
                                                            ) : (
                                                                <span className="text-[9px] font-mono text-slate-400 font-normal">Time unrecorded</span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 font-bold text-blue-950 uppercase">
                                                        <span className="font-mono text-slate-900">{m.userId?.rollNo || 'N/A'}</span> 
                                                        <span className="font-medium text-[10px] text-slate-500 ml-1.5 font-sans">({m.userId?.name})</span>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 text-center">
                                                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-[9px] font-black uppercase text-slate-800 font-mono">
                                                            {m.hostelId?.hostelNumber || m.hostelNo}
                                                        </span>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200">
                                                        <div className="flex items-center justify-center gap-1 flex-wrap">
                                                            {m.meals?.breakfast && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">BREAKFAST</span>}
                                                            {m.meals?.lunch && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">LUNCH</span>}
                                                            {m.meals?.dinner && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">DINNER</span>}
                                                            {m.appliedDietRule === '1_DIET_BUMPED_TO_2' && (
                                                                <span className="text-[8px] bg-amber-50 text-amber-900 border border-amber-300 px-1 py-0.2 font-black uppercase ml-1">
                                                                    Statute 4.2
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 text-[10px] text-slate-700 uppercase font-bold font-mono">
                                                        {m.extras?.length > 0 ? m.extras.map(e => `${e.itemName} (₹${e.cost})`).join(', ') : 'NIL'}
                                                    </td>
                                                    <td className="p-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <span className="font-black text-blue-950 text-sm font-serif">₹{m.dailyTotalCost || 0}/-</span>
                                                            <div className="flex print:hidden gap-1">
                                                                <button onClick={() => openMealEditModal(m)} className="p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer" title="Amend Diet Record"><Pencil className="w-3 h-3" /></button>
                                                                <button onClick={() => promptRemoveMealLog(m._id)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer" title="Purge Record"><Trash2 className="w-3 h-3" /></button>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 9. TAB 4: MASTER FINANCIAL SETTLEMENTS & CLEARANCE LEDGER                 */}
                {/* ========================================================================= */}
                {activeTab === 'payments' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <CreditCard className="w-4 h-4 text-amber-600" /> Central Financial Clearances &amp; Treasury Cash Ledger
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {filteredPayments.length} Certified Transactions
                            </span>
                        </div>
                        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                            <table className="w-full text-left border-collapse text-xs">
                                <thead className="bg-slate-900 text-white sticky top-0 border-b-2 border-slate-950 z-10 select-none">
                                    <tr className="uppercase font-black text-[10px] tracking-wider">
                                        <th className="p-3 border-r border-slate-800">Timestamp</th>
                                        <th className="p-3 border-r border-slate-800">Receipt Voucher / Ref</th>
                                        <th className="p-3 border-r border-slate-800">Candidate Particulars</th>
                                        <th className="p-3 border-r border-slate-800 text-center w-24">Residence</th>
                                        <th className="p-3 border-r border-slate-800">Clearance Channel</th>
                                        <th className="p-3 border-r border-slate-800 text-center">Settled Amount</th>
                                        <th className="p-3 text-right">Statutory Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200 font-medium">
                                    {filteredPayments.length === 0 ? (
                                        <tr><td colSpan="7" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No payment settlement transactions logged in ledger.</td></tr>
                                    ) : (
                                        filteredPayments.map((p) => {
                                            const resolvedStudentId = getStudentIdFromRoster(p);
                                            return (
                                                <tr key={p._id} className="hover:bg-slate-50/80 transition">
                                                    <td className="p-3 border-r border-slate-200 text-slate-800 font-mono text-[11px] whitespace-nowrap">
                                                        {new Date(p.createdAt || p.paymentDate).toLocaleString()}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200">
                                                        <div className="font-black text-blue-950 font-mono">{p.receiptNo}</div>
                                                        <div className="text-[9px] font-mono text-slate-500">{p.txnId}</div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 uppercase font-bold text-slate-900">
                                                        <div className="font-bold text-blue-950 font-serif text-xs">
                                                            {p.studentName || p.userId?.name || 'Candidate'}
                                                        </div>
                                                        <div className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-0.5">
                                                            Roll: <span className="text-slate-800">{p.rollNo || p.userId?.rollNo || 'N/A'}</span>
                                                        </div>
                                                        <div className="text-[9px] font-mono font-bold text-slate-600 uppercase">
                                                            ID: <span className="text-blue-950 font-black">{resolvedStudentId}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 text-center">
                                                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-[9px] font-black uppercase text-slate-800 font-mono">{p.hostelNo}</span>
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 font-bold uppercase text-amber-900">
                                                        {p.paymentChannel || p.paymentMode || 'Treasury Desk Deposit'}
                                                    </td>
                                                    <td className="p-3 border-r border-slate-200 text-center font-black text-blue-950 font-serif text-sm whitespace-nowrap">
                                                        ₹{Number(p.amount).toLocaleString()}/-
                                                    </td>
                                                    <td className="p-3 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            <button 
                                                                type="button"
                                                                onClick={() => setReceiptModalData({
                                                                    ...p,
                                                                    studentId: resolvedStudentId
                                                                })} 
                                                                className="flex items-center gap-1 p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer text-[9px] font-black uppercase"
                                                                title="Print Certified Receipt Voucher"
                                                            >
                                                                <Printer className="w-3.5 h-3.5 text-amber-600" />
                                                                <span className="hidden sm:inline">Print Slip</span>
                                                            </button>
                                                            <button 
                                                                type="button"
                                                                onClick={() => handleRevokeSettlement(p, p.studentName || p.userId?.name || 'Candidate')} 
                                                                className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"
                                                                title="Purge &amp; Reset to UNPAID"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 10. TAB 5: STUDENT WELFARE & GRIEVANCE REDRESSAL PROCEEDINGS              */}
                {/* ========================================================================= */}
                {activeTab === 'complaints' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <MessageSquareWarning className="w-4 h-4 text-amber-600" /> Student Welfare &amp; Grievance Redressal Proceedings
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {filteredComplaints.length} Total Cases Docketed
                            </span>
                        </div>
                        {filteredComplaints.length === 0 ? (
                            <div className="text-center py-16 text-slate-400 text-xs font-bold uppercase tracking-widest">
                                No formal grievance petitions on docket.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                                {filteredComplaints.map(c => (
                                    <div key={c._id} className="border border-slate-300 p-4 bg-white shadow-xs flex flex-col justify-between border-t-2 border-t-blue-950">
                                        <div>
                                            <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                                                <span className="text-[9px] font-black bg-slate-100 border border-slate-300 px-2 py-0.5 uppercase tracking-wider text-slate-800">
                                                    {c.category} • {c.hostelNo}
                                                </span>
                                                <span className={`text-[8px] font-black px-2 py-0.5 uppercase border tracking-wider ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-red-50 text-red-900 border-red-300'}`}>
                                                    {c.status}
                                                </span>
                                            </div>
                                            <h3 className="font-black text-slate-900 text-xs uppercase mb-1 font-serif">{c.subject}</h3>
                                            <p className="text-[11px] text-slate-700 font-medium leading-relaxed">{c.description}</p>
                                        </div>
                                        {c.photoProof && (
                                            <div className="mt-3 pt-3 border-t border-slate-200">
                                                <a href={c.photoProof} target="_blank" rel="noreferrer"><img src={c.photoProof} alt="Proof" className="w-12 h-12 object-cover border border-slate-400" /></a>
                                                <div className="text-[8px] text-slate-500 font-bold uppercase mt-1">Evidentiary Attachment</div>
                                            </div>
                                        )}
                                        <div className="bg-slate-50 border border-slate-200 p-3 text-[10px] uppercase font-bold mt-4 space-y-0.5">
                                            <p className="text-slate-600">Complainant: <span className="text-blue-950 font-black">{c.userId?.name} (Roll: {c.userId?.rollNo})</span></p>
                                            <p className="text-slate-600">Contact Protocol: <span className="text-slate-800 font-mono">+91 {c.userId?.mobileNo}</span></p>
                                            {c.adminRemark && <div className="mt-2 pt-2 border-t border-slate-200 text-amber-900 font-semibold">Committee Finding: <span className="text-slate-800 font-normal">{c.adminRemark}</span></div>}
                                        </div>
                                        <div className="flex items-center justify-between mt-4 pt-2.5 border-t border-slate-200">
                                            <span className="text-[9px] text-slate-500 font-mono font-bold">{new Date(c.createdAt).toLocaleDateString()}</span>
                                            <div className="flex items-center gap-2 print:hidden">
                                                <button onClick={() => openComplaintModal(c)} className="bg-blue-950 hover:bg-blue-900 text-white font-black px-3 py-1.5 text-[9px] uppercase tracking-wider cursor-pointer transition active:scale-95">Adjudicate Case</button>
                                                <button onClick={() => promptDeleteComplaint(c._id)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 11. TAB 6: OFFICIAL EXECUTIVE GAZETTE & WARDEN DIRECTIVES                 */}
                {/* ========================================================================= */}
                {activeTab === 'notices' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <BellRing className="w-4 h-4 text-amber-600" /> Official Executive Gazette &amp; Warden Directives
                            </h2>
                            <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                                {noticesList.length} Active Directives
                            </span>
                        </div>

                        {/* Promulgate Directive Form */}
                        <form onSubmit={handleNoticeSubmit} className="bg-slate-50 border border-slate-300 p-5 m-5 shadow-xs">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-950 border-b border-slate-300 pb-2 mb-4 font-serif">
                                Promulgate Official Council Directive / Order
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Decree Title / Reference Subject</label>
                                    <input required type="text" placeholder="e.g. Mandatory Diet Clearance Schedule for May 2026" value={noticeTitle} onChange={e => setNoticeTitle(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Target Residential Jurisdiction</label>
                                    <select value={noticeHostel} onChange={e => setNoticeHostel(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold outline-none focus:border-blue-950 cursor-pointer uppercase">
                                        <option value="ALL">All Residences (Campus-Wide Core)</option>
                                        <option value="BH1">BH1 Only</option><option value="BH2">BH2 Only</option><option value="BH3">BH3 Only</option>
                                        <option value="GH1">GH1 Only</option><option value="GH2">GH2 Only</option><option value="GH3">GH3 Only</option><option value="GH4">GH4 Only</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Directive Statutory Content</label>
                                <textarea required rows="3" placeholder="Specify binding instructions, dates, and administrative regulations..." value={noticeContent} onChange={e => setNoticeContent(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-medium outline-none focus:border-blue-950 resize-none" />
                            </div>
                            <button type="submit" disabled={postingNotice} className="mt-4 bg-blue-950 hover:bg-blue-900 text-white font-black px-6 py-2.5 text-[10px] tracking-widest transition flex items-center gap-2 cursor-pointer disabled:opacity-70 border-b-2 border-amber-500 active:scale-95">
                                <Send className="w-3.5 h-3.5" /> <span>{postingNotice ? 'Promulgating Decree...' : 'Promulgate Executive Order'}</span>
                            </button>
                        </form>

                        {/* Broadcast Log */}
                        <div className="px-5 pb-5">
                            <h3 className="text-[11px] font-black uppercase text-slate-800 border-b border-slate-300 pb-2 mb-4 tracking-widest font-serif">
                                Gazetted Decrees Docket
                            </h3>
                            {noticesList.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 text-xs font-bold uppercase tracking-widest">No active decrees on file.</div>
                            ) : (
                                <div className="space-y-3">
                                    {noticesList.map(n => (
                                        <div key={n._id} className="border border-slate-300 bg-white p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-amber-600 shadow-xs">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-[8px] font-black bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 uppercase tracking-wider">Target: {n.hostelNo}</span>
                                                    <span className="text-[9px] text-slate-500 font-mono font-bold uppercase">Issued: {new Date(n.createdAt).toLocaleDateString()} | Officer: {n.postedBy}</span>
                                                </div>
                                                <h4 className="font-black text-slate-900 text-xs uppercase mb-1 font-serif">{n.title}</h4>
                                                <p className="text-[11px] text-slate-700 font-medium whitespace-pre-wrap">{n.content}</p>
                                            </div>
                                            <button onClick={() => promptDeleteNotice(n._id)} title="Rescind Decree" className="p-2 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer shrink-0">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ========================================================================= */}
                {/* 12. TAB 7: STATUTORY TARIFF SCHEDULE & MEAL LEVY CONFIGURATIONS           */}
                {/* ========================================================================= */}
                {activeTab === 'settings' && (
                    <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                        <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                            <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                                <Settings className="w-4 h-4 text-amber-600" /> Statutory Tariff Schedule &amp; Meal Levy Configurations
                            </h2>
                        </div>

                        <div className="p-6">
                            <div className="max-w-xl mx-auto border-2 border-slate-300 bg-slate-50 p-6 shadow-sm">
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-950 border-b border-slate-300 pb-2 mb-5 font-serif">
                                    Promulgate Official Diet Rates by Residence
                                </h3>
                                
                                <div className="mb-5">
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Select Jurisdiction (Residence)</label>
                                    <select 
                                        className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer"
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
                                        <option value="">-- SELECT RESIDENCE JURISDICTION --</option>
                                        {hostelsList.map(h => (
                                            <option key={h._id} value={h._id}>{h.hostelNumber} - {h.name || h.type}</option>
                                        ))}
                                    </select>
                                </div>

                                {targetHostelId && (
                                    <form onSubmit={handleUpdateRates} className="space-y-5">
                                        <div className="grid grid-cols-3 gap-4">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Breakfast Tariff (₹)</label>
                                                <input type="number" required value={dietRates.breakfast} onChange={e => setDietRates({...dietRates, breakfast: Number(e.target.value)})} className="w-full bg-white border border-slate-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 font-mono" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Lunch Tariff (₹)</label>
                                                <input type="number" required value={dietRates.lunch} onChange={e => setDietRates({...dietRates, lunch: Number(e.target.value)})} className="w-full bg-white border border-slate-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 font-mono" />
                                            </div>
                                            <div>
                                                <label className="text-[9px] font-black text-slate-700 uppercase block mb-1">Dinner Tariff (₹)</label>
                                                <input type="number" required value={dietRates.dinner} onChange={e => setDietRates({...dietRates, dinner: Number(e.target.value)})} className="w-full bg-white border border-slate-400 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 font-mono" />
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-3 text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border-b-2 border-amber-500 shadow-sm active:scale-95">
                                            <Save className="w-3.5 h-3.5" /> Promulgate &amp; Ratify Tariff Schedule
                                        </button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========================================================================= */}
            {/* 13. PRINTABLE STATUTORY RECEIPT VOUCHER MODAL                             */}
            {/* ========================================================================= */}
            {receiptModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-lg shadow-2xl relative border-2 border-slate-300 border-t-4 border-t-blue-950 rounded-xs flex flex-col max-h-[92vh]">
                        {/* Modal Header */}
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
                            <div className="flex items-center gap-2.5">
                                <Landmark className="w-4 h-4 text-amber-600" />
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">
                                    Official Clearance Voucher Slip
                                </h3>
                            </div>
                            <button 
                                type="button" 
                                onClick={() => setReceiptModalData(null)} 
                                className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>

                        {/* Printable Receipt Body */}
                        <div className="p-6 overflow-y-auto space-y-4 font-mono text-slate-900">
                            <div className="border-b-2 border-slate-950 pb-3 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                                    Autonomous Hostel Cooperative Registry
                                </span>
                                <h2 className="text-sm font-black uppercase tracking-tight text-blue-950 font-serif mt-0.5">
                                    Central Residential Mess Cooperative
                                </h2>
                                <span className="text-[9px] font-bold uppercase text-amber-800 block mt-0.5">
                                    Statutory Fee Clearance Voucher Slip
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-300 p-3 bg-slate-50">
                                <div>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Receipt Number</span>
                                    <span className="font-black text-blue-950">{receiptModalData.receiptNo}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Transaction Token</span>
                                    <span className="font-bold text-slate-800">{receiptModalData.txnId}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Timestamp</span>
                                    <span className="font-bold text-slate-800">{new Date(receiptModalData.createdAt || receiptModalData.paymentDate || receiptModalData.date).toLocaleString()}</span>
                                </div>
                                <div>
                                    <span className="text-[9px] text-slate-500 uppercase font-bold block">Billing Cycle</span>
                                    <span className="font-bold text-slate-800">{receiptModalData.month || 'Current Cycle'}</span>
                                </div>
                            </div>

                            <div className="border border-slate-300 p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase text-[10px]">Candidate Full Name:</span>
                                    <span className="font-black uppercase text-blue-950">{receiptModalData.studentName || receiptModalData.userId?.name || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase text-[10px]">Campus Roll Number:</span>
                                    <span className="font-bold uppercase text-slate-900">{receiptModalData.rollNo || receiptModalData.userId?.rollNo || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase text-[10px]">Statutory Student ID:</span>
                                    <span className="font-black uppercase text-blue-950">{receiptModalData.studentId || getStudentIdFromRoster(receiptModalData)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase text-[10px]">Residence Allotment:</span>
                                    <span className="font-bold uppercase text-slate-900">{receiptModalData.hostelNo || 'CAMPUS RESIDENCE'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500 uppercase text-[10px]">Clearance Channel:</span>
                                    <span className="font-bold uppercase text-amber-900">{receiptModalData.paymentChannel || receiptModalData.paymentMode || 'Treasury Desk Settlement'}</span>
                                </div>
                            </div>

                            <div className="border-2 border-slate-950 p-3.5 bg-slate-100 flex items-center justify-between">
                                <span className="font-serif font-black uppercase text-xs text-slate-900 tracking-wider">
                                    Total Remitted Amount:
                                </span>
                                <span className="text-xl font-serif font-black text-blue-950">
                                    ₹{Number(receiptModalData.amount).toLocaleString()}/-
                                </span>
                            </div>

                            <div className="text-center pt-2">
                                <span className="inline-block border-2 border-emerald-700 bg-emerald-50 text-emerald-950 px-4 py-1 text-[9px] font-black uppercase tracking-widest">
                                    ✓ CLEARANCE AUDITED &bull; STATUTE 4.2 RATIFIED
                                </span>
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="bg-slate-50 border-t border-slate-300 p-4 flex gap-2 print:hidden shrink-0">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-2 border-amber-500 shadow-xs active:scale-95"
                            >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                                <span>Print Official Slip</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setReceiptModalData(null)}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 text-xs uppercase cursor-pointer"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 14. AMEND STUDENT DOSSIER MODAL                                           */}
            {/* ========================================================================= */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-lg shadow-2xl relative border-t-4 border-amber-600 max-h-[90vh] flex flex-col rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0">
                            <div>
                                <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Amend Candidate Academic Dossier</h3>
                                <p className="text-[9px] font-bold text-slate-500 mt-0.5 uppercase tracking-tight">Statutory Administrative Override Session</p>
                            </div>
                            <button onClick={() => setIsEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Candidate Full Name</label>
                                <input required type="text" value={editFormData.name} onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 uppercase font-bold" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Father's Name</label>
                                    <input type="text" value={editFormData.fatherName} onChange={(e) => setEditFormData({ ...editFormData, fatherName: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 uppercase font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Mother's Name</label>
                                    <input type="text" value={editFormData.motherName} onChange={(e) => setEditFormData({ ...editFormData, motherName: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 uppercase font-medium" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Campus Roll Number</label>
                                    <input required type="text" value={editFormData.newRollNo} onChange={(e) => setEditFormData({ ...editFormData, newRollNo: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 uppercase font-bold font-mono" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Statutory Student ID</label>
                                    <input type="text" value={editFormData.studentId} onChange={(e) => setEditFormData({ ...editFormData, studentId: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 font-bold font-mono" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Date of Birth</label>
                                    <input 
                                        type="date" 
                                        max="2010-12-31" 
                                        value={editFormData.dob} 
                                        onChange={(e) => setEditFormData({ ...editFormData, dob: e.target.value })} 
                                        className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer font-mono" 
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Gender</label>
                                    <select value={editFormData.gender} onChange={(e) => setEditFormData({ ...editFormData, gender: e.target.value })} className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer font-bold">
                                        <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            {/* HIERARCHICAL SELECTORS */}
                            <div className="space-y-3 border border-slate-300 py-3 bg-slate-50 p-3">
                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">1. Academic Faculty</label>
                                    <select
                                        value={editFormData.facultyId}
                                        onChange={e => handleAdminFacultyChange(e.target.value)}
                                        className="w-full bg-white border border-slate-400 p-2 text-xs uppercase focus:border-blue-950 rounded-xs cursor-pointer font-bold"
                                    >
                                        <option value="">-- SELECT FACULTY JURISDICTION --</option>
                                        {UNIVERSITY_FACULTIES_HIERARCHY.map(f => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">2. Department Branch</label>
                                    <select
                                        disabled={!editFormData.facultyId}
                                        value={editFormData.department}
                                        onChange={e => handleAdminDepartmentChange(e.target.value)}
                                        className={`w-full bg-white border border-slate-400 p-2 text-xs uppercase rounded-xs font-bold ${!editFormData.facultyId ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <option value="">{editFormData.facultyId ? '-- SELECT DEPARTMENT --' : '-- SELECT FACULTY FIRST --'}</option>
                                        {adminAvailableDepartments.map((dept, idx) => (
                                            <option key={idx} value={dept.name}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-blue-950 uppercase block mb-1">3. Degree / Programme Course</label>
                                    <select
                                        disabled={!editFormData.department}
                                        value={editFormData.university}
                                        onChange={e => setEditFormData({ ...editFormData, university: e.target.value })}
                                        className={`w-full bg-white border border-slate-400 p-2 text-xs uppercase rounded-xs font-bold ${!editFormData.department ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        <option value="">{editFormData.department ? '-- SELECT PROGRAMME --' : '-- SELECT DEPARTMENT FIRST --'}</option>
                                        {adminAvailableProgrammes.map(course => (
                                            <option key={course.id} value={course.name}>[{course.id}] {course.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Academic Session</label>
                                    <select
                                        value={editFormData.session}
                                        onChange={e => setEditFormData({ ...editFormData, session: e.target.value })}
                                        className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer font-bold font-mono"
                                    >
                                        <option value="">-- SELECT SESSION --</option>
                                        {ACADEMIC_SESSIONS.map(s => (
                                            <option key={s.id} value={s.id}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Nationality</label>
                                    <select
                                        value={editFormData.nationality}
                                        onChange={e => setEditFormData({ ...editFormData, nationality: e.target.value })}
                                        className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer font-bold uppercase"
                                    >
                                        {WORLD_COUNTRIES.map(country => (
                                            <option key={country} value={country}>{country}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Domicile State</label>
                                    <select
                                        value={editFormData.domicileState}
                                        onChange={e => setEditFormData({ ...editFormData, domicileState: e.target.value })}
                                        className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer font-bold uppercase"
                                    >
                                        {INDIAN_STATES.map(st => (
                                            <option key={st} value={st}>{st}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Social Category</label>
                                    <select value={editFormData.category || 'General'} onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })} className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer uppercase font-bold">
                                        <option value="General">General</option><option value="SC">SC</option><option value="BC">BC</option><option value="OBC">OBC</option><option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-1">
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Residence</label>
                                    <select value={editFormData.hostelNo} onChange={(e) => setEditFormData({ ...editFormData, hostelNo: e.target.value })} className="w-full bg-white border border-slate-400 px-2 py-2 text-xs outline-none focus:border-blue-950 cursor-pointer uppercase font-bold">
                                        <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                                        <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Registered Email</label>
                                    <input type="email" value={editFormData.email || ''} onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 font-medium" />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Mobile No</label>
                                    <input required type="tel" maxLength="10" value={editFormData.mobileNo} onChange={(e) => setEditFormData({ ...editFormData, mobileNo: e.target.value.replace(/\D/g, '') })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs outline-none focus:border-blue-950 font-mono font-medium" />
                                </div>
                            </div>
                            <button type="submit" className="w-full mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-3 text-[10px] uppercase tracking-widest cursor-pointer transition border-b-2 border-emerald-950 active:scale-95 shadow-sm">
                                Commit Statutory Amendments
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 15. AMEND OFFICER PROFILE MODAL                                           */}
            {/* ========================================================================= */}
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

            {/* ========================================================================= */}
            {/* 16. AMEND DIET RECORD MODAL                                               */}
            {/* ========================================================================= */}
            {isMealEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-amber-600 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Executive Diet Ledger Correction</h3>
                            <button onClick={() => setIsMealEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleMealEditSubmit} className="p-6 pt-0 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Audit Record Date</label>
                                <input type="date" value={mealEditData.date} onChange={(e) => setMealEditData({ ...mealEditData, date: e.target.value })} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-mono font-bold outline-none focus:border-blue-950" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Toggle Standard Diets (Click to Authorize/Revoke)</label>
                                {['breakfast', 'lunch', 'dinner'].map((mKey) => (
                                    <div 
                                        key={mKey} 
                                        onClick={() => setMealEditData({ 
                                            ...mealEditData, 
                                            meals: { ...mealEditData.meals, [mKey]: !mealEditData.meals[mKey] } 
                                        })} 
                                        className={`flex items-center justify-between p-2.5 border cursor-pointer select-none transition ${mealEditData.meals[mKey] ? 'bg-blue-50 border-blue-950 text-blue-950' : 'bg-slate-50 border-slate-300 text-slate-500'}`}
                                    >
                                        <span className="uppercase font-bold text-xs font-serif">{mKey}</span>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${mealEditData.meals[mKey] ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>
                                            {mealEditData.meals[mKey] ? 'Authorized Active' : 'Omitted / Revoked'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-amber-700 hover:bg-amber-800 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-amber-950 active:scale-95">
                                Ratify Executive Alteration
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 17. ADJUDICATE GRIEVANCE MODAL                                            */}
            {/* ========================================================================= */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-amber-600 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Adjudicate Student Grievance Petition</h3>
                            <button onClick={() => setIsComplaintModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleComplaintUpdateSubmit} className="p-6 pt-0 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Redressal Status Classification</label>
                                <select value={complaintStatus} onChange={e => setComplaintStatus(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer">
                                    <option value="Pending">Pending Committee Assignment</option>
                                    <option value="In Progress">Active Formal Inquiry</option>
                                    <option value="Resolved">Adjudicated &amp; Formally Resolved</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Official Committee Finding / Directive</label>
                                <textarea rows="3" value={adminRemark} onChange={e => setAdminRemark(e.target.value)} className="w-full bg-white border border-slate-400 px-3 py-2 text-xs font-medium outline-none focus:border-blue-950 resize-none" placeholder="Enter binding administrative findings and directives..." />
                            </div>
                            <button type="submit" className="w-full mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-emerald-950 active:scale-95">
                                Ratify &amp; Seal Finding
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ========================================================================= */}
            {/* 18. GLOBAL INSTITUTIONAL CONFIRMATION MODAL                               */}
            {/* ========================================================================= */}
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