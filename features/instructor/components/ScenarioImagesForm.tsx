"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
    Image as ImageIcon,
    UploadCloud,
    X,
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react";
import { ScenarioImagesUpdateResult } from "../types/scenario";

interface ScenarioImagesFormProps {
    scenarioId: string;
    currentImages: string[];
}

export default function ScenarioImagesForm({ scenarioId, currentImages }: ScenarioImagesFormProps) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const files = Array.from(e.target.files);
        
        // Filter valid images (just in case)
        const validFiles = files.filter(f => f.type.startsWith("image/"));
        if (validFiles.length !== files.length) {
            setError("Some files were skipped because they are not valid images.");
        } else {
            setError(null);
        }

        setSelectedFiles(validFiles);
        
        // Create local preview URLs
        const newPreviews = validFiles.map(f => URL.createObjectURL(f));
        setPreviews(newPreviews);
    };

    const clearSelection = () => {
        setSelectedFiles([]);
        setPreviews([]);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleUpload = async () => {
        if (selectedFiles.length === 0) return;

        setIsSubmitting(true);
        setError(null);
        setSuccessMsg(null);

        try {
            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append("Images", file);
            });

            const result = await api<ScenarioImagesUpdateResult>(`/api/scenario/UpdateImages/${scenarioId}`, {
                method: "PUT",
                body: formData,
            });

            setSuccessMsg("Gallery images updated successfully.");
            
            // Clean up previews
            previews.forEach(p => URL.revokeObjectURL(p));
            setSelectedFiles([]);
            setPreviews([]);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            // Refresh the page data
            setTimeout(() => {
                setSuccessMsg(null);
                router.refresh();
            }, 2500);

        } catch (err: any) {
            setError(err.message || "Failed to upload images.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClearGallery = async () => {
        if (!window.confirm("Are you sure you want to delete ALL gallery images? This cannot be undone.")) {
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccessMsg(null);

        try {
            // Sending an empty FormData means Images = null/empty, which clears the gallery
            const formData = new FormData();
            
            await api(`/api/scenario/UpdateImages/${scenarioId}`, {
                method: "PUT",
                body: formData,
            });

            setSuccessMsg("Gallery cleared successfully.");
            
            setTimeout(() => {
                setSuccessMsg(null);
                router.refresh();
            }, 2000);

        } catch (err: any) {
            setError(err.message || "Failed to clear gallery.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white border border-brand-border rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <ImageIcon size={18} className="text-brand-primary" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Image Gallery</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Manage additional preview images for this scenario</p>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6 animate-fade-in">
                    <AlertCircle size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-semibold text-red-800">Error</h4>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
            )}

            {successMsg && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3 mb-6 animate-fade-in">
                    <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
                    <p className="text-sm font-semibold text-emerald-800">{successMsg}</p>
                </div>
            )}

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3 mb-8">
                <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800 leading-relaxed">
                    Uploading new images will <strong>replace</strong> your entire existing gallery. 
                    If you want to keep any current images, you must upload them again alongside your new images.
                </p>
            </div>

            {/* Current Images Section */}
            {currentImages.length > 0 && selectedFiles.length === 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-brand-text">Current Gallery ({currentImages.length})</h3>
                        <button
                            type="button"
                            onClick={handleClearGallery}
                            disabled={isSubmitting}
                            className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline disabled:opacity-50"
                        >
                            Delete All Images
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {currentImages.map((url, i) => (
                            <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border border-brand-border bg-brand-soft">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={url} alt={`Gallery image ${i + 1}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload Area */}
            <div className="space-y-4">
                <h3 className="text-sm font-semibold text-brand-text">
                    {selectedFiles.length > 0 ? "Selected Files for New Gallery" : "Select Images to Upload"}
                </h3>
                
                {selectedFiles.length > 0 ? (
                    <div className="space-y-6 border border-brand-border rounded-xl p-5 bg-brand-soft/30">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                            {previews.map((preview, i) => (
                                <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden border-2 border-brand-primary/50 relative group">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={preview} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-md backdrop-blur-sm">
                                            {selectedFiles[i].name}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-hover active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
                            >
                                {isSubmitting ? (
                                    <>
                                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Uploading...
                                    </>
                                ) : (
                                    <>
                                        <UploadCloud size={16} />
                                        Upload Gallery
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={clearSelection}
                                disabled={isSubmitting}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-brand-text border border-brand-border px-6 py-2.5 rounded-xl font-semibold hover:bg-brand-soft active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm cursor-pointer"
                            >
                                <X size={16} className="text-brand-muted" />
                                Cancel Selection
                            </button>
                        </div>
                    </div>
                ) : (
                    <div 
                        className="border-2 border-dashed border-brand-border hover:border-brand-primary/50 bg-brand-soft/50 hover:bg-brand-soft rounded-2xl p-8 transition-colors text-center cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mx-auto mb-4 border border-brand-border">
                            <UploadCloud size={20} className="text-brand-primary" />
                        </div>
                        <p className="text-sm font-semibold text-brand-text mb-1">Click to select images</p>
                        <p className="text-xs text-brand-muted">JPEG, PNG up to 5MB each. Multiple selection allowed.</p>
                        
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/jpeg, image/png, image/jpg"
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
