"use server";

import { LoginSchema, LoginInput } from "../schemas/login-schema";
import { api } from "../lib/api-client";
import { cookies } from "next/headers";

export const loginUser = async (values: LoginInput) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    try {
        const { rememberMe, ...apiPayload } = validatedFields.data;

        const response = await api<{
            accessToken: string;
            refreshToken: string;
            userId: string;
            userName: string;
            accessTokenExpirationInMinutes: string;
            refreshTokenExpirationInDays: string;
        }>("/api/Auth/Login", {
            method: "POST",
            body: JSON.stringify(apiPayload),
        });

        const cookieStore = await cookies();

        // Parse expiration — handle both numeric durations ("30") and ISO date strings ("2026-06-10T...")
        const accessExpMinutes = response.accessTokenExpirationInMinutes;
        const refreshExpDays = response.refreshTokenExpirationInDays;

        let accessExpiry: Date;
        let refreshExpiry: Date;

        // If it's a pure number (e.g. "30"), treat as duration; otherwise treat as an ISO date string
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

        // Fallback: if parsing produced an invalid date, default to reasonable values
        if (isNaN(accessExpiry.getTime())) {
            accessExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
        }
        if (isNaN(refreshExpiry.getTime())) {
            refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
        }

        cookieStore.set("access_token", response.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            // Access token: session cookie if not rememberMe, persistent otherwise
            ...(rememberMe ? { expires: accessExpiry } : {})
        });

        cookieStore.set("refresh_token", response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            // Refresh token: ALWAYS persistent so the session survives browser restarts
            expires: refreshExpiry,
        });

        return { success: "Logged in successfully!", data: response };

    } catch (error: any) {
        return { error: "Incorrect username or password" };
    }
};