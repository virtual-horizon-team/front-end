"use server";

import { cookies } from "next/headers";
import { API_BASE_URL } from "@/lib/config";

export async function refreshSession() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
        console.log("[Refresh] No refresh_token cookie found");
        return null;
    }

    try {
        const baseUrl = API_BASE_URL;
        console.log(`[Refresh] Attempting refresh at ${baseUrl}/api/Auth/Refresh`);
        const response = await fetch(
            `${baseUrl}/api/Auth/Refresh`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(refreshToken),
            }
        );

        console.log(`[Refresh] Response status: ${response.status}`);
        if (!response.ok) throw new Error(`Refresh failed with status ${response.status}`);

        const data = await response.json();

        cookieStore.set("access_token", data.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(data.accessTokenExpirationInMinutes),
        });

        cookieStore.set("refresh_token", data.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            expires: new Date(data.refreshTokenExpirationInDays),
        });

        console.log("Token refreshed successfully")
        return data.accessToken;
    } catch (error) {
        console.log("Error refreshing token:", error)
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        return null;
    }
}