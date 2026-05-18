import { api } from "@/features/auth/lib/api-client";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { API_BASE_URL } from "@/lib/config";

export interface InstructorRequest {
    id: string;
    userId: string;
    name: string;
    requestedRole: string;
    status: string;
    createdAt: string;
    linkedinUrl?: string;
    portofolioUrl?: string;
    yearsOfExperience?: number;
    hasToughtBefore?: boolean;
    reviewedBy?: string;
    reviewedAt?: string;
    processedAt?: string;
    documents?: any[];
    user?: {
        email?: string;
        userName?: string;
    } | null;
}

export interface RequestDocument {
    documentId: string;
    requestId: string;
    mimeType: string;
    fileSizeBytes: number;
}

/**
 * Fetches all pending instructor requests.
 */
export async function getInstructorRequests(): Promise<InstructorRequest[]> {
    return api<InstructorRequest[]>("/api/admin/instructor-requests");
}

/**
 * Fetches documents uploaded for a specific request.
 */
export async function getRequestDocuments(requestId: string): Promise<RequestDocument[]> {
    return api<RequestDocument[]>(`/api/admin/instructor-requests/${requestId}/documents`);
}

/**
 * Approves an instructor request.
 */
export async function approveRequest(requestId: string): Promise<{ message: string }> {
    return api<{ message: string }>(`/api/admin/instructor-requests/${requestId}/approve`, {
        method: "POST",
    });
}

/**
 * Rejects an instructor request.
 */
export async function rejectRequest(requestId: string): Promise<{ message: string }> {
    return api<{ message: string }>(`/api/admin/instructor-requests/${requestId}/reject`, {
        method: "POST",
    });
}

/**
 * Trigger secure document download inside browser client
 */
export async function downloadRequestDocument(requestId: string, documentId: string, fileName: string): Promise<void> {
    try {
        const token = await getAccessToken();
        const url = `${API_BASE_URL.replace(/\/$/, "")}/api/admin/instructor-requests/${requestId}/documents/${documentId}/download`;
        
        const response = await fetch(url, {
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to download file. Status: ${response.status}`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
        console.error("Error downloading document:", error);
        alert("Failed to download document. Please try again.");
    }
}

/**
 * Fetches the document and returns a temporary local object URL for previewing.
 */
export async function getDocumentPreviewUrl(requestId: string, documentId: string): Promise<string> {
    const token = await getAccessToken();
    const url = `${API_BASE_URL.replace(/\/$/, "")}/api/admin/instructor-requests/${requestId}/documents/${documentId}/download`;
    
    const response = await fetch(url, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file. Status: ${response.status}`);
    }

    const blob = await response.blob();
    return window.URL.createObjectURL(blob);
}

