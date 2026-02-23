"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterInput } from "../schemas/register-schema";
import { registerUser } from "../actions/register";
import { useState, useTransition } from "react";
import { User, Mail, Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export const RegisterForm = () => {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ error?: string; success?: string }>({});

    const form = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: { userName: "", email: "", password: "", confirmPassword: "" },
    });

    const onSubmit = (values: RegisterInput) => {
        setMessage({});
        startTransition(async () => {
            const result = await registerUser(values);
            setMessage(result);
            if (result.success) {
                form.reset();
                setTimeout(() => {
                    redirect("/login");
                }, 1000);
            }
        });
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:shadow-blue-500/10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Create Account
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Join us and start your journey</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 border-0">
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Username</label>
                    <div className="relative group">
                        <User className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            {...form.register("userName")}
                            placeholder="johndoe"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    {form.formState.errors.userName && (
                        <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {form.formState.errors.userName.message}
                        </p>
                    )}
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Email Address</label>
                    <div className="relative group">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            {...form.register("email")}
                            type="email"
                            placeholder="name@example.com"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    {form.formState.errors.email && (
                        <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            {...form.register("password")}
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label className="text-xs font-medium text-gray-400 ml-1">Confirm Password</label>
                    <div className="relative group">
                        <CheckCircle2 className="absolute left-3 top-3 w-4 h-4 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                        <input
                            {...form.register("confirmPassword")}
                            type="password"
                            placeholder="••••••••"
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm"
                        />
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-xs text-red-400 mt-1 ml-1 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl py-3 font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        "Register"
                    )}
                </button>

                {message.error && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {message.error}
                    </div>
                )}
                {message.success && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-1">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        {message.success}
                    </div>
                )}
            </form>
        </div>
    );
};
