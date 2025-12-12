// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public routes
  const isPublicRoute =
    path === "/" ||
    path === "/login" ||
    path === "/transactions" ||
    path === "/committee";

  // Get auth tokens from cookies or headers
  const userId =
    request.cookies.get("user_id")?.value || request.headers.get("x-user-id");
  const userRole =
    request.cookies.get("user_role")?.value ||
    request.headers.get("x-user-role");

  // If accessing protected route without auth
  if (!isPublicRoute && !userId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (path.startsWith("/admin") && userRole !== "admin") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  if (path.startsWith("/cashier") && userRole !== "cashier") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Add auth headers to API requests
  const response = NextResponse.next();

  if (userId) {
    response.headers.set("x-user-id", userId);
  }

  if (userRole) {
    response.headers.set("x-user-role", userRole);
  }

  return response;
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
