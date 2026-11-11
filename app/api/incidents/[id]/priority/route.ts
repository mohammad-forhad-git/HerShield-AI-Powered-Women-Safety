import { NextResponse } from "next/server";
import { requireApiUser } from "@/lib/auth";
import { fieldErrors, priorityOverrideSchema } from "@/lib/validation";
import { overrideIncidentPriority } from "@/lib/incidents";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const auth = await requireApiUser("ADMIN");
  if ("error" in auth) return auth.error;
  const parsed = priorityOverrideSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const result = await overrideIncidentPriority(params.id, parsed.data.priority, parsed.data.reason, auth.user.id);
  if ("error" in result) return NextResponse.json({ error: result.error }, { status: result.code });
  return NextResponse.json({ incident: result.incident });
}
