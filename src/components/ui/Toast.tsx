import { AlertCircle, CheckCircle2, Info } from 'lucide-react-native';
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
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

type ToastVariant = 'success' | 'error' | 'info';
type Toast = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  show: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

/** 3s, não bloqueante — docs/05, seção 4. */
const DURATION_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nextId = useRef(0);

  const show = useCallback((message: string, variant: ToastVariant = 'info') => {
    if (timer.current) clearTimeout(timer.current);
    nextId.current += 1;
    setToast({ id: nextId.current, message, variant });
    timer.current = setTimeout(() => setToast(null), DURATION_MS);
  }, []);

  useEffect(() => () => (timer.current ? clearTimeout(timer.current) : undefined), []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastView toast={toast} /> : null}
    </ToastContext.Provider>
  );
}

function ToastView({ toast }: { toast: Toast }) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const tint = {
    success: colors.success,
    error: colors.danger,
    info: colors.primary,
  }[toast.variant];

  const Icon = { success: CheckCircle2, error: AlertCircle, info: Info }[toast.variant];

  return (
    <View
      pointerEvents="none"
      style={{ top: insets.top + 8 }}
      className="absolute left-4 right-4 z-50"
    >
      <View
        accessibilityRole="alert"
        accessibilityLiveRegion="polite"
        style={{ borderLeftColor: tint }}
        className="flex-row items-center gap-3 rounded-md border border-l-4 border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900"
      >
        <Icon size={20} color={tint} />
        <Text className="flex-1 text-[15px] text-neutral-900 dark:text-neutral-50">
          {toast.message}
        </Text>
      </View>
    </View>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
