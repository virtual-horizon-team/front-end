import * as z from "zod";

export const RegisterSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    userName: z.string().min(2, "Username must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    country: z.string().min(1, "Country is required"),
    gender: z.string().min(1, "Gender is required"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export type RegisterInput = z.infer<typeof RegisterSchema>;