import React, { useEffect, useRef, useCallback } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  Loader2, 
  CreditCard,
  Lock
} from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  loading = false, 
  confirmText,
  cancelText = "Cancel",
  variant // 'danger' | 'warning' | 'success' | 'info'
}) {
  const modalRef = useRef(null);

  // Auto-detect aesthetic variant from action intent if not explicitly passed
  const resolvedVariant = variant || (() => {
    const text = `${title || ''} ${message || ''}`.toLowerCase();
    if (text.includes('cash') || text.includes('settle') || text.includes('accept')) return 'success';
    if (text.includes('revoke') || text.includes('reset') || text.includes('override')) return 'warning';
    return 'danger'; // Default fallback for administrative purges & destructive actions
  })();

  // Visual theming schemes
  const themes = {
    danger: {
      borderTop: 'border-t-red-600',
      badgeBg: 'bg-red-50 text-red-800 border-red-200',
      icon: <Trash2 className="w-4 h-4 text-red-600 shrink-0" />,
      confirmBtn: 'bg-red-700 hover:bg-red-800 text-white border-red-900 focus:ring-red-500',
      tag: 'Critical Override Required'
    },
    warning: {
      borderTop: 'border-t-amber-500',
      badgeBg: 'bg-amber-50 text-amber-900 border-amber-200',
      icon: <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />,
      confirmBtn: 'bg-amber-700 hover:bg-amber-800 text-white border-amber-900 focus:ring-amber-500',
      tag: 'Ledger Modification Notice'
    },
    success: {
      borderTop: 'border-t-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />,
      confirmBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-900 focus:ring-emerald-500',
      tag: 'Financial Clearance Authorization'
    }
  };

  const currentTheme = themes[resolvedVariant] || themes.danger;
  const resolvedConfirmText = confirmText || (resolvedVariant === 'success' ? 'Authorize & Settle' : 'Execute & Commit');

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation: Escape to dismiss, Enter to commit
  const handleKeyDown = useCallback((e) => {
    if (!isOpen || loading) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [isOpen, loading, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (!loading && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white w-full max-w-md shadow-2xl border border-gray-300 border-t-4 ${currentTheme.borderTop} rounded-sm overflow-hidden animate-in zoom-in-95 duration-150 relative`}
      >
        {/* Subtle Institutional Watermark Header */}
        <div className="bg-gray-100/90 border-b border-gray-200 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-white border border-gray-300 rounded-xs shadow-xs">
              {currentTheme.icon}
            </span>
            <div>
              <h3 id="confirm-modal-title" className="text-xs font-black text-gray-900 uppercase tracking-wider">
                {title || "Confirmation Required"}
              </h3>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tight flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Committee Verification Protocol
              </p>
            </div>
          </div>

          {!loading && (
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close dialog"
              className="w-6 h-6 flex items-center justify-center bg-gray-200 hover:bg-gray-300 text-gray-700 transition cursor-pointer rounded-xs border border-gray-300 active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 bg-white">
          {/* Status Tag Badge */}
          <div className="mb-3">
            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-xs border ${currentTheme.badgeBg}`}>
              {currentTheme.tag}
            </span>
          </div>

          <div className="text-xs font-semibold text-gray-800 leading-relaxed uppercase bg-gray-50/70 border border-gray-200 p-3.5 rounded-xs mb-5">
            {message || "Are you sure you want to execute this administrative operation in the ledger?"}
          </div>

          {/* Institutional Compliance Notice */}
          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-tight mb-5">
            * Records altered through this prompt are logged permanently in the cooperative ledger audit trail.
          </p>

          {/* Action Button Strip */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-700 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer border border-gray-300 rounded-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              disabled={loading}
              className={`px-5 py-2 font-black text-[10px] uppercase tracking-widest transition cursor-pointer border rounded-xs shadow-xs flex items-center gap-1.5 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.confirmBtn}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{resolvedConfirmText}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}