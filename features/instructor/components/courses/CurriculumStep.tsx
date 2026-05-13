"use client";

import { useState, useRef } from "react";
import {
    ChevronDown, ChevronRight, GripVertical, Plus, Trash2, Edit2,
    Check, X, Eye, EyeOff, Loader2, Paperclip, FileText, BookOpen,
    Film, Link2, File, FileQuestion, Gamepad2,
} from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { CourseSectionDto, CourseLessonDto } from "@/features/instructor/types/course";
import { showToast } from "../Toast";
import ResourcePickerModal from "./ResourcePickerModal";

interface CurriculumStepProps {
    courseId: string;
    sections: CourseSectionDto[];
    onSectionsChanged: (sections: CourseSectionDto[]) => void;
}

export default function CurriculumStep({ courseId, sections, onSectionsChanged }: CurriculumStepProps) {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [editingSection, setEditingSection] = useState<string | null>(null);
    const [editingSectionTitle, setEditingSectionTitle] = useState("");
    const [editingLesson, setEditingLesson] = useState<string | null>(null);
    const [editingLessonTitle, setEditingLessonTitle] = useState("");
    const [addingSectionLoading, setAddingSectionLoading] = useState(false);
    const [addingLessonFor, setAddingLessonFor] = useState<string | null>(null);
    const [newLessonTitle, setNewLessonTitle] = useState("");
    const [loadingOps, setLoadingOps] = useState<Record<string, boolean>>({});
    const [resourcePickerFor, setResourcePickerFor] = useState<{ sectionId: string; lessonId: string } | null>(null);

    const dragSectionIdx = useRef<number | null>(null);
    const dragLessonIdx = useRef<{ sectionId: string; idx: number } | null>(null);

    const setOp = (key: string, val: boolean) => setLoadingOps((p) => ({ ...p, [key]: val }));

    const toggleExpand = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }));

    const handleAddSection = async () => {
        setAddingSectionLoading(true);
        try {
            const res = await courseApi.createSection(courseId, { title: "New Section" });
            onSectionsChanged([...sections, { ...res, lessons: res.lessons || [] }]);
            setExpanded((p) => ({ ...p, [res.id]: true }));
            setEditingSection(res.id);
            setEditingSectionTitle("New Section");
            showToast("success", "Section added");
        } catch (err: any) {
            showToast("error", err.message || "Failed to add section");
        } finally {
            setAddingSectionLoading(false);
        }
    };

    const handleSaveSectionTitle = async (sectionId: string) => {
        if (!editingSectionTitle.trim()) return;
        setOp(`sec-${sectionId}`, true);
        try {
            await courseApi.updateSection(courseId, sectionId, { title: editingSectionTitle.trim() });
            onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, title: editingSectionTitle.trim() } : s));
            setEditingSection(null);
        } catch (err: any) {
            showToast("error", err.message || "Failed to update section");
        } finally {
            setOp(`sec-${sectionId}`, false);
        }
    };

    const handleDeleteSection = async (sectionId: string) => {
        setOp(`del-sec-${sectionId}`, true);
        try {
            await courseApi.deleteSection(courseId, sectionId);
            onSectionsChanged(sections.filter((s) => s.id !== sectionId));
            showToast("success", "Section deleted");
        } catch (err: any) {
            showToast("error", err.message || "Failed to delete section");
        } finally {
            setOp(`del-sec-${sectionId}`, false);
        }
    };

    const handleAddLesson = async (sectionId: string) => {
        if (!newLessonTitle.trim()) return;
        setOp(`add-lesson-${sectionId}`, true);
        try {
            const res = await courseApi.createLesson(sectionId, { title: newLessonTitle.trim() });
            onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: [...s.lessons, res] } : s));
            setNewLessonTitle("");
            setAddingLessonFor(null);
            showToast("success", "Lesson added");
        } catch (err: any) {
            showToast("error", err.message || "Failed to add lesson");
        } finally {
            setOp(`add-lesson-${sectionId}`, false);
        }
    };

    const handleSaveLessonTitle = async (sectionId: string, lessonId: string) => {
        if (!editingLessonTitle.trim()) return;
        setOp(`les-${lessonId}`, true);
        try {
            await courseApi.updateLesson(sectionId, lessonId, { title: editingLessonTitle.trim() });
            onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, title: editingLessonTitle.trim() } : l) } : s));
            setEditingLesson(null);
        } catch (err: any) {
            showToast("error", err.message || "Failed to update lesson");
        } finally {
            setOp(`les-${lessonId}`, false);
        }
    };

    const handleDeleteLesson = async (sectionId: string, lessonId: string) => {
        setOp(`del-les-${lessonId}`, true);
        try {
            await courseApi.deleteLesson(sectionId, lessonId);
            onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.filter((l) => l.id !== lessonId) } : s));
            showToast("success", "Lesson deleted");
        } catch (err: any) {
            showToast("error", err.message || "Failed to delete lesson");
        } finally {
            setOp(`del-les-${lessonId}`, false);
        }
    };

    const handleTogglePreview = async (sectionId: string, lessonId: string) => {
        setOp(`prev-${lessonId}`, true);
        try {
            await courseApi.toggleLessonPreview(sectionId, lessonId);
            onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, isPreview: !l.isPreview } : l) } : s));
        } catch (err: any) {
            showToast("error", err.message || "Failed to toggle preview");
        } finally {
            setOp(`prev-${lessonId}`, false);
        }
    };

    const handleSectionDragStart = (idx: number) => { dragSectionIdx.current = idx; };
    const handleSectionDrop = async (dropIdx: number) => {
        const fromIdx = dragSectionIdx.current;
        if (fromIdx === null || fromIdx === dropIdx) return;
        const reordered = [...sections];
        const [moved] = reordered.splice(fromIdx, 1);
        reordered.splice(dropIdx, 0, moved);
        onSectionsChanged(reordered);
        dragSectionIdx.current = null;
        try {
            await courseApi.reorderSections(courseId, reordered.map((s) => s.id));
        } catch (err: any) {
            showToast("error", "Failed to reorder sections");
            onSectionsChanged(sections);
        }
    };

    const handleLessonDragStart = (sectionId: string, idx: number) => {
        dragLessonIdx.current = { sectionId, idx };
    };
    const handleLessonDrop = async (sectionId: string, dropIdx: number) => {
        const from = dragLessonIdx.current;
        if (!from || from.sectionId !== sectionId || from.idx === dropIdx) return;
        const section = sections.find((s) => s.id === sectionId);
        if (!section) return;
        const reordered = [...section.lessons];
        const [moved] = reordered.splice(from.idx, 1);
        reordered.splice(dropIdx, 0, moved);
        onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: reordered } : s));
        dragLessonIdx.current = null;
        try {
            await courseApi.reorderLessons(sectionId, reordered.map((l) => l.id));
        } catch (err: any) {
            showToast("error", "Failed to reorder lessons");
        }
    };

    const handleResourceAttached = (sectionId: string, lessonId: string, resourceId: string, resourceType: string) => {
        onSectionsChanged(sections.map((s) => s.id === sectionId ? { ...s, lessons: s.lessons.map((l) => l.id === lessonId ? { ...l, resourceId, resourceType } : l) } : s));
        setResourcePickerFor(null);
    };

    const formatDuration = (seconds: number | null) => {
        if (!seconds) return "";
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return (
        <div className="max-w-3xl space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <BookOpen size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Curriculum</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Build your course structure with sections and lessons. Drag to reorder.</p>
                </div>
            </div>

            {sections.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-brand-border rounded-xl bg-brand-bg/50">
                    <div className="mx-auto w-14 h-14 rounded-xl bg-brand-soft flex items-center justify-center mb-3">
                        <BookOpen size={24} className="text-brand-primary" />
                    </div>
                    <p className="text-sm font-medium text-brand-text mb-1">No sections yet</p>
                    <p className="text-xs text-brand-muted mb-4">Start building your curriculum by adding the first section.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section, sIdx) => (
                        <div
                            key={section.id}
                            className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden"
                            draggable
                            onDragStart={() => handleSectionDragStart(sIdx)}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleSectionDrop(sIdx)}
                        >
                            {/* Section header */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-brand-bg/70 border-b border-brand-border">
                                <GripVertical size={16} className="text-brand-muted cursor-grab shrink-0" />
                                <button onClick={() => toggleExpand(section.id)} className="p-0.5 text-brand-muted hover:text-brand-text cursor-pointer">
                                    {expanded[section.id] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                </button>
                                {editingSection === section.id ? (
                                    <div className="flex items-center gap-2 flex-1">
                                        <input
                                            autoFocus
                                            value={editingSectionTitle}
                                            onChange={(e) => setEditingSectionTitle(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveSectionTitle(section.id); if (e.key === "Escape") setEditingSection(null); }}
                                            className="flex-1 px-2 py-1 text-sm rounded-lg border border-brand-border focus:outline-none focus:border-teal-300"
                                        />
                                        <button onClick={() => handleSaveSectionTitle(section.id)} className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer">
                                            {loadingOps[`sec-${section.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                                        </button>
                                        <button onClick={() => setEditingSection(null)} className="p-1 text-brand-muted hover:bg-brand-soft rounded cursor-pointer"><X size={14} /></button>
                                    </div>
                                ) : (
                                    <span
                                        className="text-sm font-semibold text-brand-text flex-1 cursor-pointer hover:text-brand-primary transition-colors"
                                        onClick={() => { setEditingSection(section.id); setEditingSectionTitle(section.title); }}
                                    >
                                        {section.title}
                                    </span>
                                )}
                                <span className="text-xs text-brand-muted shrink-0">{section.lessons.length} {section.lessons.length === 1 ? "lesson" : "lessons"}</span>
                                <button
                                    onClick={() => handleDeleteSection(section.id)}
                                    disabled={!!loadingOps[`del-sec-${section.id}`]}
                                    className="p-1.5 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                >
                                    {loadingOps[`del-sec-${section.id}`] ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            </div>

                            {/* Lessons */}
                            {expanded[section.id] && (
                                <div className="divide-y divide-slate-50">
                                    {section.lessons.length === 0 ? (
                                        <div className="px-6 py-6 text-center">
                                            <p className="text-xs text-brand-muted">No lessons in this section yet.</p>
                                        </div>
                                    ) : (
                                        section.lessons.map((lesson, lIdx) => {
                                            const hasResource = !!lesson.resourceId;
                                            const isVideo = lesson.resourceType === "Video";
                                            const isDoc = lesson.resourceType === "Document";
                                            const isQuiz = lesson.resourceType === "Quiz";
                                            const isScenario = lesson.resourceType === "Scenario";
                                            const LessonIcon = isVideo ? Film : isDoc ? FileText : isQuiz ? FileQuestion : isScenario ? Gamepad2 : File;
                                            const lessonIconColor = isVideo ? "text-teal-400" : isDoc ? "text-blue-400" : isQuiz ? "text-amber-400" : isScenario ? "text-purple-400" : "text-brand-muted";

                                            return (
                                            <div
                                                key={lesson.id}
                                                className="flex items-center gap-2 px-4 py-2.5 pl-10 hover:bg-brand-bg/50 transition-colors group"
                                                draggable
                                                onDragStart={(e) => { e.stopPropagation(); handleLessonDragStart(section.id, lIdx); }}
                                                onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                                onDrop={(e) => { e.stopPropagation(); handleLessonDrop(section.id, lIdx); }}
                                            >
                                                <GripVertical size={14} className="text-brand-muted cursor-grab shrink-0" />
                                                <LessonIcon size={14} className={`${lessonIconColor} shrink-0`} />
                                                {editingLesson === lesson.id ? (
                                                    <div className="flex items-center gap-2 flex-1">
                                                        <input
                                                            autoFocus
                                                            value={editingLessonTitle}
                                                            onChange={(e) => setEditingLessonTitle(e.target.value)}
                                                            onKeyDown={(e) => { if (e.key === "Enter") handleSaveLessonTitle(section.id, lesson.id); if (e.key === "Escape") setEditingLesson(null); }}
                                                            className="flex-1 px-2 py-1 text-sm rounded-lg border border-brand-border focus:outline-none focus:border-teal-300"
                                                        />
                                                        <button onClick={() => handleSaveLessonTitle(section.id, lesson.id)} className="p-1 text-green-600 hover:bg-green-50 rounded cursor-pointer">
                                                            {loadingOps[`les-${lesson.id}`] ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                                                        </button>
                                                        <button onClick={() => setEditingLesson(null)} className="p-1 text-brand-muted hover:bg-brand-soft rounded cursor-pointer"><X size={12} /></button>
                                                    </div>
                                                ) : (
                                                    <span 
                                                        onClick={(e) => {
                                                            if (!hasResource) return;
                                                            e.stopPropagation();
                                                            let url = "";
                                                            if (lesson.resourceType === "Video" || lesson.resourceType === "Document") {
                                                                url = `/instructor/media-hub?Filters[id]=${lesson.resourceId}`;
                                                            } else if (lesson.resourceType === "Quiz") {
                                                                url = `/instructor/assessments?Filters[resourceId]=${lesson.resourceId}`;
                                                            } else if (lesson.resourceType === "Scenario") {
                                                                url = `/instructor/vr-scenarios?Filters[resourceId]=${lesson.resourceId}`;
                                                            }
                                                            if (url) window.open(url, "_blank");
                                                        }}
                                                        className={`text-sm flex-1 truncate transition-colors ${hasResource ? 'text-brand-text hover:text-brand-primary hover:underline cursor-pointer' : 'text-brand-text'}`}
                                                        title={hasResource ? `Preview ${lesson.resourceType}` : undefined}
                                                    >
                                                        {lesson.title}
                                                    </span>
                                                )}
                                                <div className="flex items-center">
                                                {lesson.isPreview && <span className="text-[10px] uppercase font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full ml-2 border border-teal-200">Preview</span>}
                                                {hasResource && (
                                                    <div className="flex items-center gap-1 ml-2">
                                                        <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/50 shadow-sm border border-brand-border flex items-center gap-1 ${lessonIconColor}`}>
                                                            <LessonIcon size={12} />
                                                            {lesson.resourceType}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                                {lesson.durationInSeconds ? (
                                                    <span className="text-xs text-brand-muted shrink-0">{formatDuration(lesson.durationInSeconds)}</span>
                                                ) : null}
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <button
                                                        onClick={() => handleTogglePreview(section.id, lesson.id)}
                                                        disabled={!!loadingOps[`prev-${lesson.id}`]}
                                                        className="p-1 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded cursor-pointer"
                                                        title={lesson.isPreview ? "Disable preview" : "Enable preview"}
                                                    >
                                                        {loadingOps[`prev-${lesson.id}`] ? <Loader2 size={13} className="animate-spin" /> : lesson.isPreview ? <EyeOff size={13} /> : <Eye size={13} />}
                                                    </button>
                                                    <button
                                                        onClick={() => setResourcePickerFor({ sectionId: section.id, lessonId: lesson.id })}
                                                        className={`p-1 rounded cursor-pointer ${hasResource ? "text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50" : "text-brand-muted hover:text-blue-500 hover:bg-blue-50"}`}
                                                        title={hasResource ? "Change resource" : "Attach resource"}
                                                    >
                                                        {hasResource ? <Link2 size={13} /> : <Paperclip size={13} />}
                                                    </button>
                                                    <button
                                                        onClick={() => { setEditingLesson(lesson.id); setEditingLessonTitle(lesson.title); }}
                                                        className="p-1 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded cursor-pointer"
                                                    >
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteLesson(section.id, lesson.id)}
                                                        disabled={!!loadingOps[`del-les-${lesson.id}`]}
                                                        className="p-1 text-brand-muted hover:text-red-500 hover:bg-red-50 rounded cursor-pointer"
                                                    >
                                                        {loadingOps[`del-les-${lesson.id}`] ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                                    </button>
                                                </div>
                                            </div>
                                            );
                                        })
                                    )}

                                    {/* Add lesson */}
                                    <div className="px-4 py-3 pl-10">
                                        {addingLessonFor === section.id ? (
                                            <div className="flex items-center gap-2">
                                                <input
                                                    autoFocus
                                                    value={newLessonTitle}
                                                    onChange={(e) => setNewLessonTitle(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") handleAddLesson(section.id); if (e.key === "Escape") { setAddingLessonFor(null); setNewLessonTitle(""); } }}
                                                    placeholder="Lesson title..."
                                                    className="flex-1 px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:border-teal-300"
                                                />
                                                <button onClick={() => handleAddLesson(section.id)} disabled={!!loadingOps[`add-lesson-${section.id}`] || !newLessonTitle.trim()} className="px-3 py-2 text-xs font-medium bg-brand-soft text-brand-primary rounded-lg hover:bg-teal-100 transition-colors cursor-pointer disabled:opacity-50">
                                                    {loadingOps[`add-lesson-${section.id}`] ? <Loader2 size={14} className="animate-spin" /> : "Add"}
                                                </button>
                                                <button onClick={() => { setAddingLessonFor(null); setNewLessonTitle(""); }} className="px-3 py-2 text-xs text-brand-muted hover:bg-brand-soft rounded-lg cursor-pointer">Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => { setAddingLessonFor(section.id); setNewLessonTitle(""); }} className="flex items-center gap-1.5 text-xs font-medium text-brand-primary hover:text-teal-700 cursor-pointer">
                                                <Plus size={14} /> Add Lesson
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={handleAddSection}
                disabled={addingSectionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-brand-border text-sm font-medium text-brand-muted hover:border-teal-300 hover:text-brand-primary hover:bg-brand-soft transition-all cursor-pointer disabled:opacity-50 w-full justify-center"
            >
                {addingSectionLoading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add Section
            </button>

            {resourcePickerFor && (
                <ResourcePickerModal
                    sectionId={resourcePickerFor.sectionId}
                    lessonId={resourcePickerFor.lessonId}
                    onAttached={handleResourceAttached}
                    onClose={() => setResourcePickerFor(null)}
                />
            )}
        </div>
    );
}
