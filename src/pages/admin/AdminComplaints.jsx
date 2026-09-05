import React, { useState, useEffect, useMemo } from 'react';
import API from '../../services/api';
import { MessageSquareWarning, Filter, Trash2, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminComplaints() {
    const [complaintsList, setComplaintsList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [selectedHostelFilter, setSelectedHostelFilter] = useState('ALL');

    const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
    const [activeComplaint, setActiveComplaint] = useState(null);
    const [complaintStatus, setComplaintStatus] = useState('Pending');
    const [adminRemark, setAdminRemark] = useState('');
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const { data } = await API.get('/complaints/all');
                setComplaintsList(data || []);
            } catch (err) {
                setErrorMsg('Failed to load grievances.');
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

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
            setSuccessMsg('Grievance adjudication recorded.'); 
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
            isOpen: true, title: 'Dismiss & Archive Grievance', message: 'Purge this grievance case file from the active redressal docket?',
            onConfirm: async () => {
                try {
                    await API.delete(`/complaints/${cId}`); 
                    setConfirmModal(prev => ({ ...prev, isOpen: false })); setSuccessMsg('Grievance filing purged.'); setTimeout(() => setSuccessMsg(''), 4000);
                    setComplaintsList(prev => prev.filter(c => c._id !== cId));
                } catch (err) { 
                    setConfirmModal(prev => ({ ...prev, isOpen: false })); setErrorMsg('Failed to dismiss grievance record.'); setTimeout(() => setErrorMsg(''), 4000); 
                }
            }
        });
    };

    const filteredComplaints = useMemo(() => {
        return complaintsList.filter(c => selectedHostelFilter === 'ALL' || c.hostelNo === selectedHostelFilter);
    }, [complaintsList, selectedHostelFilter]);

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {errorMsg && <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span></div>}
            {successMsg && <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span></div>}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif"><MessageSquareWarning className="w-4 h-4 text-amber-600" /> Student Welfare &amp; Grievance Docket</h2>
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5 mt-1 inline-block">{filteredComplaints.length} Total Cases</span>
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

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-blue-950"><Loader2 className="w-7 h-7 animate-spin mb-2" /><p className="text-[11px] font-mono font-bold uppercase tracking-wider">Accessing Grievance Docket...</p></div>
                ) : filteredComplaints.length === 0 ? (
                    <div className="text-center py-16 text-slate-400 text-xs font-bold uppercase tracking-widest">No formal grievance petitions on docket.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 max-h-[60vh] overflow-y-auto bg-slate-50/50">
                        {filteredComplaints.map(c => (
                            <div key={c._id} className="border border-slate-300 p-4 bg-white shadow-xs flex flex-col justify-between border-t-2 border-t-blue-950">
                                <div>
                                    <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-2">
                                        <span className="text-[9px] font-black bg-slate-100 border border-slate-300 px-2 py-0.5 uppercase tracking-wider text-slate-800">{c.category} • {c.hostelNo}</span>
                                        <span className={`text-[8px] font-black px-2 py-0.5 uppercase border tracking-wider ${c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-900 border-emerald-300' : c.status === 'In Progress' ? 'bg-blue-50 text-blue-900 border-blue-300' : 'bg-red-50 text-red-900 border-red-300'}`}>{c.status}</span>
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
                                        <button onClick={() => openComplaintModal(c)} className="bg-blue-950 hover:bg-blue-900 text-white font-black px-3 py-1.5 text-[9px] uppercase tracking-wider cursor-pointer transition active:scale-95">Adjudicate</button>
                                        <button onClick={() => promptDeleteComplaint(c._id)} className="p-1.5 border border-red-300 bg-red-50 text-red-700 hover:bg-red-800 hover:text-white transition cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ADJUDICATE GRIEVANCE MODAL */}
            {isComplaintModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 select-none">
                    <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-amber-600 rounded-xs">
                        <div className="bg-slate-50 border-b border-slate-300 px-6 py-4 flex items-center justify-between mb-4">
                            <h3 className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">Adjudicate Student Grievance</h3>
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
                            <button type="submit" className="w-full mt-4 bg-emerald-800 hover:bg-emerald-900 text-white font-black py-2.5 text-[10px] uppercase tracking-widest transition border-b-2 border-emerald-950 active:scale-95">Ratify &amp; Seal Finding</button>
                        </form>
                    </div>
                </div>
            )}

            {confirmModal.isOpen && <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />}
        </div>
    );
}