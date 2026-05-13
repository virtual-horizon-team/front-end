export enum QuizStatus {
    Published = "Published",
    UnPublished = "UnPublished",
    Draft = "Draft"
}

export interface CreateQuizQuestionRequest {
    question: string;
    choices: string[];
    correctAnswerIndex: number;
    indexOrder: number;
}

export interface CreateQuizRequest {
    title: string;
    durationInMinutes: number;
    status: QuizStatus;
    questions: CreateQuizQuestionRequest[];
}

export interface UpdateQuizQuestionRequest {
    question: string;
    choices: string[];
    correctAnswerIndex: number;
    indexOrder: number;
}

export interface UpdateQuizRequest {
    durationInMinutes: number;
    status: QuizStatus;
    questions: UpdateQuizQuestionRequest[];
}

export interface QuizQuestion {
    tempId: string;
    question: string;
    choices: string[];
    correctAnswerIndex: number;
}

export interface QuizDisplayParams {
    Search?: string;
    SortBy?: "title" | "createdat" | "status" | "duration" | "questions";
    IsDescending?: boolean;
    PageNumber?: number;
    PageSize?: number;
    "Filters[status]"?: string;
    "Filters[duration]"?: string;
    "Filters[questions]"?: string;
    "Filters[resourceId]"?: string;
}

export interface QuizResource {
    id: string;
    resourceType: string;
    title: string;
    createdAt: string;
    userId: string;
}

export interface QuizQuestionDto {
    id: string;
    question: string;
    choices: string[];
    correctAnswerIndex: number;
    indexOrder: number;
    quizId: string;
}

export interface QuizDto {
    id: string;
    title: string;
    numberOfQuestions: number;
    durationInMinutes: number;
    status: string;
    createdAt: string;
    resourceId?: string;
    resource?: QuizResource;
    questions?: QuizQuestionDto[];
}

export interface QuizPagedResult {
    items: QuizDto[];
    totalCount: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}

