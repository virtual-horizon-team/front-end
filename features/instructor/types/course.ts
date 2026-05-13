export enum CourseStatus {
    Draft = "Draft",
    UnderReview = "UnderReview",
    Published = "Published",
    Rejected = "Rejected",
    Archived = "Archived",
}

export enum CourseLevel {
    Beginner = "Beginner",
    Intermediate = "Intermediate",
    Advanced = "Advanced",
    Expert = "Expert",
    AllLevels = "AllLevels",
}

export interface CourseLessonDto {
    id: string;
    title: string;
    durationInSeconds: number | null;
    isPreview: boolean;
    order: number;
    resourceId: string | null;
    resourceType: string | null;
    videoStatus: string | null;
}

export interface CourseSectionDto {
    id: string;
    title: string;
    order: number;
    lessons: CourseLessonDto[];
}

export interface CourseCategoryDto {
    id: string;
    name: string;
    parentId: string | null;
}

export interface CourseTagDto {
    id: string;
    name: string;
}

export interface CourseInstructorDto {
    id: string;
    name: string;
    avatarUrl: string | null;
}

export interface CourseManageDto {
    id: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    language: string | null;
    level: string | null;
    thumbnailUrl: string | null;
    price: number | null;
    currency: string | null;
    status: string;
    rejectionReason: string | null;
    welcomeMessage: string | null;
    congratulationMessage: string | null;
    objectives: string[];
    requirements: string[];
    sections: CourseSectionDto[];
    categories: CourseCategoryDto[];
    tags: CourseTagDto[];
    instructors: CourseInstructorDto[];
    totalLectures: number;
    createdAt: string;
    updatedAt: string;
}

export interface CourseListItemDto {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    status: string;
    totalLectures: number;
    createdAt: string;
}

export interface CourseListResult {
    items: CourseListItemDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

export interface CategoryTreeNode {
    id: string;
    name: string;
    parentId: string | null;
    children: CategoryTreeNode[];
}

export interface TagSearchResult {
    id: string;
    name: string;
}
