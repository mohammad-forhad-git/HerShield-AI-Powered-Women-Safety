import {
  AlertOctagon,
  CarFront,
  Eye,
  Flame,
  HeartPulse,
  HelpCircle,
  ShieldAlert,
  Siren,
  UserX,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { getCategory, priorityInfo, statusInfo } from "@/lib/constants";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  medical: HeartPulse,
  harassment: UserX,
  "physical-threat": ShieldAlert,
  accident: CarFront,
  theft: Wallet,
  "suspicious-activity": Eye,
  fire: Flame,
  other: HelpCircle,
};

export function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? HelpCircle;
}

export function CategoryIcon({ slug, size = "md", className }: { slug: string; size?: "sm" | "md" | "lg"; className?: string }) {
  const Icon = categoryIcon(slug);
  const color = getCategory(slug).color;
  const box = size === "sm" ? "h-7 w-7 rounded-md" : size === "lg" ? "h-12 w-12 rounded-xl" : "h-9 w-9 rounded-lg";
  const icon = size === "sm" ? "h-3.5 w-3.5" : size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]";
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center", box, className)}
      style={{ backgroundColor: `${color}1A`, color }}
      aria-hidden
    >
      <Icon className={icon} />
    </span>
  );
}

export function CategoryLabel({ slug, name }: { slug: string; name: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <CategoryIcon slug={slug} size="sm" />
      <span className="truncate text-sm text-slate-700">{name}</span>
    </span>
  );
}

export function StatusBadge({ status, short, className }: { status: string; short?: boolean; className?: string }) {
  const s = statusInfo(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        s.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} />
      {short ? s.short : s.label}
    </span>
  );
}

export function PriorityBadge({ priority, className }: { priority: string; className?: string }) {
  const p = priorityInfo(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        p.badge,
        className,
      )}
    >
      {priority === "CRITICAL" && <AlertOctagon className="h-3 w-3" />}
      {p.label}
    </span>
  );
}

export function SosTag() {
  return (
    <span className="inline-flex items-center gap-1 rounded-md bg-sos px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
      <Siren className="h-3 w-3" /> SOS
    </span>
  );
}
