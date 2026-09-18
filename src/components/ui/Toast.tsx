import React, { useEffect, useState, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertTriangle, Info, Wrench } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'feature';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  showFeatureToast: (featureName?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newToast: Toast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration ?? (toast.type === 'feature' ? 4000 : 3000);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, [removeToast]);

  const showFeatureToast = useCallback((featureName?: string) => {
    addToast({
      type: 'feature',
      title: 'Feature Being Updated',
      message: featureName
        ? `${featureName} is currently being enhanced. Check back soon.`
        : 'This feature is currently being enhanced. Check back soon.',
      duration: 4000,
    });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showFeatureToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, removeToast }: { toasts: Toast[]; removeToast: (id: string) => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onClose }: { key?: string; toast: Toast; onClose: () => void }) {
  const icons: Record<ToastType, React.ReactNode> = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertTriangle className="w-5 h-5 text-red-400" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />,
    feature: <Wrench className="w-5 h-5 text-[#D4AF37]" />,
  };

  const borderColors: Record<ToastType, string> = {
    success: 'border-emerald-500/30',
    error: 'border-red-500/30',
    warning: 'border-amber-500/30',
    info: 'border-blue-500/30',
    feature: 'border-[#D4AF37]/30',
  };

  const bgGradients: Record<ToastType, string> = {
    success: 'from-emerald-950/90 to-[#0A0A0A]/95',
    error: 'from-red-950/90 to-[#0A0A0A]/95',
    warning: 'from-amber-950/90 to-[#0A0A0A]/95',
    info: 'from-blue-950/90 to-[#0A0A0A]/95',
    feature: 'from-[#1a1a10]/90 to-[#0A0A0A]/95',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`
        pointer-events-auto min-w-[320px] max-w-[420px]
        bg-gradient-to-br ${bgGradients[toast.type]}
        backdrop-blur-xl border ${borderColors[toast.type]}
        rounded-lg shadow-2xl shadow-black/50
        overflow-hidden
      `}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white/90">{toast.title}</p>
          {toast.message && (
            <p className="mt-1 text-xs text-white/60 leading-relaxed">{toast.message}</p>
          )}
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-white/40 hover:text-white/70" />
        </button>
      </div>
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: (toast.duration ?? 3000) / 1000, ease: 'linear' }}
        className={`h-0.5 origin-left ${
          toast.type === 'feature' ? 'bg-[#D4AF37]/60' :
          toast.type === 'success' ? 'bg-emerald-400/60' :
          toast.type === 'error' ? 'bg-red-400/60' :
          toast.type === 'warning' ? 'bg-amber-400/60' :
          'bg-blue-400/60'
        }`}
      />
    </motion.div>
  );
}
