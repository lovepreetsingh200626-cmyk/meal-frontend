import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Download,
  FileText,
  IndianRupee,
  Loader2,
  RefreshCw,
  CalendarDays,
  Utensils,
  ReceiptText,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import API from '../../services/api';


/* =========================================================
   HELPERS
========================================================= */

const getLocalDateString = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};


const getLocalMonthPrefix = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');

  return `${year}-${month}`;
};


const formatCurrency = (value) => {
  const amount = Number(value || 0);

  return `₹${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};


/*
  PDF uses "Rs." instead of "₹".

  jsPDF's default Helvetica font does not properly
  support the Indian Rupee Unicode character.
*/
const formatPdfCurrency = (value) => {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString('en-IN', {
    maximumFractionDigits: 0,
  })}`;
};


const formatDate = (dateValue) => {
  if (!dateValue) return '—';

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return String(dateValue);
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};


/* =========================================================
   MEAL DETECTION
========================================================= */

const isMealTaken = (record, meal) => {
  if (!record) return false;

  const possibleValues = [
    record?.[meal],
    record?.meals?.[meal],
    record?.mealStatus?.[meal],
  ];

  for (const value of possibleValues) {
    if (value === true) return true;

    if (typeof value === 'number') {
      if (value > 0) return true;
    }

    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();

      if (
        normalized === 'true' ||
        normalized === 'taken' ||
        normalized === 'yes' ||
        normalized === '1'
      ) {
        return true;
      }

      const numericValue = Number(normalized);

      if (
        normalized !== '' &&
        Number.isFinite(numericValue) &&
        numericValue > 0
      ) {
        return true;
      }
    }
  }

  return false;
};


/* =========================================================
   EXTRA ITEMS
========================================================= */

const getExtrasCost = (record) => {
  if (!record) return 0;

  const possibleValues = [
    record.extraItemsCost,
    record.extrasCost,
    record.extraCost,
    record.extraItems?.totalCost,
    record.extras?.totalCost,
  ];

  for (const value of possibleValues) {
    const numericValue = Number(value);

    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return 0;
};


/* =========================================================
   DAILY TOTAL
========================================================= */

const getDailyTotal = (record) => {
  if (!record) return 0;

  const possibleValues = [
    record.totalCost,
    record.dailyTotal,
    record.total,
    record.amount,
  ];

  for (const value of possibleValues) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string' && value.trim() !== '') {
      const numericValue = Number(value);

      if (Number.isFinite(numericValue)) {
        return numericValue;
      }
    }
  }

  /*
    Fallback:

    If backend doesn't provide totalCost,
    calculate using the available meal costs.

    This prevents incorrect 0 values.
  */

  const mealCosts = [
    record?.breakfastCost,
    record?.lunchCost,
    record?.dinnerCost,
  ];

  const mealTotal = mealCosts.reduce((sum, value) => {
    const numericValue = Number(value || 0);

    return sum + (Number.isFinite(numericValue) ? numericValue : 0);
  }, 0);

  const extras = getExtrasCost(record);

  if (mealTotal > 0 || extras > 0) {
    return mealTotal + extras;
  }

  return 0;
};


/* =========================================================
   MEAL COUNT
========================================================= */

const getMealCount = (record) => {
  if (!record) return 0;

  return ['breakfast', 'lunch', 'dinner'].filter((meal) =>
    isMealTaken(record, meal)
  ).length;
};


/* =========================================================
   COMPONENT
========================================================= */

export default function StudentPaymentPage({ user }) {
  const studentId = user?._id || user?.id;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');


  /* =======================================================
     FETCH MEAL RECORDS
  ======================================================= */

  const fetchRecords = async () => {
    if (!studentId) {
      setRecords([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const response = await API.get(`/meals/user/${studentId}`);

      const data = response?.data;

      if (Array.isArray(data)) {
        setRecords(data);
      } else if (Array.isArray(data?.records)) {
        setRecords(data.records);
      } else if (Array.isArray(data?.meals)) {
        setRecords(data.meals);
      } else {
        setRecords([]);
      }
    } catch (error) {
      console.error('Failed to fetch payment records:', error);

      setErrorMsg(
        error?.response?.data?.message ||
          'Unable to load your mess payment records.'
      );

      setRecords([]);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchRecords();
  }, [studentId]);


  /* =======================================================
     CURRENT MONTH
  ======================================================= */

  const currentMonthPrefix = getLocalMonthPrefix();

  const currentMonthName = new Date().toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  });


  /* =======================================================
     FILTER CURRENT MONTH RECORDS
  ======================================================= */

  const monthlyRecords = useMemo(() => {
    return records.filter((record) => {
      const rawDate =
        record?.date ||
        record?.mealDate ||
        record?.createdAt ||
        record?.created_date;

      if (!rawDate) return false;

      const dateString =
        typeof rawDate === 'string'
          ? rawDate.slice(0, 10)
          : getLocalDateString(new Date(rawDate));

      return dateString.startsWith(currentMonthPrefix);
    });
  }, [records, currentMonthPrefix]);


  /* =======================================================
     MONTHLY CALCULATIONS
  ======================================================= */

  const summary = useMemo(() => {
    const dietCost = monthlyRecords.reduce(
      (sum, record) => sum + getDailyTotal(record),
      0
    );

    const extrasCost = monthlyRecords.reduce(
      (sum, record) => sum + getExtrasCost(record),
      0
    );

    const mealsRecorded = monthlyRecords.reduce(
      (sum, record) => sum + getMealCount(record),
      0
    );

    const baseFee =
      String(user?.gender || '').toLowerCase() === 'female'
        ? 1000
        : 1100;

    const additionalDietCharges = Math.max(
      dietCost - extrasCost,
      0
    );

    const totalPayable = baseFee + additionalDietCharges + extrasCost;

    return {
      baseFee,
      dietCost,
      extrasCost,
      additionalDietCharges,
      mealsRecorded,
      daysRecorded: monthlyRecords.length,
      totalPayable,
    };
  }, [monthlyRecords, user]);


  /* =======================================================
     PDF GENERATION
  ======================================================= */

  const generatePDF = () => {
    try {
      setGenerating(true);
      setErrorMsg('');
      setSuccessMsg('');

      /*
        A4 portrait.
        Everything is deliberately kept inside the page.
      */

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 14;

      let y = 14;


      /* ===================================================
         HEADER
      =================================================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);

      doc.text(
        'HOSTEL & MESS MANAGEMENT',
        pageWidth / 2,
        y,
        { align: 'center' }
      );

      y += 7;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      doc.text(
        'Student Mess Payment Statement',
        pageWidth / 2,
        y,
        { align: 'center' }
      );

      y += 8;


      /* Header line */

      doc.setDrawColor(210, 214, 220);
      doc.line(margin, y, pageWidth - margin, y);

      y += 8;


      /* ===================================================
         STATEMENT INFO
      =================================================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);

      doc.text(
        'PAYMENT STATEMENT',
        margin,
        y
      );

      doc.setFont('helvetica', 'normal');

      doc.text(
        `Billing Period: ${currentMonthName}`,
        pageWidth - margin,
        y,
        { align: 'right' }
      );

      y += 6;

      doc.text(
        `Invoice: INV-${currentMonthPrefix.replace('-', '')}-${String(
          user?.rollNo || user?.studentId || 'STUDENT'
        )}`,
        margin,
        y
      );

      y += 8;


      /* ===================================================
         STUDENT INFORMATION
      =================================================== */

      autoTable(doc, {
        startY: y,

        theme: 'grid',

        margin: {
          left: margin,
          right: margin,
        },

        styles: {
          font: 'helvetica',
          fontSize: 8,
          cellPadding: 2.4,
          lineColor: [220, 224, 230],
          lineWidth: 0.2,
          textColor: [35, 42, 52],
        },

        headStyles: {
          fillColor: [241, 245, 249],
          textColor: [30, 41, 59],
          fontStyle: 'bold',
          fontSize: 8,
        },

        columnStyles: {
          0: {
            cellWidth: 28,
            fontStyle: 'bold',
          },
          1: {
            cellWidth: 58,
          },
          2: {
            cellWidth: 28,
            fontStyle: 'bold',
          },
          3: {
            cellWidth: 'auto',
          },
        },

        body: [
          [
            'Name',
            user?.name || '—',
            'Student ID',
            user?.studentId || '—',
          ],
          [
            'Roll No.',
            user?.rollNo || '—',
            'Hostel',
            user?.hostelNo || user?.hostelId?.hostelNumber || '—',
          ],
          [
            'Department',
            user?.department || '—',
            'Session',
            user?.session || '—',
          ],
        ],

        didDrawPage: () => {
          // Prevent automatic page additions.
          // The table is intentionally compact.
        },
      });


      y = doc.lastAutoTable.finalY + 7;


      /* ===================================================
         MONTHLY PAYMENT SUMMARY
      =================================================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);

      doc.text(
        'Monthly Payment Summary',
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
          fontSize: 8,
          cellPadding: 2.6,
          lineColor: [220, 224, 230],
          lineWidth: 0.2,
          textColor: [35, 42, 52],
        },

        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
        },

        columnStyles: {
          0: {
            cellWidth: 120,
          },
          1: {
            cellWidth: 'auto',
            halign: 'right',
          },
        },

        head: [
          ['Description', 'Amount'],
        ],

        body: [
          [
            'Base Maintenance Fee',
            formatPdfCurrency(summary.baseFee),
          ],
          [
            'Additional Diet Charges',
            formatPdfCurrency(summary.additionalDietCharges),
          ],
          [
            'Extra Items',
            formatPdfCurrency(summary.extrasCost),
          ],
          [
            'TOTAL PAYABLE',
            formatPdfCurrency(summary.totalPayable),
          ],
        ],

        didParseCell: (data) => {
          if (
            data.row.index === 3 &&
            data.section === 'body'
          ) {
            data.cell.styles.fontStyle = 'bold';
          }
        },
      });


      y = doc.lastAutoTable.finalY + 7;


      /* ===================================================
         MESS USAGE
      =================================================== */

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);

      doc.text(
        'Mess Usage',
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
          fontSize: 8,
          cellPadding: 2.6,
          lineColor: [220, 224, 230],
          lineWidth: 0.2,
          textColor: [35, 42, 52],
        },

        columnStyles: {
          0: {
            cellWidth: 90,
          },
          1: {
            cellWidth: 'auto',
            halign: 'right',
          },
        },

        body: [
          [
            'Days Recorded',
            String(summary.daysRecorded),
          ],
          [
            'Meals Recorded',
            String(summary.mealsRecorded),
          ],
          [
            'Diet Cost',
            formatPdfCurrency(summary.dietCost),
          ],
          [
            'Extra Items Cost',
            formatPdfCurrency(summary.extrasCost),
          ],
        ],
      });


      y = doc.lastAutoTable.finalY + 8;


      /* ===================================================
         FINAL TOTAL BOX
      =================================================== */

      const totalBoxHeight = 21;

      /*
        Safety check.

        If somehow content becomes taller than expected,
        reduce the position instead of creating page 2.
      */

      if (y + totalBoxHeight > pageHeight - 27) {
        y = pageHeight - 27 - totalBoxHeight;
      }

      doc.setFillColor(239, 246, 255);
      doc.setDrawColor(147, 197, 253);

      doc.roundedRect(
        margin,
        y,
        pageWidth - margin * 2,
        totalBoxHeight,
        3,
        3,
        'FD'
      );

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);

      doc.text(
        'TOTAL AMOUNT PAYABLE',
        margin + 6,
        y + 8
      );

      doc.setFontSize(15);

      doc.text(
        formatPdfCurrency(summary.totalPayable),
        pageWidth - margin - 6,
        y + 11,
        { align: 'right' }
      );


      /* ===================================================
         FOOTER
      =================================================== */

      const footerY = pageHeight - 15;

      doc.setDrawColor(220, 224, 230);

      doc.line(
        margin,
        footerY - 5,
        pageWidth - margin,
        footerY - 5
      );

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);

      doc.setTextColor(90, 98, 108);

      doc.text(
        `Generated on ${formatDate(new Date())}`,
        margin,
        footerY
      );

      doc.text(
        'Hostel & Mess Management Portal',
        pageWidth / 2,
        footerY,
        { align: 'center' }
      );

      doc.text(
        'Page 1 of 1',
        pageWidth - margin,
        footerY,
        { align: 'right' }
      );

      doc.setTextColor(35, 42, 52);


      /* ===================================================
         FILE NAME
      =================================================== */

      const safeRollNo = String(
        user?.rollNo ||
          user?.studentId ||
          'student'
      ).replace(/[^a-zA-Z0-9_-]/g, '');

      const fileName =
        `Mess-Payment-${currentMonthPrefix}-${safeRollNo}.pdf`;


      /* ===================================================
         SAVE
      =================================================== */

      doc.save(fileName);

      setSuccessMsg(
        'Payment statement generated successfully.'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);

    } catch (error) {
      console.error('PDF generation failed:', error);

      setErrorMsg(
        'Unable to generate the payment statement. Please try again.'
      );
    } finally {
      setGenerating(false);
    }
  };


  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2
            size={30}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium">
            Loading payment statement...
          </p>
        </div>
      </div>
    );
  }


  /* =======================================================
     UI
  ======================================================= */

  return (
    <div className="space-y-6">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <CreditCard size={23} />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                Student Finance
              </p>

              <h1 className="mt-1 text-xl sm:text-2xl font-bold text-slate-900">
                Payment Statement
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                View your current monthly mess charges and
                generate an official payment statement.
              </p>
            </div>

          </div>


          <div className="flex flex-col sm:flex-row gap-2">

            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading || generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={17} />

              Refresh
            </button>


            <button
              type="button"
              onClick={generatePDF}
              disabled={generating}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {generating ? (
                <>
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Download size={17} />

                  Download Statement
                </>
              )}
            </button>

          </div>

        </div>

      </section>


      {/* ===================================================
          ALERTS
      =================================================== */}

      {errorMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p>{errorMsg}</p>
        </div>
      )}


      {successMsg && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2
            size={19}
            className="mt-0.5 shrink-0"
          />

          <p>{successMsg}</p>
        </div>
      )}


      {/* ===================================================
          MONTH / TOTAL
      =================================================== */}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Billing Period
              </p>

              <p className="mt-2 text-lg font-bold text-slate-900">
                {currentMonthName}
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
              <CalendarDays size={20} />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Days Recorded
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.daysRecorded}
              </p>
            </div>

            <div className="rounded-xl bg-slate-100 p-2.5 text-slate-700">
              <FileText size={20} />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Meals Recorded
              </p>

              <p className="mt-2 text-2xl font-bold text-slate-900">
                {summary.mealsRecorded}
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-700">
              <Utensils size={20} />
            </div>

          </div>

        </div>


        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                Total Payable
              </p>

              <p className="mt-2 text-2xl font-bold text-blue-900">
                {formatCurrency(summary.totalPayable)}
              </p>
            </div>

            <div className="rounded-xl bg-white p-2.5 text-blue-700 shadow-sm">
              <IndianRupee size={20} />
            </div>

          </div>

        </div>

      </section>


      {/* ===================================================
          PAYMENT BREAKDOWN
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        <div className="border-b border-slate-200 px-5 py-4 sm:px-6">

          <div className="flex items-center gap-3">

            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <ReceiptText size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-900">
                Monthly Payment Summary
              </h2>

              <p className="text-xs text-slate-500">
                Charges calculated from your current mess records.
              </p>
            </div>

          </div>

        </div>


        <div className="divide-y divide-slate-100">

          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">

            <div>
              <p className="font-medium text-slate-800">
                Base Maintenance Fee
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Monthly hostel mess maintenance
              </p>
            </div>

            <p className="font-bold text-slate-900">
              {formatCurrency(summary.baseFee)}
            </p>

          </div>


          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">

            <div>
              <p className="font-medium text-slate-800">
                Additional Diet Charges
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Charges from recorded meals
              </p>
            </div>

            <p className="font-bold text-slate-900">
              {formatCurrency(summary.additionalDietCharges)}
            </p>

          </div>


          <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6">

            <div>
              <p className="font-medium text-slate-800">
                Extra Items
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                Additional items recorded
              </p>
            </div>

            <p className="font-bold text-slate-900">
              {formatCurrency(summary.extrasCost)}
            </p>

          </div>


          <div className="flex items-center justify-between gap-4 bg-blue-50 px-5 py-5 sm:px-6">

            <div>
              <p className="text-sm font-bold text-blue-900">
                Total Payable
              </p>

              <p className="mt-0.5 text-xs text-blue-700">
                Current monthly statement amount
              </p>
            </div>

            <p className="text-xl font-bold text-blue-900">
              {formatCurrency(summary.totalPayable)}
            </p>

          </div>

        </div>

      </section>


      {/* ===================================================
          USAGE SUMMARY
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <div className="rounded-lg bg-emerald-50 p-2 text-emerald-700">
            <Utensils size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Mess Usage
            </h2>

            <p className="text-xs text-slate-500">
              Activity recorded for {currentMonthName}.
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Days Recorded
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {summary.daysRecorded}
            </p>
          </div>


          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Meals Recorded
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {summary.mealsRecorded}
            </p>
          </div>


          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Diet Cost
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(summary.dietCost)}
            </p>
          </div>


          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500">
              Extra Items
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {formatCurrency(summary.extrasCost)}
            </p>
          </div>

        </div>

      </section>


      {/* ===================================================
          STUDENT INFORMATION
      =================================================== */}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">

        <div className="flex items-center gap-3 mb-5">

          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <FileText size={19} />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">
              Student Information
            </h2>

            <p className="text-xs text-slate-500">
              Information used on your payment statement.
            </p>
          </div>

        </div>


        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Name
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.name || '—'}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Student ID
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.studentId || '—'}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Roll Number
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.rollNo || '—'}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Hostel
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.hostelNo ||
                user?.hostelId?.hostelNumber ||
                '—'}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Department
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.department || '—'}
            </p>
          </div>


          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Session
            </p>

            <p className="mt-1 font-semibold text-slate-900">
              {user?.session || '—'}
            </p>
          </div>

        </div>

      </section>


      {/* ===================================================
          INFO NOTE
      =================================================== */}

      <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-5 text-slate-600">
        The downloadable statement is generated from the mess
        records currently available in the system. If any meal
        or charge appears incorrect, please contact the hostel
        mess administration.
      </div>

    </div>
  );
}