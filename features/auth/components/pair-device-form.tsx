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
        <div className="w-full max-w-md mx-auto p-8 rounded-2xl bg-white/10 dark:bg-black/20 backdrop-blur-xl border border-white/20 shadow-2xl transition-all duration-300 hover:shadow-blue-500/10">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                    Pair Your Device
                </h1>
                <p className="text-gray-400 mt-2 text-sm">Enter the code displayed on your VR device to pair it with your account</p>
            </div>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label htmlFor="userCode" className="block text-sm font-medium text-gray-300">
                        Device Code
                    </label>
                    <input
                        id="userCode"
                        type="text"
                        {...form.register("userCode")}
                        className="mt-1 block w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-300 placeholder-gray-500 focus:border-blue-500 focus:ring focus:ring-blue-500"
                        placeholder="Enter your device code"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full rounded-md bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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