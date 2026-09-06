import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  CreditCard, Printer, CheckCircle2, 
  AlertCircle, Check, Loader2, Clock, AlertTriangle,
  ShieldCheck, Landmark, FileText
} from 'lucide-react';

export default function StudentPaymentPage({ user }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingMockPay, setProcessingMockPay] = useState(false);
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
      setTimeout(() => setLoading(false), 400);
    }
  };

  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  
  // STATUTORY FEE CALCULATION LOGIC
  const currentMonthRecords = history.filter(r => r && r.date && r.date.startsWith(currentMonthPrefix));
  
  let totalDietCost = 0;
  let totalExtrasCost = 0;
  let totalDietsCount = 0;

  currentMonthRecords.forEach(rec => {
    // Count individual diets
    if (rec.meals?.breakfast) totalDietsCount++;
    if (rec.meals?.lunch) totalDietsCount++;
    if (rec.meals?.dinner) totalDietsCount++;
    if (rec.appliedDietRule === '1_DIET_BUMPED_TO_2') totalDietsCount++;

    // Separate Extra Items cost from Standard Diet cost
    let dailyExtraCost = 0;
    if (rec.extras && rec.extras.length > 0) {
      dailyExtraCost = rec.extras.reduce((sum, item) => sum + (Number(item.cost) || 0), 0);
    }
    
    totalExtrasCost += dailyExtraCost;
    totalDietCost += ((Number(rec.dailyTotalCost) || 0) - dailyExtraCost);
  });

  const baseMaintenanceFee = (user?.gender?.toLowerCase() === 'female' || user?.category?.toLowerCase().includes('girl')) ? 1000 : 1100;
  
  // Extra diets cost applies ONLY if the consumed diet cost exceeds the 1100 base fee
  const extraDietsCost = totalDietCost > baseMaintenanceFee ? (totalDietCost - baseMaintenanceFee) : 0;
  
  // Final Net Payable: Base Quota + Any Diet Excess + Total Extras
  const billAmountToPay = baseMaintenanceFee + extraDietsCost + totalExtrasCost;

  // Standardized Invoice Number Generation
  const deterministicInvoiceNo = `INV-${currentMonthPrefix.replace('-', '')}-${user?.rollNo || '000'}`;

  const handlePrintReceipt = () => {
    try {
      const doc = new jsPDF();

      // 1. Header Banner & University Emblem
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 24, 'F');

      doc.setFontSize(13);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('CENTRAL STUDENT HOSTEL MESS & DIET AUDIT LEDGER', 105, 10, { align: 'center' });

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(226, 232, 240);
      doc.text('AUTONOMOUS RESIDENTIAL COOPERATIVE • STATUTORY DUE ASSESSMENT & CLEARANCE VOUCHER', 105, 17, { align: 'center' });

      // 2. Receipt Identification Metadata
      doc.setTextColor(15, 23, 42);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text(`ASSESSMENT SLIP NO: ${deterministicInvoiceNo}`, 14, 33);
      doc.text(`ISSUANCE TIMESTAMP: ${new Date().toLocaleString()}`, 14, 39);

      doc.setFontSize(8.5);
      doc.setTextColor(180, 83, 9);
      doc.text(`BILLING CYCLE: ${currentMonthPrefix} (STATUTE 4.2)`, 196, 33, { align: 'right' });
      doc.setTextColor(15, 23, 42);
      doc.text(`CLEARANCE PHASE: IN-PERSON DESK DEPOSIT`, 196, 39, { align: 'right' });

      // 3. Member Academic Dossier Table
      autoTable(doc, {
        startY: 46,
        theme: 'grid',
        headStyles: { fillColor: [30, 58, 138], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        head: [['INSTITUTIONAL RECORD FIELD', 'VERIFIED STUDENT COOPERATIVE DOSSIER PARTICULARS']],
        body: [
          ['FULL CANDIDATE NAME', (user?.name || 'N/A').toUpperCase()],
          ['CAMPUS ROLL NUMBER', String(user?.rollNo || 'N/A')],
          ['STATUTORY STUDENT ID', String(user?.studentId || 'N/A')],
          ['RESIDENCE ALLOTMENT', String(user?.hostelNo || 'CAMPUS HOSTEL').toUpperCase()],
          ['COURSE / DEGREE PROGRAM', String(user?.university || 'B.Tech').toUpperCase()],
          ['DEPARTMENT BRANCH', String(user?.department || 'N/A').toUpperCase()]
        ],
        styles: { fontSize: 8, cellPadding: 2.2, textColor: [30, 41, 59] }
      });

      // 4. Detailed Financial Assessment Breakdown
      autoTable(doc, {
        startY: doc.lastAutoTable ? doc.lastAutoTable.finalY + 6 : 100,
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        head: [['STATUTORY HEAD OF EXPENSE', 'CONSUMPTION PARTICULARS', 'AUDITED SUM PAYABLE']],
        body: [
          [
            'Mandatory Minimum Diet Quota',
            'Compulsory Base Maintenance Fee',
            `INR ${baseMaintenanceFee.toLocaleString()}/-`
          ],
          [
            'Additional Standard Diets Consumed',
            `Total Diets: ${totalDietsCount} (${extraDietsCost > 0 ? 'Excess Tariff Applied' : 'Covered Under Base Quota'})`,
            extraDietsCost > 0 ? `INR ${extraDietsCost.toLocaleString()}/-` : 'INCLUDED'
          ],
          [
            'Supplementary Extra Items',
            'User Added Market-Rate Items',
            totalExtrasCost > 0 ? `INR ${totalExtrasCost.toLocaleString()}/-` : 'NIL'
          ],
          [
            'FINAL NET COOPERATIVE DUE',
            'DIRECT TREASURY DESK DEPOSIT',
            `INR ${billAmountToPay.toLocaleString()}/-`
          ]
        ],
        styles: { fontSize: 8.5, cellPadding: 3.5, textColor: [15, 23, 42] }
      });

      // 5. Verification & Signature Blocks
      const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 14 : 175;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 116, 139);
      doc.text('* Official Statutory Notice: Online payment gateway is suspended for reconciliation. Present this slip at the treasury desk.', 14, finalY);
      doc.text('* Candidate must preserve counterfoil with treasury clerk initial as legal clearance verification.', 14, finalY + 4);

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

      doc.save(`${deterministicInvoiceNo}_${user?.name?.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error('PDF generation crash caught:', err);
      alert('Could not generate PDF.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16 font-sans selection:bg-blue-900 selection:text-white flex flex-col">
      
      <div className="print:hidden space-y-5">
        <div className="bg-slate-950 text-slate-300 text-[9px] sm:text-[10px] font-bold px-4 md:px-8 py-2 border-b-2 border-amber-500/70 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 z-50 select-none">
          <div className="flex items-center gap-2 uppercase tracking-widest text-slate-200 truncate">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0"></span>
            <span className="truncate">Autonomous Student Cooperative Association</span>
          </div>
          <div className="text-[8px] sm:text-[9px] font-mono text-slate-400 uppercase tracking-tight">
            Fiscal Period: {currentMonthPrefix} • Statute 4.2
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-3 sm:px-6 w-full space-y-5">
        {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[65vh] bg-white border-2 border-slate-300 shadow-sm border-t-4 border-t-blue-950 w-full animate-in fade-in duration-300 mt-5 print:hidden">
                <Loader2 className="w-10 h-10 animate-spin text-amber-600 mb-4" />
                <p className="text-[11px] font-mono font-black uppercase tracking-widest text-slate-600">Accessing Fee Clearance Records...</p>
            </div>
        ) : (
            <div className="animate-in fade-in duration-500">
                <div className="print:hidden space-y-5 mt-5">
                    
                    <div className="bg-white border border-slate-300 shadow-sm p-4 sm:p-7 border-t-4 border-t-blue-950">
                        <div className="border-b border-slate-200 pb-5 mb-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            <div className="flex items-start gap-3">
                            <div className="p-2 sm:p-2.5 bg-blue-950 text-amber-400 border border-blue-900 shrink-0 mt-0.5">
                                <Landmark className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                <h2 className="text-sm sm:text-lg font-black text-blue-950 uppercase tracking-tight font-serif">
                                    Statutory Fee Invoicing &amp; Assessment Desk
                                </h2>
                                <span className="text-[8px] sm:text-[9px] font-black bg-slate-100 text-slate-700 border border-slate-300 px-2 py-0.5 uppercase tracking-wider">
                                    Official Voucher
                                </span>
                                </div>
                                <p className="text-[11px] sm:text-xs text-slate-600 font-semibold uppercase tracking-wide mt-1">
                                Autonomous Hostel Committee • Certified Consumption Assessment
                                </p>
                            </div>
                            </div>
                            
                            <div className="w-full lg:w-auto bg-slate-50 border-2 border-blue-950 p-3 sm:px-6 sm:py-3 text-left lg:text-right min-w-[200px]">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">
                                Net Assessed Monthly Dues
                            </span>
                            <div className="flex lg:flex-col items-baseline justify-between lg:justify-end gap-2 mt-0.5">
                                <span className="text-xl sm:text-2xl font-black text-blue-950 font-serif tracking-tight">
                                    ₹{billAmountToPay.toLocaleString()}/-
                                </span>
                                <span className="text-[8px] sm:text-[9px] font-bold text-amber-800 uppercase tracking-wider bg-amber-100 border border-amber-300 px-1.5 py-0.5">
                                    Pending Clearance
                                </span>
                            </div>
                            </div>
                        </div>

                        <div className="bg-amber-50 border border-amber-300 border-l-4 border-l-amber-600 text-amber-950 p-4 sm:p-5 mb-5">
                            <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                            <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-xs font-black uppercase tracking-wider text-amber-950 font-serif">
                                    Official Executive Notice: Gateway Reconciliation Underway
                                </h3>
                                </div>
                                <p className="text-xs text-amber-950/90 leading-relaxed font-medium">
                                The automated Unified Payments Interface is presently reserved for institutional auditing. <strong>Direct checkout is temporarily restricted to prevent dual debits.</strong>
                                </p>
                                <div className="bg-white/80 border border-amber-300 p-2.5 text-[11px] font-bold text-amber-900 uppercase tracking-wide space-y-1">
                                <p className="flex items-center gap-1.5 text-amber-950">
                                    <Check className="w-3.5 h-3.5 text-emerald-700" />
                                    <span>Mandatory Desk Clearance Protocol:</span>
                                </p>
                                <p className="text-slate-700 font-semibold normal-case">
                                    Please download your <strong>Certified Due Assessment Slip (PDF)</strong> below and remit cash directly to the <strong>Hostel Treasury Desk</strong>.
                                </p>
                                </div>
                            </div>
                            </div>
                        </div>

                        <div className="border border-slate-300 bg-slate-100 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                            <div className="text-xs font-black uppercase text-slate-900 tracking-wide">
                                Total Payable Amount: <span className="text-blue-950 text-base sm:text-lg font-serif font-black">₹{billAmountToPay.toLocaleString()}/-</span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">
                                Authorized Mode: Physical Cash Counterfoil Deposit
                            </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full sm:w-auto">
                            <button 
                                type="button"
                                disabled={true}
                                className="bg-slate-200 text-slate-500 border border-slate-300 font-bold px-4 py-3 text-xs uppercase tracking-wider cursor-not-allowed flex items-center justify-center gap-2 select-none"
                            >
                                <CreditCard className="w-4 h-4 opacity-40" />
                                <span>UPI Clearance Paused</span>
                            </button>

                            <button 
                                type="button"
                                onClick={handlePrintReceipt}
                                className="bg-blue-950 hover:bg-blue-900 active:bg-blue-950 text-white font-black px-5 py-3 text-xs uppercase tracking-widest transition cursor-pointer flex items-center justify-center gap-2 border-b-2 border-amber-500 shadow-sm active:scale-95"
                            >
                                <Printer className="w-4 h-4 text-amber-400" />
                                <span>Print Assessment Slip (PDF)</span>
                            </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 bg-white border-2 border-slate-400 shadow-md p-5 sm:p-10 relative">
                    <div className="border-b-4 border-amber-600 pb-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-950 border-2 border-amber-500 text-white flex flex-col items-center justify-center text-center shrink-0 shadow-xs">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                        <span className="text-[5px] sm:text-[6px] font-black uppercase tracking-widest text-amber-200">SEAL</span>
                        </div>
                        <div>
                        <span className="text-[8px] font-black bg-slate-900 text-amber-300 px-2 py-0.5 uppercase tracking-widest inline-block mb-1">
                            Statutory Student Cooperative Voucher
                        </span>
                        <h1 className="text-base sm:text-xl font-black text-blue-950 uppercase tracking-tight font-serif">
                            Student Mess &amp; Diet Ledger System
                        </h1>
                        <h2 className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wide">
                            Independent Mess Committee • Official Due Assessment
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 bg-slate-50 border border-slate-300 p-3 mb-5 text-xs uppercase font-bold text-slate-800 font-mono">
                    <div>
                        <span className="text-[8px] text-slate-500 block uppercase font-sans">Assessment Slip Serial</span>
                        <span className="font-black text-blue-950">{deterministicInvoiceNo}</span>
                    </div>
                    <div className="sm:text-right">
                        <span className="text-[8px] text-slate-500 block uppercase font-sans">Assessment Issued On</span>
                        <span className="text-slate-900">{new Date().toLocaleString()}</span>
                    </div>
                    </div>

                    <div className="mb-5">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        <span>Member Academic Dossier &amp; Residence Identification</span>
                        </h3>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Registry Statute 3.1</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-300 text-xs uppercase min-w-[450px]">
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
                        </tbody>
                        </table>
                    </div>
                    </div>

                    {/* Highly Detailed Fee Breakdown */}
                    <div className="mb-6">
                    <div className="flex items-center justify-between border-b border-slate-300 pb-1.5 mb-2">
                        <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 font-serif flex items-center gap-1.5">
                        <Landmark className="w-3.5 h-3.5 text-amber-700" />
                        <span>Assessment Dues &amp; Statutory Breakdown</span>
                        </h3>
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Billing Cycle: {currentMonthPrefix}</span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-300 text-xs uppercase min-w-[500px]">
                        <thead className="bg-blue-950 text-white font-black">
                            <tr>
                            <th className="p-2.5 border-r border-slate-700">Statutory Head of Expense</th>
                            <th className="p-2.5 border-r border-slate-700">Consumption Particulars</th>
                            <th className="p-2.5 text-right">Computed Amount</th>
                            </tr>
                        </thead>
                        <tbody className="font-semibold divide-y divide-slate-300">
                            <tr>
                            <td className="p-2.5 border-r border-slate-300 text-slate-900">
                                Mandatory Minimum Diet Quota
                            </td>
                            <td className="p-2.5 border-r border-slate-300 text-slate-500 font-bold">
                                Compulsory Base Maintenance Fee
                            </td>
                            <td className="p-2.5 text-right text-slate-900 font-bold whitespace-nowrap">
                                ₹{baseMaintenanceFee.toLocaleString()}/-
                            </td>
                            </tr>
                            <tr>
                            <td className="p-2.5 border-r border-slate-300 text-slate-900">
                                Additional Standard Diets Consumed
                            </td>
                            <td className="p-2.5 border-r border-slate-300 text-slate-700">
                                Total Diets Logged: <strong className="text-blue-950">{totalDietsCount}</strong><br/>
                                <span className="text-[9px] text-slate-400">({extraDietsCost > 0 ? 'Excess Tariff Applied' : 'Covered Under Base Quota'})</span>
                            </td>
                            <td className="p-2.5 text-right text-slate-900 font-bold whitespace-nowrap">
                                {extraDietsCost > 0 ? `₹${extraDietsCost.toLocaleString()}/-` : 'INCLUDED'}
                            </td>
                            </tr>
                            <tr>
                            <td className="p-2.5 border-r border-slate-300 text-slate-900">
                                Supplementary Extra Items
                            </td>
                            <td className="p-2.5 border-r border-slate-300 text-slate-700">
                                User Added Market-Rate Extras
                            </td>
                            <td className="p-2.5 text-right text-slate-900 font-bold whitespace-nowrap">
                                {totalExtrasCost > 0 ? `₹${totalExtrasCost.toLocaleString()}/-` : 'NIL'}
                            </td>
                            </tr>
                            <tr className="bg-slate-100 font-black">
                            <td className="p-2.5 border-r border-slate-300 text-blue-950">
                                Total Assessed Dues to Remit
                            </td>
                            <td className="p-2.5 border-r border-slate-300 text-amber-800">
                                Direct Treasury Desk Deposit
                            </td>
                            <td className="p-2.5 text-right text-blue-950 text-sm font-serif whitespace-nowrap">
                                ₹{billAmountToPay.toLocaleString()}/-
                            </td>
                            </tr>
                        </tbody>
                        </table>
                    </div>
                    </div>

                    <div className="relative my-6 border-t-2 border-dashed border-slate-400">
                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-3 text-[7px] sm:text-[8px] font-mono uppercase text-slate-400 font-bold tracking-widest whitespace-nowrap">
                        ✂ Tear-off Voucher Counterfoil for Treasury Desk Reconciliation ✂
                    </span>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 pt-2 text-[10px] text-slate-600 uppercase font-bold">
                    <div className="space-y-1">
                        <p className="text-slate-800 font-black flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 inline" />
                        <span>Legally Audited under Independent Mess Bylaws</span>
                        </p>
                        <p className="text-[9px] text-slate-500 normal-case font-medium">
                        * The candidate must retain this stamped counterfoil until the conclusion of the academic session.
                        </p>
                    </div>

                    <div className="flex items-center gap-6 sm:gap-8 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-center">
                        <div className="h-10 border-b border-slate-400 w-28 sm:w-32"></div>
                        <p className="pt-1 text-slate-700 font-black text-[9px]">Candidate Member</p>
                        <p className="text-[8px] text-slate-400 font-mono">Signatory</p>
                        </div>

                        <div className="text-right">
                        <div className="h-10 border-b border-slate-400 w-36 sm:w-40"></div>
                        <p className="pt-1 text-blue-950 font-black text-[9px]">Mess Treasurer &amp; Desk</p>
                        <p className="text-[8px] text-slate-500 font-mono">Cooperative Audit Seal</p>
                        </div>
                    </div>
                    </div>

                </div>
            </div>
        )}
      </main>
    </div>
  );
}