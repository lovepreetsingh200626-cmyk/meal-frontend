import React, { useEffect, useRef, useCallback } from 'react';
import {
  AlertTriangle,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  Lock,
  Info
} from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title,
  message,
  onConfirm,
  onClose,
  loading = false,
  confirmText,
  cancelText = 'Cancel',
  variant
}) {
  const modalRef = useRef(null);

  // Automatically determine the visual variant when one isn't provided.
  const resolvedVariant =
    variant ||
    (() => {
      const text = `${title || ''} ${message || ''}`.toLowerCase();

      if (
        text.includes('success') ||
        text.includes('settle') ||
        text.includes('accept') ||
        text.includes('approve') ||
        text.includes('confirm payment')
      ) {
        return 'success';
      }

      if (
        text.includes('reset') ||
        text.includes('override') ||
        text.includes('change') ||
        text.includes('update')
      ) {
        return 'warning';
      }

      if (
        text.includes('delete') ||
        text.includes('remove') ||
        text.includes('reject') ||
        text.includes('cancel')
      ) {
        return 'danger';
      }

      return 'info';
    })();

  const themes = {
    danger: {
      icon: <Trash2 className="w-5 h-5" />,
      iconWrapper: 'bg-red-50 text-red-600 border-red-100',
      topBorder: 'border-t-red-500',
      badge: 'bg-red-50 text-red-700 border-red-200',
      badgeText: 'Destructive Action',
      confirm:
        'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white'
    },

    warning: {
      icon: <AlertTriangle className="w-5 h-5" />,
      iconWrapper: 'bg-amber-50 text-amber-600 border-amber-100',
      topBorder: 'border-t-amber-500',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
      badgeText: 'Action Requires Attention',
      confirm:
        'bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white'
    },

    success: {
      icon: <CheckCircle2 className="w-5 h-5" />,
      iconWrapper: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      topBorder: 'border-t-emerald-500',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      badgeText: 'Confirmation Required',
      confirm:
        'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white'
    },

    info: {
      icon: <Info className="w-5 h-5" />,
      iconWrapper: 'bg-blue-50 text-blue-600 border-blue-100',
      topBorder: 'border-t-blue-600',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
      badgeText: 'Confirmation Required',
      confirm:
        'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white'
    }
  };

  const currentTheme =
    themes[resolvedVariant] || themes.info;

  const resolvedConfirmText =
    confirmText ||
    (resolvedVariant === 'danger'
      ? 'Delete'
      : resolvedVariant === 'success'
        ? 'Confirm'
        : 'Continue');

  // Prevent background scrolling while the modal is open.
  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = '';
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  // Escape key closes the modal.
  const handleKeyDown = useCallback(
    (event) => {
      if (!isOpen || loading) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    },
    [isOpen, loading, onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  // Focus the modal when opened.
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        modalRef.current?.focus();
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="
        fixed inset-0 z-[250]
        flex items-center justify-center
        bg-slate-950/60
        backdrop-blur-sm
        p-4
        font-sans
      "
      onMouseDown={(event) => {
        if (
          !loading &&
          event.target === event.currentTarget
        ) {
          onClose();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-message"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={`
          w-full max-w-md
          bg-white
          rounded-2xl
          border border-slate-200
          border-t-4
          ${currentTheme.topBorder}
          shadow-2xl
          overflow-hidden
          outline-none
        `}
      >

        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-slate-200 bg-slate-50">

          <div className="flex items-start justify-between gap-4">

            <div className="flex items-center gap-3">

              <div
                className={`
                  w-10 h-10
                  rounded-xl
                  border
                  flex items-center justify-center
                  shrink-0
                  ${currentTheme.iconWrapper}
                `}
              >
                {currentTheme.icon}
              </div>

              <div>
                <h2
                  id="confirm-modal-title"
                  className="text-sm sm:text-base font-bold text-slate-900"
                >
                  {title || 'Confirmation Required'}
                </h2>

                <div className="flex items-center gap-1.5 mt-1">
                  <Lock className="w-3 h-3 text-slate-400" />

                  <p className="text-[10px] text-slate-500">
                    Secure administrative action
                  </p>
                </div>
              </div>

            </div>

            {!loading && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="
                  w-8 h-8
                  rounded-lg
                  flex items-center justify-center
                  border border-slate-200
                  bg-white
                  text-slate-500
                  hover:bg-slate-100
                  hover:text-slate-800
                  transition
                  shrink-0
                "
              >
                <X className="w-4 h-4" />
              </button>
            )}

          </div>

        </div>

        {/* Body */}
        <div className="p-5 sm:p-6">

          {/* Status badge */}
          <div className="mb-4">
            <span
              className={`
                inline-flex
                items-center
                px-2.5 py-1
                rounded-lg
                border
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                ${currentTheme.badge}
              `}
            >
              {currentTheme.badgeText}
            </span>
          </div>

          {/* Message */}
          <div
            id="confirm-modal-message"
            className="
              rounded-xl
              border border-slate-200
              bg-slate-50
              px-4 py-4
              text-sm
              text-slate-700
              leading-relaxed
            "
          >
            {message ||
              'Are you sure you want to continue with this action?'}
          </div>

          {/* Information */}
          <div className="mt-4 flex items-start gap-2.5">

            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Please review this action before continuing.
              Administrative changes may affect records visible
              to students and other authorized staff.
            </p>

          </div>

          {/* Actions */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="
                w-full sm:w-auto
                px-4 py-2.5
                rounded-xl
                border border-slate-300
                bg-white
                text-slate-700
                text-xs
                font-bold
                hover:bg-slate-50
                active:bg-slate-100
                transition
                disabled:opacity-50
                disabled:cursor-not-allowed
              "
            >
              {cancelText}
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className={`
                w-full sm:w-auto
                px-5 py-2.5
                rounded-xl
                text-xs
                font-bold
                shadow-sm
                transition
                flex
                items-center
                justify-center
                gap-2
                disabled:opacity-60
                disabled:cursor-not-allowed
                ${currentTheme.confirm}
              `}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <span>{resolvedConfirmText}</span>
              )}
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50">

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-500">
            <Lock className="w-3 h-3" />
            <span>
              Authorized portal action
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}