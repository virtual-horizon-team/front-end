"use client";

import React from "react";
import { Globe, EyeOff } from "lucide-react";

interface AssetHeaderProps {
  fileName: string;
  assetType: number;
  uploadedAt: string;
  isListedInStore: boolean;
  isOwner: boolean;
  isOwnerMode: boolean;
  setIsOwnerMode: (val: boolean) => void;
}

const ASSET_TYPES: Record<number, string> = {
  1: "Models",
  2: "Materials",
  3: "Shaders",
  4: "Prefabs",
  5: "Scripts",
  6: "Full Project",
  7: "Audio",
  8: "Texture"
};

export default function AssetHeader({
  fileName,
  assetType,
  uploadedAt,
  isListedInStore,
  isOwner,
  isOwnerMode,
  setIsOwnerMode
}: AssetHeaderProps) {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pb-6 border-b border-marketplace-border/60">
      <div>
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <span className="bg-slate-900 border border-marketplace-border text-slate-300 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            {ASSET_TYPES[assetType] || "General Asset"}
          </span>
          {isListedInStore && (
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Listed
            </span>
          )}
          {!isListedInStore && isOwner && (
            <span className="bg-amber-500/10 border border-emerald-500/20 text-amber-400 text-[9px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" /> Private Draft
            </span>
          )}
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">{fileName}</h1>
        <p className="text-xs text-slate-500 mt-1 font-semibold">
          Uploaded on {new Date(uploadedAt).toLocaleDateString()}
        </p>
      </div>

      {/* Owner Tab Toggle */}
      {isOwner && (
        <div className="flex bg-[#121826] p-1 rounded-xl border border-marketplace-border">
          <button
            onClick={() => setIsOwnerMode(false)}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              !isOwnerMode ? "bg-marketplace-primary text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Store Representation
          </button>
          <button
            onClick={() => setIsOwnerMode(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
              isOwnerMode ? "bg-marketplace-primary text-white" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Edit & Listing Config
          </button>
        </div>
      )}
    </div>
  );
}
