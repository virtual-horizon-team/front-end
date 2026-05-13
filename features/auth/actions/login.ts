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

        cookieStore.set("access_token", response.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            ...(rememberMe ? { expires: new Date(response.accessTokenExpirationInMinutes) } : {})
        });

        cookieStore.set("refresh_token", response.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            ...(rememberMe ? { expires: new Date(response.refreshTokenExpirationInDays) } : {})
        });

        return { success: "Logged in successfully!", data: response };

    } catch (error: any) {
        return { error: "Incorrect username or password" };
    }
};