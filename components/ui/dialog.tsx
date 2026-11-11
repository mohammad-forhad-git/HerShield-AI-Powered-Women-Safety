"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onClose,
  title,
  description,
  icon,
  children,
  footer,
  size = "md",
  tone = "default",
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "danger";
}) {
  const titleId = React.useId();

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center p-4 sm:items-center">
          <motion.div
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative w-full overflow-hidden rounded-2xl bg-white shadow-lift",
              size === "sm" && "max-w-sm",
              size === "md" && "max-w-lg",
              size === "lg" && "max-w-2xl",
              tone === "danger" && "ring-2 ring-sos/30",
            )}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              aria-label="Close dialog"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="px-6 pb-2 pt-6">
              {icon && (
                <div
                  className={cn(
                    "mb-4 flex h-12 w-12 items-center justify-center rounded-full",
                    tone === "danger" ? "bg-sos-50 text-sos" : "bg-royal-50 text-royal",
                  )}
                >
                  {icon}
                </div>
              )}
              <h2 id={titleId} className="text-lg font-semibold text-navy">
                {title}
              </h2>
              {description && <div className="mt-1.5 text-sm text-slate-600">{description}</div>}
            </div>
            {children && <div className="px-6 py-3">{children}</div>}
            {footer && (
              <div className="mt-2 flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-6 py-4 sm:flex-row sm:justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
