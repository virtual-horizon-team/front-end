import { api } from "./api-client";
import { Manifest } from "../types/manifest";

/**
 * Fetches the user capabilities and profile manifest.
 * Can be safely called from Server Components because api-client supports `next/headers`.
 */
export async function getManifest(): Promise<Manifest> {
    return api<Manifest>("/api/Profile/manifest");
}
