"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Star, 
  Clock, 
  User, 
  BookOpen, 
  Sparkles, 
  Award, 
  Share2, 
  Gift, 
  Check, 
  Play, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Info,
  Tv,
  Bookmark,
  Heart,
  HelpCircle,
  PlayCircle,
  FileText
} from "lucide-react";
import { CourseDetailDto } from "../types";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
}

interface CourseDetailsClientProps {
  course: CourseDetailDto;
  session: SessionData | null;
}

export default function CourseDetailsClient({ course, session }: CourseDetailsClientProps) {
  const [activeSectionId, setActiveSectionId] = useState<string | null>(
    course.sections && course.sections.length > 0 ? course.sections[0].id : null
  );
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [enrollmentStatus, setEnrollmentStatus] = useState<"idle" | "loading" | "enrolled">("idle");
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "instructor" | "reviews">("overview");

  // Format duration minutes to a readable string (e.g. 1h 45m)
  const formatDuration = (totalMinutes: number | null) => {
    if (!totalMinutes || totalMinutes <= 0) return "0m";
    if (totalMinutes < 60) return `${totalMinutes}m`;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const getResourceIcon = (resourceType?: string) => {
    switch (resourceType) {
      case "Video":
        return "play_circle";
      case "Document":
        return "description";
      case "Article":
        return "menu_book";
      case "Scenario":
        return "view_in_ar";
      case "Quiz":
        return "quiz";
      default:
        return "play_circle";
    }
  };

  const getLessonDurationText = (lesson: any) => {
    if (lesson.durationMinutes && lesson.durationMinutes > 0) {
      return formatDuration(lesson.durationMinutes);
    }
    switch (lesson.resourceType) {
      case "Scenario":
        return "VR Scenario";
      case "Quiz":
        return "Quiz Assessment";
      case "Document":
        return "Document";
      case "Article":
        return "Reading Article";
      default:
        return "Interactive";
    }
  };

  const toggleSection = (sectionId: string) => {
    setActiveSectionId(activeSectionId === sectionId ? null : sectionId);
  };

  const handleBookmarkToggle = () => {
    setIsFavorite(!isFavorite);
  };

  const handleEnrollClick = () => {
    if (!session) {
      // Redirect to login page with dynamic redirect query parameter
      window.location.href = `/login?redirect=/courses/${course.id}`;
      return;
    }

    if (enrollmentStatus === "enrolled") return;

    setEnrollmentStatus("loading");
    setTimeout(() => {
      setEnrollmentStatus("enrolled");
    }, 1800);
  };

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };

  return (
    <div className="bg-brand-bg min-h-screen pb-16 font-sans">
      {/* 1. Dynamic Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-primary via-[#7a000d] to-brand-navy text-white py-16 md:py-24">
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
        {/* Ambient light glow */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-primary/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-container-max mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-12 gap-8 items-center">
            <div className="md:col-span-8">
              {/* Category & Level Badges */}
              <div className="flex flex-wrap gap-2.5 mb-6">
                <span className="inline-flex items-center gap-1 bg-white/10 text-white border border-white/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {course.categoryName || "General"}
                </span>
                <span className="inline-flex items-center gap-1 bg-brand-peach/20 text-brand-peach border border-brand-peach/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                  {course.level}
                </span>
                {course.hasVRScenarios && (
                  <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-sm">
                    <span className="material-symbols-outlined text-xs leading-none">view_in_ar</span> VR Enabled
                  </span>
                )}
              </div>

              {/* Course Title */}
              <h1 className="font-serif text-[36px] md:text-[52px] font-normal leading-tight text-white mb-6">
                {course.title}
              </h1>

              {/* Subtitle */}
              {course.subtitle && (
                <p className="font-sans text-[16px] md:text-[18px] text-slate-200 opacity-95 mb-8 leading-relaxed max-w-3xl">
                  {course.subtitle}
                </p>
              )}

              {/* Stats Row */}
              <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-sm text-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-yellow-400">
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  </div>
                  <span className="font-bold text-white text-base">{course.averageRating || "4.8"}</span>
                  <span className="opacity-75">({course.totalReviews || 0} reviews)</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[20px] opacity-75">group</span>
                  <span><strong className="text-white">{course.totalEnrollments.toLocaleString() || "1,248"}</strong> learners enrolled</span>
                </div>

                {course.instructors && course.instructors.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[20px] opacity-75">person</span>
                    <span>
                      Created by <strong className="text-white">{course.instructors[0].fullName}</strong>
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Two-Column Layout */}
      <section className="max-w-container-max mx-auto px-6 -mt-16 md:-mt-24 relative z-20">
        <div className="grid md:grid-cols-12 gap-8">
          
          {/* A. Left Content Column */}
          <div className="md:col-span-8 space-y-8 mt-32 md:mt-0">
            {/* Quick Navigation Tabs (For high premium look) */}
            <div className="bg-white rounded-xl border border-brand-border p-1 shadow-sm flex overflow-x-auto scrollbar-none sticky top-[72px] z-30">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === "content"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                }`}
              >
                Course Content
              </button>
              <button
                onClick={() => setActiveTab("instructor")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === "instructor"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                }`}
              >
                Instructors
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${
                  activeTab === "reviews"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                }`}
              >
                Reviews
              </button>
            </div>

            {/* TAB CONTENT: Overview */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                {/* 1. What You'll Learn Card */}
                {course.learningObjectives && course.learningObjectives.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm">
                    <h2 className="font-serif text-[24px] text-brand-navy mb-6 font-normal">What you'll learn</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {course.learningObjectives.map((obj, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <span className="material-symbols-outlined text-brand-primary font-bold mt-0.5 select-none">check</span>
                          <span className="text-[15px] text-brand-text leading-relaxed">{obj}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Description */}
                <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm">
                  <h2 className="font-serif text-[24px] text-brand-navy mb-6 font-normal">Course Description</h2>
                  <div className="space-y-4 text-[15px] text-brand-muted leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>

                {/* 3. Requirements Container */}
                {course.requirements && course.requirements.length > 0 && (
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm">
                    <h2 className="font-serif text-[24px] text-brand-navy mb-6 font-normal">Requirements</h2>
                    <ul className="list-disc list-inside space-y-3 text-[15px] text-brand-muted">
                      {course.requirements.map((req, i) => (
                        <li key={i} className="leading-relaxed pl-1">
                          <span className="text-brand-text">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: Content */}
            {activeTab === "content" && (
              <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-6 animate-fade-in">
                <div className="flex justify-between items-center pb-2">
                  <div>
                    <h2 className="font-serif text-[24px] text-brand-navy font-normal">Course Content</h2>
                    <p className="text-sm text-brand-muted mt-1">
                      {course.sections?.length || 0} sections • {course.totalLectures || 0} lectures • {formatDuration(course.totalDurationMinutes)} total length
                    </p>
                  </div>
                </div>

                {/* Accordion list */}
                <div className="border border-brand-border rounded-xl overflow-hidden divide-y divide-brand-border">
                  {course.sections && course.sections.map((section, index) => {
                    const isOpen = activeSectionId === section.id;
                    return (
                      <div key={section.id} className="group/item">
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/60 transition-colors text-left"
                        >
                          <span className="font-medium text-brand-navy flex items-center gap-3">
                            <span className="material-symbols-outlined text-brand-primary leading-none">
                              folder
                            </span>
                            <span className="text-[16px]">{section.title}</span>
                          </span>
                          <div className="flex items-center gap-4 text-brand-muted text-sm font-sans">
                            <span>
                              {section.totalLessons} lessons • {formatDuration(section.totalDurationMinutes)}
                            </span>
                            <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>
                              expand_more
                            </span>
                          </div>
                        </button>

                        {/* Accordion content with CSS transitions */}
                        <div
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${
                            isOpen ? "max-h-[1000px] border-t border-brand-border" : "max-h-0"
                          }`}
                        >
                          <div className="p-5 bg-white space-y-4">
                            {section.lessons && section.lessons.map((lesson) => {
                              const iconName = getResourceIcon(lesson.resourceType);
                              const durationText = getLessonDurationText(lesson);
                              return (
                                <div key={lesson.id} className="flex items-center justify-between group/lesson py-1">
                                  <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined text-brand-muted group-hover/lesson:text-brand-primary transition-colors text-[20px]">
                                      {iconName}
                                    </span>
                                    <span className="text-brand-text group-hover/lesson:text-brand-primary transition-colors text-[15px]">
                                      {lesson.title}
                                    </span>
                                    {lesson.isPreview && (
                                      <span className="text-[10px] bg-brand-peach text-brand-primary px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-sm text-brand-muted">
                                      {durationText}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Instructors */}
            {activeTab === "instructor" && (
              <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-8 animate-fade-in">
                <h2 className="font-serif text-[24px] text-brand-navy font-normal mb-6">Your Instructors</h2>
                <div className="space-y-8">
                  {course.instructors && course.instructors.map((inst) => (
                    <div key={inst.id} className="flex flex-col md:flex-row gap-6 items-start">
                      {inst.avatarUrl ? (
                        <img 
                          className="w-24 h-24 rounded-full object-cover border-2 border-brand-border shadow-sm"
                          src={inst.avatarUrl} 
                          alt={inst.fullName}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center font-bold text-2xl border-2 border-brand-border shadow-sm">
                          {inst.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <h3 className="font-serif text-[20px] text-brand-primary mb-1 font-normal">
                          {inst.fullName}
                        </h3>
                        <p className="text-sm text-brand-muted mb-3 font-medium">Instructor</p>
                        
                        <div className="flex gap-6 mb-4 text-xs font-sans text-brand-muted">
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-brand-primary text-base" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                            <span className="font-semibold text-brand-text">{inst.averageRating || "4.9"}</span> Rating
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-brand-primary text-base">school</span>
                            <span className="font-semibold text-brand-text">10,000+</span> Students
                          </div>
                        </div>

                        <p className="text-[15px] text-brand-muted leading-relaxed whitespace-pre-line">
                          {inst.bio || "An experienced educator specializing in Virtual Horizon curricula, bringing professional insight and deep knowledge to guide students through real-world applications."}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: Reviews */}
            {activeTab === "reviews" && (
              <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-8 animate-fade-in">
                <h2 className="font-serif text-[24px] text-brand-navy font-normal mb-6">Student Reviews</h2>
                
                {course.reviews && course.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {course.reviews.map((review) => (
                      <div key={review.id} className="p-5 border border-brand-border rounded-xl">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            {review.userAvatarUrl ? (
                              <img 
                                className="w-10 h-10 rounded-full object-cover"
                                src={review.userAvatarUrl} 
                                alt={review.userName}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center font-bold">
                                {review.userName.slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-brand-text text-sm">{review.userName}</p>
                              <div className="flex text-yellow-400 mt-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span 
                                    key={i} 
                                    className="material-symbols-outlined text-sm leading-none" 
                                    style={{ fontVariationSettings: i < review.rating ? "'FILL' 1" : "'FILL' 0" }}
                                  >
                                    star
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-brand-muted">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-[15px] text-brand-muted leading-relaxed italic">
                          "{review.comment}"
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-6">
                    <span className="material-symbols-outlined text-brand-primary text-5xl mb-4 leading-none">rate_review</span>
                    <h3 className="font-serif text-lg text-brand-navy font-normal mb-2">No reviews yet</h3>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                      There are no reviews for this course yet. Be the first to share your learning experience once you enroll!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B. Right Sidebar Column (Sticky Buy Box) */}
          <div className="md:col-span-4 relative">
            <div className="md:sticky md:top-[96px] bg-white border border-brand-border rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300">
              
              {/* Media Thumbnail with hover overlay preview */}
              <div className="relative group overflow-hidden aspect-video">
                {course.thumbnailUrl ? (
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    src={course.thumbnailUrl}
                    alt={course.title}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-brand-primary to-brand-navy flex items-center justify-center text-white text-3xl font-serif">
                    VH
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                  <div className="bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md border border-white/20 scale-95 group-hover:scale-100 transition-all duration-300">
                    <Play className="text-white fill-white w-8 h-8" />
                  </div>
                </div>
              </div>

              {/* Course Purchase Details */}
              <div className="p-6 md:p-8">
                {/* Price Display */}
                <div className="flex items-baseline gap-2 mb-6">
                  {course.isFree || !course.price ? (
                    <span className="font-serif text-[36px] font-normal text-brand-primary">Free</span>
                  ) : (
                    <>
                      <span className="font-serif text-[36px] font-normal text-brand-primary">
                        {course.currency === "USD" ? "$" : course.currency || ""}{course.price}
                      </span>
                      <span className="text-sm text-brand-muted line-through opacity-75">
                        {course.currency === "USD" ? "$" : course.currency || ""}{(course.price * 1.5).toFixed(0)}
                      </span>
                    </>
                  )}
                </div>

                {/* Enrollment CTA states */}
                {enrollmentStatus === "idle" && (
                  <button
                    onClick={handleEnrollClick}
                    className="w-full bg-brand-primary text-white py-3.5 rounded-lg font-semibold hover:bg-brand-hover active:scale-[0.98] transition-all duration-200 shadow-sm text-[16px]"
                  >
                    {session ? "Enroll Now" : "Sign In to Enroll"}
                  </button>
                )}

                {enrollmentStatus === "loading" && (
                  <button
                    disabled
                    className="w-full bg-brand-primary/80 text-white py-3.5 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing Enrollment...
                  </button>
                )}

                {enrollmentStatus === "enrolled" && (
                  <div className="text-center">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-[20px] leading-none text-emerald-600">check_circle</span>
                      Enrolled Successfully!
                    </div>
                    <Link
                      href="/dashboard/courses"
                      className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all text-center text-[16px]"
                    >
                      Go to Classroom
                    </Link>
                  </div>
                )}

                {/* Bookmark Action */}
                {enrollmentStatus !== "enrolled" && (
                  <button
                    onClick={handleBookmarkToggle}
                    className={`w-full mt-3 border py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] duration-200 text-sm ${
                      isFavorite 
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700" 
                        : "border-brand-border text-brand-primary hover:bg-brand-peach/10"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: isFavorite ? "'FILL' 1" : "'FILL' 0" }}>
                      {isFavorite ? "bookmark" : "bookmark_add"}
                    </span>
                    {isFavorite ? "Saved to Favorites" : "Add to Favorites"}
                  </button>
                )}

                {/* Course Checklist */}
                <h4 className="font-semibold text-brand-navy mt-8 mb-4 text-[16px]">This course includes:</h4>
                <div className="space-y-3.5 text-sm text-brand-muted font-sans">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-primary text-[20px]">schedule</span>
                    <span>{formatDuration(course.totalDurationMinutes)} of on-demand video</span>
                  </div>
                  
                  {course.totalLectures > 0 && (
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-brand-primary text-[20px]">play_circle</span>
                      <span>{course.totalLectures} downloadable lectures</span>
                    </div>
                  )}

                  {course.hasVRScenarios && (
                    <div className="flex items-center gap-3 text-brand-navy font-medium">
                      <span className="material-symbols-outlined text-emerald-600 text-[20px]">view_in_ar</span>
                      <span className="flex items-center gap-1.5">
                        Interactive VR Lab Scenarios 
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          VR
                        </span>
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-primary text-[20px]">all_inclusive</span>
                    <span>Full lifetime access</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-brand-primary text-[20px]">workspace_premium</span>
                    <span>University-certified credential</span>
                  </div>
                </div>

                {/* Share and Gift */}
                <div className="mt-8 pt-6 border-t border-brand-border flex justify-center gap-8 text-[14px]">
                  <button 
                    onClick={handleShareClick}
                    className="text-brand-primary hover:text-brand-hover font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Share <Share2 size={15} />
                  </button>
                  <button className="text-brand-primary hover:text-brand-hover font-semibold flex items-center gap-1.5 transition-colors">
                    Gift <Gift size={15} />
                  </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Share Modal Dialog */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 border border-brand-border shadow-2xl relative animate-slide-in-right">
            <h3 className="font-serif text-xl text-brand-navy mb-4 font-normal">Share this course</h3>
            <p className="text-sm text-brand-muted mb-4">Copy the course URL to share it with your friends and colleagues.</p>
            
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? window.location.href : ""}
                className="flex-1 border border-brand-border rounded-lg px-3 py-2 text-sm bg-slate-50 focus:outline-none focus:border-brand-primary"
              />
              <button
                onClick={() => {
                  if (typeof navigator !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    alert("URL copied to clipboard!");
                  }
                }}
                className="bg-brand-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-hover transition-colors"
              >
                Copy
              </button>
            </div>

            <button
              onClick={() => setIsShareModalOpen(false)}
              className="absolute top-4 right-4 text-brand-muted hover:text-brand-text font-bold"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
