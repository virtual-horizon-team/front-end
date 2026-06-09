import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "@/lib/config";

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
        if (Array.isArray(rawRoles)) return rawRoles.map(r => r.toLowerCase());
        if (typeof rawRoles === "string") {
            return rawRoles.includes(",") 
                ? rawRoles.split(",").map(r => r.trim().toLowerCase()) 
                : [rawRoles.trim().toLowerCase()];
        }
        return [];
    } catch {
        return [];
    }
}

function isTokenExpired(token: string | undefined): boolean {
    if (!token) return true;
    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        // إضافة هامش أمان (10 ثوانٍ) لتجنب انتهاء الـ Token أثناء معالجة الطلب
        return Date.now() >= (decoded.exp * 1000) - 10000;
    } catch {
        return true;
    }
}

export async function middleware(request: NextRequest) {
    let accessToken = request.cookies.get("access_token")?.value;
    const refreshToken = request.cookies.get("refresh_token")?.value;
    const pathname = request.nextUrl.pathname;

    const isAuthPage = pathname.startsWith("/login") || pathname.startsWith("/register");
    const isAdminPage = pathname.startsWith("/admin");
    const isInstructorPage = pathname.startsWith("/instructor");
    const isProtectedRoute = isAdminPage || isInstructorPage || 
        pathname.startsWith("/dashboard") || 
        pathname === "/pair-device" || 
        pathname.startsWith("/my-courses");

    let response = NextResponse.next();

    if (isTokenExpired(accessToken) && refreshToken) {
        try {
            const refreshRes = await fetch(`${API_BASE_URL.replace(/\/$/, "")}/api/Auth/Refresh`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(refreshToken),
            });

            if (refreshRes.ok) {
                const data = await refreshRes.json();
                accessToken = data.accessToken;

                request.cookies.set("access_token", data.accessToken);
                request.cookies.set("refresh_token", data.refreshToken);
                const requestHeaders = new Headers(request.headers);
                requestHeaders.set("cookie", request.cookies.getAll().map(c => `${c.name}=${c.value}`).join("; "));
                
                response = NextResponse.next({ request: { headers: requestHeaders } });

                // Parse expiration — handle both numeric durations and ISO date strings
                const accessExpMinutes = data.accessTokenExpirationInMinutes;
                const refreshExpDays = data.refreshTokenExpirationInDays;

                let accessExpiry: Date;
                let refreshExpiry: Date;

                if (!isNaN(Number(accessExpMinutes))) {
                    accessExpiry = new Date(Date.now() + (Number(accessExpMinutes) * 60 * 1000));
                } else {
                    accessExpiry = new Date(accessExpMinutes);
                }

                if (!isNaN(Number(refreshExpDays))) {
                    refreshExpiry = new Date(Date.now() + (Number(refreshExpDays) * 24 * 60 * 60 * 1000));
                } else {
                    refreshExpiry = new Date(refreshExpDays);
                }

                if (isNaN(accessExpiry.getTime())) {
                    accessExpiry = new Date(Date.now() + 30 * 60 * 1000);
                }
                if (isNaN(refreshExpiry.getTime())) {
                    refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                }

                const cookieOptions = {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                    sameSite: "lax" as const,
                    path: "/",
                };

                response.cookies.set("access_token", data.accessToken, { ...cookieOptions, expires: accessExpiry });
                response.cookies.set("refresh_token", data.refreshToken, { ...cookieOptions, expires: refreshExpiry });
            } else {
                accessToken = undefined; // فشل التجديد
            }
        } catch (error) {
            accessToken = undefined; // فشل الاتصال بالخادم
        }
    }

    // 2. التحقق من الصلاحيات إذا كان المستخدم مسجلاً للدخول
    if (accessToken && !isTokenExpired(accessToken)) {
        if (isAdminPage) {
            const roles = getUserRolesFromToken(accessToken);
            if (!roles.includes("admin")) return NextResponse.redirect(new URL("/404", request.url));
        }

        if (isInstructorPage) {
            try {
                const decoded = jwtDecode<DecodedToken>(accessToken);
                if (!decoded.InstructorProfileId) return NextResponse.redirect(new URL("/forbidden", request.url));
            } catch {
                return NextResponse.redirect(new URL("/forbidden", request.url));
            }
        }

        if (isAuthPage) return NextResponse.redirect(new URL("/", request.url));

        return response;
    }

    // 3. التعامل مع المستخدم غير المسجل أو من فشل تجديد جلسته
    if (isProtectedRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname + request.nextUrl.search);
        
        const redirectResponse = NextResponse.redirect(loginUrl);
        // مسح الجلسة لضمان تنظيف المتصفح
        redirectResponse.cookies.delete("access_token");
        redirectResponse.cookies.delete("refresh_token");
        
        return redirectResponse;
    }

    return response;
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};