"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Bell,
  BellRing,
  ClipboardList,
  FilePlus2,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Map as MapIcon,
  MapPin,
  Menu,
  Settings,
  ShieldCheck,
  Siren,
  UserCog,
  Users,
  X,
  Zap,
  GraduationCap,
  type LucideIcon,
} from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { apiRequest } from "@/lib/api-client";
import { cn, initials } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  emphasis?: boolean;
  badgeKey?: "unread" | "open";
}

const STUDENT_NAV: NavItem[] = [
  { href: "/student", label: "Overview", icon: LayoutDashboard },
  { href: "/student/sos", label: "Emergency SOS", icon: Siren, emphasis: true },
  { href: "/student/report", label: "Report an Incident", icon: FilePlus2 },
  { href: "/student/reports", label: "My Reports", icon: ClipboardList },
  { href: "/student/contacts", label: "Trusted Contacts", icon: Users },
  { href: "/student/location", label: "Location Sharing", icon: MapPin },
  { href: "/student/notifications", label: "Notifications", icon: Bell, badgeKey: "unread" },
  { href: "/student/tips", label: "Safety Tips", icon: ShieldCheck },
  { href: "/student/profile", label: "Profile Settings", icon: UserCog },
];

const ADMIN_NAV: NavItem[] = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/incidents", label: "All Reports", icon: ClipboardList, badgeKey: "open" },
  { href: "/admin/manage", label: "Incident Management", icon: ListChecks },
  { href: "/admin/map", label: "Live Incident Map", icon: MapIcon },
  { href: "/admin/escalation", label: "Escalation Center", icon: Zap, emphasis: true },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/admin/notifications", label: "Notification History", icon: BellRing },
  { href: "/admin/students", label: "Students", icon: GraduationCap },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function DashboardShell({
  role,
  user,
  counts,
  children,
}: {
  role: "student" | "admin";
  user: { name: string; email: string; subtitle?: string | null };
  counts?: { unread?: number; open?: number };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);
  const nav = role === "student" ? STUDENT_NAV : ADMIN_NAV;
  const base = role === "student" ? "/student" : "/admin";

  React.useEffect(() => setMobileOpen(false), [pathname]);

  const isActive = (href: string) => (href === base ? pathname === base : pathname === href || pathname.startsWith(`${href}/`));

  async function logout() {
    setLoggingOut(true);
    await apiRequest("/api/auth/logout", "POST");
    router.push(role === "admin" ? "/admin/login" : "/login");
    router.refresh();
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-navy text-slate-300">
      <div className="flex h-16 items-center gap-2.5 px-5">
        <LogoMark />
        <div>
          <p className="text-[15px] font-bold leading-tight text-white">
            Her<span className="text-blue-400">Shield</span>
          </p>
          <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">
            {role === "student" ? "Student Portal" : "Security Console"}
          </p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4" aria-label="Dashboard navigation">
        {nav.map((item) => {
          const active = isActive(item.href);
          const badge = item.badgeKey ? counts?.[item.badgeKey] : undefined;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white",
                item.emphasis && !active && "text-red-300 hover:text-red-200",
              )}
            >
              {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-blue-400" />}
              <item.icon className={cn("h-[18px] w-[18px] shrink-0", item.emphasis && "text-red-400")} />
              <span className="flex-1 truncate">{item.label}</span>
              {badge ? (
                <span className="rounded-full bg-sos px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                  {badge > 99 ? "99+" : badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-royal text-sm font-semibold text-white">
            {initials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name}</p>
            <p className="truncate text-xs text-slate-400">{user.subtitle || user.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          disabled={loggingOut}
          className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-60"
        >
          <LogOut className="h-[18px] w-[18px]" /> {loggingOut ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-canvas">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">{sidebar}</aside>

      <AnimatePresence>
        {mobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-navy/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="absolute inset-y-0 left-0 w-72"
              initial={{ x: -288 }}
              animate={{ x: 0 }}
              exit={{ x: -288 }}
              transition={{ type: "spring", stiffness: 400, damping: 40 }}
            >
              {sidebar}
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute right-3 top-4 rounded-md p-1.5 text-slate-300 hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur sm:px-6">
          <button
            onClick={() => setMobileOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Academic prototype · all alerts are simulated
          </div>
          <div className="ml-auto flex items-center gap-2">
            {role === "student" ? (
              <>
                <Link
                  href="/student/notifications"
                  className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {counts?.unread ? <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-sos" /> : null}
                </Link>
                <Link
                  href="/student/sos"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-sos px-3 text-sm font-bold text-white shadow-sm hover:bg-sos-700"
                >
                  <Siren className="h-4 w-4" /> SOS
                </Link>
              </>
            ) : (
              <Link
                href="/admin/escalation"
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-navy px-3 text-sm font-semibold text-white hover:bg-navy-700"
              >
                <Zap className="h-4 w-4 text-amber-300" />
                {counts?.open ? `${counts.open} open` : "Escalations"}
              </Link>
            )}
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
