"use client";

import { useState, useEffect } from "react";
import { X, AlertCircle } from "lucide-react";
import { videoApi } from "../lib/video-api";
import VideoPlayer from "@/app/components/video-player";

interface VideoPreviewModalProps {
  videoId: string;
  title: string;
  onClose: () => void;
}

export default function VideoPreviewModal({
  videoId,
  title,
  onClose,
}: VideoPreviewModalProps) {
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadStream() {
      try {
        setLoading(true);
        setError(null);
        const res = await videoApi.getVideoStreamUrl(videoId);
        if (!mounted) return;

        const url = res.streamUrl;
        if (!url) {
          throw new Error("No stream URL returned from server");
        }
        setStreamUrl(url);
      } catch (err: unknown) {
        console.error("[Video Modal Error]", err);
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load video stream"
          );
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadStream();

    return () => {
      mounted = false;
    };
  }, [videoId]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#13151B] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-brand-border">
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-brand-border">
          <h2 className="text-lg font-medium text-white truncate pr-4">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-brand-muted hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 bg-black aspect-video relative flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 z-10">
              <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-500 rounded-full animate-spin" />
              <p className="text-sm text-brand-muted">Loading video stream...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center gap-2 text-red-400 p-6">
              <AlertCircle size={32} />
              <p className="text-sm text-center">{error}</p>
            </div>
          )}

          {streamUrl && !loading && !error && (
            <VideoPlayer src={streamUrl} className="w-full h-full" />
          )}
        </div>
      </div>
    </div>
  );
}
