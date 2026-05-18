import { requireAdmin } from "@/features/auth/lib/require-admin";
import AppVersionsView from "@/features/admin/components/AppVersionsView";

// Disable server caching so that we get real-time view components
export const revalidate = 0;

export default async function AppVersionsPage() {
    // 1. Ensure user has administrative privileges
    await requireAdmin();

    return (
        <AppVersionsView />
    );
}
