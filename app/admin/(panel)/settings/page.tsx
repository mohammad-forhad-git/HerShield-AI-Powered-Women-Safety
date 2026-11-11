import type { Metadata } from "next";
import { Brain, Cpu, Database, KeyRound, ShieldCheck, UserCog } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { aiEnabled } from "@/lib/ai";
import { CATEGORIES, PRIORITIES, PRIORITY_VALUES } from "@/lib/constants";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/misc";
import { PasswordForm, ProfileForm } from "@/components/profile/profile-forms";
import { CategoryIcon, PriorityBadge } from "@/components/incidents/badges";

export const metadata: Metadata = { title: "Admin Settings" };

export default async function AdminSettingsPage() {
  const user = await requireRole("ADMIN");
  const [admins, users, incidents, notifications] = await Promise.all([
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true, name: true, email: true, designation: true, lastLoginAt: true } }),
    prisma.user.count(),
    prisma.incident.count(),
    prisma.notification.count(),
  ]);
  const ai = aiEnabled();

  return (
    <>
      <PageHeader eyebrow="Configuration" title="Admin settings" description="Your security account, team members and system configuration." />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card>
            <CardHeader title="My profile" icon={<UserCog className="h-5 w-5" />} />
            <CardBody>
              <ProfileForm role="ADMIN" initial={{ name: user.name, email: user.email, phone: user.phone ?? "", designation: user.designation ?? "" }} />
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Change password" icon={<KeyRound className="h-5 w-5" />} />
            <CardBody><PasswordForm /></CardBody>
          </Card>
          <Card>
            <CardHeader title="Classification rules" description="How the engine maps categories to response teams" icon={<Brain className="h-5 w-5" />} />
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr><th className="px-5 py-3">Category</th><th className="px-5 py-3">Base priority</th><th className="px-5 py-3">Response team</th></tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CATEGORIES.map((c) => (
                    <tr key={c.slug}>
                      <td className="px-5 py-3"><span className="inline-flex items-center gap-2"><CategoryIcon slug={c.slug} size="sm" />{c.name}</span></td>
                      <td className="px-5 py-3"><PriorityBadge priority={c.basePriority} /></td>
                      <td className="px-5 py-3 text-slate-600">{c.responseTeam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <CardBody className="border-t border-slate-100 text-xs text-slate-500">
              Score thresholds: Critical ≥ 75 · High ≥ 55 · Medium ≥ 30 · Low &lt; 30, plus explicit escalation rules (e.g. Medical + severe injury ⇒ Critical; Physical threat + active danger ⇒ Critical; Harassment without immediate threat ⇒ Medium; Suspicious activity without direct threat ⇒ Low).
            </CardBody>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="System status" icon={<Cpu className="h-5 w-5" />} />
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Mode</span><span className="font-semibold text-amber-700">Simulation (prototype)</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Real alerts sent</span><span className="font-semibold text-navy">Never</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Classifier</span><span className="font-semibold text-navy">Rule-based engine v1</span></div>
              <div className="flex justify-between"><span className="text-slate-500">External AI advisory</span><span className={ai ? "font-semibold text-success" : "font-semibold text-slate-500"}>{ai ? "Enabled" : "Disabled (no API key)"}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Session lifetime</span><span className="font-semibold text-navy">8 hours</span></div>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Database" icon={<Database className="h-5 w-5" />} />
            <CardBody className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Users</span><span className="font-semibold tabular-nums">{users}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Incidents</span><span className="font-semibold tabular-nums">{incidents}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Notifications</span><span className="font-semibold tabular-nums">{notifications}</span></div>
              <p className="pt-2 text-xs text-slate-500">Reset demo data with <code className="rounded bg-slate-100 px-1">npm run db:reset</code>.</p>
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Security team" icon={<ShieldCheck className="h-5 w-5" />} />
            <CardBody className="space-y-3">
              {admins.map((a) => (
                <div key={a.id} className="text-sm">
                  <p className="font-semibold text-navy">{a.name}{a.id === user.id && <span className="ml-1 text-xs font-normal text-slate-400">(you)</span>}</p>
                  <p className="text-xs text-slate-500">{a.designation ?? "Security staff"} · {a.email}</p>
                </div>
              ))}
            </CardBody>
          </Card>
          <Card>
            <CardHeader title="Response targets" />
            <CardBody className="space-y-2">
              {PRIORITY_VALUES.map((p) => (
                <div key={p} className="flex items-center justify-between text-sm">
                  <PriorityBadge priority={p} />
                  <span className="text-slate-600">{PRIORITIES[p].target}</span>
                </div>
              ))}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
