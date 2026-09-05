import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { BellRing, Send, Trash2, AlertCircle, CheckCircle2, Loader2, RefreshCw } from 'lucide-react';
import ConfirmModal from '../../components/ConfirmModal';

export default function AdminNotices() {
    const [noticesList, setNoticesList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeContent, setNoticeContent] = useState('');
    const [noticeHostel, setNoticeHostel] = useState('ALL');
    const [postingNotice, setPostingNotice] = useState(false);
    
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: () => {} });

    const fetchNotices = async () => {
        setLoading(true);
        try {
            const { data } = await API.get('/notices');
            setNoticesList(data || []);
        } catch (err) {
            setErrorMsg('Failed to load executive directives.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotices();
    }, []);

    const handleNoticeSubmit = async (e) => {
        e.preventDefault(); 
        if (!noticeTitle.trim() || !noticeContent.trim()) return;
        setPostingNotice(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            const { data } = await API.post('/notices', { 
                title: noticeTitle.trim(), 
                content: noticeContent.trim(), 
                hostelNo: noticeHostel, 
                postedBy: 'Executive Committee Authority' 
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

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {errorMsg && <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span></div>}
            {successMsg && <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span></div>}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                        <BellRing className="w-4 h-4 text-amber-600" /> Official Executive Gazette &amp; Warden Directives
                    </h2>
                    <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className="text-[9px] font-mono font-bold text-slate-600 uppercase border border-slate-300 bg-white px-2 py-0.5">
                            {noticesList.length} Active Directives
                        </span>
                        <button 
                            onClick={fetchNotices} 
                            className="flex items-center gap-1.5 text-[10px] font-black bg-slate-100 border border-slate-300 px-3 py-1.5 uppercase tracking-wider text-slate-800 hover:bg-slate-200 active:scale-95 transition cursor-pointer"
                            title="Resynchronize registry records"
                        >
                            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-blue-950' : ''}`} />
                            <span>Sync Registry</span>
                        </button>
                    </div>
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
                    
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16 text-blue-950">
                            <Loader2 className="w-7 h-7 animate-spin mb-2" />
                            <p className="text-[11px] font-mono font-bold uppercase tracking-wider">Accessing Gazette Archives...</p>
                        </div>
                    ) : noticesList.length === 0 ? (
                        <div className="text-center py-12 text-slate-400 uppercase font-bold text-xs">No active decrees on file.</div>
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

            {confirmModal.isOpen && <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} />}
        </div>
    );
}