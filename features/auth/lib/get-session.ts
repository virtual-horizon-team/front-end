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
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);

        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) return null;

        const roles = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || decoded.role || [];
        const rolesArray = Array.isArray(roles) ? roles : [roles];
        const isAdmin = rolesArray.some(r => typeof r === 'string' && r.toLowerCase() === "admin");

        return {
            userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            userName: decoded.sub,
            email: decoded.email,
            isInstructor: !!decoded.InstructorProfileId,
            isAdmin: isAdmin,
        };
    } catch (error) {
        return null;
    }
}