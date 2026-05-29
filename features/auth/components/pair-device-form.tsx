"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { PairDeviceSchema } from "../schemas/pair-device-schema";
import { pairDevice } from "../actions/pair-device";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export const PairDeviceForm = () => {
    const [isPending, startTransition] = useTransition();
    const [message, setMessage] = useState<{ error?: string; success?: string }>({});

    const form = useForm<{ userCode: string }>({
        resolver: zodResolver(PairDeviceSchema),
        defaultValues: { userCode: "" },
    });

    const onSubmit = (values: { userCode: string }) => {
        setMessage({});
        startTransition(async () => {
            try {
                const result = await pairDevice(values);
                setMessage({ success: result });
            } catch (error: any) {
                setMessage({ error: error.message });
            }
        });
    };

    return (
        <div className="w-full max-w-md mx-auto p-8 rounded-xl bg-white border border-brand-border shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-8">
                <h1 className="font-serif text-[32px] text-brand-navy font-normal mb-2">
                    Pair Your Device
                </h1>
                <p className="text-brand-muted mt-2 text-sm">Enter the code displayed on your VR device to pair it with your account</p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="userCode" className="block text-sm font-medium text-brand-text mb-1">
                        Device Code
                    </label>
                    <input
                        id="userCode"
                        type="text"
                        {...form.register("userCode")}
                        className="mt-1 block w-full rounded-md border border-brand-border bg-slate-50 px-3 py-2 text-sm text-brand-text placeholder-gray-400 focus:border-brand-primary focus:ring-brand-primary"
                        placeholder="Enter your device code"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-md bg-brand-primary px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-hover focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 flex justify-center items-center"
                >
                    {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pair Device"}
                </button>
            </form>
            {message.success && (
                <div className="mt-4 flex items-center justify-center rounded-md bg-green-500 p-2 text-sm text-white">
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    {message.success}
                </div>
            )}
            {message.error && (
                <div className="mt-4 flex items-center justify-center rounded-md bg-red-500 p-2 text-sm text-white">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    {message.error}
                </div>
            )}
        </div>
    );
};