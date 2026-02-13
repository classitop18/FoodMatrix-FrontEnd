import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = [
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/otp-verification",
    "/otp-verification",
    "/subscription-plan"
];
const protectedPaths = ["/dashboard", "/account", "/profile", "/setup"];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check for refresh token in cookies
    const hasRefreshToken = request.cookies.has("refreshToken");

    // Check if the path serves a static file or is an API route (optional optimization)
    if (
        pathname.includes(".") || // Files like favicon.ico, images
        pathname.startsWith("/api") || // API routes
        pathname.startsWith("/_next") // Next.js internal paths
    ) {
        return NextResponse.next();
    }

    // Case 1: Helper function to determine if a path is public
    const isPublicPath = publicPaths.some((path) => pathname.startsWith(path)) || pathname === "/";

    // Case 2: Authenticated User on Public Page -> Redirect to Dashboard
    if (hasRefreshToken && isPublicPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    // Case 3: Helper function to determine if a path is protected
    // We can either define protected paths explicitly or just assume anything NOT public is protected (except landing page if any)
    // For safety, let's explicitly protect known protected routes or use a robust strategy.
    // Given the user request, let's be strict about protected paths.
    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

    // Case 4: Unauthenticated User on Protected Page -> Redirect to Login
    if (!hasRefreshToken && isProtectedPath) {
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        // Optional: Add return URL
        url.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ],
};
