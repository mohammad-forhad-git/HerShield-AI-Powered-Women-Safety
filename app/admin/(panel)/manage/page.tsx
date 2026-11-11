import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { PRIORITIES, STATUS_VALUES, STATUSES, type Priority } from "@/lib/constants";
import { PageHeader } from "@/components/ui/misc";
import { CategoryIcon, PriorityBadge, SosTag } from "@/components/incidents/badges";
import { QuickStatusSelect } from "@/components/admin/incident-actions";
import { cn, timeAgo } from "@/lib/utils";

export const metadata: Metadata = { title: "Incident Management" };

export default async function ManagePage({ searchParams }: { searchParams: { closed?: string } }) {
  const showClosed = searchParams.closed === "1";
  const since = new Date(Date.now() - 30 * 86400000);
  const incidents = await prisma.incident.findMany({
    where: showClosed ? {} : { OR: [{ status: { notIn: ["RESOLVED", "REJECTED"] } }, { updatedAt: { gte: since } }] },
    include: {
      category: { select: { slug: true, name: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const columns = STATUS_VALUES.map((s) => ({
    status: s,
    items: incidents
      .filter((i) => i.status === s)
      .sort((a, b) => (PRIORITIES[b.priority as Priority]?.rank ?? 0) - (PRIORITIES[a.priority as Priority]?.rank ?? 0)),
  }));

  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title="Incident management"
        description="Manage the response workflow. Change a card's status to move it between stages – the student is notified automatically."
        actions={
          <Link
            href={showClosed ? "/admin/manage" : "/admin/manage?closed=1"}
            className="text-sm font-semibold text-royal hover:underline"
          >
            {showClosed ? "Hide older closed incidents" : "Show all closed incidents"}
          </Link>
        }
      />
      <div className="-mx-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        <div className="grid min-w-[1260px] grid-cols-6 gap-4">
          {columns.map((col) => (
            <section key={col.status} className="flex flex-col rounded-2xl bg-slate-100/70 p-3" aria-label={STATUSES[col.status].label}>
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-semibold text-navy">
                  <span className={cn("h-2 w-2 rounded-full", STATUSES[col.status].dot)} />
                  {STATUSES[col.status].short}
                </h2>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-slate-600">{col.items.length}</span>
              </header>
              <div className="flex-1 space-y-2.5">
                {col.items.length === 0 && (
                  <p className="rounded-xl border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">No incidents</p>
                )}
                {col.items.map((i) => (
                  <article key={i.id} className="rounded-xl bg-white p-3 shadow-card ring-1 ring-slate-200/70">
                    <div className="flex items-start gap-2">
                      <CategoryIcon slug={i.category.slug} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Link href={`/admin/incidents/${i.id}`} className="font-mono text-xs font-semibold text-royal hover:underline">
                            {i.code}
                          </Link>
                          {i.isSos && <SosTag />}
                        </div>
                        <Link href={`/admin/incidents/${i.id}`} className="mt-0.5 line-clamp-2 block text-sm font-medium text-navy hover:text-royal">
                          {i.title}
                        </Link>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <PriorityBadge priority={i.priority} />
                      <span className="truncate text-[11px] text-slate-400">{timeAgo(i.createdAt)}</span>
                    </div>
                    <p className="mt-1.5 truncate text-xs text-slate-500">{i.reporter.name}</p>
                    <div className="mt-2">
                      <QuickStatusSelect incidentId={i.id} status={i.status} />
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
