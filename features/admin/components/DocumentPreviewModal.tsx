"use client";

import { X, FileText } from "lucide-react";

interface DocumentPreviewModalProps {
    previewUrl: string;
    fileName: string;
    mimeType: string;
    fileSizeBytes?: number;
    onClose: () => void;
}

export default function DocumentPreviewModal({
    previewUrl,
    fileName,
    mimeType,
    fileSizeBytes,
    onClose
}: DocumentPreviewModalProps) {
    
    // Self-contained human-readable size formatter
    const formatBytes = (bytes?: number) => {
        if (!bytes) return "";
        const k = 1024;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
    };

    const sizeStr = fileSizeBytes ? ` • ${formatBytes(fileSizeBytes)}` : "";

    return (
        <div className="fixed inset-0 z-[200] overflow-hidden flex items-center justify-center p-4 sm:p-6 md:p-10 animate-fade-in">
            {/* Blurred backdrop */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden border border-brand-border animate-in scale-in duration-200">
                {/* Modal Header */}
                <div className="px-6 py-4 border-b border-brand-border/80 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-md font-bold text-brand-navy truncate">
                            {fileName}
                        </h3>
                        <p className="text-[10px] text-brand-muted font-bold tracking-wide uppercase mt-0.5">
                            {mimeType}{sizeStr}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-red-50 rounded-xl text-brand-muted hover:text-red-600 transition-all cursor-pointer"
                            title="Close preview"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Modal Body */}
                <div className="flex-1 bg-slate-900/5 p-4 flex items-center justify-center relative">
                    {mimeType === "application/pdf" ? (
                        <iframe 
                            src={`${previewUrl}#toolbar=0`} 
                            className="w-full h-full rounded-2xl border border-brand-border/50 shadow-inner bg-white"
                        />
                    ) : mimeType.startsWith("image/") ? (
                        <img 
                            src={previewUrl} 
                            alt="Document Preview" 
                            className="max-w-full max-h-full object-contain rounded-2xl shadow-lg bg-white animate-fade-in"
                        />
                    ) : (
                        <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-brand-border max-w-sm animate-fade-in">
                            <FileText className="w-16 h-16 text-brand-primary/40 mx-auto mb-4" />
                            <h4 className="text-sm font-bold text-brand-navy mb-2">Preview Not Supported</h4>
                            <p className="text-xs text-brand-muted mb-6 leading-relaxed">
                                This file type ({mimeType}) cannot be rendered directly in the browser. You can download it to view it locally.
                            </p>
                            <button 
                                onClick={onClose}
                                className="bg-brand-primary text-white hover:bg-brand-hover px-6 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all active:scale-[0.98] cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
