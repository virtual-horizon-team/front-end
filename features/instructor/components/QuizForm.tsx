"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Save,
    Send,
    GripVertical,
    CheckCircle2,
    Circle,
    Plus,
    X,
    Copy,
    Trash2,
    Clock,
    AlertCircle,
    Loader2,
} from "lucide-react";
import {
    QuizStatus,
    QuizQuestion,
} from "@/features/instructor/types/quiz";

const DURATION_OPTIONS = [5, 10, 15, 20, 30, 45, 60, 90, 120];
const CHOICE_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

export function generateId() {
    return Math.random().toString(36).substring(2, 11);
}

export function createEmptyQuestion(): QuizQuestion {
    return {
        tempId: generateId(),
        question: "",
        choices: ["", ""],
        correctAnswerIndex: -1,
    };
}

export interface QuizFormData {
    title: string;
    durationInMinutes: number;
    questions: QuizQuestion[];
}

interface QuizFormProps {
    initialData?: Partial<QuizFormData>;
    isEditMode?: boolean;
    isSaving: boolean;
    saveError: string | null;
    onSave: (status: QuizStatus, data: QuizFormData) => void;
    onClearError: () => void;
}

export default function QuizForm({
    initialData,
    isEditMode = false,
    isSaving,
    saveError,
    onSave,
    onClearError,
}: QuizFormProps) {
    const router = useRouter();

    const [quizTitle, setQuizTitle] = useState(initialData?.title || "");
    const [durationInMinutes, setDurationInMinutes] = useState(initialData?.durationInMinutes || 15);
    const [questions, setQuestions] = useState<QuizQuestion[]>(
        initialData?.questions?.length ? initialData.questions : [createEmptyQuestion()]
    );
    const [showDurationDropdown, setShowDurationDropdown] = useState(false);

    const questionsWithCorrect = questions.filter(
        (q) => q.correctAnswerIndex >= 0 && q.correctAnswerIndex < q.choices.length
    );

    const updateQuestion = useCallback(
        (tempId: string, updates: Partial<QuizQuestion>) => {
            setQuestions((prev) =>
                prev.map((q) => (q.tempId === tempId ? { ...q, ...updates } : q))
            );
        },
        []
    );

    const addQuestion = () => {
        setQuestions((prev) => [...prev, createEmptyQuestion()]);
    };

    const duplicateQuestion = (tempId: string) => {
        setQuestions((prev) => {
            const idx = prev.findIndex((q) => q.tempId === tempId);
            if (idx === -1) return prev;
            const source = prev[idx];
            const copy: QuizQuestion = {
                ...source,
                tempId: generateId(),
            };
            const next = [...prev];
            next.splice(idx + 1, 0, copy);
            return next;
        });
    };

    const deleteQuestion = (tempId: string) => {
        setQuestions((prev) => {
            if (prev.length <= 1) return prev;
            return prev.filter((q) => q.tempId !== tempId);
        });
    };

    const addChoice = (tempId: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.tempId !== tempId) return q;
                if (q.choices.length >= 8) return q;
                return { ...q, choices: [...q.choices, ""] };
            })
        );
    };

    const removeChoice = (tempId: string, choiceIndex: number) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.tempId !== tempId) return q;
                if (q.choices.length <= 2) return q;
                const newChoices = q.choices.filter((_, i) => i !== choiceIndex);
                let newCorrect = q.correctAnswerIndex;
                if (choiceIndex === q.correctAnswerIndex) {
                    newCorrect = -1;
                } else if (choiceIndex < q.correctAnswerIndex) {
                    newCorrect = q.correctAnswerIndex - 1;
                }
                return { ...q, choices: newChoices, correctAnswerIndex: newCorrect };
            })
        );
    };

    const updateChoiceText = (
        tempId: string,
        choiceIndex: number,
        text: string
    ) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.tempId !== tempId) return q;
                const newChoices = [...q.choices];
                newChoices[choiceIndex] = text;
                return { ...q, choices: newChoices };
            })
        );
    };

    const setCorrectAnswer = (tempId: string, choiceIndex: number) => {
        updateQuestion(tempId, { correctAnswerIndex: choiceIndex });
    };

    const handleSaveClicked = (status: QuizStatus) => {
        onSave(status, { title: quizTitle, durationInMinutes, questions });
    };

    return (
        <div className="pt-12 lg:pt-0 pb-24">
            {/* Sticky Top Bar */}
            <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-brand-border -mx-6 px-6 py-3 mb-8 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/instructor/assessments")}
                        className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-soft transition-colors"
                        title="Back to Assessments"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="hidden sm:flex items-center gap-3 text-sm text-brand-muted">
                        <span className="px-3 py-1.5 rounded-lg bg-brand-soft font-medium text-brand-text">
                            {questions.length}{" "}
                            {questions.length === 1 ? "question" : "questions"}
                        </span>
                        <span className="text-brand-muted">|</span>
                        <span
                            className={`px-3 py-1.5 rounded-lg font-medium ${
                                questionsWithCorrect.length === questions.length
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                            }`}
                        >
                            {questionsWithCorrect.length}/{questions.length} have
                            correct answers
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleSaveClicked(QuizStatus.Draft)}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text bg-white border border-brand-border hover:bg-brand-bg transition-colors disabled:opacity-50 cursor-pointer"
                    >
                        <Save size={16} />
                        Save Draft
                    </button>
                    <button
                        onClick={() => handleSaveClicked(QuizStatus.Published)}
                        disabled={isSaving}
                        className="flex items-center gap-2 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-sm disabled:opacity-50 cursor-pointer"
                    >
                        {isSaving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Send size={16} />
                        )}
                        {isEditMode ? "Update & Publish" : "Publish Assessment"}
                    </button>
                </div>
            </div>

            {/* Error Banner */}
            {saveError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-6 text-sm animate-in slide-in-from-top duration-200">
                    <AlertCircle size={18} className="shrink-0" />
                    <span>{saveError}</span>
                    <button
                        onClick={onClearError}
                        className="ml-auto p-1 hover:bg-red-100 rounded-lg transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Quiz Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-border p-6 md:p-8 mb-6">
                <input
                    type="text"
                    value={quizTitle}
                    onChange={(e) => setQuizTitle(e.target.value)}
                    disabled={isEditMode}
                    title={isEditMode ? "Title can only be edited via Resource management" : ""}
                    placeholder="Untitled Quiz"
                    className="w-full text-xl md:text-2xl font-bold text-brand-text placeholder:text-brand-muted border-none outline-none bg-transparent mb-5 disabled:opacity-70 disabled:cursor-not-allowed"
                />
                <div className="flex flex-wrap items-center gap-3">
                    {/* Duration Picker */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDurationDropdown(!showDurationDropdown)}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-brand-bg text-sm text-brand-text hover:bg-brand-soft transition-colors cursor-pointer"
                        >
                            <Clock size={16} className="text-brand-muted" />
                            {durationInMinutes} Minutes
                            <svg
                                className={`w-4 h-4 text-brand-muted transition-transform ${
                                    showDurationDropdown ? "rotate-180" : ""
                                }`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        {showDurationDropdown && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setShowDurationDropdown(false)}
                                />
                                <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-brand-border rounded-xl shadow-lg py-1 min-w-[160px] max-h-[220px] overflow-y-auto">
                                    {DURATION_OPTIONS.map((d) => (
                                        <button
                                            key={d}
                                            onClick={() => {
                                                setDurationInMinutes(d);
                                                setShowDurationDropdown(false);
                                            }}
                                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors cursor-pointer ${
                                                d === durationInMinutes
                                                    ? "bg-blue-50 text-blue-700 font-medium"
                                                    : "text-brand-text hover:bg-brand-bg"
                                            }`}
                                        >
                                            {d} Minutes
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions */}
            <div className="space-y-5">
                {questions.map((q, qIdx) => {
                    const hasCorrect =
                        q.correctAnswerIndex >= 0 &&
                        q.correctAnswerIndex < q.choices.length;

                    return (
                        <div
                            key={q.tempId}
                            className={`bg-white rounded-xl shadow-sm border-2 transition-colors ${
                                hasCorrect
                                    ? "border-emerald-200"
                                    : "border-brand-border"
                            } p-5 md:p-6`}
                        >
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <GripVertical
                                        size={18}
                                        className="text-brand-muted cursor-grab"
                                    />
                                    <span className="text-sm font-semibold text-brand-text">
                                        Question {qIdx + 1}
                                    </span>
                                    {hasCorrect ? (
                                        <CheckCircle2
                                            size={18}
                                            className="text-emerald-500"
                                        />
                                    ) : (
                                        <Circle
                                            size={18}
                                            className="text-brand-muted"
                                        />
                                    )}
                                </div>
                                <span className="text-xs font-medium text-brand-muted bg-brand-bg px-2.5 py-1 rounded-md uppercase tracking-wide">
                                    MCQ
                                </span>
                            </div>

                            {/* Question Text */}
                            <input
                                type="text"
                                value={q.question}
                                onChange={(e) =>
                                    updateQuestion(q.tempId, {
                                        question: e.target.value,
                                    })
                                }
                                placeholder="Type your question here..."
                                className="w-full text-base text-brand-text placeholder:text-brand-muted border-none outline-none bg-transparent mb-5 font-medium"
                            />

                            {/* Separator */}
                            <div className="border-t border-dashed border-brand-border mb-5" />

                            {/* Choices */}
                            <div className="space-y-3">
                                {q.choices.map((choice, cIdx) => {
                                    const isCorrect =
                                        q.correctAnswerIndex === cIdx;
                                    return (
                                        <div
                                            key={cIdx}
                                            onClick={() =>
                                                setCorrectAnswer(q.tempId, cIdx)
                                            }
                                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all cursor-pointer group ${
                                                isCorrect
                                                    ? "border-emerald-300 bg-emerald-50/60"
                                                    : "border-brand-border bg-brand-bg/40 hover:border-brand-border hover:bg-brand-bg"
                                            }`}
                                        >
                                            {/* Radio */}
                                            <div
                                                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                                    isCorrect
                                                        ? "border-emerald-500 bg-emerald-500"
                                                        : "border-brand-border bg-white"
                                                }`}
                                            >
                                                {isCorrect && (
                                                    <div className="w-2 h-2 rounded-full bg-white" />
                                                )}
                                            </div>

                                            {/* Letter */}
                                            <span
                                                className={`text-sm font-semibold w-6 text-center shrink-0 ${
                                                    isCorrect
                                                        ? "text-emerald-600"
                                                        : "text-brand-muted"
                                                }`}
                                            >
                                                {CHOICE_LETTERS[cIdx]}.
                                            </span>

                                            {/* Input */}
                                            <input
                                                type="text"
                                                value={choice}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    updateChoiceText(
                                                        q.tempId,
                                                        cIdx,
                                                        e.target.value
                                                    );
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                placeholder={`Option ${CHOICE_LETTERS[cIdx]}`}
                                                className="flex-1 text-sm text-brand-text placeholder:text-brand-muted bg-transparent border-none outline-none"
                                            />

                                            {/* Correct badge */}
                                            {isCorrect && (
                                                <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-md shrink-0">
                                                    Correct
                                                </span>
                                            )}

                                            {/* Remove choice */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeChoice(q.tempId, cIdx);
                                                }}
                                                className="p-1 text-brand-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                                                title="Remove option"
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Add Option + Actions */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    onClick={() => addChoice(q.tempId)}
                                    disabled={q.choices.length >= 8}
                                    className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <Plus size={16} />
                                    Add Option
                                </button>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() =>
                                            duplicateQuestion(q.tempId)
                                        }
                                        className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-soft rounded-lg transition-colors cursor-pointer"
                                        title="Duplicate question"
                                    >
                                        <Copy size={16} />
                                    </button>
                                    <button
                                        onClick={() =>
                                            deleteQuestion(q.tempId)
                                        }
                                        disabled={questions.length <= 1}
                                        className="p-2 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                        title="Delete question"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Question Button */}
            <button
                onClick={addQuestion}
                className="mt-6 w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-brand-border text-brand-muted text-sm font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all cursor-pointer"
            >
                <Plus size={18} />
                Add Question
            </button>
        </div>
    );
}
