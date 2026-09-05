import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { Settings, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function AdminSettings() {
    const [hostelsList, setHostelsList] = useState([]);
    const [targetHostelId, setTargetHostelId] = useState('');
    const [dietRates, setDietRates] = useState({ breakfast: 37, lunch: 37, dinner: 37 });
    
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    const fetchHostels = async () => {
        try {
            const { data } = await API.get('/hostels');
            setHostelsList(data || []);
        } catch (err) {
            setErrorMsg('Failed to load jurisdiction data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    const handleUpdateRates = async (e) => {
        e.preventDefault();
        setSaving(true);
        setErrorMsg('');
        setSuccessMsg('');
        try {
            await API.put(`/hostels/${targetHostelId}/rates`, { mealCosts: dietRates });
            setSuccessMsg('Statutory tariff schedule promulgated and enforced across jurisdiction.'); 
            setTimeout(() => setSuccessMsg(''), 4000);
            await fetchHostels(); 
        } catch (err) { 
            setErrorMsg('Failed to promulgate tariff rate schedule.'); 
            setTimeout(() => setErrorMsg(''), 4000); 
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-300 max-w-3xl mx-auto">
            {errorMsg && <div className="bg-red-50 border-l-4 border-red-800 text-red-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><AlertCircle className="w-4 h-4 shrink-0 text-red-800" /><span>{errorMsg}</span></div>}
            {successMsg && <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 px-4 py-3 text-xs font-bold uppercase flex items-center gap-3"><CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" /><span>{successMsg}</span></div>}

            <div className="bg-white border border-slate-300 shadow-xs overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-5 py-3.5 flex items-center justify-between">
                    <h2 className="font-black text-xs text-blue-950 uppercase tracking-widest flex items-center gap-2 font-serif">
                        <Settings className="w-4 h-4 text-amber-600" /> Statutory Tariff Schedule Configurations
                    </h2>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-10 text-blue-950"><Loader2 className="w-6 h-6 animate-spin mb-2" /><p className="text-[10px] font-mono font-bold uppercase">Loading Configuration Panel...</p></div>
                    ) : (
                        <div className="border-2 border-slate-300 bg-slate-50 p-6 shadow-sm">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-blue-950 border-b border-slate-300 pb-2 mb-5 font-serif">
                                Promulgate Official Diet Rates by Residence
                            </h3>
                            
                            <div className="mb-6">
                                <label className="text-[10px] font-black text-slate-700 uppercase block mb-1.5">Select Jurisdiction (Residence)</label>
                                <select 
                                    className="w-full bg-white border border-slate-400 px-3 py-2.5 text-xs font-bold uppercase outline-none focus:border-blue-950 cursor-pointer shadow-xs"
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

                            {targetHostelId ? (
                                <form onSubmit={handleUpdateRates} className="space-y-6 animate-in fade-in">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white border border-slate-200 p-3 shadow-xs">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Breakfast Tariff (₹)</label>
                                            <input type="number" required value={dietRates.breakfast} onChange={e => setDietRates({...dietRates, breakfast: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 focus:bg-white font-mono transition" />
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 shadow-xs">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Lunch Tariff (₹)</label>
                                            <input type="number" required value={dietRates.lunch} onChange={e => setDietRates({...dietRates, lunch: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 focus:bg-white font-mono transition" />
                                        </div>
                                        <div className="bg-white border border-slate-200 p-3 shadow-xs">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-2">Dinner Tariff (₹)</label>
                                            <input type="number" required value={dietRates.dinner} onChange={e => setDietRates({...dietRates, dinner: Number(e.target.value)})} className="w-full bg-slate-50 border border-slate-300 px-3 py-2 text-sm font-black outline-none focus:border-blue-950 focus:bg-white font-mono transition" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={saving} className="w-full bg-blue-950 hover:bg-blue-900 text-white font-black py-3.5 text-[10px] uppercase tracking-widest transition flex items-center justify-center gap-2 cursor-pointer border-b-2 border-amber-500 shadow-sm active:scale-95 disabled:opacity-70">
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>{saving ? 'Ratifying...' : 'Promulgate & Ratify Tariff Schedule'}</span>
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-6 text-slate-400 text-xs font-bold uppercase tracking-widest border-2 border-dashed border-slate-300 bg-white">
                                    Select a residence jurisdiction to adjust tariff rates.
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}