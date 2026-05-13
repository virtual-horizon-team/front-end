import CourseEditorPage from "@/features/instructor/components/courses/CourseEditorPage";

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function CourseManagePage({ params }: PageProps) {
    const { id } = await params;
    return <CourseEditorPage courseId={id} />;
}
