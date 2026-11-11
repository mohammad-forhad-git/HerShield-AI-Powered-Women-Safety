import type { Metadata } from "next";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/misc";
import { StudentNotifications } from "@/components/notifications/notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const user = await requireRole("STUDENT");
  const items = await prisma.notification.findMany({
    where: { userId: user.id },
    include: { incident: { select: { code: true } } },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <PageHeader
        eyebrow="Inbox"
        title="Notifications"
        description="Status updates from campus security and the history of simulated alerts sent to your trusted contacts."
      />
      <Card>
        <StudentNotifications
          items={items.map((n) => ({
            id: n.id,
            type: n.type,
            channel: n.channel,
            title: n.title,
            message: n.message,
            recipientName: n.recipientName,
            recipientPhone: n.recipientPhone,
            status: n.status,
            isRead: n.isRead,
            createdAt: n.createdAt.toISOString(),
            deliveredAt: n.deliveredAt?.toISOString() ?? null,
            incidentId: n.incidentId,
            incidentCode: n.incident?.code ?? null,
          }))}
        />
      </Card>
    </>
  );
}
