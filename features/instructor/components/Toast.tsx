"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    message: string;
}

let toastListeners: ((toast: ToastMessage) => void)[] = [];

export function showToast(type: ToastType, message: string) {
    const toast: ToastMessage = {
        id: crypto.randomUUID(),
        type,
        message,
    };
    toastListeners.forEach((fn) => fn(toast));
}

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info,
};

const colorMap = {
    success: "bg-green-50 border-green-200 text-green-800",
    error: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
};

const iconColorMap = {
    success: "text-green-500",
    error: "text-red-500",
    warning: "text-amber-500",
    info: "text-blue-500",
};

export default function ToastContainer() {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        const handler = (toast: ToastMessage) => {
            setToasts((prev) => [...prev, toast]);
        };
        toastListeners.push(handler);
        return () => {
            toastListeners = toastListeners.filter((fn) => fn !== handler);
        };
    }, []);

    useEffect(() => {
        if (toasts.length === 0) return;
        const timer = setTimeout(() => {
            setToasts((prev) => prev.slice(1));
        }, 4000);
        return () => clearTimeout(timer);
    }, [toasts]);

    const dismiss = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-6 right-6 z-[200] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => {
                const Icon = iconMap[toast.type];
                return (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg animate-slide-in-right ${colorMap[toast.type]}`}
                    >
                        <Icon size={18} className={`mt-0.5 shrink-0 ${iconColorMap[toast.type]}`} />
                        <p className="text-sm font-medium flex-1">{toast.message}</p>
                        <button
                            onClick={() => dismiss(toast.id)}
                            className="shrink-0 p-0.5 hover:opacity-70 transition-opacity cursor-pointer"
                        >
                            <X size={14} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
