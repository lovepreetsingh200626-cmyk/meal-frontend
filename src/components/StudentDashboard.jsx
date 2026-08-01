import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { 
  Utensils, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  LogOut, 
  CheckCircle2, 
  Clock, 
  IndianRupee, 
  Building,
  Receipt,
  AlertCircle,
  ShieldCheck,
  Wallet,
  MessageSquareWarning,
  Send
} from 'lucide-react';

export default function StudentDashboard({ user, onLogout, onOpenProfile }) {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [meals, setMeals] = useState({ breakfast: false, lunch: false, dinner: false });
  const [extras, setExtras] = useState([]);
  const [extraName, setExtraName] = useState('');
  const [extraCost, setExtraCost] = useState('');
  const [history, setHistory] = useState([]);
  const [hostelData, setHostelData] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // --- COMPLAINT STATES ---
  const [complaints, setComplaints] = useState([]);
  const [complaintCategory, setComplaintCategory] = useState('Food Quality');
  const [complaintSubject, setComplaintSubject] = useState('');
  const [complaintDesc, setComplaintDesc] = useState('');
  const [complaintPhoto, setComplaintPhoto] = useState('');
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    fetchHostelDetails();
    fetchHistory();
    fetchComplaints();
  }, [user]);

  const fetchHostelDetails = async () => {
    try {
      const { data } = await API.get(`/hostels/${user.hostelNo}`);
      setHostelData(data);
    } catch (err) {
      console.error('Failed to load hostel details:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data } = await API.get(`/meals/user/${user._id}`);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const fetchComplaints = async () => {
    try {
      const { data } = await API.get(`/complaints/user/${user._id}`);
      setComplaints(data || []);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    }
  };

  const handleMealToggle = (mealType) => {
    setMeals(prev => ({ ...prev, [mealType]: !prev[mealType] }));
  };

  const addExtraItem = () => {
    if (!extraName || !extraCost) return;
    setExtras([...extras, { itemName: extraName, cost: Number(extraCost) }]);
    setExtraName('');
    setExtraCost('');
  };

  const removeExtraItem = (index) => {
    setExtras(extras.filter((_, idx) => idx !== index));
  };

  const calculateLiveTotal = () => {
    let mealCount = 0;
    if (meals.breakfast) mealCount++;
    if (meals.lunch) mealCount++;
    if (meals.dinner) mealCount++;

    const dietRate = 37; 
    let standardMealsCost = 0;

    if (mealCount === 1) {
      standardMealsCost = dietRate * 2; 
    } else if (mealCount > 1) {
      standardMealsCost = mealCount * dietRate;
    }

    const extrasCost = extras.reduce((sum, item) => sum + Number(item.cost), 0);
    return {
      total: standardMealsCost + extrasCost,
      mealCount
    };
  };

  const handleSaveEntry = async () => {
    if (!meals.breakfast && !meals.lunch && !meals.dinner) {
      setErrorMsg('You must select at least one standard meal to save a log.');
      setTimeout(() => setErrorMsg(''), 4000);
      return; 
    }

    setSaving(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      await API.post('/meals/log', {
        userId: user._id,
        hostelId: user.hostelId._id || user.hostelId,
        date: selectedDate,
        meals,
        extras
      });
      await fetchHistory();
      setSuccessMsg('Meal record saved successfully!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error saving record');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  // --- SUBMIT COMPLAINT LOGIC ---
  const handleComplaintSubmit = async (e) => {
    e.preventDefault();
    if (!complaintSubject.trim() || !complaintDesc.trim()) return;

    setSubmittingComplaint(true);
    try {
      await API.post('/complaints', {
        userId: user._id,
        hostelId: user.hostelId._id || user.hostelId,
        hostelNo: user.hostelNo,
        category: complaintCategory,
        subject: complaintSubject,
        description: complaintDesc,
        photoProof: complaintPhoto
      });
      setComplaintSubject('');
      setComplaintDesc('');
      setComplaintPhoto('');
      setSuccessMsg('Complaint submitted successfully to hostel wardens!');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchComplaints();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit complaint.');
      setTimeout(() => setErrorMsg(''), 4000);
    } finally {
      setSubmittingComplaint(false);
    }
  };

  const totalSpentAllTime = history.reduce((sum, r) => sum + (r.dailyTotalCost || 0), 0);
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthBill = history
    .filter(r => r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (r.dailyTotalCost || 0), 0);

  const liveCalc = calculateLiveTotal();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 font-sans relative overflow-hidden selection:bg-blue-600 selection:text-white">
      
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-100/60 to-transparent pointer-events-none" />

      {/* Top Banner */}
      <nav className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div onClick={onOpenProfile} className="flex items-center gap-3.5 cursor-pointer group hover:opacity-80 transition" title="Edit Profile">
            <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-md shadow-blue-600/20 overflow-hidden">
              {user.profilePhoto ? <img src={user.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-extrabold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                {user.name}
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">
                Roll No: <span className="text-slate-700 font-semibold uppercase">{user.rollNo}</span>
                {user.studentId && ` • ID: ${user.studentId}`}
                {user.dob && ` • DOB: ${user.dob}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-lg text-xs font-medium text-blue-900">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Hostel: <strong className="text-blue-950 uppercase">{user.hostelNo}</strong></span>
            </div>
            <button onClick={onLogout} className="flex items-center gap-1.5 text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 px-3.5 py-2 rounded-lg transition cursor-pointer">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 mt-8 relative z-10">
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Logged Days</p><p className="text-3xl font-extrabold text-slate-900 mt-1.5">{history.length}</p></div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 border flex items-center justify-center"><Calendar className="w-6 h-6 text-slate-600" /></div>
          </div>
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">This Month's Bill</p><p className="text-3xl font-extrabold text-blue-600 mt-1.5">₹{currentMonthBill}</p></div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 border flex items-center justify-center"><Wallet className="w-6 h-6 text-blue-600" /></div>
          </div>
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accumulated Bill</p><p className="text-3xl font-extrabold text-emerald-600 mt-1.5">₹{totalSpentAllTime}</p></div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 border flex items-center justify-center"><IndianRupee className="w-6 h-6 text-emerald-600" /></div>
          </div>
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl shadow-sm flex items-center justify-between">
            <div><p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contact Mobile</p><p className="text-xl font-bold text-slate-800 mt-1.5">+91 {user.mobileNo}</p></div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 border flex items-center justify-center"><Clock className="w-6 h-6 text-slate-600" /></div>
          </div>
        </div>

        {errorMsg && <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3"><AlertCircle className="w-5 h-5 text-rose-500 shrink-0" /><span>{errorMsg}</span></div>}
        {successMsg && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3.5 rounded-xl text-sm mb-6 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" /><span>{successMsg}</span></div>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Meal Entry Form */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Utensils className="w-5 h-5 text-blue-600" /> Daily Meal Logger</h2>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer" />
            </div>

            <div className="space-y-3 mb-6">
              {[{ key: 'breakfast', label: 'Breakfast', cost: 37 }, { key: 'lunch', label: 'Lunch', cost: 37 }, { key: 'dinner', label: 'Dinner', cost: 37 }].map(meal => (
                <div key={meal.key} onClick={() => handleMealToggle(meal.key)} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition select-none ${meals[meal.key] ? 'bg-blue-50/80 border-blue-600 text-blue-950 shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  <div className="flex items-center gap-3.5">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${meals[meal.key] ? 'bg-blue-600 border-blue-600' : 'bg-white'}`}>{meals[meal.key] && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}</div>
                    <span className="font-bold text-sm capitalize">{meal.label}</span>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${meals[meal.key] ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>₹{meal.cost}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-5 mb-6">
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Extra Food Items</h3>
              <div className="flex gap-2 mb-3">
                <input type="text" placeholder="e.g. Milk, Maggi" value={extraName} onChange={e => setExtraName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm" />
                <input type="number" placeholder="₹" value={extraCost} onChange={e => setExtraCost(e.target.value)} className="w-24 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-sm" />
                <button type="button" onClick={addExtraItem} className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3.5 py-2 rounded-lg cursor-pointer"><PlusCircle className="w-5 h-5" /></button>
              </div>
              {extras.length > 0 && (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {extras.map((ex, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-slate-50 px-3.5 py-2 rounded-lg border text-xs font-medium text-slate-700">
                      <span>{ex.itemName}</span>
                      <div className="flex items-center gap-3"><span className="font-bold text-slate-900">₹{ex.cost}</span><button onClick={() => removeExtraItem(idx)} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button></div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-slate-600">Computed Day Total:</span><span className="text-2xl font-extrabold text-blue-700">₹{liveCalc.total}</span></div>
              {liveCalc.mealCount === 1 && <p className="text-[11px] font-semibold text-amber-700 mt-1">* 1 diet selected: Minimum 2 diets (₹74) applied.</p>}
            </div>

            <button onClick={handleSaveEntry} disabled={saving} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm shadow-blue-600/20 disabled:opacity-50 cursor-pointer text-sm">
              {saving ? 'Saving...' : `Save Record for ${selectedDate}`}
            </button>
          </div>

          {/* Ledger Table & Complaints Section */}
          <div className="space-y-8 lg:col-span-2">
            
            {/* Ledger Table */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2"><Receipt className="w-5 h-5 text-blue-600" /> Meal & Expenditure Ledger</h2>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border">Sorted by Latest</span>
              </div>
              {history.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-sm">No meal records saved yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 text-xs uppercase font-bold tracking-wider">
                        <th className="pb-3.5 pl-2">Date</th>
                        <th className="pb-3.5">Meals Attended</th>
                        <th className="pb-3.5">Extras</th>
                        <th className="pb-3.5 text-right pr-2">Day Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {history.map((rec) => (
                        <tr key={rec._id} className="hover:bg-blue-50/40 transition">
                          <td className="py-3.5 pl-2 font-semibold text-slate-800">{rec.date}</td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-1.5">
                              {rec.meals.breakfast && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">B</span>}
                              {rec.meals.lunch && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">L</span>}
                              {rec.meals.dinner && <span className="bg-blue-50 border border-blue-200 text-blue-700 px-2 py-0.5 rounded text-xs font-bold">D</span>}
                              {rec.appliedDietRule === '1_DIET_BUMPED_TO_2' && <span className="text-[10px] bg-amber-50 text-amber-700 border px-1.5 py-0.5 rounded font-bold">Min 2 Diets</span>}
                            </div>
                          </td>
                          <td className="py-3.5 text-xs font-medium text-slate-600">{rec.extras?.length > 0 ? rec.extras.map(e => `${e.itemName} (₹${e.cost})`).join(', ') : 'None'}</td>
                          <td className="py-3.5 text-right pr-2 font-bold text-slate-900">₹{rec.dailyTotalCost || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* --- COMPLAINTS SECTION --- */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
              <h2 className="font-extrabold text-lg text-slate-900 flex items-center gap-2 mb-4">
                <MessageSquareWarning className="w-5 h-5 text-amber-600" />
                <span>Hostel Mess Complaints & Issues</span>
              </h2>

              <form onSubmit={handleComplaintSubmit} className="space-y-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <select 
                      value={complaintCategory} 
                      onChange={e => setComplaintCategory(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none cursor-pointer"
                    >
                      <option value="Food Quality">Food Quality</option>
                      <option value="Cleanliness">Cleanliness & Hygiene</option>
                      <option value="Timing">Mess Timings</option>
                      <option value="Staff Behavior">Staff Behavior</option>
                      <option value="Other">Other Issue</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Subject</label>
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Rice was undercooked"
                      value={complaintSubject}
                      onChange={e => setComplaintSubject(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                  <textarea 
                    required
                    rows="2"
                    placeholder="Provide detailed information regarding the issue..."
                    value={complaintDesc}
                    onChange={e => setComplaintDesc(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Photo Proof (Optional)</label>
                  <div className="flex items-center gap-3">
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        if (file.size > 2 * 1024 * 1024) {
                          alert('Image size must be less than 2MB.');
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => setComplaintPhoto(reader.result);
                        reader.readAsDataURL(file);
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
                    />
                    {complaintPhoto && <span className="text-xs text-emerald-600 font-semibold">Image Attached ✓</span>}
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={submittingComplaint}
                  className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComplaint ? 'Submitting...' : 'Submit Complaint'}</span>
                </button>
              </form>

              {/* Complaints List */}
              <h3 className="text-xs font-bold uppercase text-slate-400 mb-3 tracking-wider">Your Submitted Complaints</h3>
              {complaints.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs italic">You have not raised any complaints yet.</div>
              ) : (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {complaints.map(c => (
                    <div key={c._id} className="border border-slate-200 p-4 rounded-xl bg-white shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded uppercase">{c.category}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase border ${
                          c.status === 'Resolved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          c.status === 'In Progress' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>
                          {c.status}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                        <p className="text-xs text-slate-600 mt-1">{c.description}</p>
                      </div>

                      {c.photoProof && (
                        <div className="mt-2">
                          <a href={c.photoProof} target="_blank" rel="noreferrer">
                            <img src={c.photoProof} alt="Proof" className="w-20 h-20 object-cover rounded-lg border border-slate-200 hover:opacity-90 transition" title="Click to view full image" />
                          </a>
                        </div>
                      )}

                      {c.adminRemark && (
                        <div className="bg-amber-50/60 border border-amber-200 p-2.5 rounded-lg text-xs text-amber-900 mt-2">
                          <strong>Warden / Admin Response:</strong> {c.adminRemark}
                        </div>
                      )}
                      <p className="text-[10px] text-slate-400 text-right">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}