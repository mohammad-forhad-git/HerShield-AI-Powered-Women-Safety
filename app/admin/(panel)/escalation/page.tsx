import type { Metadata } from "next";
import Link from "next/link";
import { Clock, FlaskConical, ListChecks, Target, Users, Zap } from "lucide-react";
import { prisma } from "@/lib/db";
import { OPEN_STATUSES, PRIORITIES, PRIORITY_VALUES, type Priority } from "@/lib/constants";
import { playbookSteps } from "@/lib/classifier";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader } from "@/components/ui/misc";
import { CategoryIcon, PriorityBadge, SosTag, StatusBadge } from "@/components/incidents/badges";
import { EscalationActions } from "@/components/admin/incident-actions";
import { ScenarioSimulator } from "@/components/admin/scenario-simulator";
import { timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Emergency Escalation Center" };

export default async function EscalationPage() {
  const incidents = await prisma.incident.findMany({
    where: { status: { in: OPEN_STATUSES } },
    include: {
      category: true,
      reporter: { select: { name: true, phone: true } },
      location: { select: { label: true } },
    },
  });
  incidents.sort(
    (a, b) =>
      (PRIORITIES[b.priority as Priority]?.rank ?? 0) - (PRIORITIES[a.priority as Priority]?.rank ?? 0) ||
      b.aiScore - a.aiScore ||
      a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const counts = PRIORITY_VALUES.map((p) => ({ p, n: incidents.filter((i) => i.priority === p).length }));

  return (
    <>
      <PageHeader
        eyebrow="Bonus · Emergency escalation workflow"
        title="Escalation center"
        description="The engine identifies the response category for every open incident and recommends the next action. Apply a recommendation to dispatch a (simulated) response."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {counts.map(({ p, n }) => (
          <div key={p} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-card ring-1 ring-slate-200/80">
            <div>
              <p className="text-xs font-medium text-slate-500">{PRIORITIES[p].label}</p>
              <p className="text-2xl font-bold text-navy">{n}</p>
            </div>
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: PRIORITIES[p].color }} />
          </div>
        ))}
      </div>

      {incidents.length === 0 ? (
        <Card>
          <EmptyState icon={<Zap className="h-5 w-5" />} title="No open incidents" description="New incidents appear here automatically with their escalation recommendation." />
        </Card>
      ) : (
        <div className="space-y-4">
          {incidents.map((i) => {
            const p = PRIORITIES[i.priority as Priority] ?? PRIORITIES.LOW;
            return (
              <Card key={i.id} className="overflow-hidden">
                <div className="flex">
                  <div className="w-1.5 shrink-0" style={{ backgroundColor: p.color }} />
                  <div className="grid flex-1 gap-5 p-5 lg:grid-cols-[1.1fr_1fr]">
                    <div>
                      <div className="flex items-start gap-3">
                        <CategoryIcon slug={i.category.slug} size="lg" />
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/admin/incidents/${i.id}`} className="font-mono text-sm font-bold text-royal hover:underline">{i.code}</Link>
                            {i.isSos && <SosTag />}
                            <PriorityBadge priority={i.priority} />
                            <StatusBadge status={i.status} short />
                          </div>
                          <p className="mt-1 font-semibold text-navy">{i.title}</p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {i.reporter.name} · {i.location?.label ?? i.locationText} · {timeAgo(i.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Target className="h-3 w-3" /> Response</p>
                          <p className="mt-1 text-sm font-semibold text-navy">{i.responseCategory}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Users className="h-3 w-3" /> Team</p>
                          <p className="mt-1 text-sm font-semibold text-navy">{i.category.responseTeam}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500"><Clock className="h-3 w-3" /> Target</p>
                          <p className="mt-1 text-sm font-semibold text-navy">{p.target}</p>
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm text-slate-700">
                        <p className="text-xs font-semibold uppercase tracking-wide text-royal">{i.escalationLevel}</p>
                        <p className="mt-1">{i.recommendedAction}</p>
                      </div>
                    </div>
                    <div className="flex flex-col justify-between gap-4">
                      <div>
                        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-navy"><ListChecks className="h-4 w-4 text-royal" /> Recommended next steps</p>
                        <ol className="space-y-1.5">
                          {playbookSteps(i.category.slug).map((s, idx) => (
                            <li key={s} className="flex gap-2 text-sm text-slate-600">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-bold text-navy">{idx + 1}</span>
                              {s}
                            </li>
                          ))}
                        </ol>
                      </div>
                      <EscalationActions incidentId={i.id} status={i.status} responseCategory={i.responseCategory} />
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-8">
        <CardHeader
          title="Escalation scenario tester"
          description="Run the assignment scenarios (or your own) through the engine without creating an incident."
          icon={<FlaskConical className="h-5 w-5" />}
        />
        <CardBody>
          <ScenarioSimulator />
        </CardBody>
      </Card>
    </>
  );
}
