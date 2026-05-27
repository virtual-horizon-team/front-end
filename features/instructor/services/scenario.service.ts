import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { serverApi } from "@/features/auth/lib/server-api-client";
import {
    ScenarioCardPagedResult,
    ScenarioCardQuery,
    ScenarioDisplayDto,
    ScenarioMetadataResult,
} from "../types/scenario";

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

/** GET /api/scenario/{scenarioId} — public, no auth needed */
export async function fetchScenarioDisplay(id: string): Promise<ScenarioDisplayDto> {
    return serverApi<ScenarioDisplayDto>(`/api/scenario/${id}`);
}

/** GET /api/scenario/{scenarioId}/Metadata — public, no auth needed */
export async function fetchScenarioMetadata(id: string): Promise<ScenarioMetadataResult> {
    return serverApi<ScenarioMetadataResult>(`/api/scenario/${id}/Metadata`);
}

/** PUT /api/scenario/{id}/Metadata — update scenario metadata */
export async function updateScenarioMetadata(
    id: string,
    metadata: import("../types/scenario").ScenarioMetadataDto
): Promise<ScenarioMetadataResult> {
    const token = await getAccessToken();
    if (!token) throw new Error("Unauthorized");

    return serverApi<ScenarioMetadataResult>(`/api/scenario/${id}/Metadata`, {
        method: "PUT",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(metadata),
    });
}
