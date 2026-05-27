"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft, FileText, Image, Target, BookOpen, FolderTree,
    MessageSquare, Send, AlertTriangle, Check,
} from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { CourseManageDto } from "@/features/instructor/types/course";
import { showToast } from "../Toast";
import BasicInfoStep from "./BasicInfoStep";
import MediaPricingStep from "./MediaPricingStep";
import ObjectivesRequirementsStep from "./ObjectivesRequirementsStep";
import CurriculumStep from "./CurriculumStep";
import CategoriesTagsStep from "./CategoriesTagsStep";
import MessagesStep from "./MessagesStep";
import SubmitReviewModal from "./SubmitReviewModal";

interface CourseEditorPageProps {
    courseId: string;
}

const statusStyles: Record<string, string> = {
    Draft: "bg-orange-50 text-orange-700 border-orange-200",
    UnderReview: "bg-blue-50 text-blue-700 border-blue-200",
    Published: "bg-green-50 text-green-700 border-green-200",
    Rejected: "bg-red-50 text-red-700 border-red-200",
    Archived: "bg-brand-soft text-brand-primary border-brand-primary",
};

const statusDot: Record<string, string> = {
    Draft: "bg-orange-500",
    UnderReview: "bg-blue-500 animate-pulse",
    Published: "bg-green-500",
    Rejected: "bg-red-500",
    Archived: "bg-brand-soft0",
};

const STEPS = [
    { key: "basic", label: "Basic Info", icon: FileText },
    { key: "media", label: "Media & Pricing", icon: Image },
    { key: "objectives", label: "Objectives", icon: Target },
    { key: "curriculum", label: "Curriculum", icon: BookOpen },
    { key: "categories", label: "Categories & Tags", icon: FolderTree },
    { key: "messages", label: "Messages", icon: MessageSquare },
];

export default function CourseEditorPage({ courseId }: CourseEditorPageProps) {
    const router = useRouter();
    const [course, setCourse] = useState<CourseManageDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeStep, setActiveStep] = useState("basic");
    const [showSubmitModal, setShowSubmitModal] = useState(false);

    useEffect(() => {
        (async () => {
            try {
                const data = await courseApi.getCourseManage(courseId);
                setCourse(data);
            } catch (err: any) {
                if (err.message?.includes("404") || err.message?.includes("Not Found")) {
                    showToast("error", "Course not found");
                    router.push("/instructor/courses");
                    return;
                }
                if (err.message?.includes("403") || err.message?.includes("Forbidden")) {
                    showToast("error", "You do not have permission to perform this action");
                    router.push("/instructor/courses");
                    return;
                }
                showToast("error", "Failed to load course");
            } finally {
                setLoading(false);
            }
        })();
    }, [courseId, router]);

    const updateCourse = (partial: Partial<CourseManageDto>) => {
        setCourse((prev) => prev ? { ...prev, ...partial } : prev);
    };

    if (loading) {
        return (
            <div className="pt-12 lg:pt-0 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <div className="w-8 h-8 border-2 border-brand-primary border-t-teal-600 rounded-full animate-spin" />
                <p className="text-brand-muted text-sm">Loading course...</p>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="pt-12 lg:pt-0 text-center py-24">
                <p className="text-brand-muted">Course could not be loaded.</p>
            </div>
        );
    }

    const statusLabel = course.status === "UnderReview" ? "Under Review" : course.status;
    const canSubmit = course.status === "Draft" || course.status === "Rejected";

    const isStepDone = (key: string) => {
        switch (key) {
            case "basic": return !!course.title?.trim();
            case "media": return !!course.thumbnailUrl && course.price !== null;
            case "objectives": return course.objectives.length >= 4 && course.requirements.length >= 1;
            case "curriculum": return course.sections.length > 0 && course.sections.some((s) => s.lessons.length > 0);
            case "categories": return course.categories.length > 0;
            case "messages": return !!course.welcomeMessage || !!course.congratulationMessage;
            default: return false;
        }
    };

    return (
        <div className="pt-12 lg:pt-0">
            {/* Rejection banner */}
            {course.status === "Rejected" && course.rejectionReason && (
                <div className="flex items-start gap-3 px-4 py-3 mb-6 rounded-xl bg-red-50 border border-red-200 text-red-700">
                    <AlertTriangle size={18} className="shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold">Course Rejected</p>
                        <p className="text-sm mt-0.5">{course.rejectionReason}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/instructor/courses")}
                        className="p-2 rounded-xl text-brand-muted hover:text-brand-text hover:bg-brand-soft transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-xl md:text-2xl font-bold text-brand-text line-clamp-1">
                            {course.title || "Untitled Course"}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusStyles[course.status] || statusStyles.Draft}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${statusDot[course.status] || statusDot.Draft}`} />
                                {statusLabel}
                            </span>
                        </div>
                    </div>
                </div>
                {canSubmit && (
                    <button
                        onClick={() => setShowSubmitModal(true)}
                        className="flex items-center gap-2.5 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#115E59] transition-all shadow-md shadow-teal-500/20 active:scale-[0.98] cursor-pointer"
                    >
                        <Send size={16} className="text-teal-200" />
                        Submit for Review
                    </button>
                )}
            </div>

            {/* Layout: sidebar + content */}
            <div className="flex flex-col lg:flex-row gap-6 course-steps-container">
                {/* Step sidebar */}
                <div className="lg:w-64 shrink-0">
                    <div className="lg:sticky lg:top-8 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-brand-muted mb-4 px-2 hidden lg:block">Course Setup</p>
                        <nav className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                            {STEPS.map((step, idx) => {
                                const active = activeStep === step.key;
                                const done = isStepDone(step.key);
                                return (
                                    <button
                                        key={step.key}
                                        onClick={() => setActiveStep(step.key)}
                                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap cursor-pointer text-left w-full border ${
                                            active
                                                ? "bg-brand-soft border-brand-primary/60 text-[#115E59] shadow-sm shadow-teal-100/50"
                                                : "bg-transparent border-transparent text-brand-muted hover:bg-brand-bg hover:text-brand-text"
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 transition-colors ${
                                            active
                                                ? "bg-white text-brand-primary shadow-sm border border-teal-100"
                                                : done
                                                ? "bg-emerald-50 text-emerald-600"
                                                : "bg-brand-soft text-brand-muted group-hover:bg-brand-border"
                                        }`}>
                                            {done && !active ? <Check size={16} strokeWidth={2.5} /> : <span className="text-[13px] font-bold">{idx + 1}</span>}
                                        </div>
                                        <div className="flex-1">
                                            <span className="block text-[14px]">{step.label}</span>
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>

                {/* Step content */}
                <div className="flex-1 bg-white rounded-xl border border-brand-border shadow-sm p-6 md:p-8 min-h-[500px] course-editor-step-content">
                    {activeStep === "basic" && (
                        <BasicInfoStep
                            courseId={courseId}
                            title={course.title}
                            subtitle={course.subtitle}
                            description={course.description}
                            language={course.language}
                            level={course.level}
                            onSaved={(data) => updateCourse(data)}
                        />
                    )}
                    {activeStep === "media" && (
                        <MediaPricingStep
                            courseId={courseId}
                            thumbnailUrl={course.thumbnailUrl}
                            price={course.price}
                            currency={course.currency}
                            onSaved={(data) => {
                                const updates: Partial<CourseManageDto> = {};
                                if (data.thumbnailUrl !== undefined) updates.thumbnailUrl = data.thumbnailUrl;
                                if (data.price !== null) updates.price = data.price;
                                if (data.currency !== null) updates.currency = data.currency;
                                updateCourse(updates);
                            }}
                        />
                    )}
                    {activeStep === "objectives" && (
                        <ObjectivesRequirementsStep
                            courseId={courseId}
                            objectives={course.objectives}
                            requirements={course.requirements}
                            onSaved={(data) => updateCourse(data)}
                        />
                    )}
                    {activeStep === "curriculum" && (
                        <CurriculumStep
                            courseId={courseId}
                            sections={course.sections}
                            onSectionsChanged={(sections) => updateCourse({ sections })}
                        />
                    )}
                    {activeStep === "categories" && (
                        <CategoriesTagsStep
                            courseId={courseId}
                            categories={course.categories}
                            tags={course.tags}
                            onSaved={(data) => updateCourse(data)}
                        />
                    )}
                    {activeStep === "messages" && (
                        <MessagesStep
                            courseId={courseId}
                            welcomeMessage={course.welcomeMessage}
                            congratulationMessage={course.congratulationMessage}
                            onSaved={(data) => updateCourse(data)}
                        />
                    )}
                </div>
            </div>

            {/* Submit modal */}
            {showSubmitModal && (
                <SubmitReviewModal
                    course={course}
                    onClose={() => setShowSubmitModal(false)}
                    onSubmitted={() => {
                        updateCourse({ status: "UnderReview" });
                        setShowSubmitModal(false);
                    }}
                />
            )}
        </div>
    );
}
