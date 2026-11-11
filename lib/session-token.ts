// Edge-safe JWT helpers (used by middleware and server code). No Node-only imports here.
import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE = "hs_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

export type SessionRole = "STUDENT" | "ADMIN";
export interface Session {
  userId: string;
  role: SessionRole;
  name: string;
  email: string;
}

function secretKey() {
  const secret = process.env.AUTH_SECRET || "hershield-dev-secret-change-me-0123456789abcdef";
  return new TextEncoder().encode(secret);
}

export async function signSession(session: Session) {
  return new SignJWT({ role: session.role, name: session.name, email: session.email })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(session.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || (payload.role !== "STUDENT" && payload.role !== "ADMIN")) return null;
    return {
      userId: payload.sub,
      role: payload.role,
      name: String(payload.name ?? ""),
      email: String(payload.email ?? ""),
    };
  } catch {
    return null;
  }
}
