import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { registerToast, unregisterToast } from '../utils/appFeedback';

type ToastType = 'success' | 'error' | 'warn';

interface ToastContextValue {
  showToast: (msg: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{
    msg: string;
    type: ToastType;
    visible: boolean;
  } | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = useCallback((msg: string, type: ToastType = 'success') => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ msg, type, visible: true });
    timerRef.current = setTimeout(() => {
      setToast((t) => (t ? { ...t, visible: false } : null));
    }, 3200);
  }, []);

  useEffect(() => {
    registerToast(showToast);
    return () => unregisterToast(showToast);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  const bg =
    toast?.type === 'error'
      ? 'var(--rb)'
      : toast?.type === 'warn'
        ? 'var(--ab)'
        : '#1a1a2e';
  const color =
    toast?.type === 'error'
      ? 'var(--rt)'
      : toast?.type === 'warn'
        ? 'var(--at)'
        : '#fff';

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast?.visible && (
        <div
          id="app-toast"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '11px 20px',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            zIndex: 9999,
            boxShadow: '0 4px 16px rgba(0,0,0,.18)',
            maxWidth: 420,
            textAlign: 'center',
            background: bg,
            color,
          }}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
