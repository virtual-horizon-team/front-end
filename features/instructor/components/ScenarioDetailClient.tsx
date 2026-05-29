"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Clock,
    Pencil,
    Glasses,
    Calendar,
    RefreshCw,
    Tag,
    ChevronRight,
    ChevronLeft,
    Home,
    AlertCircle,
    Zap,
    Shield,
    Info,
} from "lucide-react";
import { ScenarioDisplayDto, ScenarioMetadataResult } from "../types/scenario";
import LaunchVRModal from "./LaunchVRModal";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(raw: string | null): string | null {
    if (!raw) return null;
    const parts = raw.split(":");
    if (parts.length < 2) return null;
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (isNaN(hours) || isNaN(minutes)) return null;
    if (hours === 0) return `${minutes} Mins`;
    if (minutes === 0) return `${hours}h`;
    return `${hours}h ${minutes}m`;
}

function formatDate(iso: string | null | undefined): string | null {
    if (!iso) return null;
    const d = new Date(iso);
    if (isNaN(d.getTime())) return null;
    return new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    }).format(d);
}

function difficultyClasses(level: string | null | undefined): { pill: string; dot: string } {
    const n = level?.trim().toLowerCase();
    if (n === "easy") return { pill: "bg-green-50 text-green-700 border-green-200", dot: "bg-green-500" };
    if (n === "medium" || n === "intermediate") return { pill: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500" };
    if (n === "hard" || n === "advanced") return { pill: "bg-red-50 text-red-700 border-red-200", dot: "bg-red-500" };
    return { pill: "bg-gray-50 text-gray-600 border-gray-200", dot: "bg-gray-400" };
}

function statusClasses(status: string): string {
    switch (status) {
        case "Published": return "bg-teal-50 text-teal-700 border-teal-200";
        case "Draft": return "bg-gray-100 text-gray-600 border-gray-200";
        case "Uploaded": return "bg-purple-50 text-purple-700 border-purple-200";
        default: return "bg-gray-100 text-gray-600 border-gray-200";
    }
}

// ─── Toast ───────────────────────────────────────────────────────────────────

function useToast() {
    const [message, setMessage] = useState<string | null>(null);
    const show = useCallback((msg: string) => {
        setMessage(msg);
        setTimeout(() => setMessage(null), 3500);
    }, []);
    return { message, show };
}

// ─── Skeleton Loader ─────────────────────────────────────────────────────────

export function ScenarioDetailSkeleton() {
    return (
        <div className="pt-12 lg:pt-0 animate-pulse">
            <div className="h-4 bg-brand-soft rounded w-64 mb-3" />
            <div className="h-4 bg-brand-soft rounded w-32 mb-6" />
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-3 flex-1">
                    <div className="h-9 bg-brand-soft rounded w-2/3" />
                    <div className="flex gap-2">
                        <div className="h-7 bg-brand-soft rounded-full w-24" />
                        <div className="h-7 bg-brand-soft rounded-full w-20" />
                        <div className="h-7 bg-brand-soft rounded-full w-20" />
                    </div>
                </div>
                <div className="flex gap-2 ml-4">
                    <div className="h-10 bg-brand-soft rounded-xl w-32" />
                    <div className="h-10 bg-brand-soft rounded-xl w-44" />
                </div>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-4">
                    <div className="aspect-[16/9] bg-brand-soft rounded-2xl" />
                    <div className="flex gap-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-20 h-14 bg-brand-soft rounded-xl flex-shrink-0" />
                        ))}
                    </div>
                    <div className="bg-white border border-brand-border rounded-xl p-6 space-y-3">
                        <div className="h-5 bg-brand-soft rounded w-40" />
                        <div className="h-4 bg-brand-soft rounded w-full" />
                        <div className="h-4 bg-brand-soft rounded w-5/6" />
                        <div className="h-4 bg-brand-soft rounded w-4/6" />
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-white border border-brand-border rounded-xl p-6 space-y-4">
                        <div className="h-5 bg-brand-soft rounded w-28" />
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex justify-between">
                                <div className="h-4 bg-brand-soft rounded w-24" />
                                <div className="h-4 bg-brand-soft rounded w-28" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Gallery Component ────────────────────────────────────────────────────────

interface GalleryProps {
    images: string[];
    title: string;
}

function Gallery({ images, title }: GalleryProps) {
    const [activeIdx, setActiveIdx] = useState(0);
    const [imgError, setImgError] = useState(false);

    const activeUrl = images[activeIdx] ?? null;
    const hasPrev = activeIdx > 0;
    const hasNext = activeIdx < images.length - 1;

    const prev = () => { if (hasPrev) { setActiveIdx(i => i - 1); setImgError(false); } };
    const next = () => { if (hasNext) { setActiveIdx(i => i + 1); setImgError(false); } };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowLeft") prev();
        if (e.key === "ArrowRight") next();
    };

    return (
        <div className="space-y-3">
            {/* Main image */}
            <div
                className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-brand-soft border border-brand-border shadow-sm group"
                tabIndex={0}
                onKeyDown={handleKey}
            >
                {activeUrl && !imgError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        key={activeUrl}
                        src={activeUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-opacity duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-brand-muted">
                        <div className="w-20 h-20 rounded-2xl bg-brand-primary/10 flex items-center justify-center">
                            <Glasses size={36} className="text-brand-primary" />
                        </div>
                        <span className="text-sm font-medium">No preview available</span>
                    </div>
                )}

                {/* Navigation arrows — only show if multiple images */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={prev}
                            disabled={!hasPrev}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all duration-200
                                ${hasPrev ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white cursor-pointer" : "opacity-0 cursor-default"}`}
                        >
                            <ChevronLeft size={18} className="text-brand-text" />
                        </button>
                        <button
                            onClick={next}
                            disabled={!hasNext}
                            className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow-md flex items-center justify-center transition-all duration-200
                                ${hasNext ? "opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-white cursor-pointer" : "opacity-0 cursor-default"}`}
                        >
                            <ChevronRight size={18} className="text-brand-text" />
                        </button>
                    </>
                )}

                {/* Counter pill */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
                        {activeIdx + 1} / {images.length}
                    </div>
                )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
                    {images.slice(0, 6).map((url, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveIdx(i); setImgError(false); }}
                            className={`relative flex-shrink-0 w-[88px] h-[60px] rounded-xl overflow-hidden border-2 transition-all duration-200 cursor-pointer
                                ${activeIdx === i
                                    ? "border-brand-primary ring-2 ring-brand-primary/25 shadow-sm scale-[1.04]"
                                    : "border-brand-border hover:border-brand-primary/50 opacity-70 hover:opacity-100"
                                }`}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={url}
                                alt={`View ${i + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const el = e.currentTarget as HTMLImageElement;
                                    el.style.display = "none";
                                    if (el.parentElement) {
                                        el.parentElement.style.background = "var(--color-brand-soft)";
                                    }
                                }}
                            />
                            {activeIdx === i && (
                                <div className="absolute inset-0 ring-inset ring-2 ring-brand-primary/30 rounded-xl" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ─── Main Client Component ────────────────────────────────────────────────────

interface ScenarioDetailClientProps {
    display: ScenarioDisplayDto;
    metadata: ScenarioMetadataResult | null;
    metadataError: string | null;
    title: string;
    isInstructor: boolean;
}

export default function ScenarioDetailClient({
    display,
    metadata,
    metadataError,
    title,
    isInstructor,
}: ScenarioDetailClientProps) {
    const toast = useToast();
    const [showLaunchModal, setShowLaunchModal] = useState(false);

    // Build gallery: main thumbnail first, then unique additional images
    const galleryImages: string[] = [];
    if (display.thumbnailSasUrl) galleryImages.push(display.thumbnailSasUrl);
    const extraImages = (display.imageAssetSasLinks ?? []).filter(
        (url) => url !== display.thumbnailSasUrl
    );
    galleryImages.push(...extraImages);

    const description = display.description || metadata?.description || null;
    const difficultyLevel = metadata?.difficultyLevel ?? display.difficultyLevel ?? null;
    const duration = formatDuration(metadata?.estimatedDuration ?? display.estimatedDiruation ?? null);
    const status = metadata?.status ?? "Uploaded";
    const diffCls = difficultyClasses(difficultyLevel);

    const handleLaunchVR = () => setShowLaunchModal(true);

    return (
        <div className="pt-12 lg:pt-0">
            {/* Toast notification */}
            {toast.message && (
                <div className="fixed top-6 right-6 z-50 bg-brand-navy text-white px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium flex items-center gap-3 animate-slide-in-right border border-white/10">
                    <div className="w-7 h-7 rounded-lg bg-brand-primary/20 flex items-center justify-center flex-shrink-0">
                        <Glasses size={14} className="text-brand-primary" />
                    </div>
                    {toast.message}
                </div>
            )}

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-brand-muted mb-2 flex-wrap">
                <Link href="/instructor/dashboard" className="hover:text-brand-text transition-colors flex items-center gap-1">
                    <Home size={13} />
                    Home
                </Link>
                <ChevronRight size={13} />
                <Link href="/instructor/vr-scenarios" className="hover:text-brand-text transition-colors">
                    VR Scenarios
                </Link>
                <ChevronRight size={13} />
                <span className="text-brand-text font-medium truncate max-w-[200px]">{title}</span>
            </nav>

            {/* Back link */}
            <Link
                href="/instructor/vr-scenarios"
                className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-hover font-medium mb-6 transition-colors group"
            >
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                Back to Scenarios
            </Link>

            {/* ── Page Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
                <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-[28px] font-bold text-brand-text mb-3 leading-tight">{title}</h1>
                    <div className="flex items-center gap-2 flex-wrap">
                        {difficultyLevel && (
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold ${diffCls.pill}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${diffCls.dot}`} />
                                {difficultyLevel}
                            </span>
                        )}
                        <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusClasses(status)}`}>
                            {status}
                        </span>
                        {duration && (
                            <span className="inline-flex items-center gap-1.5 text-sm text-brand-muted bg-brand-soft border border-brand-border rounded-full px-3 py-1">
                                <Clock size={13} />
                                {duration}
                            </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-brand-soft border border-brand-border text-xs font-semibold text-brand-muted">
                            v{display.version}
                        </span>
                    </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2.5 flex-shrink-0">
                    {isInstructor && (
                        <Link
                            href={`/instructor/vr-scenarios/${display.id}/edit`}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border bg-white text-brand-text text-sm font-medium hover:bg-brand-soft hover:border-brand-primary/30 transition-all shadow-sm"
                        >
                            <Pencil size={14} />
                            Edit Scenario
                        </Link>
                    )}
                    <button
                        onClick={handleLaunchVR}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-primary text-white text-sm font-semibold hover:bg-brand-hover transition-all shadow-sm active:scale-95"
                    >
                        <Zap size={15} className="fill-white" />
                        Launch VR Simulation
                    </button>
                </div>
            </div>

            {/* ── Main Grid ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

                {/* ── Left / Center — 2 cols ── */}
                <div className="xl:col-span-2 space-y-6">

                    {/* Gallery */}
                    <Gallery images={galleryImages} title={title} />

                    {/* Scenario Overview */}
                    {description && (
                        <div className="bg-white border border-brand-border rounded-2xl p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                                    <Tag size={15} className="text-brand-primary" />
                                </div>
                                <h2 className="text-base font-semibold text-brand-text">Scenario Overview</h2>
                            </div>
                            <p className="text-[15px] text-brand-muted leading-[1.75] whitespace-pre-line">
                                {description}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Right — Quick Info ── */}
                <div className="space-y-4 xl:sticky xl:top-6">
                    {metadataError ? (
                        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-sm">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <AlertCircle size={15} />
                                <span className="text-sm font-semibold">Quick Info unavailable</span>
                            </div>
                            <p className="text-xs text-brand-muted leading-relaxed">{metadataError}</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
                            {/* Card header */}
                            <div className="px-6 py-4 border-b border-brand-border bg-brand-soft/50">
                                <div className="flex items-center gap-2">
                                    <Info size={15} className="text-brand-primary" />
                                    <h2 className="text-sm font-semibold text-brand-text">Quick Info</h2>
                                </div>
                            </div>

                            <dl className="divide-y divide-brand-border">
                                {formatDate(metadata?.createdAt) && (
                                    <div className="flex items-center justify-between px-6 py-3.5">
                                        <dt className="text-sm text-brand-muted flex items-center gap-2">
                                            <Calendar size={13} className="text-brand-primary/70" />
                                            Created
                                        </dt>
                                        <dd className="text-sm text-brand-text font-medium">{formatDate(metadata?.createdAt)}</dd>
                                    </div>
                                )}
                                {formatDate(metadata?.updatedAt) && (
                                    <div className="flex items-center justify-between px-6 py-3.5">
                                        <dt className="text-sm text-brand-muted flex items-center gap-2">
                                            <RefreshCw size={13} className="text-brand-primary/70" />
                                            Last Updated
                                        </dt>
                                        <dd className="text-sm text-brand-text font-medium">{formatDate(metadata?.updatedAt)}</dd>
                                    </div>
                                )}
                                <div className="flex items-center justify-between px-6 py-3.5">
                                    <dt className="text-sm text-brand-muted">Version</dt>
                                    <dd className="text-sm text-brand-text font-semibold bg-brand-soft border border-brand-border rounded-full px-2.5 py-0.5">
                                        v{display.version}
                                    </dd>
                                </div>
                                <div className="flex items-center justify-between px-6 py-3.5">
                                    <dt className="text-sm text-brand-muted">Status</dt>
                                    <dd>
                                        <span className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${statusClasses(status)}`}>
                                            {status}
                                        </span>
                                    </dd>
                                </div>
                                {difficultyLevel && (
                                    <div className="flex items-center justify-between px-6 py-3.5">
                                        <dt className="text-sm text-brand-muted">Difficulty</dt>
                                        <dd>
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${diffCls.pill}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${diffCls.dot}`} />
                                                {difficultyLevel}
                                            </span>
                                        </dd>
                                    </div>
                                )}
                                {duration && (
                                    <div className="flex items-center justify-between px-6 py-3.5">
                                        <dt className="text-sm text-brand-muted flex items-center gap-2">
                                            <Clock size={13} className="text-brand-primary/70" />
                                            Duration
                                        </dt>
                                        <dd className="text-sm text-brand-text font-medium">{duration}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    )}

                    {/* CTA card */}
                    <div className="bg-gradient-to-br from-brand-primary to-[#7a000d] rounded-2xl p-5 text-white shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <Shield size={16} className="text-white/80" />
                            <span className="text-sm font-semibold">VR Experience Ready</span>
                        </div>
                        <p className="text-xs text-white/70 leading-relaxed mb-4">
                            Connect your VR headset and launch this scenario directly from the portal.
                        </p>
                        <button
                            onClick={handleLaunchVR}
                            className="w-full bg-white/15 hover:bg-white/25 border border-white/20 text-white text-sm font-semibold py-2.5 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            <Zap size={14} className="fill-white" />
                            Launch Simulation
                        </button>
                    </div>
                </div>
            </div>

            {/* Launch VR Modal */}
            {showLaunchModal && (
                <LaunchVRModal onClose={() => setShowLaunchModal(false)} />
            )}
        </div>
    );
}
