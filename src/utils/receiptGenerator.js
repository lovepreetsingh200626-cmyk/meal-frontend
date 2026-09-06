import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateFeeReceipt = ({ student, paymentDetails }) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const margin = 14;

    /* =====================================================
       BASIC DATA
    ===================================================== */

    const receiptNo = paymentDetails?.receiptNo || 'N/A';

    const transactionRef =
      paymentDetails?.txnId ||
      paymentDetails?.transactionId ||
      'N/A';

    const paymentDate =
      paymentDetails?.date ||
      paymentDetails?.paymentDate ||
      new Date().toLocaleString('en-IN');

    const paymentMode = String(
      paymentDetails?.paymentChannel ||
        paymentDetails?.mode ||
        'Online'
    ).toUpperCase();

    const amount = Number(paymentDetails?.amount || 0);

    const formatAmount = (value) => {
      return `INR ${Number(value || 0).toLocaleString('en-IN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    const studentName =
      student?.name || 'N/A';

    const rollNumber =
      student?.rollNo || 'N/A';

    const studentId =
      student?.studentId || 'N/A';

    const hostel =
      student?.hostelNo ||
      student?.hostelId?.hostelNumber ||
      'N/A';

    const department =
      student?.department || 'N/A';

    const university =
      student?.university || 'B.Tech';

    const session =
      student?.session || 'N/A';

    const category =
      student?.category || 'General';


    /* =====================================================
       HEADER
    ===================================================== */

    // Blue header
    doc.setFillColor(30, 58, 138);

    doc.rect(
      0,
      0,
      pageWidth,
      25,
      'F'
    );


    // University name
    doc.setTextColor(255, 255, 255);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(14);

    doc.text(
      'GURU NANAK DEV UNIVERSITY, AMRITSAR',
      pageWidth / 2,
      10,
      {
        align: 'center',
      }
    );


    // Subtitle
    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(8.5);

    doc.text(
      'DIRECTORATE OF HOSTELS & MESS OPERATIONS',
      pageWidth / 2,
      17,
      {
        align: 'center',
      }
    );


    doc.setFontSize(7.5);

    doc.text(
      'OFFICIAL FEE RECEIPT',
      pageWidth / 2,
      21.5,
      {
        align: 'center',
      }
    );


    /* =====================================================
       RECEIPT INFORMATION
    ===================================================== */

    let y = 34;

    doc.setTextColor(15, 23, 42);

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(9.5);

    doc.text(
      'PAYMENT RECEIPT',
      margin,
      y
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(8.5);

    doc.text(
      `Receipt No: ${receiptNo}`,
      pageWidth - margin,
      y,
      {
        align: 'right',
      }
    );


    y += 6;

    doc.text(
      `Transaction Ref: ${transactionRef}`,
      margin,
      y
    );

    doc.text(
      `Date & Time: ${paymentDate}`,
      pageWidth - margin,
      y,
      {
        align: 'right',
      }
    );


    /* =====================================================
       SEPARATOR
    ===================================================== */

    y += 5;

    doc.setDrawColor(203, 213, 225);

    doc.line(
      margin,
      y,
      pageWidth - margin,
      y
    );


    /* =====================================================
       STUDENT INFORMATION
    ===================================================== */

    y += 7;

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(10);

    doc.text(
      'Student Information',
      margin,
      y
    );


    y += 3;


    autoTable(doc, {
      startY: y,

      theme: 'grid',

      margin: {
        left: margin,
        right: margin,
      },

      styles: {
        font: 'helvetica',
        fontSize: 8.2,
        cellPadding: 2.5,
        lineColor: [220, 226, 234],
        lineWidth: 0.2,
        textColor: [30, 41, 59],
        valign: 'middle',
      },

      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [30, 41, 59],
        fontStyle: 'bold',
        fontSize: 8,
      },

      columnStyles: {
        0: {
          cellWidth: 34,
          fontStyle: 'bold',
        },

        1: {
          cellWidth: 60,
        },

        2: {
          cellWidth: 34,
          fontStyle: 'bold',
        },

        3: {
          cellWidth: 'auto',
        },
      },

      body: [
        [
          'Student Name',
          studentName.toUpperCase(),
          'Roll Number',
          String(rollNumber),
        ],

        [
          'Student ID',
          String(studentId),
          'Hostel',
          String(hostel),
        ],

        [
          'Course / Degree',
          String(university),
          'Department',
          String(department),
        ],

        [
          'Academic Session',
          String(session),
          'Category',
          String(category),
        ],
      ],
    });


    /* =====================================================
       PAYMENT DETAILS
    ===================================================== */

    y = doc.lastAutoTable.finalY + 8;

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(10);

    doc.text(
      'Payment Details',
      margin,
      y
    );


    y += 3;


    autoTable(doc, {
      startY: y,

      theme: 'grid',

      margin: {
        left: margin,
        right: margin,
      },

      styles: {
        font: 'helvetica',
        fontSize: 8.5,
        cellPadding: 3.2,
        lineColor: [220, 226, 234],
        lineWidth: 0.2,
        textColor: [30, 41, 59],
        valign: 'middle',
      },

      headStyles: {
        fillColor: [30, 58, 138],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
      },

      columnStyles: {
        0: {
          cellWidth: 85,
        },

        1: {
          cellWidth: 50,
          halign: 'center',
        },

        2: {
          cellWidth: 'auto',
          halign: 'right',
          fontStyle: 'bold',
        },
      },

      head: [
        [
          'Fee Particulars',
          'Payment Mode',
          'Amount',
        ],
      ],

      body: [
        [
          'Monthly Mess Maintenance & Dining Dues',
          paymentMode,
          formatAmount(amount),
        ],
      ],
    });


    /* =====================================================
       TOTAL PAYMENT BOX
    ===================================================== */

    y = doc.lastAutoTable.finalY + 9;

    const totalBoxHeight = 23;

    /*
      Make sure the total box stays on the same page.
    */

    if (
      y + totalBoxHeight >
      pageHeight - 38
    ) {
      y = pageHeight - 38 - totalBoxHeight;
    }


    doc.setFillColor(
      239,
      246,
      255
    );

    doc.setDrawColor(
      147,
      197,
      253
    );

    doc.roundedRect(
      margin,
      y,
      pageWidth - margin * 2,
      totalBoxHeight,
      3,
      3,
      'FD'
    );


    doc.setTextColor(
      30,
      64,
      175
    );

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(9);

    doc.text(
      'TOTAL AMOUNT PAID',
      margin + 7,
      y + 9
    );


    doc.setFontSize(15);

    doc.text(
      formatAmount(amount),
      pageWidth - margin - 7,
      y + 10,
      {
        align: 'right',
      }
    );


    /* =====================================================
       PAYMENT STATUS
    ===================================================== */

    y += totalBoxHeight + 9;


    doc.setFillColor(
      240,
      253,
      244
    );

    doc.setDrawColor(
      134,
      239,
      172
    );

    doc.roundedRect(
      margin,
      y,
      pageWidth - margin * 2,
      13,
      2.5,
      2.5,
      'FD'
    );


    doc.setTextColor(
      21,
      128,
      61
    );

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(8.5);

    doc.text(
      `PAYMENT STATUS: CLEARED`,
      margin + 6,
      y + 8
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.text(
      `Mode: ${paymentMode}`,
      pageWidth - margin - 6,
      y + 8,
      {
        align: 'right',
      }
    );


    /* =====================================================
       VERIFICATION NOTE
    ===================================================== */

    y += 21;

    doc.setTextColor(
      71,
      85,
      105
    );

    doc.setFont(
      'helvetica',
      'italic'
    );

    doc.setFontSize(7.5);

    doc.text(
      'This is a computer-generated fee receipt issued through the GNDU Hostel & Mess Management Portal.',
      margin,
      y
    );


    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.text(
      'No physical signature is required for this electronically generated receipt.',
      margin,
      y + 5
    );


    /* =====================================================
       AUTHORITY
    ===================================================== */

    doc.setTextColor(
      30,
      41,
      59
    );

    doc.setFont(
      'helvetica',
      'bold'
    );

    doc.setFontSize(8);

    doc.text(
      'Mess Accounts Office',
      pageWidth - margin,
      y + 1,
      {
        align: 'right',
      }
    );

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(7.5);

    doc.text(
      'Guru Nanak Dev University, Amritsar',
      pageWidth - margin,
      y + 6,
      {
        align: 'right',
      }
    );


    /* =====================================================
       FOOTER
    ===================================================== */

    const footerY =
      pageHeight - 12;

    doc.setDrawColor(
      226,
      232,
      240
    );

    doc.line(
      margin,
      footerY - 5,
      pageWidth - margin,
      footerY - 5
    );


    doc.setTextColor(
      100,
      116,
      139
    );

    doc.setFont(
      'helvetica',
      'normal'
    );

    doc.setFontSize(7);

    doc.text(
      'Hostel & Mess Management Portal',
      margin,
      footerY
    );

    doc.text(
      `Generated: ${new Date().toLocaleDateString('en-IN')}`,
      pageWidth / 2,
      footerY,
      {
        align: 'center',
      }
    );

    doc.text(
      'Page 1 of 1',
      pageWidth - margin,
      footerY,
      {
        align: 'right',
      }
    );


    /* =====================================================
       FILE NAME
    ===================================================== */

    const safeStudentIdentifier = String(
      student?.rollNo ||
        student?.studentId ||
        'Student'
    ).replace(
      /[^a-zA-Z0-9_-]/g,
      ''
    );


    const dateForFileName =
      new Date()
        .toISOString()
        .slice(0, 10);


    const fileName =
      `GNDU_Mess_Receipt_${safeStudentIdentifier}_${dateForFileName}.pdf`;


    /* =====================================================
       DOWNLOAD
    ===================================================== */

    doc.save(fileName);

  } catch (err) {
    console.error(
      'PDF generation crash caught:',
      err
    );

    alert(
      'Could not generate the fee receipt. Please try again.'
    );
  }
};