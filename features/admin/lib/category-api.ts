import { api } from "@/features/auth/lib/api-client";
import { CategoryTreeNode } from "@/features/instructor/types/course";

export interface CreateCategoryRequest {
    name: string;
    slug: string;
    parentId?: string | null;
}

export interface UpdateCategoryRequest {
    name: string;
    slug: string;
}

/**
 * Fetches the entire hierarchy tree of course categories with extended 30-second timeout.
 */
export async function getCategoriesList(): Promise<CategoryTreeNode[]> {
    return api<CategoryTreeNode[]>("/api/categories", {
        timeout: 30000
    });
}

/**
 * Creates a brand new course category or subcategory.
 * Cleans up empty/null parentId to prevent backend Guid parser schema validation issues.
 */
export async function createCategory(data: CreateCategoryRequest): Promise<{ id: string; name: string }> {
    const payload: Record<string, any> = {
        name: data.name.trim(),
        slug: data.slug.trim().toLowerCase()
    };

    if (data.parentId && data.parentId.trim() !== "") {
        payload.parentId = data.parentId.trim();
    }

    return api<{ id: string; name: string }>("/api/categories", {
        method: "POST",
        body: JSON.stringify(payload),
        timeout: 30000
    });
}

/**
 * Updates an existing category's name and slug.
 */
export async function updateCategory(id: string, data: UpdateCategoryRequest): Promise<void> {
    return api<void>(`/api/categories/admin/${id}`, {
        method: "PUT",
        body: JSON.stringify({
            name: data.name.trim(),
            slug: data.slug.trim().toLowerCase()
        }),
        timeout: 30000
    });
}

/**
 * Deletes an existing category.
 */
export async function deleteCategory(id: string): Promise<void> {
    return api<void>(`/api/categories/admin/${id}`, {
        method: "DELETE",
        timeout: 30000
    });
}
