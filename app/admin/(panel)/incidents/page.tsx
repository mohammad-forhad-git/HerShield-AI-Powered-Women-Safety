import type { Metadata } from "next";
import { prisma } from "@/lib/db";
import { incidentListInclude, toRow } from "@/lib/incidents";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/misc";
import { IncidentTable } from "@/components/incidents/incident-table";
import { STATUS_VALUES } from "@/lib/constants";

export const metadata: Metadata = { title: "All Emergency Reports" };

export default async function AllReportsPage({ searchParams }: { searchParams: { status?: string } }) {
  const incidents = await prisma.incident.findMany({ include: incidentListInclude, orderBy: { createdAt: "desc" } });
  const initialStatus = STATUS_VALUES.includes(searchParams.status as never) ? searchParams.status! : "";
  return (
    <>
      <PageHeader
        eyebrow="Incidents"
        title="All emergency reports"
        description="Search by incident ID and filter by category, priority and status. Open any report to view student details, location and update its status."
      />
      <Card>
        <IncidentTable rows={incidents.map(toRow)} basePath="/admin/incidents" showStudent initialStatus={initialStatus} pageSize={15} />
      </Card>
    </>
  );
}
