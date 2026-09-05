import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { 
  Utensils, PlusCircle, CheckCircle2, Lock, AlertCircle, ShieldCheck,
  Calendar, Landmark, FileText, Check, Loader2, ShieldAlert, AlertTriangle 
} from 'lucide-react';

export default function StudentLogger({ user }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [lockedMeals, setLockedMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [hostelData, setHostelData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const userId = user?._id || user?.id || user?.userId;
  const hostelKey = user?.hostelNo || user?.hostelId?.hostelNumber || user?.hostelId;

  // 1. Fetch hostel-specific meal rates
  useEffect(() => {
    if (hostelKey) {
      API.get(`/hostels/${hostelKey}`)
        .then(res => setHostelData(res.data))
        .catch(err => console.error('Hostel rates fetch error:', err));
    }
  }, [hostelKey]);

  // 2. Fetch logged records when date or user changes
  const fetchDateRecord = useCallback(async (date) => {
    if (!userId) return;
    try {
      const { data } = await API.get(`/meals/user/${userId}`);
      const dayRecord = Array.isArray(data) ? data.find(r => r && r.date === date) : null;

      if (dayRecord && dayRecord.meals) {
        const recordedMeals = {
          breakfast: Boolean(dayRecord.meals.breakfast),
          lunch: Boolean(dayRecord.meals.lunch),
          dinner: Boolean(dayRecord.meals.dinner)
        };
        setMeals(recordedMeals);
        setLockedMeals(recordedMeals);
        setExtras(Array.isArray(dayRecord.extras) ? dayRecord.extras : []);
      } else {
        setMeals({ breakfast: false, lunch: false, dinner: false });
        setLockedMeals({ breakfast: false, lunch: false, dinner: false });
        setExtras([]);
      }
    } catch (err) {
      console.error('Fetch daily meal ledger error:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchDateRecord(selectedDate);
  }, [selectedDate, fetchDateRecord]);

  const bRate = hostelData?.mealCosts?.breakfast || 37;
  const lRate = hostelData?.mealCosts?.lunch || 37;
  const dRate = hostelData?.mealCosts?.dinner || 37;

  // Toggle handler: strictly blocks unchecking locked meals
  const handleMealToggle = (mealType) => {
    if (lockedMeals[mealType]) {
      setErrorMsg(`Statutory Security Lock: ${mealType.toUpperCase()} has been permanently ratified in the cooperative ledger. Administrative clearance from the Warden In-Charge is required for adjustments.`);
      setTimeout(() => setErrorMsg(''), 5000);
      return;
    }
    setMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
  };

  const addExtraItem = () => {
    if (!extraName.trim() || !extraCost || Number(extraCost) <= 0) return;
    setExtras(prev => [...prev, { itemName: extraName.trim(), cost: Number(extraCost) }]);
    setExtraName('');
    setExtraCost('');
  };

  const removeExtraItem = (idx) => {
    setExtras(prev => prev.filter((_, i) => i !== idx));
  };

  const calculateLiveTotal = () => {
    let mealCount = 0;
    let actualCost = 0;
    if (meals.breakfast) { mealCount++; actualCost += bRate; }
    if (meals.lunch) { mealCount++; actualCost += lRate; }
    if (meals.dinner) { mealCount++; actualCost += dRate; }

    let standardMealsCost = actualCost;
    let penaltyCost = 0;
    if (mealCount === 1) {
      const missed = [];
      if (!meals.breakfast) missed.push(bRate);
      if (!meals.lunch) missed.push(lRate);
      if (!meals.dinner) missed.push(dRate);
      penaltyCost = Math.min(...missed);
      standardMealsCost += penaltyCost;
    }
    return { 
      total: standardMealsCost + extras.reduce((s, i) => s + (Number(i.cost) || 0), 0), 
      mealCount, 
      penaltyCost 
    };
  };

  const handleSaveEntry = async () => {
    // If the student typed an extra item and clicked Submit without clicking "+", auto-include it
    let activeExtras = [...extras];
    if (extraName.trim() && Number(extraCost) > 0) {
      activeExtras.push({ itemName: extraName.trim(), cost: Number(extraCost) });
      setExtras(activeExtras);
      setExtraName('');
      setExtraCost('');
    }

    const hasAnyMeal = meals.breakfast || meals.lunch || meals.dinner;
    const hasAnyExtra = activeExtras.length > 0;

    // Allows submission if an extra item is added alone, even when 0 meals are selected
    if (!hasAnyMeal && !hasAnyExtra) {
      setErrorMsg('Statutory Quota Warning: Select at least one standard meal or register an approved supplementary extra to authenticate entry.');
      setTimeout(() => setErrorMsg(''), 4500);
      return;
    }

    if (!userId) {
      setErrorMsg('Authentication Session Error: Candidate profile token not verified. Please re-authenticate your session.');
      setTimeout(() => setErrorMsg(''), 4500);
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/meals/log', {
        userId,
        hostelId: typeof user?.hostelId === 'object' ? (user.hostelId?._id || user.hostelId?.hostelNumber || 'BH1') : (user?.hostelId || user?.hostelNo || 'BH1'),
        date: selectedDate,
        meals,
        extras: activeExtras,
        role: 'student'
      });
      setSuccessMsg('Dietary consumption & attendance registered and locked in Central Cooperative Ledger.');
      setTimeout(() => setSuccessMsg(''), 4500);
      fetchDateRecord(selectedDate);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Transaction Error: Failed to commit records to cooperative ledger.');
      setTimeout(() => setErrorMsg(''), 4500);
    } finally {
      setSaving(false);
    }
  };

  const liveCalc = calculateLiveTotal();
  const mealTiers = [
    { key: 'breakfast', label: 'Morning Breakfast Diet', shortLabel: 'Breakfast', cost: bRate, schedule: '07:30 - 09:30 HRS' },
    { key: 'lunch', label: 'Mid-Day Lunch Diet', shortLabel: 'Lunch', cost: lRate, schedule: '12:30 - 14:30 HRS' },
    { key: 'dinner', label: 'Evening Dinner Diet', shortLabel: 'Dinner', cost: dRate, schedule: '19:30 - 21:30 HRS' }
  ];

  const allMealsLocked = lockedMeals.breakfast && lockedMeals.lunch && lockedMeals.dinner;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10 font-sans text-slate-900 selection:bg-blue-950 selection:text-white">
      
      {/* 1. OFFICIAL TOP EMBLEM & STATUTORY STRIP */}
      <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 py-2 border-b-2 border-amber-500/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 shadow-xs">
        <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Central Hostel Cooperative Registry</span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-300 font-black hidden md:inline">Daily Diet & Attendance Log</span>
        </div>
        <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">
          Statute 4.2 • Verified Log
        </div>
      </div>

      {/* 2. PRIMARY OPERATIONAL CARD */}
      <div className="bg-white border border-slate-300 shadow-sm p-5 sm:p-7 border-t-4 border-t-blue-950">
        
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-200 pb-4 mb-6 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-blue-950 text-amber-400 border border-blue-900 shrink-0 mt-0.5 shadow-xs">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-sm sm:text-base text-blue-950 uppercase tracking-tight font-serif">
                  Statutory Daily Diet & Consumption Register
                </h2>
                <span className="hidden sm:inline-block text-[8px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5">
                  Official Record
                </span>
              </div>
              <p className="text-[11px] text-slate-600 font-semibold uppercase tracking-wide mt-1">
                Jurisdiction: <span className="text-slate-900 font-mono font-bold">{user?.hostelNo || user?.hostelId?.hostelNumber || 'CAMPUS RESIDENCE'}</span> • Candidate: <span className="text-blue-950 font-black font-serif">{user?.name}</span> (Roll: <span className="font-mono text-slate-900 font-bold">{user?.rollNo || 'N/A'}</span>)
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right w-full sm:w-auto">
            <span className="text-[9px] font-black uppercase bg-blue-50 text-blue-950 border border-blue-200 px-2.5 py-1 tracking-wider inline-block">
              Statute 4.2 • Dual-Diet Quota
            </span>
          </div>
        </div>

        {/* NOTIFICATION MESSAGES */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-300 border-l-4 border-l-red-800 text-red-950 p-3.5 text-xs font-bold uppercase mb-5 flex items-start gap-3 shadow-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-800 mt-0.5" />
            <div>
              <p className="font-black tracking-wide">Ledger Constraint Warning</p>
              <p className="text-[11px] font-medium text-red-900 mt-0.5 normal-case">{errorMsg}</p>
            </div>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-300 border-l-4 border-l-emerald-700 text-emerald-950 p-3.5 text-xs font-bold uppercase mb-5 flex items-start gap-3 shadow-xs">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
            <div>
              <p className="font-black tracking-wide">Transaction Ratified</p>
              <p className="text-[11px] font-medium text-emerald-900 mt-0.5 normal-case">{successMsg}</p>
            </div>
          </div>
        )}

        {/* STATUTORY REGISTRY DATE SELECTOR */}
        <div className="bg-slate-50 border border-slate-300 p-4 mb-6 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-700 uppercase tracking-widest block flex items-center gap-1.5 font-serif">
                <Calendar className="w-3.5 h-3.5 text-amber-700" />
                <span>Attendance Log Date</span>
              </label>
              <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                Diet records are sealed daily at conclusion of service.
              </p>
            </div>
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto border-2 border-slate-400 p-2 text-xs font-mono font-bold text-slate-950 outline-none focus:border-blue-950 bg-white"
            />
          </div>
        </div>

        {/* STATUTORY MEAL TILES (RATIFIED / ACTIVE / UNRECORDED) */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-700" />
              <span>Standard Dietary Rations Attendance</span>
            </h3>
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold">Standard Tariff Schedule</span>
          </div>

          {mealTiers.map(m => {
            const isLocked = lockedMeals[m.key];
            const isChecked = meals[m.key];

            return (
              <div
                key={m.key}
                onClick={() => handleMealToggle(m.key)}
                className={`flex items-center justify-between p-4 border-2 transition-all select-none ${
                  isLocked
                    ? 'bg-emerald-50/70 border-emerald-600 text-emerald-950 cursor-not-allowed shadow-xs'
                    : isChecked
                    ? 'bg-blue-50/70 border-blue-950 text-blue-950 cursor-pointer shadow-sm'
                    : 'bg-white border-slate-300 hover:bg-slate-50 hover:border-slate-400 cursor-pointer'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div
                    className={`w-5 h-5 border-2 flex items-center justify-center transition-colors shrink-0 mt-0.5 sm:mt-0 ${
                      isLocked
                        ? 'bg-emerald-800 border-emerald-800 text-white'
                        : isChecked
                        ? 'bg-blue-950 border-blue-950 text-white'
                        : 'border-slate-400 bg-white'
                    }`}
                  >
                    {(isChecked || isLocked) && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-black text-xs uppercase font-serif tracking-tight">{m.label}</span>
                      <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 border border-slate-300 px-1.5 py-0.2">
                        ₹{m.cost}/-
                      </span>
                    </div>
                    <p className="text-[9px] font-mono text-slate-500 uppercase tracking-tight mt-0.5">
                      Service Window: {m.schedule}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase bg-emerald-800 text-white px-2 py-1 tracking-widest border border-emerald-950 shadow-xs">
                      <Lock className="w-2.5 h-2.5" /> Sealed in Ledger
                    </span>
                  ) : isChecked ? (
                    <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase bg-blue-950 text-white px-2 py-1 tracking-widest border border-blue-950">
                      Authorized Entry
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold uppercase text-slate-400 border border-slate-300 bg-slate-50 px-2 py-1 tracking-wider">
                      Omitted
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* STATUTORY SUPPLEMENTARY EXTRAS REGISTER */}
        <div className="border border-slate-300 bg-slate-50/50 p-4 mb-6 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-300 pb-2 mb-3">
            <h3 className="text-[10px] font-black uppercase text-blue-950 tracking-wider font-serif flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-amber-700" />
              <span>Approved Supplementary Extras Registry</span>
            </h3>
            <span className="text-[8px] font-mono text-slate-500 uppercase font-bold">Ad-hoc Diet Adjustments</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input
              type="text"
              placeholder="Designate item (e.g. Boiled Egg, Milk, Curd, Special Diet)"
              value={extraName}
              onChange={e => setExtraName(e.target.value)}
              className="w-full border border-slate-400 p-2 text-xs font-bold text-slate-900 outline-none focus:border-blue-950 bg-white uppercase placeholder:normal-case placeholder:font-normal"
            />
            <div className="flex gap-2 shrink-0">
              <input
                type="number"
                placeholder="₹ Tariff"
                value={extraCost}
                onChange={e => setExtraCost(e.target.value)}
                className="w-28 border border-slate-400 p-2 text-xs font-mono font-bold text-slate-900 outline-none focus:border-blue-950 bg-white"
              />
              <button
                type="button"
                onClick={addExtraItem}
                className="bg-blue-950 hover:bg-blue-900 text-white font-black px-4 py-2 text-[10px] uppercase tracking-wider cursor-pointer transition flex items-center gap-1 border-b border-amber-500 active:scale-95 shadow-xs"
                title="Append extra item to daily assessment"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Append</span>
              </button>
            </div>
          </div>

          {extras.length > 0 ? (
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-slate-300 p-2 bg-white">
              {extras.map((ex, i) => (
                <div key={i} className="flex justify-between items-center bg-slate-50 p-2 border border-slate-200 text-xs font-bold text-slate-800 font-mono">
                  <span className="uppercase font-sans font-black text-slate-900">{ex.itemName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-950 font-black">₹{ex.cost}/-</span>
                    <button 
                      type="button" 
                      onClick={() => removeExtraItem(i)} 
                      className="text-red-700 font-black hover:text-red-900 cursor-pointer p-0.5 border border-red-200 bg-red-50 hover:bg-red-100 text-[10px]"
                      title="Remove Item"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-2 text-[9px] text-slate-400 font-mono uppercase font-bold tracking-wider">
              No supplementary extras logged for this date.
            </div>
          )}
        </div>

        {/* COMPUTED STATUTORY LEVY ASSESSMENT BOX */}
        <div className="bg-slate-100 border-2 border-slate-300 p-4 mb-6">
          <div className="flex justify-between items-center text-xs font-black uppercase font-serif">
            <span className="text-slate-800 tracking-wider">Computed Statutory Daily Dietary Levy:</span>
            <span className="text-2xl text-blue-950 font-serif font-black">₹{liveCalc.total}/-</span>
          </div>

          {liveCalc.mealCount === 1 && (
            <div className="mt-2.5 pt-2 border-t border-slate-300 flex items-start gap-2 text-amber-950 bg-amber-50/80 p-2 border border-amber-200">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase leading-relaxed font-mono">
                Statute 4.2 Minimum Quota Assessment: Single-meal attendance incurs mandatory ₹{liveCalc.penaltyCost} unselected meal charge appended to balance minimum residential diet requirement.
              </p>
            </div>
          )}
        </div>

        {/* AUTHENTICATION COMMIT BUTTON */}
        <button
          type="button"
          onClick={handleSaveEntry}
          disabled={saving || (allMealsLocked && extras.length === 0 && !extraName.trim())}
          className="w-full bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black py-3.5 text-xs uppercase tracking-widest cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-all shadow-sm border-b-2 border-amber-500 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              <span>Authenticating & Committing Ledger Entry...</span>
            </>
          ) : allMealsLocked && extras.length === 0 && !extraName.trim() ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Statutory Attendance Ratified • Entries Sealed Under Statute 4.2</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Commit Entry to Statutory Ledger • Authenticate</span>
            </>
          )}
        </button>

        <p className="text-center text-[9px] font-mono text-slate-400 uppercase mt-3 tracking-wider font-semibold">
          * Certified entries are immediately synchronized with the Master Comptroller Audit Register.
        </p>
      </div>
    </div>
  );
}