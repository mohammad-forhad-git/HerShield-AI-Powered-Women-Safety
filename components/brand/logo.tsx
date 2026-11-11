import Link from "next/link";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <defs>
        <linearGradient id="hs-g" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path d="M16 2 4 6.5v8.2C4 22.3 9.1 28.2 16 30c6.9-1.8 12-7.7 12-15.3V6.5L16 2Z" fill="url(#hs-g)" />
      <path
        d="M16 22.5s-6-3.6-6-8.1A3.4 3.4 0 0 1 16 12.3a3.4 3.4 0 0 1 6 2.1c0 4.5-6 8.1-6 8.1Z"
        fill="#fff"
      />
      <circle cx="24.5" cy="7.5" r="3.5" fill="#DC2626" stroke="#fff" strokeWidth="1.5" />
    </svg>
  );
}

export function Logo({ href = "/", light = false, className }: { href?: string; light?: boolean; className?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5", className)} aria-label="HerShield home">
      <LogoMark />
      <span className={cn("text-lg font-bold tracking-tight", light ? "text-white" : "text-navy")}>
        Her<span className="text-royal">Shield</span>
      </span>
    </Link>
  );
}
