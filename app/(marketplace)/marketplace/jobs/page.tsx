"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  Briefcase, Search, Filter, ArrowRight, DollarSign, Calendar, Clock,
  PlusCircle, AlertCircle, Loader2, RefreshCw, Layers
} from "lucide-react";

interface JobPostingDto {
  id: string;
  clientId: string;
  title: string;
  budget: number;
  status: string | number; // String enum like "Open" or integer like 0
  createdAt: string;
}

interface PagedResult {
  items: JobPostingDto[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

const STATUS_LABELS: Record<string | number, { text: string; css: string }> = {
  0: { text: "Open", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "Open": { text: "Open", css: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  1: { text: "In Progress", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  "InProgress": { text: "In Progress", css: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  2: { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  "Completed": { text: "Completed", css: "bg-purple-500/10 border-purple-500/20 text-purple-400" },
  3: { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" },
  "Cancelled": { text: "Cancelled", css: "bg-red-500/10 border-red-500/20 text-red-400" }
};

export default function JobsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [jobs, setJobs] = useState<JobPostingDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter and pagination state
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10));
  const pageSize = 8;

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Freelance Hub displays only open contracts (status 0)
      const statusParam = "&status=0";
      const searchParam = search ? `&searchTerm=${encodeURIComponent(search)}` : "";
      const endpoint = `api/jobs?pageNumber=${page}&pageSize=${pageSize}${statusParam}${searchParam}`;
      
      const data = await api<PagedResult>(endpoint);
      setJobs(data.items || []);
      setTotalCount(data.totalCount || 0);
    } catch (e: any) {
      console.warn("Failed to fetch jobs:", e);
      setError(e.message || "Failed to load freelance jobs.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "85rem" }}>
      
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-marketplace-border pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-marketplace-primary" />
            Freelance Hub
          </h1>
          <p className="text-sm text-slate-400 font-medium mt-1">
            Browse and apply to VR simulation, scene layout, and 3D modeling contracts.
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

      {/* ── Dashboard Content ── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Filters Sidebar (Left) */}
        <div className="w-full lg:w-72 bg-[#0a0f1d] border border-marketplace-border rounded-2xl p-5 space-y-6 shrink-0">
          <div className="flex items-center justify-between border-b border-marketplace-border pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-marketplace-primary" />
              Filter Contracts
            </h2>
            <button
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="text-xs font-bold text-slate-500 hover:text-marketplace-primary transition-colors"
            >
              Reset All
            </button>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Title, description..."
                className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Listings Grid/List (Right) */}
        <div className="flex-1 w-full space-y-6">
          
          {/* Error Banner */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-semibold px-4 py-3.5 rounded-xl flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="flex-1">{error}</span>
              <button
                onClick={fetchJobs}
                className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-[#0a0f1d] border border-marketplace-border rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="h-4 bg-slate-800 rounded w-2/3" />
                    <div className="h-3 bg-slate-850 rounded w-full" />
                    <div className="h-3 bg-slate-850 rounded w-5/6" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-slate-800 rounded w-16" />
                    <div className="h-6 bg-slate-800 rounded w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-5 bg-[#0a0f1d] border border-marketplace-border rounded-2xl">
              <Layers className="w-12 h-12 text-slate-700" />
              <div className="text-center space-y-1.5">
                <h3 className="font-bold text-white text-base">No Contracts Found</h3>
                <p className="text-xs text-slate-500 font-semibold max-w-xs leading-relaxed">
                  Try adjusting your search query or status filter criteria.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {jobs.map((job) => {
                const statusMeta = STATUS_LABELS[job.status] || { text: "Unknown", css: "bg-slate-500/10 text-slate-400" };
                const formattedDate = new Date(job.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric"
                });

                return (
                  <div
                    key={job.id}
                    className="bg-[#0a0f1d] border border-marketplace-border hover:border-marketplace-primary/20 rounded-2xl p-6 flex flex-col justify-between group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20"
                  >
                    <div>
                      {/* Badge / Metadata */}
                      <div className="flex items-center justify-between gap-3 mb-3.5">
                        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded-full ${statusMeta.css}`}>
                          {statusMeta.text}
                        </span>
                        <span className="text-[11px] text-slate-500 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formattedDate}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-base font-extrabold text-white tracking-tight mb-2.5 line-clamp-1 group-hover:text-marketplace-primary transition-colors">
                        {job.title}
                      </h3>

                      {/* Brief details */}
                      <p className="text-xs text-slate-400 font-semibold line-clamp-2 leading-relaxed mb-6">
                        Client Reference: {job.clientId.slice(0, 8)}...
                      </p>
                    </div>

                    {/* Bottom Action bar */}
                    <div className="flex items-center justify-between border-t border-marketplace-border/50 pt-4 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Estimated Budget</span>
                        <span className="text-base font-black text-emerald-400 flex items-center">
                          <DollarSign className="w-4 h-4 shrink-0 -ml-0.5" />
                          {job.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>

                      <Link
                        href={`/marketplace/jobs/${job.id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-marketplace-primary hover:text-white transition-colors cursor-pointer"
                      >
                        Details
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && totalCount > pageSize && (
            <div className="flex items-center justify-between border-t border-marketplace-border pt-6 mt-4">
              <span className="text-xs text-slate-500 font-bold">
                Showing page <strong className="text-slate-300">{page}</strong> of <strong className="text-slate-300">{totalPages}</strong>
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(p - 1, 1))}
                  className="px-4 py-2 bg-[#0a0f1d] border border-marketplace-border hover:border-slate-800 disabled:opacity-40 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 bg-[#0a0f1d] border border-marketplace-border hover:border-slate-800 disabled:opacity-40 rounded-xl text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </main>
  );
}
