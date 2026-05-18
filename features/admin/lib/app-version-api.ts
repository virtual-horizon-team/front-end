import { api } from "@/features/auth/lib/api-client";

export interface PublishVersionRequest {
    applicationName: string;
    platform: string;
    version: string;
    url: string;
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
