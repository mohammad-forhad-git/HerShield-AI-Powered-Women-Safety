import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyPassword, withSessionCookie } from "@/lib/auth";
import { fieldErrors, loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 422 });
  }
  const { email, password, portal } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }
  if (!user.isActive) {
    return NextResponse.json({ error: "This account has been deactivated. Contact campus security." }, { status: 403 });
  }
  const expectedRole = portal === "admin" ? "ADMIN" : "STUDENT";
  if (user.role !== expectedRole) {
    return NextResponse.json(
      {
        error:
          user.role === "ADMIN"
            ? "This is a security/admin account. Please use the Admin Login page."
            : "Student accounts cannot access the admin portal. Please use Student Login.",
      },
      { status: 403 },
    );
  }

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  const res = NextResponse.json({ ok: true, redirect: user.role === "ADMIN" ? "/admin" : "/student" });
  return withSessionCookie(res, {
    userId: user.id,
    role: user.role as "STUDENT" | "ADMIN",
    name: user.name,
    email: user.email,
  });
}
