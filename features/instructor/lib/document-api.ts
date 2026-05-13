import { api } from "@/features/auth/lib/api-client";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { refreshSession } from "@/features/auth/lib/refresh-token";

import { API_BASE_URL as BASE_URL } from "@/lib/config";
import { DocumentDisplayParams, DocumentPagedResult } from "../types/document";

export const documentApi = {
    uploadDocument: async (title: string, file: File, onProgress?: (progress: number) => void) => {
        const token = await getAccessToken();
        const formData = new FormData();
        formData.append("Title", title);
        formData.append("File", file);

        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", `${BASE_URL}/api/Documents`, true);
            if (token) {
                xhr.setRequestHeader("Authorization", `Bearer ${token}`);
            }

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = event.loaded / event.total;
                    onProgress(progress);
                }
            };

            xhr.onload = async () => {
                if (xhr.status === 403) {
                    if (typeof window !== "undefined") {
                        window.location.href = "/forbidden";
                    }
                    reject(new Error("Forbidden"));
                    return;
                }
                if (xhr.status === 401) {
                    try {
                        const newToken = await refreshSession();
                        if (!newToken) throw new Error("Session expired");
                        
                        // Retry with new token
                        const retryXhr = new XMLHttpRequest();
                        retryXhr.open("POST", `${BASE_URL}/api/Documents`, true);
                        retryXhr.setRequestHeader("Authorization", `Bearer ${newToken}`);
                        retryXhr.upload.onprogress = xhr.upload.onprogress;
                        
                        retryXhr.onload = () => {
                            if (retryXhr.status === 403) {
                                if (typeof window !== "undefined") {
                                    window.location.href = "/forbidden";
                                }
                                reject(new Error("Forbidden"));
                                return;
                            }
                            if (retryXhr.status >= 200 && retryXhr.status < 300) {
                                resolve();
                            } else {
                                reject(new Error(`Upload failed with status ${retryXhr.status}`));
                            }
                        };
                        retryXhr.onerror = () => reject(new Error("Network error during retry upload"));
                        retryXhr.send(formData);
                    } catch (err) {
                        reject(err);
                    }
                } else if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.send(formData);
        });
    },

    getDocumentDownloadUrl: async (documentId: string) => {
        // According to swagger, it's GET /api/Documents/{documentId}/Download
        // It might return a redirect, stream, or JSON with URL. 
        // We will just use the standard api client and see what it returns.
        // Wait, if it returns a file blob directly, standard api client will try to parse as JSON or text.
        // Let's use a custom fetch to handle blob if needed.
        const token = await getAccessToken();
        const response = await fetch(`${BASE_URL}/api/Documents/${documentId}/Download`, {
            method: "GET",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {})
            }
        });

        if (response.status === 403) {
            if (typeof window !== "undefined") {
                window.location.href = "/forbidden";
                return new Promise(() => {}) as Promise<string>;
            }
        }

        if (!response.ok) {
            throw new Error(`Failed to get download URL, status: ${response.status}`);
        }

        // If it's json, parse it
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return typeof data === "string" ? data : (data.url || data.downloadUrl || data.link);
        }

        // It might be binary, so we create a blob URL
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    },

    fetchDocuments: (params: DocumentDisplayParams = {}) => {
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                if (Array.isArray(value)) {
                    value.forEach(v => urlParams.append(key, v.toString()));
                } else {
                    urlParams.append(key, value.toString());
                }
            }
        });
        const qs = urlParams.toString();
        const url = `/api/Documents/Display${qs ? `?${qs}` : ""}`;
        return api<DocumentPagedResult>(url);
    }
};
