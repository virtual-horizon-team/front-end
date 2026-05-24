"use client";

import React, { useState, useRef, useEffect } from "react";
import { X, ZoomIn, ZoomOut, RotateCw, Loader2 } from "lucide-react";

interface ImageCropModalProps {
    file: File;
    onCrop: (croppedFile: File) => void;
    onClose: () => void;
}

export default function ImageCropModal({ file, onCrop, onClose }: ImageCropModalProps) {
    const [imageSrc, setImageSrc] = useState<string>("");
    const [zoom, setZoom] = useState<number>(1);
    const [rotation, setRotation] = useState<number>(0);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const dragStart = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    
    const containerRef = useRef<HTMLDivElement>(null);
    const imgRef = useRef<HTMLImageElement>(null);

    // Read the file and generate image preview URL
    useEffect(() => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === "string") {
                setImageSrc(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }, [file]);

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.current.x,
            y: e.clientY - dragStart.current.y
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        if (e.touches.length === 1) {
            setIsDragging(true);
            dragStart.current = {
                x: e.touches[0].clientX - position.x,
                y: e.touches[0].clientY - position.y
            };
        }
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || e.touches.length !== 1) return;
        setPosition({
            x: e.touches[0].clientX - dragStart.current.x,
            y: e.touches[0].clientY - dragStart.current.y
        });
    };

    const handleCropSave = () => {
        if (!imgRef.current || !containerRef.current) return;

        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Force output size to 300x300 for user profile avatar standard size
        const size = 300;
        canvas.width = size;
        canvas.height = size;

        // Clear canvas
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, size, size);

        // Get container dimensions
        const cropBoxSize = 200; // Size of the visual cropping circle/square
        const rect = containerRef.current.getBoundingClientRect();
        
        // Visual crop box center relative to container
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Source Image dimensions
        const img = imgRef.current;
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;

        // Rendered size in the editor
        const displayWidth = img.width;
        const displayHeight = img.height;

        // Scale factors
        const scaleX = naturalWidth / displayWidth;
        const scaleY = naturalHeight / displayHeight;

        // Calculate drawing offsets on canvas
        ctx.save();
        
        // Translate to canvas center to apply rotation & positioning
        ctx.translate(size / 2, size / 2);
        
        if (rotation !== 0) {
            ctx.rotate((rotation * Math.PI) / 180);
        }

        // Calculate size mapping (how display sizes map to canvas sizes)
        // Zoom is applied on screen display width/height
        const drawWidth = (displayWidth * (size / cropBoxSize)) * zoom;
        const drawHeight = (displayHeight * (size / cropBoxSize)) * zoom;

        // Map relative mouse position to canvas coordinates
        const canvasPosX = position.x * (size / cropBoxSize);
        const canvasPosY = position.y * (size / cropBoxSize);

        ctx.drawImage(
            img,
            -drawWidth / 2 + canvasPosX,
            -drawHeight / 2 + canvasPosY,
            drawWidth,
            drawHeight
        );

        ctx.restore();

        // Convert canvas to Blob/File
        canvas.toBlob(
            (blob) => {
                if (blob) {
                    const croppedFile = new File([blob], file.name, {
                        type: "image/jpeg",
                        lastModified: Date.now(),
                    });
                    onCrop(croppedFile);
                }
            },
            "image/jpeg",
            0.9
        );
    };

    const handleRotate = () => {
        setRotation((prev) => (prev + 90) % 360);
    };

    return (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
                    <h3 className="font-bold text-brand-text">Crop Profile Image</h3>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-brand-soft text-brand-muted hover:text-brand-text transition-colors">
                        <X size={18} />
                    </button>
                </div>

                {/* Editor Container */}
                <div className="p-6 flex flex-col items-center gap-6">
                    {/* Visual Cropping Window */}
                    <div 
                        ref={containerRef}
                        className="relative w-72 h-72 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center select-none"
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onMouseDown={handleMouseDown}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                        onTouchStart={handleTouchStart}
                    >
                        {imageSrc ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                                ref={imgRef}
                                src={imageSrc}
                                alt="Crop preview"
                                className="absolute pointer-events-none max-w-none transition-transform duration-75"
                                style={{
                                    transform: `translate(${position.x}px, ${position.y}px) rotate(${rotation}deg) scale(${zoom})`,
                                    transformOrigin: "center center",
                                    width: "100%",
                                    height: "auto"
                                }}
                            />
                        ) : (
                            <Loader2 className="animate-spin text-white" size={24} />
                        )}

                        {/* Circular Overlay Mask */}
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                            <div className="w-[200px] h-[200px] rounded-full border-2 border-brand-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="w-full space-y-4">
                        {/* Zoom Slider */}
                        <div className="flex items-center gap-3">
                            <ZoomOut size={16} className="text-brand-muted" />
                            <input 
                                type="range" 
                                min="1" 
                                max="4" 
                                step="0.05"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 accent-brand-primary h-1.5 bg-brand-soft rounded-lg appearance-none cursor-pointer"
                            />
                            <ZoomIn size={16} className="text-brand-muted" />
                        </div>

                        {/* Rotate & Reset buttons */}
                        <div className="flex justify-center gap-4">
                            <button 
                                onClick={handleRotate}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-soft transition-colors"
                            >
                                <RotateCw size={14} />
                                Rotate 90°
                            </button>
                            <button 
                                onClick={() => {
                                    setZoom(1);
                                    setPosition({ x: 0, y: 0 });
                                    setRotation(0);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border text-xs font-semibold text-brand-muted hover:text-brand-text hover:bg-brand-soft transition-colors"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-brand-soft border-t border-brand-border flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCropSave}
                        className="bg-brand-primary text-white hover:bg-brand-hover px-5 py-2 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                    >
                        Apply Crop
                    </button>
                </div>
            </div>
        </div>
    );
}
