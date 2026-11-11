import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, ClipboardList, FilePlus2, Lightbulb, MapPin, Siren, Users } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { EmptyState, PageHeader, StatCard } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { SosLauncher } from "@/components/incidents/sos";
import { CategoryIcon, PriorityBadge, StatusBadge } from "@/components/incidents/badges";
import { OPEN_STATUSES } from "@/lib/constants";
import { SAFETY_SECTIONS } from "@/lib/content";
import { timeAgo } from "@/lib/utils";

export default async function StudentOverview() {
  const user = await requireRole("STUDENT");
  const [incidents, contactsCount, notifications] = await Promise.all([
    prisma.incident.findMany({
      where: { reporterId: user.id },
      include: { category: { select: { slug: true, name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.emergencyContact.count({ where: { userId: user.id } }),
    prisma.notification.findMany({
      where: { userId: user.id, type: { not: "CONTACT_ALERT" } },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);
  const open = incidents.filter((i) => OPEN_STATUSES.includes(i.status as never)).length;
  const resolved = incidents.filter((i) => i.status === "RESOLVED").length;
  const allTips = SAFETY_SECTIONS.flatMap((s) => s.tips);
  const tip = allTips[new Date().getDate() % allTips.length];
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Student dashboard"
        title={`Hello, ${firstName}`}
        description="Stay safe. Your emergency tools, reports and contacts are all here."
        actions={
          <Link href="/student/report" className={buttonClasses("primary")}>
            <FilePlus2 className="h-4 w-4" /> Report an incident
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="overflow-hidden lg:col-span-2">
          <div className="grid items-center gap-6 bg-gradient-to-br from-white to-red-50/70 p-6 sm:grid-cols-[1fr_auto] sm:p-8">
            <div>
              <p className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-sos">
                <Siren className="h-3.5 w-3.5" /> Emergency SOS
              </p>
              <h2 className="mt-3 text-2xl font-bold text-navy">In danger or need urgent help?</h2>
              <p className="mt-2 text-sm text-slate-600">
                Press SOS to alert campus security and your {contactsCount} trusted contact{contactsCount === 1 ? "" : "s"}.
                You&apos;ll confirm before anything is sent. (Simulation – no real alerts.)
              </p>
              {contactsCount === 0 && (
                <Link href="/student/contacts" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-royal">
                  Add trusted contacts first <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
            <div className="flex justify-center py-4">
              <SosLauncher />
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Safety tip of the day" icon={<Lightbulb className="h-5 w-5" />} />
          <CardBody>
            <p className="text-sm leading-relaxed text-slate-700">{tip}</p>
            <Link href="/student/tips" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-royal">
              More safety tips <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </CardBody>
        </Card>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My reports" value={incidents.length} icon={<ClipboardList className="h-5 w-5" />} tone="blue" />
        <StatCard label="Open incidents" value={open} icon={<Siren className="h-5 w-5" />} tone="red" />
        <StatCard label="Resolved" value={resolved} icon={<CheckCircle2 className="h-5 w-5" />} tone="green" />
        <StatCard label="Trusted contacts" value={contactsCount} icon={<Users className="h-5 w-5" />} tone="violet" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent reports"
            description="Track the latest status of your incidents"
            action={<Link href="/student/reports" className="text-sm font-semibold text-royal">View all</Link>}
          />
          {incidents.length === 0 ? (
            <EmptyState
              icon={<ClipboardList className="h-5 w-5" />}
              title="No reports yet"
              description="When you report an incident or trigger SOS it will appear here."
              action={<Link href="/student/report" className={buttonClasses("secondary")}>Report an incident</Link>}
            />
          ) : (
            <ul className="divide-y divide-slate-100">
              {incidents.slice(0, 5).map((i) => (
                <li key={i.id}>
                  <Link href={`/student/reports/${i.id}`} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50">
                    <CategoryIcon slug={i.category.slug} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-navy">{i.title}</p>
                      <p className="text-xs text-slate-500">
                        <span className="font-mono text-royal">{i.code}</span> · {timeAgo(i.createdAt)}
                      </p>
                    </div>
                    <div className="hidden flex-col items-end gap-1 sm:flex">
                      <StatusBadge status={i.status} short />
                      <PriorityBadge priority={i.priority} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader
            title="Latest updates"
            icon={<Bell className="h-5 w-5" />}
            action={<Link href="/student/notifications" className="text-sm font-semibold text-royal">All</Link>}
          />
          <CardBody className="space-y-4">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div key={n.id} className="flex gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.isRead ? "bg-slate-300" : "bg-royal"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-navy">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-slate-500">{n.message}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
            <Link href="/student/location" className={buttonClasses("secondary", "md", "w-full")}>
              <MapPin className="h-4 w-4" /> Share location with security
            </Link>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
