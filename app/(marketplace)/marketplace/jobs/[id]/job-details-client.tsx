"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import {
  Briefcase, ArrowLeft, DollarSign, Calendar, Clock, AlertCircle,
  Loader2, CheckCircle2, ChevronRight, MessageSquare, ClipboardList,
  PlusCircle, Trash2, ShieldCheck, User, ExternalLink, Send
} from "lucide-react";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
  isFreelancer?: boolean;
  isAdmin?: boolean;
}

interface ProposalMilestoneDto {
  id: string;
  title: string;
  description: string | null;
  amount: number;
  orderIndex: number;
}

interface ProposalDto {
  id: string;
  jobPostingId: string;
  freelancerId: string;
  freelancerName?: string;
  freelancerAvatarUrl?: string;
  coverLetter: string;
  bidAmount: number;
  status: string | number; // 0 = Pending, 1 = Accepted, 2 = Rejected, 3 = Withdrawn
  createdAt: string;
  milestones: ProposalMilestoneDto[];
}

interface JobPostingDetailDto {
  id: string;
  clientId: string;
  title: string;
  description: string;
  budget: number;
  status: string | number; // 0 = Open, 1 = InProgress, 2 = Completed, 3 = Cancelled
  createdAt: string;
  proposals: ProposalDto[];
}

interface ProposalMilestoneRequest {
  title: string;
  description: string;
  amount: number;
  orderIndex: number;
}

interface JobDetailsClientProps {
  jobId: string;
  session?: SessionData;
}

const JOB_STATUS_LABELS: Record<string | number, { text: string; css: string }> = {
  0: { text: "Open for Bids", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "Open": { text: "Open for Bids", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  1: { text: "In Progress", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  "InProgress": { text: "In Progress", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  2: { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  "Completed": { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  3: { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  "Cancelled": { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" }
};

const PROPOSAL_STATUS_LABELS: Record<string | number, { text: string; css: string }> = {
  0: { text: "Pending Review", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  "Pending": { text: "Pending Review", css: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
  1: { text: "Accepted", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "Accepted": { text: "Accepted", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  2: { text: "Rejected", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  "Rejected": { text: "Rejected", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  3: { text: "Withdrawn", css: "bg-slate-500/10 border-slate-500/20 text-slate-400" },
  "Withdrawn": { text: "Withdrawn", css: "bg-slate-500/10 border-slate-500/20 text-slate-400" }
};

export default function JobDetailsClient({ jobId, session }: JobDetailsClientProps) {
  const router = useRouter();

  const [job, setJob] = useState<JobPostingDetailDto | null>(null);
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [myProposal, setMyProposal] = useState<ProposalDto | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Proposal Submission Form State
  const [coverLetter, setCoverLetter] = useState("");
  const [milestones, setMilestones] = useState<Omit<ProposalMilestoneRequest, "orderIndex">[]>([
    { title: "Initial Draft & Setup", description: "Basic environment blocking and layout setup.", amount: 0 }
  ]);

  // Freelancer Profile Activation Form State
  const [freelancerName, setFreelancerName] = useState(session?.userName || "");
  const [skills, setSkills] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<string>("1");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [confirmAcceptProposalId, setConfirmAcceptProposalId] = useState<string | null>(null);

  const isOwner = session && job && session.userId === job.clientId;
  const isJobOpen = job && (job.status === 0 || job.status === "Open");

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadJobDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const jobData = await api<JobPostingDetailDto>(`api/jobs/${jobId}`);
      setJob(jobData);

      if (session) {
        // If owner client, load all proposals
        if (session.userId === jobData.clientId) {
          const propsData = await api<ProposalDto[]>(`api/jobs/${jobId}/proposals`);
          setProposals(propsData || []);
        } else if (session.isFreelancer) {
          // If freelancer, check if they have already submitted a proposal
          const myProps = await api<ProposalDto[]>("api/jobs/my-proposals");
          const found = myProps.find(p => p.jobPostingId === jobId);
          if (found) {
            setMyProposal(found);
          }
        }
      }
    } catch (e: any) {
      console.warn("Failed to load job details:", e);
      setError(e.message || "Failed to load contract details.");
    } finally {
      setLoading(false);
    }
  }, [jobId, session]);

  useEffect(() => {
    loadJobDetails();
  }, [loadJobDetails]);

  // Milestone Builders
  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: "", description: "", amount: 0 }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, key: string, val: any) => {
    const updated = [...milestones];
    updated[index] = { ...updated[index], [key]: val };
    setMilestones(updated);
  };

  const calculatedBidAmount = milestones.reduce((sum, m) => sum + (parseFloat(m.amount as any) || 0), 0);

  const handleRegisterFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    if (!freelancerName.trim()) {
      showToast("Display Name is required.", "error");
      return;
    }

    setActionLoading("registering");
    try {
      const payload = {
        name: freelancerName.trim(),
        linkedinUrl: linkedinUrl.trim() || null,
        portfolioUrl: portfolioUrl.trim() || null,
        yearsOfExperience: parseInt(yearsOfExperience) || 0,
        skills: skills.trim() || null
      };

      await api("api/Profile/freelancer/register", {
        method: "POST",
        body: JSON.stringify(payload)
      });

      setRegisterSuccess(true);
      showToast("Freelancer profile activated successfully!", "success");
    } catch (err: any) {
      console.warn("Failed to register as freelancer:", err);
      showToast(err.message || "Failed to register as freelancer.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      router.push(`/login?redirect=/marketplace/jobs/${jobId}`);
      return;
    }

    if (!coverLetter.trim()) {
      showToast("Cover letter is required.", "error");
      return;
    }

    // Validation
    for (let i = 0; i < milestones.length; i++) {
      if (!milestones[i].title.trim()) {
        showToast(`Milestone #${i + 1} requires a title.`, "error");
        return;
      }
      if (parseFloat(milestones[i].amount as any) <= 0) {
        showToast(`Milestone #${i + 1} budget amount must be greater than zero.`, "error");
        return;
      }
    }

    setActionLoading("submitting");
    try {
      const payload = {
        coverLetter,
        bidAmount: calculatedBidAmount,
        milestones: milestones.map((m, idx) => ({
          ...m,
          amount: parseFloat(m.amount as any) || 0,
          orderIndex: idx
        }))
      };

      const result = await api<ProposalDto>(`api/jobs/${jobId}/proposals`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      showToast("Proposal submitted successfully!", "success");
      setMyProposal(result);
    } catch (e: any) {
      console.warn("Failed to submit proposal:", e);
      showToast(e.message || "Failed to submit proposal.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleAcceptProposal = (proposalId: string) => {
    setConfirmAcceptProposalId(proposalId);
  };

  const handleConfirmAccept = async () => {
    if (!confirmAcceptProposalId) return;
    const proposalId = confirmAcceptProposalId;
    setConfirmAcceptProposalId(null);
    setActionLoading(proposalId);
    try {
      const contract = await api<{ id: string }>(`api/contracts/accept-proposal/${proposalId}`, {
        method: "POST"
      });
      showToast("Proposal accepted! Contract generated.", "success");
      setTimeout(() => {
        router.push(`/marketplace/contracts/${contract.id}`);
      }, 1500);
    } catch (e: any) {
      console.warn("Failed to accept proposal:", e);
      showToast(e.message || "Failed to accept proposal.", "error");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex-grow flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-marketplace-primary" />
          <span className="text-xs font-bold text-slate-400">Loading Contract Details...</span>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <main className="w-full mx-auto px-6 py-10 flex-grow flex flex-col justify-center items-center" style={{ maxWidth: "45rem" }}>
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-8 rounded-3xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h2 className="text-lg font-bold text-white">Failed to Load Contract</h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {error || "The requested job posting was not found or is unavailable."}
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

  const jobStatusMeta = JOB_STATUS_LABELS[job.status] || { text: "Unknown", css: "bg-slate-500/10 text-slate-400" };

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

      {/* ── Back Navigation & Details Header ── */}
      <div className="flex flex-col gap-4 border-b border-marketplace-border pb-6">
        <button
          onClick={() => router.push("/marketplace/jobs")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors w-fit cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Freelance Hub
        </button>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider border px-3 py-1.5 rounded-full ${jobStatusMeta.css}`}>
                {jobStatusMeta.text}
              </span>
              <span className="text-sm text-slate-400 font-bold flex items-center gap-1">
                <Calendar className="w-4 h-4 text-slate-500" />
                Posted: {new Date(job.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              {job.title}
            </h1>
            <p className="text-sm text-slate-400 font-medium">
              Client Reference: <span className="text-slate-250 font-bold">{job.clientId}</span>
            </p>
          </div>

          <div className="bg-[#0a0f1d] border border-marketplace-border p-5 rounded-2xl shrink-0 flex flex-col min-w-48 md:text-right">
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Client's Budget</span>
            <span className="text-2xl font-black text-emerald-400 flex items-center md:justify-end mt-1">
              <DollarSign className="w-6 h-6 -ml-1 shrink-0" />
              {job.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8 max-w-5xl mx-auto w-full">
        {/* Scope of Work */}
        <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
          <h2 className="text-base font-black text-white uppercase tracking-wider border-b border-marketplace-border/50 pb-3 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-marketplace-primary" />
            Scope of Work
          </h2>
          <div className="text-sm md:text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
            {job.description}
          </div>
        </div>

        {/* If job is In Progress or Completed, show a quick link to Contract Details! */}
        {!isJobOpen && (
          <div className="bg-[#0f1623] border border-marketplace-primary/20 p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-marketplace-primary" />
                Active Escrow Contract
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
                This job posting is locked. The developer is actively delivering contract milestones.
              </p>
            </div>
            
            <Link
              href={`/marketplace/jobs`}
              className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2.5 rounded-xl inline-flex items-center gap-1.5 shrink-0 transition-all active:scale-95 duration-100"
            >
              Go to Contracts Hub
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* OWNER CLIENT VIEW: Review Proposals */}
        {isOwner && (
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
            <div className="border-b border-marketplace-border pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-marketplace-primary" />
                  Bid Proposals Received
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Review candidate cover letters, milestone timelines, and accept bids to generate active contracts.
                </p>
              </div>
              <span className="bg-marketplace-primary/10 border border-marketplace-primary/20 text-marketplace-primary text-sm font-bold px-3 py-1 rounded-xl shrink-0">
                {proposals.length} Bid{proposals.length !== 1 ? "s" : ""}
              </span>
            </div>

            {proposals.length === 0 ? (
              <div className="text-center py-12 bg-[#121826]/30 rounded-2xl border border-marketplace-border/50">
                <MessageSquare className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                  No proposals submitted for this posting yet. They will appear here once freelancers apply.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {proposals.map((prop) => (
                  <div key={prop.id} className="bg-[#121826]/40 border border-marketplace-border hover:border-marketplace-primary/15 transition-all duration-200 rounded-3xl p-6 flex flex-col justify-between space-y-6">
                    <div>
                      {/* Bidder & amount */}
                      <div className="flex justify-between items-center gap-3 border-b border-marketplace-border/50 pb-4 mb-4">
                        <Link 
                          href={`/marketplace/profile/freelancer/${prop.freelancerId}`}
                          className="flex items-center gap-2.5 group/profile cursor-pointer"
                        >
                          {prop.freelancerAvatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={prop.freelancerAvatarUrl}
                              alt={prop.freelancerName || "Freelancer"}
                              className="w-10 h-10 rounded-xl object-cover border border-marketplace-border group-hover/profile:border-marketplace-primary/45 transition-colors"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-marketplace-primary/10 border border-marketplace-primary/20 flex items-center justify-center font-black text-sm text-marketplace-primary group-hover/profile:bg-marketplace-primary/15 transition-all">
                              {prop.freelancerName ? prop.freelancerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) : "FI"}
                            </div>
                          )}
                          <div>
                            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Freelancer Candidate</span>
                            <span className="text-sm font-bold text-white block group-hover/profile:text-marketplace-primary transition-colors max-w-40 truncate">
                              {prop.freelancerName || "Candidate Freelancer"}
                            </span>
                          </div>
                        </Link>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Bid Amount</span>
                          <span className="text-base font-black text-emerald-400 block">${prop.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>

                      {/* Cover letter */}
                      <div className="space-y-2 mb-4">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Proposal Pitch</span>
                        <p className="text-xs text-slate-300 font-semibold leading-relaxed bg-[#0a0f1d]/85 p-4 rounded-xl border border-marketplace-border/50 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {prop.coverLetter}
                        </p>
                      </div>

                      {/* Milestones */}
                      <div className="space-y-3">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Proposed Milestones ({prop.milestones?.length || 0})</span>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {prop.milestones?.map((m) => (
                            <div key={m.id} className="flex justify-between items-center bg-[#0a0f1d] border border-marketplace-border/40 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-350">
                              <div className="flex flex-col gap-0.5 truncate max-w-xs">
                                <span className="text-slate-200 truncate font-bold">M{m.orderIndex + 1}: {m.title}</span>
                                {m.description && <span className="text-[10px] text-slate-500 truncate font-medium">{m.description}</span>}
                              </div>
                              <span className="text-emerald-400 font-bold shrink-0">${m.amount.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Accept proposal Button */}
                    {isJobOpen && (
                      <button
                        disabled={actionLoading !== null}
                        onClick={() => handleAcceptProposal(prop.id)}
                        className="w-full bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3 rounded-xl flex items-center justify-center gap-1.5 transition-transform active:scale-97 duration-100 disabled:opacity-50 cursor-pointer shadow-md mt-4"
                      >
                        {actionLoading === prop.id ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <>
                            Accept Bid Proposal
                            <ChevronRight className="w-4.5 h-4.5" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {!isOwner && myProposal && (
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl shadow-black/20">
            <div className="border-b border-marketplace-border pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-marketplace-primary" />
                  Your Proposal
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  You have submitted a bid for this contract posting.
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Bid Status</span>
                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-3 py-1 rounded-full mt-1 ${PROPOSAL_STATUS_LABELS[myProposal.status]?.css || "bg-slate-500/10 text-slate-400"}`}>
                  {PROPOSAL_STATUS_LABELS[myProposal.status]?.text || "Unknown"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              <div className="md:col-span-1 space-y-4">
                <div className="bg-[#121826]/30 border border-marketplace-border p-5 rounded-2xl space-y-4">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Total Bid Value</span>
                    <span className="text-2xl font-black text-emerald-400 block mt-1">${myProposal.bidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Submission Date</span>
                    <span className="text-sm font-bold text-slate-300 block mt-1">{new Date(myProposal.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 space-y-6">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Pitch Cover Letter</span>
                  <p className="text-sm md:text-base text-slate-200 font-medium leading-relaxed bg-[#121826]/20 p-5 rounded-2xl border border-marketplace-border whitespace-pre-wrap">
                    {myProposal.coverLetter}
                  </p>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">Proposed Milestones ({myProposal.milestones?.length || 0})</span>
                  <div className="space-y-2.5">
                    {myProposal.milestones?.map((m) => (
                      <div key={m.id} className="bg-[#121826]/10 border border-marketplace-border/50 p-4 rounded-xl text-sm font-semibold text-slate-300 flex justify-between items-center">
                        <div className="flex flex-col gap-0.5 truncate max-w-sm">
                          <span className="text-sm text-slate-200 font-bold">M{m.orderIndex + 1}: {m.title}</span>
                          {m.description && <span className="text-xs text-slate-500 font-medium">{m.description}</span>}
                        </div>
                        <span className="text-emerald-400 font-black shrink-0">${m.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FREELANCER VIEW: Submit Proposal Form */}
        {!isOwner && !myProposal && (
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-8 shadow-xl shadow-black/20">
            <div className="border-b border-marketplace-border pb-4">
              <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-marketplace-primary" />
                Submit Bid Proposal
              </h2>
              <p className="text-xs text-slate-400 font-semibold mt-1">
                Propose your own price, milestone timeline, and submit a pitch cover letter to win this contract.
              </p>
            </div>

            {!isJobOpen ? (
              <div className="text-center py-10 bg-[#121826]/30 rounded-2xl border border-marketplace-border/50">
                <AlertCircle className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <p className="text-xs text-slate-400 font-bold max-w-sm mx-auto leading-relaxed">
                  Bids are closed. This contract is already in progress or completed.
                </p>
              </div>
            ) : !session ? (
              <div className="text-center py-10 bg-[#121826]/30 rounded-2xl border border-marketplace-border/50 space-y-4">
                <User className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="space-y-1">
                  <p className="text-xs text-slate-400 font-bold">Authentication Required</p>
                  <p className="text-[11px] text-slate-500 font-semibold max-w-xs mx-auto leading-relaxed">
                    You must sign in with a registered account to submit a freelance bid proposal.
                  </p>
                </div>
                <Link
                  href={`/login?redirect=/marketplace/jobs/${jobId}`}
                  className="inline-block bg-marketplace-primary hover:bg-marketplace-primary/95 text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 duration-100"
                >
                  Sign In to Apply
                </Link>
              </div>
            ) : !session.isFreelancer ? (
              <div className="space-y-6">
                {registerSuccess ? (
                  <div className="text-center py-12 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl space-y-5">
                    <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                    <div className="space-y-2 max-w-md mx-auto">
                      <h3 className="text-base font-bold text-white">Developer Profile Activated!</h3>
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        Your developer credentials have been created in the system. To apply this new role to your current login session, please sign in once again.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        router.push(`/login?redirect=/marketplace/jobs/${jobId}`);
                      }}
                      className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 duration-100 cursor-pointer"
                    >
                      Sign In Again to Refresh Session
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRegisterFreelancer} className="space-y-6">
                    <div className="bg-[#121826]/30 border border-marketplace-border p-6 rounded-3xl space-y-4">
                      <div className="border-b border-marketplace-border/50 pb-3">
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">Activate Freelancer Developer Profile</h3>
                        <p className="text-[11px] text-slate-400 font-semibold mt-1">
                          Activate your profile to pitch bid proposals, build milestones, and manage escrow contracts.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Display Name */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Display/Full Name</label>
                          <input
                            type="text"
                            required
                            value={freelancerName}
                            onChange={(e) => setFreelancerName(e.target.value)}
                            placeholder="e.g. Yousef Joe"
                            className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-600 font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Experience */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Years of Experience</label>
                          <input
                            type="number"
                            required
                            min="0"
                            max="80"
                            value={yearsOfExperience}
                            onChange={(e) => setYearsOfExperience(e.target.value)}
                            placeholder="e.g. 3"
                            className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-600 font-bold focus:outline-none text-emerald-400"
                          />
                        </div>

                        {/* Skills */}
                        <div className="md:col-span-2 space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Skills / Specializations</label>
                          <input
                            type="text"
                            required
                            value={skills}
                            onChange={(e) => setSkills(e.target.value)}
                            placeholder="e.g. Unity, C#, 3D Modeling, Shaders (comma-separated)"
                            className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-600 font-semibold focus:outline-none"
                          />
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">LinkedIn Profile URL</label>
                          <input
                            type="url"
                            value={linkedinUrl}
                            onChange={(e) => setLinkedinUrl(e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-600 font-semibold focus:outline-none"
                          />
                        </div>

                        {/* Portfolio */}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Portfolio Website URL</label>
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://myportfolio.com"
                            className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4.5 py-3 text-xs text-white placeholder-slate-600 font-semibold focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading === "registering"}
                      className="w-full bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all hover:shadow-lg active:scale-98 duration-100 cursor-pointer"
                    >
                      {actionLoading === "registering" ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Activate Developer Profile
                          <Briefcase className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmitProposal} className="space-y-8">
                {/* Cover Letter */}
                <div className="bg-[#121826]/20 border border-marketplace-border/60 p-6 rounded-2xl space-y-4">
                  <div className="space-y-1">
                    <label htmlFor="coverLetter" className="text-sm font-bold text-white flex items-center gap-1.5">
                      Cover Letter Pitch
                    </label>
                    <p className="text-xs text-slate-400 font-semibold">
                      Describe your approach, design principles, relevant experience, and why you are the best fit for this project.
                    </p>
                  </div>
                  <textarea
                    id="coverLetter"
                    required
                    rows={6}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Why are you a good fit for this gig? Summarize your qualifications, design ideas, or relevant portfolios..."
                    className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/40 focus:ring-1 focus:ring-marketplace-primary/20 rounded-xl px-4.5 py-3.5 text-sm text-white placeholder-slate-600 font-semibold focus:outline-none transition-all resize-none leading-relaxed"
                  />
                </div>

                {/* Milestones Breakdown Builder */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between border-b border-marketplace-border/50 pb-2.5">
                    <div className="space-y-0.5">
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">Milestone Breakdown</h3>
                      <p className="text-[11px] text-slate-500 font-semibold">Divide the contract scope into structured deliverables.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddMilestone}
                      className="text-marketplace-primary hover:text-white border border-marketplace-primary/20 hover:border-marketplace-primary/40 bg-marketplace-primary/5 hover:bg-marketplace-primary/10 transition-colors text-xs font-bold flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-xl"
                    >
                      <PlusCircle className="w-4 h-4" /> Add Milestone
                    </button>
                  </div>

                  {/* Milestones list */}
                  <div className="space-y-3.5">
                    {milestones.map((m, index) => (
                      <div key={index} className="bg-[#121826]/40 border border-marketplace-border rounded-2xl p-5 relative group hover:border-marketplace-border-active transition-all">
                        <div className="flex items-center justify-between gap-4 mb-4">
                          <span className="text-xs font-black text-marketplace-primary flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-marketplace-primary/10 border border-marketplace-primary/20 flex items-center justify-center text-[10px] font-bold text-marketplace-primary">
                              {index + 1}
                            </span>
                            Milestone Deliverable
                          </span>
                          {milestones.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMilestone(index)}
                              className="text-slate-500 hover:text-red-400 transition-colors p-1.5 hover:bg-red-500/10 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          {/* Title */}
                          <div className="md:col-span-4 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Title</label>
                            <input
                              type="text"
                              required
                              value={m.title}
                              onChange={(e) => handleMilestoneChange(index, "title", e.target.value)}
                              placeholder="e.g. Initial blockout & asset scales"
                              className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                            />
                          </div>

                          {/* Description */}
                          <div className="md:col-span-6 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Scope Description</label>
                            <input
                              type="text"
                              value={m.description || ""}
                              onChange={(e) => handleMilestoneChange(index, "description", e.target.value)}
                              placeholder="e.g. 3D blocking models submitted for review"
                              className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/30 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                            />
                          </div>

                          {/* Budget */}
                          <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Escrow Value</label>
                            <div className="relative">
                              <DollarSign className="w-3.5 h-3.5 text-slate-550 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                value={m.amount === 0 ? "" : m.amount}
                                onChange={(e) => handleMilestoneChange(index, "amount", e.target.value)}
                                placeholder="0.00"
                                className="w-full bg-[#0a0f1d] border border-marketplace-border focus:border-marketplace-primary/30 rounded-xl pl-7 pr-3 py-2 text-xs text-white placeholder-slate-650 font-bold focus:outline-none text-emerald-450"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Comparison Gauge & Cost breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[#121826]/30 border border-marketplace-border rounded-3xl p-6">
                  {/* Left: Target vs Bid comparison */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wide">Budget Gauge</h4>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-400">Client's Target Budget:</span>
                        <span className="text-slate-200 font-bold">${job.budget.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-slate-400">Your Bid Proposal:</span>
                        <span className="text-emerald-400 font-bold">${calculatedBidAmount.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Progress indicator */}
                    <div className="w-full bg-[#0a0f1d] h-2.5 rounded-full overflow-hidden border border-marketplace-border/50">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          calculatedBidAmount > job.budget ? "bg-amber-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.min((calculatedBidAmount / job.budget) * 100, 100)}%` }}
                      />
                    </div>

                    {calculatedBidAmount > job.budget ? (
                      <div className="text-xs text-amber-450 font-semibold bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                        Your bid exceeds the target budget by ${(calculatedBidAmount - job.budget).toFixed(2)}.
                      </div>
                    ) : (
                      <div className="text-xs text-emerald-450 font-semibold bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                        Your bid is fully compliant with the client's target budget.
                      </div>
                    )}
                  </div>

                  {/* Right: Fees and Submit button */}
                  <div className="space-y-4 border-t md:border-t-0 md:border-l border-marketplace-border/50 pt-4 md:pt-0 md:pl-6 flex flex-col justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-350 uppercase tracking-wide mb-3">Payout Breakdown</h4>
                      <div className="space-y-2 text-sm font-semibold">
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Proposed Bid Sum</span>
                          <span className="text-slate-200">${calculatedBidAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400 font-medium">Service Fee (0%)</span>
                          <span className="text-slate-500">$0.00</span>
                        </div>
                        <div className="border-t border-marketplace-border/40 pt-2 flex justify-between text-base">
                          <span className="text-white font-black">Estimated Take-Home</span>
                          <span className="text-emerald-400 font-black">${calculatedBidAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={actionLoading !== null}
                      className="w-full bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all duration-155 hover:shadow-lg active:scale-98 duration-100 cursor-pointer mt-4"
                    >
                      {actionLoading === "submitting" ? (
                        <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      ) : (
                        <>
                          Submit Bid Offer
                          <Send className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* ── Custom Accept Proposal Modal ── */}
      {confirmAcceptProposalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0f1d] border border-marketplace-border max-w-md w-full rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Warning Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Accept Bid & Initiate Contract
              </h3>
            </div>

            {/* Modal Body Info */}
            <div className="text-xs text-slate-350 font-semibold leading-relaxed space-y-3 bg-[#121826]/30 border border-marketplace-border/50 p-4 rounded-2xl">
              <p>
                Are you sure you want to accept this proposal? By confirming this action:
              </p>
              <ul className="list-disc pl-4 space-y-1.5 text-left text-slate-400">
                <li>Other proposals for this job will be automatically rejected.</li>
                <li>The job posting status will transition to <span className="text-marketplace-primary font-bold">In Progress</span>.</li>
                <li>An active contract milestones escrow will be initiated.</li>
              </ul>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmAcceptProposalId(null)}
                className="flex-1 py-3 px-4 rounded-xl border border-marketplace-border hover:border-white/20 text-slate-300 font-bold text-xs uppercase tracking-wider text-center transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAccept}
                className="flex-1 py-3 px-4 rounded-xl bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider text-center transition-transform active:scale-97 cursor-pointer shadow-md"
              >
                Confirm & Start
              </button>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
