"use client";

import React, { useEffect } from "react";
import { X, Download, Smartphone, LogIn, PlayCircle, Zap } from "lucide-react";

interface LaunchVRModalProps {
    onClose: () => void;
}

export default function LaunchVRModal({ onClose }: LaunchVRModalProps) {
    // Prevent scrolling when modal is open
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, []);

    const steps = [
        {
            icon: <Download size={20} className="text-brand-primary" />,
            title: "Download VH Viewer",
            description: "Install the Virtual Horizon Viewer application directly on your VR headset from the App Store.",
        },
        {
            icon: <Smartphone size={20} className="text-amber-500" />,
            title: "Get Pairing Code",
            description: "Open the app in your headset and wait for the unique pairing number to pop up on your screen.",
        },
        {
            icon: <LogIn size={20} className="text-emerald-500" />,
            title: "Pair Your Device",
            description: "Login to this website, navigate to device pairing, and enter the number to link your headset.",
        },
        {
            icon: <PlayCircle size={20} className="text-purple-500" />,
            title: "Launch Scenario",
            description: "Choose the specific course and scenario you want to practice, and click run to start your simulation.",
        }
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-brand-navy/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-in-right">
                
                {/* Header with Gradient */}
                <div className="bg-gradient-to-r from-brand-primary to-[#7a000d] p-6 text-white relative">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full p-1.5 transition-all"
                        aria-label="Close modal"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md border border-white/20">
                            <Zap size={24} className="text-white fill-white" />
                        </div>
                        <h2 className="text-2xl font-bold font-serif">Launch VR Simulation</h2>
                    </div>
                    <p className="text-white/80 text-sm max-w-[90%]">
                        Follow these steps to seamlessly connect your VR headset and immerse yourself in the learning scenario.
                    </p>
                </div>

                {/* Steps List */}
                <div className="p-6 md:p-8 space-y-6 bg-brand-bg">
                    {steps.map((step, index) => (
                        <div key={index} className="flex gap-4 items-start group">
                            {/* Step Number & Line */}
                            <div className="flex flex-col items-center mt-1">
                                <div className="w-10 h-10 rounded-full bg-white border border-brand-border shadow-sm flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300 relative z-10">
                                    {step.icon}
                                </div>
                                {index !== steps.length - 1 && (
                                    <div className="w-px h-12 bg-brand-border/60 -mb-2 mt-2 group-hover:bg-brand-primary/30 transition-colors" />
                                )}
                            </div>
                            
                            {/* Step Content */}
                            <div className="flex-1 pt-1.5">
                                <h3 className="text-brand-text font-bold text-base mb-1 group-hover:text-brand-primary transition-colors">
                                    Step {index + 1}: {step.title}
                                </h3>
                                <p className="text-brand-muted text-[14px] leading-relaxed">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-brand-border bg-white flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl border border-brand-border text-brand-navy font-semibold hover:bg-brand-soft transition-colors text-sm"
                    >
                        Close
                    </button>
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-brand-primary text-white font-semibold hover:bg-brand-hover active:scale-95 transition-all text-sm shadow-sm flex items-center gap-2"
                    >
                        I understand, let's go
                    </button>
                </div>
            </div>
        </div>
    );
}
