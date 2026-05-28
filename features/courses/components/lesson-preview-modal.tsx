"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle, Loader2, PlayCircle, FileText, ExternalLink } from "lucide-react";
import { getLessonPreview, LessonPreviewDto } from "../lib/public-courses-api";
import VideoPlayer from "@/app/components/video-player";

export interface PreviewLessonItem {
  id: string;
  title: string;
  resourceType: string;
}

interface LessonPreviewModalProps {
  lessonId: string;
  lessonTitle: string;
  resourceType: string;
  courseTitle: string;
  previewableLessons?: PreviewLessonItem[];
  onSelectLesson?: (lesson: PreviewLessonItem) => void;
  onClose: () => void;
}

export default function LessonPreviewModal({
  lessonId,
  lessonTitle,
  resourceType,
  courseTitle,
  previewableLessons,
  onSelectLesson,
  onClose,
}: LessonPreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<LessonPreviewDto | null>(null);
  
  // Document preview content type
  const [docContentType, setDocContentType] = useState<string>("application/pdf");
  const [docLoading, setDocLoading] = useState(false);

  // Fetch preview link when mounted
  useEffect(() => {
    let active = true;

    async function fetchPreview() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch preview info from public endpoint
        const data = await getLessonPreview(lessonId, resourceType);
        
        if (!active) return;
        setPreviewData(data);
        
        // Handle document resource type to auto-detect mime type
        if (data.resourceType === "Document" && data.downloadUrl) {
          setDocLoading(true);
          try {
            // Attempt to head-request the URL to detect its Content-Type
            const res = await fetch(data.downloadUrl, { method: "HEAD" });
            const contentType = res.headers.get("content-type");
            if (active && contentType) {
              setDocContentType(contentType);
            }
          } catch (headErr) {
            console.warn("Could not determine document mimeType via HEAD request:", headErr);
            // Fallback: check file extension in URL
            const urlPath = data.downloadUrl.split("?")[0].toLowerCase();
            if (urlPath.endsWith(".png") || urlPath.endsWith(".jpg") || urlPath.endsWith(".jpeg") || urlPath.endsWith(".gif") || urlPath.endsWith(".webp")) {
              setDocContentType("image/png");
            } else if (urlPath.endsWith(".docx") || urlPath.endsWith(".doc")) {
              setDocContentType("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
            } else if (urlPath.endsWith(".xlsx") || urlPath.endsWith(".xls")) {
              setDocContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            } else if (urlPath.endsWith(".pptx") || urlPath.endsWith(".ppt")) {
              setDocContentType("application/vnd.openxmlformats-officedocument.presentationml.presentation");
            } else {
              setDocContentType("application/pdf");
            }
          } finally {
            if (active) setDocLoading(false);
          }
        }
      } catch (err: unknown) {
        console.error("Failed to load lesson preview:", err);
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load lesson preview data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchPreview();

    return () => {
      active = false;
    };
  }, [lessonId, resourceType]);

  // Determine doc type categories
  const isPdf = docContentType.includes("pdf");
  const isImage = docContentType.startsWith("image/");
  const isOffice =
    docContentType.includes("word") ||
    docContentType.includes("officedocument") ||
    docContentType.includes("excel") ||
    docContentType.includes("powerpoint") ||
    docContentType.includes("ms-");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0f1115] text-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[85vh] border border-white/10 relative animate-in scale-in duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-[#161a22]">
          <div className="min-w-0 pr-4">
            <span className="text-[10px] text-brand-primary bg-brand-peach/10 border border-brand-primary/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider inline-block mb-1.5">
              Course Preview
            </span>
            <h2 className="text-xl font-bold text-white truncate">
              {courseTitle}
            </h2>
            <p className="text-sm text-slate-400 truncate mt-0.5">
              Now playing: <span className="font-medium text-slate-200">{lessonTitle}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Close Preview"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body / Viewer & Playlist */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Main Viewer Area */}
          <div className="flex-1 bg-black/60 relative flex items-center justify-center overflow-hidden">
          
          {/* Main Loading State */}
          {loading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-brand-primary animate-spin" />
              <p className="text-sm text-slate-400">Fetching preview links securely...</p>
            </div>
          )}

          {/* Document Content Loading State */}
          {!loading && docLoading && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 size={36} className="text-brand-primary animate-spin" />
              <p className="text-sm text-slate-400">Analyzing document file format...</p>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="flex flex-col items-center gap-4 text-center max-w-md p-6 bg-[#161a22] border border-white/10 rounded-xl m-4">
              <div className="p-3 bg-red-500/10 text-red-500 rounded-full">
                <AlertCircle size={32} />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1.5">Failed to load preview</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {error}. Please try again later or verify that the preview is still available.
                </p>
              </div>
              <button
                onClick={onClose}
                className="bg-white/10 hover:bg-white/20 px-5 py-2 rounded-lg text-xs font-semibold transition-all"
              >
                Close
              </button>
            </div>
          )}

          {/* Actual Viewers */}
          {previewData && !error && !loading && (
            <div className="w-full h-full flex items-center justify-center">
              
              {/* VIDEO VIEWER */}
              {previewData.resourceType === "Video" && (
                <VideoPlayer
                  src={previewData.streamUrl || previewData.downloadUrl || ""}
                  className="w-full h-full"
                />
              )}

              {/* DOCUMENT VIEWER */}
              {previewData.resourceType === "Document" && !docLoading && (
                <div className="w-full h-full p-4 flex items-center justify-center bg-slate-950/20">
                  {isPdf ? (
                    /* PDF inside secure iframe */
                    <iframe
                      src={`${previewData.downloadUrl}#toolbar=0`}
                      className="w-full h-full rounded-xl border border-white/5 bg-white"
                      title="PDF Preview"
                    />
                  ) : isImage ? (
                    /* Direct image render */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewData.downloadUrl}
                      alt="Document Preview"
                      className="max-w-full max-h-full object-contain rounded-xl shadow-2xl bg-white/5"
                    />
                  ) : isOffice ? (
                    /* Render MS Office Files via Live Embed (View only) */
                    <iframe
                      src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                        previewData.downloadUrl
                      )}`}
                      className="w-full h-full rounded-xl border border-white/5 bg-white"
                      title="Office Document Preview"
                    />
                  ) : (
                    /* Unsupported format fallback, offers Google Docs viewer as alternate try */
                    <div className="text-center p-8 bg-[#161a22] border border-white/10 rounded-2xl max-w-sm">
                      <FileText className="w-14 h-14 text-brand-primary/45 mx-auto mb-4" />
                      <h4 className="text-sm font-bold text-white mb-2">Unsupported Document Format</h4>
                      <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                        This file format ({docContentType || "unknown"}) cannot be previewed natively. 
                        We can try viewing it through a third-party document renderer.
                      </p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => {
                            // Try Google Docs Viewer iframe
                            setDocContentType("application/pdf"); // Cheat to load in google docs viewer or fallback
                            const frame = document.createElement("iframe");
                            frame.src = `https://docs.google.com/gview?url=${encodeURIComponent(
                              previewData.downloadUrl
                            )}&embedded=true`;
                            frame.className = "w-full h-full rounded-xl border border-white/5 bg-white absolute inset-0 p-4";
                            const container = document.getElementById("custom-doc-viewer-container");
                            if (container) {
                              container.innerHTML = "";
                              container.appendChild(frame);
                            }
                          }}
                          className="bg-brand-primary text-white hover:bg-brand-hover px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          Try Google Viewer <ExternalLink size={12} />
                        </button>
                        <button
                          onClick={onClose}
                          className="border border-white/10 text-slate-300 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                        >
                          Close Preview
                        </button>
                      </div>
                    </div>
                  )}
                  {/* Container for dynamic viewer replacement */}
                  <div id="custom-doc-viewer-container" className="contents" />
                </div>
              )}

              {/* OTHER VIEWER FALLBACKS */}
              {previewData.resourceType !== "Video" && previewData.resourceType !== "Document" && (
                <div className="text-center p-8 bg-[#161a22] border border-white/10 rounded-2xl max-w-sm m-4">
                  <PlayCircle className="w-14 h-14 text-brand-primary/45 mx-auto mb-4" />
                  <h4 className="text-sm font-bold text-white mb-2">Preview Unavailable</h4>
                  <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                    Previews are only supported for videos and document lessons.
                  </p>
                  <button
                    onClick={onClose}
                    className="bg-brand-primary text-white hover:bg-brand-hover px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    Close Preview
                  </button>
                </div>
              )}
            </div>
          )}

          </div>

          {/* Playlist Sidebar */}
          {previewableLessons && previewableLessons.length > 0 && (
            <div className="w-80 bg-[#161a22] border-l border-white/10 flex flex-col h-full overflow-hidden shrink-0">
               <div className="p-4 border-b border-white/10 bg-[#0f1115]">
                 <h4 className="font-semibold text-sm">Course Previews</h4>
                 <p className="text-xs text-slate-400 mt-1">{previewableLessons.length} lessons available</p>
               </div>
               <div className="flex-1 overflow-y-auto">
                 {previewableLessons.map((lesson, idx) => (
                    <button 
                       key={lesson.id}
                       onClick={() => onSelectLesson?.(lesson)}
                       className={`w-full text-left p-4 border-b border-white/5 transition-colors flex gap-3 ${lesson.id === lessonId ? "bg-white/10 border-l-4 border-brand-primary" : "hover:bg-white/5 border-l-4 border-transparent"}`}
                    >
                       <span className="text-brand-primary/80 mt-0.5 shrink-0">
                         {lesson.resourceType === "Video" ? <PlayCircle size={16} /> : <FileText size={16} />}
                       </span>
                       <div>
                          <p className={`text-sm ${lesson.id === lessonId ? "font-semibold text-white" : "text-slate-300"}`}>{idx + 1}. {lesson.title}</p>
                          <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">{lesson.resourceType}</p>
                       </div>
                    </button>
                 ))}
               </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
