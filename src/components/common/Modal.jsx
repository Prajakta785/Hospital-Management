import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-2xl', subtitle }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };

    const handleBeforePrint = () => {
      document.body.classList.add('is-printing');
      document.body.style.overflow = 'visible';
    };

    const handleAfterPrint = () => {
      document.body.classList.remove('is-printing');
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('beforeprint', handleBeforePrint);
      window.addEventListener('afterprint', handleAfterPrint);
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
      document.body.classList.remove('is-printing');
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="hospital-modal-portal fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="flex min-h-full items-center justify-center p-2.5 sm:p-4 md:p-6 text-center">
        <div
          className={`hospital-modal-box relative z-10 w-full ${maxWidth} max-h-[calc(100dvh-1.5rem)] sm:max-h-[calc(100dvh-2.5rem)] md:max-h-[calc(100dvh-3rem)] flex flex-col my-auto transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-2xl transition-all border border-slate-100 animate-in zoom-in-95 duration-200`}
        >
          {/* Header */}
          <div className="modal-header shrink-0 flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-6 sm:py-3.5 bg-slate-50/70">
            <div className="min-w-0 pr-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display truncate">{title}</h3>
              {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 line-clamp-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0 cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="modal-body flex-1 min-h-0 overflow-y-auto p-3.5 sm:p-6 dropdown-scroll overscroll-contain">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
