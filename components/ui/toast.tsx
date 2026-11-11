"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "info";
interface ToastItem {
  id: number;
  title: string;
  description?: string;
  variant: Variant;
}

const ToastContext = React.createContext<{
  toast: (t: { title: string; description?: string; variant?: Variant }) => void;
}>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const remove = React.useCallback((id: number) => setItems((s) => s.filter((t) => t.id !== id)), []);
  const toast = React.useCallback(
    ({ title, description, variant = "success" }: { title: string; description?: string; variant?: Variant }) => {
      const id = Date.now() + Math.random();
      setItems((s) => [...s.slice(-3), { id, title, description, variant }]);
      setTimeout(() => remove(id), 4500);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[1100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2"
      >
        <AnimatePresence>
          {items.map((t) => {
            const Icon = t.variant === "success" ? CheckCircle2 : t.variant === "error" ? AlertTriangle : Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                className="pointer-events-auto flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-lift"
              >
                <Icon
                  className={cn(
                    "mt-0.5 h-5 w-5 shrink-0",
                    t.variant === "success" && "text-success",
                    t.variant === "error" && "text-sos",
                    t.variant === "info" && "text-royal",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-navy">{t.title}</p>
                  {t.description && <p className="mt-0.5 text-sm text-slate-600">{t.description}</p>}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  className="rounded p-0.5 text-slate-400 hover:text-slate-600"
                  aria-label="Dismiss"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
