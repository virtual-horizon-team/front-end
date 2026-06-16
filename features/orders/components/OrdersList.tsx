"use client";

import React from "react";
import Link from "next/link";
import { UserOrderDto } from "../types";
import { Calendar, Receipt, Download, Play, BookOpen, FolderArchive, HelpCircle, Lock } from "lucide-react";

interface OrdersListProps {
    orders: UserOrderDto[];
    isLoading: boolean;
}

export default function OrdersList({ orders, isLoading }: OrdersListProps) {
    if (isLoading) {
        return (
            <div className="space-y-6">
                {[1, 2].map((n) => (
                    <div
                        key={n}
                        className="w-full h-44 bg-brand-soft border border-brand-border rounded-3xl animate-shimmer"
                    />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16 bg-white border border-brand-border rounded-3xl p-8 shadow-xs max-w-lg mx-auto">
                <div className="p-4 bg-brand-soft rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 border border-brand-border">
                    <Receipt className="w-7 h-7 text-brand-muted/60" />
                </div>
                <h3 className="text-lg font-bold text-brand-navy mb-2">No Purchases Found</h3>
                <p className="text-sm text-brand-muted max-w-xs mx-auto leading-relaxed">
                    You have not made any purchases yet. Your purchased courses and assets will be listed here with receipts.
                </p>
                <div className="mt-6">
                    <Link
                        href="/courses"
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-sm font-bold shadow-md shadow-brand-primary/10 transition-all active:scale-95 cursor-pointer"
                    >
                        Explore Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                });

                const formattedTotal = new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: order.currency || "USD",
                }).format(order.totalAmount);

                return (
                    <div
                        key={order.id}
                        className="bg-white border border-brand-border/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 border-t-4 border-t-brand-primary"
                    >
                        {/* Premium Invoice Header */}
                        <div className="bg-brand-soft/40 border-b border-brand-border px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="grid grid-cols-2 sm:flex sm:items-center gap-x-8 gap-y-3">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                                        Date Ordered
                                    </span>
                                    <span className="text-sm font-extrabold text-brand-navy flex items-center gap-1.5 mt-0.5">
                                        <Calendar size={14} className="text-brand-muted" />
                                        {formattedDate}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-brand-muted tracking-wider">
                                        Invoice Receipt ID
                                    </span>
                                    <span className="text-sm font-mono font-bold text-brand-navy mt-0.5 block truncate max-w-[150px] sm:max-w-none">
                                        {order.id}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-brand-border/60">
                                <div>
                                    <span className="block text-[10px] uppercase font-bold text-brand-muted tracking-wider md:text-right">
                                        Total Amount Paid
                                    </span>
                                    <span className="text-lg font-black text-brand-navy mt-0.5 block">
                                        {formattedTotal}
                                    </span>
                                </div>
                                <span className="inline-flex px-3.5 py-1 rounded-full text-xs font-bold bg-green-50 border border-green-200 text-green-700 uppercase tracking-wide">
                                    {order.status || "Paid"}
                                </span>
                            </div>
                        </div>

                        {/* Invoice Items List */}
                        <div className="divide-y divide-brand-border/60">
                            {order.items.map((item, index) => {
                                const isCourse = !!item.courseId;
                                const title = isCourse ? item.courseTitle : item.assetFileName;
                                const isAvailable = isCourse ? item.isCourseAvailable : item.isAssetAvailable;

                                return (
                                    <div
                                        key={index}
                                        className="p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 hover:bg-brand-soft/10 transition-colors duration-150"
                                    >
                                        <div className="flex items-start gap-4 min-w-0 flex-1">
                                            {isAvailable ? (
                                                isCourse ? (
                                                    <Link 
                                                        href={`/courses/${item.courseId}`}
                                                        className="flex items-start gap-4 min-w-0 flex-1 group/item cursor-pointer"
                                                    >
                                                        {/* Beautiful item-type indicator icon */}
                                                        <div
                                                            className="p-3 rounded-2xl border shrink-0 flex items-center justify-center transition-colors duration-150 bg-indigo-50 border-indigo-100 text-indigo-600 group-hover/item:bg-indigo-100 group-hover/item:border-indigo-200"
                                                        >
                                                            <BookOpen size={20} className="stroke-[2.2]" />
                                                        </div>
                                                        
                                                        <div className="min-w-0 space-y-0.5">
                                                            <span
                                                                className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors duration-150 bg-indigo-50 border-indigo-200/50 text-indigo-700 group-hover/item:bg-indigo-100/50"
                                                            >
                                                                Course Lecture Bundle
                                                            </span>
                                                            <h4 className="text-[15px] font-extrabold text-brand-navy truncate group-hover/item:text-brand-primary transition-colors duration-150">
                                                                {title || "Unnamed Asset Resource"}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-brand-muted font-medium">
                                                                <span>Purchase Price:</span>
                                                                <span className="font-bold text-brand-text">
                                                                    ${item.priceAtPurchase.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ) : (
                                                    <a 
                                                        href={`/api/Asset/download/${item.assetId}`} 
                                                        target="_blank" 
                                                        rel="noreferrer"
                                                        className="flex items-start gap-4 min-w-0 flex-1 group/item cursor-pointer"
                                                    >
                                                        {/* Beautiful item-type indicator icon */}
                                                        <div
                                                            className="p-3 rounded-2xl border shrink-0 flex items-center justify-center transition-colors duration-150 bg-purple-50 border-purple-100 text-purple-600 group-hover/item:bg-purple-100 group-hover/item:border-purple-200"
                                                        >
                                                            <FolderArchive size={20} className="stroke-[2.2]" />
                                                        </div>
                                                        
                                                        <div className="min-w-0 space-y-0.5">
                                                            <span
                                                                className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-colors duration-150 bg-purple-50 border-purple-200/50 text-purple-700 group-hover/item:bg-purple-100/50"
                                                            >
                                                                Creator Tool Asset
                                                            </span>
                                                            <h4 className="text-[15px] font-extrabold text-brand-navy truncate group-hover/item:text-brand-primary transition-colors duration-150">
                                                                {title || "Unnamed Asset Resource"}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-brand-muted font-medium">
                                                                <span>Purchase Price:</span>
                                                                <span className="font-bold text-brand-text">
                                                                    ${item.priceAtPurchase.toFixed(2)}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </a>
                                                )
                                            ) : (
                                                <div className="flex items-start gap-4 min-w-0 flex-1 opacity-60">
                                                    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 shrink-0">
                                                        {isCourse ? <BookOpen size={20} /> : <FolderArchive size={20} />}
                                                    </div>
                                                    <div className="min-w-0 space-y-0.5">
                                                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border bg-slate-100 border-slate-200 text-slate-500">
                                                            {isCourse ? "Course Lecture Bundle" : "Creator Tool Asset"}
                                                        </span>
                                                        <h4 className="text-[15px] font-extrabold text-slate-500 truncate">
                                                            {title || "Unnamed Asset Resource"}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                            <span>Purchase Price:</span>
                                                            <span className="font-bold text-slate-500">
                                                                ${item.priceAtPurchase.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Dynamic action triggers */}
                                        <div className="shrink-0 flex items-center justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
                                            {isAvailable ? (
                                                isCourse ? (
                                                    <Link
                                                        href={`/courses/${item.courseId}`}
                                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-navy hover:bg-brand-navy/95 text-white text-xs font-bold transition-all shadow-sm shadow-brand-navy/10 cursor-pointer active:scale-95 hover:scale-[1.01]"
                                                    >
                                                        <Play size={12} fill="white" className="stroke-none" />
                                                        <span>Start Learning</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={`/api/Asset/download/${item.assetId}`}
                                                        target="_blank"
                                                        className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold transition-all shadow-sm shadow-brand-primary/10 cursor-pointer active:scale-95 hover:scale-[1.01]"
                                                    >
                                                        <Download size={13} className="stroke-[2.5]" />
                                                        <span>Download Asset</span>
                                                    </Link>
                                                )
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-xs font-bold select-none">
                                                    <Lock size={13} className="stroke-[2.5]" />
                                                    Unavailable
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
