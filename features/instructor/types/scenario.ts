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

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type ScenarioStatus = 'Uploaded' | 'Draft' | 'Published';

/**
 * Returned by GET /api/scenario/{scenarioId}
 * Note: estimatedDiruation has a typo in the backend — spelled "Diruation".
 */
export interface ScenarioDisplayDto {
    id: string;
    jsonData: string;
    createdAt: string;
    version: number;
    thumbnailSasUrl: string | null;
    imageAssetSasLinks: string[];
    difficultyLevel: DifficultyLevel | null;
    /** Backend typo: "Diruation" instead of "Duration" */
    estimatedDiruation: string | null;
    description: string | null;
}

/**
 * Returned by GET /api/scenario/{scenarioId}/Metadata
 */
export interface ScenarioMetadataResult {
    description: string | null;
    difficultyLevel: string | null;
    estimatedDuration: string | null;
    status: ScenarioStatus;
    imageAssetSasLinks: string[];
    createdAt: string;
    updatedAt: string;
}

/**
 * Request body for PUT /api/scenario/{id}/Metadata
 */
export interface ScenarioMetadataDto {
  description?: string | null;
  difficultyLevel?: DifficultyLevel | null;
  estimatedDuration?: string | null;
  status?: ScenarioStatus | null;
}

/**
 * Returned by PUT /api/scenario/UpdateImages/{id}
 */
export interface ScenarioImagesUpdateResult {
  imageAssetSasLinks: string[];
  updatedAt: string;
}
