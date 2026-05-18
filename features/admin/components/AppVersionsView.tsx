"use client";

import { useState } from "react";
import { 
    Layers, 
    UploadCloud, 
    Search, 
    Download, 
    Loader2, 
    Smartphone, 
    Monitor, 
    Laptop, 
    CheckCircle2, 
    Clock, 
    AlertTriangle,
    X,
    FileText,
    ArrowUpRight
} from "lucide-react";
import { publishAppVersion } from "../lib/app-version-api";
import { showToast } from "@/features/instructor/components/Toast";

interface ReleaseItem {
    id: string;
    version: string;
    applicationName: string;
    platform: string;
    releaseDate: string;
    status: "Active" | "Deprecated" | "Testing";
    url: string;
}

export default function AppVersionsView() {
    // Mock history of releases initialized from the design mockups
    const [releases, setReleases] = useState<ReleaseItem[]>([
        {
            id: "1",
            version: "v2.4.1-stable",
            applicationName: "Virtual Horizon VR Client",
            platform: "Windows",
            releaseDate: new Date("2026-05-10").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Active",
            url: "https://cdn.virtualhorizon.io/releases/vh-vr-desktop-v2.4.1.exe"
        },
        {
            id: "2",
            version: "v2.4.0-stable",
            applicationName: "Virtual Horizon Oculus Quest",
            platform: "Android",
            releaseDate: new Date("2026-05-02").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Active",
            url: "https://cdn.virtualhorizon.io/releases/vh-quest-v2.4.0.apk"
        },
        {
            id: "3",
            version: "v2.3.8-beta",
            applicationName: "Virtual Horizon Mobile Reader",
            platform: "iOS",
            releaseDate: new Date("2026-04-20").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Testing",
            url: "https://cdn.virtualhorizon.io/releases/vh-mobile-v2.3.8.ipa"
        },
        {
            id: "4",
            version: "v2.3.0-stable",
            applicationName: "Virtual Horizon VR Client",
            platform: "macOS",
            releaseDate: new Date("2026-03-12").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
            status: "Deprecated",
            url: "https://cdn.virtualhorizon.io/releases/vh-mac-v2.3.0.dmg"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState("");
    
    // Form fields state
    const [applicationName, setApplicationName] = useState("");
    const [platform, setPlatform] = useState("Windows");
    const [version, setVersion] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // Mock upload state
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Filter Releases list based on Search
    const filteredReleases = releases.filter(r => 
        r.version.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.applicationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.platform.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Simulate drag-over file upload
    const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingFile(file.name);
        setUploadProgress(0);

        // Pre-fill application name or generate version from filename if recognizable
        const nameClean = file.name.split(".")[0].replace(/[-_]/g, " ");
        if (!applicationName) {
            setApplicationName(nameClean.charAt(0).toUpperCase() + nameClean.slice(1));
        }

        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    showToast("success", `File ${file.name} uploaded to storage!`);
                    
                    // Generate a simulated CDN download URL
                    const cdnUrl = `https://cdn.virtualhorizon.io/releases/${file.name.toLowerCase().replace(/\s+/g, "-")}`;
                    setDownloadUrl(cdnUrl);
                    
                    return 100;
                }
                return prev + 10;
            });
        }, 150);
    };

    // Reset upload simulation
    const handleCancelUpload = () => {
        setUploadingFile(null);
        setUploadProgress(0);
        setDownloadUrl("");
    };

    // Handle Form Submit (Deploy)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!applicationName.trim() || !version.trim() || !downloadUrl.trim()) {
            showToast("error", "Please fill in all version details.");
            return;
        }

        setSubmitting(true);
        try {
            await publishAppVersion({
                applicationName: applicationName.trim(),
                platform,
                version: version.trim(),
                url: downloadUrl.trim()
            });

            showToast("success", `Version ${version} published successfully!`);

            // Append to local release history list
            const newRelease: ReleaseItem = {
                id: crypto.randomUUID(),
                version: version.trim(),
                applicationName: applicationName.trim(),
                platform,
                releaseDate: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                status: "Active",
                url: downloadUrl.trim()
            };

            setReleases(prev => [newRelease, ...prev]);

            // Clear inputs
            setApplicationName("");
            setVersion("");
            setDownloadUrl("");
            setUploadingFile(null);
            setUploadProgress(0);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to publish version.");
        } finally {
            setSubmitting(false);
        }
    };

    // Get Platform Graphic Icon
    const getPlatformIcon = (plat: string) => {
        const lower = plat.toLowerCase();
        if (lower.includes("win")) return <Laptop className="text-brand-primary" size={20} />;
        if (lower.includes("mac") || lower.includes("ios") || lower.includes("apple")) {
            return <Monitor className="text-brand-primary" size={20} />;
        }
        return <Smartphone className="text-brand-primary" size={20} />;
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-bold text-brand-navy tracking-tight">Application Versions</h1>
                <p className="text-brand-muted text-[15px] font-medium mt-1">
                    Upload and manage installer executables and client build deployments.
                </p>
            </div>

            {/* Upload Panel */}
            <section className="bg-white rounded-2xl border border-brand-border/70 p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-stretch">
                    
                    {/* Left Form Inputs column */}
                    <div className="flex-1 space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-brand-navy">Upload App Version</h3>
                            <p className="text-xs text-brand-muted font-semibold mt-1">Register a new release binary for user platforms.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {/* App Name */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">Application Name</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. Virtual Horizon VR Client"
                                    value={applicationName}
                                    onChange={(e) => setApplicationName(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium placeholder:text-brand-muted/40"
                                />
                            </div>

                            {/* Platform selector */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">Platform</label>
                                <select 
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-semibold"
                                >
                                    <option value="Windows">Windows (x64)</option>
                                    <option value="macOS">macOS</option>
                                    <option value="Android">Android (Quest/Mobile)</option>
                                    <option value="iOS">iOS (iPhone/iPad)</option>
                                </select>
                            </div>

                            {/* Version Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">Version Number</label>
                                <input 
                                    type="text"
                                    required
                                    placeholder="e.g. v2.4.2-stable"
                                    value={version}
                                    onChange={(e) => setVersion(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium placeholder:text-brand-muted/40"
                                />
                            </div>

                            {/* URL Input */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">Download URL</label>
                                <input 
                                    type="url"
                                    required
                                    placeholder="https://cdn.virtualhorizon.io/..."
                                    value={downloadUrl}
                                    onChange={(e) => setDownloadUrl(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium placeholder:text-brand-muted/40"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Right File Upload Dropzone column */}
                    <div className="w-full lg:w-80 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-brand-border/70 pt-6 lg:pt-0 lg:pl-8">
                        <div>
                            <label className="text-xs font-bold text-brand-navy uppercase tracking-wide ml-1">Binary File Upload</label>
                            
                            {uploadingFile ? (
                                /* Upload Progress State */
                                <div className="mt-3.5 border border-brand-border/80 rounded-2xl p-5 bg-brand-soft/20 flex flex-col gap-4 relative">
                                    <button 
                                        type="button"
                                        onClick={handleCancelUpload}
                                        className="absolute top-2 right-2 text-brand-muted hover:text-brand-navy p-1 rounded-lg hover:bg-brand-soft"
                                    >
                                        <X size={16} />
                                    </button>
                                    
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary">
                                            <FileText size={20} />
                                        </div>
                                        <div className="overflow-hidden max-w-[170px]">
                                            <p className="text-xs font-bold text-brand-navy truncate">{uploadingFile}</p>
                                            <p className="text-[10px] text-brand-muted mt-0.5">{uploadProgress}% uploaded</p>
                                        </div>
                                    </div>

                                    {/* Progress meter */}
                                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-brand-primary h-full transition-all duration-150 rounded-full"
                                            style={{ width: `${uploadProgress}%` }}
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Inactive/Standard Input File Dropzone */
                                <div className="mt-3.5 relative border-2 border-dashed border-brand-border/80 hover:border-brand-primary rounded-2xl p-6 bg-brand-bg hover:bg-brand-soft/10 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[160px]">
                                    <input 
                                        type="file"
                                        onChange={handleFileUploadSim}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        accept=".exe,.dmg,.apk,.ipa,.zip"
                                    />
                                    <UploadCloud size={32} className="text-brand-primary group-hover:scale-105 transition-transform" />
                                    <p className="text-xs font-bold text-brand-navy mt-3">Select app installer binary</p>
                                    <p className="text-[10px] text-brand-muted mt-1">Accepts EXE, APK, DMG, IPA (Max 250MB)</p>
                                </div>
                            )}
                        </div>

                        {/* Submit Button */}
                        <div className="mt-6 flex justify-end">
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-brand-primary text-white font-bold py-3.5 rounded-xl hover:bg-brand-hover hover:shadow-sm active:scale-98 transition-all duration-100 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 text-xs"
                            >
                                {submitting ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <UploadCloud size={14} />
                                )}
                                Publish New Release
                            </button>
                        </div>
                    </div>
                </form>
            </section>

            {/* Recent Releases Section */}
            <section className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-brand-navy">Recent Releases</h3>
                        <p className="text-xs text-brand-muted font-semibold mt-1">Audit log of historically deployed application builds.</p>
                    </div>

                    {/* Search filter for versions */}
                    <div className="relative max-w-xs w-full">
                        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            type="text"
                            placeholder="Search versions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                        />
                    </div>
                </div>

                {/* Table of deployed versions */}
                <div className="bg-white rounded-2xl border border-brand-border/70 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        {filteredReleases.length === 0 ? (
                            <div className="py-16 text-center text-brand-muted">
                                <p className="text-sm font-semibold">No release records found matching filters.</p>
                            </div>
                        ) : (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-brand-soft/20 border-b border-brand-border/70">
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Version</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Platform</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Release Date</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-brand-muted uppercase tracking-wider text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-border/60">
                                    {filteredReleases.map((release) => {
                                        const isAct = release.status === "Active";
                                        const isTest = release.status === "Testing";
                                        const isDep = release.status === "Deprecated";

                                        return (
                                            <tr key={release.id} className="hover:bg-brand-soft/10 transition-colors group">
                                                {/* Version info */}
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="w-10 h-10 rounded-xl bg-brand-soft border border-brand-border/50 flex items-center justify-center shrink-0">
                                                            {getPlatformIcon(release.platform)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-extrabold text-brand-navy">{release.version}</p>
                                                            <p className="text-[11px] text-brand-muted font-medium mt-0.5">{release.applicationName}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {/* Platform tag */}
                                                <td className="px-6 py-4">
                                                    <span className="px-2.5 py-1 bg-brand-soft text-brand-navy rounded-lg text-[11px] font-bold">
                                                        {release.platform}
                                                    </span>
                                                </td>
                                                {/* Date */}
                                                <td className="px-6 py-4 text-sm text-brand-muted font-semibold">{release.releaseDate}</td>
                                                {/* Status badge */}
                                                <td className="px-6 py-4">
                                                    <span className={`
                                                        inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase
                                                        ${isAct ? "bg-green-50 text-green-700" : ""}
                                                        ${isTest ? "bg-amber-50 text-amber-700" : ""}
                                                        ${isDep ? "bg-gray-100 text-gray-600" : ""}
                                                    `}>
                                                        <span className={`
                                                            w-1.5 h-1.5 rounded-full
                                                            ${isAct ? "bg-green-600" : ""}
                                                            ${isTest ? "bg-amber-500" : ""}
                                                            ${isDep ? "bg-gray-400" : ""}
                                                        `} />
                                                        {release.status}
                                                    </span>
                                                </td>
                                                {/* Download Link action */}
                                                <td className="px-6 py-4 text-right">
                                                    <a 
                                                        href={release.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex p-2 text-brand-muted hover:text-brand-primary hover:bg-brand-primary/5 rounded-lg transition-all"
                                                        title="Download binary"
                                                    >
                                                        <Download size={16} />
                                                    </a>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Table Footer */}
                    <div className="px-6 py-4 border-t border-brand-border/70 flex items-center justify-between bg-gray-50/50">
                        <p className="text-xs font-bold text-brand-muted">
                            Showing {filteredReleases.length} of {releases.length} releases
                        </p>
                        <div className="flex gap-2">
                            <button disabled className="px-3.5 py-1.5 border border-brand-border/80 bg-white text-xs font-bold text-brand-navy rounded-xl hover:bg-brand-soft/20 disabled:opacity-50">
                                Previous
                            </button>
                            <button disabled className="px-3.5 py-1.5 border border-brand-border/80 bg-white text-xs font-bold text-brand-navy rounded-xl hover:bg-brand-soft/20 disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
