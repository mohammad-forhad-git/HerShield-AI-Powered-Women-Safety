import Link from "next/link";
import { Activity, AlertOctagon, CheckCircle2, ClipboardList, Clock, Map as MapIcon, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import { getIncidentStats } from "@/lib/stats";
import { getMapIncidents } from "@/lib/admin-data";
import { incidentListInclude, toRow } from "@/lib/incidents";
import { OPEN_STATUSES, PRIORITIES, type Priority } from "@/lib/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { IncidentTable } from "@/components/incidents/incident-table";
import { CategoryIcon, PriorityBadge, SosTag, StatusBadge } from "@/components/incidents/badges";
import { AnalyticsGrid } from "@/components/charts/analytics-charts";
import { MapView } from "@/components/map/map-view";
import { timeAgo } from "@/lib/utils";

export default async function AdminOverview() {
  const [stats, recent, openIncidents, mapIncidents] = await Promise.all([
    getIncidentStats(),
    prisma.incident.findMany({ include: incidentListInclude, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.incident.findMany({
      where: { status: { in: OPEN_STATUSES } },
      include: { category: { select: { slug: true, name: true } } },
    }),
    getMapIncidents(),
  ]);

  const queue = openIncidents
    .sort(
      (a, b) =>
        (PRIORITIES[b.priority as Priority]?.rank ?? 0) - (PRIORITIES[a.priority as Priority]?.rank ?? 0) ||
        b.aiScore - a.aiScore,
    )
    .slice(0, 4);
  const openMarkers = mapIncidents.filter((i) => OPEN_STATUSES.includes(i.status as never));

  return (
    <>
      <PageHeader
        eyebrow="Security console"
        title="Campus safety overview"
        description="Live picture of all reported incidents. Every figure is calculated from database records."
        actions={
          <>
            <Link href="/admin/map" className={buttonClasses("secondary")}><MapIcon className="h-4 w-4" /> Live map</Link>
            <Link href="/admin/escalation" className={buttonClasses("danger")}><Zap className="h-4 w-4" /> Escalation center</Link>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total incidents" value={stats.total} icon={<ClipboardList className="h-5 w-5" />} tone="blue" hint={`${stats.resolutionRate}% resolution rate`} />
        <StatCard label="Pending" value={stats.pending} icon={<Clock className="h-5 w-5" />} tone="amber" hint="Submitted or under review" />
        <StatCard label="Active emergencies" value={stats.active} icon={<Activity className="h-5 w-5" />} tone="violet" hint="Dispatched or in progress" />
        <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" hint={stats.avgResolutionHours !== null ? `Avg ${stats.avgResolutionHours} h to resolve` : undefined} />
        <StatCard label="High priority (open)" value={stats.highPriority} icon={<AlertOctagon className="h-5 w-5" />} tone="red" hint="Critical + High awaiting closure" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Escalation queue"
            description="Highest-priority open incidents"
            icon={<Zap className="h-5 w-5" />}
            action={<Link href="/admin/escalation" className="text-sm font-semibold text-royal">Open center</Link>}
          />
          <CardBody className="space-y-3">
            {queue.length === 0 && <p className="text-sm text-slate-500">No open incidents – all clear.</p>}
            {queue.map((i) => (
              <Link key={i.id} href={`/admin/incidents/${i.id}`} className="block rounded-xl border border-slate-200 p-3 transition hover:border-slate-300 hover:shadow-sm">
                <div className="flex items-center gap-3">
                  <CategoryIcon slug={i.category.slug} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-royal">{i.code}</span>
                      {i.isSos && <SosTag />}
                      <span className="text-xs text-slate-400">{timeAgo(i.createdAt)}</span>
                    </div>
                    <p className="truncate text-sm font-semibold text-navy">{i.title}</p>
                  </div>
                  <PriorityBadge priority={i.priority} />
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                  <strong className="text-navy">{i.responseCategory}:</strong> {i.recommendedAction}
                </p>
                <div className="mt-2"><StatusBadge status={i.status} short /></div>
              </Link>
            ))}
          </CardBody>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader
            title="Emergency monitoring map"
            description={`${openMarkers.length} open incident${openMarkers.length === 1 ? "" : "s"} with shared location (simulated)`}
            icon={<MapIcon className="h-5 w-5" />}
            action={<Link href="/admin/map" className="text-sm font-semibold text-royal">Full map</Link>}
          />
          <CardBody>
            <MapView
              height={400}
              fitToMarkers
              markers={openMarkers.map((i) => ({
                id: i.id,
                lat: i.lat,
                lng: i.lng,
                color: PRIORITIES[i.priority as Priority]?.color ?? "#64748B",
                title: `${i.code} · ${i.categoryName}`,
                subtitle: i.title,
                href: `/admin/incidents/${i.id}`,
              }))}
            />
          </CardBody>
        </Card>
      </div>

      <div className="mt-6">
        <AnalyticsGrid stats={stats} compact />
      </div>

      <Card className="mt-6">
        <CardHeader
          title="Recent incidents"
          description="Latest 8 reports"
          action={<Link href="/admin/incidents" className="text-sm font-semibold text-royal">View all reports</Link>}
        />
        <IncidentTable rows={recent.map(toRow)} basePath="/admin/incidents" showStudent pageSize={8} />
      </Card>
    </>
  );
}
