import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("STUDENT");
  const unread = await prisma.notification.count({
    where: { userId: user.id, isRead: false, type: { not: "CONTACT_ALERT" } },
  });
  return (
    <DashboardShell
      role="student"
      user={{ name: user.name, email: user.email, subtitle: user.studentProfile?.studentId }}
      counts={{ unread }}
    >
      {children}
    </DashboardShell>
  );
}
