"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  Loader2,
  AlertCircle
} from "lucide-react";

// Sub-components
import MediaDeck from "./components/media-deck";
import MetadataInfo from "./components/metadata-info";
import MetadataEditForm from "./components/metadata-edit-form";
import ReviewSection from "./components/review-section";
import Breadcrumbs from "./components/breadcrumbs";
import NotificationAlerts from "./components/notification-alerts";
import AssetHeader from "./components/asset-header";
import AssetDescription from "./components/asset-description";
import ShareAssetCard from "./components/share-asset-card";
import PublisherCard from "./components/publisher-card";
import LinkedContractCard from "./components/linked-contract-card";

interface AssetMediaDto {
  assetMediaId: string;
  blobId: string;
  mediaType: number;
  sortOrder: number;
  contentType: string | null;
  sasUrl: string | null;
}

interface AssetDisplayDto {
  assetID: string;
  fileName: string;
  description: string;
  thumbnailSasUrl: string | null;
  detailImages?: AssetMediaDto[];
  video?: AssetMediaDto | null;
  assetType: number;
  uploadedAt: string;
  price: number;
  isFree: boolean;
  categoryId: string;
  isListedInStore: boolean;
  userId?: string;
  ownerName?: string;
  ownerBio?: string | null;
  ownerAvatarUrl?: string | null;
  milestoneId?: string | null;
  milestoneTitle?: string | null;
  contractId?: string | null;
  contractStatus?: string | number | null;
  jobPostingId?: string | null;
  jobTitle?: string | null;
}

interface AssetCategoryDto {
  id: string;
  name: string;
}

interface AssetReviewDto {
  id: string;
  rating: number;
  comment: string | null;
  reviewerUsername: string;
  createdAt: string;
}

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor: boolean;
  isAdmin: boolean;
}

interface AssetDetailsClientProps {
  assetId: string;
  session?: SessionData;
}

interface AssetMediaUploadSasDto {
  assetMediaId: string;
  blobId: string;
  blobName: string;
  uploadUrl: string;
  expiresAt: string;
}

interface InitiateAssetMediaUploadResponse {
  imageUploads: AssetMediaUploadSasDto[];
  videoUpload?: AssetMediaUploadSasDto | null;
}

const ASSET_TYPES: Record<number, string> = {
  1: "Models",
  2: "Materials",
  3: "Shaders",
  4: "Prefabs",
  5: "Scripts",
  6: "Full Project",
  7: "Audio",
  8: "Texture"
};

export default function AssetDetailsClient({ assetId, session }: AssetDetailsClientProps) {
  const router = useRouter();

  // Core Data State
  const [asset, setAsset] = useState<AssetDisplayDto | null>(null);
  const [categories, setCategories] = useState<AssetCategoryDto[]>([]);
  const [reviews, setReviews] = useState<AssetReviewDto[]>([]);
  const [isBuyer, setIsBuyer] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Edit / Listing Control States
  const [isOwnerMode, setIsOwnerMode] = useState(false);
  const [editForm, setEditForm] = useState({
    fileName: "",
    description: "",
    assetType: 1,
    price: 0,
    isFree: false,
    categoryId: "",
    removeVideo: false
  });

  // Media Editing States
  const [keptDetailImageIds, setKeptDetailImageIds] = useState<string[]>([]);
  const [newDetailFiles, setNewDetailFiles] = useState<File[]>([]);
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Review Submissions state
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  // Fetch all asset information
  const loadAssetDetails = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch asset details
      const assetData = await api<AssetDisplayDto>(`/api/Asset/${assetId}`);
      setAsset(assetData);

      // Initialize edit form with loaded data
      setEditForm({
        fileName: assetData.fileName,
        description: assetData.description || "",
        assetType: assetData.assetType || 1,
        price: assetData.price,
        isFree: assetData.isFree,
        categoryId: assetData.categoryId || "",
        removeVideo: false
      });

      // Initialize kept image IDs list
      if (assetData.detailImages) {
        setKeptDetailImageIds(assetData.detailImages.map(img => img.assetMediaId));
      } else {
        setKeptDetailImageIds([]);
      }
      setNewDetailFiles([]);
      setNewVideoFile(null);

      // 2. Fetch categories
      const categoryData = await api<AssetCategoryDto[]>("/api/Asset/Categories");
      setCategories(categoryData);

      // 3. Fetch reviews
      try {
        const reviewData = await api<AssetReviewDto[]>(`/api/Asset/${assetId}/reviews`);
        setReviews(reviewData);
      } catch (e) {
        setReviews([]);
      }

      // 4. Verify if purchaser/buyer if session exists and user is not owner
      if (session?.userId && session.userId !== assetData.userId) {
        try {
          const purchased = await api<AssetDisplayDto[]>("/api/Asset/purchased");
          const isPurchased = purchased.some(a => a.assetID === assetId);
          setIsBuyer(isPurchased);
        } catch (e) {
          setIsBuyer(false);
        }

        try {
          const cartRes = await api<{ success: boolean; data: { assets: { id: string }[] } }>("/api/Cart?cartType=Asset");
          if (cartRes?.success && cartRes?.data?.assets) {
            const isAssetInCart = cartRes.data.assets.some(a => a.id === assetId);
            setIsInCart(isAssetInCart);
          }
        } catch (e) {
          setIsInCart(false);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load asset details.");
    } finally {
      setLoading(false);
    }
  }, [assetId, session]);

  useEffect(() => {
    loadAssetDetails();
  }, [loadAssetDetails]);

  // Automatically clear action notifications after 5 seconds
  useEffect(() => {
    if (actionSuccess) {
      const timer = setTimeout(() => setActionSuccess(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionSuccess]);

  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  // Handle Metadata Updates
  const handleUpdateMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    setActionSuccess(null);
    setActionLoading(true);

    try {
      let finalDetailImageIds = [...keptDetailImageIds];
      let finalVideoId: string | null = asset?.video?.assetMediaId || null;

      // 1. If there are new detail images or video files, request SAS URLs & upload
      if (newDetailFiles.length > 0 || newVideoFile !== null) {
        const mediaUploadUrls = await api<InitiateAssetMediaUploadResponse>(
          `/api/Asset/${assetId}/Media/Upload-Urls`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              imageCount: newDetailFiles.length,
              includeVideo: newVideoFile !== null,
              videoContentType: newVideoFile ? newVideoFile.type : null
            })
          }
        );

        // Upload detail images to storage
        if (newDetailFiles.length > 0 && mediaUploadUrls.imageUploads) {
          for (let i = 0; i < newDetailFiles.length; i++) {
            const file = newDetailFiles[i];
            const sas = mediaUploadUrls.imageUploads[i];
            if (sas) {
              await fetch(sas.uploadUrl, {
                method: "PUT",
                headers: {
                  "x-ms-blob-type": "BlockBlob",
                  "Content-Type": file.type
                },
                body: file
              });
              finalDetailImageIds.push(sas.assetMediaId);
            }
          }
        }

        // Upload video file to storage
        if (newVideoFile && mediaUploadUrls.videoUpload) {
          const sas = mediaUploadUrls.videoUpload;
          await fetch(sas.uploadUrl, {
            method: "PUT",
            headers: {
              "x-ms-blob-type": "BlockBlob",
              "Content-Type": newVideoFile.type
            },
            body: newVideoFile
          });
          finalVideoId = sas.assetMediaId;
        }
      }

      // 2. Submit metadata changes payload
      const payload = {
        fileName: editForm.fileName,
        description: editForm.description,
        assetType: Number(editForm.assetType),
        price: editForm.isFree ? 0 : Number(editForm.price),
        isFree: editForm.isFree,
        categoryId: editForm.categoryId || "00000000-0000-0000-0000-000000000000",
        detailImageIds: finalDetailImageIds,
        videoId: finalVideoId,
        removeVideo: editForm.removeVideo
      };

      const updatedAsset = await api<AssetDisplayDto>(`/api/Asset/Update/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      setAsset(updatedAsset);
      setActionSuccess("Asset metadata and media deck updated successfully.");
      
      // Reload details to obtain new SAS URLs
      await loadAssetDetails();
      setIsOwnerMode(false); // Return to display mode
    } catch (err: any) {
      setActionError(err.message || "Failed to update asset metadata.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Store Listing (List / Unlist)
  const handleToggleListing = async () => {
    if (!asset) return;
    setActionError(null);
    setActionSuccess(null);
    setActionLoading(true);

    try {
      if (asset.isListedInStore) {
        // Unlist
        await api(`/api/Asset/Store/Unlist/${assetId}`, { method: "DELETE" });
        setAsset(prev => prev ? { ...prev, isListedInStore: false } : null);
        setActionSuccess("Asset unlisted from store.");
      } else {
        // List in store using current price/category
        if (!editForm.categoryId) {
          throw new Error("Please assign a category in the Edit tab before listing.");
        }
        const payload = {
          price: editForm.isFree ? 0 : Number(editForm.price),
          isFree: editForm.isFree,
          categoryId: editForm.categoryId
        };
        await api(`/api/Asset/Store/List/${assetId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        setAsset(prev => prev ? { ...prev, isListedInStore: true, price: payload.price, isFree: payload.isFree, categoryId: payload.categoryId } : null);
        setActionSuccess("Asset listed in store successfully.");
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to toggle store listing status.");
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Asset
  const handleDeleteAsset = async () => {
    setActionError(null);
    setActionLoading(true);

    try {
      await api(`/api/Asset/Delete/${assetId}`, { method: "DELETE" });
      router.push("/marketplace/assets/my");
    } catch (err: any) {
      setActionError(err.message || "Failed to delete asset. Ensure there are no active buyers.");
      setShowDeleteConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Review
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError(null);
    setReviewSubmitting(true);

    try {
      const reviewDto = await api<AssetReviewDto>(`/api/Asset/${assetId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rating: Number(newReview.rating),
          comment: newReview.comment
        })
      });

      setReviews(prev => [reviewDto, ...prev]);
      setNewReview({ rating: 5, comment: "" });
    } catch (err: any) {
      setReviewError(err.message || "Failed to submit review.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Real Purchase action
  const handlePurchaseAsset = async () => {
    if (!asset) return;

    if (isInCart) {
      router.push("/marketplace/cart");
      return;
    }

    setActionError(null);
    setActionSuccess(null);
    setActionLoading(true);
    try {
      if (asset.isFree) {
        // Free asset — claim directly
        await api(`/api/Asset/Store/Claim/${assetId}`, { method: "POST" });
        setIsBuyer(true);
        setActionSuccess("Asset added to your library!");
      } else {
        // Paid asset — add to cart
        await api(`/api/Cart/assets`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assetId })
        });
        setIsInCart(true);
        window.dispatchEvent(new Event("cart-updated"));
        setActionSuccess("Asset added to cart successfully!");
      }
    } catch (e: any) {
      setActionError(e.message || "Failed to process request. Please try again.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-marketplace-primary animate-spin" />
          <span className="text-sm font-bold text-slate-400">Loading asset layout...</span>
        </div>
      </div>
    );
  }

  if (errorMsg || !asset) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center px-4">
        <div className="bg-[#121826]/80 border border-marketplace-border p-8 rounded-2xl max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-marketplace-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Error Loading Asset</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg || "Asset details could not be found."}</p>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 bg-marketplace-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold"
          >
            Back to Store
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = session?.userId ? asset.userId === session.userId : false;
  const activeCategory = categories.find(c => c.id === asset.categoryId);

  return (
    <div className="min-h-screen bg-[#090d16] py-12 px-4 sm:px-6 lg:px-8 text-slate-200">
      <div className="mx-auto space-y-8" style={{ maxWidth: "85rem" }}>
        
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs fileName={asset.fileName} isOwner={isOwner} />

        {/* Global Notifications */}
        <NotificationAlerts success={actionSuccess} error={actionError} />

        {/* Header Title Section */}
        <AssetHeader
          fileName={asset.fileName}
          assetType={asset.assetType}
          uploadedAt={asset.uploadedAt}
          isListedInStore={asset.isListedInStore}
          isOwner={isOwner}
          isOwnerMode={isOwnerMode}
          setIsOwnerMode={setIsOwnerMode}
        />

        {/* Main Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Media Presentation Viewport */}
          <div className="lg:col-span-7 space-y-4">
            <MediaDeck
              thumbnailUrl={asset.thumbnailSasUrl}
              detailImages={asset.detailImages}
              video={asset.video}
              fileName={asset.fileName}
            />

            {/* Asset Description */}
            <AssetDescription description={asset.description} />

            {/* Publisher Info Section */}
            <PublisherCard
              ownerName={asset.ownerName}
              ownerBio={asset.ownerBio}
              ownerAvatarUrl={asset.ownerAvatarUrl}
            />

            {/* Linked Contract Info (if asset delivered to a milestone) */}
            {asset.milestoneId && asset.contractId && asset.jobPostingId && asset.jobTitle && asset.milestoneTitle && (
              <LinkedContractCard
                milestoneId={asset.milestoneId}
                milestoneTitle={asset.milestoneTitle}
                contractId={asset.contractId}
                contractStatus={asset.contractStatus ?? 0}
                jobPostingId={asset.jobPostingId}
                jobTitle={asset.jobTitle}
              />
            )}
          </div>

          {/* Right Column: Information & Controls Board */}
          <div className="lg:col-span-5 space-y-6">
            
            {isOwner && isOwnerMode ? (
              <MetadataEditForm
                editForm={editForm}
                setEditForm={setEditForm}
                categories={categories}
                onSubmit={handleUpdateMetadata}
                onCancel={() => setIsOwnerMode(false)}
                actionLoading={actionLoading}
                
                thumbnailSasUrl={asset.thumbnailSasUrl}
                detailImages={asset.detailImages || []}
                video={asset.video || null}
                
                keptDetailImageIds={keptDetailImageIds}
                setKeptDetailImageIds={setKeptDetailImageIds}
                newDetailFiles={newDetailFiles}
                setNewDetailFiles={setNewDetailFiles}
                newVideoFile={newVideoFile}
                setNewVideoFile={setNewVideoFile}
              />
            ) : (
              <MetadataInfo
                asset={asset}
                categoryName={activeCategory ? activeCategory.name : "Unassigned"}
                isOwner={isOwner}
                isBuyer={isBuyer}
                isInCart={isInCart}
                onToggleListing={handleToggleListing}
                onDeleteAsset={handleDeleteAsset}
                actionLoading={actionLoading}
                showDeleteConfirm={showDeleteConfirm}
                setShowDeleteConfirm={setShowDeleteConfirm}
                onPurchaseMock={handlePurchaseAsset}
              />
            )}

            {isOwner && (
              <ShareAssetCard assetId={assetId} />
            )}

            {/* Reviews Section */}
            <ReviewSection
              reviews={reviews}
              isBuyer={isBuyer}
              newReview={newReview}
              setNewReview={setNewReview}
              onSubmitReview={handleSubmitReview}
              reviewSubmitting={reviewSubmitting}
              reviewError={reviewError}
            />

          </div>
        </div>

      </div>
    </div>
  );
}
