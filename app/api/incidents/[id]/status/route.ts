import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { fieldErrors, statusUpdateSchema } from "@/lib/validation";
import { updateIncidentStatus } from "@/lib/incidents";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser("ADMIN");
  if ("error" in auth) return auth.error;
  const parsed = statusUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status update.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const result = await updateIncidentStatus(params.id, parsed.data.status, parsed.data.note || undefined, auth.user.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.code });
  return NextResponse.json({ incident: result.incident });
}
