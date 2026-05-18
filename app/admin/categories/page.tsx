import { requireAdmin } from "@/features/auth/lib/require-admin";
import { getCategoriesList } from "@/features/admin/lib/category-api";
import CategoriesView from "@/features/admin/components/CategoriesView";
import { CategoryTreeNode } from "@/features/instructor/types/course";

// Disable server caching so that we get real-time list on reload
export const revalidate = 0;

export default async function CategoriesPage() {
    // 1. Ensure user has administrative privileges
    await requireAdmin();

    // 2. Fetch category hierarchy tree from backend
    let initialCategories: CategoryTreeNode[] = [];
    try {
        initialCategories = await getCategoriesList();
    } catch (error) {
        console.error("Failed to load category taxonomy list on server component:", error);
        // Safely fail to an empty list
    }

    return (
        <CategoriesView initialCategories={initialCategories} />
    );
}
