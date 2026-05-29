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
  /** The underlying resource ID (e.g. scenarioId for Scenario lessons) */
  resourceId?: string | null;
  scenarioId?: string | null;
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
  courseId?: string;
  userId?: string;
  userName?: string;
  studentName?: string;
  userAvatarUrl?: string | null;
  studentAvatarUrl?: string | null;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CourseReviewRequest {
  rating: number;
  comment?: string;
}

export interface ProfileResult {
  profileId: string;
  profileType: string;
  userId: string;
  name: string;
  bio: string | null;
  phone: string | null;
  country: string;
  gender: string;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  totalEnrollments: number;
  yearsOfExperience: number | null;
  averageRating: number | null;
  totalReview: number | null;
  requestId: string | null;
  createdAt: string | null;
  updatedAt: string | null;
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
