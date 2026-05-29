export type CourseLevel = "Beginner" | "Intermediate" | "Advanced" | "Expert" | "AllLevels";

export type CourseSortBy = "Newest" | "TopRated" | "MostPopular" | "PriceLowHigh" | "PriceHighLow";

export interface InstructorSummaryDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  averageRating: number;
}

export interface CourseCardDto {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string | null;
  price: number | null;
  currency: string | null;
  averageRating: number;
  totalReviews: number;
  totalEnrollments: number;
  totalLectures: number;
  totalDurationMinutes: number;
  level: CourseLevel;
  language: string | null;
  isFree: boolean;
  hasVRScenarios: boolean;
  instructor: InstructorSummaryDto | null;
  tags: string[];
  categoryName: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export interface CourseFilterParams {
  search?: string;
  slugCategory?: string;
  level?: CourseLevel;
  language?: string;
  hasVRScenarios?: boolean;
  isFree?: boolean;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: CourseSortBy;
  pageNumber?: number;
  pageSize?: number;
}

export type CourseResourceType = "Video" | "Document" | "Article" | "Scenario" | "Quiz";

export interface CourseLessonDto {
  id: string;
  title: string;
  orderIndex: number;
  durationMinutes: number | null;
  isPreview: boolean;
  resourceType?: CourseResourceType;
  progress?: {
    lessonId: string;
    watchedSeconds: number;
    isCompleted: boolean;
    completedAt: string | null;
    lastWatchedAt: string | null;
  } | null;
}

export interface CourseSectionDto {
  id: string;
  title: string;
  orderIndex: number;
  totalLessons: number;
  totalDurationMinutes: number;
  lessons: CourseLessonDto[];
}

export interface InstructorDetailDto {
  id: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string | null;
  averageRating: number;
}

export interface CourseReviewDto {
  id: string;
  userId: string;
  userName: string;
  userAvatarUrl: string | null;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface CourseDetailDto {
  id: string;
  title: string;
  subtitle: string | null;
  description: string;
  thumbnailUrl: string | null;
  language: string | null;
  price: number | null;
  currency: string | null;
  hasVRScenarios: boolean;
  isFree: boolean;
  level: CourseLevel;
  status: string;
  averageRating: number;
  totalReviews: number;
  totalEnrollments: number;
  totalLectures: number;
  totalDurationMinutes: number;
  publishedAt: string;
  sections: CourseSectionDto[];
  learningObjectives: string[];
  requirements: string[];
  instructors: InstructorDetailDto[];
  tags: string[];
  categoryName: string | null;
  reviews: CourseReviewDto[];
  isEnrolled?: boolean | null;
}
