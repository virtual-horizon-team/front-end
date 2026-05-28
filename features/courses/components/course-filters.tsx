import { useState, useEffect } from "react";
import { Check } from "lucide-react";
import { CourseLevel } from "../types";
import { CategoryTreeNode } from "@/features/instructor/types/course";

export interface FilterState {
  level?: CourseLevel;
  language?: string;
  minRating?: number;
  isFree?: boolean; // undefined = All, true = Free, false = Paid
  minPrice?: number;
  maxPrice?: number;
  hasVRScenarios?: boolean;
  slugCategory?: string;
}

interface CourseFiltersProps {
  filters: FilterState;
  onChange: (updatedFilters: FilterState) => void;
  categories: CategoryTreeNode[];
  isLoadingCategories: boolean;
}

function CategoryNode({
  node,
  depth,
  selectedSlug,
  expandedCategories,
  onToggleExpand,
  onSelect,
  matchesSearch,
}: {
  node: CategoryTreeNode;
  depth: number;
  selectedSlug?: string;
  expandedCategories: Record<string, boolean>;
  onToggleExpand: (id: string) => void;
  onSelect: (slug?: string) => void;
  matchesSearch: (node: CategoryTreeNode) => boolean;
}) {
  const isSelected = selectedSlug === node.slug;
  const hasChildren = node.children && node.children.length > 0;
  const isExpanded = !!expandedCategories[node.id];

  const shouldRender = matchesSearch(node);
  if (!shouldRender) return null;

  return (
    <div className="space-y-1">
      <div
        className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg text-sm transition-all group/node ${
          isSelected
            ? "bg-brand-peach text-brand-primary font-bold shadow-sm"
            : "text-brand-text hover:bg-brand-soft hover:text-brand-primary"
        }`}
        style={{ paddingLeft: `${depth * 12 + 10}px` }}
      >
        <button
          onClick={() => onSelect(isSelected ? undefined : node.slug)}
          className="flex-grow text-left truncate cursor-pointer font-medium"
        >
          {node.name}
        </button>
        {hasChildren && (
          <button
            onClick={() => onToggleExpand(node.id)}
            className="p-0.5 text-brand-muted hover:text-brand-primary transition-colors cursor-pointer rounded hover:bg-brand-soft"
          >
            <span className={`material-symbols-outlined text-[16px] leading-none transition-transform duration-250 ${isExpanded ? "rotate-90" : ""}`}>
              chevron_right
            </span>
          </button>
        )}
      </div>
      {hasChildren && isExpanded && (
        <div className="space-y-1 mt-0.5">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedSlug={selectedSlug}
              expandedCategories={expandedCategories}
              onToggleExpand={onToggleExpand}
              onSelect={onSelect}
              matchesSearch={matchesSearch}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CourseFilters({ filters, onChange, categories, isLoadingCategories }: CourseFiltersProps) {
  const [minPriceInput, setMinPriceInput] = useState<string>(filters.minPrice?.toString() || "");
  const [maxPriceInput, setMaxPriceInput] = useState<string>(filters.maxPrice?.toString() || "");
  const [searchCategoryQuery, setSearchCategoryQuery] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Update input fields if filters state changes externally
  useEffect(() => {
    setMinPriceInput(filters.minPrice?.toString() || "");
    setMaxPriceInput(filters.maxPrice?.toString() || "");
  }, [filters.minPrice, filters.maxPrice]);

  // Auto-expand parents that have children matching search query
  useEffect(() => {
    if (searchCategoryQuery) {
      const newExpanded: Record<string, boolean> = {};
      const autoExpand = (nodes: CategoryTreeNode[]) => {
        nodes.forEach(node => {
          const hasMatchingChild = node.children && node.children.some(child => {
            const matchesSelf = child.name.toLowerCase().includes(searchCategoryQuery.toLowerCase());
            const matchesChild = child.children && child.children.some(c => matchesSelf || c.name.toLowerCase().includes(searchCategoryQuery.toLowerCase()));
            return matchesSelf || matchesChild;
          });
          if (hasMatchingChild) {
            newExpanded[node.id] = true;
          }
          if (node.children) {
            autoExpand(node.children);
          }
        });
      };
      autoExpand(categories);
      setExpandedCategories(prev => ({ ...prev, ...newExpanded }));
    }
  }, [searchCategoryQuery, categories]);

  const matchesSearch = (node: CategoryTreeNode): boolean => {
    if (!searchCategoryQuery) return true;
    const matchesSelf = node.name.toLowerCase().includes(searchCategoryQuery.toLowerCase());
    const matchesChild = node.children && node.children.some(child => matchesSearch(child));
    return matchesSelf || matchesChild;
  };

  const handleLevelChange = (level: CourseLevel) => {
    const isCurrentlySelected = filters.level === level;
    onChange({
      ...filters,
      level: isCurrentlySelected ? undefined : level,
    });
  };

  const handlePriceTypeChange = (type: "all" | "free" | "paid") => {
    let isFreeValue: boolean | undefined;
    if (type === "free") isFreeValue = true;
    if (type === "paid") isFreeValue = false;

    onChange({
      ...filters,
      isFree: isFreeValue,
      minPrice: type === "free" ? undefined : filters.minPrice,
      maxPrice: type === "free" ? undefined : filters.maxPrice,
    });
  };

  const handlePriceSubmit = () => {
    const min = minPriceInput ? parseFloat(minPriceInput) : undefined;
    const max = maxPriceInput ? parseFloat(maxPriceInput) : undefined;
    onChange({
      ...filters,
      minPrice: min,
      maxPrice: max,
    });
  };

  const clearAllFilters = () => {
    onChange({});
    setMinPriceInput("");
    setMaxPriceInput("");
    setSearchCategoryQuery("");
  };

  return (
    <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h3 className="text-[24px] font-bold text-brand-primary">Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs font-semibold text-brand-primary hover:text-brand-hover transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Category Filter Section */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Categories</p>
          {filters.slugCategory && (
            <button
              onClick={() => onChange({ ...filters, slugCategory: undefined })}
              className="text-[10px] font-bold text-brand-primary hover:text-brand-hover hover:underline transition-colors cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Search Input */}
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 material-symbols-outlined text-[15px] text-brand-muted select-none">
            search
          </span>
          <input
            type="text"
            placeholder="Search categories..."
            value={searchCategoryQuery}
            onChange={(e) => setSearchCategoryQuery(e.target.value)}
            className="w-full pl-8 pr-7 py-1.5 rounded-lg border border-brand-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-xs text-brand-text transition-all outline-none"
          />
          {searchCategoryQuery && (
            <button
              onClick={() => setSearchCategoryQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary text-[14px] font-bold cursor-pointer"
            >
              ×
            </button>
          )}
        </div>

        {/* Categories Tree list */}
        <div className="space-y-1 max-h-60 overflow-y-auto pr-1">
          {isLoadingCategories ? (
            <div className="space-y-2 py-2">
              <div className="h-6 bg-brand-soft animate-shimmer rounded w-4/5" />
              <div className="h-6 bg-brand-soft animate-shimmer rounded w-3/4 pl-3" />
              <div className="h-6 bg-brand-soft animate-shimmer rounded w-2/3 animate-pulse" />
            </div>
          ) : categories.length === 0 ? (
            <p className="text-xs text-brand-muted py-2 select-none">No categories found.</p>
          ) : (
            categories.map((cat) => (
              <CategoryNode
                key={cat.id}
                node={cat}
                depth={0}
                selectedSlug={filters.slugCategory}
                expandedCategories={expandedCategories}
                onToggleExpand={(id) =>
                  setExpandedCategories((prev) => ({ ...prev, [id]: !prev[id] }))
                }
                onSelect={(slug) => onChange({ ...filters, slugCategory: slug })}
                matchesSearch={matchesSearch}
              />
            ))
          )}
        </div>
      </div>

      {/* Level Filter */}
      <div className="space-y-3 pt-4 border-t border-brand-border">
        <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Level</p>
        <div className="space-y-2">
          {(["Beginner", "Intermediate", "Advanced", "Expert"] as CourseLevel[]).map((lvl) => {
            const isSelected = filters.level === lvl;
            return (
              <label
                key={lvl}
                className="flex items-center gap-3 cursor-pointer p-0.5 rounded transition-all select-none group"
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleLevelChange(lvl)}
                  className="w-4 h-4 rounded border-brand-border text-brand-primary focus:ring-brand-primary cursor-pointer accent-brand-primary"
                />
                <span className="text-sm font-medium text-brand-text group-hover:text-brand-primary transition-colors">
                  {lvl}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Language Filter */}
      <div className="space-y-2 pt-4 border-t border-brand-border">
        <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Language</p>
        <select
          value={filters.language || ""}
          onChange={(e) => onChange({ ...filters, language: e.target.value || undefined })}
          className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary cursor-pointer transition-all"
        >
          <option value="">All Languages</option>
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          <option value="zh">Chinese</option>
        </select>
      </div>

      {/* Rating Filter */}
      <div className="space-y-2 pt-4 border-t border-brand-border">
        <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Minimum Rating</p>
        <select
          value={filters.minRating || ""}
          onChange={(e) => onChange({ ...filters, minRating: e.target.value ? parseFloat(e.target.value) : undefined })}
          className="w-full bg-white border border-brand-border rounded-lg py-2 px-3 text-sm text-brand-text focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary cursor-pointer transition-all"
        >
          <option value="">Any Rating</option>
          <option value="4.5">4.5 & up</option>
          <option value="4.0">4.0 & up</option>
          <option value="3.5">3.5 & up</option>
          <option value="3.0">3.0 & up</option>
        </select>
      </div>

      {/* Price Type Tabs */}
      <div className="space-y-2 pt-4 border-t border-brand-border">
        <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Price Type</p>
        <div className="flex bg-brand-soft rounded-lg p-1 border border-brand-border/40">
          <button
            onClick={() => handlePriceTypeChange("all")}
            className={`flex-1 py-1 text-center rounded-md text-xs font-semibold transition-all ${
              filters.isFree === undefined
                ? "bg-white text-brand-text shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            All
          </button>
          <button
            onClick={() => handlePriceTypeChange("free")}
            className={`flex-1 py-1 text-center rounded-md text-xs font-semibold transition-all ${
              filters.isFree === true
                ? "bg-white text-brand-text shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            Free
          </button>
          <button
            onClick={() => handlePriceTypeChange("paid")}
            className={`flex-1 py-1 text-center rounded-md text-xs font-semibold transition-all ${
              filters.isFree === false
                ? "bg-white text-brand-text shadow-sm"
                : "text-brand-muted hover:text-brand-text"
            }`}
          >
            Paid
          </button>
        </div>
      </div>

      {/* Price Range */}
      {filters.isFree !== true && (
        <div className="space-y-2 pt-4 border-t border-brand-border">
          <p className="text-xs font-bold tracking-wider text-brand-muted uppercase">Price Range</p>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-brand-muted">$</span>
              <input
                type="number"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                onBlur={handlePriceSubmit}
                onKeyDown={(e) => e.key === "Enter" && handlePriceSubmit()}
                className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-brand-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm text-brand-text transition-all outline-none"
              />
            </div>
            <span className="text-brand-border">-</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-sm text-brand-muted">$</span>
              <input
                type="number"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                onBlur={handlePriceSubmit}
                onKeyDown={(e) => e.key === "Enter" && handlePriceSubmit()}
                className="w-full pl-6 pr-2 py-1.5 rounded-lg border border-brand-border bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary focus:border-brand-primary text-sm text-brand-text transition-all outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* VR Toggle */}
      <div className="space-y-2 pt-4 border-t border-brand-border">
        <label className="flex items-center justify-between cursor-pointer select-none">
          <span className="text-xs font-bold tracking-wider text-brand-muted uppercase">HAS VR SCENARIOS</span>
          <button
            onClick={() => onChange({ ...filters, hasVRScenarios: !filters.hasVRScenarios })}
            className="focus:outline-none"
          >
            <div
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                filters.hasVRScenarios ? "bg-brand-primary" : "bg-brand-soft border border-brand-border"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${
                  filters.hasVRScenarios ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </div>
          </button>
        </label>
      </div>
    </aside>
  );
}
