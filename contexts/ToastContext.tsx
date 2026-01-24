import React, { createContext, useState, useContext, useCallback, ReactNode } from 'react';
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  isExiting?: boolean;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const ToastIcon: React.FC<{ type: ToastType }> = ({ type }) => {
  const iconClass = "w-5 h-5";
  switch (type) {
    case 'success':
      return <CheckCircle2 className={`${iconClass} text-green-500`} />;
    case 'error':
      return <XCircle className={`${iconClass} text-red-500`} />;
    case 'warning':
      return <AlertCircle className={`${iconClass} text-amber-500`} />;
    case 'info':
    default:
      return <Info className={`${iconClass} text-blue-500`} />;
  }
};

const ToastItem: React.FC<{ toast: Toast; onClose: (id: string) => void }> = ({ toast, onClose }) => {
  const bgColors = {
    success: 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800',
    error: 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950 dark:border-amber-800',
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800',
  };

  return (
    <div
      className={`
        flex items-center gap-3 px-4 py-3 rounded-sm border shadow-lg
        ${bgColors[toast.type]}
        ${toast.isExiting ? 'toast-exit' : 'toast-enter'}
      `}
    >
      <ToastIcon type={toast.type} />
      <span className="flex-1 text-sm font-medium text-stone-800 dark:text-stone-200">
        {toast.message}
      </span>
      <button
        onClick={() => onClose(toast.id)}
        className="p-1 hover:bg-stone-200 dark:hover:bg-stone-700 rounded transition-colors focus-ring"
        aria-label="Toast schließen"
      >
        <X className="w-4 h-4 text-stone-500" />
      </button>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(t =>
      t.id === id ? { ...t, isExiting: true } : t
    ));
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 300);
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        aria-label="Benachrichtigungen"
      >
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} onClose={removeToast} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
