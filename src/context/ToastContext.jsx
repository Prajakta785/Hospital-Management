import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 9);
    const newToast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg, dur) => showToast(msg, 'success', dur),
    error: (msg, dur) => showToast(msg, 'error', dur),
    warning: (msg, dur) => showToast(msg, 'warning', dur),
    info: (msg, dur) => showToast(msg, 'info', dur)
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0 no-print print:hidden">
        {toasts.map(t => {
          let bg = 'bg-slate-900 text-white border-slate-700';
          let IconComponent = Info;
          let iconColor = 'text-blue-400';

          if (t.type === 'success') {
            bg = 'bg-[#071933] text-sky-50 border-sky-800 shadow-sky-950/20';
            IconComponent = CheckCircle2;
            iconColor = 'text-sky-400';
          } else if (t.type === 'error') {
            bg = 'bg-rose-950 text-rose-50 border-rose-800 shadow-rose-950/20';
            IconComponent = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (t.type === 'warning') {
            bg = 'bg-amber-950 text-amber-50 border-amber-800 shadow-amber-950/20';
            IconComponent = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5 ${bg}`}
            >
              <IconComponent className={`w-5 h-5 shrink-0 mt-0.5 ${iconColor}`} />
              <p className="text-sm font-medium leading-relaxed flex-1">{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-slate-400 hover:text-white transition-colors shrink-0 p-1"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
