const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://backend-production-c723.up.railway.app";

interface ServerApiOptions {
    method?: string;
    body?: string;
    headers?: Record<string, string>;
    timeout?: number;
}

export async function serverApi<T>(
    endpoint: string,
    options: ServerApiOptions = {}
): Promise<T> {
    const { timeout = 8000, method = "GET", body, headers = {} } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            body,
            headers: {
                "Content-Type": "application/json",
                ...headers,
            },
            signal: controller.signal,
        });

        clearTimeout(id);

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMessage =
                data.errors?.[0] ||
                data.message ||
                data.title ||
                `Error ${response.status}`;
            throw new Error(errorMessage);
        }

        return data as T;
    } catch (error: any) {
        clearTimeout(id);
        if (error.name === "AbortError") {
            throw new Error("Request timed out");
        }
        throw error;
    }
}