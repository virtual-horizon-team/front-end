import { api } from "@/features/auth/lib/api-client";
import { CourseCardDto, CourseFilterParams, PagedResult, CourseDetailDto } from "../types";

export async function searchCourses(params: CourseFilterParams): Promise<PagedResult<CourseCardDto>> {
  const query = new URLSearchParams();
  
  if (params.search) query.append("Search", params.search);
  if (params.slugCategory) query.append("SlugCategory", params.slugCategory);
  if (params.level && params.level !== "AllLevels") query.append("Level", params.level);
  if (params.language) query.append("Language", params.language);
  
  if (params.hasVRScenarios !== undefined) {
    query.append("HasVRScenarios", String(params.hasVRScenarios));
  }
  
  if (params.isFree !== undefined) {
    query.append("IsFree", String(params.isFree));
  }
  
  if (params.minPrice !== undefined && params.minPrice > 0) {
    query.append("MinPrice", String(params.minPrice));
  }
  
  if (params.maxPrice !== undefined && params.maxPrice > 0) {
    query.append("MaxPrice", String(params.maxPrice));
  }
  
  if (params.minRating !== undefined && params.minRating > 0) {
    query.append("MinRating", String(params.minRating));
  }
  
  if (params.sortBy) {
    query.append("SortBy", params.sortBy);
  }
  
  if (params.pageNumber) {
    query.append("PageNumber", String(params.pageNumber));
  }
  
  if (params.pageSize) {
    query.append("PageSize", String(params.pageSize));
  }

  const queryString = query.toString();
  const endpoint = `/api/public/courses${queryString ? `?${queryString}` : ""}`;
  
  return api<PagedResult<CourseCardDto>>(endpoint);
}

export async function getCourseDetails(id: string): Promise<CourseDetailDto> {
  return api<CourseDetailDto>(`/api/public/courses/${id}`);
}

export interface LessonPreviewDto {
  resourceId: string;
  resourceType: "Document" | "Video" | string;
  streamUrl: string | null;
  downloadUrl: string;
  expiresAt: string;
}

export async function getLessonPreview(lessonId: string, resourceType: string): Promise<LessonPreviewDto> {
  return api<LessonPreviewDto>(`/api/public/lesson-preview?lessonId=${lessonId}&resourceType=${resourceType}`);
}

