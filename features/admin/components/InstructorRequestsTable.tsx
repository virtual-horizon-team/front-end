"use client";

import { Search, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { InstructorRequest } from "../lib/instructor-request-api";

interface InstructorRequestsTableProps {
    requests: InstructorRequest[];
    loading: boolean;
    searchTerm: string;
    onSearchChange: (value: string) => void;
    statusFilter: "all" | "pending" | "approved" | "rejected";
    onStatusFilterChange: (value: "all" | "pending" | "approved" | "rejected") => void;
    processingId: string | null;
    onViewDocuments: (req: InstructorRequest) => void;
    onApprove: (id: string, name: string) => void;
    onReject: (id: string, name: string) => void;
}

export default function InstructorRequestsTable({
    requests,
    loading,
    searchTerm,
    onSearchChange,
    statusFilter,
    onStatusFilterChange,
    processingId,
    onViewDocuments,
    onApprove,
    onReject
}: InstructorRequestsTableProps) {
    
    // Filter requests client-side based on search term and status tab
    const filteredRequests = requests.filter(req => {
        const name = req.name || req.user?.userName || "Applicant";
        const email = req.user?.email || "N/A";

        const matchesSearch = 
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            email.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = 
            statusFilter === "all" || 
            req.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-brand-border/70 overflow-hidden animate-fade-in">
            {/* Filters & Search Header */}
            <div className="p-6 border-b border-brand-border/70 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
                {/* Status filter tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    {(["all", "pending", "approved", "rejected"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => onStatusFilterChange(tab)}
                            className={`
                                px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer
                                ${statusFilter === tab 
                                    ? "bg-white text-brand-primary shadow-sm" 
                                    : "text-brand-muted hover:text-brand-navy"
                                }
                            `}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Search bar inputs */}
                <div className="relative max-w-sm w-full">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brand-muted gap-3">
                        <Loader2 className="animate-spin text-brand-primary" size={32} />
                        <p className="text-sm font-semibold">Updating requests...</p>
                    </div>
                ) : filteredRequests.length === 0 ? (
                    <div className="py-16 text-center text-brand-muted">
                        <p className="text-sm font-semibold">No applications found matching search criteria.</p>
                    </div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-brand-soft/20 border-b border-brand-border/70">
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Applied Date</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-brand-border/60">
                            {filteredRequests.map((req) => {
                                const statusLower = req.status.toLowerCase();
                                const isPending = statusLower === "pending";
                                const isApproved = statusLower === "approved";
                                const isRejected = statusLower === "rejected";
                                const displayName = req.name || req.user?.userName || "Applicant";
                                const emailAddress = req.user?.email || "N/A";

                                return (
                                    <tr key={req.id} className="hover:bg-brand-soft/10 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-brand-soft border border-brand-border/60 flex items-center justify-center font-bold text-brand-primary text-[13px] uppercase">
                                                    {displayName.slice(0, 2)}
                                                </div>
                                                <span className="text-sm font-bold text-brand-navy">{displayName}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-brand-muted font-medium">{emailAddress}</td>
                                        <td className="px-6 py-4 text-sm text-brand-muted font-medium">
                                            {new Date(req.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase
                                                ${isPending ? "bg-amber-50 text-amber-700" : ""}
                                                ${isApproved ? "bg-green-50 text-green-700" : ""}
                                                ${isRejected ? "bg-red-50 text-red-700" : ""}
                                            `}>
                                                {req.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2.5">
                                                {isPending ? (
                                                    <>
                                                        <button 
                                                            onClick={() => onViewDocuments(req)}
                                                            disabled={processingId === req.id}
                                                            className="text-brand-primary hover:bg-brand-primary/5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                                        >
                                                            View Files
                                                        </button>
                                                        <button 
                                                            onClick={() => onApprove(req.id, displayName)}
                                                            disabled={processingId !== null}
                                                            className="bg-brand-primary text-white hover:bg-brand-hover px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all hover:shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-1"
                                                        >
                                                            {processingId === req.id ? (
                                                                <Loader2 size={12} className="animate-spin" />
                                                            ) : null}
                                                            Approve
                                                        </button>
                                                        <button 
                                                            onClick={() => onReject(req.id, displayName)}
                                                            disabled={processingId !== null}
                                                            className="border border-red-200 text-red-600 hover:bg-red-50 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                                        >
                                                            Reject
                                                        </button>
                                                    </>
                                                ) : (
                                                    <span className="text-[12px] font-semibold text-brand-muted italic px-3">
                                                        Processed
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Table footer / Pagination (Mocked dynamically) */}
            <div className="px-6 py-4 border-t border-brand-border/70 flex items-center justify-between bg-gray-50/50">
                <p className="text-xs font-bold text-brand-muted">
                    Showing {filteredRequests.length} of {requests.length} applications
                </p>
                <div className="flex items-center gap-2">
                    <button disabled className="p-1.5 rounded-lg border border-brand-border/80 bg-white text-brand-muted hover:bg-brand-soft/20 disabled:opacity-50">
                        <ChevronLeft size={16} />
                    </button>
                    <button disabled className="p-1.5 rounded-lg border border-brand-border/80 bg-white text-brand-muted hover:bg-brand-soft/20 disabled:opacity-50">
                        <ChevronRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
