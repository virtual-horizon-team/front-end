"use client";

import { useState } from "react";
import { CheckCircle, XCircle, X, Loader2, Send } from "lucide-react";
import { CourseManageDto } from "@/features/instructor/types/course";
import { courseApi } from "@/features/instructor/lib/course-api";
import { showToast } from "../Toast";

interface SubmitReviewModalProps {
    course: CourseManageDto;
    onClose: () => void;
    onSubmitted: () => void;
}

interface CheckItem {
    label: string;
    passed: boolean;
}

function validateCourse(course: CourseManageDto): CheckItem[] {
    const hasSection = course.sections.length > 0 && course.sections.some((s) => s.lessons.length > 0);
    const hasThumbnail = !!course.thumbnailUrl;
    const hasDescription = !!course.description && course.description.trim().length > 0;
    const hasPricing = course.price !== null && course.price !== undefined && !!course.currency;
    const hasCategory = course.categories.length > 0;
    const hasObjectives = course.objectives.length >= 4;
    const hasRequirement = course.requirements.length >= 1;
    const allVideosReady = course.sections.every((s) =>
        s.lessons.every((l) => !l.videoStatus || l.videoStatus === "Ready" || l.videoStatus === "Published")
    );

    return [
        { label: "At least 1 section with 1 lesson", passed: hasSection },
        { label: "Thumbnail set", passed: hasThumbnail },
        { label: "Description set", passed: hasDescription },
        { label: "Price and currency set", passed: hasPricing },
        { label: "At least 1 category assigned", passed: hasCategory },
        { label: "At least 4 learning objectives", passed: hasObjectives },
        { label: "At least 1 requirement", passed: hasRequirement },
        { label: "All video lessons are Ready", passed: allVideosReady },
    ];
}

export default function SubmitReviewModal({ course, onClose, onSubmitted }: SubmitReviewModalProps) {
    const [submitting, setSubmitting] = useState(false);
    const checks = validateCourse(course);
    const allPassed = checks.every((c) => c.passed);

    const handleSubmit = async () => {
        if (!allPassed) return;
        setSubmitting(true);
        try {
            await courseApi.submitForReview(course.id);
            showToast("success", "Course submitted for review!");
            onSubmitted();
        } catch (err: any) {
            showToast("error", err.message || "Failed to submit course");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <h3 className="text-lg font-semibold text-brand-text">Submit for Review</h3>
                    <button onClick={onClose} className="p-1 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-soft cursor-pointer"><X size={20} /></button>
                </div>
                <div className="px-6 py-5 space-y-3">
                    <p className="text-sm text-brand-muted mb-4">Your course must meet these requirements before submission:</p>
                    {checks.map((check, i) => (
                        <div key={i} className="flex items-start gap-3">
                            {check.passed ? (
                                <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                            ) : (
                                <XCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                            )}
                            <span className={`text-sm ${check.passed ? "text-brand-text" : "text-red-600 font-medium"}`}>
                                {check.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="px-6 py-4 border-t border-brand-border flex gap-3">
                    <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text bg-brand-soft hover:bg-brand-border transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!allPassed || submitting}
                        className="flex-1 flex items-center justify-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 disabled:opacity-50 cursor-pointer"
                    >
                        {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        Submit
                    </button>
                </div>
            </div>
        </div>
    );
}
