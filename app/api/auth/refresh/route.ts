import { refreshSession } from "@/features/auth/lib/refresh-token";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const redirectTo = request.nextUrl.searchParams.get("redirect") || "/";

        // Attempt to refresh the session
        const newToken = await refreshSession();

        if (newToken) {
            // Refresh succeeded, redirect back to the original page
            return NextResponse.redirect(new URL(redirectTo, request.url));
        } else {
            // Refresh failed, redirect to login
            return NextResponse.redirect(new URL("/login", request.url));
        }
    } catch (error) {
        console.error("Refresh API error:", error);
        // On error, redirect to login
        return NextResponse.redirect(new URL("/login", request.url));
    }
}