"use client";

import React, { useState } from "react";
import Link from "next/link";
import { User, Briefcase, Star, Clock, Upload, Loader2, ArrowRight, BookOpen, Award, Eye, X } from "lucide-react";
import { UserProfile } from "@/features/instructor/lib/profile-api";

interface ProfileCardProps {
    profile: UserProfile | null;
    avatarUrl: string;
    name: string;
    yearsOfExperience: number;
    uploadingAvatar: boolean;
    onAvatarClick: () => void;
    isInstructor: boolean;
    getInitials: (name: string) => string;
    onShowRequests?: () => void;
}

export default function ProfileCard({
    profile,
    avatarUrl,
    name,
    yearsOfExperience,
    uploadingAvatar,
    onAvatarClick,
    isInstructor,
    getInitials,
    onShowRequests
}: ProfileCardProps) {
    const [showLightbox, setShowLightbox] = useState(false);

    const handleContainerClick = () => {
        if (!avatarUrl) {
            onAvatarClick();
        } else {
            setShowLightbox(true);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm flex flex-col items-center text-center">
            
            {/* Avatar Upload Container */}
            <div 
                onClick={handleContainerClick}
                className="relative group w-28 h-28 rounded-full overflow-hidden border border-brand-border bg-brand-bg flex items-center justify-center cursor-pointer shadow-inner mb-4"
            >
                {uploadingAvatar ? (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                        <Loader2 size={24} className="animate-spin text-white" />
                    </div>
                ) : null}

                {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img 
                        src={avatarUrl} 
                        alt={name || "User Avatar"} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="text-2xl font-bold text-brand-muted">
                        {getInitials(name || profile?.name || "")}
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[11px] font-semibold gap-1">
                    <Eye size={16} />
                    <span>View Photo</span>
                </div>
            </div>

            {/* Name & Badge */}
            <h2 className="text-lg font-bold text-brand-text truncate max-w-full">{name || "Untitled Profile"}</h2>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-brand-peach text-brand-primary mt-1 capitalize">
                <User size={12} />
                {profile?.profileType || "User"}
            </span>

            {/* Divider */}
            <div className="w-full border-t border-brand-border/60 my-5" />

            {/* Stats Panel (Only show experience/ratings if instructor) */}
            {isInstructor ? (
                <div className="w-full grid grid-cols-2 gap-4">
                    <div className="bg-brand-soft rounded-xl p-3 text-center border border-brand-border/40">
                        <div className="flex items-center justify-center text-brand-primary mb-1">
                            <Briefcase size={16} />
                        </div>
                        <span className="text-xs text-brand-muted font-medium block">Experience</span>
                        <span className="text-sm font-bold text-brand-text mt-0.5 block">
                            {yearsOfExperience ? `${yearsOfExperience} Yrs` : "None"}
                        </span>
                    </div>
                    <div className="bg-brand-soft rounded-xl p-3 text-center border border-brand-border/40">
                        <div className="flex items-center justify-center text-amber-500 mb-1">
                            <Star size={16} fill="currentColor" />
                        </div>
                        <span className="text-xs text-brand-muted font-medium block">Rating</span>
                        <span className="text-sm font-bold text-brand-text mt-0.5 block">
                            {profile?.averageRating ? `${profile.averageRating.toFixed(1)} ★` : "--"}
                        </span>
                    </div>
                </div>
            ) : (
                <div className="w-full bg-brand-soft rounded-xl p-4 text-center border border-brand-border/40">
                    <span className="text-xs text-brand-muted font-medium block">Account Role</span>
                    <span className="text-sm font-bold text-brand-text mt-1 block">
                        Student Profile
                    </span>
                </div>
            )}

            {/* Secondary stats */}
            <div className="w-full text-left space-y-3 mt-5 text-xs text-brand-muted">
                {isInstructor && (
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Total Reviews</span>
                        <span className="font-semibold text-brand-text">{profile?.totalReview || 0}</span>
                    </div>
                )}
                <div className="flex items-center justify-between">
                    <span className="font-medium">Profile Status</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-50 text-green-700 font-semibold text-[10px] border border-green-200">
                        Active
                    </span>
                </div>
            </div>

            {/* Joined at info */}
            {profile?.createdAt && (
                <div className="mt-6 mb-2 flex items-center justify-center gap-1.5 text-[11px] text-brand-muted">
                    <Clock size={12} />
                    <span>Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                </div>
            )}

            {/* Dashboard Navigation */}
            <div className="w-full mt-6 pt-6 border-t border-brand-border/60 space-y-2.5">
                {isInstructor ? (
                    <Link
                        href="/instructor/dashboard"
                        className="flex items-center justify-center gap-2 w-full bg-[#13151B] text-white hover:opacity-90 transition-opacity px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
                    >
                        Go to Dashboard
                        <ArrowRight size={16} />
                    </Link>
                ) : (
                    <Link
                        href="/courses"
                        className="flex items-center justify-center gap-2 w-full bg-brand-primary text-white hover:bg-brand-hover transition-colors px-5 py-2.5 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
                    >
                        <BookOpen size={16} />
                        Explore Courses
                    </Link>
                )}

                {onShowRequests && (
                    <button
                        onClick={onShowRequests}
                        type="button"
                        className="flex items-center justify-center gap-2 w-full border border-brand-border bg-white text-brand-navy hover:bg-brand-soft transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold shadow-xs cursor-pointer"
                    >
                        <Award size={16} className="text-brand-primary shrink-0" />
                        Application Status
                    </button>
                )}
            </div>

            {/* Full Image Lightbox Modal with Action Button */}
            {showLightbox && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-50 animate-fade-in p-4">
                    <button 
                        onClick={() => setShowLightbox(false)}
                        className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full cursor-pointer transition-all"
                        aria-label="Close Preview"
                    >
                        <X size={20} />
                    </button>
                    
                    <div className="flex flex-col items-center gap-6 max-w-[90vw] max-h-[85vh]">
                        <div className="overflow-hidden rounded-2xl border border-white/10 shadow-2xl relative max-w-full max-h-[70vh]">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img 
                                src={avatarUrl} 
                                alt={name || "User Avatar Full Size"} 
                                className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                            />
                        </div>
                        
                        <button
                            onClick={() => {
                                setShowLightbox(false);
                                onAvatarClick();
                            }}
                            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-primary hover:bg-brand-hover text-white font-bold text-sm transition-all cursor-pointer shadow-lg shadow-brand-primary/20 active:scale-95 hover:scale-[1.01]"
                        >
                            <Upload size={15} />
                            Change Photo
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
