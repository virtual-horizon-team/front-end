"use client";

import { useState, useRef } from "react";
import { Upload, X, Film, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { videoApi } from "../lib/video-api";
import { documentApi } from "../lib/document-api";

interface UploadMediaModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const ALLOWED_DOC_EXTS = [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".ppt", ".pptx"];

export default function UploadMediaModal({ onClose, onSuccess }: UploadMediaModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const isVideo = (f: File) => f.type.startsWith("video/");
    const isDocument = (f: File) => {
        const name = f.name.toLowerCase();
        return ALLOWED_DOC_EXTS.some(ext => name.endsWith(ext));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processSelectedFile(selectedFile);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processSelectedFile(droppedFile);
        }
    };

    const processSelectedFile = (selectedFile: File) => {
        if (isVideo(selectedFile) || isDocument(selectedFile)) {
            setFile(selectedFile);
            if (!title) {
                const fileName = selectedFile.name.split('.').slice(0, -1).join('.');
                setTitle(fileName);
            }
            setError(null);
        } else {
            setError(`Please upload a valid video or document file. Allowed document types: ${ALLOWED_DOC_EXTS.join(", ")}`);
        }
    };

    const handleUpload = async () => {
        if (!file || !title) return;

        setIsUploading(true);
        setError(null);
        setProgress(0);

        try {
            if (isVideo(file)) {
                // Video Upload Flow
                let durationInSeconds = 0;
                try {
                    durationInSeconds = await new Promise<number>((resolve, reject) => {
                        const videoElement = document.createElement('video');
                        videoElement.preload = 'metadata';
                        videoElement.onloadedmetadata = () => {
                            window.URL.revokeObjectURL(videoElement.src);
                            resolve(Math.round(videoElement.duration));
                        };
                        videoElement.onerror = () => {
                            window.URL.revokeObjectURL(videoElement.src);
                            resolve(0);
                        };
                        videoElement.src = URL.createObjectURL(file);
                    });
                } catch (err) {
                    console.warn("Could not extract video duration, defaulting to 0", err);
                }

                setProgress(5);
                const createRes = await videoApi.createVideo({
                    title,
                    description,
                    fileSizeBytes: file.size,
                    mimeType: file.type,
                    durationInSeconds,
                });

                const videoId = createRes.videoId;
                if (!videoId) {
                    throw new Error(`Failed to get video ID. Server returned: ${JSON.stringify(createRes)}`);
                }

                setProgress(10);
                const initiateRes = await videoApi.initiateUpload(videoId);

                const uploadUrl = initiateRes.uploadUrl;
                if (!uploadUrl) {
                    throw new Error(`No upload URL returned. Server returned: ${JSON.stringify(initiateRes)}`);
                }

                await videoApi.uploadFile(uploadUrl, file, (uploadProgress: number) => {
                    const percent = 10 + (uploadProgress * 80);
                    setProgress(Math.round(percent));
                });

                setProgress(95);
                await videoApi.completeUpload(videoId, { actualFileSize: file.size });
            } else if (isDocument(file)) {
                // Document Upload Flow
                await documentApi.uploadDocument(title, file, (uploadProgress: number) => {
                    setProgress(Math.round(uploadProgress * 100));
                });
            }

            setProgress(100);
            setTimeout(() => {
                onSuccess();
            }, 600);

        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err.message || "An error occurred during upload");
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
                    <h2 className="text-xl font-bold text-brand-text">Upload Media Material</h2>
                    <button 
                        onClick={onClose} 
                        disabled={isUploading}
                        className="p-2 text-brand-muted hover:text-brand-text hover:bg-brand-soft rounded-xl transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100">
                            <AlertCircle size={18} className="mt-0.5 flex-shrink-0" />
                            <p>{error}</p>
                        </div>
                    )}

                    {!file ? (
                        <div 
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-brand-border rounded-xl p-8 text-center bg-brand-bg/50 hover:bg-brand-soft hover:border-teal-300 transition-all cursor-pointer group"
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileSelect} 
                                accept={`video/*,${ALLOWED_DOC_EXTS.join(",")}`} 
                                className="hidden" 
                            />
                            <div className="mx-auto w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Upload size={24} className="text-brand-primary" />
                            </div>
                            <h3 className="text-brand-text font-semibold mb-1 text-base">Select a video or document to upload</h3>
                            <p className="text-sm text-brand-muted mb-4">or drag and drop it here</p>
                            <p className="text-xs text-brand-muted">Supported formats: MP4, WebM, {ALLOWED_DOC_EXTS.join(", ")}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-xl border border-teal-100 bg-brand-soft">
                                <div className="w-12 h-12 rounded-lg bg-teal-100 flex items-center justify-center text-brand-primary flex-shrink-0">
                                    {isVideo(file) ? <Film size={24} /> : <FileText size={24} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-brand-text truncate">{file.name}</p>
                                    <p className="text-xs text-brand-muted">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                                </div>
                                {!isUploading && (
                                    <button 
                                        onClick={() => setFile(null)} 
                                        className="p-2 text-brand-muted hover:text-red-500 transition-colors"
                                    >
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-brand-text mb-1.5">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={isUploading}
                                        className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 disabled:bg-brand-bg transition-all bg-white"
                                        placeholder="Enter a descriptive title"
                                    />
                                </div>
                                {isVideo(file) && (
                                    <div>
                                        <label className="block text-sm font-medium text-brand-text mb-1.5">
                                            Description (Optional)
                                        </label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            disabled={isUploading}
                                            rows={3}
                                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-300 disabled:bg-brand-bg transition-all bg-white resize-none"
                                            placeholder="Briefly describe what this video covers"
                                        />
                                    </div>
                                )}
                            </div>
                            
                            {isUploading && (
                                <div className="pt-2 animate-in slide-in-from-bottom-2">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="font-medium text-brand-text">Uploading...</span>
                                        <span className="text-brand-primary font-semibold">{progress}%</span>
                                    </div>
                                    <div className="w-full bg-brand-soft rounded-full h-2.5 overflow-hidden">
                                        <div 
                                            className="bg-gradient-to-r from-teal-600 to-[#115E59] h-2.5 rounded-full transition-all duration-300 ease-out" 
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                    {progress === 100 && (
                                        <p className="text-xs text-green-600 mt-2 flex items-center justify-center gap-1 font-medium">
                                            <CheckCircle2 size={14} /> Upload completed successfully!
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="px-6 py-4 border-t border-brand-border bg-brand-bg/50 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        disabled={isUploading}
                        className="px-5 py-2.5 rounded-xl text-sm font-medium text-brand-text hover:bg-brand-border transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleUpload}
                        disabled={!file || !title || isUploading}
                        className="flex items-center justify-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 transition-all shadow-lg shadow-teal-500/20 disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
                    >
                        {isUploading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Upload size={16} /> Upload Media
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
