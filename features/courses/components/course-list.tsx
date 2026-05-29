import { Inbox } from "lucide-react";
import CourseCard from "./course-card";
import { CourseCardDto } from "../types";

interface CourseListProps {
  courses: CourseCardDto[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  searchQuery?: string;
}

export default function CourseList({
  courses,
  totalCount,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  searchQuery,
}: CourseListProps) {
  // Renders skeleton cards during loading
  const renderSkeletons = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <div
        key={`skeleton-${index}`}
        className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm flex flex-col h-full"
      >
        <div className="h-48 animate-shimmer" />
        <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
          <div className="space-y-2">
            <div className="h-4 animate-shimmer rounded w-3/4" />
            <div className="h-4 animate-shimmer rounded w-1/2" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full animate-shimmer" />
            <div className="h-3 animate-shimmer rounded w-1/3" />
          </div>
          <div className="pt-2 border-t border-brand-border flex justify-between items-center">
            <div className="h-4 animate-shimmer rounded w-1/4" />
            <div className="w-7 h-7 rounded animate-shimmer" />
          </div>
        </div>
      </div>
    ));
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      let start = Math.max(1, currentPage - 2);
      let end = Math.min(totalPages, currentPage + 2);

      if (currentPage <= 3) {
        end = 5;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 4;
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    return pages;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-5 animate-shimmer rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {renderSkeletons()}
        </div>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white border border-brand-border rounded-xl shadow-sm text-center px-4">
        <Inbox className="w-12 h-12 text-brand-muted mb-4" />
        <h3 className="text-lg font-semibold text-brand-navy mb-1">No courses found</h3>
        <p className="text-sm text-brand-muted max-w-md">
          We couldn't find any courses matching your current search query or filters. Try adjusting them.
        </p>
      </div>
    );
  }

  const pageNumbers = getPageNumbers();

  return (
    <div className="space-y-6">
      {/* Search statistics label - matches design text style */}
      <p className="text-sm font-medium text-brand-muted">
        {searchQuery ? (
          <>
            Showing {totalCount} results for "{searchQuery}"
          </>
        ) : (
          <>Showing {totalCount} courses</>
        )}
      </p>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>

      {/* Pagination Container */}
      {totalPages > 1 && (
        <nav className="flex justify-end items-center gap-2 pt-8 select-none">
          {/* Previous Page Box */}
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${currentPage === 1
                ? "border-brand-border text-brand-soft cursor-not-allowed bg-white"
                : "border-brand-border text-brand-text hover:bg-brand-soft/40 cursor-pointer bg-white"
              }`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              chevron_left
            </span>
          </button>

          {/* First Page indicator if gap */}
          {pageNumbers[0] > 1 && (
            <>
              <button
                onClick={() => onPageChange(1)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-brand-border text-brand-text bg-white hover:bg-brand-soft/40 font-semibold text-sm transition-all"
              >
                1
              </button>
              {pageNumbers[0] > 2 && (
                <span className="px-1.5 text-brand-muted text-sm font-semibold">...</span>
              )}
            </>
          )}

          {/* Page numbers */}
          {pageNumbers.map((page) => {
            const isCurrent = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-bold transition-all ${isCurrent
                    ? "bg-brand-primary text-white shadow-sm"
                    : "border border-brand-border text-brand-text bg-white hover:bg-brand-soft/40 font-semibold"
                  }`}
              >
                {page}
              </button>
            );
          })}

          {/* Last Page indicator if gap */}
          {pageNumbers[pageNumbers.length - 1] < totalPages && (
            <>
              {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                <span className="px-1.5 text-brand-muted text-sm font-semibold">...</span>
              )}
              <button
                onClick={() => onPageChange(totalPages)}
                className="w-10 h-10 flex items-center justify-center rounded-lg border border-brand-border text-brand-text bg-white hover:bg-brand-soft/40 font-semibold text-sm transition-all"
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Page Box */}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`w-10 h-10 flex items-center justify-center rounded-lg border transition-all ${currentPage === totalPages
                ? "border-brand-border text-brand-soft cursor-not-allowed bg-white"
                : "border-brand-border text-brand-text hover:bg-brand-soft/40 cursor-pointer bg-white"
              }`}
          >
            <span className="material-symbols-outlined text-[20px] leading-none">
              chevron_right
            </span>
          </button>
        </nav>
      )}
    </div>
  );
}
