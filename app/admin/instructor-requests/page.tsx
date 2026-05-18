import { requireAdmin } from "@/features/auth/lib/require-admin";
import { getInstructorRequests, InstructorRequest } from "@/features/admin/lib/instructor-request-api";
import InstructorRequestsView from "@/features/admin/components/InstructorRequestsView";

// Disable server caching so that we get real-time request lists on reload
export const revalidate = 0;

export default async function InstructorRequestsPage() {
    // 1. Double check authorization at routing level
    await requireAdmin();

    // 2. Fetch requests from backend
    let initialRequests: InstructorRequest[] = [];
    try {
        initialRequests = await getInstructorRequests();
    } catch (error) {
        console.error("Failed to load instructor requests on server component:", error);
        // Safely fail to an empty list, error handling is mounted inside view client component
    }

    return (
        <InstructorRequestsView initialRequests={initialRequests} />
    );
}
