import type { Metadata } from "next";
import { Lock } from "lucide-react";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Alert, PageHeader } from "@/components/ui/misc";
import { LocationShare } from "@/components/student/location-share";
import { OPEN_STATUSES } from "@/lib/constants";

export const metadata: Metadata = { title: "Location Sharing" };

export default async function LocationPage({ searchParams }: { searchParams: { incident?: string } }) {
  const user = await requireRole("STUDENT");
  const incidents = await prisma.incident.findMany({
    where: { reporterId: user.id, status: { in: OPEN_STATUSES } },
    include: { location: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <PageHeader
        eyebrow="Advanced feature"
        title="Location sharing"
        description="Share your coordinates with campus security for an open incident. Your browser location is only used after you explicitly allow it."
      />
      <div className="space-y-6">
        <Alert tone="info" icon={<Lock className="h-5 w-5" />} title="Your location stays private">
          Coordinates are stored with the incident and visible only to you and authorised security staff – never on
          public pages. For demonstrations use a mock location or click the map.
        </Alert>
        <LocationShare
          defaultIncidentId={incidents.some((i) => i.id === searchParams.incident) ? searchParams.incident : undefined}
          incidents={incidents.map((i) => ({
            id: i.id,
            code: i.code,
            title: i.title,
            status: i.status,
            priority: i.priority,
            location: i.location
              ? {
                  latitude: i.location.latitude,
                  longitude: i.location.longitude,
                  label: i.location.label,
                  source: i.location.source,
                  sharedAt: i.location.sharedAt.toISOString(),
                }
              : null,
          }))}
        />
      </div>
    </>
  );
}
