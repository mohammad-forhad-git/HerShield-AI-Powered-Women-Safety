import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, requireApiUser, verifyPassword } from "@/lib/auth";
import { fieldErrors, passwordChangeSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const auth = await requireApiUser();
  if ("error" in auth) return auth.error;
  const parsed = passwordChangeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  if (!(await verifyPassword(parsed.data.currentPassword, auth.user.passwordHash))) {
    return NextResponse.json(
      { error: "Current password is incorrect.", fields: { currentPassword: "Current password is incorrect" } },
      { status: 400 },
    );
  }
  await prisma.user.update({
    where: { id: auth.user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });
  return NextResponse.json({ ok: true });
}
