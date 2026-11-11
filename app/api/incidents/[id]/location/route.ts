import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { fieldErrors, locationSchema } from "@/lib/validation";
import { isOpenStatus } from "@/lib/constants";

/** Student shares / updates coordinates for one of their OPEN incidents. */
export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const incident = await prisma.incident.findUnique({ where: { id: params.id } });
  if (!incident || incident.reporterId !== auth.user.id) {
    return NextResponse.json({ error: "Incident not found." }, { status: 404 });
  }
  if (!isOpenStatus(incident.status)) {
    return NextResponse.json({ error: "Location can only be shared for open incidents." }, { status: 400 });
  }
  const parsed = locationSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  const data = {
    latitude: d.latitude,
    longitude: d.longitude,
    label: d.label ?? null,
    source: d.source,
    accuracy: d.accuracy ?? null,
    sharedAt: new Date(),
  };
  const location = await prisma.$transaction(async (tx) => {
    const loc = await tx.incidentLocation.upsert({
      where: { incidentId: incident.id },
      create: { incidentId: incident.id, ...data },
      update: data,
    });
    await tx.incidentStatusHistory.create({
      data: {
        incidentId: incident.id,
        fromStatus: incident.status,
        toStatus: incident.status,
        note: `Student shared location (${d.source.toLowerCase()}): ${d.latitude.toFixed(5)}, ${d.longitude.toFixed(5)}`,
        changedById: auth.user.id,
      },
    });
    return loc;
  });
  return NextResponse.json({ location });
}
