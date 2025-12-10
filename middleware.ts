import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = [
  "/",
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email"
];
const authRoutes = [
  "/login",
  "/register",
  "/forgot-password",
  "/verify-email"
]; // routes not allowed for logged-in users

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("refreshToken")?.value;

  // ----- If accessing auth route but already logged in -----
  if (authRoutes.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

    // ----- If route is public, always allow -----
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }


  // ----- Protected route: requires token -----
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname); // redirect back after login
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
          Run middleware on all app routes except public assets files
          (images, css, static files)
        */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
