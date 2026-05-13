import { redirect } from "next/navigation";
import { getManifest } from "./manifest-api";
import { Capabilities } from "../types/manifest";

/**
 * Server-side route guard. 
 * Fetches the user manifest and ensures the user has the required capability.
 * If not, it redirects them to the /forbidden page.
 * 
 * @param capabilityKey The key of the capability to check (e.g. 'isInstructor')
 */
export async function requireCapability(capabilityKey: keyof Capabilities): Promise<void> {
    try {
        const manifest = await getManifest();
        
        if (!manifest.capabilities[capabilityKey]) {
            redirect("/forbidden");
        }
    } catch (error) {
        // If it's already a navigation error (like NEXT_REDIRECT thrown by api-client.ts on 403), rethrow it so Next.js handles the redirect
        if (error instanceof Error && error.message === "NEXT_REDIRECT") {
            throw error;
        }

        console.error(`Error in requireCapability checking ${capabilityKey}:`, error);
        
        // If fetching manifest fails entirely (e.g. invalid token not caught by middleware), we safely redirect to login or forbidden
        redirect("/forbidden");
    }
}
