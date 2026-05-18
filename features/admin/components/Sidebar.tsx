"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { ADMIN_NAV_ITEMS } from "../types/navigation";
import { logoutUser } from "@/features/auth/actions/logout";

interface SidebarProps {
    userName?: string;
    email?: string;
}

export default function Sidebar({ userName = "Admin User", email = "admin@virtualhorizon.com" }: SidebarProps) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 rounded-lg bg-brand-navy text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                aria-label="Toggle sidebar"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar Element */}
            <aside
                className={`
                    fixed top-0 left-0 z-50 h-screen w-[260px] bg-white border-r border-brand-border/70 text-brand-muted
                    flex flex-col transition-transform duration-300 ease-in-out
                    lg:translate-x-0
                    ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
                `}
            >
                {/* Brand Logo & Name */}
                <div className="px-6 pt-8 pb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c3 3 9 3 12 0v-5" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-[17px] font-bold text-brand-navy leading-none tracking-tight">Virtual Horizon</h1>
                        <p className="text-[12px] text-brand-muted font-semibold mt-1">Admin Dashboard</p>
                    </div>
                </div>

                {/* Main Navigation Links */}
                <nav className="flex-1 px-4 py-2 overflow-y-auto">
                    <ul className="space-y-1.5">
                        {ADMIN_NAV_ITEMS.map((item) => {
                            const active = isActive(item.href);
                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 h-11 rounded-xl text-[14px] font-semibold
                                            transition-all duration-200 group
                                            ${active
                                                ? "bg-brand-primary/10 text-brand-primary shadow-sm"
                                                : "text-brand-muted hover:text-brand-navy hover:bg-brand-soft/50"
                                            }
                                        `}
                                    >
                                        <item.icon 
                                            size={18} 
                                            className={`transition-colors ${active ? "text-brand-primary" : "text-brand-muted group-hover:text-brand-navy"}`} 
                                        />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Bottom Admin User Profile info and Logout */}
                <div className="px-4 pb-6 pt-4 border-t border-brand-border/70 space-y-3">
                    <div className="flex items-center gap-3 px-2 py-1">
                        <div className="w-10 h-10 rounded-full bg-brand-primary/10 border border-brand-primary/20 text-brand-primary flex items-center justify-center font-bold text-sm uppercase">
                            {userName.slice(0, 2)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-brand-navy truncate leading-tight">{userName}</p>
                            <p className="text-[11px] text-brand-muted truncate mt-0.5">{email}</p>
                        </div>
                    </div>

                    {/* Logout Button */}
                    <form action={logoutUser}>
                        <button
                            type="submit"
                            className="w-full flex items-center gap-3 px-4 h-11 rounded-xl text-[14px] font-semibold
                                       text-brand-muted hover:text-red-600 hover:bg-red-50 transition-all duration-200 cursor-pointer group"
                        >
                            <LogOut size={18} className="text-brand-muted group-hover:text-red-600 transition-colors" />
                            Log Out
                        </button>
                    </form>
                </div>
            </aside>
        </>
    );
}
