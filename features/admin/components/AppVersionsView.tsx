"use client";

import { useEffect, useState, useCallback } from "react";
import { 
    Layers, 
    Search, 
    Loader2, 
    Smartphone, 
    Monitor, 
    Laptop, 
    Trash2, 
    Edit, 
    X, 
    ChevronLeft, 
    ChevronRight, 
    Plus, 
    RefreshCw,
    AlertTriangle,
    Globe,
    Terminal
} from "lucide-react";
import { 
    getAppVersions, 
    publishAppVersion, 
    updateAppVersion, 
    deleteAppVersion,
    ApplicationVersion,
    ApplicationVersionPagedResult
} from "../lib/app-version-api";
import { showToast } from "@/features/instructor/components/Toast";

export default function AppVersionsView() {
    const [pagedData, setPagedData] = useState<ApplicationVersionPagedResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Pagination & Sorting
    const [pageNumber, setPageNumber] = useState(1);
    const [pageSize] = useState(10);
    const [sortBy, setSortBy] = useState<"applicationname" | "platform" | "version">("version");
    const [isDescending, setIsDescending] = useState(true);

    // Form inputs state
    const [appId, setAppId] = useState<string | null>(null); // For editing mode
    const [applicationName, setApplicationName] = useState("VrStudio");
    const [platform, setPlatform] = useState("Windows");
    const [version, setVersion] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Action deletes state
    const [itemToDelete, setItemToDelete] = useState<ApplicationVersion | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch versions from API
    const fetchVersions = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAppVersions({
                Search: searchTerm.trim() || undefined,
                SortBy: sortBy,
                IsDescending: isDescending,
                PageNumber: pageNumber,
                PageSize: pageSize
            });
            setPagedData(data);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to load application versions.");
        } finally {
            setLoading(false);
        }
    }, [searchTerm, sortBy, isDescending, pageNumber, pageSize]);

    // Refresh lists on parameters modification
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            fetchVersions();
        }, 300);
        return () => clearTimeout(delayDebounce);
    }, [fetchVersions]);

    // Handle Form Submit (Deploy / Update)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!version.trim() || !downloadUrl.trim()) {
            showToast("error", "Please fill in all version details.");
            return;
        }

        setSubmitting(true);
        try {
            if (appId) {
                // Edit / PUT route
                await updateAppVersion(appId, {
                    applicationName,
                    platform,
                    version: version.trim(),
                    url: downloadUrl.trim()
                });
                showToast("success", "Application version updated successfully!");
            } else {
                // Create / POST route
                await publishAppVersion({
                    applicationName,
                    platform,
                    version: version.trim(),
                    url: downloadUrl.trim()
                });
                showToast("success", "New application version published successfully!");
            }

            // Reset Form and reload
            handleResetForm();
            fetchVersions();
        } catch (error: any) {
            showToast("error", error?.message || "Failed to submit version.");
        } finally {
            setSubmitting(false);
        }
    };

    // Handle Delete confirmation
    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        try {
            await deleteAppVersion(itemToDelete.id);
            showToast("success", "Version record deleted successfully.");
            setItemToDelete(null);
            fetchVersions();
        } catch (error: any) {
            showToast("error", error?.message || "Failed to delete version.");
        } finally {
            setIsDeleting(false);
        }
    };

    // Toggle edit mode
    const handleEditClick = (item: ApplicationVersion) => {
        setAppId(item.id);
        setApplicationName(item.applicationName);
        setPlatform(item.platform);
        setVersion(item.version);
        setDownloadUrl(item.url);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Reset Form
    const handleResetForm = () => {
        setAppId(null);
        setApplicationName("VrStudio");
        setPlatform("Windows");
        setVersion("");
        setDownloadUrl("");
    };

    // Handle sort toggle
    const handleSort = (column: "applicationname" | "platform" | "version") => {
        if (sortBy === column) {
            setIsDescending(!isDescending);
        } else {
            setSortBy(column);
            setIsDescending(true);
        }
        setPageNumber(1);
    };

    // Get Platform Graphic Icon
    const getPlatformIcon = (plat: string) => {
        const lower = plat.toLowerCase();
        if (lower.includes("win")) return <Laptop className="text-[#3b82f6]" size={18} />;
        if (lower.includes("mac") || lower.includes("ios") || lower.includes("apple")) {
            return <Monitor className="text-[#8b5cf6]" size={18} />;
        }
        if (lower.includes("android")) {
            return <Smartphone className="text-[#10b981]" size={18} />;
        }
        if (lower.includes("linux")) {
            return <Terminal className="text-[#f59e0b]" size={18} />;
        }
        return <Globe className="text-brand-muted" size={18} />;
    };

    const formatAppFriendlyName = (name: string) => {
        if (name === "VrStudio") return "VR Studio Client";
        if (name === "VrScinarioDisplay") return "VR Scenario Display";
        return name;
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric"
        });
    };

    return (
        <div className="space-y-8">
            {/* Header info */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-[28px] font-bold text-brand-navy tracking-tight">Application Versions</h1>
                    <p className="text-brand-muted text-[15px] font-medium mt-1">
                        Register, edit, and audit platform binaries for VR client applications.
                    </p>
                </div>
                <button
                    onClick={() => fetchVersions()}
                    className="p-2 hover:bg-brand-soft rounded-xl text-brand-muted hover:text-brand-navy transition-all"
                    title="Reload data"
                >
                    <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Form Panel */}
            <section className="bg-white rounded-3xl border border-brand-border/80 p-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-primary" />
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex justify-between items-center border-b border-brand-border/60 pb-4">
                        <div>
                            <h3 className="text-[17px] font-extrabold text-brand-navy">
                                {appId ? "Edit Release Version" : "Register New Release Version"}
                            </h3>
                            <p className="text-[11px] text-brand-muted font-bold tracking-wide uppercase mt-1">
                                {appId ? `Updating record ID: ${appId.slice(0, 8)}...` : "Enter client release metadata (no file upload required)"}
                            </p>
                        </div>
                        {appId && (
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 text-xs font-bold transition-all"
                            >
                                <X size={14} />
                                Cancel Edit
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Application Name */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider ml-1">Application Client</label>
                            <select 
                                value={applicationName}
                                onChange={(e) => setApplicationName(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-brand-navy cursor-pointer"
                            >
                                <option value="VrStudio">VR Studio (VrStudio)</option>
                                <option value="VrScinarioDisplay">VR Scenario Display (VrScinarioDisplay)</option>
                            </select>
                        </div>

                        {/* Platform */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider ml-1">Platform OS</label>
                            <select 
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold text-brand-navy cursor-pointer"
                            >
                                <option value="Windows">Windows</option>
                                <option value="MacOS">MacOS</option>
                                <option value="Linux">Linux</option>
                                <option value="Android">Android</option>
                                <option value="iOS">iOS</option>
                            </select>
                        </div>

                        {/* Version */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider ml-1">Version Number</label>
                            <input 
                                type="text"
                                required
                                placeholder="e.g. v2.4.2-stable"
                                value={version}
                                onChange={(e) => setVersion(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium text-brand-navy placeholder:text-brand-muted/40"
                            />
                        </div>

                        {/* URL */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider ml-1">Download URL</label>
                            <input 
                                type="url"
                                required
                                placeholder="https://storage.cdn.io/releases/..."
                                value={downloadUrl}
                                onChange={(e) => setDownloadUrl(e.target.value)}
                                className="w-full h-11 px-4 bg-white border border-brand-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium text-brand-navy placeholder:text-brand-muted/40"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-2 border-t border-brand-border/60">
                        <button 
                            type="submit"
                            disabled={submitting}
                            className="bg-brand-primary text-white font-bold px-6 h-11 rounded-xl hover:bg-brand-hover hover:shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                        >
                            {submitting ? (
                                <Loader2 size={15} className="animate-spin" />
                            ) : appId ? (
                                <Edit size={15} />
                            ) : (
                                <Plus size={15} />
                            )}
                            {appId ? "Update Version Record" : "Publish Version Release"}
                        </button>
                    </div>
                </form>
            </section>

            {/* Recent Releases Section */}
            <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-brand-navy">Deployments Catalog</h3>
                        <p className="text-xs text-brand-muted font-semibold mt-1">Audit log of historically configured client application builds.</p>
                    </div>

                    {/* Search filter for versions */}
                    <div className="relative max-w-xs w-full">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            type="text"
                            placeholder="Search version parameters..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPageNumber(1); }}
                            className="w-full pl-10 pr-4 h-10 bg-white border border-brand-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table of deployed versions */}
                <div className="bg-white rounded-3xl border border-brand-border/70 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        {loading ? (
                            <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
                                <Loader2 className="animate-spin text-brand-primary" size={32} />
                                <p className="text-sm font-semibold text-brand-muted">Fetching app versions...</p>
                            </div>
                        ) : !pagedData?.items || pagedData.items.length === 0 ? (
                            <div className="py-16 text-center text-brand-muted">
                                <p className="text-sm font-semibold">No release records found matching filters.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-brand-soft/20 border-b border-brand-border/70">
                                        <th 
                                            className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider cursor-pointer hover:text-brand-navy"
                                            onClick={() => handleSort("applicationname")}
                                        >
                                            Application {sortBy === "applicationname" && (isDescending ? "↓" : "↑")}
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider cursor-pointer hover:text-brand-navy"
                                            onClick={() => handleSort("platform")}
                                        >
                                            Platform {sortBy === "platform" && (isDescending ? "↓" : "↑")}
                                        </th>
                                        <th 
                                            className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider cursor-pointer hover:text-brand-navy"
                                            onClick={() => handleSort("version")}
                                        >
                                            Version {sortBy === "version" && (isDescending ? "↓" : "↑")}
                                        </th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">Date Registered</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">URL Link</th>
                                        <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/50">
                                    {pagedData.items.map((release) => (
                                        <tr key={release.id} className="hover:bg-brand-soft/10 transition-colors group">
                                            {/* Version info */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-brand-soft border border-brand-border/40 flex items-center justify-center shrink-0">
                                                        {getPlatformIcon(release.platform)}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-extrabold text-brand-navy">
                                                            {formatAppFriendlyName(release.applicationName)}
                                                        </p>
                                                        <p className="text-[10px] text-brand-muted font-bold tracking-wide uppercase mt-0.5">
                                                            {release.applicationName}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            {/* Platform tag */}
                                            <td className="px-6 py-4">
                                                <span className="px-2.5 py-1 bg-brand-soft border border-brand-border/60 text-brand-navy rounded-lg text-xs font-bold">
                                                    {release.platform}
                                                </span>
                                            </td>
                                            {/* Version */}
                                            <td className="px-6 py-4 text-sm font-extrabold text-brand-navy">{release.version}</td>
                                            {/* Date */}
                                            <td className="px-6 py-4 text-xs text-brand-muted font-bold">{formatDate(release.createdAtUtc)}</td>
                                            {/* Download URL Link */}
                                            <td className="px-6 py-4">
                                                <a 
                                                    href={release.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-brand-primary font-bold hover:underline truncate max-w-xs block"
                                                    title={release.url}
                                                >
                                                    {release.url}
                                                </a>
                                            </td>
                                            {/* Actions */}
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button 
                                                        onClick={() => handleEditClick(release)}
                                                        className="p-1.5 text-brand-muted hover:text-brand-primary hover:bg-brand-soft rounded bg-white shadow-sm border border-brand-border cursor-pointer"
                                                        title="Edit version parameters"
                                                    >
                                                        <Edit size={15} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setItemToDelete(release)}
                                                        className="p-1.5 text-brand-muted hover:text-red-600 hover:bg-red-50 rounded bg-white shadow-sm border border-brand-border cursor-pointer"
                                                        title="Delete version record"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Table Footer / Pagination */}
                    {pagedData && pagedData.totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-brand-border/70 flex items-center justify-between bg-gray-50/50">
                            <p className="text-xs font-bold text-brand-muted">
                                Page <span className="text-brand-navy">{pagedData.pageNumber}</span> of {pagedData.totalPages} ({pagedData.totalCount} total entries)
                            </p>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setPageNumber(p => Math.max(1, p - 1))}
                                    disabled={pagedData.pageNumber === 1}
                                    className="px-3.5 py-1.5 border border-brand-border bg-white text-xs font-bold text-brand-navy rounded-xl hover:bg-brand-soft/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Previous
                                </button>
                                <button 
                                    onClick={() => setPageNumber(p => Math.min(pagedData.totalPages, p + 1))}
                                    disabled={pagedData.pageNumber === pagedData.totalPages}
                                    className="px-3.5 py-1.5 border border-brand-border bg-white text-xs font-bold text-brand-navy rounded-xl hover:bg-brand-soft/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col border border-brand-border animate-in scale-in duration-200">
                        <div className="p-6 text-center">
                            <div className="mx-auto w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4 text-red-600">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-brand-navy mb-2">Delete Version Record</h3>
                            <p className="text-xs text-brand-muted mb-6 leading-relaxed">
                                Are you sure you want to delete <span className="font-extrabold text-brand-navy">{itemToDelete.version}</span> for <span className="font-extrabold text-brand-navy">{formatAppFriendlyName(itemToDelete.applicationName)}</span>? This action is permanent.
                            </p>
                            
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => setItemToDelete(null)}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2.5 rounded-xl text-xs font-bold text-brand-navy bg-brand-soft hover:bg-brand-border/60 transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 cursor-pointer"
                                >
                                    {isDeleting ? (
                                        <Loader2 size={16} className="animate-spin" />
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
