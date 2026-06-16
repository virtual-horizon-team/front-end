"use client";

import React from "react";

interface AssetDescriptionProps {
  description: string | null;
}

export default function AssetDescription({ description }: AssetDescriptionProps) {
  return (
    <div className="bg-[#121826]/40 border border-marketplace-border p-6 rounded-2xl space-y-3">
      <h3 className="text-lg font-bold text-white">Blueprint Description</h3>
      <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line font-medium">
        {description || "No description provided for this blueprint asset package."}
      </p>
    </div>
  );
}
