"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Clock, BookOpen, Sparkles, GraduationCap } from "lucide-react";

interface Instructor {
  id: string;
  fullName: string;
  avatarUrl: string;
  bio: string | null;
  averageRating: number;
}

interface Course {
  id: string;
  title: string;
  subtitle: string | null;
  thumbnailUrl: string;
  price: number;
  currency: string;
  averageRating: number;
  totalReviews: number;
  totalEnrollments: number;
  totalLectures: number;
  totalDurationMinutes: number;
  level: string;
  language: string;
  isFree: boolean;
  hasVRScenarios: boolean;
  instructor: Instructor;
  tags: string[];
  categoryName: string | null;
}

interface HomepageData {
  newestCourses: Course[];
  topRatedCourses: Course[];
  mostPopularCourses: Course[];
}

export default function CourseShowcase() {
  const [data, setData] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"topRated" | "popular" | "newest">("topRated");

  useEffect(() => {
    fetch("https://backend-production-1958b.up.railway.app/api/public/homepage")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: HomepageData) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching homepage courses:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const getActiveCourses = (): Course[] => {
    if (!data) return [];
    if (activeTab === "topRated") return data.topRatedCourses;
    if (activeTab === "popular") return data.mostPopularCourses;
    return data.newestCourses;
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    try {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        maximumFractionDigits: 0,
      }).format(price);
    } catch {
      return `${price} ${currency}`;
    }
  };

  // Helper to render star rating stars
  const renderStars = (rating: number) => {
    const stars = [];
    const floorRating = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-3.5 h-3.5 ${
            i <= floorRating
              ? "text-amber-500 fill-amber-500"
              : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  const activeCourses = getActiveCourses();

  return (
    <section className="bg-gray-50/50 py-20 sm:py-28 px-4 sm:px-6 border-b border-brand-border/40">
      <div className="max-w-7xl mx-auto">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach/60 text-brand-primary rounded-full text-xs font-bold tracking-wider uppercase">
            <GraduationCap className="w-3.5 h-3.5" />
            Curriculum
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Explore Vocational & VR Training Courses
          </h2>
          <p className="text-brand-muted text-base sm:text-lg">
            Acquire high-demand technical skills with our simulated hands-on labs and classroom courses.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab("topRated")}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "topRated"
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                : "bg-white border border-brand-border text-brand-muted hover:text-brand-navy"
            }`}
          >
            Top Rated
          </button>
          <button
            onClick={() => setActiveTab("popular")}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "popular"
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                : "bg-white border border-brand-border text-brand-muted hover:text-brand-navy"
            }`}
          >
            Most Popular
          </button>
          <button
            onClick={() => setActiveTab("newest")}
            className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all cursor-pointer ${
              activeTab === "newest"
                ? "bg-brand-primary text-white shadow-md shadow-brand-primary/25"
                : "bg-white border border-brand-border text-brand-muted hover:text-brand-navy"
            }`}
          >
            Newest Arrivals
          </button>
        </div>

        {/* Dynamic States */}
        {loading ? (
          /* Loading Skeletons */
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl border border-brand-border/40 p-4 space-y-3 animate-pulse w-full sm:w-[280px]">
                <div className="aspect-video bg-gray-200 rounded-xl w-full" />
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="flex gap-2">
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        ) : error || activeCourses.length === 0 ? (
          /* Error or Empty State */
          <div className="text-center py-16 bg-white border border-brand-border/60 rounded-3xl max-w-xl mx-auto shadow-sm">
            <p className="text-brand-muted font-semibold">
              {error ? "Unable to load courses. Please try again later." : "No courses available in this section."}
            </p>
          </div>
        ) : (
          /* Live Course Grid */
          <div className="flex flex-wrap justify-center gap-6">
            {activeCourses.map((course) => (
              <div
                key={course.id}
                className="group bg-white rounded-2xl border border-brand-border/40 overflow-hidden flex flex-col justify-between hover:shadow-lg hover:shadow-black/5 hover:-translate-y-0.5 transition-all duration-300 w-full sm:w-[280px]"
              >
                <div>
                  {/* Thumbnail & Badge */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {course.thumbnailUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-brand-peach/20 to-blue-50/20 flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-brand-muted/40" />
                      </div>
                    )}

                    {/* VR badge */}
                    {course.hasVRScenarios && (
                      <div className="absolute top-3 left-3 bg-brand-primary/95 text-white backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase flex items-center gap-1">
                        <Sparkles className="w-3 h-3 fill-white" />
                        VR Enabled
                      </div>
                    )}
                  </div>

                  {/* Course Details Body */}
                  <div className="p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-gray-100 text-brand-navy rounded-md text-[10px] font-bold uppercase">
                        {course.level}
                      </span>
                      <span className="text-[10px] text-brand-muted font-bold">
                        {course.language}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-extrabold text-brand-navy line-clamp-2 min-h-[44px] leading-snug">
                      {course.title}
                    </h3>

                    {/* Instructor */}
                    <div className="flex items-center gap-2 pt-1">
                      {course.instructor.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={course.instructor.avatarUrl}
                          alt={course.instructor.fullName}
                          className="w-6 h-6 rounded-full object-cover border border-brand-border"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-brand-peach/80 text-brand-primary flex items-center justify-center text-[10px] font-black">
                          {course.instructor.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-[11px] font-bold text-brand-navy">
                        {course.instructor.fullName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="p-4 pt-0 border-t border-brand-border/20 mt-3">
                  <div className="flex items-center justify-between pt-3">
                    {/* Review Rating */}
                    <div className="flex items-center gap-0.5">
                      {renderStars(course.averageRating)}
                      {course.totalReviews > 0 && (
                        <span className="text-[10px] font-bold text-brand-muted ml-1">
                          ({course.totalReviews})
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="text-sm sm:text-base font-black text-brand-navy">
                      {formatPrice(course.price, course.currency)}
                    </div>
                  </div>

                  <Link
                    href={`/courses/${course.id}`}
                    className="w-full mt-3.5 inline-flex items-center justify-center bg-brand-navy hover:bg-brand-primary text-white font-bold py-2.5 px-3 rounded-xl text-xs transition-all duration-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
