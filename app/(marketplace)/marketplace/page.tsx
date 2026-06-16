"use client";

import React from "react";
import Link from "next/link";
import { Sparkles, Box, ArrowRight, Cpu, Workflow } from "lucide-react";

export default function MarketplaceHomePage() {
  return (
    <main className="mx-auto px-6 py-20 relative z-10 flex-grow w-full flex flex-col justify-center" style={{ maxWidth: "85rem" }}>
      
      <div className="text-center max-w-3xl mx-auto space-y-6">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-marketplace-primary/10 border border-marketplace-primary/20 text-xs font-bold text-marketplace-primary rounded-full uppercase tracking-wider shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5" />
          Welcome to the Horizon Creator Marketplace
        </span>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white">
          Build and Discover <br />
          <span className="text-marketplace-primary">
            Immersive 3D Assets
          </span>
        </h1>

        <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-medium leading-relaxed">
          Welcome to your customized sandbox workspace. Publish, trade, and license high-fidelity simulations, custom models, and interactive VR blueprints.
        </p>

        {/* Quick CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/marketplace/assets"
            className="bg-marketplace-primary text-white text-sm font-bold px-8 py-3.5 rounded-full flex items-center gap-2 transition-all duration-150 active:scale-95 cursor-pointer shadow-lg shadow-red-900/10"
          >
            Browse Asset Library
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/courses"
            className="bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-marketplace-border text-sm font-bold px-8 py-3.5 rounded-full transition-all duration-150 cursor-pointer"
          >
            Learn to Model
          </Link>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20">
        
        {/* Card 1: Asset Store */}
        <div className="bg-marketplace-soft/40 border border-marketplace-border hover:border-marketplace-primary/20 rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />
          <div className="p-4 bg-blue-500/10 rounded-2xl w-fit border border-blue-500/20 text-blue-400 mb-6">
            <Box className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Asset Catalog</h3>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            Explore custom FBX models, PBR textures, environment packages, and interactive C# script templates.
          </p>
          <Link
            href="/marketplace/assets"
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 mt-6 cursor-pointer"
          >
            Enter Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Freelance Board */}
        <div className="bg-marketplace-soft/40 border border-marketplace-border hover:border-marketplace-primary/20 rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />
          <div className="p-4 bg-purple-500/10 rounded-2xl w-fit border border-purple-500/20 text-purple-400 mb-6">
            <Cpu className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Freelance Contracts</h3>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            Hire vetted designers or find contract gigs to setup VR simulations, custom scenes, and gameplay scripts.
          </p>
          <Link
            href="/marketplace/jobs"
            className="inline-flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 mt-6 cursor-pointer"
          >
            Browse Contracts <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Secure Escrows */}
        <div className="bg-marketplace-soft/40 border border-marketplace-border hover:border-marketplace-primary/20 rounded-3xl p-8 relative overflow-hidden group transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-xl pointer-events-none group-hover:bg-red-500/20 transition-all" />
          <div className="p-4 bg-red-500/10 rounded-2xl w-fit border border-red-500/20 text-red-400 mb-6">
            <Workflow className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Escrow Workspaces</h3>
          <p className="text-slate-400 text-xs leading-relaxed font-medium">
            Protect your milestones with secure contract payments. Work is previewed locally and paid out on release approval.
          </p>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-red-400 mt-6">
            Escrows Active
          </span>
        </div>

      </div>

    </main>
  );
}
