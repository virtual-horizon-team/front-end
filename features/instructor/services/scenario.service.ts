import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { serverApi } from "@/features/auth/lib/server-api-client";
import { ScenarioCardPagedResult, ScenarioCardQuery } from "../types/scenario";

export async function fetchScenarioCards(
    params: ScenarioCardQuery = {}
): Promise<ScenarioCardPagedResult> {
    const token = await getAccessToken();
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            query.append(key, String(value));
        }
    });

    const endpoint = `/api/Scenario/Display${query.toString() ? `?${query.toString()}` : ""}`;

    return serverApi<ScenarioCardPagedResult>(endpoint, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
}
