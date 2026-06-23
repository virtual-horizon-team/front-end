"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import {
  ShieldCheck, ArrowLeft, DollarSign, Calendar, Clock, AlertCircle,
  Loader2, CheckCircle2, ChevronRight, ClipboardList, Send, Eye,
  Lock, Unlock, RefreshCw, X, Box, Star, Info
} from "lucide-react";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
  isAdmin?: boolean;
}

interface ContractMilestoneDto {
  id: string;
  jobContractId: string;
  title: string;
  description: string | null;
  amount: number;
  orderIndex: number;
  status: string | number;
  deliveredAt: string | null;
  approvedAt: string | null;
  revokedAt: string | null;
  deliveredAssetIds: string[];
  
  // New Escrow fields
  isFunded: boolean;
  fundedAt?: string | null;
  revisionNote?: string | null;
}

interface JobContractDto {
  id: string;
  jobPostingId: string;
  proposalId: string;
  clientId: string;
  clientName?: string;
  clientAvatarUrl?: string;
  freelancerId: string;
  freelancerName?: string;
  freelancerAvatarUrl?: string;
  totalAmount: number;
  status: string | number; // 0 = Active, 1 = Completed, 2 = Cancelled, 3 = Disputed
  createdAt: string;
  completedAt: string | null;
  milestones: ContractMilestoneDto[];
}

interface FreelancerAsset {
  assetID: string;
  fileName: string;
  description: string | null;
  userId: string;
  price: number;
  isListedInStore: boolean;
}

interface ContractDetailsClientProps {
  contractId: string;
  session?: SessionData;
}

const CONTRACT_STATUS_LABELS: Record<string | number, { text: string; css: string }> = {
  0: { text: "Active", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  "Active": { text: "Active", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  1: { text: "Completed", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "Completed": { text: "Completed", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  2: { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  "Cancelled": { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  3: { text: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  "Disputed": { text: "Disputed", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" }
};

const MILESTONE_STATUS_LABELS: Record<string | number, { text: string; css: string; dot: string }> = {
  0: { text: "Pending Funding", css: "bg-slate-800 border-slate-700 text-slate-400", dot: "bg-slate-600" },
  "Pending": { text: "Pending Funding", css: "bg-slate-800 border-slate-700 text-slate-400", dot: "bg-slate-600" },
  1: { text: "Delivered (Preview Active)", css: "bg-amber-500/10 border-amber-500/20 text-amber-400", dot: "bg-amber-500" },
  "Delivered": { text: "Delivered (Preview Active)", css: "bg-amber-500/10 border-amber-500/20 text-amber-400", dot: "bg-amber-500" },
  2: { text: "Preview Revoked", css: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-500" },
  "Revoked": { text: "Preview Revoked", css: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-500" },
  3: { text: "Approved & Paid", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-500" },
  "Approved": { text: "Approved & Paid", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400", dot: "bg-emerald-500" },
  4: { text: "Rejected", css: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-500" },
  "Rejected": { text: "Rejected", css: "bg-red-500/10 border-red-500/20 text-red-400", dot: "bg-red-500" },
  5: { text: "Funded (Awaiting Delivery)", css: "bg-blue-500/10 border-blue-500/20 text-blue-400", dot: "bg-blue-500" },
  "Funded": { text: "Funded (Awaiting Delivery)", css: "bg-blue-500/10 border-blue-500/20 text-blue-400", dot: "bg-blue-500" },
  6: { text: "Under Revision", css: "bg-orange-500/10 border-orange-500/20 text-orange-400", dot: "bg-orange-500" },
  "UnderRevision": { text: "Under Revision", css: "bg-orange-500/10 border-orange-500/20 text-orange-400", dot: "bg-orange-500" },
};

export default function ContractDetailsClient({ contractId, session }: ContractDetailsClientProps) {
  const router = useRouter();

  const [contract, setContract] = useState<JobContractDto | null>(null);
  const [myAssets, setMyAssets] = useState<FreelancerAsset[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Wallet Balance
  const [walletBalance, setWalletBalance] = useState<number | null>(null);

  // Delivery Modal State
  const [deliveryModalMilestone, setDeliveryModalMilestone] = useState<ContractMilestoneDto | null>(null);
  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [daysValid, setDaysValid] = useState("3");
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // Revision Modal State
  const [revisionModalMilestone, setRevisionModalMilestone] = useState<ContractMilestoneDto | null>(null);
  const [revisionNote, setRevisionNote] = useState("");
  const [revisionError, setRevisionError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const isFreelancer = session && contract && session.userId === contract.freelancerId;
  const isClient = session && contract && session.userId === contract.clientId;

  const loadContractDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<JobContractDto>(`api/contracts/${contractId}`);
      setContract(data);
    } catch (e: any) {
      console.warn("Failed to load contract details:", e);
      setError(e.message || "Failed to load contract workspace.");
    } finally {
      setLoading(false);
    }
  }, [contractId]);

  const loadWalletBalance = useCallback(async () => {
    try {
      const wallet = await api<{ balance: number }>("api/Wallet/my-wallet");
      setWalletBalance(wallet?.balance ?? 0);
    } catch (e) {
      console.warn("Failed to fetch wallet balance:", e);
    }
  }, []);

  useEffect(() => {
    loadContractDetails();
    loadWalletBalance();
  }, [loadContractDetails, loadWalletBalance]);

  const handleFundMilestone = async (milestoneId: string, title: string, amount: number) => {
    if (walletBalance !== null && walletBalance < amount) {
      const topupConfirm = window.confirm(
        `Insufficient Wallet Balance!\n\nYour balance: $${walletBalance.toFixed(2)}\nMilestone cost: $${amount.toFixed(2)}\n\nWould you like to go to your wallet page to top up?`
      );
      if (topupConfirm) {
        router.push("/wallet");
      }
      return;
    }

    if (!window.confirm(`Are you sure you want to fund milestone '${title}' for $${amount.toFixed(2)}?\nThis will move the funds into platform escrow.`)) {
      return;
    }

    setActionLoading(`fund-${milestoneId}`);
    try {
      await api<any>(`api/contracts/milestones/${milestoneId}/fund`, {
        method: "POST"
      });
      showToast(`Milestone '${title}' funded successfully!`, "success");
      loadContractDetails();
      loadWalletBalance();
    } catch (e: any) {
      console.warn("Failed to fund milestone:", e);
      showToast(e.message || "Failed to fund milestone.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleOpenRevisionModal = (milestone: ContractMilestoneDto) => {
    setRevisionModalMilestone(milestone);
    setRevisionNote("");
    setRevisionError(null);
  };

  const handleCloseRevisionModal = () => {
    setRevisionModalMilestone(null);
    setRevisionError(null);
  };

  const handleSubmitRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionModalMilestone) return;
    if (!revisionNote.trim()) {
      setRevisionError("Please enter revision instructions.");
      return;
    }

    setActionLoading("revising");
    try {
      await api<any>(`api/contracts/milestones/${revisionModalMilestone.id}/request-revision`, {
        method: "POST",
        body: JSON.stringify({
          note: revisionNote
        })
      });

      showToast(`Revision requested for '${revisionModalMilestone.title}'`, "success");
      handleCloseRevisionModal();
      loadContractDetails();
    } catch (e: any) {
      console.warn("Revision request failed:", e);
      setRevisionError(e.message || "Revision request submission failed.");
    } finally {
      setActionLoading(null);
    }
  };

  // Load Freelancer Assets for Delivery Selector
  const loadFreelancerAssets = async () => {
    if (!session) return;
    setAssetsLoading(true);
    setDeliveryError(null);
    try {
      const allAssets = await api<any[]>("api/Asset/Display?displayMode=All");
      // Filter assets created/uploaded by the current user
      const owned = allAssets.filter(a => a.userId === session.userId);
      setMyAssets(owned || []);
      if (owned && owned.length > 0) {
        setSelectedAssetId(owned[0].assetID);
      }
    } catch (e: any) {
      console.warn("Failed to load assets:", e);
      setDeliveryError("Could not retrieve your uploaded assets list.");
    } finally {
      setAssetsLoading(false);
    }
  };

  const handleOpenDeliveryModal = (milestone: ContractMilestoneDto) => {
    setDeliveryModalMilestone(milestone);
    setSelectedAssetId("");
    setDaysValid("3");
    loadFreelancerAssets();
  };

  const handleCloseDeliveryModal = () => {
    setDeliveryModalMilestone(null);
    setMyAssets([]);
    setDeliveryError(null);
  };

  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliveryModalMilestone || !selectedAssetId) {
      setDeliveryError("Please select an asset to deliver.");
      return;
    }

    const days = parseInt(daysValid, 10);
    if (isNaN(days) || days <= 0) {
      setDeliveryError("Days valid must be a positive number.");
      return;
    }

    setActionLoading("delivering");
    try {
      await api<any>(`api/contracts/milestones/${deliveryModalMilestone.id}/deliver`, {
        method: "POST",
        body: JSON.stringify({
          assetId: selectedAssetId,
          daysValid: days
        })
      });

      showToast(`Milestone '${deliveryModalMilestone.title}' delivered!`, "success");
      handleCloseDeliveryModal();
      loadContractDetails();
    } catch (e: any) {
      console.warn("Delivery failed:", e);
      setDeliveryError(e.message || "Delivery submission failed.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokePreview = async (milestoneId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to revoke client preview access for milestone '${title}'?`)) {
      return;
    }

    setActionLoading(`revoke-${milestoneId}`);
    try {
      await api<any>(`api/contracts/milestones/${milestoneId}/revoke-preview`, {
        method: "POST"
      });
      showToast("Preview access revoked successfully.", "success");
      loadContractDetails();
    } catch (e: any) {
      console.warn("Failed to revoke preview:", e);
      showToast(e.message || "Failed to revoke preview.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleApproveMilestone = async (milestoneId: string, title: string, amount: number) => {
    const confirmMessage = `Approve Milestone and Release Funds?

This will:
1. Debit $${amount.toFixed(2)} from your wallet.
2. Credit $${amount.toFixed(2)} directly to the freelancer's wallet.
3. Grant you permanent ownership of the delivered asset.

Are you sure you want to proceed?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setActionLoading(`approve-${milestoneId}`);
    try {
      await api<any>(`api/contracts/milestones/${milestoneId}/approve`, {
        method: "POST"
      });
      showToast(`Milestone '${title}' approved! Funds released.`, "success");
      loadContractDetails();
    } catch (e: any) {
      console.warn("Failed to approve milestone:", e);
      showToast(e.message || "Approval failed. Check wallet balance.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-marketplace-primary" />
          <span className="text-xs font-bold text-slate-400">Loading Workspace...</span>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <main className="w-full mx-auto px-6 py-10 flex-grow flex flex-col justify-center items-center" style={{ maxWidth: "45rem" }}>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h2 className="text-lg font-bold text-white">Failed to Load Contract</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {error || "The requested contract details are unavailable or you do not have permission to view them."}
          </p>
          <button
            onClick={() => router.push("/marketplace/jobs")}
            className="inline-flex items-center gap-1 bg-white/5 border border-white/10 text-xs font-bold px-4 py-2.5 rounded-xl text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Hub
          </button>
        </div>
      </main>
    );
  }

  const contractStatusMeta = CONTRACT_STATUS_LABELS[contract.status] || { text: "Unknown", css: "bg-slate-500/10 text-slate-400" };
  // Backend enum: Pending=0, Delivered=1, Revoked=2, Approved=3, Rejected=4, Funded=5, UnderRevision=6
  const approvedMilestonesCount = contract.milestones.filter(m => m.status === "Approved" || m.status === 3).length;
  const progressPercent = Math.round((approvedMilestonesCount / contract.milestones.length) * 100) || 0;

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "85rem" }}>
      
      {/* ── Toast Alert ── */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full animate-in fade-in slide-in-from-bottom-2 duration-350">
          <div
            className={`flex items-start gap-3 px-4 py-3.5 rounded-xl border shadow-2xl backdrop-blur-md ${
              toast.type === "success"
                ? "bg-[#0f1623] border-emerald-500/30 text-emerald-400"
                : "bg-[#0f1623] border-red-500/30 text-red-400"
            }`}
          >
            {toast.type === "success" ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="text-xs font-semibold flex-1 leading-relaxed">{toast.message}</p>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 border-b border-marketplace-border pb-6">
        <button
          onClick={() => router.push("/marketplace/jobs")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Freelance Hub
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${contractStatusMeta.css}`}>
                {contractStatusMeta.text} Contract
              </span>
              <span className="text-xs text-slate-500 font-bold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Started: {new Date(contract.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-none flex items-center gap-2">
              <ShieldCheck className="w-8 h-8 text-marketplace-primary" />
              Contract Escrow Workspace
            </h1>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              ID: <span className="font-mono text-slate-355">{contract.id}</span>
            </p>
          </div>

          <div className="flex gap-4">
            <div className="bg-[#0a0f1d] border border-marketplace-border p-4 rounded-2xl flex flex-col justify-center min-w-36 md:text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Released Escrow</span>
              <span className="text-base font-black text-emerald-400 flex items-center md:justify-end">
                <DollarSign className="w-4 h-4 shrink-0 -ml-0.5" />
              {contract.milestones.filter(m => m.status === "Approved" || m.status === 3).reduce((sum, m) => sum + m.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="bg-[#0a0f1d] border border-marketplace-border p-4 rounded-2xl flex flex-col justify-center min-w-36 md:text-right">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Escrow Total</span>
              <span className="text-base font-black text-white flex items-center md:justify-end">
                <DollarSign className="w-4 h-4 shrink-0 -ml-0.5" />
                {contract.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Side: Milestones Tracker & Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Progress Banner */}
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 space-y-3.5">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="text-slate-300">Contract Completion Roadmap</span>
              <span className="text-marketplace-primary">{approvedMilestonesCount} of {contract.milestones.length} Milestones Released</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full bg-[#121826] h-2.5 rounded-full overflow-hidden border border-marketplace-border/50">
              <div
                className="bg-marketplace-primary h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Milestones Timeline */}
          <div className="space-y-4">
            {contract.milestones.map((m, index) => {
              const statusMeta = MILESTONE_STATUS_LABELS[m.status] || { text: "Unknown", css: "bg-slate-500/10 text-slate-400", dot: "bg-slate-500" };
              // Backend enum: Pending=0, Delivered=1, Revoked=2, Approved=3, Rejected=4, Funded=5, UnderRevision=6
              const isApproved = m.status === "Approved" || m.status === 3;
              const isFunded = m.status === "Funded" || m.status === 5;
              const isDelivered = m.status === "Delivered" || m.status === 1;
              const isPending = m.status === "Pending" || m.status === 0;
              const isUnderRevision = m.status === "UnderRevision" || m.status === 6;
              const isRevoked = m.status === "Revoked" || m.status === 2;

              return (
                <div
                  key={m.id}
                  className={`border rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center relative transition-all ${
                    isApproved
                      ? "bg-[#091510]/30 border-emerald-500/20"
                      : isDelivered
                      ? "bg-[#16130b]/20 border-amber-500/20"
                      : isFunded
                      ? "bg-[#0b1020]/30 border-blue-500/20"
                      : isUnderRevision
                      ? "bg-[#1b120c]/20 border-orange-500/20"
                      : "bg-[#0a0f1d] border-marketplace-border"
                  }`}
                >
                  <div className="flex gap-4">
                    {/* Circle counter */}
                    <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isApproved
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-[#121826] border-marketplace-border text-slate-400"
                    }`}>
                      {index + 1}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-white tracking-tight">{m.title}</h3>
                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${statusMeta.css}`}>
                          {statusMeta.text}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 font-semibold leading-relaxed max-w-lg">
                        {m.description || "No description provided for this milestone."}
                      </p>
                      {/* Dates details */}
                      {isApproved && m.approvedAt && (
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approved on {new Date(m.approvedAt).toLocaleDateString()}
                        </span>
                      )}
                      {m.isFunded && m.fundedAt && (
                        <span className="text-[10px] text-blue-400 font-semibold flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          Funded on {new Date(m.fundedAt).toLocaleDateString()}
                        </span>
                      )}
                      {isDelivered && m.deliveredAt && (
                        <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          Delivered on {new Date(m.deliveredAt).toLocaleDateString()}
                        </span>
                      )}
                      {/* Revision feedback note */}
                      {isUnderRevision && m.revisionNote && (
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3.5 mt-2 flex items-start gap-2 max-w-lg">
                          <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 block">Revision Request Feedback</span>
                            <p className="text-xs text-slate-300 font-medium leading-relaxed">{m.revisionNote}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Price */}
                  <div className="flex md:flex-col items-end justify-between w-full md:w-auto gap-4 border-t md:border-t-0 border-marketplace-border/50 pt-4 md:pt-0 shrink-0">
                    <div className="flex flex-col md:text-right">
                      <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide">Budget Allocation</span>
                      <span className="text-base font-black text-emerald-400">${m.amount.toFixed(2)}</span>
                    </div>

                    {/* Conditional Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Freelancer actions: Deliver Pending (disabled, waiting for fund) */}
                      {isFreelancer && isPending && (
                        <div className="flex flex-col items-end gap-1">
                          <button
                            disabled={true}
                            title="Waiting for the client to fund this milestone."
                            className="bg-slate-700/30 text-slate-500 border border-slate-700/50 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 cursor-not-allowed opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Deliver Work
                          </button>
                          <span className="text-[9px] text-amber-500 font-bold max-w-[150px] text-right leading-tight">
                            Waiting for client funding
                          </span>
                        </div>
                      )}

                      {/* Freelancer actions: Deliver Funded/UnderRevision/Revoked */}
                      {isFreelancer && (isFunded || isUnderRevision || isRevoked) && (
                        <button
                          onClick={() => handleOpenDeliveryModal(m)}
                          className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 transition-transform active:scale-95 duration-100 cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5" />
                          Deliver Work
                        </button>
                      )}

                      {/* Freelancer actions: Revoke Preview */}
                      {isFreelancer && isDelivered && (
                        <button
                          disabled={actionLoading === `revoke-${m.id}`}
                          onClick={() => handleRevokePreview(m.id, m.title)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Revoke Preview
                        </button>
                      )}

                      {/* Client actions: Fund Milestone */}
                      {isClient && isPending && (
                        <button
                          disabled={actionLoading === `fund-${m.id}`}
                          onClick={() => handleFundMilestone(m.id, m.title, m.amount)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 transition-transform active:scale-95 duration-100 disabled:opacity-50 cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Fund Milestone
                        </button>
                      )}

                      {/* Client actions: Review & Approve */}
                      {isClient && isDelivered && (
                        <div className="flex items-center gap-2 flex-wrap">
                          {m.deliveredAssetIds && m.deliveredAssetIds.length > 0 && (
                            <Link
                              href={`/marketplace/assets/${m.deliveredAssetIds[0]}`}
                              className="bg-white/5 hover:bg-white/10 text-white border border-marketplace-border font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              Preview Asset
                            </Link>
                          )}
                          <button
                            disabled={actionLoading === `revision-${m.id}`}
                            onClick={() => handleOpenRevisionModal(m)}
                            className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 transition-transform active:scale-95 duration-100 disabled:opacity-50 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            Request Revision
                          </button>
                          <button
                            disabled={actionLoading === `approve-${m.id}`}
                            onClick={() => handleApproveMilestone(m.id, m.title, m.amount)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider px-3.5 py-2 rounded-lg flex items-center gap-1 transition-transform active:scale-95 duration-100 disabled:opacity-50 cursor-pointer"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            Approve & Release Escrow
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Parties details */}
        <div className="space-y-6">

          {/* Wallet Balance Card */}
          {walletBalance !== null && (
            <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-marketplace-border pb-3">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <DollarSign className="w-4.5 h-4.5 text-marketplace-primary animate-pulse" />
                  Wallet Balance
                </h2>
                <Link
                  href="/wallet"
                  className="text-[10px] font-bold text-marketplace-primary hover:underline uppercase tracking-wider"
                >
                  Top Up
                </Link>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-500 font-semibold">Your Wallet Balance</span>
                <span className="text-2xl font-black text-white">${walletBalance.toFixed(2)}</span>
              </div>
            </div>
          )}
          
          {/* Members Card */}
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 space-y-6">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-marketplace-border pb-3 flex items-center gap-2">
              <ClipboardList className="w-4.5 h-4.5 text-marketplace-primary" />
              Contract Parties
            </h2>

            <div className="space-y-4">
              {/* Client */}
              <div className="flex items-center gap-3 bg-[#121826]/40 p-3 rounded-2xl border border-marketplace-border/50">
                <div className="w-9 h-9 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {contract.clientName ? contract.clientName.slice(0, 2).toUpperCase() : "CL"}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Client Partner</span>
                  <span className="text-xs font-bold text-white block truncate">
                    {contract.clientName || contract.clientId.slice(0, 12) + "..."}
                  </span>
                </div>
              </div>

              {/* Freelancer */}
              <Link
                href={`/marketplace/profile/freelancer/${contract.freelancerId}`}
                className="flex items-center gap-3 bg-[#121826]/40 p-3 rounded-2xl border border-marketplace-border/50 hover:border-marketplace-primary/25 group/fl transition-colors"
              >
                {contract.freelancerAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={contract.freelancerAvatarUrl}
                    alt={contract.freelancerName || "Freelancer"}
                    className="w-9 h-9 rounded-full object-cover border border-marketplace-border group-hover/fl:border-marketplace-primary/40 transition-colors shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold text-xs uppercase shrink-0 group-hover/fl:bg-purple-500/15 transition-all">
                    {contract.freelancerName ? contract.freelancerName.slice(0, 2).toUpperCase() : "FL"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wide block">Freelancer Developer</span>
                  <span className="text-xs font-bold text-white block truncate group-hover/fl:text-marketplace-primary transition-colors">
                    {contract.freelancerName || contract.freelancerId.slice(0, 12) + "..."}
                  </span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover/fl:text-marketplace-primary transition-colors shrink-0" />
              </Link>
            </div>
          </div>

          {/* Secure Escrow Notice */}
          <div className="bg-marketplace-primary/5 border border-marketplace-primary/10 rounded-2xl p-5 space-y-2.5">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Info className="w-4.5 h-4.5 text-marketplace-primary shrink-0" />
              Secure Escrow Protection
            </h3>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Virtual Horizon escrow safeguards both parties. Freelancers deliver blueprints as secure packages, and clients review preview assets locally. Funds are released only upon client approval, providing complete project security.
            </p>
          </div>

        </div>
      </div>

      {/* ── Deliver Milestone Modal ── */}
      {deliveryModalMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-marketplace-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button
              onClick={handleCloseDeliveryModal}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="space-y-1.5 border-b border-marketplace-border pb-4 mb-5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Box className="w-5 h-5 text-marketplace-primary" />
                Deliver Milestone Work
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Select your uploaded asset block to link to milestone: <strong className="text-white">"{deliveryModalMilestone.title}"</strong>
              </p>
            </div>

            {deliveryError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2.5 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>{deliveryError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitDelivery} className="space-y-5">
              {/* Asset Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Select Asset Bundle</label>
                {assetsLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-marketplace-primary" />
                    Loading your assets...
                  </div>
                ) : myAssets.length === 0 ? (
                  <div className="text-xs text-slate-500 bg-[#121826] p-4 rounded-xl border border-marketplace-border text-center space-y-2 leading-relaxed">
                    <p>You haven't uploaded any assets yet.</p>
                    <p className="text-[10px] text-slate-600 font-semibold">
                      Please go to Creator Studio or SDK to upload a bundle first.
                    </p>
                  </div>
                ) : (
                  <select
                    required
                    value={selectedAssetId}
                    onChange={(e) => setSelectedAssetId(e.target.value)}
                    className="w-full bg-[#121826]/80 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white font-semibold focus:outline-none cursor-pointer"
                  >
                    {myAssets.map((asset) => (
                      <option key={asset.assetID} value={asset.assetID}>
                        {asset.fileName} ({asset.isListedInStore ? `Listed` : `Draft`})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Days Valid */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Preview Access Duration (Days)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="30"
                  value={daysValid}
                  onChange={(e) => setDaysValid(e.target.value)}
                  className="w-full bg-[#121826]/80 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white font-semibold focus:outline-none"
                />
                <p className="text-[9px] text-slate-500 font-semibold leading-relaxed">
                  The client will be granted a temporary asset download & visual preview session for this period. You can revoke it at any time.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseDeliveryModal}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null || myAssets.length === 0}
                  className="flex-1 bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50 transition-transform active:scale-95 duration-100 cursor-pointer"
                >
                  {actionLoading === "delivering" ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      Submit Delivery
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Request Revision Modal ── */}
      {revisionModalMilestone && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-marketplace-border w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={handleCloseRevisionModal}
              className="absolute top-4 right-4 p-1 text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-4.5 h-4.5" />
            </button>

            <div className="space-y-1.5 border-b border-marketplace-border pb-4 mb-5">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-orange-400" />
                Request Revision
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                Provide instructions or notes on required changes for: <strong className="text-white">"{revisionModalMilestone.title}"</strong>
              </p>
            </div>

            {revisionError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-2.5 rounded-xl flex items-center gap-2.5 mb-4">
                <AlertCircle className="w-4 h-4" />
                <span>{revisionError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitRevision} className="space-y-5">
              {/* Revision Notes */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Revision Instructions</label>
                <textarea
                  required
                  rows={4}
                  value={revisionNote}
                  onChange={(e) => setRevisionNote(e.target.value)}
                  placeholder="Explain what changes are needed before this milestone can be approved..."
                  className="w-full bg-[#121826]/80 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white font-semibold focus:outline-none resize-none"
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleCloseRevisionModal}
                  className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 shadow-lg disabled:opacity-50 transition-transform active:scale-95 duration-100 cursor-pointer"
                >
                  {actionLoading === "revising" ? (
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                  ) : (
                    <>
                      Send Request
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </main>
  );
}
