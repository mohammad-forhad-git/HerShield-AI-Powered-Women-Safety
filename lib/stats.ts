import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "./db";
import {
  ACTIVE_STATUSES,
  CATEGORIES,
  PENDING_STATUSES,
  PRIORITIES,
  PRIORITY_VALUES,
  STATUS_VALUES,
  STATUSES,
  type IncidentStatus,
  type Priority,
} from "./constants";
import { dayKey } from "./utils";

/** All statistics are computed from real database records. */
export async function getIncidentStats(where: Prisma.IncidentWhereInput = {}) {
  const incidents = await prisma.incident.findMany({
    where,
    select: {
      status: true,
      priority: true,
      createdAt: true,
      resolvedAt: true,
      category: { select: { slug: true } },
    },
  });

  const count = (fn: (i: (typeof incidents)[number]) => boolean) => incidents.filter(fn).length;
  const isPending = (s: string) => PENDING_STATUSES.includes(s as IncidentStatus);
  const isActive = (s: string) => ACTIVE_STATUSES.includes(s as IncidentStatus);
  const isOpen = (s: string) => isPending(s) || isActive(s);

  const total = incidents.length;
  const pending = count((i) => isPending(i.status));
  const active = count((i) => isActive(i.status));
  const resolved = count((i) => i.status === "RESOLVED");
  const rejected = count((i) => i.status === "REJECTED");
  const highPriority = count((i) => (i.priority === "CRITICAL" || i.priority === "HIGH") && isOpen(i.status));
  const critical = count((i) => i.priority === "CRITICAL");

  const byCategory = CATEGORIES.map((c) => ({
    slug: c.slug,
    name: c.name,
    color: c.color,
    count: count((i) => i.category.slug === c.slug),
  }));

  const byPriority = PRIORITY_VALUES.map((p: Priority) => ({
    priority: p,
    name: PRIORITIES[p].label,
    color: PRIORITIES[p].color,
    count: count((i) => i.priority === p),
  }));

  const byStatus = STATUS_VALUES.map((s) => ({
    status: s,
    name: STATUSES[s].short,
    count: count((i) => i.status === s),
  }));

  // Daily – last 14 days
  const now = new Date();
  const daily: { date: string; label: string; count: number }[] = [];
  for (let d = 13; d >= 0; d--) {
    const day = new Date(now.getTime() - d * 86400000);
    const key = dayKey(day);
    daily.push({
      date: key,
      label: new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Dhaka", day: "2-digit", month: "short" }).format(day),
      count: incidents.filter((i) => dayKey(i.createdAt) === key).length,
    });
  }

  // Monthly – last 6 months
  const monthly: { month: string; total: number; resolved: number; critical: number }[] = [];
  for (let m = 5; m >= 0; m--) {
    const ref = new Date(now.getFullYear(), now.getMonth() - m, 15);
    const key = dayKey(ref).slice(0, 7);
    const inMonth = incidents.filter((i) => dayKey(i.createdAt).slice(0, 7) === key);
    monthly.push({
      month: new Intl.DateTimeFormat("en-GB", { month: "short", year: "2-digit" }).format(ref),
      total: inMonth.length,
      resolved: inMonth.filter((i) => i.status === "RESOLVED").length,
      critical: inMonth.filter((i) => i.priority === "CRITICAL").length,
    });
  }

  const resolvedVsPending = [
    { name: "Resolved", value: resolved, color: "#16A34A" },
    { name: "Pending", value: pending, color: "#F59E0B" },
    { name: "Active", value: active, color: "#2563EB" },
    { name: "Rejected", value: rejected, color: "#94A3B8" },
  ];

  const resolvedWithTime = incidents.filter((i) => i.resolvedAt);
  const avgResolutionHours = resolvedWithTime.length
    ? Math.round(
        (resolvedWithTime.reduce((s, i) => s + (i.resolvedAt!.getTime() - i.createdAt.getTime()), 0) /
          resolvedWithTime.length /
          3600000) *
          10,
      ) / 10
    : null;

  return {
    total,
    pending,
    active,
    resolved,
    rejected,
    highPriority,
    critical,
    resolutionRate: total ? Math.round((resolved / total) * 100) : 0,
    avgResolutionHours,
    byCategory,
    byPriority,
    byStatus,
    daily,
    monthly,
    resolvedVsPending,
  };
}

export type IncidentStats = Awaited<ReturnType<typeof getIncidentStats>>;
