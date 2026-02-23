"use server";

import { cookies } from "next/headers";

export async function refreshSession() {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) return null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/Auth/Refresh?refreshToken=${encodeURIComponent(refreshToken)}`,
            { method: "POST" }
        );

        if (!response.ok) throw new Error("Refresh failed");

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

        return data.accessToken;
    } catch (error) {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");
        return null;
    }
}