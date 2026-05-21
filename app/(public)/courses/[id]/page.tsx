import Link from "next/link";
import { Metadata } from "next";
import { getCourseDetails } from "@/features/courses/lib/public-courses-api";
import { getSession } from "@/features/auth/lib/get-session";
import CourseDetailsClient from "@/features/courses/components/course-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  try {
    const course = await getCourseDetails(id);
    return {
      title: `${course.title} | Virtual Horizon`,
      description: course.subtitle || course.description.slice(0, 155) || `Enroll in ${course.title} on Virtual Horizon.`,
    };
  } catch (error) {
    return {
      title: "Course Details | Virtual Horizon",
      description: "Explore advanced course curricula on Virtual Horizon.",
    };
  }
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();
  
  try {
    const course = await getCourseDetails(id);
    return <CourseDetailsClient course={course} session={session} />;
  } catch (error) {
    console.error("Failed to load course details:", error);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-brand-bg px-6">
        <span className="material-symbols-outlined text-brand-primary text-6xl leading-none">error</span>
        <h1 className="font-serif text-2xl text-brand-navy font-normal text-center">Course Not Found</h1>
        <p className="text-brand-muted text-center max-w-md">
          The course you are looking for may have been unpublished, deleted, or the link is invalid.
        </p>
        <Link
          href="/courses"
          className="mt-4 bg-brand-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-hover transition-all active:scale-95 duration-200"
        >
          Browse All Courses
        </Link>
      </div>
    );
  }
}
