import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { OPEN_STATUSES } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("ADMIN");
  const open = await prisma.incident.count({ where: { status: { in: OPEN_STATUSES } } });
  return (
    <DashboardShell role="admin" user={{ name: user.name, email: user.email, subtitle: user.designation }} counts={{ open }}>
      {children}
    </DashboardShell>
  );
}
