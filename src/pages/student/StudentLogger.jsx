import React, { useState, useEffect, useCallback } from 'react';
import API from '../../services/api';
import {
  Utensils,
  PlusCircle,
  CheckCircle2,
  Lock,
  AlertCircle,
  ShieldCheck,
  CalendarDays,
  Landmark,
  Loader2,
  AlertTriangle,
  Trash2,
  ReceiptText
} from 'lucide-react';

export default function StudentLogger({ user }) {
  // Use local date instead of UTC date to avoid date shifting in India.
  const getLocalDate = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDate();

  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [meals, setMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });

  const [lockedMeals, setLockedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false
  });

  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState('');
  const [extraCost, setExtraCost] = useState('');

  const [hostelData, setHostelData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const userId = user?._id || user?.id || user?.userId;

  const hostelKey =
    user?.hostelNo ||
    user?.hostelId?.hostelNumber ||
    user?.hostelId;

  /* -------------------------------------------------------
     HOSTEL MEAL RATES
  ------------------------------------------------------- */

  useEffect(() => {
    if (!hostelKey) return;

    API.get(`/hostels/${hostelKey}`)
      .then((res) => {
        setHostelData(res.data);
      })
      .catch((err) => {
        console.error('Hostel rates fetch error:', err);
      });
  }, [hostelKey]);

  /* -------------------------------------------------------
     FETCH SELECTED DATE RECORD
  ------------------------------------------------------- */

  const fetchDateRecord = useCallback(
    async (date) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setErrorMsg('');

      try {
        const { data } = await API.get(`/meals/user/${userId}`);

        const dayRecord = Array.isArray(data)
          ? data.find((record) => record && record.date === date)
          : null;

        if (dayRecord) {
          const recordMeals = dayRecord.meals || {};

          const recordedMeals = {
            breakfast:
              recordMeals.breakfast === true ||
              recordMeals.breakfast === 1 ||
              recordMeals.breakfast === 'true' ||
              recordMeals.breakfast === '1' ||
              recordMeals.breakfast === 'taken' ||
              recordMeals.breakfast === 'Taken',

            lunch:
              recordMeals.lunch === true ||
              recordMeals.lunch === 1 ||
              recordMeals.lunch === 'true' ||
              recordMeals.lunch === '1' ||
              recordMeals.lunch === 'taken' ||
              recordMeals.lunch === 'Taken',

            dinner:
              recordMeals.dinner === true ||
              recordMeals.dinner === 1 ||
              recordMeals.dinner === 'true' ||
              recordMeals.dinner === '1' ||
              recordMeals.dinner === 'taken' ||
              recordMeals.dinner === 'Taken'
          };

          setMeals(recordedMeals);

          // Once recorded, meal selection becomes locked.
          setLockedMeals(recordedMeals);

          setExtras(
            Array.isArray(dayRecord.extras)
              ? dayRecord.extras
              : []
          );
        } else {
          setMeals({
            breakfast: false,
            lunch: false,
            dinner: false
          });

          setLockedMeals({
            breakfast: false,
            lunch: false,
            dinner: false
          });

          setExtras([]);
        }
      } catch (err) {
        console.error('Fetch daily meal ledger error:', err);

        setErrorMsg(
          err.response?.data?.message ||
            'Unable to load the meal record for this date.'
        );
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 250);
      }
    },
    [userId]
  );

  useEffect(() => {
    fetchDateRecord(selectedDate);
  }, [selectedDate, fetchDateRecord]);

  /* -------------------------------------------------------
     MEAL RATES
  ------------------------------------------------------- */

  const bRate = Number(hostelData?.mealCosts?.breakfast) || 37;
  const lRate = Number(hostelData?.mealCosts?.lunch) || 37;
  const dRate = Number(hostelData?.mealCosts?.dinner) || 37;

  /* -------------------------------------------------------
     NOTIFICATIONS
  ------------------------------------------------------- */

  const showError = (message) => {
    setErrorMsg(message);
    setSuccessMsg('');

    setTimeout(() => {
      setErrorMsg('');
    }, 4500);
  };

  const showSuccess = (message) => {
    setSuccessMsg(message);
    setErrorMsg('');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4500);
  };

  /* -------------------------------------------------------
     MEAL TOGGLE
  ------------------------------------------------------- */

  const handleMealToggle = (mealType) => {
    if (lockedMeals[mealType]) {
      showError(
        `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} has already been recorded for this date and cannot be changed.`
      );
      return;
    }

    setMeals((prev) => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  /* -------------------------------------------------------
     EXTRAS
  ------------------------------------------------------- */

  const addExtraItem = () => {
    const name = extraName.trim();
    const cost = Number(extraCost);

    if (!name) {
      showError('Please enter the name of the extra item.');
      return;
    }

    if (!cost || cost <= 0) {
      showError('Please enter a valid amount for the extra item.');
      return;
    }

    setExtras((prev) => [
      ...prev,
      {
        itemName: name,
        cost
      }
    ]);

    setExtraName('');
    setExtraCost('');
  };

  const removeExtraItem = (index) => {
    setExtras((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  /* -------------------------------------------------------
     CALCULATE TOTAL
  ------------------------------------------------------- */

  const calculateLiveTotal = () => {
    let mealCount = 0;
    let mealCost = 0;

    if (meals.breakfast) {
      mealCount++;
      mealCost += bRate;
    }

    if (meals.lunch) {
      mealCount++;
      mealCost += lRate;
    }

    if (meals.dinner) {
      mealCount++;
      mealCost += dRate;
    }

    /*
      Existing minimum meal logic preserved.
      If exactly one meal is selected, the cheapest missed meal
      is added as the minimum diet charge.
    */

    let penaltyCost = 0;

    if (mealCount === 1) {
      const missedMeals = [];

      if (!meals.breakfast) missedMeals.push(bRate);
      if (!meals.lunch) missedMeals.push(lRate);
      if (!meals.dinner) missedMeals.push(dRate);

      if (missedMeals.length > 0) {
        penaltyCost = Math.min(...missedMeals);
      }
    }

    const extrasCost = extras.reduce(
      (sum, item) => sum + (Number(item.cost) || 0),
      0
    );

    return {
      total: mealCost + penaltyCost + extrasCost,
      mealCount,
      penaltyCost,
      extrasCost
    };
  };

  /* -------------------------------------------------------
     SAVE ENTRY
  ------------------------------------------------------- */

  const handleSaveEntry = async () => {
    let activeExtras = [...extras];

    // Automatically add an extra that is still inside the input box.
    if (
      extraName.trim() &&
      Number(extraCost) > 0
    ) {
      activeExtras.push({
        itemName: extraName.trim(),
        cost: Number(extraCost)
      });

      setExtras(activeExtras);
      setExtraName('');
      setExtraCost('');
    }

    const hasAnyMeal =
      meals.breakfast ||
      meals.lunch ||
      meals.dinner;

    const hasAnyExtra =
      activeExtras.length > 0;

    if (!hasAnyMeal && !hasAnyExtra) {
      showError(
        'Please select at least one meal or add an extra item before saving.'
      );
      return;
    }

    if (!userId) {
      showError(
        'Your student session could not be verified. Please log in again.'
      );
      return;
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      await API.post('/meals/log', {
        userId,

        hostelId:
          typeof user?.hostelId === 'object'
            ? (
                user.hostelId?._id ||
                user.hostelId?.hostelNumber ||
                'BH1'
              )
            : (
                user?.hostelId ||
                user?.hostelNo ||
                'BH1'
              ),

        date: selectedDate,

        meals,

        extras: activeExtras,

        role: 'student'
      });

      showSuccess(
        'Your meal record has been saved successfully.'
      );

      await fetchDateRecord(selectedDate);
    } catch (err) {
      console.error('Save meal entry error:', err);

      showError(
        err.response?.data?.message ||
          'Unable to save the meal record. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  /* -------------------------------------------------------
     DATA
  ------------------------------------------------------- */

  const liveCalc = calculateLiveTotal();

  const mealTiers = [
    {
      key: 'breakfast',
      label: 'Breakfast',
      description: 'Morning meal',
      cost: bRate,
      schedule: '07:30 – 09:30'
    },
    {
      key: 'lunch',
      label: 'Lunch',
      description: 'Mid-day meal',
      cost: lRate,
      schedule: '12:30 – 14:30'
    },
    {
      key: 'dinner',
      label: 'Dinner',
      description: 'Evening meal',
      cost: dRate,
      schedule: '19:30 – 21:30'
    }
  ];

  const allMealsLocked =
    lockedMeals.breakfast &&
    lockedMeals.lunch &&
    lockedMeals.dinner;

  const canSave =
    !saving &&
    !(
      allMealsLocked &&
      extras.length === 0 &&
      !extraName.trim()
    );

  /* -------------------------------------------------------
     RENDER
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-10">

      {/* TOP INFORMATION STRIP */}
      <div className="bg-slate-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-200">
              Hostel Mess Management
            </span>
          </div>

          <span className="text-[9px] sm:text-[10px] text-slate-400 font-medium">
            Student Meal Registration
          </span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 py-5 sm:py-7">

        {/* LOADING */}
        {loading ? (
          <div className="min-h-[55vh] bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center">

            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <Loader2 className="w-6 h-6 text-blue-700 animate-spin" />
            </div>

            <p className="text-sm font-semibold text-slate-700">
              Loading meal record...
            </p>

            <p className="text-xs text-slate-400 mt-1">
              Please wait a moment
            </p>
          </div>
        ) : (
          <div className="space-y-5">

            {/* PAGE HEADER */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="h-1 bg-blue-800" />

              <div className="p-5 sm:p-7">

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">

                  <div className="flex items-start gap-4">

                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                      <Landmark className="w-5 h-5 sm:w-6 sm:h-6 text-blue-700" />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1">

                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 text-[9px] font-bold uppercase tracking-wide">
                          <ReceiptText className="w-3 h-3" />
                          Meal Register
                        </span>

                        {allMealsLocked && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-100 text-[9px] font-bold uppercase tracking-wide">
                            <Lock className="w-3 h-3" />
                            Locked
                          </span>
                        )}

                      </div>

                      <h1 className="text-lg sm:text-2xl font-bold text-slate-900">
                        Daily Meal Registration
                      </h1>

                      <p className="text-xs sm:text-sm text-slate-500 mt-1">
                        Select the meals you want to record for your hostel mess.
                      </p>
                    </div>

                  </div>

                  <div className="sm:text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Student
                    </p>

                    <p className="text-sm font-semibold text-slate-800 mt-0.5">
                      {user?.name || 'Student'}
                    </p>

                    <p className="text-xs text-slate-500">
                      Roll No: {user?.rollNo || 'N/A'}
                    </p>
                  </div>

                </div>

              </div>
            </section>

            {/* NOTIFICATIONS */}
            {errorMsg && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3">

                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Unable to complete request
                  </p>

                  <p className="text-xs text-red-700 mt-0.5">
                    {errorMsg}
                  </p>
                </div>

              </div>
            )}

            {successMsg && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-start gap-3">

                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Meal record saved
                  </p>

                  <p className="text-xs text-emerald-700 mt-0.5">
                    {successMsg}
                  </p>
                </div>

              </div>
            )}

            {/* DATE SELECTOR */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                    <CalendarDays className="w-5 h-5 text-slate-600" />
                  </div>

                  <div>
                    <h2 className="text-sm font-bold text-slate-800">
                      Select Date
                    </h2>

                    <p className="text-xs text-slate-500 mt-0.5">
                      Choose the day for your meal registration.
                    </p>
                  </div>

                </div>

                <input
                  type="date"
                  value={selectedDate}
                  max={todayStr}
                  onChange={(e) =>
                    setSelectedDate(e.target.value)
                  }
                  className="w-full sm:w-auto min-w-[180px] px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-medium text-slate-800 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition"
                />

              </div>
            </section>

            {/* MEALS */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">

                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-blue-700" />
                    Today's Meals
                  </h2>

                  <p className="text-xs text-slate-500 mt-1">
                    Tap a meal to mark it as taken.
                  </p>
                </div>

                <div className="text-xs text-slate-500">
                  {liveCalc.mealCount} of 3 meals selected
                </div>

              </div>

              <div className="space-y-3">

                {mealTiers.map((meal) => {
                  const isLocked = lockedMeals[meal.key];
                  const isChecked = meals[meal.key];

                  return (
                    <button
                      type="button"
                      key={meal.key}
                      onClick={() =>
                        handleMealToggle(meal.key)
                      }
                      disabled={isLocked}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        isLocked
                          ? 'bg-emerald-50 border-emerald-200 cursor-not-allowed'
                          : isChecked
                          ? 'bg-blue-50 border-blue-300 shadow-sm'
                          : 'bg-white border-slate-200 hover:border-blue-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-3 min-w-0">

                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isLocked
                                ? 'bg-emerald-100 text-emerald-700'
                                : isChecked
                                ? 'bg-blue-700 text-white'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {isLocked ? (
                              <Lock className="w-4 h-4" />
                            ) : (
                              <Utensils className="w-4 h-4" />
                            )}
                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-bold text-slate-900">
                                {meal.label}
                              </h3>

                              {isLocked && (
                                <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                                  Recorded
                                </span>
                              )}

                            </div>

                            <p className="text-xs text-slate-500 mt-0.5">
                              {meal.description} • {meal.schedule}
                            </p>

                          </div>

                        </div>

                        <div className="flex items-center gap-3 shrink-0">

                          <span className="hidden sm:block text-sm font-bold text-slate-700">
                            ₹{meal.cost}
                          </span>

                          <div
                            className={`w-6 h-6 rounded-md border-2 flex items-center justify-center ${
                              isLocked
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : isChecked
                                ? 'bg-blue-700 border-blue-700 text-white'
                                : 'border-slate-300 bg-white'
                            }`}
                          >
                            {isChecked && (
                              <CheckCircle2 className="w-4 h-4" />
                            )}
                          </div>

                        </div>

                      </div>

                      <div className="sm:hidden mt-3 pt-3 border-t border-slate-200/70">
                        <span className="text-xs font-semibold text-slate-600">
                          Meal charge: ₹{meal.cost}
                        </span>
                      </div>

                    </button>
                  );
                })}

              </div>
            </section>

            {/* EXTRAS */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6">

              <div className="flex items-start justify-between gap-3 mb-5">

                <div className="flex items-start gap-3">

                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-5 h-5 text-orange-600" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Extra Items
                    </h2>

                    <p className="text-xs text-slate-500 mt-1">
                      Add any additional mess items charged separately.
                    </p>
                  </div>

                </div>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2">

                <input
                  type="text"
                  value={extraName}
                  maxLength={100}
                  onChange={(e) =>
                    setExtraName(e.target.value)
                  }
                  placeholder="Item name"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={extraCost}
                  onChange={(e) =>
                    setExtraCost(e.target.value)
                  }
                  placeholder="Amount ₹"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
                />

                <button
                  type="button"
                  onClick={addExtraItem}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  Add
                </button>

              </div>

              {/* EXTRA LIST */}
              {extras.length > 0 ? (
                <div className="mt-4 space-y-2">

                  {extras.map((item, index) => (
                    <div
                      key={`${item.itemName}-${index}`}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200"
                    >

                      <div className="flex items-center gap-3 min-w-0">

                        <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                          <PlusCircle className="w-4 h-4 text-slate-500" />
                        </div>

                        <span className="text-sm font-semibold text-slate-800 truncate">
                          {item.itemName}
                        </span>

                      </div>

                      <div className="flex items-center gap-3 shrink-0">

                        <span className="text-sm font-bold text-slate-800">
                          ₹{Number(item.cost) || 0}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeExtraItem(index)
                          }
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 transition"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>

                    </div>
                  ))}

                </div>
              ) : (
                <div className="mt-4 py-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 text-center">

                  <p className="text-xs font-medium text-slate-400">
                    No extra items added
                  </p>

                </div>
              )}

            </section>

            {/* BILL SUMMARY */}
            <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              <div className="p-5 sm:p-6">

                <div className="flex items-center gap-2 mb-5">
                  <ReceiptText className="w-4 h-4 text-blue-700" />

                  <h2 className="text-base font-bold text-slate-900">
                    Daily Summary
                  </h2>
                </div>

                <div className="space-y-3">

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Selected meals
                    </span>

                    <span className="font-semibold text-slate-800">
                      {liveCalc.mealCount}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">
                      Meal charges
                    </span>

                    <span className="font-semibold text-slate-800">
                      ₹{liveCalc.total - liveCalc.extrasCost - liveCalc.penaltyCost}
                    </span>
                  </div>

                  {liveCalc.extrasCost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">
                        Extra items
                      </span>

                      <span className="font-semibold text-slate-800">
                        ₹{liveCalc.extrasCost}
                      </span>
                    </div>
                  )}

                  {liveCalc.penaltyCost > 0 && (
                    <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">

                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />

                      <div>
                        <p className="text-xs font-semibold text-amber-800">
                          Minimum meal charge applied
                        </p>

                        <p className="text-[11px] text-amber-700 mt-0.5">
                          Only one meal is selected, so an additional ₹
                          {liveCalc.penaltyCost} minimum-diet charge has
                          been included.
                        </p>
                      </div>

                    </div>
                  )}

                </div>

                <div className="border-t border-slate-200 mt-5 pt-5 flex items-center justify-between">

                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      Estimated Daily Total
                    </p>

                    <p className="text-[11px] text-slate-400 mt-1">
                      Based on the current hostel meal rates
                    </p>
                  </div>

                  <p className="text-2xl sm:text-3xl font-bold text-blue-800">
                    ₹{liveCalc.total}
                  </p>

                </div>

              </div>
            </section>

            {/* SAVE BUTTON */}
            <section>

              <button
                type="button"
                onClick={handleSaveEntry}
                disabled={!canSave}
                className="w-full rounded-xl bg-blue-800 hover:bg-blue-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3.5 px-5 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-sm"
              >

                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving meal record...
                  </>
                ) : allMealsLocked &&
                  extras.length === 0 &&
                  !extraName.trim() ? (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    All meals recorded
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Save Meal Record
                  </>
                )}

              </button>

              <div className="flex items-center justify-center gap-1.5 mt-3 text-[10px] text-slate-400">
                <Lock className="w-3 h-3" />
                Recorded meals cannot be changed later.
              </div>

            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-[10px] text-slate-400">
        Hostel Mess Management System • Student Services
      </footer>

    </div>
  );
}