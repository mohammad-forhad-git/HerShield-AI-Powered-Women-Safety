import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "./lib/session-token";

/** Route protection + role-based access control for dashboards. */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);

  const redirectTo = (path: string, withNext = false) => {
    const url = req.nextUrl.clone();
    url.pathname = path;
    url.search = withNext ? `?next=${encodeURIComponent(pathname)}` : "";
    return NextResponse.redirect(url);
  };

  // Auth pages: send logged-in users to their dashboard
  if (pathname === "/login" || pathname === "/register" || pathname === "/admin/login") {
    if (session) return redirectTo(session.role === "ADMIN" ? "/admin" : "/student");
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!session) return redirectTo("/admin/login", true);
    if (session.role !== "ADMIN") return redirectTo("/student");
  }

  if (pathname.startsWith("/student")) {
    if (!session) return redirectTo("/login", true);
    if (session.role !== "STUDENT") return redirectTo("/admin");
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/admin/:path*", "/login", "/register"],
};
