"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { quizApi } from "@/features/instructor/lib/quiz-api";
import { QuizStatus, CreateQuizQuestionRequest } from "@/features/instructor/types/quiz";
import QuizForm, { QuizFormData } from "@/features/instructor/components/QuizForm";

const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export default function CreateQuizPage() {
    const router = useRouter();
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const validate = (data: QuizFormData): string | null => {
        if (!data.title.trim()) return "Quiz title is required.";
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

    const buildPayload = (status: QuizStatus, data: QuizFormData) => {
        const mappedQuestions: CreateQuizQuestionRequest[] = data.questions.map(
            (q, idx) => ({
                question: q.question.trim(),
                choices: q.choices.map((c) => c.trim()),
                correctAnswerIndex: q.correctAnswerIndex,
                indexOrder: idx,
            })
        );
        return {
            title: data.title.trim(),
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
        } else {
            if (!data.title.trim()) {
                setSaveError("Quiz title is required to save a draft.");
                return;
            }
        }

        setIsSaving(true);
        try {
            await quizApi.createQuiz(buildPayload(status, data));
            router.push("/instructor/assessments");
        } catch (error: any) {
            setSaveError(error?.message || "Failed to save quiz. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <QuizForm
            isSaving={isSaving}
            saveError={saveError}
            onSave={handleSave}
            onClearError={() => setSaveError(null)}
        />
    );
}
