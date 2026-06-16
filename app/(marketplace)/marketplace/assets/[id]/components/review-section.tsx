"use client";

import React from "react";
import { Star, Loader2 } from "lucide-react";

interface AssetReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  reviewerUsername: string;
  createdAt: string;
}

interface NewReviewState {
  rating: number;
  comment: string;
}

interface ReviewSectionProps {
  reviews: AssetReviewDto[];
  isBuyer: boolean;
  newReview: NewReviewState;
  setNewReview: React.Dispatch<React.SetStateAction<NewReviewState>>;
  onSubmitReview: (e: React.FormEvent) => void;
  reviewSubmitting: boolean;
  reviewError: string | null;
}

export default function ReviewSection({
  reviews,
  isBuyer,
  newReview,
  setNewReview,
  onSubmitReview,
  reviewSubmitting,
  reviewError
}: ReviewSectionProps) {
  return (
    <div className="bg-[#121826] border border-marketplace-border p-6 rounded-2xl space-y-6">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
        Asset Reviews ({reviews.length})
      </h3>

      {/* Review submit form — only for buyers */}
      {isBuyer && (
        <form onSubmit={onSubmitReview} className="space-y-4 border-b border-marketplace-border/50 pb-6">
          <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Leave a Review</h4>

          {reviewError && (
            <p className="text-xs font-bold text-red-400">{reviewError}</p>
          )}

          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400 font-bold">Rating:</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map(stars => (
                <button
                  key={`form-star-${stars}`}
                  type="button"
                  onClick={() => setNewReview({ ...newReview, rating: stars })}
                  className="focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-5 h-5 ${
                      stars <= newReview.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <textarea
            required
            rows={2}
            placeholder="Share your thoughts about this asset package..."
            value={newReview.comment}
            onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
            className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-xs focus:outline-none transition-colors resize-none text-slate-200"
          />

          <button
            type="submit"
            disabled={reviewSubmitting}
            className="w-full bg-marketplace-primary text-white py-2 rounded-lg text-xs font-extrabold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {reviewSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
            Submit Review
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-marketplace-border">
        {reviews.length === 0 ? (
          <p className="text-xs font-semibold text-slate-500 italic py-4 text-center">
            No reviews submitted for this package.
          </p>
        ) : (
          reviews.map((rev, idx) => {
            // Use index fallback in case id is missing/null
            const rowKey = rev.id ? rev.id : `review-idx-${idx}`;
            return (
              <div key={rowKey} className="bg-[#030712]/40 border border-marketplace-border/40 p-4 rounded-xl space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-extrabold text-white">{rev.reviewerUsername}</span>
                  <span className="text-[10px] text-slate-600 font-bold">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(stars => (
                    <Star
                      key={`${rowKey}-star-${stars}`}
                      className={`w-3.5 h-3.5 ${
                        stars <= rev.rating ? "text-amber-400 fill-amber-400" : "text-slate-700"
                      }`}
                    />
                  ))}
                </div>
                {rev.comment && (
                  <p className="text-xs font-medium text-slate-400 leading-relaxed">{rev.comment}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
