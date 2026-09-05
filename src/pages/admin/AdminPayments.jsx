import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { CreditCard, Filter, Printer, Trash2, X, CheckCircle2, AlertCircle, Loader2, Landmark } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminPayments() {
    const [paymentsList, setPaymentsList] = useState([]);
    const [usersList, setUsersList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');
    const [receiptModalData, setReceiptModalData] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resPay, resUsers] = await Promise.all([
                    API.get('/payments/admin/all-payments'),
                    API.get('/auth/users')
                ]);
                setPaymentsList(resPay.data || []);
                setUsersList(resUsers.data || []);
            } catch (err) {
                setErrorMsg('Failed to fetch payment records.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const getStudentIdFromRoster = (payment) => {
        if (payment?.studentId && payment.studentId !== 'N/A') return payment.studentId;
        const matchedUser = usersList.find(u => {
            const idMatch = (payment.userId && (u._id === payment.userId || u._id === payment.userId?._id || u.id === payment.userId));
            const rollMatch = (payment.rollNo && u.rollNo && String(u.rollNo).trim() === String(payment.rollNo).trim());
            return idMatch || rollMatch;
        });
        return matchedUser?.studentId || payment.userId?.studentId || 'N/A';
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

    const filteredPayments = useMemo(() => {
        return paymentsList.filter(p => selectedHostelFilter === 'ALL' || p.hostelNo === selectedHostelFilter);
    }, [paymentsList, selectedHostelFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {errorMsg && <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span></div>}
            {successMsg && <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span></div>}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif"><CreditCard className="w-4 h-4 text-amber-600" /> Central Financial Clearances Ledger</h2>
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5 mt-1 inline-block">{filteredPayments.length} Certified Transactions</span>
                    </div>
                    <div className="flex items-center bg-white border border-slate-300 px-2 py-1.5 w-full md:w-auto">
                        <Filter className="w-3 h-3 text-slate-500 mr-1.5" />
                        <select value={selectedHostelFilter} onChange={(e) => setSelectedHostelFilter(e.target.value)} className="bg-transparent text-[10px] w-full font-black uppercase text-slate-800 focus:outline-none cursor-pointer">
                            <option value="ALL">ALL RESIDENCES</option>
                            <option value="BH1">BH1</option><option value="BH2">BH2</option><option value="BH3">BH3</option>
                            <option value="GH1">GH1</option><option value="GH2">GH2</option><option value="GH3">GH3</option><option value="GH4">GH4</option>
                        </select>
                    </div>
                </div>
                
                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-blue-950"><Loader2 className="w-7 h-7 animate-spin mb-2" /><p className="text-[11px] font-mono font-bold uppercase">Accessing Treasury Archives...</p></div>
                    ) : (
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
                                    <tr><td colSpan="7" className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No payment settlement transactions logged.</td></tr>
                                ) : (
                                    filteredPayments.map((p) => {
                                        const resolvedStudentId = getStudentIdFromRoster(p);
                                        return (
                                            <tr key={p._id} className="hover:bg-slate-50/80 transition">
                                                <td className="p-3 border-r border-slate-200 text-slate-800 font-mono text-[11px] whitespace-nowrap">{new Date(p.createdAt || p.paymentDate).toLocaleString()}</td>
                                                <td className="p-3 border-r border-slate-200"><div className="font-black text-blue-950 font-mono">{p.receiptNo}</div><div className="text-[9px] font-mono text-slate-500">{p.txnId}</div></td>
                                                <td className="p-3 border-r border-slate-200 uppercase font-bold text-slate-900">
                                                    <div className="font-bold text-blue-950 font-serif text-xs">{p.studentName || p.userId?.name || 'Candidate'}</div>
                                                    <div className="text-[9px] font-mono font-bold text-slate-500 uppercase mt-0.5">Roll: <span className="text-slate-800">{p.rollNo || p.userId?.rollNo || 'N/A'}</span></div>
                                                    <div className="text-[9px] font-mono font-bold text-slate-600 uppercase">ID: <span className="text-blue-950 font-black">{resolvedStudentId}</span></div>
                                                </td>
                                                <td className="p-3 border-r border-slate-200 text-center"><span className="bg-slate-100 border border-slate-300 px-2 py-0.5 text-[9px] font-black uppercase text-slate-800 font-mono">{p.hostelNo}</span></td>
                                                <td className="p-3 border-r border-slate-200 font-bold uppercase text-amber-900">{p.paymentChannel || p.paymentMode || 'Treasury Desk Deposit'}</td>
                                                <td className="p-3 border-r border-slate-200 text-center font-black text-blue-950 font-serif text-sm whitespace-nowrap">₹{Number(p.amount).toLocaleString()}/-</td>
                                                <td className="p-3 text-right whitespace-nowrap">
                                                    <div className="flex items-center justify-end gap-1.5">
                                                        <button onClick={() => setReceiptModalData({ ...p, studentId: resolvedStudentId })} className="flex items-center gap-1 p-1.5 border border-slate-300 bg-slate-100 hover:bg-blue-950 hover:text-white transition cursor-pointer text-[9px] font-black uppercase"><Printer className="w-3.5 h-3.5 text-amber-600" /><span className="hidden sm:inline">Print Slip</span></button>
                                                        <button onClick={() => handleRevokeSettlement(p, p.studentName || p.userId?.name || 'Candidate')} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
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

            {/* RECEIPT MODAL */}
            {receiptModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-lg shadow-2xl relative border-2 border-slate-300 border-t-4 border-t-blue-950 rounded-xs flex flex-col max-h-[92vh]">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between shrink-0 print:hidden">
                            <div className="flex items-center gap-2.5"><Landmark className="w-4 h-4 text-amber-600" /><h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Official Clearance Voucher Slip</h3></div>
                            <button onClick={() => setReceiptModalData(null)} className="w-6 h-6 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer"><X className="w-3.5 h-3.5" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-4 font-mono text-slate-900">
                            <div className="border-b-2 border-slate-950 pb-3 text-center">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">Autonomous Hostel Cooperative Registry</span>
                                <h2 className="text-sm font-black uppercase tracking-tight text-blue-950 font-serif mt-0.5">Central Residential Mess Cooperative</h2>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs border border-slate-300 p-3 bg-slate-50">
                                <div><span className="text-[9px] text-slate-500 uppercase font-bold block">Receipt Number</span><span className="font-black text-blue-950">{receiptModalData.receiptNo}</span></div>
                                <div><span className="text-[9px] text-slate-500 uppercase font-bold block">Transaction Token</span><span className="font-bold text-slate-800">{receiptModalData.txnId}</span></div>
                                <div><span className="text-[9px] text-slate-500 uppercase font-bold block">Timestamp</span><span className="font-bold text-slate-800">{new Date(receiptModalData.createdAt || receiptModalData.paymentDate || receiptModalData.date).toLocaleString()}</span></div>
                            </div>
                            <div className="border border-slate-300 p-3 space-y-1.5 text-xs">
                                <div className="flex justify-between"><span className="text-slate-500 uppercase text-[10px]">Candidate Full Name:</span><span className="font-black uppercase text-blue-950">{receiptModalData.studentName || receiptModalData.userId?.name || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 uppercase text-[10px]">Campus Roll Number:</span><span className="font-bold uppercase text-slate-900">{receiptModalData.rollNo || receiptModalData.userId?.rollNo || 'N/A'}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 uppercase text-[10px]">Statutory Student ID:</span><span className="font-black uppercase text-blue-950">{receiptModalData.studentId}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500 uppercase text-[10px]">Clearance Channel:</span><span className="font-bold uppercase text-amber-900">{receiptModalData.paymentChannel || receiptModalData.paymentMode || 'Treasury Desk Settlement'}</span></div>
                            </div>
                            <div className="border-2 border-slate-950 p-3.5 bg-slate-100 flex items-center justify-between">
                                <span className="font-serif font-black uppercase text-xs text-slate-900 tracking-wider">Total Remitted Amount:</span>
                                <span className="text-xl font-serif font-black text-blue-950">₹{Number(receiptModalData.amount).toLocaleString()}/-</span>
                            </div>
                            <div className="text-center pt-2"><span className="inline-block border-2 border-emerald-700 bg-emerald-50 text-emerald-950 px-4 py-1 text-[9px] font-black uppercase tracking-widest">✓ CLEARANCE AUDITED &bull; STATUTE 4.2 RATIFIED</span></div>
                        </div>
                        <div className="bg-slate-50 border-t border-slate-300 p-4 flex gap-2 print:hidden shrink-0">
                            <button onClick={() => window.print()} className="flex-1 bg-blue-950 hover:bg-blue-900 text-white font-black py-2.5 text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-2 border-amber-500 shadow-xs active:scale-95"><Printer className="w-3.5 h-3.5 text-amber-400" /><span>Print Official Slip</span></button>
                            <button onClick={() => setReceiptModalData(null)} className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold px-5 py-2.5 text-xs uppercase cursor-pointer">Dismiss</button>
                        </div>
                    </div>
                </div>
            )}

            {confirmModal.isOpen && <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />}
        </div>
    );
}