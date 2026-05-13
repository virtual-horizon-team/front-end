"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ClipboardList,
    Plus,
    Search,
    Edit2,
    Trash2,
    Eye,
    ChevronLeft,
    ChevronRight,
    AlertTriangle,
    Clock,
} from "lucide-react";
import { quizApi } from "@/features/instructor/lib/quiz-api";
import { QuizPagedResult, QuizDto } from "@/features/instructor/types/quiz";

export default function AssessmentsPage() {
    const router = useRouter();

    const [quizzes, setQuizzes] = useState<QuizPagedResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Pagination & sorting
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState<"title" | "createdat" | "status" | "duration" | "questions">("createdat");
    const [isDescending, setIsDescending] = useState(true);

    const [itemToDelete, setItemToDelete] = useState<{ id: string; title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [filterResourceId, setFilterResourceId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const rId = params.get("Filters[resourceId]");
            if (rId) {
                setFilterResourceId(rId);
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const reqTerm = searchTerm.trim() || undefined;
            const res = await quizApi.fetchQuizzes({
                Search: reqTerm,
                SortBy: sortBy,
                IsDescending: isDescending,
                PageNumber: pageNumber,
                PageSize: pageSize,
                "Filters[resourceId]": filterResourceId || undefined,
            });
            setQuizzes(res);
        } catch (error) {
            console.error("Failed to fetch quizzes", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortBy, isDescending, pageNumber, pageSize, filterResourceId]);

    useEffect(() => {
        const handler = setTimeout(() => {
            fetchData();
        }, 300);
        return () => clearTimeout(handler);
    }, [fetchData]);

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await quizApi.deleteQuiz(itemToDelete.id);
            fetchData();
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete quiz", error);
            alert("Error deleting quiz");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSort = (column: typeof sortBy) => {
        if (sortBy === column) {
            setIsDescending(!isDescending);
        } else {
            setSortBy(column);
            setIsDescending(true);
        }
        setPageNumber(1);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    return (
        <div className="pt-12 lg:pt-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-text">Assessments</h1>
                    <p className="text-brand-muted mt-1">Manage quizzes and exams for your courses.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-brand-muted bg-brand-soft px-3 py-1.5 rounded-lg">
                        {loading ? "Loading..." : `${quizzes?.totalCount || 0} Quizzes`}
                    </span>
                    <button
                        onClick={() => router.push("/instructor/assessments/create")}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 cursor-pointer"
                    >
                        <Plus size={16} />
                        Create Assessment
                    </button>
                </div>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col xl:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Search quizzes..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPageNumber(1);
                        }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all"
                    />
                </div>
            </div>

            {/* File Table */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-border text-left text-brand-muted bg-brand-bg/50">
                                <th
                                    className="px-6 py-4 font-medium min-w-[300px] cursor-pointer hover:text-brand-text"
                                    onClick={() => handleSort("title")}
                                >
                                    <div className="flex items-center gap-2">
                                        Title {sortBy === "title" && (isDescending ? "↓" : "↑")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 font-medium hidden md:table-cell cursor-pointer hover:text-brand-text"
                                    onClick={() => handleSort("status")}
                                >
                                    <div className="flex items-center gap-2">
                                        Status {sortBy === "status" && (isDescending ? "↓" : "↑")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 font-medium hidden md:table-cell cursor-pointer hover:text-brand-text"
                                    onClick={() => handleSort("questions")}
                                >
                                    <div className="flex items-center gap-2">
                                        Questions {sortBy === "questions" && (isDescending ? "↓" : "↑")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 font-medium hidden lg:table-cell cursor-pointer hover:text-brand-text"
                                    onClick={() => handleSort("duration")}
                                >
                                    <div className="flex items-center gap-2">
                                        Duration {sortBy === "duration" && (isDescending ? "↓" : "↑")}
                                    </div>
                                </th>
                                <th
                                    className="px-6 py-4 font-medium hidden lg:table-cell cursor-pointer hover:text-brand-text"
                                    onClick={() => handleSort("createdat")}
                                >
                                    <div className="flex items-center gap-2">
                                        Created {sortBy === "createdat" && (isDescending ? "↓" : "↑")}
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-brand-primary border-t-teal-600 rounded-full animate-spin" />
                                            <p className="text-brand-muted">Loading your assessments...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : quizzes?.items?.length ? (
                                quizzes.items.map((quiz) => (
                                    <tr key={quiz.id} className="hover:bg-brand-bg/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                                                    <ClipboardList size={18} className="text-emerald-500" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-brand-text font-medium truncate">
                                                        {quiz.title || "Untitled"}
                                                    </p>
                                                    <p className="text-brand-muted text-xs truncate lg:hidden">
                                                        {quiz.numberOfQuestions} Qs • {quiz.durationInMinutes} mins
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {(() => {
                                                const s = quiz.status || "Draft";
                                                const isDraft = s === "Draft";
                                                const isPublished = s === "Published";
                                                return (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${isPublished
                                                                ? "bg-green-50 text-green-700 border border-green-200"
                                                                : isDraft
                                                                    ? "bg-orange-50 text-orange-700 border border-orange-200"
                                                                    : "bg-brand-bg text-brand-text border border-brand-border"
                                                            }`}
                                                    >
                                                        <span
                                                            className={`w-1.5 h-1.5 rounded-full ${isPublished
                                                                    ? "bg-green-500"
                                                                    : isDraft
                                                                        ? "bg-orange-500"
                                                                        : "bg-slate-400"
                                                                }`}
                                                        />
                                                        {s}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell text-brand-muted">
                                            {quiz.numberOfQuestions}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-brand-muted whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock size={14} className="text-brand-muted" />
                                                {quiz.durationInMinutes} mins
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-brand-muted whitespace-nowrap">
                                            {quiz.createdAt ? formatDate(quiz.createdAt) : "N/A"}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => router.push(`/instructor/assessments/${quiz.id}`)}
                                                    className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded bg-white shadow-sm border border-brand-border"
                                                    title="Preview / Edit"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        setItemToDelete({
                                                            id: quiz.id,
                                                            title: quiz.title || "Untitled",
                                                        })
                                                    }
                                                    className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded bg-white shadow-sm border border-brand-border"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="mx-auto w-16 h-16 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                                            <ClipboardList size={28} className="text-emerald-500" />
                                        </div>
                                        <p className="text-brand-muted font-medium">No assessments found.</p>
                                        <p className="text-sm text-brand-muted mt-1 max-w-sm mx-auto">
                                            Create your first quiz or exam. You can set questions, time limits, and grading
                                            criteria.
                                        </p>
                                        {(searchTerm) && (
                                            <button
                                                onClick={() => {
                                                    setSearchTerm("");
                                                }}
                                                className="mt-4 text-sm text-brand-primary hover:underline"
                                            >
                                                Clear search
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {quizzes && quizzes.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between">
                        <p className="text-sm text-brand-muted">
                            Showing page <span className="font-medium text-brand-text">{quizzes.pageNumber}</span> of{" "}
                            <span className="font-medium text-brand-text">{quizzes.totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                                disabled={quizzes.pageNumber === 1}
                                className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPageNumber((p) => Math.min(quizzes.totalPages, p + 1))}
                                disabled={quizzes.pageNumber === quizzes.totalPages}
                                className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text mb-2">Delete Assessment</h3>
                            <p className="text-sm text-brand-muted mb-6">
                                Are you sure you want to delete <span className="font-semibold text-brand-text">{itemToDelete.title}</span>? This action cannot be undone.
                            </p>

                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setItemToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text bg-brand-soft hover:bg-brand-border transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
