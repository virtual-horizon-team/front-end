import { refreshSession } from "./refresh-token";
import { getAccessToken } from "./get-access-token";

import { API_BASE_URL as BASE_URL } from "@/lib/config";

interface ApiOptions extends RequestInit {
    timeout?: number;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { timeout = 8000, ...customConfig } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const token = await getAccessToken();

    const config: RequestInit = {
        method: customConfig.method || "GET",
        ...customConfig,
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...customConfig.headers,
        },
        signal: controller.signal,
    };

    try {
        const url = `${BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
        let response = await fetch(url, config);
        clearTimeout(id);

        if (response.status === 401) {
            const newToken = await refreshSession();

            if (newToken) {
                const retryResponse = await fetch(url, {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });

                const retryContentType = retryResponse.headers.get("content-type");
                let retryData: any;
                if (retryContentType && retryContentType.includes("application/json")) {
                    retryData = await retryResponse.json().catch(() => ({}));
                } else {
                    const text = await retryResponse.text();
                    try { retryData = JSON.parse(text); } catch { retryData = text; }
                }

                if (!retryResponse.ok) {
                    let errorMessage = `Retry failed with status ${retryResponse.status}`;
                    if (typeof retryData === "object" && retryData !== null) {
                        errorMessage = (retryData.errors && retryData.errors[0]) || retryData.message || retryData.title || errorMessage;
                    } else if (typeof retryData === "string" && retryData.length > 0) {
                        errorMessage = retryData;
                    }
                    throw new Error(`[Retry Error] ${errorMessage} | Raw Data: ${JSON.stringify(retryData)}`);
                }
                return retryData as T;
            } else {
                throw new Error("Session expired. Please log in again.");
            }
        }

        if (response.status === 403) {
            if (typeof window !== "undefined") {
                window.location.href = "/forbidden";
                // Return a never-resolving promise to stop further execution
                return new Promise(() => {}) as Promise<T>;
            } else {
                const { redirect } = await import("next/navigation");
                redirect("/forbidden");
            }
        }

        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        let data: any;
        if (isJson) {
            data = await response.json().catch(() => ({}));
        } else {
            const text = await response.text();
            try {
                data = JSON.parse(text);
            } catch (e) {
                data = text;
            }
        }

        if (!response.ok) {
            let errorMessage = `Error ${response.status}`;
            if (typeof data === "object" && data !== null) {
                errorMessage = (data.errors && data.errors[0]) || data.message || data.title || errorMessage;
            } else if (typeof data === "string" && data.length > 0) {
                errorMessage = data;
            }
            throw new Error(errorMessage);
        }

        return data as T;
    } catch (error: any) {
        if (error.name === "AbortError") {
            throw new Error("Request timed out");
        }
        throw error;
    }
}