import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CreditCard, Printer, CheckCircle2, 
  Receipt, AlertCircle, Check, Loader2, Clock, AlertTriangle 
} from 'lucide-react';

export default function StudentPaymentPage({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingMockPay, setProcessingMockPay] = useState(false);
  const [paidReceiptData, setPaidReceiptData] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (user && (user._id || user.id)) {
      fetchHistory();
    }
  }, [user]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/meals/user/${user._id || user.id}`);
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Could not fetch student meal ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  
  // 1. Sum up all meal and extra costs logged for the current month
  const currentMonthMealsCost = history
    .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  // 2. Determine base maintenance fee (1000 for girls, 1100 for boys)
  const baseMaintenanceFee = (user?.gender === 'female' || user?.category?.toLowerCase().includes('girl')) ? 1000 : 1100;

  // 3. Minimum Bill Logic: If consumed diets exceed base fee, add them. Otherwise, default to base fee.
  const billAmountToPay = currentMonthMealsCost > baseMaintenanceFee 
    ? baseMaintenanceFee + currentMonthMealsCost 
    : baseMaintenanceFee;

  // Inlined PDF Generator (Invoice & Settlement Slip)
  const handlePrintReceipt = () => {
    try {
      const doc = new jsPDF();
      const paymentDetails = receiptToDisplay;

      // 1. Private Header Banner
      doc.setFillColor(30, 58, 138);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('STUDENT MESS & DIET LEDGER SYSTEM', 105, 11, { align: 'center' });

      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'normal');
      doc.text('INDEPENDENT MESS COMMITTEE • DUE ASSESSMENT & INVOICE SLIP', 105, 18, { align: 'center' });

      // 2. Receipt Metadata
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Invoice / Slip No: ${paymentDetails?.receiptNo || 'N/A'}`, 14, 34);
      doc.text(`Reference Token: ${paymentDetails?.txnId || 'N/A'}`, 14, 40);
      doc.text(`Assessment Date: ${paymentDetails?.date || new Date().toLocaleString()}`, 14, 46);

      // 3. Member Dossier Table
      autoTable(doc, {
        startY: 52,
        theme: 'grid',
        headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
        head: [['Member Record Field', 'Student Cooperative Particulars']],
        body: [
          ['Student Name', (user?.name || 'N/A').toUpperCase()],
          ['Roll Number', String(user?.rollNo || 'N/A')],
          ['Member Student ID', String(user?.studentId || 'N/A')],
          ['Allotted Residence', String(user?.hostelNo || 'N/A')],
          ['Course / Program', String(user?.university || 'B.Tech')],
          ['Department Branch', String(user?.department || 'N/A')],
          ['Active Session', String(user?.session || '2024-2028')],
          ['Social Category', String(user?.category || 'General')]
        ],
        styles: { fontSize: 8.5, cellPadding: 2.2 }
      });

      // 4. Transaction & Fee Particulars Table
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 120,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
        head: [['Fee Particulars', 'Payment Status / Channel', 'Assessed Total Amount']],
        body: [
          [
            'Monthly Mess Maintenance & Dining Dues',
            'PENDING (OFFLINE DESK DEPOSIT)',
            `INR ${Number(paymentDetails?.amount || 0).toLocaleString()}/-`
          ]
        ],
        styles: { fontSize: 9, cellPadding: 3.5 }
      });

      // 5. Verification Footnote
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 180;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('* Online UPI Gateway is currently undergoing maintenance. Submit this slip directly at the Mess Desk.', 14, finalY);
      doc.text('Clearance Mode: Physical Desk Submission / Treasurer Cash Counter', 14, finalY + 5);

      doc.setFont('helvetica', 'bold');
      doc.text('Mess Treasurer & Committee Desk', 195, finalY + 12, { align: 'right' });
      doc.text('Student Mess Cooperative Utility', 195, finalY + 16, { align: 'right' });

      doc.save(`Student_Mess_Invoice_${user?.rollNo || user?.studentId || 'Student'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation crash caught:', err);
      alert('Could not generate PDF.');
    }
  };

  const receiptToDisplay = paidReceiptData || {
    receiptNo: `MESS/INV/${Math.floor(100000 + Math.random() * 900000)}`,
    txnId: `DESK-PENDING-${Date.now().toString().slice(-6)}`,
    paymentChannel: 'Desk Deposit (Online UPI Paused)',
    amount: billAmountToPay,
    date: new Date().toLocaleString()
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 font-sans">
      <div className="print:hidden space-y-6">
        <div className="bg-white border border-gray-300 rounded-sm shadow-sm p-6 border-t-4 border-t-blue-900">
          <div className="border-b border-gray-200 pb-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black text-blue-900 uppercase tracking-tight flex items-center gap-2">
                <Receipt className="w-5 h-5 text-orange-600" /> Fee Invoicing & Assessment Desk
              </h2>
              <p className="text-xs text-gray-500 uppercase mt-0.5">
                Verify Monthly Mess Dues & Download Official Invoice Slip
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-300 px-4 py-2 text-right min-w-[180px]">
              <span className="text-[10px] font-bold text-gray-600 uppercase block">Total Assessed Dues</span>
              {loading ? (
                <div className="flex items-center justify-end gap-1.5 py-1 text-blue-900">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-xs font-bold uppercase">Calculating...</span>
                </div>
              ) : (
                <span className="text-xl font-black text-blue-900">₹{billAmountToPay.toLocaleString()}/-</span>
              )}
            </div>
          </div>

          {/* OFFICIAL ADVISORY BANNER - ONLINE UPI UNDER PROCESS */}
          <div className="bg-amber-50 border-l-4 border-amber-600 text-amber-950 p-4 mb-6 rounded-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-2">
                  <span>Advisory: Online UPI Payment Gateway Under Maintenance</span>
                  <span className="bg-amber-200 text-amber-900 text-[9px] px-2 py-0.5 font-bold uppercase rounded-xs">
                    Temporary Notice
                  </span>
                </h3>
                <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                  The automated National UPI / NetBanking clearance module is currently undergoing system upgrades and banking reconciliation. <strong>Direct online checkout is temporarily disabled.</strong>
                </p>
                <p className="text-[11px] font-bold text-amber-800 mt-2 uppercase tracking-wide">
                  👉 To clear dues: Download and print your <span className="underline">Due Assessment Slip (PDF)</span> below and submit payment directly to the <strong>Mess Committee Desk / Treasurer</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* PAYMENT METHOD STRIP (DEACTIVATED STATUS) */}
          <div className="mb-6 opacity-85">
            <div className="p-5 border border-gray-300 bg-gray-50 rounded-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <h3 className="font-black text-xs uppercase text-gray-700">
                    Online UPI / NetBanking Clearance
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[9px] font-black bg-amber-700 text-white px-2 py-0.5 uppercase tracking-wider rounded-xs">
                  <Clock className="w-3 h-3" /> Under Setup / Paused
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Direct online collection via Google Pay, PhonePe, and NetBanking is temporarily restricted while gateway configuration is being completed.
              </p>
            </div>
          </div>

          {/* ACTION BAR */}
          <div className="border border-gray-300 bg-gray-50 p-5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-black uppercase text-gray-800">
                Total Payable Dues: <span className="text-blue-900 text-sm">₹{billAmountToPay.toLocaleString()}</span>
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">
                Clearance Channel: In-Person Committee Desk Deposit
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              {/* DISABLED ONLINE BUTTON */}
              <button 
                type="button"
                disabled={true}
                className="flex-1 sm:flex-initial bg-gray-300 text-gray-600 border border-gray-400 font-black px-6 py-3 text-xs uppercase tracking-wider cursor-not-allowed shadow-none flex items-center justify-center gap-2 select-none"
                title="Online payments are temporarily paused for maintenance."
              >
                <CreditCard className="w-4 h-4 opacity-50" />
                <span>Online UPI Paused</span>
              </button>

              {/* ACTIVE PRINT INVOICE BUTTON */}
              <button 
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 sm:flex-initial bg-blue-900 hover:bg-blue-800 text-white font-black px-6 py-3 text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Due Assessment Slip (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVATE COOPERATIVE VOUCHER / INVOICE SLIP */}
      <div className="mt-6 bg-white border-2 border-gray-400 p-8 shadow-md rounded-sm">
        <div className="border-b-4 border-orange-600 pb-4 mb-6 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black bg-amber-950 text-white px-2 py-0.5 uppercase tracking-widest">Private Student Utility</span>
            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight mt-1">Student Mess & Diet Ledger System</h1>
            <h2 className="text-xs font-bold text-gray-600 uppercase">Independent Mess Committee • Due Invoice Voucher</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black bg-amber-700 text-white px-2 py-0.5 uppercase">Desk Deposit Required</span>
            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Online Gateway: Offline</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 border border-gray-300 p-3 mb-6 text-xs uppercase font-bold text-gray-800">
          <div>
            <span className="text-[9px] text-gray-500 block">Assessment Serial</span>
            <span className="font-black text-blue-900">{receiptToDisplay.receiptNo}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 block">Desk Clearance Ref</span>
            <span className="font-mono text-[11px] text-gray-700">{receiptToDisplay.txnId}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 block">Issued On</span>
            <span>{receiptToDisplay.date}</span>
          </div>
        </div>

        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
          Member Academic Dossier
        </h3>
        <table className="w-full text-left border-collapse border border-gray-300 text-xs uppercase font-medium mb-6">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold w-1/3 border-r border-gray-300">Candidate Full Name</td>
              <td className="p-2 font-black text-blue-900">{user?.name || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Hostel Roll Number</td>
              <td className="p-2 font-bold">{user?.rollNo || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Student ID</td>
              <td className="p-2 font-bold">{user?.studentId || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Allotted Residence</td>
              <td className="p-2 font-bold">{user?.hostelNo || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Course / Program</td>
              <td className="p-2 font-bold">{user?.university || 'B.Tech'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Department Branch</td>
              <td className="p-2 font-bold">{user?.department || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Active Session</td>
              <td className="p-2 font-bold">{user?.session || '2024-2028'}</td>
            </tr>
            <tr>
              <td className="p-2 bg-gray-100 font-bold border-r border-gray-300">Social Category</td>
              <td className="p-2 font-bold text-orange-700">{user?.category || 'General'}</td>
            </tr>
          </tbody>
        </table>

        <h3 className="text-xs font-black uppercase tracking-wider text-gray-800 border-b border-gray-300 pb-1 mb-2">
          Assessment Dues Particulars
        </h3>
        <table className="w-full text-left border-collapse border border-gray-300 text-xs uppercase mb-8">
          <thead className="bg-blue-950 text-white font-black">
            <tr>
              <th className="p-2 border-r border-gray-700">Fee Particulars</th>
              <th className="p-2 border-r border-gray-700">Clearance Channel</th>
              <th className="p-2 text-right">Computed Amount</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            <tr className="border-b border-gray-300">
              <td className="p-2 border-r border-gray-300 text-gray-900">Monthly Mess Dues & Base Maintenance Charges</td>
              <td className="p-2 border-r border-gray-300 text-amber-800">Direct Desk / In-Person Deposit</td>
              <td className="p-2 text-right text-blue-900 font-black">₹{Number(receiptToDisplay.amount).toLocaleString()}/-</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-4 border-t-2 border-gray-300 text-[10px] text-gray-600 uppercase font-bold">
          <div>
            <p>* Present this computer-calculated assessment slip at the Mess Office.</p>
            <p className="text-amber-800">Clearance Status: DESK SETTLEMENT PENDING</p>
          </div>
          <div className="text-right">
            <div className="h-10"></div>
            <p className="border-t border-gray-500 pt-1 text-gray-900 font-black">Mess Treasurer & Committee Desk</p>
            <p className="text-gray-500">Student Mess Cooperative Utility</p>
          </div>
        </div>
      </div>
    </div>
  );
}