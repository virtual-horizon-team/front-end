import { api } from "@/features/auth/lib/api-client";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { API_BASE_URL as BASE_URL } from "@/lib/config";
import {
    CourseManageDto,
    CourseListItemDto,
    CategoryTreeNode,
    TagSearchResult,
    CourseSectionDto,
    CourseLessonDto,
} from "../types/course";

export const courseApi = {
    getMyCourses: () => {
        return api<CourseListItemDto[]>("/api/courses/my");
    },

    createDraft: () => {
        return api<{ id: string }>("/api/courses", {
            method: "POST",
            body: JSON.stringify({ title: "Untitled Course" }),
        });
    },

    getCourseManage: (courseId: string) => {
        return api<CourseManageDto>(`/api/courses/${courseId}/manage`);
    },

    updateBasicInfo: (courseId: string, data: {
        title: string;
        subtitle?: string | null;
        description?: string | null;
        language?: string | null;
        level?: string | null;
    }) => {
        return api<void>(`/api/courses/${courseId}/basic-info`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    updateThumbnail: async (courseId: string, file: File): Promise<CourseManageDto> => {
        const token = await getAccessToken();
        const formData = new FormData();
        formData.append("thumbnail", file);

        const response = await fetch(`${BASE_URL}/api/courses/${courseId}/thumbnail`, {
            method: "PATCH",
            headers: {
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: formData,
        });

        if (response.status === 403) {
            if (typeof window !== "undefined") {
                window.location.href = "/forbidden";
                return new Promise(() => {}) as Promise<CourseManageDto>;
            }
        }

        if (!response.ok) {
            let errorMessage = `Upload failed with status ${response.status}`;
            try {
                const data = await response.json();
                errorMessage = data.error || data.message || data.title || errorMessage;
            } catch {
                const text = await response.text();
                if (text) errorMessage = text;
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    updatePricing: (courseId: string, data: {
        price: number;
        currency: string;
    }) => {
        return api<void>(`/api/courses/${courseId}/pricing`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    updateObjectives: (courseId: string, items: string[]) => {
        return api<void>(`/api/courses/${courseId}/objectives`, {
            method: "PUT",
            body: JSON.stringify({ items }),
        });
    },

    updateRequirements: (courseId: string, items: string[]) => {
        return api<void>(`/api/courses/${courseId}/requirements`, {
            method: "PUT",
            body: JSON.stringify({ items }),
        });
    },

    updateMessages: (courseId: string, data: {
        welcomeMessage?: string | null;
        congratulationMessage?: string | null;
    }) => {
        return api<void>(`/api/courses/${courseId}/messages`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    submitForReview: (courseId: string) => {
        return api<void>(`/api/courses/${courseId}/submit`, {
            method: "POST",
        });
    },

    // Sections
    createSection: (courseId: string, data: { title: string }) => {
        return api<CourseSectionDto>(`/api/courses/${courseId}/sections`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    updateSection: (courseId: string, sectionId: string, data: { title: string }) => {
        return api<void>(`/api/courses/${courseId}/sections/${sectionId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    deleteSection: (courseId: string, sectionId: string) => {
        return api<void>(`/api/courses/${courseId}/sections/${sectionId}`, {
            method: "DELETE",
        });
    },

    reorderSections: (courseId: string, sectionIds: string[]) => {
        return api<void>(`/api/courses/${courseId}/sections/reorder`, {
            method: "PUT",
            body: JSON.stringify({ orderedIds: sectionIds }),
        });
    },

    // Lessons
    createLesson: (sectionId: string, data: { title: string }) => {
        return api<CourseLessonDto>(`/api/sections/${sectionId}/lessons`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    updateLesson: (sectionId: string, lessonId: string, data: { title: string }) => {
        return api<void>(`/api/sections/${sectionId}/lessons/${lessonId}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    },

    deleteLesson: (sectionId: string, lessonId: string) => {
        return api<void>(`/api/sections/${sectionId}/lessons/${lessonId}`, {
            method: "DELETE",
        });
    },

    reorderLessons: (sectionId: string, lessonIds: string[]) => {
        return api<void>(`/api/sections/${sectionId}/lessons/reorder`, {
            method: "PUT",
            body: JSON.stringify({ orderedIds: lessonIds }),
        });
    },

    toggleLessonPreview: (sectionId: string, lessonId: string) => {
        return api<void>(`/api/sections/${sectionId}/lessons/${lessonId}/preview`, {
            method: "PATCH",
        });
    },

    attachLessonResource: (sectionId: string, lessonId: string, data: { resourceId: string }) => {
        return api<void>(`/api/sections/${sectionId}/lessons/${lessonId}/resource`, {
            method: "POST",
            body: JSON.stringify(data),
        });
    },

    // Categories
    getCategories: () => {
        return api<CategoryTreeNode[]>("/api/categories");
    },

    addCourseCategory: (courseId: string, categoryId: string) => {
        return api<void>(`/api/courses/${courseId}/categories`, {
            method: "POST",
            body: JSON.stringify({ categoryId }),
        });
    },

    removeCourseCategory: (courseId: string, categoryId: string) => {
        return api<void>(`/api/courses/${courseId}/categories/${categoryId}`, {
            method: "DELETE",
        });
    },

    // Tags
    searchTags: (query: string) => {
        return api<TagSearchResult[]>(`/api/tags/search?q=${encodeURIComponent(query)}`);
    },

    addCourseTag: (courseId: string, name: string) => {
        return api<CourseManageDto["tags"][0]>(`/api/courses/${courseId}/tags`, {
            method: "POST",
            body: JSON.stringify({ name }),
        });
    },

    removeCourseTag: (courseId: string, tagId: string) => {
        return api<void>(`/api/courses/${courseId}/tags/${tagId}`, {
            method: "DELETE",
        });
    },
};
