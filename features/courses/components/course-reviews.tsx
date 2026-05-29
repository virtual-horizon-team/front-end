"use client";

import { useState, useEffect } from "react";
import { API_BASE_URL } from "@/lib/config";
import { CourseReviewDto, PagedResult } from "../types";

/** Read a cookie by name on the client side */
function getClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
}

interface CourseReviewsProps {
  courseId: string;
  session: SessionData | null;
  isEnrolled?: boolean | null;
  initialReviews?: CourseReviewDto[]; // Fallback or summary
  courseRating: number;
  courseTotalReviews: number;
}

export default function CourseReviews({ courseId, session, isEnrolled, initialReviews, courseRating, courseTotalReviews }: CourseReviewsProps) {
  // Public paginated reviews
  const [reviews, setReviews] = useState<CourseReviewDto[]>([]);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);

  // User's own review
  const [userReview, setUserReview] = useState<CourseReviewDto | null>(null);
  const [isLoadingUserReview, setIsLoadingUserReview] = useState(false);

  // Form state
  const [isEditing, setIsEditing] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [commentInput, setCommentInput] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews(1);
    if (session && isEnrolled) {
      fetchUserReview();
    } else {
      setIsLoadingUserReview(false);
    }
  }, [courseId, session, isEnrolled]);

  const fetchReviews = async (page: number) => {
    setIsLoadingReviews(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/public/courses/${courseId}/reviews?pageNumber=${page}&pageSize=10`);
      if (res.ok) {
        const data: PagedResult<CourseReviewDto> = await res.json();
        if (page === 1) {
          setReviews(data.items);
        } else {
          setReviews(prev => [...prev, ...data.items]);
        }
        setTotalPages(data.totalPages);
        setPageNumber(page);
      }
    } catch (error) {
      console.error("Failed to fetch public reviews", error);
    } finally {
      setIsLoadingReviews(false);
    }
  };

  const fetchUserReview = async () => {
    setIsLoadingUserReview(true);
    try {
      const token = getClientCookie("access_token");
      const res = await fetch(`${API_BASE_URL}/api/my-courses/${courseId}/review`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        if (res.status === 200) {
          const data: CourseReviewDto = await res.json();
          setUserReview(data);
          setRatingInput(data.rating);
          setCommentInput(data.comment || "");
        } else if (res.status === 204) {
          setUserReview(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user review", error);
    } finally {
      setIsLoadingUserReview(false);
    }
  };

  const handleLoadMore = () => {
    if (pageNumber < totalPages) {
      fetchReviews(pageNumber + 1);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const token = getClientCookie("access_token");
      if (!token) throw new Error("Not logged in");

      const method = userReview ? "PUT" : "POST";
      const res = await fetch(`${API_BASE_URL}/api/my-courses/${courseId}/review`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: ratingInput,
          comment: commentInput.trim() || undefined
        })
      });

      if (res.ok) {
        const updatedReview: CourseReviewDto = await res.json();
        setUserReview(updatedReview);
        setIsEditing(false);
        // Refresh public reviews to show changes
        fetchReviews(1);
      } else {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Failed to submit review");
      }
    } catch (error: any) {
      console.error("Submit review error:", error);
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async () => {
    if (!confirm("Are you sure you want to delete your review?")) return;
    
    setIsSubmitting(true);
    try {
      const token = getClientCookie("access_token");
      const res = await fetch(`${API_BASE_URL}/api/my-courses/${courseId}/review`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok || res.status === 204) {
        setUserReview(null);
        setRatingInput(5);
        setCommentInput("");
        setIsEditing(false);
        fetchReviews(1);
      } else {
        throw new Error("Failed to delete review");
      }
    } catch (error: any) {
      console.error("Delete review error:", error);
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRatingInput = () => (
    <div className="flex gap-1 mb-4">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRatingInput(star)}
          className={`material-symbols-outlined text-[28px] focus:outline-none transition-transform hover:scale-110 ${
            star <= ratingInput ? "text-yellow-400" : "text-slate-300"
          }`}
          style={{ fontVariationSettings: star <= ratingInput ? "'FILL' 1" : "'FILL' 0" }}
        >
          star
        </button>
      ))}
    </div>
  );

  return (
    <div className="bg-white p-6 md:p-8 rounded-xl border border-brand-border shadow-sm space-y-10 animate-fade-in">
      {/* Header section */}
      <div>
        <h2 className="font-serif text-[24px] text-brand-navy font-normal mb-2">Student Reviews</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center text-yellow-400">
            <span className="material-symbols-outlined text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
            <span className="font-bold text-brand-navy text-xl ml-1">{courseRating.toFixed(1)}</span>
          </div>
          <span className="text-brand-muted font-medium">• {courseTotalReviews} total reviews</span>
        </div>
      </div>

      {/* User Review Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-brand-border">
        {!session ? (
          <div className="text-center py-4">
            <h3 className="font-semibold text-brand-navy mb-2">Want to leave a review?</h3>
            <p className="text-sm text-brand-muted mb-4">You need to sign in and enroll in the course to leave a review.</p>
            <a href={`/login?redirect=/courses/${courseId}`} className="inline-block bg-brand-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-hover transition-colors shadow-sm">
              Sign In
            </a>
          </div>
        ) : !isEnrolled ? (
          <div className="text-center py-4">
            <h3 className="font-semibold text-brand-navy mb-2">Enroll to leave a review</h3>
            <p className="text-sm text-brand-muted">You must be enrolled in this course to share your experience.</p>
          </div>
        ) : isLoadingUserReview ? (
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-20 bg-slate-200 rounded w-full"></div>
          </div>
        ) : userReview && !isEditing ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-semibold text-brand-navy">Your Review</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover transition-colors"
                >
                  Edit
                </button>
                <button 
                  onClick={handleDeleteReview}
                  disabled={isSubmitting}
                  className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="flex text-yellow-400 mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className="material-symbols-outlined text-[18px]"
                  style={{ fontVariationSettings: star <= userReview.rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-[15px] text-brand-text leading-relaxed whitespace-pre-line">
              {userReview.comment || <span className="text-brand-muted italic">No comment provided.</span>}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-brand-navy">{userReview ? "Edit Your Review" : "Write a Review"}</h3>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={() => setIsEditing(false)}
                  className="text-sm font-semibold text-brand-muted hover:text-brand-text transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
            
            <StarRatingInput />
            
            <div className="mb-4 relative">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Share your learning experience (optional)"
                className="w-full border border-brand-border rounded-lg p-3 text-[15px] text-brand-text bg-white focus:outline-none focus:border-brand-primary min-h-[120px] resize-y"
                maxLength={2000}
              />
              <div className={`absolute bottom-3 right-3 text-xs ${commentInput.length > 1900 ? "text-red-500" : "text-brand-muted"}`}>
                {commentInput.length} / 2000
              </div>
            </div>

            {submitError && (
              <div className="mb-4 text-sm text-red-500 bg-red-50 p-3 rounded-lg border border-red-200">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-primary text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-brand-hover active:scale-95 transition-all shadow-sm flex items-center justify-center min-w-[120px]"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              ) : (
                "Submit Review"
              )}
            </button>
          </form>
        )}
      </div>

      {/* Public Reviews List */}
      <div>
        <h3 className="font-semibold text-brand-navy mb-6">Recent Reviews</h3>
        
        {isLoadingReviews && reviews.length === 0 ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-4 p-5 border border-brand-border rounded-xl">
                <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-1/4"></div>
                  <div className="h-3 bg-slate-200 rounded w-24"></div>
                  <div className="h-16 bg-slate-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="p-5 border border-brand-border rounded-xl bg-white hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    {review.studentAvatarUrl || review.userAvatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="w-10 h-10 rounded-full object-cover"
                        src={review.studentAvatarUrl || review.userAvatarUrl || ""}
                        alt={review.studentName || review.userName || "User"}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-brand-peach text-brand-primary flex items-center justify-center font-bold">
                        {(review.studentName || review.userName || "U").slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-brand-text text-sm">{review.studentName || review.userName}</p>
                      <div className="flex text-yellow-400 mt-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className="material-symbols-outlined text-[14px]"
                            style={{ fontVariationSettings: star <= review.rating ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            star
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-brand-muted whitespace-nowrap">
                    {new Date(review.updatedAt || review.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>
                {review.comment && (
                  <p className="text-[15px] text-brand-muted leading-relaxed">
                    {review.comment}
                  </p>
                )}
              </div>
            ))}

            {pageNumber < totalPages && (
              <div className="text-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingReviews}
                  className="px-6 py-2.5 border border-brand-border rounded-lg font-semibold text-brand-primary hover:bg-brand-soft transition-colors inline-flex items-center gap-2"
                >
                  {isLoadingReviews ? (
                    <>
                      <span className="w-4 h-4 border-2 border-brand-primary border-t-transparent rounded-full animate-spin"></span>
                      Loading...
                    </>
                  ) : "Load More Reviews"}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12 px-6 border border-dashed border-brand-border rounded-xl">
            <span className="material-symbols-outlined text-brand-primary text-5xl mb-4 leading-none opacity-50">rate_review</span>
            <h3 className="font-serif text-lg text-brand-navy font-normal mb-2">No reviews yet</h3>
            <p className="text-sm text-brand-muted max-w-sm mx-auto">
              There are no reviews for this course yet. Be the first to share your learning experience!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
