import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  return clearSessionCookie(NextResponse.json({ ok: true, redirect: "/login" }));
}

/** GET is used for redirects when a session is no longer valid (e.g. deactivated account). */
export async function GET(req: Request) {
  return clearSessionCookie(NextResponse.redirect(new URL("/login", req.url)));
}
