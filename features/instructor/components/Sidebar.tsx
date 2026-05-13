"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { MAIN_NAV_ITEMS, BOTTOM_NAV_ITEMS } from "../types/navigation";
import { logoutUser } from "@/features/auth/actions/logout";

export default function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-brand-navy text-white shadow-lg"
                aria-label="Toggle sidebar"
            >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            {/* Overlay for mobile */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/50 z-40"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-[260px] bg-brand-navy border-r border-brand-border/50 text-brand-muted
                    flex flex-col transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Brand */}
                <div className="px-6 pt-7 pb-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white leading-tight tracking-wide">Virtual Horizon</h1>
                        <p className="text-[13px] text-brand-muted font-medium">Instructor Portal</p>
                    </div>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 px-3 py-4 overflow-y-auto">
                    <ul className="space-y-1">
                        {MAIN_NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-3 h-11 border border-transparent rounded-lg text-[14px] font-medium
                                            transition-colors duration-200 group
                                            ${active
                                                ? "bg-brand-primary text-white"
                                                : "text-brand-muted hover:text-white hover:bg-white/10"
                                            }
                                        `}
                                    >
                                        <item.icon size={18} className={`transition-colors ${active ? "text-white" : "text-brand-muted group-hover:text-brand-muted"}`} />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom Section */}
                <div className="px-3 pb-6 pt-4 space-y-1">
                    {BOTTOM_NAV_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`
                                flex items-center gap-3 px-3 h-11 border border-transparent rounded-lg text-[14px] font-medium
                                transition-colors duration-200 group
                                ${isActive(item.href)
                                    ? "bg-brand-primary text-white"
                                    : "text-brand-muted hover:text-white hover:bg-white/10"
                                }
                            `}
                        >
                            <item.icon size={18} className={`transition-colors ${isActive(item.href) ? "text-white" : "text-brand-muted group-hover:text-brand-muted"}`} />
                            {item.label}
                        </Link>
                    ))}

                    {/* Logout */}
                    <form action={logoutUser}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-3 h-11 rounded-lg text-[14px] font-medium
                                       text-brand-muted hover:text-red-400 hover:bg-white/10 transition-colors duration-200 cursor-pointer group"
                        >
                            <LogOut size={18} className="text-brand-muted group-hover:text-red-400 transition-colors" />
                            Log Out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
