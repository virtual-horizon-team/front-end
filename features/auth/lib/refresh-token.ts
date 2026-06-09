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
            `${baseUrl.replace(/\/$/, "")}/api/Auth/Refresh`,
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

        try {
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

            // Fallback for invalid dates
            if (isNaN(accessExpiry.getTime())) {
                accessExpiry = new Date(Date.now() + 30 * 60 * 1000);
            }
            if (isNaN(refreshExpiry.getTime())) {
                refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
            }

            cookieStore.set("access_token", data.accessToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                expires: accessExpiry,
            });

            cookieStore.set("refresh_token", data.refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                expires: refreshExpiry,
            });
        } catch (cookieError) {
            console.warn("[RefreshSession] Cookies could not be modified in this context (e.g. rendering phase):", cookieError);
        }

        console.log("Token refreshed successfully")
        return data.accessToken;
    } catch (error) {
        console.log("Error refreshing token:", error)
        try {
            cookieStore.delete("access_token");
            cookieStore.delete("refresh_token");
        } catch (cookieError) {
            console.warn("[RefreshSession] Cookies could not be deleted in this context:", cookieError);
        }
        return null;
    }
}