"use client";

import { useState, useEffect, useCallback } from "react";
import { Upload, Search, Filter, Film, FileText, MoreVertical, Trash2, Eye, Download, ChevronLeft, ChevronRight, Video, FileQuestion, Gamepad2, FileBox, FileSpreadsheet, Presentation, AlertTriangle } from "lucide-react";
import { videoApi } from "../../../features/instructor/lib/video-api";
import { ResourceResult, ResourceType, ResourceResultPagedResult } from "../../../features/instructor/types/video";
import UploadMediaModal from "../../../features/instructor/components/UploadMediaModal";
import VideoPreviewModal from "../../../features/instructor/components/VideoPreviewModal";
import { documentApi } from "../../../features/instructor/lib/document-api";

export default function MediaHubPage() {
    const [resources, setResources] = useState<ResourceResultPagedResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState<string>("All Assets");
    
    // Pagination and Sorting states
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState<'id' | 'title' | 'createdat'>('createdat');
    const [isDescending, setIsDescending] = useState(true);

    // Modals
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [previewVideo, setPreviewVideo] = useState<{ id: string, title: string } | null>(null);
    const [itemToDelete, setItemToDelete] = useState<{ id: string, title: string } | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const [filterId, setFilterId] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            const fid = params.get("Filters[id]");
            if (fid) {
                setFilterId(fid);
            }
        }
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            let typeFilter: string | string[] | undefined = undefined;
            if (activeFilter === "Videos") typeFilter = "Video";
            else if (activeFilter === "Documents") typeFilter = "Document";
            
            const reqTerm = searchTerm.trim() || undefined;

            const res = await videoApi.fetchResources({
                Search: reqTerm,
                SortBy: sortBy,
                IsDescending: isDescending,
                PageNumber: pageNumber,
                PageSize: pageSize,
                "Filters[type]": typeFilter,
                "Filters[id]": filterId || undefined
            });
            setResources(res);
        } catch (error) {
            console.error("Failed to fetch resources", error);
        } finally {
            setLoading(false);
        }
    }, [searchTerm, activeFilter, sortBy, isDescending, pageNumber, pageSize, filterId]);

    // Use a debounce for search
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
            await videoApi.deleteResource(itemToDelete.id);
            fetchData();
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete resource", error);
            alert("Error deleting resource");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSort = (column: 'id' | 'title' | 'createdat') => {
        if (sortBy === column) {
            setIsDescending(!isDescending);
        } else {
            setSortBy(column);
            setIsDescending(true);
        }
        setPageNumber(1); // Reset to page 1 on sort change
    };

    const handleFilterChange = (filter: string) => {
        setActiveFilter(filter);
        setPageNumber(1);
    };

    const getIconForItem = (item: ResourceResult) => {
        if (item.type === ResourceType.Document && item.mimeType) {
            const mime = item.mimeType.toLowerCase();
            if (mime.includes("pdf")) return <FileText size={18} className="text-red-500" />;
            if (mime.includes("spreadsheet") || mime.includes("excel") || mime.includes("csv")) return <FileSpreadsheet size={18} className="text-green-600" />;
            if (mime.includes("presentation") || mime.includes("powerpoint")) return <Presentation size={18} className="text-orange-500" />;
            if (mime.includes("word")) return <FileText size={18} className="text-blue-600" />;
            return <FileText size={18} className="text-blue-500" />;
        }

        switch (item.type) {
            case ResourceType.Video: return <Film size={18} className="text-brand-primary" />;
            case ResourceType.Document: return <FileText size={18} className="text-blue-500" />;
            case ResourceType.Article: return <FileText size={18} className="text-emerald-500" />;
            case ResourceType.Quiz: return <FileQuestion size={18} className="text-amber-500" />;
            case ResourceType.Scenario: return <Gamepad2 size={18} className="text-rose-500" />;
            default: return <FileBox size={18} className="text-brand-muted" />;
        }
    };

    const getTypeLabel = (item: ResourceResult) => {
        if (item.type === ResourceType.Document && item.mimeType) {
            const mime = item.mimeType.toLowerCase();
            if (mime.includes("pdf")) return "PDF Document";
            if (mime.includes("spreadsheet") || mime.includes("excel")) return "Excel Spreadsheet";
            if (mime.includes("csv")) return "CSV File";
            if (mime.includes("presentation") || mime.includes("powerpoint")) return "PowerPoint";
            if (mime.includes("word")) return "Word Document";
            if (mime.includes("text/plain")) return "Text File";
            return "Document";
        }
        return item.type;
    };

    return (
        <div className="pt-12 lg:pt-0">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-text">Media Hub</h1>
                    <p className="text-brand-muted mt-1">Manage and upload your course assets.</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-sm text-brand-muted bg-brand-soft px-3 py-1.5 rounded-lg">
                        {loading ? "Loading..." : `${resources?.totalCount || 0} Items`}
                    </span>
                    <button 
                        onClick={() => setIsUploadOpen(true)}
                        className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/20 cursor-pointer"
                    >
                        <Upload size={16} />
                        Upload Material
                    </button>
                </div>
            </div>

            {/* Upload Zone (Quick drop) */}
            <div 
                onClick={() => setIsUploadOpen(true)}
                className="border-2 border-dashed border-brand-border rounded-xl p-6 md:p-10 text-center mb-8 bg-white hover:border-teal-300 hover:bg-brand-soft transition-all duration-200 cursor-pointer"
            >
                <div className="mx-auto w-12 h-12 rounded-full bg-brand-soft flex items-center justify-center mb-3">
                    <Upload size={22} className="text-brand-muted" />
                </div>
                <p className="text-sm text-brand-text font-medium">
                    Drag and drop files here, or <span className="text-brand-primary underline">click to browse</span>
                </p>
                <p className="text-xs text-brand-muted mt-1">Supported formats: MP4, WebM, PDF, DOCX, etc. (Max size 2GB)</p>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col xl:flex-row gap-3 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Search by file name..."
                        value={searchTerm}
                        onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 transition-all"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {["All Assets", "Videos", "Documents"].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => handleFilterChange(filter)}
                            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                                activeFilter === filter
                                    ? "bg-[#13151B] text-white"
                                    : "bg-white text-brand-text border border-brand-border hover:bg-brand-bg"
                            }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* File Table */}
            <div className="bg-white rounded-xl shadow-sm border border-brand-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-brand-border text-left text-brand-muted bg-brand-bg/50">
                                <th className="px-6 py-4 font-medium min-w-[300px] cursor-pointer hover:text-brand-text" onClick={() => handleSort('title')}>
                                    <div className="flex items-center gap-2">
                                        File Name {sortBy === 'title' && (isDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium hidden md:table-cell">Type</th>
                                <th className="px-6 py-4 font-medium hidden md:table-cell">Status</th>
                                <th className="px-6 py-4 font-medium hidden lg:table-cell cursor-pointer hover:text-brand-text" onClick={() => handleSort('createdat')}>
                                    <div className="flex items-center gap-2">
                                        Date Added {sortBy === 'createdat' && (isDescending ? '↓' : '↑')}
                                    </div>
                                </th>
                                <th className="px-6 py-4 font-medium hidden lg:table-cell">Size</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-16 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-8 h-8 border-2 border-brand-primary border-t-teal-600 rounded-full animate-spin" />
                                            <p className="text-brand-muted">Loading your media vault...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : resources?.items?.length ? (
                                resources.items.map((item) => (
                                    <tr key={item.resourceId} className="hover:bg-brand-bg/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center shrink-0">
                                                    {getIconForItem(item)}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-brand-text font-medium truncate">{item.title || "Untitled"}</p>
                                                    <p className="text-brand-muted text-xs truncate lg:hidden">{formatBytes(item.sizeBytes)} • {formatDate(item.uploadedAt)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-brand-soft text-brand-text">
                                                {getTypeLabel(item)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 hidden md:table-cell">
                                            {(() => {
                                                const statusStyles: Record<string, string> = {
                                                    'Created': 'bg-brand-bg text-brand-text border border-brand-border',
                                                    'UploadPending': 'bg-amber-50 text-amber-700 border border-amber-200',
                                                    'UploadComplete': 'bg-brand-soft text-teal-700 border border-brand-primary',
                                                    'Processing': 'bg-blue-50 text-blue-700 border border-blue-200',
                                                    'Draft': 'bg-orange-50 text-orange-700 border border-orange-200',
                                                    'Published': 'bg-green-50 text-green-700 border border-green-200',
                                                    'Archived': 'bg-brand-soft text-brand-primary border border-brand-primary',
                                                    'Failed': 'bg-red-50 text-red-700 border border-red-200',
                                                };
                                                const dotColors: Record<string, string> = {
                                                    'Created': 'bg-slate-400',
                                                    'UploadPending': 'bg-amber-500',
                                                    'UploadComplete': 'bg-brand-soft0',
                                                    'Processing': 'bg-blue-500 animate-pulse',
                                                    'Draft': 'bg-orange-500',
                                                    'Published': 'bg-green-500',
                                                    'Archived': 'bg-brand-soft0',
                                                    'Failed': 'bg-red-500',
                                                };
                                                const s = item.status || 'Created';
                                                return (
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[s] || statusStyles['Created']}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[s] || dotColors['Created']}`} />
                                                        {s}
                                                    </span>
                                                );
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-brand-muted whitespace-nowrap">
                                            {formatDate(item.uploadedAt)}
                                        </td>
                                        <td className="px-6 py-4 hidden lg:table-cell text-brand-muted whitespace-nowrap">
                                            {formatBytes(item.sizeBytes)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.type === ResourceType.Video && item.status !== 'Failed' && item.mediaId && (
                                                    <button 
                                                        onClick={() => setPreviewVideo({ id: item.mediaId as string, title: item.title || "Video Preview" })}
                                                        className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded bg-white shadow-sm border border-brand-border"
                                                        title="Preview"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                {item.type === ResourceType.Document && item.status !== 'Failed' && item.mediaId && (
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const url = await documentApi.getDocumentDownloadUrl(item.mediaId as string);
                                                                const a = document.createElement('a');
                                                                a.href = url;
                                                                a.download = item.title || 'document';
                                                                document.body.appendChild(a);
                                                                a.click();
                                                                document.body.removeChild(a);
                                                            } catch (err) {
                                                                console.error("Failed to download document", err);
                                                                alert("Failed to download document");
                                                            }
                                                        }}
                                                        className="p-1.5 text-brand-muted hover:text-blue-600 hover:bg-blue-50 rounded bg-white shadow-sm border border-brand-border"
                                                        title="Download"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setItemToDelete({ id: item.resourceId, title: item.title || "Untitled" })}
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
                                        <div className="mx-auto w-12 h-12 rounded-full bg-brand-bg flex items-center justify-center mb-3">
                                            <Search size={22} className="text-brand-muted" />
                                        </div>
                                        <p className="text-brand-muted">No media found matching your criteria.</p>
                                        {(searchTerm || activeFilter !== "All Assets") && (
                                            <button 
                                                onClick={() => { setSearchTerm(""); setActiveFilter("All Assets"); }}
                                                className="mt-2 text-sm text-brand-primary hover:underline"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {resources && resources.totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-brand-border flex items-center justify-between">
                        <p className="text-sm text-brand-muted">
                            Showing page <span className="font-medium text-brand-text">{resources.pageNumber}</span> of{" "}
                            <span className="font-medium text-brand-text">{resources.totalPages}</span>
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                disabled={resources.pageNumber === 1}
                                className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                onClick={() => setPageNumber(p => Math.min(resources.totalPages, p + 1))}
                                disabled={resources.pageNumber === resources.totalPages}
                                className="p-2 rounded-lg border border-brand-border text-brand-text hover:bg-brand-bg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Upload Modal */}
            {isUploadOpen && (
                <UploadMediaModal 
                    onClose={() => setIsUploadOpen(false)} 
                    onSuccess={() => {
                        setIsUploadOpen(false);
                        fetchData();
                    }} 
                />
            )}

            {/* Preview Modal */}
            {previewVideo && (
                <VideoPreviewModal 
                    videoId={previewVideo.id} 
                    title={previewVideo.title} 
                    onClose={() => setPreviewVideo(null)} 
                />
            )}

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
                                <AlertTriangle size={24} className="text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-brand-text mb-2">Delete Resource</h3>
                            <p className="text-sm text-brand-muted mb-6">
                                Are you sure you want to delete <span className="font-semibold text-brand-text">{itemToDelete.title}</span>? This action cannot be undone.
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setItemToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-brand-text bg-brand-soft hover:bg-brand-border transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-red-700 transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50"
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
