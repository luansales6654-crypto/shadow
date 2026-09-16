import React from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAuth();

  if (toasts.length === 0) return null;

  return (
    <div id="toast-container" className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            id={`toast-${toast.id}`}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-[#0B0B0B]/95 border-purple-500/40 text-gray-100 shadow-[0_0_25px_rgba(124,58,237,0.25)]'
                : isError
                ? 'bg-[#0B0B0B]/95 border-red-500/40 text-gray-100 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
                : isWarning
                ? 'bg-[#0B0B0B]/95 border-amber-500/40 text-gray-100 shadow-[0_0_25px_rgba(245,158,11,0.2)]'
                : 'bg-[#0B0B0B]/95 border-gray-700 text-gray-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-purple-400" />}
              {isError && <XCircle className="w-5 h-5 text-red-400" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-400" />}
            </div>
            <div className="flex-1 min-w-0">
              {toast.title && <p className="text-xs font-bold uppercase tracking-wider text-purple-300 mb-0.5">{toast.title}</p>}
              <p className="text-sm font-medium text-gray-200 leading-snug">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="shrink-0 text-gray-400 hover:text-white transition p-0.5 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
