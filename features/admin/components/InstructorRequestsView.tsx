"use client";

import { useEffect, useState } from "react";
import { 
    getInstructorRequests, 
    getRequestDocuments, 
    approveRequest, 
    rejectRequest, 
    downloadRequestDocument,
    getDocumentPreviewUrl,
    InstructorRequest, 
    RequestDocument 
} from "../lib/instructor-request-api";
import { showToast } from "@/features/instructor/components/Toast";

// Clean modular sub-components
import InstructorMetrics from "./InstructorMetrics";
import InstructorRequestsTable from "./InstructorRequestsTable";
import RequestDetailsDrawer from "./RequestDetailsDrawer";
import DocumentPreviewModal from "./DocumentPreviewModal";

interface InstructorRequestsViewProps {
    initialRequests: InstructorRequest[];
}

export default function InstructorRequestsView({ initialRequests }: InstructorRequestsViewProps) {
    const [requests, setRequests] = useState<InstructorRequest[]>(initialRequests);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
    
    // Slide-over drawer states
    const [selectedRequest, setSelectedRequest] = useState<InstructorRequest | null>(null);
    const [documents, setDocuments] = useState<RequestDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    
    // Action processing loading states
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Inline document preview states
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewDoc, setPreviewDoc] = useState<RequestDocument | null>(null);
    const [loadingPreviewId, setLoadingPreviewId] = useState<string | null>(null);

    // Garbage-collect generated object URL on component state shift or unmount to avoid memory leaks
    useEffect(() => {
        return () => {
            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    // Fetch refreshed lists from backend API
    const refreshRequests = async () => {
        setLoading(true);
        try {
            const data = await getInstructorRequests();
            setRequests(data);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to load applications.");
        } finally {
            setLoading(false);
        }
    };

    // Load attachments list for drawer view
    const handleViewDocuments = async (request: InstructorRequest) => {
        setSelectedRequest(request);
        setDocuments([]);
        setLoadingDocs(true);
        try {
            const docs = await getRequestDocuments(request.id);
            setDocuments(docs);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to fetch files for this request.");
        } finally {
            setLoadingDocs(false);
        }
    };

    // Close slide-over drawer panel
    const handleClosePanel = () => {
        setSelectedRequest(null);
        setDocuments([]);
    };

    // Trigger secure file preview rendering
    const handlePreview = async (doc: RequestDocument, friendlyName: string) => {
        if (!selectedRequest) return;
        setLoadingPreviewId(doc.documentId);
        try {
            if (previewUrl) {
                window.URL.revokeObjectURL(previewUrl);
                setPreviewUrl(null);
            }
            const url = await getDocumentPreviewUrl(selectedRequest.id, doc.documentId);
            setPreviewUrl(url);
            setPreviewDoc({ ...doc, friendlyName } as any);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to load document preview.");
        } finally {
            setLoadingPreviewId(null);
        }
    };

    // Close preview modal
    const handleClosePreview = () => {
        if (previewUrl) {
            window.URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setPreviewDoc(null);
    };

    // Download document action
    const handleDownload = async (docId: string, friendlyName: string) => {
        if (!selectedRequest) return;
        await downloadRequestDocument(selectedRequest.id, docId, friendlyName);
    };

    // Approve applicant trigger
    const handleApprove = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to approve ${name} as an instructor?`)) {
            setProcessingId(id);
            try {
                await approveRequest(id);
                showToast("success", `${name}'s instructor application was approved!`);
                if (selectedRequest?.id === id) {
                    handleClosePanel();
                }
                await refreshRequests();
            } catch (error: any) {
                showToast("error", error?.message || "Failed to approve request.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    // Reject applicant trigger
    const handleReject = async (id: string, name: string) => {
        if (confirm(`Are you sure you want to reject ${name}'s instructor application?`)) {
            setProcessingId(id);
            try {
                await rejectRequest(id);
                showToast("success", `${name}'s instructor application was rejected.`);
                if (selectedRequest?.id === id) {
                    handleClosePanel();
                }
                await refreshRequests();
            } catch (error: any) {
                showToast("error", error?.message || "Failed to reject request.");
            } finally {
                setProcessingId(null);
            }
        }
    };

    // Helper for formatting file size metrics
    const formatBytes = (bytes: number, decimals = 1) => {
        if (!bytes) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    };

    // Stats calculations
    const totalCount = requests.length;
    const pendingCount = requests.filter(r => r.status.toLowerCase() === "pending").length;
    const approvedCount = requests.filter(r => r.status.toLowerCase() === "approved").length;

    return (
        <div className="space-y-8 relative">
            {/* Header info */}
            <div>
                <h1 className="text-[28px] font-bold text-brand-navy tracking-tight">Instructor Requests</h1>
                <p className="text-brand-muted text-[15px] font-medium mt-1">
                    Review qualifications and manage instructor role applications across the platform.
                </p>
            </div>

            {/* Sub-component: Statistics cards */}
            <InstructorMetrics
                totalCount={totalCount}
                pendingCount={pendingCount}
                approvedCount={approvedCount}
            />

            {/* Sub-component: Data table & Filters list */}
            <InstructorRequestsTable
                requests={requests}
                loading={loading}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                processingId={processingId}
                onViewDocuments={handleViewDocuments}
                onApprove={handleApprove}
                onReject={handleReject}
            />

            {/* Sub-component: Slide-over application details drawer */}
            {selectedRequest && (
                <RequestDetailsDrawer
                    request={selectedRequest}
                    documents={documents}
                    loadingDocs={loadingDocs}
                    processingId={processingId}
                    loadingPreviewId={loadingPreviewId}
                    onClose={handleClosePanel}
                    onPreview={handlePreview}
                    onDownload={handleDownload}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    formatBytes={formatBytes}
                />
            )}

            {/* Sub-component: Inline document visual preview modal */}
            {previewUrl && previewDoc && (
                <DocumentPreviewModal
                    previewUrl={previewUrl}
                    fileName={(previewDoc as any).friendlyName}
                    mimeType={previewDoc.mimeType}
                    fileSizeBytes={previewDoc.fileSizeBytes}
                    onClose={handleClosePreview}
                />
            )}
        </div>
    );
}
