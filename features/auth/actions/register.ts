"use server";

import { RegisterSchema, RegisterInput } from "../schemas/register-schema";
import { api } from "../lib/api-client";

export const registerUser = async (values: RegisterInput) => {
    const validatedFields = RegisterSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Invalid fields!" };
    }

    try {
        const response = await api("/api/Auth/Register", {
            method: "POST",
            body: JSON.stringify(validatedFields.data),
        });

        return { success: "Account created! Please log in." };
    } catch (error: any) {
        return { error: error.message || "Registration failed" };
    }
};