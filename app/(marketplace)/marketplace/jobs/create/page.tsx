"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  Briefcase, ArrowLeft, ArrowRight, DollarSign, TextQuote, FileText,
  Loader2, AlertCircle, CheckCircle2
} from "lucide-react";

export default function CreateJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !budget) {
      setError("Please fill out all required fields.");
      return;
    }

    const budgetNum = parseFloat(budget);
    if (isNaN(budgetNum) || budgetNum <= 0) {
      setError("Budget must be a positive number greater than zero.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await api<{ id: string }>("api/jobs", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          budget: budgetNum
        })
      });
      setSuccess(true);
      setTimeout(() => {
        router.push(`/marketplace/jobs/${result.id}`);
      }, 1500);
    } catch (e: any) {
      console.warn("Failed to create job posting:", e);
      setError(e.message || "Failed to create job posting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full mx-auto px-6 py-10 flex-grow flex flex-col justify-center items-center" style={{ maxWidth: "45rem" }}>
      
      {/* Back to Hub */}
      <div className="w-full mb-6">
        <button
          onClick={() => router.push("/marketplace/jobs")}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Freelance Hub
        </button>
      </div>

      {/* Main card */}
      <div className="w-full bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-marketplace-primary/10 rounded-full blur-2xl pointer-events-none" />

        {/* Title Block */}
        <div className="space-y-1.5 border-b border-marketplace-border pb-6 mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-marketplace-primary" />
            Post a Freelance Job Posting
          </h1>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Outline your scope of work, timeline milestones, and expected budget. High-quality specifications attract premium creators.
          </p>
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 mb-6">
            <AlertCircle className="w-4.5 h-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold px-4 py-3 rounded-xl flex items-center gap-2.5 mb-6">
            <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
            <span>Job created successfully! Redirecting to details...</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <TextQuote className="w-3.5 h-3.5 text-marketplace-primary" />
              Contract Title
            </label>
            <input
              id="title"
              type="text"
              required
              disabled={loading || success}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Optimized Low-Poly VR Room Layout Design"
              className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none transition-colors disabled:opacity-50"
            />
          </div>

          {/* Budget */}
          <div className="space-y-2">
            <label htmlFor="budget" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-marketplace-primary" />
              Total Estimated Budget (USD)
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="budget"
                type="number"
                step="0.01"
                min="0.01"
                required
                disabled={loading || success}
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g. 500.00"
                className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl pl-10 pr-4 py-3 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none transition-colors disabled:opacity-50"
              />
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">
              This amount is an initial estimation. The binding contract cost will be defined by the selected bid proposal milestones.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-marketplace-primary" />
              Scope of Work & Requirements
            </label>
            <textarea
              id="description"
              required
              rows={8}
              disabled={loading || success}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail your modeling/scripting needs, reference meshes, performance budgets, expected deliverables, and timeline milestones..."
              className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 font-semibold focus:outline-none transition-colors resize-none disabled:opacity-50 leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || success}
            className="w-full bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-transform active:scale-98 duration-100 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
                Publishing Contract...
              </>
            ) : (
              <>
                Publish Posting
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>

    </main>
  );
}
