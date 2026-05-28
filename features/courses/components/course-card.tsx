import { useState } from "react";
import Link from "next/link";
import { CourseCardDto } from "../types";

interface CourseCardProps {
  course: CourseCardDto;
}

export default function CourseCard({ course }: CourseCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Format duration minutes to a readable string (e.g. 14h 20m)
  const formatDuration = (minutes: number) => {
    if (!minutes) return "0m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
  };

  const displayPrice = () => {
    if (course.isFree || !course.price) {
      return <span className="font-serif font-normal text-brand-primary text-[20px]">Free</span>;
    }
    const currencySymbol = course.currency === "USD" ? "$" : course.currency || "$";
    return (
      <span className="font-serif font-normal text-brand-primary text-[20px]">
        {currencySymbol}
        {course.price.toFixed(2)}
      </span>
    );
  };

  // Helper to format review counts in thousands if large
  const formatReviewCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm hover:shadow-[0_15px_30px_rgba(147,0,11,0.05)] hover:border-brand-primary/20 hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full">
      {/* Thumbnail */}
      <div className="h-40 relative overflow-hidden bg-brand-soft/30 flex-shrink-0">
        {course.thumbnailUrl ? (
          <>
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            {/* Soft overlay gradient to create depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-brand-navy/35 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none" />
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-navy via-brand-navy/90 to-brand-muted text-white relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-brand-primary)_0%,_transparent_75%)] opacity-25" />
            <span className="material-symbols-outlined text-[36px] text-white/40 mb-1">school</span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/60">Virtual Horizon Academy</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        {/* Header Title and Instructor */}
        <div className="space-y-2">
          {/* Tags row: category & level on left, VR Scenario on right */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              {course.categoryName && (
                <span className="inline-block text-[10px] font-extrabold text-brand-primary uppercase tracking-widest bg-brand-peach/40 px-1.5 py-0.5 rounded">
                  {course.categoryName}
                </span>
              )}
              <span className="bg-brand-soft px-1.5 py-0.5 rounded text-[10px] font-bold border border-brand-border/60 uppercase tracking-wider text-brand-muted">
                {course.level}
              </span>
            </div>
            {course.hasVRScenarios && (
              <span className="bg-brand-primary text-white px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
                <span className="material-symbols-outlined text-[12px] animate-pulse">view_in_ar</span> VR Enabled
              </span>
            )}
          </div>

          <Link href={`/courses/${course.id}`} className="block">
            <h4 className="font-serif text-[16px] leading-snug font-bold text-brand-navy group-hover:text-brand-primary transition-colors line-clamp-2 min-h-[38px]">
              {course.title}
            </h4>
          </Link>

          {/* Instructor metadata (No avatar) */}
          <p className="text-[11px] font-semibold text-brand-muted">
            by <span className="text-brand-navy font-bold hover:text-brand-primary transition-colors cursor-pointer">{course.instructor?.fullName || "Instructor"}</span>
          </p>
        </div>

        {/* Specs, Rating, Price, and Bookmark */}
        <div className="pt-2.5 border-t border-brand-border space-y-2.5">
          {/* Metadata Specs & Ratings in a single compact line */}
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-muted flex-wrap">
            {/* Rating */}
            <span className="flex items-center gap-0.5 text-amber-500">
              <span className="material-symbols-outlined" style={{ fontSize: "15px", fontVariationSettings: "'FILL' 1, 'wght' 500" }}>star</span>
              <span className="text-brand-navy font-bold">{course.averageRating && course.averageRating > 0 ? course.averageRating.toFixed(1) : "New"}</span>
            </span>
            {course.totalReviews > 0 && (
              <span className="text-brand-muted">({formatReviewCount(course.totalReviews)})</span>
            )}

            <span className="text-brand-border">•</span>

            {/* Lectures */}
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">menu_book</span>
              {course.totalLectures} {course.totalLectures === 1 ? "lecture" : "lectures"}
            </span>

            <span className="text-brand-border">•</span>

            {/* Duration */}
            <span className="flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[13px]">schedule</span>
              {formatDuration(course.totalDurationMinutes)}
            </span>
          </div>

          {/* Footer of the card: Price & Bookmark */}
          <div className="flex items-center justify-between pt-1">
            {displayPrice()}

            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsBookmarked(!isBookmarked);
              }}
              className="p-1 rounded-lg text-brand-primary hover:bg-brand-peach/40 transition-all active:scale-90 duration-150 cursor-pointer select-none"
              title={isBookmarked ? "Remove Bookmark" : "Save Course"}
            >
              <span
                className="material-symbols-outlined text-[18px] leading-none transition-all duration-150"
                style={{ fontVariationSettings: isBookmarked ? "'FILL' 1, 'wght' 400" : "'FILL' 0, 'wght' 400" }}
              >
                {isBookmarked ? "bookmark" : "bookmark_add"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
