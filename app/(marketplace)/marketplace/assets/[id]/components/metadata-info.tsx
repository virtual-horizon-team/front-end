"use client";

import React from "react";
import { Globe, EyeOff, Trash2, FolderOpen, Loader2, Sparkles, ShoppingCart } from "lucide-react";

interface AssetDisplayDto {
  assetID: string;
  fileName: string;
  description: string;
  price: number;
  isFree: boolean;
  isListedInStore: boolean;
  userId?: string;
  ownerName?: string;
  ownerBio?: string | null;
  ownerAvatarUrl?: string | null;
}

interface MetadataInfoProps {
  asset: AssetDisplayDto;
  categoryName: string;
  isOwner: boolean;
  isBuyer: boolean;
  isInCart: boolean;
  onToggleListing: () => void;
  onDeleteAsset: () => void;
  actionLoading: boolean;
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (val: boolean) => void;
  onPurchaseMock: () => void;
}

export default function MetadataInfo({
  asset,
  categoryName,
  isOwner,
  isBuyer,
  isInCart,
  onToggleListing,
  onDeleteAsset,
  actionLoading,
  showDeleteConfirm,
  setShowDeleteConfirm,
  onPurchaseMock
}: MetadataInfoProps) {
  return (
    <div className="bg-[#121826] border border-marketplace-border p-6 rounded-2xl space-y-6">
      {/* Meta details list */}
      <div className="space-y-4">
        <div>
          <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest mb-1">Price</h3>
          <div className="text-3xl font-extrabold text-white">
            {asset.isFree ? "FREE" : `$${asset.price.toFixed(2)}`}
          </div>
        </div>

        <div className="space-y-3 py-4 border-y border-marketplace-border/60">
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider">Category</span>
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <FolderOpen className="w-3.5 h-3.5 text-marketplace-primary" />
              {categoryName}
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="font-extrabold text-slate-500 uppercase tracking-wider">Publisher</span>
            <span className="font-bold text-slate-300 truncate max-w-[160px]" title={asset.userId}>
              {asset.ownerName || (asset.userId ? `User: ${asset.userId.slice(0, 8)}...` : "System")}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="space-y-3">
        {isOwner ? (
          <>
            <button
              onClick={onToggleListing}
              disabled={actionLoading}
              className={`w-full py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                asset.isListedInStore
                  ? "bg-amber-500/10 border border-amber-500/20 text-amber-400"
                  : "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              }`}
            >
              {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {asset.isListedInStore ? (
                <>
                  <EyeOff className="w-4 h-4" /> Unlist from Store
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" /> List in Store
                </>
              )}
            </button>

            {showDeleteConfirm ? (
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
                <p className="text-xs font-bold text-red-400">Are you sure? This action is permanent and cannot be undone.</p>
                <div className="flex gap-2">
                  <button
                    onClick={onDeleteAsset}
                    disabled={actionLoading}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg text-xs font-extrabold cursor-pointer disabled:opacity-50"
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white/5 border border-marketplace-border text-slate-300 py-2 rounded-lg text-xs font-extrabold cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full bg-red-500/10 text-red-400 border border-red-500/20 py-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Delete Asset Blueprint
              </button>
            )}
          </>
        ) : isBuyer ? (
          <div className="w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" /> Added to Library
          </div>
        ) : isInCart ? (
          <button
            onClick={onPurchaseMock}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <ShoppingCart className="w-4 h-4" /> Go to Cart
          </button>
        ) : (
          <button
            onClick={onPurchaseMock}
            disabled={actionLoading}
            className="w-full bg-marketplace-primary text-white py-3.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            {actionLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {asset.isFree ? "Add to Library (Free)" : "Add to Cart"}
          </button>
        )}
      </div>

      {/* Additional Technical Attributes */}
      <div className="bg-[#030712] border border-marketplace-border/60 p-4 rounded-xl space-y-2.5 text-xs font-semibold text-slate-500">
        <div className="flex justify-between">
          <span>Format</span>
          <span className="text-slate-300 font-bold">.unitypackage</span>
        </div>
        <div className="flex justify-between">
          <span>File size</span>
          <span className="text-slate-300 font-bold">Dynamic Bundle</span>
        </div>
        <div className="flex justify-between">
          <span>Upload Status</span>
          <span className="text-emerald-400 font-extrabold">Active & Verified</span>
        </div>
      </div>
    </div>
  );
}
