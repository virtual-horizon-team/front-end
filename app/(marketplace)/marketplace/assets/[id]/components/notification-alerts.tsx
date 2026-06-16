"use client";

import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

interface NotificationAlertsProps {
  success: string | null;
  error: string | null;
}

export default function NotificationAlerts({ success, error }: NotificationAlertsProps) {
  if (!success && !error) return null;

  return (
    <div className="space-y-3">
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
