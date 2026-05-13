"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    BookOpen,
    Plus,
    Calendar,
    GraduationCap,
    Loader2,
    Image as ImageIcon,
} from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { CourseListItemDto, CourseStatus } from "@/features/instructor/types/course";
import { showToast } from "@/features/instructor/components/Toast";

const statusStyles: Record<string, { bg: string; dot: string }> = {
    Draft: { bg: "bg-orange-50 text-orange-700 border border-orange-200", dot: "bg-orange-500" },
    UnderReview: { bg: "bg-blue-50 text-blue-700 border border-blue-200", dot: "bg-blue-500 animate-pulse" },
    Published: { bg: "bg-green-50 text-green-700 border border-green-200", dot: "bg-green-500" },
    Rejected: { bg: "bg-red-50 text-red-700 border border-red-200", dot: "bg-red-500" },
    Archived: { bg: "bg-brand-soft text-brand-primary border border-brand-primary", dot: "bg-brand-soft0" },
};

function StatusBadge({ status }: { status: string }) {
    const style = statusStyles[status] || statusStyles.Draft;
    const label = status === "UnderReview" ? "Under Review" : status;
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${style.bg}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
            {label}
        </span>
    );
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

export default function CoursesListPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseListItemDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await courseApi.getMyCourses();
            const raw = Array.isArray(res) ? res : [];
            const normalized = raw.map((c: any) => ({
                id: c.id,
                title: c.title,
                thumbnailUrl: c.thumbnailUrl || c.thumbnail || c.ThumbnailUrl || c.Thumbnail || null,
                status: c.status,
                totalLectures: c.totalLectures ?? c.TotalLectures ?? 0,
                createdAt: c.createdAt || c.CreatedAt || "",
            }));
            setCourses(normalized);
        } catch (err: any) {
            console.error("Failed to fetch courses", err);
            showToast("error", "Failed to load courses");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    const handleCreate = async () => {
        setCreating(true);
        try {
            const res = await courseApi.createDraft();
            router.push(`/instructor/courses/${res.id}/manage`);
        } catch (err: any) {
            console.error("Failed to create course", err);
            showToast("error", err.message || "Failed to create course draft");
        } finally {
            setCreating(false);
        }
    };

    return (
        <div className="pt-12 lg:pt-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-text">Courses</h1>
                    <p className="text-brand-muted mt-1">Create and manage your courses.</p>
                </div>
                <div className="flex items-center gap-3">
                    {!loading && (
                        <span className="text-sm text-brand-muted bg-brand-soft px-3 py-1.5 rounded-lg">
                            {courses.length} {courses.length === 1 ? "Course" : "Courses"}
                        </span>
                    )}
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-60"
                    >
                        {creating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        Create Course
                    </button>
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="w-8 h-8 border-2 border-brand-primary border-t-teal-600 rounded-full animate-spin" />
                    <p className="text-brand-muted text-sm">Loading your courses...</p>
                </div>
            ) : courses.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-brand-border">
                    <div className="mx-auto w-16 h-16 rounded-xl bg-brand-soft flex items-center justify-center mb-4">
                        <BookOpen size={28} className="text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-text mb-2">No courses yet</h3>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto mb-6">
                        Start building your first course. You can add lessons, media, and assessments.
                    </p>
                    <button
                        onClick={handleCreate}
                        disabled={creating}
                        className="inline-flex items-center gap-2 bg-brand-primary text-white px-6 py-3 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 cursor-pointer disabled:opacity-60"
                    >
                        {creating ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Plus size={16} />
                        )}
                        Create your first course
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {courses.map((course) => (
                        <div
                            key={course.id}
                            onClick={() => router.push(`/instructor/courses/${course.id}/manage`)}
                            className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden hover:shadow-md hover:border-brand-border transition-all duration-200 cursor-pointer group"
                        >
                            {/* Thumbnail */}
                            <div className="aspect-video bg-brand-soft relative overflow-hidden">
                                {course.thumbnailUrl ? (
                                    <img
                                        src={course.thumbnailUrl}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <ImageIcon size={36} className="text-brand-muted" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    <StatusBadge status={course.status} />
                                </div>
                            </div>

                            {/* Info */}
                            <div className="p-5">
                                <h3 className="text-base font-semibold text-brand-text mb-3 line-clamp-2 leading-snug">
                                    {course.title || "Untitled Course"}
                                </h3>
                                <div className="flex items-center justify-between text-xs text-brand-muted">
                                    <div className="flex items-center gap-1.5">
                                        <GraduationCap size={14} />
                                        <span>{course.totalLectures} {course.totalLectures === 1 ? "lecture" : "lectures"}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} />
                                        <span>{formatDate(course.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
