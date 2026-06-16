"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import { getSession } from "@/features/auth/lib/get-session";
import {
  FileText, ArrowRight, DollarSign, Calendar, Clock,
  AlertCircle, Loader2, RefreshCw, CheckCircle2, ShieldAlert
} from "lucide-react";

interface ContractMilestoneDto {
  id: string;
  title: string;
  status: string | number; // 0 = Pending, 1 = Delivered, 2 = Approved
}

interface JobContractDto {
  id: string;
  jobPostingId: string;
  proposalId: string;
  clientId: string;
  freelancerId: string;
  totalAmount: number;
  status: string | number;
  createdAt: string;
  completedAt: string | null;
  milestones: ContractMilestoneDto[];
}

const CONTRACT_STATUS_LABELS: Record<string | number, { text: string; css: string }> = {
  0: { text: "Active", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "Active": { text: "Active", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  1: { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  "Completed": { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  2: { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  "Cancelled": { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  3: { text: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  "Disputed": { text: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" }
};

export default function MyContractsPage() {
  const [contracts, setContracts] = useState<JobContractDto[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContracts = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get current user session
      const manifest = await api<{ userId: string }>("api/Profile/manifest");
      if (manifest?.userId) {
        setCurrentUserId(manifest.userId);
      }

      const data = await api<JobContractDto[]>("api/contracts");
      setContracts(data || []);
    } catch (e: any) {
      console.error("Failed to fetch contracts:", e);
      setError(e.message || "Failed to retrieve your active contracts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "85rem" }}>
      {/* ── Header ── */}
      <div className="border-b border-marketplace-border pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <FileText className="w-7 h-7 text-marketplace-primary" />
          My Escrow Contracts
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Review, deliver, and authorize fund payouts on active project milestones and VR assets.
        </p>
      </div>

      {/* ── Main Content Area ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-marketplace-primary animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading escrow contracts...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Retrieval Failed</h3>
            <p className="text-xs text-slate-400 font-medium">{error}</p>
            <button
              onClick={fetchContracts}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-marketplace-primary hover:underline mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        </div>
      ) : contracts.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0f1d] border border-marketplace-border rounded-3xl space-y-4">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Active Contracts</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              You do not have any active escrow contracts. Contracts are created automatically when a client accepts a freelancer's proposal.
            </p>
          </div>
          <Link
            href="/marketplace/jobs"
            className="inline-flex items-center gap-2 bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Browse Freelance Hub
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contracts.map((contract) => {
            const statusInfo = CONTRACT_STATUS_LABELS[contract.status] || {
              text: "Unknown Status",
              css: "bg-slate-500/10 border-slate-500/20 text-slate-400"
            };

            const isClient = contract.clientId === currentUserId;
            const roleLabel = isClient ? "Client / Employer" : "Freelancer / Developer";
            const roleCss = isClient
              ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";

            // Count approved milestones
            const approvedMilestones = contract.milestones?.filter(
              (m) => m.status === 2 || m.status === "Approved"
            ).length || 0;
            const totalMilestones = contract.milestones?.length || 0;

            return (
              <div
                key={contract.id}
                className="bg-[#0a0f1d] border border-marketplace-border hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-250 shadow-md group"
              >
                <div className="space-y-4">
                  {/* Status & Date */}
                  <div className="flex justify-between items-start gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.css}`}>
                      {statusInfo.text}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(contract.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Role & ID */}
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border ${roleCss}`}>
                        {roleLabel}
                      </span>
                    </div>

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wide leading-tight truncate">
                      Contract Ref: <span className="text-white font-mono">{contract.id}</span>
                    </h3>
                  </div>

                  {/* Milestones Progress Bar */}
                  {totalMilestones > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-400">
                        <span>Milestone Progress</span>
                        <span className="text-white">
                          {approvedMilestones} / {totalMilestones} Approved
                        </span>
                      </div>
                      <div className="w-full bg-[#121826]/80 h-1.5 rounded-full overflow-hidden border border-white/5">
                        <div
                          className="bg-marketplace-primary h-full transition-all duration-300"
                          style={{ width: `${(approvedMilestones / totalMilestones) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-marketplace-border/50 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Escrow Funded</p>
                    <p className="text-sm font-black text-emerald-400 flex items-center">
                      <DollarSign className="w-4 h-4 -ml-1 shrink-0" />
                      {contract.totalAmount.toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/marketplace/contracts/${contract.id}`}
                    className="inline-flex items-center gap-1.5 bg-[#121826]/80 hover:bg-[#1a2336] text-white border border-marketplace-border px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    Manage Contract <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
