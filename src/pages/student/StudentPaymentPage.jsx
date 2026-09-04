import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CreditCard, Printer, CheckCircle2, 
  Receipt, AlertCircle, Check, Loader2 
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
  const currentMonthBill = history
    .filter(r => r && r.date && r.date.startsWith(currentMonthPrefix))
    .reduce((sum, r) => sum + (Number(r.dailyTotalCost) || 0), 0);

  const minBasicCharge = (user?.gender === 'female' || user?.category?.toLowerCase().includes('girl')) ? 1000 : 1100;
  const billAmountToPay = currentMonthBill > 0 ? currentMonthBill : minBasicCharge;

  const handleProcessMockPayment = async () => {
    setProcessingMockPay(true);
    setSuccessMsg('');

    const paymentPayload = {
      userId: user._id || user.id,
      studentName: user.name,
      rollNo: user.rollNo,
      hostelNo: user.hostelNo || 'BH1',
      receiptNo: `MESS/REC/${Math.floor(100000 + Math.random() * 900000)}`,
      txnId: `UPI-TXN-${Date.now()}`,
      paymentChannel: 'Online UPI / NetBanking',
      amount: billAmountToPay,
      month: currentMonthPrefix,
      date: new Date().toLocaleString()
    };

    try {
      await API.post('/payments/record', paymentPayload);
      setPaidReceiptData(paymentPayload);
      setSuccessMsg(`Payment registered successfully via Online UPI! Synced with Cooperative Ledger.`);
    } catch (err) {
      console.error('Failed to save payment record to backend:', err);
      setPaidReceiptData(paymentPayload);
      setSuccessMsg(`Payment registered locally (Offline simulation mode).`);
    } finally {
      setProcessingMockPay(false);
    }
  };

  // Inlined PDF Generator (Safe Private Utility Format)
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
      doc.text('INDEPENDENT MESS COMMITTEE • PRIVATE FEE & VOUCHER RECEIPT', 105, 18, { align: 'center' });

      // 2. Receipt Metadata
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`Receipt No: ${paymentDetails?.receiptNo || 'N/A'}`, 14, 34);
      doc.text(`Transaction Ref: ${paymentDetails?.txnId || 'N/A'}`, 14, 40);
      doc.text(`Date & Time: ${paymentDetails?.date || new Date().toLocaleString()}`, 14, 46);

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

      const paymentModeText = (paymentDetails?.paymentChannel || paymentDetails?.mode || 'Online UPI / NetBanking').toUpperCase();

      // 4. Transaction & Fee Particulars Table
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 120,
        theme: 'striped',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold' },
        head: [['Fee Particulars', 'Mode of Clearance', 'Total Settled Amount']],
        body: [
          [
            'Monthly Mess Maintenance & Dining Dues',
            paymentModeText,
            `INR ${Number(paymentDetails?.amount || 0).toLocaleString()}/-`
          ]
        ],
        styles: { fontSize: 9, cellPadding: 3.5 }
      });

      // 5. Verification Footnote
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 180;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('* This is a computer-verified digital receipt generated via Student Mess Cooperative Portal.', 14, finalY);
      doc.text(`Settlement Status: CLEARED (${paymentModeText})`, 14, finalY + 5);

      doc.setFont('helvetica', 'bold');
      doc.text('Mess Treasurer & Committee Desk', 195, finalY + 12, { align: 'right' });
      doc.text('Student Mess Cooperative Utility', 195, finalY + 16, { align: 'right' });

      doc.save(`Student_Mess_Receipt_${user?.rollNo || user?.studentId || 'Student'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation crash caught:', err);
      alert('Could not generate PDF.');
    }
  };

  const receiptToDisplay = paidReceiptData || {
    receiptNo: `MESS/REC/${Math.floor(100000 + Math.random() * 900000)}`,
    txnId: `VERIFIED-INVOICE-${Date.now().toString().slice(-6)}`,
    paymentChannel: 'Online UPI Clearance',
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
                <Receipt className="w-5 h-5 text-orange-600" /> Fee Invoicing & Payment Desk
              </h2>
              <p className="text-xs text-gray-500 uppercase mt-0.5">
                Clear Mess Dues Online & Print Cooperative Clearance Voucher
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-300 px-4 py-2 text-right min-w-[180px]">
              <span className="text-[10px] font-bold text-gray-600 uppercase block">Pending Settlement Dues</span>
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

          {successMsg && (
            <div className="bg-green-50 border-l-4 border-green-700 text-green-900 p-3 text-xs font-bold uppercase mb-6 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="mb-6">
            <div className="p-5 border border-blue-900 bg-blue-50/70 ring-2 ring-blue-900 rounded-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-blue-900" />
                  <h3 className="font-black text-xs uppercase text-blue-950">Pay Online via UPI / NetBanking (Instant Clearance)</h3>
                </div>
                <Check className="w-4 h-4 text-blue-900 font-bold" />
              </div>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                Clear your monthly mess bill securely online via UPI, Google Pay, PhonePe, Debit Card, or NetBanking. Generates an instant digital verified clearance voucher.
              </p>
              <span className="inline-block mt-3 text-[9px] font-black bg-emerald-700 text-white px-2 py-0.5 uppercase tracking-wider">
                Instant Online Clearance Simulation
              </span>
            </div>
          </div>

          <div className="border border-gray-300 bg-gray-50 p-5 rounded-sm flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div>
              <div className="text-xs font-black uppercase text-gray-800">
                Total Due: <span className="text-blue-900 text-sm">₹{billAmountToPay.toLocaleString()}</span>
              </div>
              <div className="text-[11px] font-bold text-gray-500 uppercase mt-0.5">
                Channel: National UPI / Online Banking Portal
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button 
                type="button"
                onClick={handleProcessMockPayment}
                disabled={processingMockPay || loading}
                className="flex-1 sm:flex-initial bg-blue-900 hover:bg-blue-800 text-white font-black px-6 py-3 text-xs uppercase tracking-wider transition cursor-pointer shadow-sm disabled:opacity-60"
              >
                {processingMockPay ? 'Confirming...' : 'Confirm & Settle Online'}
              </button>

              <button 
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 sm:flex-initial bg-green-700 hover:bg-green-800 text-white font-black px-6 py-3 text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PRIVATE COOPERATIVE VOUCHER */}
      <div className="mt-6 bg-white border-2 border-gray-400 p-8 shadow-md rounded-sm">
        <div className="border-b-4 border-orange-600 pb-4 mb-6 flex justify-between items-center">
          <div>
            <span className="text-[9px] font-black bg-amber-950 text-white px-2 py-0.5 uppercase tracking-widest">Private Student Utility</span>
            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tight mt-1">Student Mess & Diet Ledger System</h1>
            <h2 className="text-xs font-bold text-gray-600 uppercase">Independent Mess Committee • E-Receipt Voucher</h2>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-black bg-emerald-700 text-white px-2 py-0.5 uppercase">Verified</span>
            <div className="text-[9px] font-bold text-gray-500 uppercase mt-1">Status: CLEARED</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 border border-gray-300 p-3 mb-6 text-xs uppercase font-bold text-gray-800">
          <div>
            <span className="text-[9px] text-gray-500 block">Receipt Serial</span>
            <span className="font-black text-blue-900">{receiptToDisplay.receiptNo}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 block">Transaction Token</span>
            <span className="font-mono text-[11px] text-gray-700">{receiptToDisplay.txnId}</span>
          </div>
          <div>
            <span className="text-[9px] text-gray-500 block">Generated On</span>
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
          Financial Clearance Particulars
        </h3>
        <table className="w-full text-left border-collapse border border-gray-300 text-xs uppercase mb-8">
          <thead className="bg-blue-950 text-white font-black">
            <tr>
              <th className="p-2 border-r border-gray-700">Fee Particulars</th>
              <th className="p-2 border-r border-gray-700">Clearance Channel</th>
              <th className="p-2 text-right">Settled Amount</th>
            </tr>
          </thead>
          <tbody className="font-bold">
            <tr className="border-b border-gray-300">
              <td className="p-2 border-r border-gray-300 text-gray-900">Monthly Mess Dues & Maintenance Charges</td>
              <td className="p-2 border-r border-gray-300 text-gray-700">{receiptToDisplay.paymentChannel}</td>
              <td className="p-2 text-right text-blue-900 font-black">₹{Number(receiptToDisplay.amount).toLocaleString()}/-</td>
            </tr>
          </tbody>
        </table>

        <div className="flex justify-between items-end pt-4 border-t-2 border-gray-300 text-[10px] text-gray-600 uppercase font-bold">
          <div>
            <p>* Private computer-generated cooperative receipt.</p>
            <p className="text-green-700">Authorization Status: CLEARED & RECONCILED</p>
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