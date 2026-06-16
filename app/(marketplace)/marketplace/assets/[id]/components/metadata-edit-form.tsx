"use client";

import React, { useRef, useState } from "react";
import { Edit, Loader2, DollarSign, Trash2, Download, Plus, Video, X } from "lucide-react";

interface AssetCategoryDto {
  id: string;
  name: string;
}

interface AssetMediaDto {
  assetMediaId: string;
  blobId: string;
  mediaType: number;
  sortOrder: number;
  contentType: string | null;
  sasUrl: string | null;
}

interface EditFormState {
  fileName: string;
  description: string;
  assetType: number;
  price: number;
  isFree: boolean;
  categoryId: string;
  removeVideo: boolean;
}

interface MetadataEditFormProps {
  editForm: EditFormState;
  setEditForm: React.Dispatch<React.SetStateAction<EditFormState>>;
  categories: AssetCategoryDto[];
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  actionLoading: boolean;

  // Existing media props
  thumbnailSasUrl: string | null;
  detailImages: AssetMediaDto[];
  video: AssetMediaDto | null;

  // Kept and newly added files state
  keptDetailImageIds: string[];
  setKeptDetailImageIds: React.Dispatch<React.SetStateAction<string[]>>;
  newDetailFiles: File[];
  setNewDetailFiles: React.Dispatch<React.SetStateAction<File[]>>;
  newVideoFile: File | null;
  setNewVideoFile: React.Dispatch<React.SetStateAction<File | null>>;
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

export default function MetadataEditForm({
  editForm,
  setEditForm,
  categories,
  onSubmit,
  onCancel,
  actionLoading,
  thumbnailSasUrl,
  detailImages,
  video,
  keptDetailImageIds,
  setKeptDetailImageIds,
  newDetailFiles,
  setNewDetailFiles,
  newVideoFile,
  setNewVideoFile
}: MetadataEditFormProps) {
  const imagesInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const [downloadingUrl, setDownloadingUrl] = useState<string | null>(null);

  const triggerDownload = async (url: string, defaultName: string) => {
    setDownloadingUrl(url);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = defaultName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, "_blank");
    } finally {
      setDownloadingUrl(null);
    }
  };

  const handleRemoveExistingImage = (id: string) => {
    setKeptDetailImageIds(prev => prev.filter(x => x !== id));
  };

  const handleRestoreExistingImage = (id: string) => {
    setKeptDetailImageIds(prev => [...prev, id]);
  };

  const handleAddNewImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewDetailFiles(prev => [...prev, ...filesArray]);
    }
  };

  const handleRemoveNewImage = (idx: number) => {
    setNewDetailFiles(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <form onSubmit={onSubmit} className="bg-[#121826] border border-marketplace-border p-6 rounded-2xl space-y-5">
      <h3 className="text-lg font-bold text-white flex items-center gap-2">
        <Edit className="w-5 h-5 text-marketplace-primary" />
        Edit Blueprint Metadata
      </h3>

      {/* File Name */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Asset Name</label>
        <input
          type="text"
          required
          value={editForm.fileName}
          onChange={e => setEditForm({ ...editForm, fileName: e.target.value })}
          className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Description</label>
        <textarea
          rows={4}
          value={editForm.description}
          onChange={e => setEditForm({ ...editForm, description: e.target.value })}
          className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none"
        />
      </div>

      {/* Asset Type */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Asset Type</label>
        <select
          value={editForm.assetType}
          onChange={e => setEditForm({ ...editForm, assetType: Number(e.target.value) })}
          className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer"
        >
          {Object.entries(ASSET_TYPES).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Category</label>
        <select
          value={editForm.categoryId}
          onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
          className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer"
        >
          <option value="">Unassigned</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Price configurations */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Pricing</label>
          <div className="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="isFree"
              checked={editForm.isFree}
              onChange={e => setEditForm({ ...editForm, isFree: e.target.checked, price: e.target.checked ? 0 : editForm.price })}
              className="rounded border-marketplace-border bg-slate-900 text-marketplace-primary focus:ring-marketplace-primary cursor-pointer w-4 h-4"
            />
            <label htmlFor="isFree" className="text-xs font-bold text-slate-300 cursor-pointer">Set as Free</label>
          </div>
        </div>

        {!editForm.isFree && (
          <div className="space-y-1.5">
            <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Price (USD)</label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={editForm.price}
                onChange={e => setEditForm({ ...editForm, price: Math.max(0, Number(e.target.value)) })}
                className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Media Management Section */}
      <div className="border-t border-marketplace-border/50 pt-4 space-y-4">
        <h4 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Asset Media Deck</h4>

        {/* Thumbnail Download */}
        {thumbnailSasUrl && (
          <div className="bg-[#030712]/40 border border-marketplace-border/40 p-3 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img src={thumbnailSasUrl} className="w-12 h-8 object-cover rounded-md" alt="Main Thumb Preview" />
              <span className="text-xs font-bold text-slate-300">Cover Thumbnail</span>
            </div>
            <button
              type="button"
              onClick={() => triggerDownload(thumbnailSasUrl, "thumbnail.png")}
              disabled={downloadingUrl === thumbnailSasUrl}
              className="p-2 bg-white/5 border border-marketplace-border rounded-lg text-slate-400 hover:text-white cursor-pointer"
              title="Download main cover image"
            >
              {downloadingUrl === thumbnailSasUrl ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Existing Detail Images Grid */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Current Detail Images</label>
          {detailImages.length === 0 ? (
            <p className="text-xs font-semibold text-slate-600 italic">No detail images uploaded.</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {detailImages.map((img, idx) => {
                const isKept = keptDetailImageIds.includes(img.assetMediaId);
                return (
                  <div key={img.assetMediaId} className={`relative aspect-video bg-[#030712] rounded-lg border overflow-hidden ${isKept ? "border-marketplace-border" : "border-red-500/50 opacity-40"}`}>
                    {img.sasUrl && (
                      <img src={img.sasUrl} className="w-full h-full object-cover" alt="Detail Image Preview" />
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {isKept ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img.assetMediaId)}
                            className="p-1 bg-red-600 rounded text-white cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          {img.sasUrl && (
                            <button
                              type="button"
                              onClick={() => triggerDownload(img.sasUrl!, `detail_${idx+1}.png`)}
                              className="p-1 bg-slate-800 rounded text-white cursor-pointer"
                              title="Download image"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRestoreExistingImage(img.assetMediaId)}
                          className="px-2 py-0.5 bg-emerald-600 text-[10px] font-bold rounded text-white cursor-pointer"
                          title="Restore image"
                        >
                          Restore
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Newly Added Detail Images */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Add New Detail Images</label>
          <div className="flex flex-wrap gap-2">
            {newDetailFiles.map((file, idx) => (
              <div key={idx} className="relative w-16 h-12 bg-slate-900 border border-marketplace-primary/40 rounded-lg overflow-hidden flex items-center justify-center">
                <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New Upload Preview" />
                <button
                  type="button"
                  onClick={() => handleRemoveNewImage(idx)}
                  className="absolute -top-1 -right-1 bg-red-600 rounded-full p-0.5 text-white cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => imagesInputRef.current?.click()}
              className="w-16 h-12 bg-slate-950/40 border border-dashed border-marketplace-border rounded-lg flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
              title="Add images"
            >
              <Plus className="w-5 h-5" />
            </button>
            <input
              type="file"
              ref={imagesInputRef}
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleAddNewImages}
            />
          </div>
        </div>

        {/* Video Management */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">Demo Video</label>
          
          {video && !editForm.removeVideo && (
            <div className="bg-[#030712]/40 border border-marketplace-border/40 p-3 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Video className="w-5 h-5 text-marketplace-primary" />
                <span className="text-xs font-bold text-slate-300">Active Demo Video</span>
              </div>
              <div className="flex gap-2">
                {video.sasUrl && (
                  <button
                    type="button"
                    onClick={() => triggerDownload(video.sasUrl!, "demo_video.mp4")}
                    className="p-2 bg-white/5 border border-marketplace-border rounded-lg text-slate-400 hover:text-white cursor-pointer"
                    title="Download current video"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setEditForm(prev => ({ ...prev, removeVideo: true }))}
                  className="p-2 bg-red-950/20 border border-red-500/20 rounded-lg text-red-400 hover:text-red-300 cursor-pointer"
                  title="Remove video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {editForm.removeVideo && (
            <div className="bg-red-500/5 border border-red-500/10 p-3 rounded-xl flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 italic">Video will be deleted upon saving.</span>
              <button
                type="button"
                onClick={() => setEditForm(prev => ({ ...prev, removeVideo: false }))}
                className="text-xs font-bold text-slate-300 hover:text-white cursor-pointer"
              >
                Undo Remove
              </button>
            </div>
          )}

          {/* New Video File selector */}
          <div className="flex items-center gap-3">
            {newVideoFile ? (
              <div className="bg-slate-950/40 border border-marketplace-primary/40 p-3 rounded-xl flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-emerald-400 truncate max-w-[200px]">{newVideoFile.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setNewVideoFile(null)}
                  className="text-xs text-red-400 hover:text-red-300 cursor-pointer font-bold"
                >
                  Clear Selection
                </button>
              </div>
            ) : (
              !video || editForm.removeVideo ? (
                <button
                  type="button"
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full bg-slate-950/40 border border-dashed border-marketplace-border py-3 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Add Demo Video (.mp4)
                </button>
              ) : null
            )}
            <input
              type="file"
              ref={videoInputRef}
              accept="video/mp4"
              className="hidden"
              onChange={e => e.target.files?.[0] && setNewVideoFile(e.target.files[0])}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-3 border-t border-marketplace-border/50">
        <button
          type="submit"
          disabled={actionLoading}
          className="flex-1 bg-marketplace-primary text-white py-2.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-white/5 border border-marketplace-border text-slate-300 py-2.5 rounded-xl text-xs font-extrabold cursor-pointer text-center"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
