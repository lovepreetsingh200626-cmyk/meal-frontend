import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CreditCard, Printer, CheckCircle2, 
  Receipt, AlertCircle, Check, Loader2, Clock, AlertTriangle,
  ShieldCheck, Landmark, FileCheck2, Building2, Calendar, FileText
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

  // Re-usable Mock Payment Processor (Maintained for backward compatibility and automated testing)
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
      paymentChannel: 'Online UPI / NetBanking Gateway',
      amount: billAmountToPay,
      month: currentMonthPrefix,
      date: new Date().toLocaleString()
    };

    try {
      await API.post('/payments/record', paymentPayload);
      setPaidReceiptData(paymentPayload);
      setSuccessMsg('Statutory transaction logged and reconciled in Central Cooperative Ledger.');
    } catch (err) {
      console.error('Failed to save payment record to backend:', err);
      setPaidReceiptData(paymentPayload);
      setSuccessMsg('Transaction registered locally under Offline Emergency Audit Mode.');
    } finally {
      setProcessingMockPay(false);
    }
  };

  // Inlined High-Fidelity PDF Generator (Statutory Audit Assessment Slip)
  const handlePrintReceipt = () => {
    try {
      const doc = new jsPDF();
      const paymentDetails = receiptToDisplay;

      // 1. Header Banner & University Emblem Representation
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('CENTRAL STUDENT HOSTEL MESS & DIET AUDIT LEDGER', 105, 10, { align: 'center' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240); // slate-200
      doc.text('AUTONOMOUS RESIDENTIAL COOPERATIVE • STATUTORY DUE ASSESSMENT & CLEARANCE VOUCHER', 105, 17, { align: 'center' });

      // 2. Receipt Identification Metadata
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`ASSESSMENT SLIP NO: ${paymentDetails?.receiptNo || 'N/A'}`, 14, 33);
      doc.text(`CLEARANCE TOKEN: ${paymentDetails?.txnId || 'N/A'}`, 14, 39);
      doc.text(`ISSUANCE TIMESTAMP: ${paymentDetails?.date || new Date().toLocaleString()}`, 14, 45);

      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9); // amber-700
      doc.text(`CURRENT BILLING PERIOD: ${currentMonthPrefix} (STATUTE 4.2)`, 196, 33, { align: 'right' });
      doc.setTextColor(15, 23, 42);
      doc.text(`AUDIT CLEARANCE PHASE: IN-PERSON DESK DEPOSIT`, 196, 39, { align: 'right' });

      // 3. Member Academic Dossier Table
      autoTable(doc, {
        startY: 50,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        head: [['INSTITUTIONAL RECORD FIELD', 'VERIFIED STUDENT COOPERATIVE DOSSIER PARTICULARS']],
        body: [
          ['FULL CANDIDATE NAME', (user?.name || 'N/A').toUpperCase()],
          ['CAMPUS ROLL NUMBER', String(user?.rollNo || 'N/A')],
          ['STATUTORY STUDENT ID', String(user?.studentId || 'N/A')],
          ['RESIDENCE ALLOTMENT', String(user?.hostelNo || 'CAMPUS HOSTEL').toUpperCase()],
          ['COURSE / DEGREE PROGRAM', String(user?.university || 'B.Tech').toUpperCase()],
          ['DEPARTMENT BRANCH', String(user?.department || 'N/A').toUpperCase()],
          ['ACTIVE ACADEMIC SESSION', String(user?.session || '2024-2028')],
          ['SOCIAL AUDIT CATEGORY', String(user?.category || 'General').toUpperCase()]
        ],
        styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 41, 59] }
      });

      // 4. Financial Assessment & Dues Particulars
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 118,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        head: [['STATUTORY HEAD OF EXPENSE', 'AUTHORIZATION MODE', 'AUDITED SUM PAYABLE']],
        body: [
          [
            'Mandatory Base Residence Maintenance Fee',
            'Compulsory Monthly Assessment',
            `INR ${baseMaintenanceFee.toLocaleString()}/-`
          ],
          [
            'Actual Consumed Diets & Approved Dining Extras',
            currentMonthMealsCost > baseMaintenanceFee ? 'Inclusive Diet Excess Applied' : 'Covered Under Base Allowance',
            `INR ${currentMonthMealsCost.toLocaleString()}/-`
          ],
          [
            'FINAL NET COOPERATIVE DUE TO SETTLE',
            'DIRECT TREASURY COUNTER CASH DEPOSIT',
            `INR ${Number(paymentDetails?.amount || 0).toLocaleString()}/-`
          ]
        ],
        styles: { fontSize: 8.5, cellPadding: 3.2, textColor: [15, 23, 42] }
      });

      // 5. Verification & Signature Blocks
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 175;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('* Official Statutory Notice: Online payment gateway is suspended for reconciliation. Present this slip at the treasury desk.', 14, finalY);
      doc.text('* Candidate must preserve counterfoil with treasury clerk initial as legal clearance verification.', 14, finalY + 4);

      // Signature lines
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      
      doc.line(14, finalY + 22, 65, finalY + 22);
      doc.text('Candidate Member Signature', 14, finalY + 26);

      doc.line(145, finalY + 22, 196, finalY + 22);
      doc.text('Mess Treasurer & Committee Desk', 196, finalY + 26, { align: 'right' });
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      doc.text('Hostel Cooperative Audit Seal', 196, finalY + 30, { align: 'right' });

      doc.save(`Statutory_Due_Slip_${user?.rollNo || user?.studentId || 'Student'}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF generation crash caught:', err);
      alert('Could not generate PDF.');
    }
  };

  const receiptToDisplay = paidReceiptData || {
    receiptNo: `MESS/INV/${Math.floor(100000 + Math.random() * 900000)}`,
    txnId: `STATUTE-DESK-${Date.now().toString().slice(-6)}`,
    paymentChannel: 'Treasury Counter (Desk Deposit Required)',
    amount: billAmountToPay,
    date: new Date().toLocaleString()
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10 font-sans text-slate-900 selection:bg-blue-900 selection:text-white">
      
      {/* 1. OFFICIAL TOP EMBLEM & CONTEXT HEADER */}
      <div className="print:hidden space-y-6">
        
        {/* Institutional Statutory Lead Banner */}
        <div className="bg-slate-950 text-slate-300 text-[10px] font-bold px-4 py-2 border-b-2 border-amber-500/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
          <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Autonomous Student Cooperative Association</span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-amber-300 font-extrabold hidden md:inline">Financial Audit & Dues Clearance Division</span>
          </div>
          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-tight">
            Fiscal Period: {currentMonthPrefix} • Statute 7.4
          </div>
        </div>

        {/* Primary Operational Card */}
        <div className="bg-white border border-slate-300 shadow-sm p-5 sm:p-7 border-t-4 border-t-blue-950">
          
          <div className="border-b border-slate-200 pb-5 mb-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 bg-blue-950 text-amber-400 border border-blue-900 shrink-0 mt-0.5">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-blue-950 uppercase tracking-tight font-serif">
                    Statutory Fee Invoicing & Assessment Desk
                  </h2>
                  <span className="hidden sm:inline-block text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 uppercase tracking-wider">
                    Official Voucher
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-semibold uppercase tracking-wide mt-1">
                  Autonomous Hostel Committee • Certified Consumption & Maintenance Assessment
                </p>
              </div>
            </div>
            
            {/* Total Due Metric Display Box */}
            <div className="w-full lg:w-auto bg-slate-50 border-2 border-blue-950 p-3 sm:px-6 sm:py-3 text-left lg:text-right min-w-[220px]">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                Net Assessed Monthly Dues
              </span>
              {loading ? (
                <div className="flex items-center lg:justify-end gap-2 py-1 text-blue-950">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                  <span className="text-xs font-bold uppercase tracking-wider">Auditing Ledger...</span>
                </div>
              ) : (
                <div className="flex lg:flex-col items-baseline justify-between lg:justify-end gap-2 mt-0.5">
                  <span className="text-2xl font-black text-blue-950 font-serif tracking-tight">
                    ₹{billAmountToPay.toLocaleString()}/-
                  </span>
                  <span className="text-[9px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 border border-amber-300 px-1.5 py-0.5">
                    Pending Clearance
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="bg-emerald-50 border-l-4 border-emerald-700 text-emerald-950 p-4 text-xs font-bold uppercase mb-6 flex items-start gap-3 shadow-xs">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-black tracking-wide">Action Certified</p>
                <p className="text-[11px] font-medium text-emerald-900 mt-0.5 leading-relaxed">{successMsg}</p>
              </div>
            </div>
          )}

          {/* OFFICIAL ADVISORY DIRECTIVE - RECONCILIATION NOTICE */}
          <div className="bg-amber-50 border border-amber-300 border-l-4 border-l-amber-600 text-amber-950 p-5 mb-6">
            <div className="flex items-start gap-3.5">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 font-serif">
                    Official Executive Notice: National Gateway Reconciliation Underway
                  </h3>
                  <span className="bg-amber-200 text-amber-950 text-[8px] px-2 py-0.5 font-black uppercase border border-amber-400">
                    Statute Notice Ref #MESS-2026/04
                  </span>
                </div>
                
                <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
                  The automated Unified Payments Interface (UPI / NetBanking) settlement gateway is presently reserved for institutional auditing and cooperative account reconciliation. <strong>Direct checkout is temporarily restricted to prevent dual debits.</strong>
                </p>

                <div className="bg-white/80 border border-amber-300 p-3 text-[11px] font-bold text-amber-900 uppercase tracking-wide space-y-1">
                  <p className="flex items-center gap-1.5 text-amber-950">
                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Mandatory Desk Clearance Protocol:</span>
                  </p>
                  <p className="text-slate-700 font-semibold normal-case">
                    Please download your <strong>Certified Due Assessment Slip (PDF)</strong> below and remit cash directly to the <strong>Hostel Treasury Desk / Mess Committee In-Charge</strong> to receive an official rubber-stamped physical counterfoil.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PAYMENT CLEARANCE CHANNELS (OFFICIAL AUDIT STATUS) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            
            {/* Channel 1: Online UPI (Deactivated Status) */}
            <div className="p-4 border border-slate-300 bg-slate-50/70 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-600">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <h3 className="font-bold text-xs uppercase text-slate-800 tracking-wide">
                    National UPI / NetBanking Gateway
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[8px] font-black bg-slate-300 text-slate-700 px-2 py-0.5 uppercase tracking-wider">
                  <Clock className="w-3 h-3" /> System Paused
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Direct online clearance via BHIM UPI, PhonePe, Google Pay, and Cards is held temporarily under scheduled treasury maintenance.
              </p>
            </div>

            {/* Channel 2: Physical Desk Counter (Active Status) */}
            <div className="p-4 border-2 border-blue-950 bg-blue-50/50 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-950">
                  <Landmark className="w-4 h-4 text-amber-600" />
                  <h3 className="font-black text-xs uppercase tracking-wide">
                    Committee Treasury Cash Counter
                  </h3>
                </div>
                <span className="inline-flex items-center gap-1 text-[8px] font-black bg-emerald-800 text-white px-2 py-0.5 uppercase tracking-wider">
                  ✓ Active Channel
                </span>
              </div>
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                Physical counter clearance active at the Mess Office. Present your Assessment Slip to the Treasurer for verification and ledger reconciliation.
              </p>
            </div>
          </div>

          {/* ACTION BAR & CONTROLS */}
          <div className="border border-slate-300 bg-slate-100 p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-black uppercase text-slate-900 tracking-wide">
                Total Payable Amount: <span className="text-blue-950 text-base font-serif font-black">₹{billAmountToPay.toLocaleString()}/-</span>
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                Authorized Mode: Physical Cash Counterfoil Deposit
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              
              {/* Online Button (Locked State) */}
              <button 
                type="button"
                disabled={true}
                className="flex-1 sm:flex-initial bg-slate-200 text-slate-500 border border-slate-300 font-bold px-5 py-3 text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 select-none shadow-none"
                title="Online gateway temporarily suspended under audit reconciliation."
              >
                <CreditCard className="w-4 h-4 opacity-40" />
                <span>UPI Clearance Paused</span>
              </button>

              {/* Active PDF Assessment Generator Button */}
              <button 
                type="button"
                onClick={handlePrintReceipt}
                className="flex-1 sm:flex-initial bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black px-6 py-3 text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-2 border-amber-500 shadow-sm"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print Due Assessment Slip (PDF)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. AUTHENTIC ON-SCREEN STATUTORY DUE ASSESSMENT VOUCHER (PRINT PREVIEW)    */}
      {/* ========================================================================= */}
      <div className="mt-8 bg-white border-2 border-slate-400 shadow-md p-6 sm:p-10 relative">
        
        {/* Official Header Banner */}
        <div className="border-b-4 border-amber-600 pb-5 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-950 border-2 border-amber-500 text-white flex flex-col items-center justify-center text-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <span className="text-[6px] font-black uppercase tracking-widest text-amber-200">SEAL</span>
            </div>
            <div>
              <span className="text-[8px] font-black bg-slate-900 text-amber-300 px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                Statutory Student Cooperative Voucher
              </span>
              <h1 className="text-lg sm:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                Student Mess & Diet Ledger System
              </h1>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wide">
                Independent Mess Committee • Official Due Assessment & Invoice Slip
              </h2>
            </div>
          </div>
          
          <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 w-full sm:w-auto">
            <span className="text-[9px] font-black bg-amber-700 text-white px-2.5 py-1 uppercase tracking-wider inline-block">
              Desk Clearance Mandated
            </span>
            <div className="text-[9px] font-mono text-slate-500 uppercase mt-1">
              Gateway: RECONCILIATION HOLD
            </div>
          </div>
        </div>

        {/* Metadata Registry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-300 p-3.5 mb-6 text-xs uppercase font-bold text-slate-800 font-mono">
          <div>
            <span className="text-[8px] text-slate-500 block uppercase font-sans">Assessment Slip Serial</span>
            <span className="font-black text-blue-950">{receiptToDisplay.receiptNo}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-500 block uppercase font-sans">Clearance Audit Token</span>
            <span className="text-slate-700 text-[11px]">{receiptToDisplay.txnId}</span>
          </div>
          <div>
            <span className="text-[8px] text-slate-500 block uppercase font-sans">Assessment Issued On</span>
            <span className="text-slate-900">{receiptToDisplay.date}</span>
          </div>
        </div>

        {/* Member Academic Dossier */}
        <div className="mb-6">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-700" />
              <span>Member Academic Dossier & Residence Identification</span>
            </h3>
            <span className="text-[8px] font-bold text-slate-500 uppercase">Registry Statute 3.1</span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300 text-xs uppercase">
            <tbody>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold w-1/3 border-r border-slate-300 text-slate-700">Candidate Full Name</td>
                <td className="p-2.5 font-black text-blue-950 font-serif">{user?.name || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Campus Roll Number</td>
                <td className="p-2.5 font-bold text-slate-900">{user?.rollNo || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Student ID Number</td>
                <td className="p-2.5 font-bold text-slate-900">{user?.studentId || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Allotted Residence Hall</td>
                <td className="p-2.5 font-black text-blue-950">{user?.hostelNo || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Course / Academic Program</td>
                <td className="p-2.5 font-bold text-slate-800">{user?.university || 'B.Tech'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Department Branch</td>
                <td className="p-2.5 font-bold text-slate-800">{user?.department || 'N/A'}</td>
              </tr>
              <tr className="border-b border-slate-300">
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Active Session Batch</td>
                <td className="p-2.5 font-bold text-slate-800">{user?.session || '2024-2028'}</td>
              </tr>
              <tr>
                <td className="p-2.5 bg-slate-100 font-bold border-r border-slate-300 text-slate-700">Social Audit Category</td>
                <td className="p-2.5 font-black text-amber-800">{user?.category || 'General'}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Financial Assessment Particulars */}
        <div className="mb-8">
          <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
              <Landmark className="w-3.5 h-3.5 text-amber-700" />
              <span>Assessment Dues & Statutory Ledger Particulars</span>
            </h3>
            <span className="text-[8px] font-bold text-slate-500 uppercase">Billing Cycle: {currentMonthPrefix}</span>
          </div>

          <table className="w-full text-left border-collapse border border-slate-300 text-xs uppercase">
            <thead className="bg-blue-950 text-white font-black">
              <tr>
                <th className="p-2.5 border-r border-slate-700">Statutory Head of Expense</th>
                <th className="p-2.5 border-r border-slate-700">Authorization / Clearance Channel</th>
                <th className="p-2.5 text-right">Computed Amount</th>
              </tr>
            </thead>
            <tbody className="font-semibold divide-y divide-slate-300">
              <tr>
                <td className="p-2.5 border-r border-slate-300 text-slate-900">
                  Mandatory Residence Mess Maintenance Charge
                </td>
                <td className="p-2.5 border-r border-slate-300 text-slate-700">
                  Compulsory Fixed Monthly Levy
                </td>
                <td className="p-2.5 text-right text-slate-900 font-bold">
                  ₹{baseMaintenanceFee.toLocaleString()}/-
                </td>
              </tr>
              <tr>
                <td className="p-2.5 border-r border-slate-300 text-slate-900">
                  Actual Recorded Diets & Approved Consumable Extras
                </td>
                <td className="p-2.5 border-r border-slate-300 text-slate-700">
                  {currentMonthMealsCost > baseMaintenanceFee ? 'Inclusive Diet Excess Applied' : 'Covered Under Base Allowance'}
                </td>
                <td className="p-2.5 text-right text-slate-900 font-bold">
                  ₹{currentMonthMealsCost.toLocaleString()}/-
                </td>
              </tr>
              <tr className="bg-slate-100 font-black">
                <td className="p-2.5 border-r border-slate-300 text-blue-950">
                  Total Assessed Dues to Remit
                </td>
                <td className="p-2.5 border-r border-slate-300 text-amber-800">
                  Physical Desk / In-Person Treasury Counter
                </td>
                <td className="p-2.5 text-right text-blue-950 text-sm font-serif">
                  ₹{Number(receiptToDisplay.amount).toLocaleString()}/-
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tear-off Perforation Divider for Physical Desk Submission */}
        <div className="relative my-8 border-t-2 border-dashed border-slate-400">
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-4 text-[8px] font-mono uppercase text-slate-400 font-bold tracking-widest">
            ✂ Tear-off Voucher Counterfoil for Treasury Desk Reconciliation ✂
          </span>
        </div>

        {/* Verification Seals & Signatory Blocks */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2 text-[10px] text-slate-600 uppercase font-bold">
          <div className="space-y-1">
            <p className="text-slate-800 font-black flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-700 inline" />
              <span>Legally Audited under Independent Mess Cooperative Bylaws</span>
            </p>
            <p className="text-amber-800">Clearance Status: DESK DEPOSIT & STAMP PENDING</p>
            <p className="text-[9px] text-slate-500 normal-case font-medium">
              * The candidate must retain this stamped counterfoil until the conclusion of the academic session.
            </p>
          </div>

          <div className="flex items-center gap-8 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-center">
              <div className="h-10 border-b border-slate-400 w-32"></div>
              <p className="pt-1 text-slate-700 font-black text-[9px]">Candidate Member</p>
              <p className="text-[8px] text-slate-400 font-mono">Signatory</p>
            </div>

            <div className="text-right">
              <div className="h-10 border-b border-slate-400 w-40"></div>
              <p className="pt-1 text-blue-950 font-black text-[9px]">Mess Treasurer & Committee Desk</p>
              <p className="text-[8px] text-slate-500 font-mono">Hostel Cooperative Audit Seal</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}