import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { fieldErrors, incidentSchema } from "@/lib/validation";
import { createIncident, incidentListInclude, toRow } from "@/lib/incidents";

/** List incidents: students see only their own, admins see all (with optional filters). */
export async function GET(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const url = new URL(req.url);
  const where: Prisma.IncidentWhereInput = {};
  if (auth.user.role === "STUDENT") where.reporterId = auth.user.id;
  const status = url.searchParams.get("status");
  const priority = url.searchParams.get("priority");
  const category = url.searchParams.get("category");
  const q = url.searchParams.get("q");
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (category) where.category = { slug: category };
  if (q) where.OR = [{ code: { contains: q } }, { title: { contains: q } }];

  const incidents = await prisma.incident.findMany({
    where,
    include: incidentListInclude,
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ incidents: incidents.map(toRow) });
}

/** Only authenticated students can submit emergency reports. */
export async function POST(req: Request) {
  const auth = await requireApiUser("STUDENT");
  if ("error" in auth) return auth.error;
  const parsed = incidentSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  try {
    const result = await createIncident(parsed.data, { id: auth.user.id, name: auth.user.name });
    return NextResponse.json(
      {
        incident: {
          id: result.incident.id,
          code: result.incident.code,
          status: result.incident.status,
          priority: result.incident.priority,
          createdAt: result.incident.createdAt,
        },
        classification: result.classification,
        contactsNotified: result.contactsNotified,
      },
      { status: 201 },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Could not save the incident. Please try again." }, { status: 500 });
  }
}
