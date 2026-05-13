import { z } from "zod";

export const LoginSchema = z.object({
    userName: z.string().min(1, "Username is required"),
    password: z.string().min(1, "Password is required"),
    rememberMe: z.boolean().optional(),
});

export type LoginInput = z.infer<typeof LoginSchema>;