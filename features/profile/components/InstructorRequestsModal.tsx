"use client";

import React, { useEffect, useState } from "react";
import { X, Clock, FileText, Loader2, Award, Briefcase, ExternalLink, Calendar } from "lucide-react";
import { instructorRequestApi, RoleRequestItem } from "@/features/instructor/lib/instructor-request-api";
import { showToast } from "@/features/instructor/components/Toast";

interface InstructorRequestsModalProps {
  onClose: () => void;
}

export default function InstructorRequestsModal({ onClose }: InstructorRequestsModalProps) {
  const [requests, setRequests] = useState<RoleRequestItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        const data = await instructorRequestApi.getInstructorRequests();
        // Sort requests by newest first
        const sorted = (data.items || []).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRequests(sorted);
      } catch (error: any) {
        console.error("Failed to load instructor requests", error);
        showToast("error", error.message || "Failed to load instructor requests. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return "bg-green-50 border-green-200 text-green-700";
      case "rejected":
        return "bg-red-50 border-red-200 text-red-700";
      default:
        return "bg-amber-50 border-amber-200 text-amber-700";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-2xl border border-brand-border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border bg-brand-soft/35">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-primary" />
            <h3 className="text-lg font-bold text-brand-navy">Instructor Application History</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-brand-soft rounded-xl transition-colors cursor-pointer text-brand-muted hover:text-brand-navy"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 size={32} className="animate-spin text-brand-primary" />
              <p className="text-sm text-brand-muted font-medium">Fetching application records...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="w-16 h-16 bg-brand-soft rounded-full flex items-center justify-center mx-auto mb-4 border border-brand-border">
                <Briefcase className="w-8 h-8 text-brand-muted" />
              </div>
              <h4 className="text-base font-bold text-brand-navy mb-1.5">No Applications Found</h4>
              <p className="text-sm text-brand-muted max-w-sm mx-auto leading-relaxed">
                You haven't submitted any applications to become an Instructor yet. Click "Teach on Virtual Horizon" in the header to get started.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.requestId}
                  className="border border-brand-border rounded-xl p-5 hover:shadow-xs transition-shadow bg-white flex flex-col md:flex-row md:items-start justify-between gap-4"
                >
                  {/* Left: Info */}
                  <div className="space-y-3 flex-1 min-w-0">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusStyle(
                          request.status
                        )}`}
                      >
                        {request.status}
                      </span>
                      <span className="text-[11px] text-brand-muted font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Submitted: {formatDate(request.createdAt)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-brand-muted">
                      <div>
                        <span className="font-semibold text-brand-navy">Applicant:</span> {request.name}
                      </div>
                      <div>
                        <span className="font-semibold text-brand-navy">Experience:</span> {request.yearsOfExperience ?? 0} Years
                      </div>
                      <div>
                        <span className="font-semibold text-brand-navy">Taught Before:</span> {request.hasToughtBefore ? "Yes" : "No"}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" />
                        <span className="font-semibold text-brand-navy">Documents:</span> {request.documentsCount} file(s)
                      </div>
                    </div>

                    {/* Social/Portfolio Links if provided */}
                    {(request.linkedinUrl || request.portfolioUrl) && (
                      <div className="flex gap-4 pt-1 flex-wrap">
                        {request.linkedinUrl && (
                          <a
                            href={request.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-primary font-semibold hover:underline"
                          >
                            LinkedIn Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                        {request.portfolioUrl && (
                          <a
                            href={request.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-brand-primary font-semibold hover:underline"
                          >
                            Portfolio Website <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    )}

                    {/* Processed/Reviewed Info */}
                    {request.processedAt && (
                      <div className="text-[10px] text-brand-muted border-t border-brand-border/60 pt-2 flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        Processed on {formatDate(request.processedAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-brand-border bg-brand-soft/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-brand-border hover:bg-brand-soft text-brand-navy text-sm font-bold transition-all duration-150 active:scale-95 cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    </div>
  );
}
