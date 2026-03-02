"use server";

import { PairDeviceSchema } from "../schemas/pair-device-schema";
import { serverApi } from "../lib/server-api-client";
import { cookies } from "next/headers";

export const pairDevice = async (values: { userCode: string }) => {

    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    
    const validatedFields = PairDeviceSchema.safeParse(values);
    if (!validatedFields.success) {
        throw new Error(validatedFields.error.message); 
    }

    const response = await serverApi<{ message: string }>(`/api/Device/Pair?UserCode=${validatedFields.data.userCode}`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.message;
};