"use server";

import { cookies } from "next/headers";
import { api } from "../lib/api-client";
import { redirect } from "next/navigation";

export const logoutUser = async () => {
    const cookieStore = await cookies();

    const refreshToken = cookieStore.get("refresh_token")?.value;

    try {
        if (refreshToken) {
            await api(`/api/Auth/Logout?refreshToken=${encodeURIComponent(refreshToken)}`, {
                method: "POST",
            });
        }
    } catch (error) {
        console.error("Backend logout failed, but clearing local cookies anyway.");
    } finally {
        cookieStore.delete("access_token");
        cookieStore.delete("refresh_token");

        redirect("/");
    }
};