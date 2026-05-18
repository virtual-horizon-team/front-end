import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
    sub?: string;
    email?: string;
    exp?: number;
    roles?: string | string[];
    role?: string | string[];
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"?: string | string[];
}

/**
 * Server-side guard checking admin claims in JWT access token with zero network overhead.
 * If the user lacks admin privileges, it returns a 404 Not Found error page.
 */
export async function requireAdmin(): Promise<void> {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) {
        notFound();
    }

    try {
        const decoded = jwtDecode<DecodedToken>(token);
        const rawRoles = 
            decoded.roles || 
            decoded.role || 
            decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
            decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"];

        let roles: string[] = [];
        if (Array.isArray(rawRoles)) {
            roles = rawRoles.map(r => r.toLowerCase());
        } else if (typeof rawRoles === "string") {
            if (rawRoles.includes(",")) {
                roles = rawRoles.split(",").map(r => r.trim().toLowerCase());
            } else {
                roles = [rawRoles.trim().toLowerCase()];
            }
        }

        if (!roles.includes("admin")) {
            notFound();
        }
    } catch (error) {
        // If it is a redirection or not found operation, let Next.js bubble it up correctly
        if (error instanceof Error && (error.message === "NEXT_REDIRECT" || error.message === "NEXT_NOT_FOUND")) {
            throw error;
        }

        console.error("JWT validation failed inside requireAdmin server guard:", error);
        notFound();
    }
}
