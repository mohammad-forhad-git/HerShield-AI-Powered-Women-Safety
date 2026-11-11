import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const variants = {
  primary: "bg-royal text-white hover:bg-royal-700 focus-visible:ring-royal/40 shadow-sm",
  navy: "bg-navy text-white hover:bg-navy-700 focus-visible:ring-navy/40 shadow-sm",
  danger: "bg-sos text-white hover:bg-sos-700 focus-visible:ring-sos/40 shadow-sm",
  success: "bg-success text-white hover:bg-green-700 focus-visible:ring-green-600/40 shadow-sm",
  secondary:
    "bg-white text-navy ring-1 ring-inset ring-slate-200 hover:bg-slate-50 focus-visible:ring-royal/40 shadow-sm",
  ghost: "text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-300",
  link: "text-royal underline-offset-4 hover:underline px-0",
} as const;

const sizes = {
  sm: "h-8 px-3 text-xs gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-11 px-5 text-sm gap-2 rounded-lg",
  xl: "h-14 px-8 text-base gap-2.5 rounded-xl",
  icon: "h-9 w-9 rounded-lg",
} as const;

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center font-semibold whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-4 disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, className, children, disabled, type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  ),
);
Button.displayName = "Button";
