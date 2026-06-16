"use client";

import React from "react";
import Link from "next/link";
import { Briefcase, FileCheck, ArrowRight, Layers, CheckCircle2, Clock, XCircle, AlertTriangle } from "lucide-react";

interface LinkedContractCardProps {
  milestoneId: string;
  milestoneTitle: string;
  contractId: string;
  contractStatus: string | number;
  jobPostingId: string;
  jobTitle: string;
}

const CONTRACT_STATUS: Record<string | number, { label: string; css: string; icon: React.ReactNode }> = {
  0: { label: "Active", css: "bg-blue-500/10 border-blue-500/20 text-blue-400", icon: <Clock className="w-3 h-3" /> },
  "Active": { label: "Active", css: "bg-blue-500/10 border-blue-500/20 text-blue-400", icon: <Clock className="w-3 h-3" /> },
  1: { label: "Completed", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  "Completed": { label: "Completed", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  2: { label: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" /> },
  "Cancelled": { label: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400", icon: <XCircle className="w-3 h-3" /> },
  3: { label: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400", icon: <AlertTriangle className="w-3 h-3" /> },
  "Disputed": { label: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400", icon: <AlertTriangle className="w-3 h-3" /> },
};

export default function LinkedContractCard({
  milestoneTitle,
  contractId,
  contractStatus,
  jobPostingId,
  jobTitle,
}: LinkedContractCardProps) {
  const status = CONTRACT_STATUS[contractStatus] || CONTRACT_STATUS[0];

  return (
    <div className="bg-[#121826]/60 border border-marketplace-border/80 backdrop-blur-md rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-marketplace-border/50 flex items-center gap-2">
        <Briefcase className="w-4 h-4 text-marketplace-primary" />
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
          Linked Freelance Contract
        </h3>
        <span className="w-1.5 h-1.5 rounded-full bg-marketplace-primary/80 animate-pulse" />
      </div>

      <div className="p-6 space-y-5">
        {/* Job Title */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Job Posting</span>
          <Link
            href={`/marketplace/jobs/${jobPostingId}`}
            className="flex items-center gap-2 group"
          >
            <Layers className="w-4 h-4 text-slate-400 group-hover:text-marketplace-primary transition-colors shrink-0" />
            <span className="text-sm font-bold text-white group-hover:text-marketplace-primary transition-colors line-clamp-1">
              {jobTitle}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-marketplace-primary transition-colors shrink-0 ml-auto" />
          </Link>
        </div>

        {/* Milestone */}
        <div className="space-y-1.5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Delivered Milestone</span>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-sm font-semibold text-slate-200">
              {milestoneTitle}
            </span>
          </div>
        </div>

        {/* Contract Status + Link */}
        <div className="flex items-center justify-between pt-3 border-t border-marketplace-border/40">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Contract Status</span>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${status.css}`}>
              {status.icon}
              {status.label}
            </span>
          </div>

          <Link
            href={`/marketplace/contracts/${contractId}`}
            className="inline-flex items-center gap-1.5 bg-[#0a0f1d] hover:bg-[#0d1320] border border-marketplace-border hover:border-marketplace-primary/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all group"
          >
            View Contract
            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-marketplace-primary transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}
