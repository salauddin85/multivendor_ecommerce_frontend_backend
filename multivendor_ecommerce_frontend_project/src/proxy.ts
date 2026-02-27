import { NextResponse, type NextRequest } from "next/server";
import { user_type } from "@/types/user";
import { protected_routes } from "./lib/protected_routes";

const permissionCache = new Map();
const CACHE_TTL = 60 * 1000;

function cleanupExpiredCache() {
  const now = Date.now();
  const entries = Array.from(permissionCache.entries());

  for (const [key, value] of entries) {
    if (now - value.timestamp > CACHE_TTL) {
      permissionCache.delete(key);
    }
  }
}
if (typeof setInterval !== "undefined") {
  setInterval(cleanupExpiredCache, 60 * 1000);
}
export async function proxy(request: NextRequest) {
  const role = request.cookies.get("user_type")?.value as user_type | undefined;

  // Not logged in → send to login
  if (!role) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const pathname = request.nextUrl.pathname;

  // Allow access ONLY to the matching dashboard path
  if (pathname.startsWith("/dashboard")) {
    if (role === "customer" && !pathname.startsWith("/dashboard/customer")) {
      return NextResponse.redirect(new URL("/dashboard/customer", request.url));
    }
    if (role === "vendor" && !pathname.startsWith("/dashboard/vendor")) {
      return NextResponse.redirect(new URL("/dashboard/vendor", request.url));
    }
    if (role === "admin" && !pathname.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/dashboard/admin", request.url));
    }
    if (role === "store_owner" && !pathname.startsWith("/dashboard/company")) {
      return NextResponse.redirect(new URL("/dashboard/company", request.url));
    }
  }

  const url = request.nextUrl.clone();
  const token = request.cookies.get("access_token")?.value;

  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  let user_permissions = [];
  const cacheKey = `user_${token}`;

  const cachedData = permissionCache.get(cacheKey);
  const now = Date.now();
  const oneMinute = 60 * 1000;

  if (cachedData && now - cachedData.timestamp < oneMinute) {
    user_permissions = cachedData.permissions;
  } else {
    try {
      const baseURL =
        process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8000";
      const apiRes = await fetch(`${baseURL}/api/authorization/v1/me/`, {
        headers: {
          cookie: `access_token=${token};`,
        },
        cache: "no-store",
        credentials: "include",
      });

      const json = await apiRes.json();
      if (json.code !== 200) {
        url.pathname = "/";
        return NextResponse.redirect(url);
      }

      const data = json.data;
      user_permissions = data.permissions.map((p: any) => p);

      permissionCache.set(cacheKey, {
        permissions: user_permissions,
        timestamp: now,
      });
    } catch (err) {
      console.log(err);
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  const parts = pathname.split("/");
  const section =
    parts[1] === "dashboard" && parts.length > 3 ? parts[3] : null;

  const matchedRoute = protected_routes.find((route) => route.path === section);

  if (
    matchedRoute?.permission_name &&
    !user_permissions.includes(matchedRoute.permission_name)
  ) {
    url.pathname = "/unauthorized";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/checkout/:path*"],
};
