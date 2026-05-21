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
    <div className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm hover:shadow-[0_20px_40px_rgba(147,0,11,0.06)] hover:-translate-y-1.5 transition-all duration-300 group flex flex-col h-full">
      {/* Thumbnail and absolute badges */}
      <div className="h-48 relative overflow-hidden bg-brand-soft/30 flex-shrink-0">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-brand-muted bg-brand-soft">
            <span className="text-xs font-semibold uppercase tracking-wider">No Preview Available</span>
          </div>
        )}
        
        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          {course.categoryName && (
            <span className="bg-brand-peach text-brand-primary px-3 py-1 rounded-full text-xs font-semibold tracking-wide">
              {course.categoryName}
            </span>
          )}
          {course.hasVRScenarios && (
            <span className="bg-brand-primary text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
              <span className="material-symbols-outlined text-[14px]">view_in_ar</span> VR Scenario
            </span>
          )}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex flex-col flex-grow justify-between space-y-4">
        {/* Header Title and Instructor */}
        <div className="space-y-3">
          <Link href={`/courses/${course.id}`} className="block">
            <h4 className="font-serif text-[18px] leading-snug font-normal text-brand-text group-hover:text-brand-primary transition-colors line-clamp-2 min-h-[44px]">
              {course.title}
            </h4>
          </Link>

          {/* Instructor metadata */}
          <div className="flex items-center gap-2">
            {course.instructor?.avatarUrl ? (
              <img
                src={course.instructor.avatarUrl}
                alt={course.instructor.fullName}
                className="w-8 h-8 rounded-full object-cover border border-brand-border"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-brand-soft text-brand-primary flex items-center justify-center font-bold text-xs">
                {course.instructor?.fullName?.charAt(0) || "I"}
              </div>
            )}
            <span className="text-sm font-medium text-brand-muted line-clamp-1">
              {course.instructor?.fullName || "Instructor"}
            </span>
          </div>
        </div>

        {/* Rating, Duration, Price, and Bookmark */}
        <div className="pt-3 border-t border-brand-border space-y-3">
          <div className="flex items-center justify-between">
            {/* Star Rating details */}
            <div className="flex items-center gap-1">
              <span 
                className="material-symbols-outlined text-[18px] text-brand-primary" 
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 400" }}
              >
                star
              </span>
              <span className="text-sm font-bold text-brand-text">
                {course.averageRating ? course.averageRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-brand-muted font-medium">
                ({formatReviewCount(course.totalReviews)})
              </span>
            </div>
            
            {/* Clock Duration details */}
            <div className="flex items-center gap-1 text-brand-muted">
              <span className="material-symbols-outlined text-[16px] text-brand-muted">
                schedule
              </span>
              <span className="text-xs font-semibold">
                {formatDuration(course.totalDurationMinutes)}
              </span>
            </div>
          </div>

          {/* Footer of the card: Price & Bookmark */}
          <div className="flex items-center justify-between pt-1">
            {displayPrice()}
            
            <button
              onClick={() => setIsBookmarked(!isBookmarked)}
              className="p-1.5 rounded-lg text-brand-primary hover:bg-brand-peach/40 transition-all active:scale-90 duration-150 cursor-pointer select-none"
              title={isBookmarked ? "Remove Bookmark" : "Save Course"}
            >
              <span 
                className="material-symbols-outlined text-[22px] leading-none transition-all duration-150"
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
