import React, { useEffect, useRef, useCallback } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  ShieldAlert, 
  X, 
  Loader2, 
  CreditCard,
  Lock,
  Landmark
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

  // Visual institutional theming schemes
  const themes = {
    danger: {
      borderTop: 'border-t-red-800',
      badgeBg: 'bg-red-50 text-red-950 border-red-300',
      icon: <Trash2 className="w-4 h-4 text-red-800 shrink-0" />,
      confirmBtn: 'bg-red-800 hover:bg-red-900 text-white border-red-950 shadow-xs',
      tag: 'Critical Override Required'
    },
    warning: {
      borderTop: 'border-t-amber-600',
      badgeBg: 'bg-amber-50 text-amber-950 border-amber-300',
      icon: <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />,
      confirmBtn: 'bg-amber-700 hover:bg-amber-800 text-white border-amber-900 shadow-xs',
      tag: 'Ledger Modification Notice'
    },
    success: {
      borderTop: 'border-t-emerald-700',
      badgeBg: 'bg-emerald-50 text-emerald-950 border-emerald-300',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />,
      confirmBtn: 'bg-emerald-800 hover:bg-emerald-700 text-white border-emerald-950 shadow-xs',
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

  // Keyboard navigation: Escape to dismiss
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
      className="fixed inset-0 z-[250] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 font-sans select-none animate-in fade-in duration-200"
      onClick={(e) => {
        if (!loading && e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white w-full max-w-md shadow-2xl border-2 border-slate-300 border-t-4 ${currentTheme.borderTop} rounded-xs overflow-hidden relative`}
      >
        {/* Institutional Header */}
        <div className="bg-slate-50 border-b border-slate-300 px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-blue-950 text-amber-400 border border-blue-900 rounded-xs shadow-xs flex items-center justify-center">
              {currentTheme.icon}
            </span>
            <div>
              <h3 id="confirm-modal-title" className="text-xs font-black text-blue-950 uppercase tracking-widest font-serif">
                {title || "Confirmation Required"}
              </h3>
              <p className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-tight flex items-center gap-1 mt-0.5">
                <Lock className="w-2.5 h-2.5 text-amber-600" /> Committee Verification Protocol
              </p>
            </div>
          </div>

          {!loading && (
            <button 
              type="button"
              onClick={onClose} 
              aria-label="Close dialog"
              className="w-7 h-7 flex items-center justify-center bg-slate-200 hover:bg-slate-300 text-slate-800 transition cursor-pointer rounded-xs border border-slate-300 active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 bg-white space-y-4">
          {/* Status Tag Badge */}
          <div>
            <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase px-2.5 py-0.5 rounded-xs border font-mono ${currentTheme.badgeBg}`}>
              {currentTheme.tag}
            </span>
          </div>

          <div className="text-xs font-bold text-slate-800 leading-relaxed uppercase bg-slate-50 border border-slate-300 p-4 rounded-xs font-mono shadow-xs">
            {message || "Are you sure you want to execute this administrative operation in the ledger?"}
          </div>

          {/* Institutional Compliance Notice */}
          <p className="text-[9px] text-slate-500 font-mono font-bold uppercase tracking-tight">
            * Records altered through this prompt are logged permanently in the cooperative ledger audit trail under Statute 2.4.
          </p>

          {/* Action Button Strip */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-[10px] uppercase tracking-wider transition cursor-pointer border border-slate-300 rounded-xs disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              disabled={loading}
              className={`px-5 py-2.5 font-black text-[10px] uppercase tracking-widest transition cursor-pointer border-b-2 rounded-xs shadow-xs flex items-center gap-1.5 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${currentTheme.confirmBtn}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-300" />
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