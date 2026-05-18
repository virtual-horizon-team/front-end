import { api } from "@/features/auth/lib/api-client";

export interface UnderReviewCourse {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    instructorName: string;
    status: "UnderReview" | "Published" | "Rejected" | string;
    createdAt: string;
    categoryId: string;
    categoryName: string;
}

/**
 * Fetches all courses with "UnderReview" status.
 */
export async function getUnderReviewCourses(): Promise<UnderReviewCourse[]> {
    return api<UnderReviewCourse[]>("/api/admin/courses");
}

/**
 * Publishes/approves a course from review status.
 */
export async function publishCourse(courseId: string): Promise<void> {
    return api<void>(`/api/admin/courses/${courseId}/publish`, {
        method: "POST",
    });
}

/**
 * Rejects a course under review with an optional reason.
 */
export async function rejectCourse(courseId: string, reason?: string): Promise<void> {
    return api<void>(`/api/admin/courses/${courseId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason }),
    });
}
