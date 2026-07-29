import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { adminSessionCookieName, isValidAdminSessionValue } from "@/lib/admin-auth";

const PUBLIC_PATHS = ["/login"];
const PUBLIC_API_PATHS = ["/api/meta/campaign"];
const RESERVED_PRIVATE_SEGMENTS = new Set(["api", "archive", "login"]);

function isPublicCampaignPath(pathname: string) {
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length !== 1) {
    return false;
  }

  return !RESERVED_PRIVATE_SEGMENTS.has(segments[0]);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/sitemap")
  ) {
    return NextResponse.next();
  }

  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isPublicApiPath = PUBLIC_API_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  const isPublicCampaign = isPublicCampaignPath(pathname);
  const hasValidSession = isValidAdminSessionValue(
    request.cookies.get(adminSessionCookieName)?.value,
  );

  if (!hasValidSession && !isPublicPath && !isPublicApiPath && !isPublicCampaign) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  if (hasValidSession && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
