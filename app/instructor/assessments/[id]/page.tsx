"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { quizApi } from "@/features/instructor/lib/quiz-api";
import {
    QuizStatus,
    QuizQuestion,
    UpdateQuizQuestionRequest,
    UpdateQuizRequest,
} from "@/features/instructor/types/quiz";
import QuizForm, { QuizFormData, generateId } from "@/features/instructor/components/QuizForm";
import { Loader2 } from "lucide-react";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function EditQuizPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const quizId = resolvedParams.id;

    const [isLoading, setIsLoading] = useState(true);
    const [initialData, setInitialData] = useState<QuizFormData | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await quizApi.getQuiz(quizId);
                let mappedQuestions: QuizQuestion[] = [];
                if (data.questions && data.questions.length > 0) {
                    mappedQuestions = data.questions.map(q => ({
                        tempId: generateId(),
                        question: q.question,
                        choices: q.choices,
                        correctAnswerIndex: q.correctAnswerIndex,
                    }));
                }

                setInitialData({
                    title: data.resource?.title || "Untitled Quiz",
                    durationInMinutes: data.durationInMinutes || 15,
                    questions: mappedQuestions,
                });
            } catch (err) {
                console.error(err);
                setSaveError("Failed to load quiz details.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchQuiz();
    }, [quizId]);

    const validate = (data: QuizFormData): string | null => {
        if (data.questions.length === 0) return "At least one question is required.";
        for (let i = 0; i < data.questions.length; i++) {
            const q = data.questions[i];
            if (!q.question.trim()) return `Question ${i + 1} text is empty.`;
            if (q.choices.length < 2) return `Question ${i + 1} needs at least 2 choices.`;
            const emptyChoice = q.choices.findIndex((c) => !c.trim());
            if (emptyChoice !== -1)
                return `Question ${i + 1}, choice ${CHOICE_LETTERS[emptyChoice]} is empty.`;
            if (q.correctAnswerIndex < 0 || q.correctAnswerIndex >= q.choices.length)
                return `Question ${i + 1} has no correct answer selected.`;
        }
        return null;
    };

    const buildPayload = (status: QuizStatus, data: QuizFormData): UpdateQuizRequest => {
        const mappedQuestions: UpdateQuizQuestionRequest[] = data.questions.map(
            (q, idx) => ({
                question: q.question.trim(),
                choices: q.choices.map((c) => c.trim()),
                correctAnswerIndex: q.correctAnswerIndex,
                indexOrder: idx,
            })
        );
        return {
            durationInMinutes: data.durationInMinutes,
            status,
            questions: mappedQuestions,
        };
    };

    const handleSave = async (status: QuizStatus, data: QuizFormData) => {
        setSaveError(null);

        if (status === QuizStatus.Published) {
            const err = validate(data);
            if (err) {
                setSaveError(err);
                return;
            }
        }

        setIsSaving(true);
        try {
            await quizApi.updateQuiz(quizId, buildPayload(status, data));
            router.push("/instructor/assessments");
        } catch (error: any) {
            setSaveError(error?.message || "Failed to update quiz. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="pt-12 lg:pt-0 flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-brand-primary" />
                <p className="text-brand-muted font-medium">Loading Assessment...</p>
            </div>
        );
    }

    return (
        <QuizForm
            initialData={initialData || undefined}
            isEditMode={true}
            isSaving={isSaving}
            saveError={saveError}
            onSave={handleSave}
            onClearError={() => setSaveError(null)}
        />
    );
}
