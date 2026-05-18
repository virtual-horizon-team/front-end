"use client";

import { X, ExternalLink, Loader2, FileText, Eye, Download } from "lucide-react";
import { InstructorRequest, RequestDocument } from "../lib/instructor-request-api";

interface RequestDetailsDrawerProps {
    request: InstructorRequest;
    documents: RequestDocument[];
    loadingDocs: boolean;
    processingId: string | null;
    loadingPreviewId: string | null;
    onClose: () => void;
    onPreview: (doc: RequestDocument, friendlyName: string) => void;
    onDownload: (docId: string, friendlyName: string) => void;
    onApprove: (id: string, name: string) => void;
    onReject: (id: string, name: string) => void;
    formatBytes: (bytes: number) => string;
}

export default function RequestDetailsDrawer({
    request,
    documents,
    loadingDocs,
    processingId,
    loadingPreviewId,
    onClose,
    onPreview,
    onDownload,
    onApprove,
    onReject,
    formatBytes
}: RequestDetailsDrawerProps) {
    const displayName = request.name || request.user?.userName || "Applicant";

    return (
        <div className="fixed inset-0 z-[100] overflow-hidden flex justify-end">
            {/* Darkened backdrop */}
            <div 
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-fade-in"
                onClick={onClose}
            />

            {/* Drawer Content */}
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 transition-transform duration-300 animate-slide-in">
                {/* Drawer Header */}
                <div className="p-6 border-b border-brand-border/80 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-brand-navy">Request Details</h3>
                        <p className="text-xs text-brand-muted font-medium mt-0.5">Documents & Profile for {displayName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1.5 hover:bg-brand-soft rounded-lg text-brand-muted hover:text-brand-navy transition-all cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Drawer body scroll area */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Live Application Details Grid */}
                    <div className="bg-brand-soft/20 rounded-2xl border border-brand-border/50 p-5 space-y-4">
                        <h4 className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">Application Information</h4>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                            <div>
                                <p className="text-brand-muted font-semibold">Years of Experience</p>
                                <p className="font-extrabold text-brand-navy mt-1 text-[13px]">{request.yearsOfExperience ?? "0"} Years</p>
                            </div>
                            <div>
                                <p className="text-brand-muted font-semibold">Taught Before?</p>
                                <p className="font-extrabold text-brand-navy mt-1 text-[13px]">{request.hasToughtBefore ? "Yes" : "No"}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-brand-muted font-semibold">LinkedIn Profile</p>
                                {request.linkedinUrl ? (
                                    <a 
                                        href={request.linkedinUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-brand-primary font-bold hover:underline mt-1 flex items-center gap-1.5"
                                    >
                                        View LinkedIn Profile <ExternalLink size={12} />
                                    </a>
                                ) : (
                                    <p className="text-brand-muted italic mt-1">Not provided</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <p className="text-brand-muted font-semibold">Portfolio / CV Website</p>
                                {request.portofolioUrl ? (
                                    <a 
                                        href={request.portofolioUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-brand-primary font-bold hover:underline mt-1 flex items-center gap-1.5"
                                    >
                                        View Portfolio Website <ExternalLink size={12} />
                                    </a>
                                ) : (
                                    <p className="text-brand-muted italic mt-1">Not provided</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Documents list header */}
                    <div className="space-y-3">
                        <h4 className="text-[11px] font-bold text-brand-navy uppercase tracking-wider">Submitted Attachments</h4>
                        
                        {loadingDocs ? (
                            <div className="py-10 flex flex-col items-center justify-center gap-2 text-brand-muted">
                                <Loader2 className="animate-spin text-brand-primary" size={24} />
                                <span className="text-xs font-medium">Fetching documents...</span>
                            </div>
                        ) : documents.length === 0 ? (
                            <div className="py-8 text-center text-xs font-semibold text-brand-muted bg-gray-50 rounded-2xl border border-dashed border-brand-border">
                                No files were uploaded with this application.
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {documents.map((doc, idx) => {
                                    const ext = doc.mimeType.split("/")[1] || "pdf";
                                    const docName = `attachment_${idx + 1}_${doc.documentId.slice(0, 8)}.${ext}`;

                                    return (
                                        <div 
                                            key={doc.documentId} 
                                            className="bg-white rounded-xl border border-brand-border/80 p-3.5 flex items-center justify-between group hover:border-brand-primary transition-all shadow-sm"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
                                                    <FileText size={20} />
                                                </div>
                                                <div className="overflow-hidden max-w-[160px]">
                                                    <p className="text-xs font-bold text-brand-navy truncate">{docName}</p>
                                                    <p className="text-[10px] text-brand-muted mt-0.5">{formatBytes(doc.fileSizeBytes)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button 
                                                    onClick={() => onPreview(doc, docName)}
                                                    disabled={loadingPreviewId !== null}
                                                    className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                                                    title="Preview document inline"
                                                >
                                                    {loadingPreviewId === doc.documentId ? (
                                                        <Loader2 size={16} className="animate-spin text-brand-primary" />
                                                    ) : (
                                                        <Eye size={16} />
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => onDownload(doc.documentId, docName)}
                                                    className="p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all cursor-pointer"
                                                    title="Download document"
                                                >
                                                    <Download size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Drawer Bottom Actions */}
                {request.status.toLowerCase() === "pending" && (
                    <div className="p-6 bg-gray-50 border-t border-brand-border/80 grid grid-cols-2 gap-3.5">
                        <button 
                            onClick={() => onApprove(request.id, displayName)}
                            disabled={processingId !== null}
                            className="bg-brand-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-brand-hover shadow-sm active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {processingId === request.id ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : null}
                            Approve Request
                        </button>
                        <button 
                            onClick={() => onReject(request.id, displayName)}
                            disabled={processingId !== null}
                            className="border border-brand-border/80 text-brand-navy py-3 rounded-xl font-bold text-sm hover:bg-brand-soft/20 hover:border-brand-border hover:text-red-600 active:scale-98 transition-all cursor-pointer disabled:opacity-50"
                        >
                            Reject Application
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
