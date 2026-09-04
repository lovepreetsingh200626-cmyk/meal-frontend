import React, { useEffect } from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';

export default function ConfirmModal({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onClose, 
  loading = false, 
  confirmText = "OK / Confirm",
  cancelText = "Cancel"
}) {
  // Handle keyboard shortcuts (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isOpen && e.key === 'Escape' && !loading) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-blue-950/80 backdrop-blur-sm p-4 font-sans">
      <div className="bg-white w-full max-w-md shadow-2xl relative border-t-4 border-red-700 rounded-sm overflow-hidden animate-in fade-in zoom-in duration-150">
        
        {/* Modal Header */}
        <div className="bg-gray-100 border-b border-gray-300 px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="w-4 h-4" />
            <h3 className="text-xs font-black uppercase tracking-widest">{title || "Confirmation Required"}</h3>
          </div>
          {!loading && (
            <button 
              type="button"
              onClick={onClose} 
              className="w-6 h-6 flex items-center justify-center bg-gray-300 hover:bg-gray-400 text-gray-800 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <p className="text-xs font-bold text-gray-800 uppercase leading-relaxed mb-6">
            {message || "Are you sure you want to execute this administrative operation?"}
          </p>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 pt-4">
            <button 
              type="button" 
              onClick={onClose} 
              disabled={loading}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-[11px] uppercase tracking-wider transition cursor-pointer border border-gray-400 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              disabled={loading}
              className="px-5 py-2 bg-red-800 hover:bg-red-900 text-white font-black text-[11px] uppercase tracking-widest transition cursor-pointer border border-red-950 shadow-sm flex items-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{loading ? 'Processing...' : confirmText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}