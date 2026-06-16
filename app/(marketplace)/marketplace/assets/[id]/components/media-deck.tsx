"use client";

import React, { useState } from "react";
import { Box, Play, Download, Loader2 } from "lucide-react";

interface AssetMediaDto {
  assetMediaId: string;
  blobId: string;
  mediaType: number;
  sortOrder: number;
  contentType: string | null;
  sasUrl: string | null;
}

interface MediaDeckProps {
  thumbnailUrl: string | null;
  detailImages?: AssetMediaDto[];
  video?: AssetMediaDto | null;
  fileName: string;
}

export default function MediaDeck({ thumbnailUrl, detailImages = [], video, fileName }: MediaDeckProps) {
  const [activeMedia, setActiveMedia] = useState<string | number>(0);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const triggerDownload = async (url: string, defaultName: string) => {
    setDownloading(url);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Network response was not ok");
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      // Fallback
      window.open(url, "_blank");
    } finally {
      setDownloading(null);
    }
  };

  const getActiveDownloadInfo = () => {
    if (activeMedia === "video" && video?.sasUrl) {
      return { url: video.sasUrl, name: `${fileName}_demo.mp4` };
    }
    if (activeMedia === 0 && thumbnailUrl) {
      return { url: thumbnailUrl, name: `${fileName}_thumbnail.png` };
    }
    if (typeof activeMedia === "number" && activeMedia > 0) {
      const img = detailImages[activeMedia - 1];
      if (img?.sasUrl) {
        return { url: img.sasUrl, name: `${fileName}_detail_${activeMedia}.png` };
      }
    }
    return null;
  };

  const activeDownload = getActiveDownloadInfo();

  return (
    <div className="space-y-4">
      {/* Viewport Box */}
      <div className="aspect-video bg-[#030712] rounded-2xl border border-marketplace-border overflow-hidden relative flex items-center justify-center group">
        {activeMedia === "video" && video?.sasUrl ? (
          <video
            src={video.sasUrl}
            controls
            className="w-full h-full object-contain"
            poster={thumbnailUrl || undefined}
          />
        ) : (
          (() => {
            const activeUrl = activeMedia === 0 ? thumbnailUrl : detailImages[Number(activeMedia) - 1]?.sasUrl;
            if (activeUrl) {
              return (
                <img
                  src={activeUrl}
                  alt={fileName}
                  className="w-full h-full object-contain cursor-zoom-in hover:brightness-105 transition-all duration-200"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Click to view full screen"
                />
              );
            }
            return (
              <div className="flex flex-col items-center gap-3 text-slate-500">
                <Box className="w-12 h-12 text-slate-700" />
                <span className="text-xs font-bold">No Preview Available</span>
              </div>
            );
          })()
        )}

        {/* Viewport Overlay Download Button */}
        {activeDownload && (
          <button
            onClick={() => triggerDownload(activeDownload.url, activeDownload.name)}
            disabled={downloading !== null}
            className="absolute top-4 right-4 bg-slate-950/80 border border-marketplace-border text-slate-300 p-2.5 rounded-xl cursor-pointer hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            title="Download original file"
          >
            {downloading === activeDownload.url ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            Download Full Resolution
          </button>
        )}
      </div>

      {/* Thumbnails Tray */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-marketplace-border">
        {/* Main Thumbnail option */}
        <button
          type="button"
          onClick={() => setActiveMedia(0)}
          className={`w-24 aspect-video rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
            activeMedia === 0 ? "border-marketplace-primary" : "border-marketplace-border"
          }`}
        >
          {thumbnailUrl ? (
            <img src={thumbnailUrl} className="w-full h-full object-cover" alt="Main Thumb" />
          ) : (
            <div className="w-full h-full bg-[#121826] flex items-center justify-center">
              <Box className="w-6 h-6 text-slate-600" />
            </div>
          )}
        </button>

        {/* Detail images option */}
        {detailImages.map((img, idx) => (
          <button
            key={img.assetMediaId}
            type="button"
            onClick={() => setActiveMedia(idx + 1)}
            className={`w-24 aspect-video rounded-lg overflow-hidden shrink-0 border-2 cursor-pointer ${
              activeMedia === idx + 1 ? "border-marketplace-primary" : "border-marketplace-border"
            }`}
          >
            {img.sasUrl && (
              <img src={img.sasUrl} className="w-full h-full object-cover" alt={`Detail ${idx}`} />
            )}
          </button>
        ))}

        {/* Video option */}
        {video?.sasUrl && (
          <button
            type="button"
            onClick={() => setActiveMedia("video")}
            className={`w-24 aspect-video rounded-lg bg-[#121826] shrink-0 border-2 relative flex items-center justify-center overflow-hidden cursor-pointer ${
              activeMedia === "video" ? "border-marketplace-primary" : "border-marketplace-border"
            }`}
          >
            {thumbnailUrl && (
              <img src={thumbnailUrl} className="w-full h-full object-cover opacity-30" alt="Video Thumb" />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <Play className="w-6 h-6 text-marketplace-primary fill-marketplace-primary" />
            </div>
          </button>
        )}
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4 cursor-zoom-out select-none animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close Button */}
          <button 
            className="absolute top-6 right-6 text-slate-400 hover:text-white p-2.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
            onClick={() => setIsLightboxOpen(false)}
          >
            <span className="sr-only">Close</span>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <img
            src={activeMedia === 0 ? (thumbnailUrl || "") : (detailImages[Number(activeMedia) - 1]?.sasUrl || "")}
            alt={fileName}
            className="max-w-full max-h-[92vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  );
}
