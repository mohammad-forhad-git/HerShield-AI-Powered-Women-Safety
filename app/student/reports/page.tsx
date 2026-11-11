import type { Metadata } from "next";
import Link from "next/link";
import { FilePlus2 } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/misc";
import { buttonClasses } from "@/components/ui/button";
import { IncidentTable } from "@/components/incidents/incident-table";
import { incidentListInclude, toRow } from "@/lib/incidents";

export const metadata: Metadata = { title: "My Emergency Reports" };

export default async function MyReportsPage() {
  const user = await requireRole("STUDENT");
  const incidents = await prisma.incident.findMany({
    where: { reporterId: user.id },
    include: incidentListInclude,
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <PageHeader
        eyebrow="History"
        title="My emergency reports"
        description="Search and filter every incident you have reported and track its response progress."
        actions={
          <Link href="/student/report" className={buttonClasses("primary")}>
            <FilePlus2 className="h-4 w-4" /> New report
          </Link>
        }
      />
      <Card>
        <IncidentTable
          rows={incidents.map(toRow)}
          basePath="/student/reports"
          emptyAction={<Link href="/student/report" className={buttonClasses("secondary")}>Report an incident</Link>}
        />
      </Card>
    </>
  );
}
