import { useState, useEffect } from "react";
import { CourseSortBy } from "../types";

interface CourseSearchBarProps {
  searchQuery: string;
  sortBy: CourseSortBy;
  onSearchChange: (query: string) => void;
  onSortChange: (sortBy: CourseSortBy) => void;
  isFiltersVisible: boolean;
  onToggleFilters: () => void;
}

export default function CourseSearchBar({
  searchQuery,
  sortBy,
  onSearchChange,
  onSortChange,
  isFiltersVisible,
  onToggleFilters,
}: CourseSearchBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);

  // Sync state if searchQuery prop changes externally
  useEffect(() => {
    setInputValue(searchQuery);
  }, [searchQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(inputValue.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchChange(inputValue.trim());
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between w-full">
      {/* Hide/Show Filters toggle button + Search Form wrapper */}
      <div className="flex items-center gap-3 w-full sm:flex-1 sm:max-w-xl">
        <button
          onClick={onToggleFilters}
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 border border-brand-border rounded-lg bg-white text-sm font-semibold text-brand-text hover:bg-brand-soft/40 transition-all cursor-pointer shrink-0 select-none shadow-sm active:scale-95 duration-100"
          title={isFiltersVisible ? "Hide Filters Sidebar" : "Show Filters Sidebar"}
        >
          <span className="material-symbols-outlined text-[20px] leading-none text-brand-primary">
            {isFiltersVisible ? "left_panel_close" : "left_panel_open"}
          </span>
          <span className="hidden sm:inline">
            {isFiltersVisible ? "Hide Filters" : "Filters"}
          </span>
        </button>

        <form onSubmit={handleSubmit} className="relative flex-grow">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted text-[20px]">
            search
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => onSearchChange(inputValue.trim())}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-4 py-2 rounded-lg border border-brand-border bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary text-sm text-brand-text transition-all outline-none"
            placeholder="Search courses, instructors, or topics..."
          />
        </form>
      </div>

      {/* Sort By Select */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-start sm:justify-end">
        <span className="text-sm font-semibold text-brand-muted whitespace-nowrap">Sort By:</span>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as CourseSortBy)}
          className="w-full sm:w-48 bg-white border border-brand-border rounded-lg py-2 px-3 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary cursor-pointer transition-all"
        >
          <option value="MostPopular">Most Popular</option>
          <option value="Newest">Newest First</option>
          <option value="TopRated">Top Rated</option>
          <option value="PriceLowHigh">Price: Low to High</option>
          <option value="PriceHighLow">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
