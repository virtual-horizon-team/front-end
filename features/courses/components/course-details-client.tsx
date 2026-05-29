"use client";

import { useState, useEffect } from "react";
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
import { useCartStore } from "@/features/cart/hooks/useCartStore";
import LessonPreviewModal from "./lesson-preview-modal";
import CourseInstructors from "./course-instructors";
import CourseReviews from "./course-reviews";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
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
  const [enrollmentStatus, setEnrollmentStatus] = useState<"idle" | "loading" | "enrolled">(
    course.isEnrolled ? "enrolled" : "idle"
  );
  const [activeTab, setActiveTab] = useState<"overview" | "content" | "instructor" | "reviews">("overview");

  const { addItem, cart, fetchCart } = useCartStore();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [previewLesson, setPreviewLesson] = useState<{ id: string; title: string; resourceType: string } | null>(null);

  useEffect(() => {
    if (session) {
      fetchCart();
    }
  }, [session, fetchCart]);

  const isAlreadyInCart = cart?.items.some(item => item.id === course.id) || false;

  const previewableLessons = course.sections
    ?.flatMap((section) => section.lessons || [])
    .filter((lesson) => lesson.isPreview && (lesson.resourceType === "Video" || lesson.resourceType === "Document"))
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      resourceType: lesson.resourceType || "Video",
    })) || [];

  const handleAddToCart = async () => {
    if (!session) {
      window.location.href = `/login?redirect=/courses/${course.id}`;
      return;
    }

    const isOwnCourse = course.instructors?.some(inst => inst.id === session.userId);
    if (isOwnCourse) {
      alert("You cannot purchase your own course.");
      return;
    }

    try {
      setIsAddingToCart(true);
      await addItem(course.id);
    } catch (err: any) {
      alert(err.message || "Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

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
        <div className="flex flex-col md:grid md:grid-cols-12 gap-8">

          {/* A. Left Content Column */}
          <div className="md:col-span-8 space-y-8 order-2 md:order-1">
            {/* Quick Navigation Tabs (For high premium look) */}
            <div className="bg-white rounded-xl border border-brand-border p-1 shadow-sm flex overflow-x-auto scrollbar-none sticky top-[72px] z-30">
              <button
                onClick={() => setActiveTab("overview")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === "overview"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                  }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("content")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === "content"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                  }`}
              >
                Course Content
              </button>
              <button
                onClick={() => setActiveTab("instructor")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === "instructor"
                    ? "bg-brand-primary text-white shadow-sm"
                    : "text-brand-muted hover:text-brand-text hover:bg-slate-50"
                  }`}
              >
                Instructors
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 whitespace-nowrap ${activeTab === "reviews"
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

                {/* 4. Tags Section */}
                {((course.tags && course.tags.length > 0) || true) && (
                  <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm">
                    <div className="flex flex-wrap gap-2">
                      {(course.tags && course.tags.length > 0
                        ? course.tags
                        : [
                            course.categoryName || "General",
                            course.level,
                            course.language || "English",
                            "Virtual Reality",
                            "Interactive",
                          ]
                      ).map((tag, i) => (
                        <Link
                          key={i}
                          href={`/courses?search=${encodeURIComponent(tag)}`}
                          className="bg-brand-soft border border-brand-border text-brand-muted hover:text-brand-primary hover:border-brand-primary/30 px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
                        >
                          #{tag}
                        </Link>
                      ))}
                    </div>
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
                          className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-5 bg-slate-50 hover:bg-slate-100/60 transition-colors text-left"
                        >
                          <span className="font-medium text-brand-navy flex items-center gap-3 w-full sm:w-auto">
                            <span className="material-symbols-outlined text-brand-primary leading-none shrink-0">
                              folder
                            </span>
                            <span className="text-[16px] pr-4">{section.title}</span>
                          </span>
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 text-brand-muted text-sm font-sans pl-9 sm:pl-0">
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
                          className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-[1500px] border-t border-brand-border" : "max-h-0"
                            }`}
                        >
                          <div className="p-5 bg-white space-y-4">
                            {section.lessons && section.lessons.map((lesson) => {
                              const iconName = getResourceIcon(lesson.resourceType);
                              const durationText = getLessonDurationText(lesson);
                              const isLessonPreview = lesson.isPreview && (lesson.resourceType === "Video" || lesson.resourceType === "Document");
                              return (
                                <div
                                  key={lesson.id}
                                  onClick={() => {
                                    if (isLessonPreview) {
                                      setPreviewLesson({
                                        id: lesson.id,
                                        title: lesson.title,
                                        resourceType: lesson.resourceType || "Video",
                                      });
                                    }
                                  }}
                                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 group/lesson py-1.5 px-2 rounded-lg transition-all ${
                                    isLessonPreview
                                      ? "cursor-pointer hover:bg-brand-peach/5 border border-transparent hover:border-brand-primary/10"
                                      : ""
                                  }`}
                                >
                                  <div className="flex items-start sm:items-center gap-3">
                                    <span className={`material-symbols-outlined transition-colors text-[20px] shrink-0 mt-0.5 sm:mt-0 ${
                                      isLessonPreview
                                        ? "text-brand-primary group-hover/lesson:scale-110"
                                        : "text-brand-muted group-hover/lesson:text-brand-primary"
                                    }`}>
                                      {iconName}
                                    </span>
                                    <span className={`transition-colors text-[15px] pr-4 ${
                                      isLessonPreview
                                        ? "text-brand-navy font-medium group-hover/lesson:text-brand-primary"
                                        : "text-brand-text group-hover/lesson:text-brand-primary"
                                    }`}>
                                      {lesson.title}
                                    </span>
                                    {isLessonPreview && (
                                      <span className="text-[10px] bg-brand-peach text-brand-primary px-2.5 py-0.5 rounded font-bold uppercase tracking-wider shrink-0 mt-0.5 sm:mt-0 shadow-sm animate-pulse">
                                        Preview
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-3 pl-8 sm:pl-0">
                                    <span className="text-sm text-brand-muted whitespace-nowrap">
                                      {durationText}
                                    </span>
                                    {isLessonPreview && (
                                      <span className="material-symbols-outlined text-brand-primary text-lg opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                        visibility
                                      </span>
                                    )}
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

            {activeTab === "instructor" && (
              <CourseInstructors instructors={course.instructors} />
            )}

            {activeTab === "reviews" && (
              <CourseReviews 
                courseId={course.id}
                session={session}
                isEnrolled={course.isEnrolled}
                initialReviews={course.reviews}
                courseRating={course.averageRating}
                courseTotalReviews={course.totalReviews}
              />
            )}
          </div>

          {/* B. Right Sidebar Column (Sticky Buy Box) */}
          <div className="md:col-span-4 relative order-1 md:order-2">
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
                <div 
                  className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${previewableLessons.length > 0 ? "opacity-90 group-hover:opacity-100 cursor-pointer" : "opacity-0 hidden"}`}
                  onClick={() => {
                    if (previewableLessons.length > 0) {
                      setPreviewLesson(previewableLessons[0]);
                    }
                  }}
                >
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
                {course.isFree || !course.price ? (
                  <>
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
                          You are enrolled!
                        </div>
                        <Link
                          href={`/my-courses/${course.id}`}
                          className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all text-center text-[16px]"
                        >
                          Go to Study Room
                        </Link>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {enrollmentStatus === "enrolled" ? (
                      <div className="text-center">
                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-emerald-800 text-sm font-semibold flex items-center justify-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-[20px] leading-none text-emerald-600">check_circle</span>
                          You own this course!
                        </div>
                        <Link
                          href={`/my-courses/${course.id}`}
                          className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all text-center text-[16px] mb-4"
                        >
                          Go to Study Room
                        </Link>
                      </div>
                    ) : isAlreadyInCart ? (
                      <Link
                        href="/cart"
                        className="block w-full bg-emerald-600 text-white py-3.5 rounded-lg font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all text-center text-[16px]"
                      >
                        Go to Cart
                      </Link>
                    ) : (
                      <button
                        onClick={handleAddToCart}
                        disabled={isAddingToCart}
                        className="w-full bg-brand-primary text-white py-3.5 rounded-lg font-semibold hover:bg-brand-hover active:scale-[0.98] transition-all duration-200 shadow-sm text-[16px] flex items-center justify-center gap-2"
                      >
                        {isAddingToCart ? (
                          <>
                            <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Adding to Cart...
                          </>
                        ) : (
                          session ? "Add to Cart" : "Sign In to Buy"
                        )}
                      </button>
                    )}
                  </>
                )}

                {/* Bookmark Action */}
                {enrollmentStatus !== "enrolled" && (
                  <button
                    onClick={handleBookmarkToggle}
                    className={`w-full mt-3 border py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all active:scale-[0.98] duration-200 text-sm ${isFavorite
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

      {/* Lesson Preview Modal */}
      {previewLesson && (
        <LessonPreviewModal
          lessonId={previewLesson.id}
          lessonTitle={previewLesson.title}
          resourceType={previewLesson.resourceType}
          courseTitle={course.title}
          previewableLessons={previewableLessons}
          onSelectLesson={(lesson) => setPreviewLesson(lesson)}
          onClose={() => setPreviewLesson(null)}
        />
      )}
    </div>
  );
}
