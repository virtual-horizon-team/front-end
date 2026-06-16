"use client";

import React from "react";
import Link from "next/link";

interface BreadcrumbsProps {
  fileName: string;
  isOwner: boolean;
}

export default function Breadcrumbs({ fileName, isOwner }: BreadcrumbsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
      <Link href="/marketplace" className="hover:text-slate-300 transition-colors">Marketplace</Link>
      <span>/</span>
      {isOwner ? (
        <Link href="/marketplace/assets/my" className="hover:text-slate-300 transition-colors">My Assets</Link>
      ) : (
        <span className="text-slate-400">Store Assets</span>
      )}
      <span>/</span>
      <span className="text-white truncate max-w-[200px]">{fileName}</span>
    </div>
  );
}
