"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import CourseFilters, { FilterState } from "@/features/courses/components/course-filters";
import CourseSearchBar from "@/features/courses/components/course-search-bar";
import CourseList from "@/features/courses/components/course-list";
import { searchCourses } from "@/features/courses/lib/public-courses-api";
import { CourseCardDto, CourseSortBy } from "@/features/courses/types";

import { api } from "@/features/auth/lib/api-client";
import { CategoryTreeNode } from "@/features/instructor/types/course";
import { useSearchParams } from "next/navigation";

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [courses, setCourses] = useState<CourseCardDto[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categories list state
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // States for search parameters
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  // Sync URL search params
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);
  const [sortBy, setSortBy] = useState<CourseSortBy>("MostPopular");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<FilterState>({});
  const [isFiltersVisible, setIsFiltersVisible] = useState(true);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoadingCategories(true);
      try {
        const data = await api<CategoryTreeNode[]>("/api/categories");
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await searchCourses({
        search: searchQuery || undefined,
        slugCategory: filters.slugCategory,
        level: filters.level,
        language: filters.language,
        minRating: filters.minRating,
        isFree: filters.isFree,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        hasVRScenarios: filters.hasVRScenarios || undefined,
        sortBy,
        pageNumber: currentPage,
        pageSize: 12, // Matches standard desktop size from API specs
      });

      setCourses(result.items || []);
      setTotalCount(result.totalCount || 0);
      setTotalPages(result.totalPages || 0);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "An unexpected error occurred while fetching courses.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, sortBy, currentPage, filters]);

  // Refetch when search, sort, pagination, or filters change
  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to page 1 on filter changes
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 on search queries
  };

  const handleSortChange = (newSortBy: CourseSortBy) => {
    setSortBy(newSortBy);
    setCurrentPage(1); // Reset to page 1 on sort changes
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of catalog section smoothly
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasActiveFilters =
    filters.level ||
    filters.language ||
    filters.minRating ||
    filters.isFree !== undefined ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.hasVRScenarios ||
    filters.slugCategory;

  const removeFilterKey = (key: keyof FilterState) => {
    const updated = { ...filters };
    delete updated[key];
    setFilters(updated);
    setCurrentPage(1);
  };

  const removePriceFilter = () => {
    const updated = { ...filters };
    delete updated.minPrice;
    delete updated.maxPrice;
    setFilters(updated);
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  const findCategoryName = useCallback((slug: string): string => {
    const searchNode = (nodes: CategoryTreeNode[]): string | null => {
      for (const node of nodes) {
        if (node.slug === slug) return node.name;
        if (node.children) {
          const found = searchNode(node.children);
          if (found) return found;
        }
      }
      return null;
    };
    return searchNode(categories) || slug;
  }, [categories]);

  const renderActiveFilterChips = () => {
    const chips = [];

    if (filters.slugCategory) {
      chips.push(
        <span key="category" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Category: {findCategoryName(filters.slugCategory)}
          <button onClick={() => removeFilterKey("slugCategory")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.level) {
      chips.push(
        <span key="level" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Level: {filters.level}
          <button onClick={() => removeFilterKey("level")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.language) {
      const langNames: Record<string, string> = { en: "English", es: "Spanish", fr: "French", de: "German", zh: "Chinese" };
      chips.push(
        <span key="lang" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Language: {langNames[filters.language] || filters.language}
          <button onClick={() => removeFilterKey("language")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.minRating) {
      chips.push(
        <span key="rating" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Rating: {filters.minRating}+ ⭐
          <button onClick={() => removeFilterKey("minRating")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.isFree !== undefined) {
      chips.push(
        <span key="free" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Price: {filters.isFree ? "Free" : "Paid"}
          <button onClick={() => removeFilterKey("isFree")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      const minText = filters.minPrice !== undefined ? `$${filters.minPrice}` : "$0";
      const maxText = filters.maxPrice !== undefined ? `$${filters.maxPrice}` : "∞";
      chips.push(
        <span key="price-range" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          Range: {minText} - {maxText}
          <button onClick={removePriceFilter} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    if (filters.hasVRScenarios) {
      chips.push(
        <span key="vr" className="inline-flex items-center gap-1.5 bg-brand-peach/50 text-brand-primary border border-brand-border/40 px-3 py-1 rounded-full text-xs font-semibold">
          VR Scenario
          <button onClick={() => removeFilterKey("hasVRScenarios")} className="hover:text-brand-hover font-bold ml-1 text-[16px] leading-none cursor-pointer">×</button>
        </span>
      );
    }

    return chips;
  };

  return (
    <main className={`max-w-container-max mx-auto px-6 py-10 flex flex-col md:flex-row min-h-screen transition-all duration-300 ${isFiltersVisible ? "gap-6" : "gap-0"}`}>
      {/* Sidebar filter section */}
      <div className={`transition-all duration-300 ease-in-out flex-shrink-0 ${isFiltersVisible ? "w-full md:w-64 opacity-100" : "w-0 h-0 md:w-0 overflow-hidden opacity-0 pointer-events-none"}`}>
        <CourseFilters
          filters={filters}
          onChange={handleFilterChange}
          categories={categories}
          isLoadingCategories={isLoadingCategories}
        />
      </div>

      {/* Main catalog results column */}
      <div className="flex-grow space-y-6">
        <CourseSearchBar
          searchQuery={searchQuery}
          sortBy={sortBy}
          onSearchChange={handleSearchChange}
          onSortChange={handleSortChange}
          isFiltersVisible={isFiltersVisible}
          onToggleFilters={() => setIsFiltersVisible(!isFiltersVisible)}
        />

        {/* Quick Clear Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center text-sm animate-fade-in">
            <span className="text-brand-muted text-xs font-bold uppercase tracking-wider mr-1 select-none">Active Filters:</span>
            {renderActiveFilterChips()}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-brand-primary hover:text-brand-hover hover:underline transition-colors ml-2 cursor-pointer"
            >
              Clear All
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
            {error}
          </div>
        )}

        <CourseList
          courses={courses}
          totalCount={totalCount}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isLoading}
          onPageChange={handlePageChange}
          searchQuery={searchQuery}
        />
      </div>
    </main>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="max-w-container-max mx-auto px-6 py-20 text-center min-h-[80vh] flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-brand-primary border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-brand-muted font-medium">Loading courses...</p>
      </div>
    }>
      <CoursesPageContent />
    </Suspense>
  );
}
