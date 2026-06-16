"use client";

import React, { useState, useEffect } from "react";
import { UserPlus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { api } from "@/features/auth/lib/api-client";

interface ShareAssetCardProps {
  assetId: string;
}

export default function ShareAssetCard({ assetId }: ShareAssetCardProps) {
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Automatically clear notifications after 5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleShare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) return;

    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      await api(`/api/Asset/${assetId}/Share`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrUsername: emailOrUsername.trim() })
      });

      setSuccessMsg(`Successfully shared asset with ${emailOrUsername}!`);
      setEmailOrUsername("");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to share asset. Please check the username or email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121826] border border-marketplace-border p-6 rounded-2xl space-y-4 shadow-xl">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <UserPlus className="w-5 h-5 text-marketplace-primary" />
        Share with a Friend
      </h3>
      <p className="text-xs font-semibold text-slate-400 leading-relaxed">
        Grant permanent library access to download and use this asset to another user on the platform.
      </p>

      {/* Notifications inside the card */}
      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleShare} className="space-y-3 pt-1">
        <div className="space-y-1.5">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Friend's Username or Email</label>
          <input
            type="text"
            required
            placeholder="e.g. johndoe or john@example.com"
            value={emailOrUsername}
            onChange={e => setEmailOrUsername(e.target.value)}
            className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors placeholder:text-slate-600 text-white"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !emailOrUsername.trim()}
          className="w-full bg-marketplace-primary hover:bg-marketplace-primary-hover active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <UserPlus className="w-3.5 h-3.5" />
          )}
          Grant Access
        </button>
      </form>
    </div>
  );
}
