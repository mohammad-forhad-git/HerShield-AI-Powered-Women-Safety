import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { incidentDetailInclude } from "@/lib/incidents";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const incident = await prisma.incident.findUnique({ where: { id: params.id }, include: incidentDetailInclude });
  // Students may only read their own incidents (RBAC).
  if (!incident || (auth.user.role === "STUDENT" && incident.reporterId !== auth.user.id)) {
    return NextResponse.json({ error: "Incident not found." }, { status: 404 });
  }
  return NextResponse.json({ incident });
}
