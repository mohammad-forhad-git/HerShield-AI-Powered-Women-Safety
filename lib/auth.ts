import "server-only";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  signSession,
  verifySession,
  type Session,
  type SessionRole,
} from "./session-token";

export type { Session, SessionRole };

export function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}
export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function getSession(): Promise<Session | null> {
  return verifySession(cookies().get(SESSION_COOKIE)?.value);
}

/** Attach a signed session cookie to a response. */
export async function withSessionCookie(res: NextResponse, session: Session) {
  const token = await signSession(session);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  return res;
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}

/**
 * For server components / layouts: ensures the visitor is logged in with the
 * given role and that the account still exists and is active.
 */
export async function requireRole(role: SessionRole) {
  const session = await getSession();
  if (!session) redirect(role === "ADMIN" ? "/admin/login" : "/login");
  if (session.role !== role) redirect(session.role === "ADMIN" ? "/admin" : "/student");

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { studentProfile: true },
  });
  if (!user || !user.isActive || user.role !== role) redirect("/api/auth/logout");
  return user;
}

/** For API route handlers. Returns the user or a ready-made error response. */
export async function requireApiUser(role?: SessionRole) {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "You must be logged in." }, { status: 401 }) } as const;
  }
  if (role && session.role !== role) {
    return { error: NextResponse.json({ error: "You do not have permission for this action." }, { status: 403 }) } as const;
  }
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { studentProfile: true },
  });
  if (!user || !user.isActive) {
    return { error: NextResponse.json({ error: "Account not found or deactivated." }, { status: 401 }) } as const;
  }
  return { user } as const;
}
