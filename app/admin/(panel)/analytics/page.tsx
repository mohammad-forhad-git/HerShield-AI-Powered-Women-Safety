import type { Metadata } from "next";
import { Activity, AlertOctagon, CheckCircle2, ClipboardList, Clock, Timer, XCircle } from "lucide-react";
import { prisma } from "@/lib/db";
import { getIncidentStats } from "@/lib/stats";
import { incidentListInclude, toRow } from "@/lib/incidents";
import { Card, CardHeader } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/misc";
import { AnalyticsGrid } from "@/components/charts/analytics-charts";
import { IncidentTable } from "@/components/incidents/incident-table";
import { CategoryIcon } from "@/components/incidents/badges";

export const metadata: Metadata = { title: "Incident Analytics" };

export default async function AnalyticsPage() {
  const [stats, incidents] = await Promise.all([
    getIncidentStats(),
    prisma.incident.findMany({ include: incidentListInclude, orderBy: { createdAt: "desc" } }),
  ]);
  const categoryRows = [...stats.byCategory].sort((a, b) => b.count - a.count);

  return (
    <>
      <PageHeader
        eyebrow="Incident history & statistics"
        title="Incident analytics"
        description="Trends and distributions computed live from every incident record in the database."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        <StatCard label="Total" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} tone="blue" />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} tone="amber" />
        <StatCard label="Active" value={stats.active} icon={<Activity className="h-5 w-5" />} tone="violet" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label="Rejected" value={stats.rejected} icon={<XCircle className="h-5 w-5" />} tone="slate" />
        <StatCard label="Critical" value={stats.critical} icon={<AlertOctagon className="h-5 w-5" />} tone="red" />
        <StatCard label="Avg resolution" value={stats.avgResolutionHours !== null ? `${stats.avgResolutionHours}h` : "—"} icon={<Timer className="h-5 w-5" />} tone="slate" />
      </div>

      <div className="mt-6">
        <AnalyticsGrid stats={stats} />
      </div>

      <Card className="mt-6">
        <CardHeader title="Category breakdown" description="Share of all incidents per category" />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Incidents</th>
                <th className="px-5 py-3">Share</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {categoryRows.map((c) => {
                const pct = stats.total ? Math.round((c.count / stats.total) * 100) : 0;
                return (
                  <tr key={c.slug}>
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2"><CategoryIcon slug={c.slug} size="sm" /> {c.name}</span>
                    </td>
                    <td className="px-5 py-3 font-semibold tabular-nums text-navy">{c.count}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-40 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: c.color }} />
                        </div>
                        <span className="text-xs tabular-nums text-slate-500">{pct}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Historical incident records" description="Complete, searchable incident history" />
        <IncidentTable rows={incidents.map(toRow)} basePath="/admin/incidents" showStudent pageSize={10} />
      </Card>
    </>
  );
}
