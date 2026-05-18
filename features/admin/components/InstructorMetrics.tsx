"use client";

import { UserCheck, Clock, CheckCircle2 } from "lucide-react";

interface InstructorMetricsProps {
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
}

export default function InstructorMetrics({
    totalCount,
    pendingCount,
    approvedCount
}: InstructorMetricsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Requests Card */}
            <div className="bg-white border border-brand-border/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform duration-300">
                    <UserCheck size={24} />
                </div>
                <div>
                    <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wider">Total Applications</p>
                    <p className="text-2xl font-extrabold text-brand-navy mt-1">{totalCount}</p>
                </div>
            </div>

            {/* Pending Requests Card */}
            <div className="bg-white border border-brand-border/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform duration-300">
                    <Clock size={24} />
                </div>
                <div>
                    <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wider">Pending Review</p>
                    <p className="text-2xl font-extrabold text-brand-navy mt-1">{pendingCount}</p>
                </div>
            </div>

            {/* Approved Requests Card */}
            <div className="bg-white border border-brand-border/70 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-5 group">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-300">
                    <CheckCircle2 size={24} />
                </div>
                <div>
                    <p className="text-[12px] font-bold text-brand-muted uppercase tracking-wider">Approved Instructors</p>
                    <p className="text-2xl font-extrabold text-brand-navy mt-1">{approvedCount}</p>
                </div>
            </div>
        </div>
    );
}
