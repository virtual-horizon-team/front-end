"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Search, BookOpen, Award, ArrowRight, Layers, Flame } from "lucide-react";
import { getMyCourses, EnrolledCourseDto } from "@/features/courses/lib/my-courses-api";

export default function MyCoursesPage() {
  const [courses, setCourses] = useState<EnrolledCourseDto[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<EnrolledCourseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Completed">("All");

  const fetchEnrolledCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch all courses (using high page size to list them cleanly)
      const data = await getMyCourses({ pageSize: 100 });
      setCourses(data.items || []);
      setFilteredCourses(data.items || []);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Failed to load enrolled courses. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  // Handle client-side search and filtering
  useEffect(() => {
    let result = [...courses];

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          (c.subtitle && c.subtitle.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((c) => {
        if (statusFilter === "Completed") return c.progressPercent === 100 || c.completedAt !== null;
        if (statusFilter === "Active") return c.progressPercent < 100 && c.completedAt === null;
        return true;
      });
    }

    setFilteredCourses(result);
  }, [searchQuery, statusFilter, courses]);

  return (
    <main className="max-w-container-max mx-auto px-6 py-10 min-h-screen">
      {/* Header Banner */}
      <div className="mb-10 bg-brand-navy text-white rounded-3xl p-8 md:p-12 relative overflow-hidden shadow-xl border border-brand-border/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-800/10 rounded-full blur-2xl -ml-20 -mb-20 pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/20 border border-brand-primary/30 text-red-300 text-xs font-semibold uppercase tracking-wider mb-4">
            <Flame className="w-3.5 h-3.5 text-brand-primary animate-pulse" />
            Student Workspace
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            My Enrolled Courses
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium leading-relaxed">
            Welcome back! Track your progress, continue your study sessions, and complete your learning goals.
          </p>
        </div>
      </div>

      {/* Control Bar: Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-muted" />
          <input
            type="text"
            placeholder="Search my courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-brand-border rounded-2xl text-[15px] font-medium text-brand-text placeholder-brand-muted/70 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all shadow-sm"
          />
        </div>

        {/* Status Filters */}
        <div className="flex bg-brand-soft p-1 rounded-2xl border border-brand-border w-full md:w-auto">
          {(["All", "Active", "Completed"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`flex-1 md:flex-initial px-6 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                statusFilter === tab
                  ? "bg-white text-brand-primary shadow-sm"
                  : "text-brand-muted hover:text-brand-text"
              }`}
            >
              {tab} Courses
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-medium mb-8">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-white border border-brand-border rounded-3xl overflow-hidden p-5 flex flex-col gap-4 shadow-sm"
            >
              <div className="w-full aspect-video rounded-2xl animate-shimmer" />
              <div className="h-6 w-3/4 rounded animate-shimmer" />
              <div className="h-4 w-1/2 rounded animate-shimmer" />
              <div className="h-2 w-full rounded animate-shimmer mt-2" />
              <div className="h-10 w-full rounded-xl animate-shimmer mt-2" />
            </div>
          ))}
        </div>
      ) : filteredCourses.length > 0 ? (
        /* Course Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.progressPercent === 100 || course.completedAt !== null;
            return (
              <div
                key={course.enrollmentId}
                className="bg-white border border-brand-border rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-brand-primary/20 transition-all duration-200 flex flex-col h-full"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-100 border-b border-brand-border">
                  {course.thumbnailUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={course.thumbnailUrl}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-brand-muted gap-2">
                      <BookOpen className="w-10 h-10 opacity-40" />
                      <span className="text-xs">No Thumbnail</span>
                    </div>
                  )}
                  {isCompleted && (
                    <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                      <Award className="w-3.5 h-3.5" />
                      Completed
                    </div>
                  )}
                </div>

                {/* Info Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex items-center gap-2 text-xs text-brand-muted font-bold uppercase tracking-wider mb-2">
                    <span>{course.level}</span>
                    <span>•</span>
                    <span>{course.totalLectures} Lectures</span>
                  </div>

                  <h3 className="text-[18px] font-bold text-brand-text leading-tight mb-2 hover:text-brand-primary transition-colors line-clamp-1">
                    {course.title}
                  </h3>
                  <p className="text-brand-muted text-sm line-clamp-2 mb-6 min-h-[40px]">
                    {course.subtitle || "No course description provided."}
                  </p>

                  {/* Progress Section */}
                  <div className="mt-auto space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-brand-muted">
                        {course.completedLectures} of {course.totalLectures} completed
                      </span>
                      <span className="text-brand-primary">{Math.round(course.progressPercent)}%</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-brand-soft rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-primary rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 pb-6 pt-0">
                  <Link
                    href={`/my-courses/${course.courseId}`}
                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all duration-150 cursor-pointer ${
                      isCompleted
                        ? "bg-brand-soft text-brand-text hover:bg-brand-border border-transparent"
                        : "bg-brand-primary text-white hover:bg-brand-hover border-transparent hover:gap-3"
                    }`}
                  >
                    {isCompleted ? "Review Course" : "Continue Learning"}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-brand-border rounded-3xl p-8 max-w-xl mx-auto shadow-sm">
          <Layers className="w-16 h-16 text-brand-muted mx-auto mb-6 opacity-30" />
          <h3 className="text-xl font-bold text-brand-text mb-2">
            {searchQuery ? "No courses found" : "Start your learning journey"}
          </h3>
          <p className="text-brand-muted mb-8 max-w-sm mx-auto">
            {searchQuery
              ? `We couldn't find any courses matching "${searchQuery}". Try editing your keywords.`
              : "You haven't enrolled in any courses yet. Explore our top courses and enroll today!"}
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer"
          >
            Browse Course Catalog
            <ArrowRight className="w-4.5 h-4.5" />
          </Link>
        </div>
      )}
    </main>
  );
}
