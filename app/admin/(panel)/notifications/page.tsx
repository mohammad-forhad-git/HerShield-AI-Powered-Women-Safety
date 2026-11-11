import type { Metadata } from "next";
import { CheckCircle2, MessageSquare, RefreshCw, Send } from "lucide-react";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { PageHeader, SimulationBadge, StatCard } from "@/components/ui/misc";
import { NotificationHistory } from "@/components/admin/notification-history";

export const metadata: Metadata = { title: "Notification History" };

export default async function AdminNotificationsPage() {
  const items = await prisma.notification.findMany({
    include: { incident: { select: { code: true } }, user: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  const contactAlerts = items.filter((n) => n.type === "CONTACT_ALERT");
  return (
    <>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2">Audit log <SimulationBadge /></span>}
        title="Notification history"
        description="Every simulated alert to trusted contacts and every in-app update sent to students. No real SMS, email or calls are ever sent."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total notifications" value={items.length} icon={<Send className="h-5 w-5" />} tone="blue" />
        <StatCard label="Contact alerts (simulated)" value={contactAlerts.length} icon={<MessageSquare className="h-5 w-5" />} tone="red" />
        <StatCard label="Status updates" value={items.filter((n) => n.type === "STATUS_UPDATE").length} icon={<RefreshCw className="h-5 w-5" />} tone="violet" />
        <StatCard
          label="Delivery rate"
          value={`${contactAlerts.length ? Math.round((contactAlerts.filter((n) => n.status === "DELIVERED").length / contactAlerts.length) * 100) : 100}%`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="green"
        />
      </div>
      <Card>
        <NotificationHistory
          items={items.map((n) => ({
            id: n.id,
            type: n.type,
            channel: n.channel,
            title: n.title,
            message: n.message,
            recipientName: n.type === "CONTACT_ALERT" ? n.recipientName : n.user.name,
            recipientPhone: n.recipientPhone,
            status: n.status,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
            deliveredAt: n.deliveredAt?.toISOString() ?? null,
            incidentId: n.incidentId,
            incidentCode: n.incident?.code ?? null,
            studentName: n.user.name,
          }))}
        />
      </Card>
    </>
  );
}
