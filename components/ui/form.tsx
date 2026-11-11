"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const fieldBase =
  "block w-full rounded-lg border bg-white px-3 text-sm text-navy placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-4 disabled:bg-slate-50 disabled:text-slate-500";
const fieldState = (error?: string) =>
  error
    ? "border-red-400 focus:border-red-500 focus:ring-red-500/15"
    : "border-slate-300 focus:border-royal focus:ring-royal/15";

export function Label({
  htmlFor,
  children,
  required,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("mb-1.5 block text-sm font-medium text-slate-700", className)}>
      {children}
      {required && <span className="ml-0.5 text-sos" aria-hidden>*</span>}
    </label>
  );
}

export function FieldError({ id, message }: { id?: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs font-medium text-red-600">
      {message}
    </p>
  );
}

export function FieldHint({ children }: { children: React.ReactNode }) {
  return <p className="mt-1.5 text-xs text-slate-500">{children}</p>;
}

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { error?: string; icon?: React.ReactNode };
export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, error, icon, id, ...props }, ref) => (
  <div className="relative">
    {icon && (
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">{icon}</span>
    )}
    <input
      ref={ref}
      id={id}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={error && id ? `${id}-error` : undefined}
      className={cn(fieldBase, fieldState(error), "h-10", icon && "pl-9", className)}
      {...props}
    />
  </div>
));
Input.displayName = "Input";

type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string };
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, error, id, ...props }, ref) => (
  <textarea
    ref={ref}
    id={id}
    aria-invalid={Boolean(error) || undefined}
    aria-describedby={error && id ? `${id}-error` : undefined}
    className={cn(fieldBase, fieldState(error), "min-h-[96px] py-2.5", className)}
    {...props}
  />
));
Textarea.displayName = "Textarea";

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string };
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(({ className, error, id, children, ...props }, ref) => (
  <select
    ref={ref}
    id={id}
    aria-invalid={Boolean(error) || undefined}
    className={cn(fieldBase, fieldState(error), "h-10 pr-8", className)}
    {...props}
  >
    {children}
  </select>
));
Select.displayName = "Select";

export function Field({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  hint?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor} required={required}>
        {label}
      </Label>
      {children}
      {error ? <FieldError id={`${htmlFor}-error`} message={error} /> : hint ? <FieldHint>{hint}</FieldHint> : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  description,
  id,
  tone = "royal",
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  id: string;
  tone?: "royal" | "sos";
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start gap-3">
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative mt-0.5 inline-flex h-6 w-11 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-royal/20",
          checked ? (tone === "sos" ? "bg-sos" : "bg-royal") : "bg-slate-300",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
      <span>
        <span className="block text-sm font-medium text-navy">{label}</span>
        {description && <span className="block text-xs text-slate-500">{description}</span>}
      </span>
    </label>
  );
}
