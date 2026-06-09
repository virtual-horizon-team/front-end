"use server";

import { cookies } from "next/headers";
import { jwtDecode } from "jwt-decode";

export async function getAccessToken(): Promise<string | null> {
    const cookieStore = await cookies();
    let token = cookieStore.get("access_token")?.value || null;

    if (!token) {
        const refreshToken = cookieStore.get("refresh_token")?.value;
        if (refreshToken) {
            console.log("[getAccessToken] Access token missing but refresh token exists. Attempting refresh...");
            try {
                const { refreshSession } = await import("./refresh-token");
                token = await refreshSession();
            } catch (e) {
                console.error("[getAccessToken] Failed to refresh token:", e);
                token = null;
            }
        }
        return token;
    }

    try {
        const decoded = jwtDecode<{ exp: number }>(token);
        const isExpired = Date.now() >= decoded.exp * 1000;
        if (isExpired) {
            console.log("[getAccessToken] Access token expired. Attempting refresh...");
            try {
                const { refreshSession } = await import("./refresh-token");
                token = await refreshSession();
            } catch (e) {
                console.error("[getAccessToken] Failed to refresh token:", e);
                token = null;
            }
        }
    } catch (e) {
        // If decoding failed, maybe it's invalid, try refreshing
        const refreshToken = cookieStore.get("refresh_token")?.value;
        if (refreshToken) {
            try {
                const { refreshSession } = await import("./refresh-token");
                token = await refreshSession();
            } catch (err) {
                token = null;
            }
        } else {
            token = null;
        }
    }

    return token;
}
