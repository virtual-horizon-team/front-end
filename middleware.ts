import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./features/auth/lib/get-session";

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register");

    // If we have a valid session, allow the request
    if (session) {
        // Redirect away from auth pages if logged in
        if (isAuthPage) {
            return NextResponse.redirect(new URL("/", request.url));
        }
        return NextResponse.next();
    }

    // If no session but we're on an auth page, allow it
    if (isAuthPage) {
        return NextResponse.next();
    }

    // No session and not on auth page - check if we have a refresh token
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (refreshToken) {
        // We have a refresh token, redirect to a refresh page that will handle the refresh
        const refreshUrl = new URL("/api/auth/refresh", request.url);
        refreshUrl.searchParams.set("redirect", request.nextUrl.pathname + request.nextUrl.search);
        return NextResponse.redirect(refreshUrl);
    }

    // No session and no refresh token - redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
}

export const config = {
    matcher: ["/", "/dashboard/:path*", "/instructor/:path*", "/pair-device", "/login", "/register"],
};