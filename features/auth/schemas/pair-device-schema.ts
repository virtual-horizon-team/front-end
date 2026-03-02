import { z } from "zod";

export const PairDeviceSchema = z.object({
    userCode: z.string()
    .regex(/^\d{4}$/, "User code must be exactly 4 digits"),
});