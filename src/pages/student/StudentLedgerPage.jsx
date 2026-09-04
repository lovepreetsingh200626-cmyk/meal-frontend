import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { 
  FileText, TrendingUp, CreditCard, ChevronRight, 
  Receipt, Calendar, IndianRupee, Wallet 
} from 'lucide-react';

export default function StudentLedgerPage({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      API.get(`/meals/user/${user._id || user.id}`)
        .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    }
  }, [user]);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthBill = history
    .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  const totalSpentAllTime = history.reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);
  const chartData = [...history].slice(0, 30).reverse();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 font-sans">
      
      {/* FINANCIAL LEDGER HEADER WITH QUICK INVOICE ACTION */}
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-l-4 border-l-blue-900">
        <div>
          <span className="text-[10px] font-black uppercase text-orange-600 tracking-wider flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5" /> Directorate of Mess Accounts & Ledger
          </span>
          <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight mt-0.5">
            Institutional Dietary Statement
          </h1>
          <p className="text-xs text-gray-500 uppercase">
            Candidate: {user?.name} | Roll: {user?.rollNo} | Hostel: {user?.hostelNo}
          </p>
        </div>

        <button
          onClick={() => navigate('/student/payments')}
          className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 text-xs uppercase flex items-center gap-2 transition cursor-pointer shadow-xs"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Clear Dues & Get Receipt</span>
          <ChevronRight className="w-4 h-4 text-orange-400" />
        </button>
      </div>

      {/* QUICK SUMMARY METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-blue-900 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Recorded Days</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{history.length}</p>
          </div>
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>

        <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-orange-500 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Month Billing</p>
            <p className="text-2xl font-black text-blue-900 mt-0.5">₹{currentMonthBill.toLocaleString()}/-</p>
          </div>
          <Wallet className="w-6 h-6 text-gray-400" />
        </div>

        <div className="bg-white border border-gray-300 p-4 rounded-sm flex items-center justify-between border-l-4 border-l-green-700 shadow-xs">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Accumulated Expenditure</p>
            <p className="text-2xl font-black text-green-700 mt-0.5">₹{totalSpentAllTime.toLocaleString()}/-</p>
          </div>
          <IndianRupee className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* 30-DAY ANALYTICS GRAPH */}
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm">
        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" /> 30-Day Financial Spending Analytics
          </h2>
        </div>
        <div className="p-5 h-64 w-full">
          {chartData.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400 text-xs font-bold uppercase">
              Insufficient Financial Data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                <XAxis dataKey="date" tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} minTickGap={20} />
                <YAxis tick={{fontSize: 10, fill: '#475569', fontWeight: 'bold'}} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip contentStyle={{ borderRadius: '2px', border: '1px solid #cbd5e1', fontSize: '11px', fontWeight: 'bold', color: '#0f172a', textTransform: 'uppercase' }} itemStyle={{ color: '#1e3a8a' }} />
                <Area type="monotone" dataKey="dailyTotalCost" name="Daily Cost" stroke="#1e3a8a" strokeWidth={2} fillOpacity={1} fill="url(#colorCost)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* FORMAL EXPENDITURE TABLE */}
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm overflow-hidden">
        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
          <h2 className="font-bold text-sm text-blue-900 uppercase flex items-center gap-2">
            <FileText className="w-4 h-4 text-orange-600" /> Formal Expenditure Ledger History
          </h2>
          <span className="text-[10px] font-bold text-gray-500 uppercase">
            Showing {history.length} Record{history.length === 1 ? '' : 's'}
          </span>
        </div>
        {history.length === 0 ? (
          <div className="text-center py-10 text-gray-500 text-xs font-bold uppercase">No records found.</div>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-gray-200 sticky top-0 border-b-2 border-gray-400">
                <tr className="text-gray-800 uppercase font-black tracking-wider">
                  <th className="p-3 border-r border-gray-300">Date</th>
                  <th className="p-3 border-r border-gray-300">Meals Attended</th>
                  <th className="p-3 border-r border-gray-300">Extras</th>
                  <th className="p-3 text-right">Total (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 font-medium">
                {history.map((rec) => (
                  <tr key={rec._id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 border-r border-gray-300 text-gray-900 font-bold">{rec.date}</td>
                    <td className="p-3 border-r border-gray-300">
                      <div className="flex items-center gap-1.5">
                        {rec.meals?.breakfast && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">B</span>}
                        {rec.meals?.lunch && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">L</span>}
                        {rec.meals?.dinner && <span className="bg-white border border-gray-400 text-blue-900 px-1.5 py-0.5 font-black uppercase">D</span>}
                        {rec.appliedDietRule === '1_DIET_BUMPED_TO_2' && <span className="text-[9px] bg-red-50 text-red-800 border border-red-200 px-1 font-bold uppercase ml-1">Min 2 Diets</span>}
                      </div>
                    </td>
                    <td className="p-3 border-r border-gray-300 text-gray-700 uppercase">
                      {rec.extras?.length > 0 ? rec.extras.map(e => `${e.itemName} (₹${e.cost})`).join(', ') : 'NIL'}
                    </td>
                    <td className="p-3 text-right font-black text-blue-900">₹{rec.dailyTotalCost || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}