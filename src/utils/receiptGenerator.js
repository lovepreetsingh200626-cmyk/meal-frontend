import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFeeReceipt = ({ student, paymentDetails }) => {
  try {
    const doc = new jsPDF();

    // 1. Official Header Banner
    doc.setFillColor(30, 58, 138); // Deep GNDU Blue
    doc.rect(0, 0, 210, 24, 'F');

    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('GURU NANAK DEV UNIVERSITY, AMRITSAR', 105, 11, { align: 'center' });

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('DIRECTORATE OF HOSTELS & MESS OPERATIONS • OFFICIAL FEE RECEIPT', 105, 18, { align: 'center' });

    // 2. Receipt Metadata
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(`Receipt No: ${paymentDetails?.receiptNo || 'N/A'}`, 14, 34);
    doc.text(`Transaction Ref: ${paymentDetails?.txnId || 'N/A'}`, 14, 40);
    doc.text(`Date & Time: ${paymentDetails?.date || new Date().toLocaleString()}`, 14, 46);

    // 3. Student Academic Dossier Table
    autoTable(doc, {
      startY: 52,
      theme: 'grid',
      headStyles: { fillColor: [234, 88, 12], textColor: 255, fontStyle: 'bold' },
      head: [['Academic Dossier Field', 'Candidate Official Particulars']],
      body: [
        ['Student Name', (student?.name || 'N/A').toUpperCase()],
        ['Roll Number', String(student?.rollNo || 'N/A')],
        ['University Registration ID', String(student?.studentId || 'N/A')],
        ['Allotted Hostel', String(student?.hostelNo || 'N/A')],
        ['Course / Degree', String(student?.university || 'B.Tech')],
        ['Department Branch', String(student?.department || 'N/A')],
        ['Academic Session', String(student?.session || '2024-2028')],
        ['Social Category', String(student?.category || 'General')]
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

    // 5. Verification Footnote & Institutional Seal
    const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 180;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('* This is a computer-verified institutional fee receipt generated via GNDU Student Portal.', 14, finalY);
    doc.text(`Settlement Status: CLEARED (${paymentModeText})`, 14, finalY + 5);

    doc.setFont('helvetica', 'bold');
    doc.text('Superintendent of Mess Accounts', 195, finalY + 12, { align: 'right' });
    doc.text('Guru Nanak Dev University, Amritsar', 195, finalY + 16, { align: 'right' });

    // Download directly to student's system
    doc.save(`GNDU_Mess_Receipt_${student?.rollNo || student?.studentId || 'Student'}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err) {
    console.error('PDF generation crash caught:', err);
    alert('Could not generate PDF. Please ensure jspdf and jspdf-autotable are installed.');
  }
};