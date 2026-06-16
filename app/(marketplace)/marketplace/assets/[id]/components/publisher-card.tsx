"use client";

import React from "react";
import { User, ShieldCheck } from "lucide-react";

interface PublisherCardProps {
  ownerName?: string;
  ownerBio?: string | null;
  ownerAvatarUrl?: string | null;
}

export default function PublisherCard({
  ownerName,
  ownerBio,
  ownerAvatarUrl
}: PublisherCardProps) {
  console.log("PublisherCard Props:", { ownerName, ownerBio, ownerAvatarUrl });
  const displayName = ownerName || "Unknown Publisher";

  return (
    <div className="bg-[#121826]/60 border border-marketplace-border/80 backdrop-blur-md p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2">
        <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">
          About the Creator
        </h3>
        <span className="w-1.5 h-1.5 rounded-full bg-marketplace-primary/80 animate-pulse"></span>
      </div>

      <div className="flex items-start gap-4">
        {/* Avatar/Profile Image */}
        <div className="relative flex-shrink-0">
          {ownerAvatarUrl ? (
            <img
              src={ownerAvatarUrl}
              alt={displayName}
              className="w-16 h-16 rounded-xl object-cover border border-marketplace-border/80 bg-slate-950 shadow-inner"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl border border-marketplace-border/80 bg-gradient-to-tr from-slate-900 to-slate-950 flex items-center justify-center text-slate-400 shadow-inner">
              <User className="w-7 h-7 text-slate-500" />
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Profile Info */}
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="text-base font-extrabold text-white truncate" title={displayName}>
              {displayName}
            </h4>
            <span className="text-[9px] bg-marketplace-primary/10 border border-marketplace-primary/20 text-marketplace-primary font-extrabold px-2 py-0.5 rounded uppercase tracking-wider">
              Creator
            </span>
          </div>

          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            {ownerBio ? ownerBio : "This creator has not set a bio yet."}
          </p>
        </div>
      </div>
    </div>
  );
}
