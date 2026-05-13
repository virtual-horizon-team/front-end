"use client";

import { useState, useEffect, useCallback } from "react";
import { X, Search, Film, FileText, Loader2, Check, ArrowLeft, Gamepad2, FileQuestion, ChevronLeft, ChevronRight } from "lucide-react";
import { videoApi } from "@/features/instructor/lib/video-api";
import { documentApi } from "@/features/instructor/lib/document-api";
import { quizApi } from "@/features/instructor/lib/quiz-api";
import { fetchScenarioCards } from "@/features/instructor/services/scenario.service";
import { courseApi } from "@/features/instructor/lib/course-api";
import { ResourceType } from "@/features/instructor/types/video";
import { showToast } from "../Toast";

// We need a unified type for the display list to make rendering generic
interface UnifiedResourceItem {
    id: string; // The specific id (videoId, documentId, etc)
    resourceId: string;
    title: string;
    description?: string;
    type: ResourceType;
}

interface ResourcePickerModalProps {
    sectionId: string;
    lessonId: string;
    onAttached: (sectionId: string, lessonId: string, resourceId: string, resourceType: ResourceType) => void;
    onClose: () => void;
}

export default function ResourcePickerModal({ sectionId, lessonId, onAttached, onClose }: ResourcePickerModalProps) {
    const [selectedType, setSelectedType] = useState<ResourceType | null>(null);
    const [resources, setResources] = useState<UnifiedResourceItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [attaching, setAttaching] = useState<string | null>(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchResources = useCallback(async () => {
        if (!selectedType) return;
        setLoading(true);
        try {
            const pageSize = 10;
            const searchParam = search.trim() || undefined;

            let items: UnifiedResourceItem[] = [];
            let tPages = 1;

            if (selectedType === ResourceType.Video) {
                const res = await videoApi.fetchVideos({ Search: searchParam, PageSize: pageSize, PageNumber: pageNumber });
                items = res.items.map(v => ({ id: v.videoId, resourceId: v.resourceId, title: v.title, type: ResourceType.Video }));
                tPages = res.totalPages;
            } else if (selectedType === ResourceType.Document) {
                const res = await documentApi.fetchDocuments({ Search: searchParam, PageSize: pageSize, PageNumber: pageNumber });
                items = res.items.map(d => ({ id: d.documentId, resourceId: d.resourceId, title: d.title, type: ResourceType.Document }));
                tPages = res.totalPages;
            } else if (selectedType === ResourceType.Quiz) {
                const res = await quizApi.fetchQuizzes({ Search: searchParam, PageSize: pageSize, PageNumber: pageNumber });
                items = res.items.map(q => ({ id: q.id, resourceId: q.resourceId || q.resource?.id || q.id, title: q.title, type: ResourceType.Quiz }));
                tPages = res.totalPages;
            } else if (selectedType === ResourceType.Scenario) {
                const res = await fetchScenarioCards({ Search: searchParam, PageSize: pageSize, PageNumber: pageNumber });
                items = res.items.map(s => ({ id: s.id, resourceId: s.resourceId || s.id, title: s.title, description: s.description || undefined, type: ResourceType.Scenario }));
                tPages = res.totalPages;
            }
            
            // Set items (ensure resourceId falls back to id if completely missing)
            setResources(items.map(i => ({ ...i, resourceId: i.resourceId || i.id })));
            setTotalPages(tPages);
        } catch {
            showToast("error", "Failed to load resources");
        } finally {
            setLoading(false);
        }
    }, [selectedType, search, pageNumber]);

    useEffect(() => {
        if (selectedType) {
            const t = setTimeout(fetchResources, 300);
            return () => clearTimeout(t);
        }
    }, [fetchResources, selectedType]);

    // Reset pagination on search or type change
    useEffect(() => {
        setPageNumber(1);
    }, [search, selectedType]);

    const handleAttach = async (resourceId: string, resourceType: ResourceType) => {
        setAttaching(resourceId);
        try {
            await courseApi.attachLessonResource(sectionId, lessonId, { resourceId });
            onAttached(sectionId, lessonId, resourceId, resourceType);
            showToast("success", "Resource attached");
        } catch (err: any) {
            // Check for 409 Conflict specific error message if applicable
            showToast("error", err.message || "Failed to attach resource");
        } finally {
            setAttaching(null);
        }
    };

    const renderTypeSelector = () => {
        const types = [
            { type: ResourceType.Video, icon: <Film size={24} className="text-teal-500" />, label: "Video", desc: "Attach an uploaded video" },
            { type: ResourceType.Document, icon: <FileText size={24} className="text-blue-500" />, label: "Document", desc: "Attach a PDF or file" },
            { type: ResourceType.Quiz, icon: <FileQuestion size={24} className="text-amber-500" />, label: "Quiz", desc: "Attach an assessment" },
            { type: ResourceType.Scenario, icon: <Gamepad2 size={24} className="text-purple-500" />, label: "Scenario", desc: "Attach an interactive scenario" }
        ];

        return (
            <div className="p-6 grid grid-cols-2 gap-4">
                {types.map(t => (
                    <button
                        key={t.type}
                        onClick={() => setSelectedType(t.type)}
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-brand-border hover:border-brand-primary hover:bg-brand-soft transition-all cursor-pointer text-center group"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                            {t.icon}
                        </div>
                        <div>
                            <p className="font-semibold text-brand-text">{t.label}</p>
                            <p className="text-xs text-brand-muted mt-1">{t.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    const getIconForType = (type: ResourceType) => {
        switch (type) {
            case ResourceType.Video: return <Film size={16} className="text-teal-500" />;
            case ResourceType.Document: return <FileText size={16} className="text-blue-500" />;
            case ResourceType.Quiz: return <FileQuestion size={16} className="text-amber-500" />;
            case ResourceType.Scenario: return <Gamepad2 size={16} className="text-purple-500" />;
            default: return <FileText size={16} className="text-brand-muted" />;
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between px-6 py-4 border-b border-brand-border">
                    <div className="flex items-center gap-3">
                        {selectedType && (
                            <button
                                onClick={() => { setSelectedType(null); setSearch(""); }}
                                className="p-1 -ml-2 text-brand-muted hover:text-brand-text hover:bg-brand-soft rounded-lg cursor-pointer transition-colors"
                            >
                                <ArrowLeft size={18} />
                            </button>
                        )}
                        <h3 className="text-lg font-semibold text-brand-text">
                            {selectedType ? `Select ${selectedType}` : "Choose Resource Type"}
                        </h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-brand-muted hover:text-brand-text rounded-lg hover:bg-brand-soft cursor-pointer transition-colors"><X size={20} /></button>
                </div>

                {!selectedType ? renderTypeSelector() : (
                    <>
                        <div className="px-6 py-4 border-b border-brand-border bg-brand-bg/30">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                                <input
                                    type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                                    placeholder={`Search ${selectedType.toLowerCase()}s...`}
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary bg-white shadow-sm"
                                />
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 min-h-[300px]">
                            {loading ? (
                                <div className="flex items-center justify-center h-full"><Loader2 size={24} className="text-brand-primary animate-spin" /></div>
                            ) : resources.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mb-3">
                                        <Search size={20} className="text-brand-muted" />
                                    </div>
                                    <p className="text-sm font-medium text-brand-text">No {selectedType.toLowerCase()}s found</p>
                                    <p className="text-xs text-brand-muted mt-1">Try adjusting your search</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {resources.map((r) => (
                                        <button
                                            key={r.resourceId}
                                            onClick={() => handleAttach(r.resourceId, r.type)}
                                            disabled={!!attaching}
                                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-brand-border hover:border-brand-primary hover:shadow-sm transition-all text-left cursor-pointer disabled:opacity-50 group bg-white"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-brand-soft flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                                {getIconForType(r.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-brand-text truncate">{r.title || "Untitled"}</p>
                                                {r.description && <p className="text-xs text-brand-muted truncate mt-0.5">{r.description}</p>}
                                                <p className="text-[10px] uppercase font-medium text-brand-muted mt-1 tracking-wide">{r.type}</p>
                                            </div>
                                            {attaching === r.resourceId ? <Loader2 size={16} className="text-brand-primary animate-spin" /> : <Check size={16} className="text-brand-muted opacity-0 group-hover:opacity-100 transition-opacity" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between bg-brand-bg/30">
                                <button
                                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                    disabled={pageNumber === 1 || loading}
                                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text hover:bg-white disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
                                >
                                    <ChevronLeft size={16} />
                                </button>
                                <span className="text-xs font-medium text-brand-muted">
                                    Page {pageNumber} of {totalPages}
                                </span>
                                <button
                                    onClick={() => setPageNumber(p => Math.min(totalPages, p + 1))}
                                    disabled={pageNumber === totalPages || loading}
                                    className="p-1.5 rounded-lg border border-brand-border text-brand-muted hover:text-brand-text hover:bg-white disabled:opacity-50 cursor-pointer shadow-sm transition-colors"
                                >
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
