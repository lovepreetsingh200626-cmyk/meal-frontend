import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import { Utensils, PlusCircle, CheckCircle2, Lock, AlertCircle, ShieldCheck } from 'lucide-react';

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
      setErrorMsg(`Security Notice: ${mealType.toUpperCase()} is locked in the cooperative ledger. Contact mess committee for adjustments.`);
      setTimeout(() => setErrorMsg(''), 4500);
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
      setErrorMsg('Cooperative Rule: Select at least one diet or add an extra item to submit entry.');
      setTimeout(() => setErrorMsg(''), 4000);
      return;
    }

    if (!userId) {
      setErrorMsg('Session Error: User identification not found. Please log out and log back in.');
      setTimeout(() => setErrorMsg(''), 4000);
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
      setSuccessMsg('Meal attendance registered and locked successfully in cooperative ledger!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDateRecord(selectedDate);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error updating meal records.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const liveCalc = calculateLiveTotal();
  const mealTiers = [
    { key: 'breakfast', label: 'Breakfast', cost: bRate },
    { key: 'lunch', label: 'Lunch', cost: lRate },
    { key: 'dinner', label: 'Dinner', cost: dRate }
  ];

  const allMealsLocked = lockedMeals.breakfast && lockedMeals.lunch && lockedMeals.dinner;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 font-sans">
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-6 border-t-4 border-t-blue-900">
        
        {/* Header Strip */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
          <div>
            <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
              <Utensils className="w-4 h-4 text-orange-600" /> Daily Diet & Meal Logger
            </h2>
            <p className="text-[11px] text-gray-500 uppercase mt-0.5">
              Residence: {user?.hostelNo || user?.hostelId?.hostelNumber || 'Allotted Room'} • Member: {user?.name}
            </p>
          </div>
          <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-1">
            Min 2 Diets Rule Active
          </span>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-red-700 text-red-900 p-3 text-xs font-bold uppercase mb-4 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-green-50 border-l-4 border-green-700 text-green-900 p-3 text-xs font-bold uppercase mb-4 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-green-700" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Date Selector */}
        <div className="mb-5">
          <label className="text-[10px] font-bold text-gray-600 uppercase block mb-1">Select Attendance Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="w-full border border-gray-400 p-2.5 text-sm font-bold text-gray-800 outline-none focus:border-blue-900 rounded-xs bg-white"
          />
        </div>

        {/* MEAL SELECTION TILES WITH LOCK BADGES */}
        <div className="space-y-3 mb-6">
          {mealTiers.map(m => {
            const isLocked = lockedMeals[m.key];
            const isChecked = meals[m.key];

            return (
              <div
                key={m.key}
                onClick={() => handleMealToggle(m.key)}
                className={`flex items-center justify-between p-3.5 border transition-all select-none rounded-xs ${
                  isLocked
                    ? 'bg-emerald-50 border-emerald-600 text-emerald-950 cursor-not-allowed'
                    : isChecked
                    ? 'bg-blue-50 border-blue-900 text-blue-900 cursor-pointer shadow-xs'
                    : 'bg-white border-gray-300 hover:bg-gray-50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-xs uppercase">{m.label}</span>
                  <span className="text-[10px] font-bold text-gray-500 bg-white border border-gray-300 px-1.5 py-0.5">
                    ₹{m.cost}
                  </span>
                  {isLocked && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-700 text-white px-2 py-0.5 rounded-xs tracking-wider">
                      <Lock className="w-3 h-3" /> Locked in Ledger
                    </span>
                  )}
                </div>

                <div
                  className={`w-5 h-5 border flex items-center justify-center transition-colors ${
                    isLocked
                      ? 'bg-emerald-700 border-emerald-700'
                      : isChecked
                      ? 'bg-blue-900 border-blue-900'
                      : 'border-gray-400 bg-white'
                  }`}
                >
                  {(isChecked || isLocked) && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
              </div>
            );
          })}
        </div>

        {/* EXTRAS CONTAINER */}
        <div className="border-t border-gray-200 pt-4 mb-6">
          <h3 className="text-[10px] font-black uppercase text-gray-600 mb-2 tracking-wider">Add Extra Dining Items</h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              placeholder="e.g. Boiled Egg, Milk, Curd"
              value={extraName}
              onChange={e => setExtraName(e.target.value)}
              className="w-full border border-gray-400 p-2 text-xs outline-none focus:border-blue-900 rounded-xs"
            />
            <input
              type="number"
              placeholder="₹ Amount"
              value={extraCost}
              onChange={e => setExtraCost(e.target.value)}
              className="w-24 border border-gray-400 p-2 text-xs outline-none focus:border-blue-900 rounded-xs"
            />
            <button
              type="button"
              onClick={addExtraItem}
              className="bg-gray-100 border border-gray-400 px-3 py-2 cursor-pointer hover:bg-gray-200 transition"
              title="Add Item"
            >
              <PlusCircle className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {extras.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto border border-gray-200 p-2 bg-gray-50 mb-2">
              {extras.map((ex, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 border border-gray-300 text-xs font-bold text-gray-800">
                  <span className="uppercase">{ex.itemName}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-blue-900">₹{ex.cost}</span>
                    <button 
                      type="button" 
                      onClick={() => removeExtraItem(i)} 
                      className="text-red-700 font-bold hover:text-red-900 cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* TOTAL CALCULATION WITH 2-DIETS RULE NOTE */}
        <div className="bg-gray-100 border border-gray-300 p-3 mb-6 rounded-xs">
          <div className="flex justify-between items-center text-xs font-bold uppercase">
            <span className="text-gray-700">Computed Daily Cost:</span>
            <span className="text-xl text-blue-900 font-black">₹{liveCalc.total}</span>
          </div>
          {liveCalc.mealCount === 1 && (
            <p className="text-[9px] font-bold text-red-700 mt-1 uppercase leading-tight">
              * Minimum 2 diets rule: An additional ₹{liveCalc.penaltyCost} unselected meal charge is automatically appended.
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={handleSaveEntry}
          disabled={saving || (allMealsLocked && extras.length === 0 && !extraName.trim())}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white font-black py-3 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-60 transition-colors shadow-xs flex items-center justify-center gap-2"
        >
          {saving ? (
            'Recording in Cooperative Ledger...'
          ) : allMealsLocked && extras.length === 0 && !extraName.trim() ? (
            <>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>All Diets Locked & Cleared</span>
            </>
          ) : (
            'Submit / Update Daily Diet Record'
          )}
        </button>
      </div>
    </div>
  );
}