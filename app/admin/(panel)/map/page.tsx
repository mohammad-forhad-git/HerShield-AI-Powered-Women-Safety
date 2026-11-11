import type { Metadata } from "next";
import { getMapIncidents } from "@/lib/admin-data";
import { PageHeader, SimulationBadge } from "@/components/ui/misc";
import { IncidentMapPanel } from "@/components/admin/incident-map-panel";

export const metadata: Metadata = { title: "Live Incident Map" };

export default async function MapPage() {
  const incidents = await getMapIncidents();
  return (
    <>
      <PageHeader
        eyebrow={<span className="inline-flex items-center gap-2">Monitoring <SimulationBadge /></span>}
        title="Live incident map"
        description="Incident markers coloured by priority. Coordinates are fictional demo points or locations students chose to share."
      />
      <IncidentMapPanel incidents={incidents} />
    </>
  );
}
