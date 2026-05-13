"use client";

import { useState, useEffect, useRef } from "react";
import { X, AlertCircle } from "lucide-react";
import { videoApi } from "../lib/video-api";
import Hls from "hls.js";

interface VideoPreviewModalProps {
    videoId: string;
    title: string;
    onClose: () => void;
}

export default function VideoPreviewModal({ videoId, title, onClose }: VideoPreviewModalProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [levels, setLevels] = useState<any[]>([]);
    const [currentLevel, setCurrentLevel] = useState<number>(-1);

    useEffect(() => {
        let mounted = true;

        async function loadStream() {
            try {
                const res = await videoApi.getVideoStreamUrl(videoId);
                if (!mounted) return;

                const streamUrl = res.streamUrl;
                if (!streamUrl) {
                    throw new Error("No stream URL returned from server");
                }

                const video = videoRef.current;
                if (!video) return;

                if (streamUrl.includes(".m3u8")) {
                    if (Hls.isSupported()) {
                        // Extract the SAS token from the main URL
                        const urlObj = new URL(streamUrl);
                        const sasToken = urlObj.search; // Grabs everything from "?" to the end

                        const hls = new Hls({
                            debug: false, // Set to true if more internal HLS logs are needed
                            xhrSetup: function(xhr, url) {
                                // If the browser is trying to load a file (like an index.m3u8 or .ts)
                                // and it does NOT have the SAS token yet, attach it dynamically.
                                if (url.indexOf('sv=') === -1 && sasToken) {
                                    xhr.open('GET', url + sasToken, true);
                                }
                            }
                        });
                        hlsRef.current = hls;
                        console.log("[HLS] Loading source:", streamUrl);
                        hls.loadSource(streamUrl);
                        hls.attachMedia(video);
                        hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
                            console.log("[HLS] Manifest parsed, attempting to play", data.levels);
                            if (mounted) {
                                setLevels(data.levels);
                            }
                            video.play().catch((e) => console.error("[HLS] Playback prevented:", e));
                        });
                        hls.on(Hls.Events.ERROR, (_event, data) => {
                            if (data.fatal) {
                                console.error("[HLS] Fatal error:", data);
                                switch (data.type) {
                                    case Hls.ErrorTypes.NETWORK_ERROR:
                                        console.error("[HLS] Fatal network error encountered, try to recover");
                                        hls.startLoad();
                                        if (mounted) setError(`Network error loading stream. (CORS issue?)`);
                                        break;
                                    case Hls.ErrorTypes.MEDIA_ERROR:
                                        console.error("[HLS] Fatal media error encountered, try to recover");
                                        hls.recoverMediaError();
                                        break;
                                    default:
                                        console.error("[HLS] Fatal error, cannot recover");
                                        hls.destroy();
                                        if (mounted) setError(`Stream error: ${data.details}`);
                                        break;
                                }
                            } else {
                                console.warn("[HLS] Non-fatal error:", data);
                            }
                        });
                    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                        console.log("[HLS] Native playback loading:", streamUrl);
                        video.src = streamUrl;
                        video.addEventListener("loadedmetadata", () => {
                            video.play().catch((e) => console.error("Native play error:", e));
                        });
                    } else {
                        throw new Error("HLS is not supported in this browser");
                    }
                } else {
                    console.log("[Video] Direct playback loading:", streamUrl);
                    video.src = streamUrl;
                    video.addEventListener("loadedmetadata", () => {
                        video.play().catch((e) => console.error("Direct play error:", e));
                    });
                }
            } catch (err: any) {
                console.error("[Video Modal Error]", err);
                if (mounted) setError(err.message || "Failed to load video stream");
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadStream();

        return () => {
            mounted = false;
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [videoId]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#13151B] rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-brand-border">
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-brand-border">
                    <h2 className="text-lg font-medium text-white truncate pr-4">{title}</h2>
                    <div className="flex items-center gap-4 shrink-0">
                        {levels.length > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-brand-muted font-medium">Quality:</span>
                                <select 
                                    className="bg-slate-800 text-white text-xs rounded-lg px-2 py-1 border border-brand-border outline-none hover:bg-slate-700 transition-colors cursor-pointer"
                                    value={currentLevel}
                                    onChange={(e) => {
                                        const val = Number(e.target.value);
                                        setCurrentLevel(val);
                                        if (hlsRef.current) {
                                            hlsRef.current.currentLevel = val;
                                        }
                                    }}
                                >
                                    <option value={-1}>Auto</option>
                                    {levels.map((level, i) => (
                                        <option key={i} value={i}>
                                            {level.height}p ({Math.round(level.bitrate / 1000)} kbps)
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <button 
                            onClick={onClose} 
                            className="p-2 text-brand-muted hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
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
                        <div className="flex flex-col items-center gap-2 text-red-400">
                            <AlertCircle size={32} />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    <video 
                        ref={videoRef}
                        controls 
                        className="w-full h-full object-contain"
                        controlsList="nodownload"
                        style={{ display: error ? 'none' : 'block' }}
                    />
                </div>
            </div>
        </div>
    );
}
