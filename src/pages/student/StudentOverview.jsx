import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import QRCode from 'react-qr-code';
import { 
  BellRing, CreditCard, ChevronRight, GraduationCap, 
  BookOpen, Layers, ShieldCheck, Building, Receipt
} from 'lucide-react';

export default function StudentOverview({ user }) {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    if (user && (user._id || user.id)) {
      API.get(`/meals/user/${user._id || user.id}`)
        .then(res => setHistory(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
      API.get('/notices')
        .then(res => setNotices(Array.isArray(res.data) ? res.data : []))
        .catch(console.error);
    }
  }, [user]);

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const currentMonthBill = history
    .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  const billDisplayAmount = currentMonthBill > 0 ? currentMonthBill : 1100;
  const relevantNotices = notices.filter(n => n.hostelNo === 'ALL' || n.hostelNo === user?.hostelNo);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 font-sans">
      {/* Policy Marquee with lowercase scrollamount */}
      <div className="bg-red-800 py-1.5 border-b-2 border-red-950 mb-6">
        <marquee scrollamount="6" className="text-[11px] font-bold tracking-widest text-white uppercase">
          MANDATORY MESS POLICY: Minimum basic charge of ₹1100 for Boys and ₹1000 for Girls applies regardless of attendance.
        </marquee>
      </div>

      {/* STUDENT ACADEMIC DOSSIER BANNER */}
      <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-5 mb-6 border-l-4 border-l-blue-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-900 text-white flex items-center justify-center font-black text-xl border border-blue-950 shadow-inner overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user?.name} className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase() || 'S'
              )}
            </div>
            <div>
              <h2 className="text-base font-black text-blue-900 uppercase tracking-wide">{user?.name}</h2>
              <p className="text-[11px] font-bold text-gray-600 uppercase">
                Roll Number: <span className="text-gray-900">{user?.rollNo || 'N/A'}</span> | Student ID: <span className="text-gray-900">{user?.studentId || 'N/A'}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase bg-blue-50 text-blue-900 border border-blue-300 px-3 py-1">
              Hostel Allotment: {user?.hostelNo || 'N/A'}
            </span>
            <div className="p-1 bg-white border border-gray-300">
              <QRCode value={user?.studentId || user?.rollNo || 'GNDU'} size={44} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold uppercase">
          <div className="bg-gray-50 border border-gray-300 p-2.5">
            <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1">
              <GraduationCap className="w-3.5 h-3.5 text-blue-900" /> Course / Degree
            </span>
            <span className="text-blue-900 font-black">{user?.university || 'B.Tech'}</span>
          </div>
          <div className="bg-gray-50 border border-gray-300 p-2.5">
            <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-900" /> Department Branch
            </span>
            <span className="text-gray-900 font-black">{user?.department || 'N/A'}</span>
          </div>
          <div className="bg-gray-50 border border-gray-300 p-2.5">
            <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-blue-900" /> Academic Session
            </span>
            <span className="text-gray-900 font-black">{user?.session || '2024-2028'}</span>
          </div>
          <div className="bg-gray-50 border border-gray-300 p-2.5">
            <span className="text-[10px] text-gray-500 block mb-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-900" /> Social Category
            </span>
            <span className="text-orange-700 font-black">{user?.category || 'General'}</span>
          </div>
        </div>
      </div>

      {/* QUICK FINANCIAL CALLOUT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-sm md:col-span-2 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1 mb-1">
              <Receipt className="w-3.5 h-3.5 text-orange-600" /> Dining Dues & Invoicing Desk
            </span>
            <h3 className="text-sm font-bold text-gray-800 uppercase">
              Hostel Mess Account Clearance
            </h3>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Verify your logged dietary consumption, simulate online/cash settlement, and print or download your university-certified institutional payment receipt.
            </p>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => navigate('/student/payments')}
              className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 text-xs uppercase flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Open Payment & Receipt Desk</span>
              <ChevronRight className="w-4 h-4 text-orange-400" />
            </button>
            <button
              onClick={() => navigate('/student/ledger')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300 font-bold py-2 px-4 text-xs uppercase transition cursor-pointer"
            >
              View Full Ledger
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-300 p-5 rounded-sm shadow-sm border-l-4 border-l-orange-600 flex flex-col justify-between">
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Current Month Bill</p>
            <p className="text-3xl font-black text-blue-900 mt-1">₹{billDisplayAmount.toLocaleString()}/-</p>
            <p className="text-[10px] text-gray-500 mt-1">Calculated via daily logged diets</p>
          </div>
          <button
            onClick={() => navigate('/student/payments')}
            className="mt-4 w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-3 text-xs uppercase flex items-center justify-between transition cursor-pointer shadow-xs"
          >
            <span>Clear Dues & Receipt</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* OFFICIAL NOTICES FEED */}
      {relevantNotices.length > 0 && (
        <div className="bg-blue-950 border border-blue-900 text-white rounded-sm p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-blue-900 pb-2">
            <BellRing className="w-4 h-4 text-orange-400" />
            <h2 className="font-bold text-sm uppercase tracking-wider">Official University Notices & Decrees</h2>
          </div>
          <div className="space-y-4">
            {relevantNotices.map(n => (
              <div key={n._id} className="bg-white/5 p-4 border border-white/10">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-xs text-orange-300 uppercase">{n.title}</h3>
                  <span className="text-[10px] text-gray-400 uppercase">
                    {n.createdAt ? new Date(n.createdAt).toLocaleDateString() : 'Active Notice'}
                  </span>
                </div>
                <p className="text-xs text-gray-200 whitespace-pre-wrap">{n.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}