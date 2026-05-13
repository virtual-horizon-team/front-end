import { api } from "@/features/auth/lib/api-client";
import { CreateVideoRequest, CreateVideoResponse, CompleteUploadRequest, CompleteUploadResponse, ResourceDisplayParams, ResourceResultPagedResult, UploadInitiateResponse, VideoStreamResponse, VideoDisplayParams, VideoPagedResult } from "../types/video";

export const videoApi = {
    fetchResources: (params: ResourceDisplayParams = {}) => {
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
        const url = `/api/Resource/Display${qs ? `?${qs}` : ""}`;
        return api<ResourceResultPagedResult>(url);
    },

    fetchVideos: (params: VideoDisplayParams = {}) => {
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
        const url = `/api/Videos/Display${qs ? `?${qs}` : ""}`;
        return api<VideoPagedResult>(url);
    },

    createVideo: (data: CreateVideoRequest) => {
        return api<CreateVideoResponse>("/api/Videos", {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    initiateUpload: (videoId: string) => {
        return api<UploadInitiateResponse>(`/api/Videos/${videoId}/Upload/Initiate`, {
            method: "POST",
        });
    },

    uploadFile: async (url: string, file: File, onProgress?: (progress: number) => void) => {
        return new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("PUT", url, true);
            xhr.setRequestHeader("x-ms-blob-type", "BlockBlob");

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable && onProgress) {
                    const progress = event.loaded / event.total;
                    onProgress(progress);
                }
            };

            xhr.onload = () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                    resolve();
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            };

            xhr.onerror = () => reject(new Error("Network error during upload"));
            xhr.send(file);
        });
    },

    completeUpload: (videoId: string, data: CompleteUploadRequest) => {
        return api<CompleteUploadResponse>(`/api/Videos/${videoId}/Upload/Complete`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    getVideoStatus: (videoId: string) => {
        return api<{ status: string; url?: string }>(`/api/Videos/${videoId}/Status`);
    },

    getVideoStreamUrl: (videoId: string) => {
        return api<VideoStreamResponse>(`/api/Videos/${videoId}/Stream`, {
            method: "POST",
        });
    },

    getVideoDownloadUrl: (videoId: string) => {
        return api<string | { url: string }>(`/api/Videos/${videoId}/Download-Url`);
    },

    deleteVideo: (videoId: string) => {
        return api<void>(`/api/Videos/${videoId}/Delete`, {
            method: "DELETE",
        });
    },

    deleteResource: (resourceId: string) => {
        return api<void>(`/api/Resource/${resourceId}`, {
            method: "DELETE",
        });
    }
};
