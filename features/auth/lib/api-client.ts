import { refreshSession } from "./refresh-token";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-c723.up.railway.app";

interface ApiOptions extends RequestInit {
    timeout?: number;
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { timeout = 8000, ...customConfig } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    const config: RequestInit = {
        method: customConfig.method || "GET",
        ...customConfig,
        headers: {
            "Content-Type": "application/json",
            ...customConfig.headers,
        },
        signal: controller.signal,
    };

    try {
        let response = await fetch(`${BASE_URL}${endpoint}`, config);
        clearTimeout(id);

        if (response.status === 401) {
            const newToken = await refreshSession();

            if (newToken) {
                const retryResponse = await fetch(`${BASE_URL}${endpoint}`, {
                    ...config,
                    headers: {
                        ...config.headers,
                        Authorization: `Bearer ${newToken}`,
                    },
                });

                const retryData = await retryResponse.json().catch(() => ({}));
                if (!retryResponse.ok) throw new Error(retryData.errors?.[0] || "Retry failed");
                return retryData as T;
            } else {
                throw new Error("Session expired. Please log in again.");
            }
        }

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage = (data.errors && data.errors[0]) || data.message || data.title || `Error ${response.status}`;
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