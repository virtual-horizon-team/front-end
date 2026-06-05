"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  Loader2,
  ChevronUp,
  Subtitles,
} from "lucide-react";
import Hls from "hls.js";

/* eslint-disable @typescript-eslint/no-explicit-any */
const createSasLoader = (sasToken: string) => {
  return class SasLoader extends Hls.DefaultConfig.loader {
    constructor(config: any) {
      super(config);
    }
    load(context: any, config: any, callbacks: any) {
      if (sasToken) {
        const url = context.url;
        if (url.indexOf("sv=") === -1) {
          const separator = url.indexOf("?") === -1 ? "?" : "&";
          const cleanToken = sasToken.startsWith("?") ? sasToken.substring(1) : sasToken;
          context.url = url + separator + cleanToken;
        }
      }
      super.load(context, config, callbacks);
    }
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

export interface VideoPlayerProps {
  src: string;
  autoplay?: boolean;
  className?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onEnded?: () => void;
}

interface HlsQualityLevel {
  index: number;
  height: number;
  bitrate: number;
}

export default function VideoPlayer({
  src,
  autoplay = true,
  className = "",
  onTimeUpdate,
  onEnded,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isBuffering, setIsBuffering] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Settings dropdowns
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<"main" | "quality" | "speed" | "subtitles">("main");

  // Transcript
  const [transcriptUrl, setTranscriptUrl] = useState<string | null>(null);
  const [isTranscriptEnabled, setIsTranscriptEnabled] = useState(false);
  const [currentCueText, setCurrentCueText] = useState<string>("");
  const [subtitleOffset, setSubtitleOffset] = useState<number>(10);
  const [subtitleSize, setSubtitleSize] = useState<number>(100);

  // HLS Qualities
  const [levels, setLevels] = useState<HlsQualityLevel[]>([]);
  const [currentLevel, setCurrentLevel] = useState<number>(-1); // -1 is Auto

  // Activity timer for hiding controls
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Format time (e.g. 01:23)
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds)) return "00:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Reset controls visibility timer
  const resetControlsTimeout = useCallback(() => {
    setIsControlsVisible(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setIsControlsVisible(false);
        setIsSettingsOpen(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Monitor mouse movement to show controls
  useEffect(() => {
    const handleMouseMove = () => {
      resetControlsTimeout();
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("mousemove", handleMouseMove);
      container.addEventListener("mouseleave", () => {
        if (isPlaying) {
          setIsControlsVisible(false);
          setIsSettingsOpen(false);
        }
      });
    }

    return () => {
      if (container) {
        container.removeEventListener("mousemove", handleMouseMove);
      }
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, resetControlsTimeout]);

  // Load stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let mounted = true;

    // Reset states asynchronously to avoid cascading render warning in effect
    Promise.resolve().then(() => {
      if (mounted) {
        setIsBuffering(true);
        setError(null);
        setLevels([]);
        setCurrentLevel(-1);
        setTranscriptUrl(null);
        setIsTranscriptEnabled(false);
        setCurrentCueText("");
      }
    });

    // Clean up previous HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!src) {
      Promise.resolve().then(() => {
        if (mounted) {
          setError("No video source provided.");
          setIsBuffering(false);
        }
      });
      return;
    }

    if (src.includes(".m3u8")) {
      if (Hls.isSupported()) {
        const urlObj = new URL(src);
        const sasToken = urlObj.search;

        const SasLoaderClass = createSasLoader(sasToken);

        const hls = new Hls({
          debug: false,
          loader: SasLoaderClass,
          xhrSetup: (xhr: XMLHttpRequest, url: string) => {
            if (sasToken && url.indexOf("sv=") === -1) {
              const separator = url.indexOf("?") === -1 ? "?" : "&";
              const cleanToken = sasToken.startsWith("?") ? sasToken.substring(1) : sasToken;
              xhr.open("GET", url + separator + cleanToken, true);
            }
          },
        });

        hlsRef.current = hls;
        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          if (mounted) {
            const mappedLevels = data.levels.map((lvl, index) => ({
              index,
              height: lvl.height,
              bitrate: lvl.bitrate,
            }));
            setLevels(mappedLevels);
            setIsBuffering(false);
            if (autoplay) {
              video.play().catch((err) => console.log("Autoplay prevented:", err));
            }
          }
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                if (mounted) {
                  setError(`Fatal stream loading error: ${data.details}`);
                  setIsBuffering(false);
                }
                break;
            }
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        video.addEventListener("loadedmetadata", () => {
          setIsBuffering(false);
          if (autoplay) {
            video.play().catch((err) => console.log("Autoplay prevented:", err));
          }
        });
      } else {
        Promise.resolve().then(() => {
          if (mounted) {
            setError("HLS playback is not supported in this browser.");
            setIsBuffering(false);
          }
        });
      }
    } else {
      // Direct video playback
      video.src = src;
      video.addEventListener("loadedmetadata", () => {
        setIsBuffering(false);
        if (autoplay) {
          video.play().catch((err) => console.log("Autoplay prevented:", err));
        }
      });
      video.addEventListener("error", () => {
        if (mounted) {
          setError("Failed to load standard video file.");
          setIsBuffering(false);
        }
      });
    }

    return () => {
      mounted = false;
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src, autoplay]);

  // Check for transcript
  useEffect(() => {
    if (!src || !src.includes('master.m3u8')) {
      Promise.resolve().then(() => setTranscriptUrl(null));
      return;
    }

    let mounted = true;
    const checkTranscript = async () => {
      try {
        const urlObj = new URL(src);
        urlObj.pathname = urlObj.pathname.replace('master.m3u8', 'audio.vtt');
        const vttUrl = urlObj.toString();
        
        const response = await fetch(vttUrl, { method: 'HEAD' });
        if (mounted && response.ok) {
          setTranscriptUrl(vttUrl);
        } else if (mounted) {
          setTranscriptUrl(null);
        }
      } catch (err) {
        console.error("Failed to check transcript:", err);
        if (mounted) {
          setTranscriptUrl(null);
        }
      }
    };

    checkTranscript();
    return () => { mounted = false; };
  }, [src]);

  // Video Events
  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play().catch((err) => console.log(err));
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);
    if (onTimeUpdate) {
      onTimeUpdate(video.currentTime, video.duration);
    }

    // Process custom subtitles reliably during playback
    if (isTranscriptEnabled) {
      const tracks = video.textTracks;
      if (tracks && tracks.length > 0) {
        const track = tracks[0];
        const activeCues = track.activeCues;
        if (activeCues && activeCues.length > 0) {
          let text = "";
          for (let i = 0; i < activeCues.length; i++) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            text += (activeCues[i] as any).text + "\n";
          }
          setCurrentCueText(text.trim());
        } else {
          setCurrentCueText("");
        }
      }
    }
  };

  const handleDurationChange = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newTime = parseFloat(e.target.value);
    video.currentTime = newTime;
    setCurrentTime(newTime);
    resetControlsTimeout();
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    resetControlsTimeout();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMute = !isMuted;
    video.muted = nextMute;
    setIsMuted(nextMute);
    resetControlsTimeout();
  };

  const handleSpeedChange = (speed: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = speed;
    setPlaybackSpeed(speed);
    setIsSettingsOpen(false);
    resetControlsTimeout();
  };

  const handleQualityChange = (levelIdx: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = levelIdx;
      setCurrentLevel(levelIdx);
    }
    setIsSettingsOpen(false);
    resetControlsTimeout();
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch((err) => {
        console.error("Fullscreen request failed:", err);
      });
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
    resetControlsTimeout();
  };

  const toggleTranscript = () => {
    setIsTranscriptEnabled(!isTranscriptEnabled);
    if (!isTranscriptEnabled) {
      // Trying to enable
      const video = videoRef.current;
      if (video && video.textTracks && video.textTracks.length > 0) {
        video.textTracks[0].mode = "hidden"; // Ensure it's hidden so we can read activeCues
      }
    } else {
      setCurrentCueText("");
    }
    resetControlsTimeout();
  };

  // Monitor fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Keyboard Shortcuts (Arrow keys for seek, Space for play/pause)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input/textarea/select/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      const video = videoRef.current;
      if (!video) return;

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        video.currentTime = Math.max(0, video.currentTime - 5);
        resetControlsTimeout();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5);
        resetControlsTimeout();
      } else if (e.key === " ") {
        e.preventDefault();
        if (video.paused) {
          video.play().catch((err) => console.log(err));
          setIsPlaying(true);
        } else {
          video.pause();
          setIsPlaying(false);
        }
        resetControlsTimeout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [resetControlsTimeout]);

  const handleVideoEnded = () => {
    setIsPlaying(false);
    if (onEnded) {
      onEnded();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative group overflow-hidden bg-black flex items-center justify-center select-none text-white font-sans ${className}`}
      onClick={(e) => {
        // Prevent click events on control bar from pausing the video
        if ((e.target as HTMLElement).closest(".video-control-bar")) return;
        handlePlayPause();
      }}
      onDoubleClick={toggleFullscreen}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-full max-h-full object-contain pointer-events-none"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onDurationChange={handleDurationChange}
        onWaiting={() => setIsBuffering(true)}
        onPlaying={() => setIsBuffering(false)}
        onEnded={handleVideoEnded}
        controls={false}
        playsInline
        crossOrigin="anonymous"
      >
        {transcriptUrl && (
          <track
            kind="subtitles"
            src={transcriptUrl}
            srcLang="en"
            label="English"
            default={false}
            onLoad={(e) => {
              const trackElement = e.target as HTMLTrackElement;
              // Keep native track hidden to avoid rendering default browser subtitles
              trackElement.track.mode = 'hidden';
            }}
          />
        )}
      </video>

      {/* Custom Subtitles Overlay */}
      {isTranscriptEnabled && currentCueText && (
        <div
          className="absolute left-0 right-0 flex justify-center pointer-events-none px-8 z-10 transition-all duration-75"
          style={{ bottom: `${subtitleOffset}%` }}
        >
          <div 
            className="bg-black/75 backdrop-blur-md text-white px-6 py-2 rounded-xl text-center w-full max-w-[95%] shadow-xl whitespace-pre-wrap font-medium tracking-wide"
            style={{ fontSize: `${(subtitleSize / 100) * 1.125}rem`, lineHeight: 1.4 }}
          >
            {currentCueText}
          </div>
        </div>
      )}

      {/* Big Playback Splash Overlays */}
      {!isPlaying && !isBuffering && !error && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all cursor-pointer">
          <div className="bg-brand-primary/95 text-white p-5 rounded-full shadow-lg transform transition hover:scale-110 active:scale-95 duration-200">
            <Play className="w-8 h-8 fill-white translate-x-0.5" />
          </div>
        </div>
      )}

      {/* Buffering/Loading Indicator */}
      {isBuffering && !error && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 pointer-events-none">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin" />
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="text-brand-primary font-bold text-lg mb-2">Failed to load preview</div>
          <p className="text-sm text-slate-300 max-w-md">{error}</p>
        </div>
      )}

      {/* Control Bar Overlay */}
      <div
        className={`video-control-bar absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex flex-col gap-3 transition-opacity duration-300 z-10 ${isControlsVisible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
      >
        {/* Progress bar / Seek bar */}
        <div className="flex items-center gap-3 w-full">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-primary hover:h-2 transition-all"
            style={{
              background: `linear-gradient(to right, var(--color-brand-primary, #00C8FF) 0%, var(--color-brand-primary, #00C8FF) ${(currentTime / (duration || 1)) * 100
                }%, rgba(255,255,255,0.2) ${(currentTime / (duration || 1)) * 100
                }%, rgba(255,255,255,0.2) 100%)`,
            }}
          />
        </div>

        {/* Action Controls */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-4">
            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="p-1 text-slate-200 hover:text-white hover:scale-105 active:scale-95 transition-all"
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            {/* Volume controls */}
            <div className="flex items-center gap-2 group/volume">
              <button
                onClick={toggleMute}
                className="p-1 text-slate-200 hover:text-white transition-colors"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-5 h-5" />
                ) : (
                  <Volume2 className="w-5 h-5" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-0 group-hover/volume:w-16 h-1 bg-white/20 rounded appearance-none cursor-pointer accent-brand-primary transition-all duration-300 opacity-0 group-hover/volume:opacity-100"
              />
            </div>

            {/* Time Indicator */}
            <span className="text-xs text-slate-300 font-mono tracking-wider">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3 relative">
            {/* Speed & Quality Settings dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSettingsOpen(!isSettingsOpen);
                  setSettingsTab("main");
                }}
                className={`p-1.5 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-all ${isSettingsOpen ? "bg-white/10 text-white rotate-45" : ""
                  }`}
              >
                <Settings className="w-5 h-5" />
              </button>

              <button
                onClick={transcriptUrl ? toggleTranscript : undefined}
                disabled={!transcriptUrl}
                className={`p-1.5 rounded-lg transition-colors ml-1 ${
                  !transcriptUrl
                    ? "text-white/20 cursor-not-allowed"
                    : isTranscriptEnabled
                    ? "text-brand-primary bg-white/10 hover:bg-white/20"
                    : "text-slate-200 hover:text-white hover:bg-white/10"
                }`}
                title={transcriptUrl ? "Toggle Transcript" : "No transcript available"}
              >
                <Subtitles className="w-5 h-5" />
              </button>

              {isSettingsOpen && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-[#13151b] border border-white/10 rounded-xl shadow-2xl p-2 z-30 flex flex-col gap-1 text-sm select-none">
                  {settingsTab === "main" && (
                    <>
                      {/* Quality Option */}
                      {levels.length > 0 && (
                        <button
                          onClick={() => setSettingsTab("quality")}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                        >
                          <span>Quality</span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            {currentLevel === -1
                              ? "Auto"
                              : `${levels[currentLevel]?.height}p`}
                            <ChevronUp className="w-3.5 h-3.5 rotate-90" />
                          </span>
                        </button>
                      )}

                      {/* Speed Option */}
                      <button
                        onClick={() => setSettingsTab("speed")}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 flex items-center justify-between transition-colors"
                      >
                        <span>Speed</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          {playbackSpeed === 1 ? "Normal" : `${playbackSpeed}x`}
                          <ChevronUp className="w-3.5 h-3.5 rotate-90" />
                        </span>
                      </button>

                      {/* Subtitles Option */}
                      <button
                        onClick={transcriptUrl ? () => setSettingsTab("subtitles") : undefined}
                        disabled={!transcriptUrl}
                        className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors mt-1 border-t border-white/5 pt-1 ${
                          !transcriptUrl ? "opacity-50 cursor-not-allowed" : "hover:bg-white/5"
                        }`}
                      >
                        <span>Subtitles</span>
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          {!transcriptUrl ? "Unavailable" : (isTranscriptEnabled ? "On" : "Off")}
                          <ChevronUp className="w-3.5 h-3.5 rotate-90" />
                        </span>
                      </button>
                    </>
                  )}

                  {/* Subtitles Tab */}
                  {settingsTab === "subtitles" && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSettingsTab("main")}
                        className="text-xs text-brand-primary px-3 py-1 text-left font-semibold border-b border-white/5 mb-1"
                      >
                        ← Back
                      </button>
                      
                      <div className="flex items-center justify-between px-3 py-2 mt-1">
                        <span className="text-xs text-slate-300">Enable Subtitles</span>
                        <button
                          onClick={toggleTranscript}
                          className={`w-10 h-5 rounded-full relative transition-colors ${
                            isTranscriptEnabled ? "bg-brand-primary" : "bg-white/20"
                          }`}
                        >
                          <div
                            className={`absolute top-0.5 bottom-0.5 w-4 bg-white rounded-full transition-all shadow-sm ${
                              isTranscriptEnabled ? "left-[calc(100%-1.125rem)]" : "left-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      {isTranscriptEnabled && (
                        <div className="px-3 py-3 mt-1 border-t border-white/5 flex flex-col gap-4">
                          {/* Position Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-300">Position</span>
                              <span className="text-xs text-brand-primary font-mono">{subtitleOffset}%</span>
                            </div>
                            <input
                              type="range"
                              min={5}
                              max={90}
                              value={subtitleOffset}
                              onChange={(e) => setSubtitleOffset(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                          </div>

                          {/* Size Slider */}
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs text-slate-300">Text Size</span>
                              <span className="text-xs text-brand-primary font-mono">{subtitleSize}%</span>
                            </div>
                            <input
                              type="range"
                              min={50}
                              max={250}
                              value={subtitleSize}
                              onChange={(e) => setSubtitleSize(parseFloat(e.target.value))}
                              className="w-full h-1.5 bg-white/20 rounded-lg appearance-none cursor-pointer accent-brand-primary"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quality Select Tab */}
                  {settingsTab === "quality" && (
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      <button
                        onClick={() => setSettingsTab("main")}
                        className="text-xs text-brand-primary px-3 py-1 text-left font-semibold border-b border-white/5 mb-1"
                      >
                        ← Back
                      </button>
                      <button
                        onClick={() => handleQualityChange(-1)}
                        className={`text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors ${currentLevel === -1 ? "text-brand-primary font-bold bg-brand-primary/10" : ""
                          }`}
                      >
                        Auto
                      </button>
                      {levels.map((lvl) => (
                        <button
                          key={lvl.index}
                          onClick={() => handleQualityChange(lvl.index)}
                          className={`text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors ${currentLevel === lvl.index ? "text-brand-primary font-bold bg-brand-primary/10" : ""
                            }`}
                        >
                          {lvl.height}p ({Math.round(lvl.bitrate / 1000)}k)
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Playback Speed Tab */}
                  {settingsTab === "speed" && (
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => setSettingsTab("main")}
                        className="text-xs text-brand-primary px-3 py-1 text-left font-semibold border-b border-white/5 mb-1"
                      >
                        ← Back
                      </button>
                      {[0.5, 0.75, 1, 1.25, 1.5, 2].map((sp) => (
                        <button
                          key={sp}
                          onClick={() => handleSpeedChange(sp)}
                          className={`text-left px-3 py-1.5 rounded-lg text-xs hover:bg-white/5 transition-colors ${playbackSpeed === sp ? "text-brand-primary font-bold bg-brand-primary/10" : ""
                            }`}
                        >
                          {sp === 1 ? "Normal" : `${sp}x`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-200 hover:text-white transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5" />
              ) : (
                <Maximize className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
