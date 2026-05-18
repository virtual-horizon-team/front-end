import { requireAdmin } from "@/features/auth/lib/require-admin";
import { getUnderReviewCourses, UnderReviewCourse } from "@/features/admin/lib/course-review-api";
import CourseReviewsView from "@/features/admin/components/CourseReviewsView";

// Disable server caching so that we get real-time lists on reload
export const revalidate = 0;

export default async function CourseReviewsPage() {
    // 1. Ensure user has administrative privileges
    await requireAdmin();

    // 2. Fetch pending courses from backend
    let initialCourses: UnderReviewCourse[] = [];
    try {
        initialCourses = await getUnderReviewCourses();
    } catch (error) {
        console.error("Failed to load under review courses on server component:", error);
        // Safely fail to an empty list
    }

    return (
        <CourseReviewsView initialCourses={initialCourses} />
    );
}
