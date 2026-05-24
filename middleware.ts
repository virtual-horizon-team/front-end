import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "./features/auth/lib/get-session";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    sub?: string;
    email?: string;
    exp?: number;
    roles?: string | string[];
    role?: string | string[];
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"?: string | string[];
    InstructorProfileId?: string;
}

/**
 * Robustly extracts roles from any SOAP namespace claim structure in JWT tokens.
 */
function getUserRolesFromToken(token: string): string[] {
    if (!token) return [];
    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const rawRoles = 
            decoded.roles || 
            decoded.role || 
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

        if (!rawRoles) return [];

        if (Array.isArray(rawRoles)) {
            return rawRoles.map(r => r.toLowerCase());
        }

        if (typeof rawRoles === "string") {
            if (rawRoles.includes(",")) {
                return rawRoles.split(",").map(r => r.trim().toLowerCase());
            }
            return [rawRoles.trim().toLowerCase()];
        }

        return [];
    } catch (e) {
        return [];
    }
}

export async function middleware(request: NextRequest) {
    const session = await getSession();
    const isAuthPage = request.nextUrl.pathname.startsWith("/login") ||
        request.nextUrl.pathname.startsWith("/register");
    const isAdminPage = request.nextUrl.pathname.startsWith("/admin");
    const isInstructorPage = request.nextUrl.pathname.startsWith("/instructor");

    if (session) {
        const token = request.cookies.get("access_token")?.value || "";

        // Enforce administrative checks at the edge using access token claims
        if (isAdminPage) {
            const roles = getUserRolesFromToken(token);
            const isAdmin = roles.includes("admin");

            if (!isAdmin) {
                // Return a standard 404 response redirect instead of revealing endpoint existence via /forbidden
                return NextResponse.redirect(new URL("/404", request.url));
            }
        }

        // Enforce instructor checks at the edge using InstructorProfileId claim
        if (isInstructorPage) {
            let isInstructor = false;
            if (token) {
                try {
                    const decoded = jwtDecode<DecodedToken>(token);
                    isInstructor = !!decoded.InstructorProfileId;
                } catch (e) {}
            }

            if (!isInstructor) {
                return NextResponse.redirect(new URL("/forbidden", request.url));
            }
        }

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
    matcher: ["/dashboard/:path*", "/instructor/:path*", "/admin/:path*", "/pair-device", "/login", "/register"],
};