"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/config";
import { InstructorDetailDto, ProfileResult } from "../types";

interface CourseInstructorsProps {
  instructors: InstructorDetailDto[];
}

export default function CourseInstructors({ instructors }: CourseInstructorsProps) {
  const [profiles, setProfiles] = useState<Record<string, ProfileResult>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProfiles = async () => {
      if (!instructors || instructors.length === 0) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const fetchPromises = instructors.map(async (inst) => {
          try {
            const res = await fetch(`${API_BASE_URL}/api/Profile/instructor/${inst.id}`);
            if (res.ok) {
              const profile: ProfileResult = await res.json();
              return { id: inst.id, profile };
            }
          } catch (error) {
            console.error(`Failed to fetch profile for ${inst.id}`, error);
          }
          return { id: inst.id, profile: null };
        });

        const results = await Promise.all(fetchPromises);
        
        if (isMounted) {
          const profilesMap: Record<string, ProfileResult> = {};
          results.forEach(result => {
            if (result.profile) {
              profilesMap[result.id] = result.profile;
            }
          });
          setProfiles(profilesMap);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProfiles();

    return () => {
      isMounted = false;
    };
  }, [instructors]);

  if (!instructors || instructors.length === 0) {
    return (
      <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-8 animate-fade-in">
        <h2 className="font-serif text-[24px] text-brand-navy font-normal mb-6">Your Instructors</h2>
        <p className="text-brand-muted">No instructors listed for this course.</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-8 animate-fade-in">
      <h2 className="font-serif text-[24px] text-brand-navy font-normal mb-6">Your Instructors</h2>
      <div className="space-y-8">
        {instructors.map((inst) => {
          const profile = profiles[inst.id];
          const isFetching = isLoading && !profile;

          // Merge data: use rich profile if available, fallback to summary DTO
          const displayName = profile?.name || inst.fullName;
          const displayAvatar = profile?.avatarUrl || inst.avatarUrl;
          const displayBio = profile?.bio || inst.bio || "An experienced educator specializing in Virtual Horizon curricula.";
          const displayRating = profile?.averageRating ?? inst.averageRating ?? 0;

          if (isFetching) {
            return (
              <div key={inst.id} className="flex flex-col md:flex-row gap-6 items-start animate-pulse">
                <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-4 w-full">
                  <div className="h-6 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="flex gap-4">
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                    <div className="h-4 bg-slate-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-slate-200 rounded"></div>
                    <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-3 bg-slate-200 rounded w-4/6"></div>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div key={inst.id} className="flex flex-col md:flex-row gap-6 items-start">
              {displayAvatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className="w-24 h-24 rounded-full object-cover border-2 border-brand-border shadow-sm shrink-0"
                  src={displayAvatar}
                  alt={displayName}
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center font-bold text-2xl border-2 border-brand-border shadow-sm shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}

              <div className="flex-1">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <h3 className="font-serif text-[20px] text-brand-primary mb-1 font-normal">
                      {displayName}
                    </h3>
                    <p className="text-sm text-brand-muted mb-3 font-medium">
                      Instructor {profile?.country ? `• ${profile.country}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {profile?.linkedinUrl && (
                      <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-[#0A66C2] transition-colors" title="LinkedIn">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
                      </a>
                    )}
                    {profile?.portfolioUrl && (
                      <a href={profile.portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-brand-muted hover:text-brand-primary transition-colors" title="Portfolio">
                        <span className="material-symbols-outlined text-[20px]">language</span>
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs font-sans text-brand-muted">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-brand-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                    <span className="font-semibold text-brand-text">{displayRating.toFixed(1)}</span> Instructor Rating
                  </div>
                  {(profile?.totalReview || 0) > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-brand-primary text-base">reviews</span>
                      <span className="font-semibold text-brand-text">{profile?.totalReview?.toLocaleString()}</span> Reviews
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-brand-primary text-base">school</span>
                    <span className="font-semibold text-brand-text">{(profile?.totalEnrollments || 0).toLocaleString()}</span> Students
                  </div>
                  {profile?.yearsOfExperience && (
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-brand-primary text-base">work_history</span>
                      <span className="font-semibold text-brand-text">{profile.yearsOfExperience}</span> Years Exp.
                    </div>
                  )}
                </div>

                <p className="text-[15px] text-brand-muted leading-relaxed whitespace-pre-line mb-4">
                  {displayBio}
                </p>

                <Link 
                  href={`/courses?instructorId=${inst.id}`}
                  className="inline-flex items-center gap-1.5 text-brand-primary hover:text-brand-hover text-sm font-semibold transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">video_library</span>
                  View all courses by {displayName}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
