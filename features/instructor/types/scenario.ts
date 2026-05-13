export interface ScenarioCardItem {
    id: string;
    resourceId: string;
    title: string;
    description: string | null;
    status: string;
    difficultyLevel: string | null;
    estimatedDuration: string | null;
    version: number;
    previewSasUrl: string | null;
    createdAt: string;
}

export interface ScenarioCardPagedResult {
    items: ScenarioCardItem[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ScenarioCardQuery {
    Search?: string;
    SortBy?: "id" | "title" | "createdat" | "duration";
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    "Filters[difficultylevel]"?: string;
    "Filters[status]"?: string;
    "Filters[resourceId]"?: string;
}
