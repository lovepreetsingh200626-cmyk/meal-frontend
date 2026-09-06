import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api'; 
import * as XLSX from 'xlsx';
import { 
    FileText, Clock, Pencil, Trash2, Download, Printer, 
    X, Filter, CheckCircle2, AlertCircle, Loader2 
} from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal'; // Check path!

export default function AdminMeals() {
    const [mealsList, setMealsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [isMealEditModalOpen, setIsMealEditModalOpen] = useState(false);
    const [editingMeal, setEditingMeal] = useState(null);
    const [mealEditData, setMealEditData] = useState({ date: '', meals: { breakfast: false, lunch: false, dinner: false }, extras: [] });
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const fetchAllMeals = async () => {
        setLoading(true);
        try { 
            const { data } = await API.get('/meals/all'); 
            setMealsList(data || []); 
        } catch (err) { 
            setErrorMsg('Failed to load ledger records.'); 
        } finally { setLoading(false); }
    };

    useEffect(() => { fetchAllMeals(); }, []);

    const formatLogTime = (rec) => {
        if (rec?.time) return rec.time;
        const rawTimestamp = rec?.createdAt || rec?.updatedAt;
        if (!rawTimestamp) return null;
        try {
            const parsed = new Date(rawTimestamp);
            if (isNaN(parsed.getTime())) return null;
            return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch { return null; }
    };

    const handleExportLedger = () => {
        if (filteredMeals.length === 0) return alert("No ledger records available under the active criteria.");
        const exportData = filteredMeals.map(m => ({
            "Audit Date": m.date, "Log Time": formatLogTime(m) || 'N/A', "Candidate Full Name": m.userId?.name || 'N/A',
            "Hostel Roll Number": m.userId?.rollNo || 'N/A', "Statutory Student ID": m.userId?.studentId || 'N/A',
            "Jurisdiction Residence": m.hostelId?.hostelNumber || m.hostelNo || 'N/A',
            "Breakfast Authorized": m.meals?.breakfast ? 'YES' : 'NO', "Lunch Authorized": m.meals?.lunch ? 'YES' : 'NO',
            "Dinner Authorized": m.meals?.dinner ? 'YES' : 'NO',
            "Approved Consumable Extras": m.extras?.length > 0 ? m.extras.map(e => `${e.itemName} (INR ${e.cost})`).join('; ') : 'NIL',
            "Audited Net Amount (INR)": m.dailyTotalCost || 0
        }));
        const worksheet = XLSX.utils.json_to_sheet(exportData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Statutory_Ledger_Audit");
        XLSX.writeFile(workbook, `Statutory_Mess_Ledger_Audit_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const handlePrintReport = () => window.print();

    const openMealEditModal = (meal) => {
        setEditingMeal(meal); 
        setMealEditData({ date: meal.date, meals: { ...meal.meals }, extras: meal.extras ? [...meal.extras] : [] }); 
        setIsMealEditModalOpen(true);
    };

    const handleMealEditSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await API.put(`/meals/${editingMeal._id}`, mealEditData);
            setSuccessMsg('Ledger entry amended under Executive Authority Decree.'); setTimeout(() => setSuccessMsg(''), 4000);
            setMealsList(prev => prev.map(m => m._id === editingMeal._id ? data.meal : m)); setIsMealEditModalOpen(false);
        } catch (err) { 
            setErrorMsg(err.response?.data?.message || 'Failed to commit ledger correction.'); setTimeout(() => setErrorMsg(''), 4000); 
        }
    };

    const promptRemoveMealLog = (mealId) => {
        setConfirmModal({
            isOpen: true, title: 'Purge Statutory Diet Ledger Record', message: 'Permanently expunge this daily attendance and dietary consumption record from the central audit ledger?',
            onConfirm: async () => {
                try {
                    await API.delete(`/meals/${mealId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false })); setSuccessMsg('Diet ledger entry purged successfully.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setMealsList(prev => prev.filter(m => m._id !== mealId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false })); setErrorMsg('Failed to purge dietary record.'); setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
    };

    const filteredMeals = useMemo(() => {
        return mealsList.filter(m => selectedHostelFilter === 'ALL' || m.hostelId?.hostelNumber === selectedHostelFilter || m.hostelNo === selectedHostelFilter);
    }, [mealsList, selectedHostelFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {errorMsg && <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span></div>}
            {successMsg && <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span></div>}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif"><FileText className="w-4 h-4 text-amber-600" /> Comprehensive Daily Diet Ledger</h2>
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase mt-1 inline-block border border-slate-300 bg-white px-2 py-0.5">{filteredMeals.length} Total Audit Logs</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 w-full md:w-auto print:hidden">
                        <div className="flex flex-1 md:flex-none items-center bg-white border border-slate-300 px-2 py-1.5">
                            <Filter className="w-3 h-3 text-slate-500 mr-1.5" />
                            <select value={selectedHostelFilter} onChange={(e) => setSelectedHostelFilter(e.target.value)} className="bg-transparent text-[10px] w-full font-black uppercase text-slate-800 focus:outline-none cursor-pointer">
                                <option value="ALL">ALL RESIDENCES</option>
                                <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                                <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                            </select>
                        </div>
                        <button onClick={handleExportLedger} className="flex items-center gap-1.5 text-[10px] font-black bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-950 px-3 py-1.5 uppercase transition"><Download className="w-3 h-3" /> <span className="hidden sm:inline">Export Excel</span></button>
                        <button onClick={handlePrintReport} className="flex items-center gap-1.5 text-[10px] font-black bg-slate-800 hover:bg-slate-900 text-white border border-black px-3 py-1.5 uppercase transition"><Printer className="w-3 h-3" /> Print</button>
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-blue-950"><Loader2 className="w-7 h-7 animate-spin mb-2" /><p className="text-[11px] font-mono font-bold uppercase">Accessing Ledger Archives...</p></div>
                    ) : (
                        <table className="w-full min-w-[750px] text-left border-collapse text-xs">
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
                                    <tr><td colSpan="6" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No dietary records found.</td></tr>
                                ) : (
                                    filteredMeals.map((m) => {
                                        const logTime = formatLogTime(m);
                                        return (
                                            <tr key={m._id} className="hover:bg-slate-50/80 transition">
                                                <td className="p-3 border-r border-slate-200 font-mono font-bold text-slate-800 whitespace-nowrap">
                                                    <div className="flex flex-col"><span className="text-slate-950 font-bold">{m.date}</span>
                                                        {logTime ? <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3 text-amber-600 shrink-0" /><span>{logTime}</span></span> : <span className="text-[9px] font-mono text-slate-400 font-normal">Time unrecorded</span>}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 font-bold text-blue-950 uppercase">
                                                    <span className="font-mono text-slate-900">{m.userId?.rollNo || 'N/A'}</span> <span className="font-medium text-[10px] text-slate-500 ml-1.5 font-sans">({m.userId?.name})</span>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 text-center"><span className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-[9px] font-black uppercase text-slate-800 font-mono">{m.hostelId?.hostelNumber || m.hostelNo}</span></td>
                                                <td className="p-3 border-r border-slate-200">
                                                    <div className="flex items-center justify-center gap-1 flex-wrap">
                                                        {m.meals?.breakfast && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">BREAKFAST</span>}
                                                        {m.meals?.lunch && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">LUNCH</span>}
                                                        {m.meals?.dinner && <span className="bg-blue-100 border border-blue-300 text-blue-950 px-1.5 py-0.5 font-black uppercase text-[9px]">DINNER</span>}
                                                    </div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 text-[10px] text-slate-700 uppercase font-bold font-mono">{m.extras?.length > 0 ? m.extras.map(e => `${e.itemName} (₹${e.cost})`).join(', ') : 'not applicable'}</td>
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
                    )}
                </div>
            </div>

            {/* EDIT DIET MODAL */}
            {isMealEditModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-amber-600 rounded-xs mx-2">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Executive Diet Ledger Correction</h3>
                            <button onClick={() => setIsMealEditModalOpen(false)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <form onSubmit={handleMealEditSubmit} className="p-6 pt-0 space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1">Toggle Standard Diets</label>
                                {['breakfast', 'lunch', 'dinner'].map((mKey) => (
                                    <div key={mKey} onClick={() => setMealEditData({ ...mealEditData, meals: { ...mealEditData.meals, [mKey]: !mealEditData.meals[mKey] } })} className={`flex items-center justify-between p-2.5 border cursor-pointer select-none transition ${mealEditData.meals[mKey] ? 'bg-blue-50 border-blue-950 text-blue-950' : 'bg-slate-50 border-slate-300 text-slate-500'}`}>
                                        <span className="uppercase font-bold text-xs font-serif">{mKey}</span>
                                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 border ${mealEditData.meals[mKey] ? 'bg-blue-950 text-white border-blue-950' : 'bg-slate-200 text-slate-600 border-slate-300'}`}>{mealEditData.meals[mKey] ? 'Authorized Active' : 'Omitted / Revoked'}</span>
                                    </div>
                                ))}
                            </div>
                            <button type="submit" className="w-full mt-4 bg-amber-700 hover:bg-amber-800 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-amber-950 active:scale-95">Ratify Executive Alteration</button>
                        </form>
                    </div>
                </div>
            )}
            
            {confirmModal.isOpen && <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />}
        </div>
    );
}