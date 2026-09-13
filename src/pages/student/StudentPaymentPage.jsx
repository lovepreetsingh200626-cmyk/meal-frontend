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
  ShieldCheck,
  WalletCards,
  X,
  QrCode,
  Landmark,
  Clock3,
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

    if (typeof value === 'number' && value > 0) {
      return true;
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
    record.dailyTotalCost,
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
   ONLINE PAYMENT PROTOTYPE
========================================================= */

const OnlinePaymentPrototype = ({ amount, monthName, onClose }) => {
  const paymentMethods = [
    {
      icon: QrCode,
      title: 'UPI',
      description: 'Google Pay, PhonePe, Paytm & other UPI apps',
    },
    {
      icon: CreditCard,
      title: 'Debit / Credit Card',
      description: 'Visa, Mastercard, RuPay & other supported cards',
    },
    {
      icon: Landmark,
      title: 'Net Banking',
      description: 'Secure bank account payment',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-3 backdrop-blur-sm sm:p-5">
      <div className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl">
        
        {/* HEADER */}
        <div className="relative overflow-hidden bg-blue-950 px-5 py-5 text-white sm:px-6 sm:py-6">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-blue-100 transition hover:bg-white/10 hover:text-white"
            aria-label="Close payment options"
          >
            <X size={20} />
          </button>

          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <WalletCards size={22} />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-200">
                Student Accounts
              </p>

              <h2 className="mt-0.5 text-lg font-bold sm:text-xl">
                Online Payment
              </h2>
            </div>
          </div>

          <p className="mt-4 text-xs leading-5 text-blue-100">
            Online payment facilities are being prepared for student mess
            accounts.
          </p>
        </div>

        {/* AMOUNT */}
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Amount Payable
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {formatCurrency(amount)}
              </p>

              <p className="mt-0.5 text-[10px] text-slate-500">
                {monthName} mess payment
              </p>
            </div>

            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700">
              <Clock3 size={12} />
              Coming Soon
            </span>
          </div>
        </div>

        {/* PAYMENT METHODS */}
        <div className="space-y-3 p-5 sm:p-6">
          <div>
            <p className="text-xs font-bold text-slate-900">
              Available payment methods
            </p>

            <p className="mt-0.5 text-[10px] text-slate-500">
              These options will become available after gateway activation.
            </p>
          </div>

          <div className="space-y-2.5">
            {paymentMethods.map((method) => {
              const Icon = method.icon;

              return (
                <div
                  key={method.title}
                  className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                    <Icon size={19} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-900">
                      {method.title}
                    </p>

                    <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                      {method.description}
                    </p>
                  </div>

                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[8px] font-bold uppercase tracking-wide text-slate-500">
                    Soon
                  </span>
                </div>
              );
            })}
          </div>

          {/* STATUS NOTICE */}
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
            <div className="flex items-start gap-2.5">
              <Clock3
                size={17}
                className="mt-0.5 shrink-0 text-amber-700"
              />

              <div>
                <p className="text-xs font-bold text-amber-900">
                  Payment Gateway Integration in Progress
                </p>

                <p className="mt-1 text-[10px] leading-4 text-amber-800">
                  Online payments are currently unavailable. The payment
                  gateway will be activated after the required institutional
                  verification and configuration are completed.
                </p>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="flex items-start gap-2 rounded-lg bg-slate-50 p-3">
            <ShieldCheck
              size={15}
              className="mt-0.5 shrink-0 text-emerald-600"
            />

            <p className="text-[9px] leading-4 text-slate-500">
              When activated, payments will be processed through a secure
              authorized payment gateway. No card or UPI information is stored
              by this portal.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function StudentPaymentPage({ user }) {
  const studentId = user?._id || user?.id;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [showOnlinePayment, setShowOnlinePayment] = useState(false);

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
     CURRENT MONTH RECORDS
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

    const totalPayable =
      baseFee +
      additionalDietCharges +
      extrasCost;

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
     OPEN ONLINE PAYMENT PROTOTYPE
  ======================================================= */

  const handleOpenOnlinePayment = () => {
    setErrorMsg('');
    setSuccessMsg('');
    setShowOnlinePayment(true);
  };

  /* =======================================================
     PDF GENERATION
  ======================================================= */

  const generatePDF = () => {
    try {
      setGenerating(true);
      setErrorMsg('');
      setSuccessMsg('');

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const margin = 14;
      let y = 14;

      /* HEADER */

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

      doc.setDrawColor(210, 214, 220);

      doc.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 8;

      /* STATEMENT INFO */

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
        `Invoice: INV-${currentMonthPrefix.replace(
          '-',
          ''
        )}-${String(
          user?.rollNo ||
            user?.studentId ||
            'STUDENT'
        )}`,
        margin,
        y
      );

      y += 8;

      /* STUDENT INFORMATION */

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
            user?.hostelNo ||
              user?.hostelId?.hostelNumber ||
              '—',
          ],

          [
            'Department',
            user?.department || '—',
            'Session',
            user?.session || '—',
          ],
        ],
      });

      y = doc.lastAutoTable.finalY + 7;

      /* MONTHLY SUMMARY */

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
            formatPdfCurrency(
              summary.additionalDietCharges
            ),
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

      /* MESS USAGE */

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

      /* FINAL TOTAL */

      const totalBoxHeight = 21;

      if (
        y + totalBoxHeight >
        pageHeight - 27
      ) {
        y =
          pageHeight -
          27 -
          totalBoxHeight;
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

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);

      doc.text(
        'TOTAL AMOUNT PAYABLE',
        margin + 6,
        y + 8
      );

      doc.setFontSize(15);

      doc.text(
        formatPdfCurrency(
          summary.totalPayable
        ),
        pageWidth - margin - 6,
        y + 11,
        { align: 'right' }
      );

      /* FOOTER */

      const footerY = pageHeight - 15;

      doc.setDrawColor(
        220,
        224,
        230
      );

      doc.line(
        margin,
        footerY - 5,
        pageWidth - margin,
        footerY - 5
      );

      doc.setFont(
        'helvetica',
        'normal'
      );

      doc.setFontSize(7.5);

      doc.setTextColor(
        90,
        98,
        108
      );

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

      doc.setTextColor(
        35,
        42,
        52
      );

      /* FILE NAME */

      const safeRollNo = String(
        user?.rollNo ||
          user?.studentId ||
          'student'
      ).replace(
        /[^a-zA-Z0-9_-]/g,
        ''
      );

      const fileName =
        `Mess-Payment-${currentMonthPrefix}-${safeRollNo}.pdf`;

      doc.save(fileName);

      setSuccessMsg(
        'Payment statement generated successfully.'
      );

      setTimeout(() => {
        setSuccessMsg('');
      }, 3500);
    } catch (error) {
      console.error(
        'PDF generation failed:',
        error
      );

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
      <div className="flex min-h-[55vh] w-full items-center justify-center px-3">
        <div className="flex flex-col items-center gap-2.5 text-slate-600">
          <Loader2
            size={27}
            className="animate-spin text-blue-600"
          />

          <p className="text-xs font-medium sm:text-sm">
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
    <div className="w-full min-w-0 space-y-3 overflow-x-hidden pb-4 sm:space-y-5 sm:pb-6">

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">
        <div className="flex min-w-0 flex-col gap-3 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div className="flex min-w-0 items-start gap-2.5 sm:gap-4">

            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 sm:h-12 sm:w-12 sm:rounded-xl">
              <CreditCard
                size={18}
                className="sm:hidden"
              />

              <CreditCard
                size={23}
                className="hidden sm:block"
              />
            </div>

            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wider text-blue-700 sm:text-xs">
                Student Finance
              </p>

              <h1 className="mt-0.5 truncate text-base font-bold text-slate-900 sm:mt-1 sm:text-2xl">
                Payment Statement
              </h1>

              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500 sm:text-sm sm:leading-5">
                View your current monthly mess charges and
                generate an official payment statement.
              </p>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">

            <button
              type="button"
              onClick={fetchRecords}
              disabled={loading || generating}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              <RefreshCw
                size={14}
                className="sm:hidden"
              />

              <RefreshCw
                size={17}
                className="hidden sm:block"
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={generatePDF}
              disabled={generating}
              className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg bg-blue-700 px-2.5 py-2 text-[11px] font-semibold text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 sm:gap-2 sm:rounded-xl sm:px-4 sm:py-2.5 sm:text-sm"
            >
              {generating ? (
                <>
                  <Loader2
                    size={14}
                    className="animate-spin sm:hidden"
                  />

                  <Loader2
                    size={17}
                    className="hidden animate-spin sm:block"
                  />

                  Generating...
                </>
              ) : (
                <>
                  <Download
                    size={14}
                    className="sm:hidden"
                  />

                  <Download
                    size={17}
                    className="hidden sm:block"
                  />

                  <span className="sm:hidden">
                    Download
                  </span>

                  <span className="hidden sm:inline">
                    Download Statement
                  </span>
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
        <div className="flex min-w-0 items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-2.5 text-[11px] leading-4 text-red-700 sm:gap-3 sm:rounded-xl sm:p-4 sm:text-sm sm:leading-5">
          <AlertCircle
            size={16}
            className="mt-0.5 shrink-0"
          />

          <p className="min-w-0 break-words">
            {errorMsg}
          </p>
        </div>
      )}

      {successMsg && (
        <div className="flex min-w-0 items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-[11px] leading-4 text-emerald-700 sm:gap-3 sm:rounded-xl sm:p-4 sm:text-sm sm:leading-5">
          <CheckCircle2
            size={16}
            className="mt-0.5 shrink-0"
          />

          <p className="min-w-0 break-words">
            {successMsg}
          </p>
        </div>
      )}

      {/* ===================================================
          ONLINE PAYMENT
      =================================================== */}

      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm sm:rounded-2xl">

        <div className="border-b border-blue-100 bg-blue-50/60 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-3">

            <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">

              <div className="shrink-0 rounded-lg bg-blue-100 p-1.5 text-blue-700 sm:rounded-xl sm:p-2.5">
                <WalletCards
                  size={17}
                  className="sm:hidden"
                />

                <WalletCards
                  size={20}
                  className="hidden sm:block"
                />
              </div>

              <div className="min-w-0">
                <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                  Pay Your Mess Charges Online
                </h2>

                <p className="mt-0.5 text-[9px] leading-4 text-slate-500 sm:text-xs sm:leading-5">
                  UPI and debit/credit card payment facility is
                  coming soon.
                </p>
              </div>
            </div>

            <div className="hidden shrink-0 items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-semibold text-amber-700 sm:flex">
              <Clock3 size={12} />
              Coming Soon
            </div>
          </div>
        </div>

        <div className="p-3 sm:p-5">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                Amount Due
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
                {formatCurrency(summary.totalPayable)}
              </p>

              <p className="mt-1 text-[9px] text-slate-500 sm:text-xs">
                {currentMonthName} mess payment
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenOnlinePayment}
              disabled={summary.totalPayable <= 0}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800 active:bg-blue-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[210px]"
            >
              <CreditCard size={18} />

              Pay Online
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-[9px] text-slate-500 sm:text-xs">
            <span>✓ UPI</span>
            <span>✓ Debit Card</span>
            <span>✓ Credit Card</span>
            <span>✓ Net Banking</span>
          </div>
        </div>
      </section>

      {/* ===================================================
          MONTH / TOTAL
      =================================================== */}

      <section className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">

        {/* BILLING PERIOD */}

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-2">

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                Billing Period
              </p>

              <p className="mt-1 truncate text-xs font-bold text-slate-900 sm:mt-2 sm:text-lg">
                {currentMonthName}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-700 sm:rounded-xl sm:p-2.5">
              <CalendarDays size={15} />
            </div>
          </div>
        </div>

        {/* DAYS */}

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-2">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                Days Recorded
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 sm:mt-2 sm:text-2xl">
                {summary.daysRecorded}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-slate-100 p-1.5 text-slate-700 sm:rounded-xl sm:p-2.5">
              <FileText size={15} />
            </div>
          </div>
        </div>

        {/* MEALS */}

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-2">

            <div>
              <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
                Meals Recorded
              </p>

              <p className="mt-1 text-xl font-bold text-slate-900 sm:mt-2 sm:text-2xl">
                {summary.mealsRecorded}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-emerald-50 p-1.5 text-emerald-700 sm:rounded-xl sm:p-2.5">
              <Utensils size={15} />
            </div>
          </div>
        </div>

        {/* TOTAL */}

        <div className="min-w-0 rounded-xl border border-blue-200 bg-blue-50 p-3 shadow-sm sm:rounded-2xl sm:p-5">
          <div className="flex min-w-0 items-center justify-between gap-2">

            <div className="min-w-0">
              <p className="text-[9px] font-semibold uppercase tracking-wide text-blue-700 sm:text-xs">
                Total Payable
              </p>

              <p className="mt-1 truncate text-xl font-bold text-blue-900 sm:mt-2 sm:text-2xl">
                {formatCurrency(summary.totalPayable)}
              </p>
            </div>

            <div className="shrink-0 rounded-lg bg-white p-1.5 text-blue-700 shadow-sm sm:rounded-xl sm:p-2.5">
              <IndianRupee size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          PAYMENT BREAKDOWN
      =================================================== */}

      <section className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">

        <div className="border-b border-slate-200 px-3 py-3 sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

            <div className="shrink-0 rounded-lg bg-slate-100 p-1.5 text-slate-700 sm:p-2">
              <ReceiptText size={16} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 sm:text-base">
                Monthly Payment Summary
              </h2>

              <p className="mt-0.5 truncate text-[9px] text-slate-500 sm:text-xs">
                Charges calculated from your current mess records.
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-slate-100">

          <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 sm:text-sm">
                Base Maintenance Fee
              </p>

              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                Monthly hostel mess maintenance
              </p>
            </div>

            <p className="shrink-0 text-xs font-bold text-slate-900 sm:text-sm">
              {formatCurrency(summary.baseFee)}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 sm:text-sm">
                Additional Diet Charges
              </p>

              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                Charges from recorded meals
              </p>
            </div>

            <p className="shrink-0 text-xs font-bold text-slate-900 sm:text-sm">
              {formatCurrency(
                summary.additionalDietCharges
              )}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4">
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-800 sm:text-sm">
                Extra Items
              </p>

              <p className="mt-0.5 hidden text-xs text-slate-500 sm:block">
                Additional items recorded
              </p>
            </div>

            <p className="shrink-0 text-xs font-bold text-slate-900 sm:text-sm">
              {formatCurrency(summary.extrasCost)}
            </p>
          </div>

          <div className="flex min-w-0 items-center justify-between gap-3 bg-blue-50 px-3 py-3.5 sm:px-6 sm:py-5">
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-900 sm:text-sm">
                Total Payable
              </p>

              <p className="mt-0.5 hidden text-xs text-blue-700 sm:block">
                Current monthly statement amount
              </p>
            </div>

            <p className="shrink-0 text-base font-bold text-blue-900 sm:text-xl">
              {formatCurrency(summary.totalPayable)}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          USAGE SUMMARY
      =================================================== */}

      <section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">

        <div className="mb-3 flex items-center gap-2.5 sm:mb-5 sm:gap-3">

          <div className="shrink-0 rounded-lg bg-emerald-50 p-1.5 text-emerald-700 sm:p-2">
            <Utensils size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Mess Usage
            </h2>

            <p className="text-[9px] text-slate-500 sm:text-xs">
              Activity recorded for {currentMonthName}.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:rounded-xl sm:p-4">
            <p className="text-[9px] font-semibold text-slate-500 sm:text-xs">
              Days Recorded
            </p>

            <p className="mt-0.5 text-base font-bold text-slate-900 sm:mt-1 sm:text-xl">
              {summary.daysRecorded}
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:rounded-xl sm:p-4">
            <p className="text-[9px] font-semibold text-slate-500 sm:text-xs">
              Meals Recorded
            </p>

            <p className="mt-0.5 text-base font-bold text-slate-900 sm:mt-1 sm:text-xl">
              {summary.mealsRecorded}
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:rounded-xl sm:p-4">
            <p className="text-[9px] font-semibold text-slate-500 sm:text-xs">
              Diet Cost
            </p>

            <p className="mt-0.5 truncate text-base font-bold text-slate-900 sm:mt-1 sm:text-xl">
              {formatCurrency(summary.dietCost)}
            </p>
          </div>

          <div className="min-w-0 rounded-lg border border-slate-200 bg-slate-50 p-2.5 sm:rounded-xl sm:p-4">
            <p className="text-[9px] font-semibold text-slate-500 sm:text-xs">
              Extra Items
            </p>

            <p className="mt-0.5 truncate text-base font-bold text-slate-900 sm:mt-1 sm:text-xl">
              {formatCurrency(summary.extrasCost)}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          STUDENT INFORMATION
      =================================================== */}

      <section className="w-full min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:rounded-2xl sm:p-6">

        <div className="mb-3 flex items-center gap-2.5 sm:mb-5 sm:gap-3">

          <div className="shrink-0 rounded-lg bg-blue-50 p-1.5 text-blue-700 sm:p-2">
            <FileText size={16} />
          </div>

          <div className="min-w-0">
            <h2 className="text-sm font-bold text-slate-900 sm:text-base">
              Student Information
            </h2>

            <p className="text-[9px] text-slate-500 sm:text-xs">
              Information used on your payment statement.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Name
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm">
              {user?.name || '—'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Student ID
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm">
              {user?.studentId || '—'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Roll Number
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm">
              {user?.rollNo || '—'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Hostel
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm">
              {user?.hostelNo ||
                user?.hostelId?.hostelNumber ||
                '—'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Department
            </p>

            <p
              title={user?.department || ''}
              className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm"
            >
              {user?.department || '—'}
            </p>
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-semibold uppercase tracking-wide text-slate-500 sm:text-xs">
              Session
            </p>

            <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-900 sm:mt-1 sm:text-sm">
              {user?.session || '—'}
            </p>
          </div>
        </div>
      </section>

      {/* ===================================================
          CASH / INFO NOTE
      =================================================== */}

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-[9px] leading-4 text-slate-600 sm:rounded-xl sm:px-4 sm:py-3 sm:text-xs sm:leading-5">
        Online payments are currently under development. For
        immediate cash payment, please visit the Accounts
        Department / authorized hostel mess office.
      </div>

      {/* ===================================================
          ONLINE PAYMENT MODAL
      =================================================== */}

      {showOnlinePayment && (
        <OnlinePaymentPrototype
          amount={summary.totalPayable}
          monthName={currentMonthName}
          onClose={() => setShowOnlinePayment(false)}
        />
      )}
    </div>
  );
}