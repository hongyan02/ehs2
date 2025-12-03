import { NextResponse, NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const adminCookie = request.cookies.get("token");
  const { pathname } = request.nextUrl;

  // Allow access to public routes such as the login page without checking auth
  if (pathname.startsWith("/login") || pathname.startsWith("/signboard")) {
    return NextResponse.next();
  }

  if (adminCookie?.value) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|signboard).*)",
  ],
};
