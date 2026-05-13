export enum ResourceType {
    Video = "Video",
    Document = "Document",
    Article = "Article",
    Scenario = "Scenario",
    Quiz = "Quiz"
}

export enum VideoStatus {
    Created = "Created",
    UploadPending = "UploadPending",
    UploadComplete = "UploadComplete",
    Processing = "Processing",
    Draft = "Draft",
    Published = "Published",
    Archived = "Archived",
    Failed = "Failed"
}

export interface ResourceResult {
    resourceId: string;
    mediaId?: string | null;
    title?: string | null;
    type: ResourceType;
    status?: string | null;
    sizeBytes: number;
    uploadedAt: string;
    mimeType?: string | null;
}

export interface ResourceResultPagedResult {
    items?: ResourceResult[] | null;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ResourceDisplayParams {
    Search?: string;
    SortBy?: 'id' | 'title' | 'createdat';
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    "Filters[type]"?: string | string[];
    "Filters[id]"?: string;
}

export interface CreateVideoRequest {
    title: string;
    description?: string;
    fileSizeBytes: number;
    mimeType: string;
    durationInSeconds: number;
}

export interface CompleteUploadRequest {
    actualFileSize: number;
}

export interface CreateVideoResponse {
    videoId: string;
    resourceId: string;
    title: string;
    description: string | null;
    status: string;
    sizeBytes: number;
    mimeType: string | null;
    durationSeconds: number | null;
    processingError: string | null;
    uploadedAt: string;
    updatedAt: string;
}

export interface UploadInitiateResponse {
    videoId: string;
    uploadUrl: string;
    blobName: string;
    expiredAt: string;
}

export interface CompleteUploadResponse {
    videoId: string;
    status: string;
    errorMessage: string | null;
}

export interface VideoStreamResponse {
    streamUrl: string;
    expiredAt: string;
}

export interface VideoDto {
    videoId: string;
    resourceId: string;
    title: string;
    description: string | null;
    status: string;
    sizeBytes: number;
    mimeType: string;
    durationSeconds: number;
    processingError: string | null;
    uploadedAt: string;
    updatedAt: string;
}

export interface VideoPagedResult {
    items: VideoDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface VideoDisplayParams {
    Search?: string;
    SortBy?: "id" | "title" | "status" | "updatedat" | "durationseconds" | "filesizebytes";
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    "Filters[status]"?: string;
    "Filters[mimetype]"?: string;
}
