import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

interface JWTPayload {
    sub: string;
    email?: string;
    exp: number;
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"?: string;
}

export async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return null;

    try {
        const decoded = jwtDecode<JWTPayload>(token);

        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) return null;

        return {
            userId: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
            userName: decoded.sub,
            email: decoded.email,
        };
    } catch (error) {
        return null;
    }
}