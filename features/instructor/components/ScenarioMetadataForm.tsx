"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Save,
    X,
    Calendar,
    RefreshCw,
    AlertCircle,
    CheckCircle2,
    Clock,
    AlertTriangle
} from "lucide-react";
import {
    ScenarioMetadataResult,
    DifficultyLevel,
    ScenarioStatus,
    ScenarioMetadataDto
} from "../types/scenario";
import { updateScenarioMetadata } from "../services/scenario.service";

// ─── Zod Schema ──────────────────────────────────────────────────────────────
const metadataSchema = z.object({
    description: z.string().nullable().optional(),
    difficultyLevel: z.enum(["Easy", "Medium", "Hard"]).nullable().optional(),
    hours: z.number().min(0).max(23),
    minutes: z.number().min(0).max(59),
    status: z.enum(["Uploaded", "Draft", "Published"])
});

type MetadataFormValues = z.infer<typeof metadataSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseDurationToInputs(raw: string | null): { hours: number; minutes: number } {
    if (!raw) return { hours: 0, minutes: 0 };
    const parts = raw.split(':');
    return {
        hours: parseInt(parts[0] ?? '0', 10),
        minutes: parseInt(parts[1] ?? '0', 10),
    };
}

function formatDurationForApi(hours: number, minutes: number): string {
    const h = String(hours).padStart(2, '0');
    const m = String(minutes).padStart(2, '0');
    return `${h}:${m}:00`;
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

// ─── Component ───────────────────────────────────────────────────────────────

interface ScenarioMetadataFormProps {
    scenarioId: string;
    initialData: ScenarioMetadataResult;
}

export default function ScenarioMetadataForm({ scenarioId, initialData }: ScenarioMetadataFormProps) {
    const router = useRouter();
    const [globalError, setGlobalError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const initialDuration = parseDurationToInputs(initialData.estimatedDuration);

    const {
        register,
        handleSubmit,
        control,
        formState: { errors, isDirty, isSubmitting },
        reset
    } = useForm<MetadataFormValues>({
        resolver: zodResolver(metadataSchema),
        defaultValues: {
            description: initialData.description ?? "",
            difficultyLevel: (initialData.difficultyLevel as DifficultyLevel) ?? null,
            hours: initialDuration.hours,
            minutes: initialDuration.minutes,
            status: initialData.status,
        }
    });

    // Warn on reload/close if dirty
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => window.removeEventListener("beforeunload", handleBeforeUnload);
    }, [isDirty]);

    const onSubmit = async (data: MetadataFormValues) => {
        setGlobalError(null);
        setSuccessMsg(null);

        const body: ScenarioMetadataDto = {
            description: data.description || null,
            difficultyLevel: data.difficultyLevel || null,
            estimatedDuration:
                data.hours === 0 && data.minutes === 0
                    ? null
                    : formatDurationForApi(data.hours, data.minutes),
            status: data.status,
        };

        try {
            const updated = await updateScenarioMetadata(scenarioId, body);
            
            // Reset form with new data to clear isDirty state
            const newDuration = parseDurationToInputs(updated.estimatedDuration);
            reset({
                description: updated.description ?? "",
                difficultyLevel: (updated.difficultyLevel as DifficultyLevel) ?? null,
                hours: newDuration.hours,
                minutes: newDuration.minutes,
                status: updated.status,
            });

            setSuccessMsg("Metadata updated successfully");
            
            // Clear success message after a few seconds
            setTimeout(() => {
                setSuccessMsg(null);
            }, 3000);

            // Navigate back to details page after brief delay
            setTimeout(() => {
                router.push(`/instructor/vr-scenarios/${scenarioId}`);
                router.refresh(); // Ensure the detail page has the latest data
            }, 1000);
            
        } catch (err: any) {
            setGlobalError(err.message || "An unexpected error occurred while saving.");
        }
    };

    const handleCancel = () => {
        if (isDirty) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
                return;
            }
        }
        router.push(`/instructor/vr-scenarios/${scenarioId}`);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {globalError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-fade-in">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-red-800">Error Saving Metadata</h4>
                        <p className="text-sm text-red-600 mt-1">{globalError}</p>
                    </div>
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 animate-fade-in">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* ── Left Column: Form Fields ── */}
                <div className="lg:col-span-2 space-y-6 bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
                    
                    {/* Description */}
                    <div className="space-y-2">
                        <label htmlFor="description" className="block text-sm font-semibold text-brand-text">
                            Description
                        </label>
                        <p className="text-xs text-brand-muted mb-2">
                            Describe what learners will experience in this VR scenario.
                        </p>
                        <textarea
                            id="description"
                            rows={5}
                            placeholder="Enter description..."
                            className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors"
                            {...register("description")}
                        />
                        {errors.description && (
                            <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>
                        )}
                    </div>

                    <hr className="border-brand-border" />

                    {/* Difficulty Level */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-brand-text">
                            Difficulty Level
                        </label>
                        <Controller
                            name="difficultyLevel"
                            control={control}
                            render={({ field }) => (
                                <div className="grid grid-cols-3 gap-3">
                                    {(["Easy", "Medium", "Hard"] as const).map((level) => {
                                        const isSelected = field.value === level;
                                        let bgClass = "bg-white hover:bg-brand-soft";
                                        let textClass = "text-brand-muted";
                                        let borderClass = "border-brand-border";
                                        let dotClass = "bg-transparent";

                                        if (isSelected) {
                                            if (level === "Easy") { bgClass = "bg-green-50"; textClass = "text-green-800"; borderClass = "border-green-300 ring-1 ring-green-300"; dotClass = "bg-green-500"; }
                                            else if (level === "Medium") { bgClass = "bg-amber-50"; textClass = "text-amber-800"; borderClass = "border-amber-300 ring-1 ring-amber-300"; dotClass = "bg-amber-500"; }
                                            else if (level === "Hard") { bgClass = "bg-red-50"; textClass = "text-red-800"; borderClass = "border-red-300 ring-1 ring-red-300"; dotClass = "bg-red-500"; }
                                        }

                                        return (
                                            <button
                                                type="button"
                                                key={level}
                                                onClick={() => field.onChange(level)}
                                                className={`relative flex items-center justify-center gap-2 py-3 px-4 rounded-xl border transition-all duration-200 cursor-pointer ${bgClass} ${textClass} ${borderClass}`}
                                            >
                                                <span className={`w-2 h-2 rounded-full transition-colors ${dotClass}`} />
                                                <span className="text-sm font-medium">{level}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                        {errors.difficultyLevel && (
                            <p className="text-xs text-red-500 mt-1">{errors.difficultyLevel.message}</p>
                        )}
                    </div>

                    <hr className="border-brand-border" />

                    {/* Estimated Duration */}
                    <div className="space-y-3">
                        <label className="block text-sm font-semibold text-brand-text">
                            Estimated Duration
                        </label>
                        <p className="text-xs text-brand-muted mb-2">
                            How long should it take to complete this scenario?
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <label htmlFor="hours" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-muted font-medium">Hours</label>
                                <input
                                    id="hours"
                                    type="number"
                                    min="0"
                                    max="23"
                                    className="w-full pl-16 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors"
                                    {...register("hours", { valueAsNumber: true })}
                                />
                            </div>
                            <div className="text-brand-muted font-medium">:</div>
                            <div className="relative flex-1">
                                <label htmlFor="minutes" className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-brand-muted font-medium">Mins</label>
                                <input
                                    id="minutes"
                                    type="number"
                                    min="0"
                                    max="59"
                                    className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors"
                                    {...register("minutes", { valueAsNumber: true })}
                                />
                            </div>
                        </div>
                        {(errors.hours || errors.minutes) && (
                            <p className="text-xs text-red-500 mt-1">Please enter a valid duration (Hours 0-23, Minutes 0-59).</p>
                        )}
                        {errors.root && <p className="text-xs text-red-500 mt-1">{errors.root.message}</p>}
                    </div>

                    <hr className="border-brand-border" />

                    {/* Status */}
                    <div className="space-y-3">
                        <label htmlFor="status" className="block text-sm font-semibold text-brand-text">
                            Publication Status
                        </label>
                        <select
                            id="status"
                            className="w-full rounded-xl border border-brand-border bg-white px-4 py-3 text-sm focus:border-brand-primary focus:ring-1 focus:ring-brand-primary focus:outline-none transition-colors"
                            {...register("status")}
                        >
                            <option value="Uploaded">Uploaded — Raw file, not yet reviewed</option>
                            <option value="Draft">Draft — Work in progress, hidden from learners</option>
                            <option value="Published">Published — Live and visible to learners</option>
                        </select>
                        {errors.status && (
                            <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>
                        )}
                    </div>
                </div>

                {/* ── Right Column: Info & Actions ── */}
                <div className="space-y-6">
                    
                    {/* Read-Only Info */}
                    <div className="bg-white border border-brand-border rounded-2xl shadow-sm overflow-hidden">
                         <div className="px-6 py-4 border-b border-brand-border bg-brand-soft/50">
                            <h3 className="text-sm font-semibold text-brand-text flex items-center gap-2">
                                <Clock size={15} className="text-brand-primary" />
                                Record Info
                            </h3>
                        </div>
                        <dl className="divide-y divide-brand-border">
                            <div className="flex flex-col px-6 py-3.5 gap-1">
                                <dt className="text-xs font-medium text-brand-muted flex items-center gap-1.5">
                                    <Calendar size={13} className="text-brand-primary/70" />
                                    Created
                                </dt>
                                <dd className="text-sm text-brand-text">{formatDate(initialData.createdAt)}</dd>
                            </div>
                            <div className="flex flex-col px-6 py-3.5 gap-1">
                                <dt className="text-xs font-medium text-brand-muted flex items-center gap-1.5">
                                    <RefreshCw size={13} className="text-brand-primary/70" />
                                    Last Updated
                                </dt>
                                <dd className="text-sm text-brand-text">{formatDate(initialData.updatedAt)}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Actions */}
                    <div className="bg-brand-soft border border-brand-border rounded-2xl p-5 shadow-sm space-y-3">
                        <button
                            type="submit"
                            disabled={!isDirty || isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-brand-primary text-white py-3 rounded-xl font-semibold hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={18} />
                                    Save Changes
                                </>
                            )}
                        </button>
                        
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-white text-brand-text border border-brand-border py-3 rounded-xl font-semibold hover:bg-brand-soft active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
                        >
                            <X size={18} className="text-brand-muted" />
                            Cancel
                        </button>

                        {isDirty && (
                            <p className="text-xs text-amber-600 flex items-start gap-1.5 pt-2">
                                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                                You have unsaved changes.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </form>
    );
}
