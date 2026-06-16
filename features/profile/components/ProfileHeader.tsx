"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Wallet, Receipt, ShoppingBag } from "lucide-react";

interface ProfileHeaderProps {
    isInstructor?: boolean;
}

export default function ProfileHeader({ isInstructor }: ProfileHeaderProps) {
    const pathname = usePathname();

    const tabs = [
        { href: "/profile", label: "Personal Info", icon: User },
        { href: "/profile/orders", label: "Order History", icon: ShoppingBag },
    ];

    return (
        <div className="mb-10">
            {/* Header Title Info */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-brand-navy tracking-tight">
                        Account Settings
                    </h1>
                    <p className="text-brand-muted mt-1.5 text-sm md:text-base font-medium">
                        Manage your personal identity details, wallet withdraw request lists, and purchases.
                    </p>
                </div>
            </div>

            {/* Premium Segmented Pill Navigation */}
            <div className="bg-brand-soft/80 border border-brand-border/75 p-2 rounded-2xl flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth shadow-xs">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = pathname === tab.href;
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`flex items-center gap-3 px-5 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ease-out whitespace-nowrap cursor-pointer select-none ${
                                isActive
                                    ? "bg-brand-navy text-white shadow-md shadow-brand-navy/15 scale-[1.01] border border-brand-navy/10"
                                    : "text-brand-muted hover:text-brand-text hover:bg-white/70 hover:scale-[1.01]"
                            }`}
                        >
                            <div
                                className={`p-1.5 rounded-lg transition-all duration-200 flex items-center justify-center ${
                                    isActive
                                        ? "bg-white/10 text-white"
                                        : "bg-brand-border/40 text-brand-muted group-hover:text-brand-text"
                                }`}
                            >
                                <Icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                            </div>
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
