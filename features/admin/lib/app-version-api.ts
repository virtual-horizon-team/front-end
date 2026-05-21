import { api } from "@/features/auth/lib/api-client";

export interface ApplicationVersion {
    id: string;
    applicationName: string;
    platform: string;
    version: string;
    url: string;
    createdAtUtc?: string;
}

export interface ApplicationVersionPagedResult {
    items?: ApplicationVersion[] | null;
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface ApplicationVersionDisplayParams {
    Search?: string;
    SortBy?: "applicationname" | "platform" | "version";
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    "Filters[applicationName]"?: string;
    "Filters[platform]"?: string;
}

export interface PublishVersionRequest {
    applicationName: string;
    platform: string;
    version: string;
    url: string;
}

/**
 * Fetch paged application versions from the admin endpoint.
 */
export async function getAppVersions(params: ApplicationVersionDisplayParams = {}): Promise<ApplicationVersionPagedResult> {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            urlParams.append(key, value.toString());
        }
    });
    const qs = urlParams.toString();
    return api<ApplicationVersionPagedResult>(`/api/application-versions/admin${qs ? `?${qs}` : ""}`);
}

/**
 * Registers/publishes a new client application version on the server.
 */
export async function publishAppVersion(data: PublishVersionRequest): Promise<void> {
    const encodedAppName = encodeURIComponent(data.applicationName.trim());
    const encodedPlatform = encodeURIComponent(data.platform.trim());
    
    return api<void>(`/api/application-versions/${encodedAppName}/${encodedPlatform}`, {
        method: "POST",
        body: JSON.stringify({
            version: data.version.trim(),
            url: data.url.trim(),
        }),
    });
}

/**
 * Updates an existing application version.
 */
export async function updateAppVersion(id: string, data: PublishVersionRequest): Promise<void> {
    return api<void>(`/api/application-versions/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            applicationName: data.applicationName.trim(),
            platform: data.platform.trim(),
            version: data.version.trim(),
            url: data.url.trim(),
        }),
    });
}

/**
 * Deletes an existing application version.
 */
export async function deleteAppVersion(id: string): Promise<void> {
    return api<void>(`/api/application-versions/admin/${id}`, {
        method: "DELETE"
    });
}
