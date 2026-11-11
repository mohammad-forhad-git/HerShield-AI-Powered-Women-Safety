import "server-only";
import { prisma } from "./db";
import type { MapIncident } from "@/components/admin/incident-map-panel";

/** Incidents that have shared coordinates, shaped for the monitoring map. */
export async function getMapIncidents(): Promise<MapIncident[]> {
  const incidents = await prisma.incident.findMany({
    where: { location: { isNot: null } },
    include: {
      location: true,
      category: { select: { slug: true, name: true } },
      reporter: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return incidents
    .filter((i) => i.location)
    .map((i) => ({
      id: i.id,
      code: i.code,
      title: i.title,
      categorySlug: i.category.slug,
      categoryName: i.category.name,
      priority: i.priority,
      status: i.status,
      isSos: i.isSos,
      lat: i.location!.latitude,
      lng: i.location!.longitude,
      label: i.location!.label,
      source: i.location!.source,
      locationText: i.locationText,
      studentName: i.reporter.name,
      createdAt: i.createdAt.toISOString(),
      recommendedAction: i.recommendedAction,
    }));
}
