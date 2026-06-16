import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
    sub: string;
    email?: string;
    exp: number;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string | string[];
    role?: string | string[];
    InstructorProfileId?: string;
    FreelancerProfileId?: string;
}

export async function getSession(skipRefresh = false) {
    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value;

    if (!token) {
        if (skipRefresh) return null;

        const refreshToken = cookieStore.get("refresh_token")?.value;
        if (refreshToken) {
            console.log("[getSession] Access token missing but refresh token exists. Attempting refresh...");
            try {
                const { refreshSession } = await import("./refresh-token");
                const newToken = await refreshSession();
                if (newToken) {
                    token = newToken;
                } else {
                    return null;
                }
            } catch (e) {
                console.error("[getSession] Failed to refresh session:", e);
                return null;
            }
        } else {
            return null;
        }
    }

    if (!token) return null;

    try {
        let decoded = jwtDecode<JWTPayload>(token);

        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
            if (skipRefresh) return null;

            console.log("[getSession] Access token is expired. Attempting refresh...");
            try {
                const { refreshSession } = await import("./refresh-token");
                const newToken = await refreshSession();
                if (newToken) {
                    token = newToken;
                    decoded = jwtDecode<JWTPayload>(newToken);
                } else {
                    return null;
                }
            } catch (e) {
                console.error("[getSession] Failed to refresh session:", e);
                return null;
            }
        }

        const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || [];
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        const isAdmin = rolesArray.some(r => typeof r === 'string' && r.toLowerCase() === "admin");

        return {
            userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            userName: decoded.sub,
            email: decoded.email,
            isInstructor: !!decoded.InstructorProfileId,
            isFreelancer: !!decoded.FreelancerProfileId,
            isAdmin: isAdmin,
        };
    } catch (error) {
        return null;
    }
}