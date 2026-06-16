"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  Briefcase, ArrowRight, DollarSign, Calendar, Clock,
  PlusCircle, AlertCircle, Loader2, RefreshCw, ClipboardList, CheckCircle2, User
} from "lucide-react";

interface JobPostingDto {
  id: string;
  clientId: string;
  title: string;
  budget: number;
  status: string | number;
  createdAt: string;
}

interface ProposalDto {
  id: string;
  jobPostingId: string;
  freelancerId: string;
  coverLetter: string;
  bidAmount: number;
  status: string | number;
  createdAt: string;
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

export default function MyJobsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"posted" | "bids">("posted");
  const [myJobs, setMyJobs] = useState<JobPostingDto[]>([]);
  const [myBids, setMyBids] = useState<ProposalDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFreelancer, setIsFreelancer] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check capabilities
      const manifest = await api<{ capabilities?: { isFreelancer?: boolean } }>("api/Profile/manifest");
      const holdsFreelancerRole = !!manifest?.capabilities?.isFreelancer;
      setIsFreelancer(holdsFreelancerRole);

      // Fetch user's posted jobs
      const jobsData = await api<JobPostingDto[]>("api/jobs/my");
      setMyJobs(jobsData || []);

      // If user is freelancer, fetch bids
      if (holdsFreelancerRole) {
        const bidsData = await api<ProposalDto[]>("api/jobs/my-proposals");
        setMyBids(bidsData || []);
      }
    } catch (e: any) {
      console.error("Failed to fetch jobs/bids:", e);
      setError(e.message || "Failed to retrieve your jobs and bids data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "85rem" }}>
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-marketplace-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <ClipboardList className="w-7 h-7 text-marketplace-primary" />
            My Jobs & Bids
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Manage your posted freelance contract offers and monitor active application bids.
          </p>
        </div>

        <Link
          href="/marketplace/jobs/create"
          className="inline-flex items-center gap-2 bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl shadow-lg transition-transform active:scale-95 duration-100"
        >
          <PlusCircle className="w-4 h-4" />
          Post a Job Contract
        </Link>
      </div>

      {/* ── Tabs Navigation ── */}
      <div className="flex border-b border-marketplace-border/50 gap-6">
        <button
          onClick={() => setActiveTab("posted")}
          className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === "posted" ? "text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Posted Jobs ({myJobs.length})
          {activeTab === "posted" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-marketplace-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("bids")}
          className={`pb-4 text-xs font-black uppercase tracking-wider transition-all relative ${
            activeTab === "bids" ? "text-white" : "text-slate-400 hover:text-slate-200"
          }`}
        >
          Submitted Bids ({isFreelancer ? myBids.length : 0})
          {activeTab === "bids" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-marketplace-primary" />
          )}
        </button>
      </div>

      {/* ── Main Content Area ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="w-10 h-10 text-marketplace-primary animate-spin" />
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Loading dashboard items...</p>
        </div>
      ) : error ? (
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Retrieval Failed</h3>
            <p className="text-xs text-slate-400 font-medium">{error}</p>
            <button
              onClick={fetchData}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-marketplace-primary hover:underline mt-2"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Fetch
            </button>
          </div>
        </div>
      ) : activeTab === "posted" ? (
        myJobs.length === 0 ? (
          <div className="text-center py-16 bg-[#0a0f1d] border border-marketplace-border rounded-3xl space-y-4">
            <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Posted Job Contracts</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                You have not posted any freelance jobs yet. Create a job contract request to recruit skilled 3D and VR developers.
              </p>
            </div>
            <Link
              href="/marketplace/jobs/create"
              className="inline-flex items-center gap-2 bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95"
            >
              <PlusCircle className="w-4 h-4" /> Create My First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myJobs.map((job) => {
              const statusInfo = JOB_STATUS_LABELS[job.status] || {
                text: "Unknown Status",
                css: "bg-slate-500/10 border-slate-500/20 text-slate-400"
              };
              return (
                <div
                  key={job.id}
                  className="bg-[#0a0f1d] border border-marketplace-border hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-250 shadow-md group"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.css}`}>
                        {statusInfo.text}
                      </span>
                      <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(job.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-white leading-snug group-hover:text-marketplace-primary transition-colors">
                      {job.title}
                    </h3>
                  </div>

                  <div className="border-t border-marketplace-border/50 pt-4 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Est. Budget</p>
                      <p className="text-sm font-black text-emerald-400 flex items-center">
                        <DollarSign className="w-4 h-4 -ml-1 shrink-0" />
                        {job.budget.toLocaleString()}
                      </p>
                    </div>

                    <Link
                      href={`/marketplace/jobs/${job.id}`}
                      className="inline-flex items-center gap-1.5 bg-[#121826]/80 hover:bg-[#1a2336] text-white border border-marketplace-border px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                    >
                      View Bids <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : !isFreelancer ? (
        <div className="text-center py-16 bg-[#0a0f1d] border border-marketplace-border rounded-3xl max-w-2xl mx-auto space-y-6">
          <User className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-base font-bold text-white">Developer Profile Required</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              You must activate a freelancer developer profile in order to submit proposal bids, quote milestone payouts, and execute active simulation projects.
            </p>
          </div>
          <Link
            href="/marketplace/profile"
            className="inline-flex items-center gap-2 bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
          >
            Activate Developer Profile
          </Link>
        </div>
      ) : myBids.length === 0 ? (
        <div className="text-center py-16 bg-[#0a0f1d] border border-marketplace-border rounded-3xl space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-base font-bold text-white">No Application Bids</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
              You have not submitted any proposals to active job postings. Browse the Freelance Hub to find simulation and layout projects.
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
          {myBids.map((bid) => {
            const statusInfo = PROPOSAL_STATUS_LABELS[bid.status] || {
              text: "Unknown Status",
              css: "bg-slate-500/10 border-slate-500/20 text-slate-400"
            };
            return (
              <div
                key={bid.id}
                className="bg-[#0a0f1d] border border-marketplace-border hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-6 transition-all duration-250 shadow-md group"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${statusInfo.css}`}>
                      {statusInfo.text}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(bid.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Job Application ID</p>
                    <p className="text-[11px] text-slate-400 font-semibold truncate bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5">
                      {bid.jobPostingId}
                    </p>
                  </div>
                </div>

                <div className="border-t border-marketplace-border/50 pt-4 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Your Bid Amount</p>
                    <p className="text-sm font-black text-emerald-400 flex items-center">
                      <DollarSign className="w-4 h-4 -ml-1 shrink-0" />
                      {bid.bidAmount.toLocaleString()}
                    </p>
                  </div>

                  <Link
                    href={`/marketplace/jobs/${bid.jobPostingId}`}
                    className="inline-flex items-center gap-1.5 bg-[#121826]/80 hover:bg-[#1a2336] text-white border border-marketplace-border px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                  >
                    View Job <ArrowRight className="w-3.5 h-3.5" />
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
