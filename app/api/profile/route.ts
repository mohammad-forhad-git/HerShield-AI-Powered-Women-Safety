import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireApiUser } from "@/lib/auth";
import { fieldErrors, profileSchema } from "@/lib/validation";

export async function GET() {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const { passwordHash: _omit, ...user } = auth.user;
  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const parsed = profileSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const d = parsed.data;
  const user = auth.user;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: d.name,
      phone: d.phone,
      ...(user.role === "ADMIN" ? { designation: d.designation || null } : {}),
      ...(user.role === "STUDENT" && user.studentProfile
        ? {
            studentProfile: {
              update: {
                department: d.department || null,
                batch: d.batch || null,
                ...(typeof d.shareLocationConsent === "boolean" ? { shareLocationConsent: d.shareLocationConsent } : {}),
              },
            },
          }
        : {}),
    },
  });
  return NextResponse.json({ ok: true });
}
