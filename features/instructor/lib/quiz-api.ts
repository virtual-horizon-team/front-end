import { api } from "@/features/auth/lib/api-client";
import { CreateQuizRequest, QuizDisplayParams, UpdateQuizRequest, QuizDto, QuizPagedResult } from "../types/quiz";

export const quizApi = {
    createQuiz: (data: CreateQuizRequest) => {
        return api<{ quizId: string }>(
            "/api/Quiz/create",
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
    },

    getQuiz: (quizId: string) => {
        return api<QuizDto>(`/api/Quiz/${quizId}`);
    },

    updateQuiz: (quizId: string, data: UpdateQuizRequest) => {
        return api<void>(`/api/Quiz/${quizId}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    deleteQuiz: (quizId: string) => {
        return api<void>(`/api/Quiz/${quizId}`, {
            method: "DELETE",
        });
    },

    fetchQuizzes: (params: QuizDisplayParams = {}) => {
        const urlParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                urlParams.append(key, value.toString());
            }
        });
        const qs = urlParams.toString();
        const url = `/api/Quiz/display${qs ? `?${qs}` : ""}`;
        return api<QuizPagedResult>(url);
    },
};
