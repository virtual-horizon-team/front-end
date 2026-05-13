export interface DocumentDto {
    documentId: string;
    resourceId: string;
    title: string;
    mimeType: string;
    status: string;
    fileSizeBytes: number;
    uploadedAt: string;
}

export interface DocumentPagedResult {
    items: DocumentDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface DocumentDisplayParams {
    Search?: string;
    SortBy?: "id" | "title" | "createdat" | "filesizebytes";
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    "Filters[mimetype]"?: string;
    "Filters[status]"?: string;
}
