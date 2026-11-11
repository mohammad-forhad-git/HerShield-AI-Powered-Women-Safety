import type { Metadata } from "next";
import { GraduationCap, ShieldOff, Siren, Users } from "lucide-react";
import { prisma } from "@/lib/db";
import { OPEN_STATUSES } from "@/lib/constants";
import { Card } from "@/components/ui/card";
import { PageHeader, StatCard } from "@/components/ui/misc";
import { StudentsTable } from "@/components/admin/students-table";

export const metadata: Metadata = { title: "Student Management" };

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      studentProfile: true,
      _count: { select: { contacts: true, incidents: true } },
      incidents: { select: { id: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  const rows = students.map((s) => ({
    id: s.id,
    name: s.name,
    email: s.email,
    phone: s.phone,
    studentId: s.studentProfile?.studentId ?? "—",
    department: s.studentProfile?.department ?? null,
    isActive: s.isActive,
    contacts: s._count.contacts,
    incidents: s._count.incidents,
    openIncidents: s.incidents.filter((i) => OPEN_STATUSES.includes(i.status as never)).length,
    lastIncidentId: s.incidents[0]?.id ?? null,
    createdAt: s.createdAt.toISOString(),
    lastLoginAt: s.lastLoginAt?.toISOString() ?? null,
  }));

  return (
    <>
      <PageHeader eyebrow="People" title="Student management" description="Registered students, their safety network and reporting activity. Deactivated accounts cannot sign in." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered students" value={rows.length} icon={<GraduationCap className="h-5 w-5" />} tone="blue" />
        <StatCard label="With open incidents" value={rows.filter((r) => r.openIncidents > 0).length} icon={<Siren className="h-5 w-5" />} tone="red" />
        <StatCard label="Without trusted contacts" value={rows.filter((r) => r.contacts === 0).length} icon={<Users className="h-5 w-5" />} tone="amber" />
        <StatCard label="Deactivated" value={rows.filter((r) => !r.isActive).length} icon={<ShieldOff className="h-5 w-5" />} tone="slate" />
      </div>
      <Card>
        <StudentsTable rows={rows} />
      </Card>
    </>
  );
}
