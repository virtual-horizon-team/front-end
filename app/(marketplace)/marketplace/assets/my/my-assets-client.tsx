"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import {
  Sparkles,
  Box,
  Cpu,
  Workflow,
  Search,
  Edit,
  Trash2,
  Globe,
  EyeOff,
  ExternalLink,
  X,
  Loader2,
  CheckCircle,
  AlertCircle,
  Filter,
  Plus,
  UploadCloud,
  Layers,
  HelpCircle,
  Settings,
  Eye,
  Share2,
  Clock,
  User
} from "lucide-react";

interface DetailImage {
  id: string;
  url: string;
  mediaType: string;
}

interface DemoVideo {
  id: string;
  url: string;
  mediaType: string;
}

interface AssetDisplayDto {
  assetID: string;
  fileName: string;
  description: string;
  thumbnailSasUrl: string | null;
  detailImages?: DetailImage[];
  video?: DemoVideo | null;
  assetType: number;
  uploadedAt: string;
  price: number;
  isFree: boolean;
  categoryId: string;
  isListedInStore: boolean;
}

interface CategoryTreeNode {
  id: string;
  name: string;
  children: CategoryTreeNode[];
}

interface FlatCategory {
  id: string;
  name: string;
}

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor: boolean;
  isAdmin: boolean;
}

interface PreviewAssetDto {
  assetPreviewId: string;
  assetId: string;
  assetName: string;
  description?: string | null;
  sharedByUsername: string;
  expiryDate: string;
  sharedDate: string;
  isExpired: boolean;
  thumbnailUrl: string;
  milestoneId?: string | null;
  daysValid?: number | null;
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

export default function MyAssetsClient({ session }: { session: SessionData }) {
  // Tabs and lists
  const [activeTab, setActiveTab] = useState<string>("All"); // All, Interactive, Environment, Group, Purchased, Preview
  const [assets, setAssets] = useState<AssetDisplayDto[]>([]);
  const [previewAssets, setPreviewAssets] = useState<PreviewAssetDto[]>([]);
  const [purchasedAssetIds, setPurchasedAssetIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<FlatCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [listingFilter, setListingFilter] = useState<"all" | "listed" | "unlisted">("all");

  // Modals state
  const [editingAsset, setEditingAsset] = useState<AssetDisplayDto | null>(null);
  const [listingAsset, setListingAsset] = useState<AssetDisplayDto | null>(null);
  const [deletingAsset, setDeletingAsset] = useState<AssetDisplayDto | null>(null);
  
  // Form state
  const [editForm, setEditForm] = useState({
    fileName: "",
    description: "",
    assetType: 1,
    price: 0,
    isFree: false,
    categoryId: "",
    removeVideo: false
  });

  const [listForm, setListForm] = useState({
    price: 0,
    isFree: false,
    categoryId: ""
  });

  const [formLoading, setFormLoading] = useState<boolean>(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const data = await api<FlatCategory[]>("/api/Asset/Categories");
      setCategories(data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  }, []);

  // Fetch assets based on activeTab
  const loadAssets = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (activeTab === "Preview") {
        // Fetch preview assets shared with user
        const previewData = await api<PreviewAssetDto[]>("/api/Asset/Preview/Display");
        setPreviewAssets(previewData || []);
        setAssets([]);
      } else {
        // 1. Fetch purchased assets first to identify ownership
        const purchased = await api<AssetDisplayDto[]>("/api/Asset/purchased");
        const purchasedIds = new Set(purchased.map(a => a.assetID));
        setPurchasedAssetIds(purchasedIds);

        // 2. Fetch based on selected tab
        if (activeTab === "Purchased") {
          setAssets(purchased);
        } else {
          const displayData = await api<AssetDisplayDto[]>(`/api/Asset/Display?displayMode=${activeTab}`);
          setAssets(displayData);
        }
        setPreviewAssets([]);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load assets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadAssets();
    fetchCategories();
  }, [loadAssets, fetchCategories]);

  // Handle Edit modal open
  const openEditModal = (asset: AssetDisplayDto) => {
    setActionError(null);
    setActionSuccess(null);
    setEditingAsset(asset);
    setEditForm({
      fileName: asset.fileName,
      description: asset.description || "",
      assetType: asset.assetType || 1,
      price: asset.price || 0,
      isFree: asset.isFree || false,
      categoryId: asset.categoryId || "",
      removeVideo: false
    });
  };

  // Submit Edit Metadata
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset) return;
    setFormLoading(true);
    setActionError(null);
    
    try {
      const payload = {
        fileName: editForm.fileName,
        description: editForm.description,
        assetType: Number(editForm.assetType),
        price: editForm.isFree ? 0 : Number(editForm.price),
        isFree: editForm.isFree,
        categoryId: editForm.categoryId || "00000000-0000-0000-0000-000000000000",
        removeVideo: editForm.removeVideo
      };

      const updated = await api<AssetDisplayDto>(`/api/Asset/Update/${editingAsset.assetID}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      // Update local state
      setAssets(prev => prev.map(a => a.assetID === updated.assetID ? { ...a, ...updated } : a));
      setActionSuccess("Asset metadata updated successfully!");
      setTimeout(() => setEditingAsset(null), 1000);
    } catch (err: any) {
      setActionError(err.message || "Failed to update asset.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Listing request
  const handleListSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listingAsset) return;
    setFormLoading(true);
    setActionError(null);

    try {
      const payload = {
        price: listForm.isFree ? 0 : Number(listForm.price),
        isFree: listForm.isFree,
        categoryId: listForm.categoryId
      };

      await api(`/api/Asset/Store/List/${listingAsset.assetID}`, {
        method: "POST",
        body: JSON.stringify(payload)
      });

      // Update local state listing status (we can add a client-side tag or refetch)
      setActionSuccess("Asset successfully listed in store!");
      setTimeout(() => {
        setListingAsset(null);
        loadAssets();
      }, 1000);
    } catch (err: any) {
      setActionError(err.message || "Failed to list asset.");
    } finally {
      setFormLoading(false);
    }
  };

  // Unlist Asset
  const handleUnlist = async (asset: AssetDisplayDto) => {
    if (!confirm(`Are you sure you want to unlist "${asset.fileName}" from the public store?`)) return;
    try {
      await api(`/api/Asset/Store/Unlist/${asset.assetID}`, {
        method: "DELETE"
      });
      alert("Asset unlisted successfully!");
      loadAssets();
    } catch (err: any) {
      alert(err.message || "Failed to unlist asset.");
    }
  };

  // Delete Asset
  const handleDelete = async () => {
    if (!deletingAsset) return;
    setFormLoading(true);
    setActionError(null);

    try {
      await api(`/api/Asset/Delete/${deletingAsset.assetID}`, {
        method: "DELETE"
      });
      // Remove from list
      setAssets(prev => prev.filter(a => a.assetID !== deletingAsset.assetID));
      setDeletingAsset(null);
      alert("Asset deleted successfully!");
    } catch (err: any) {
      // Intercept and print warning for active buyers
      setActionError(err.message || "Failed to delete asset.");
    } finally {
      setFormLoading(false);
    }
  };

  // Filtered Assets list
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (asset.description && asset.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = typeFilter === "All" || asset.assetType === Number(typeFilter);
    const matchesListing =
      listingFilter === "all" ||
      (listingFilter === "listed" && asset.isListedInStore) ||
      (listingFilter === "unlisted" && !asset.isListedInStore);
    return matchesSearch && matchesType && matchesListing;
  });

  return (
    <div className="mx-auto px-6 py-12 relative z-10 flex-grow w-full" style={{ maxWidth: "85rem" }}>
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-marketplace-primary/10 border border-marketplace-primary/20 text-[11px] font-bold text-marketplace-primary rounded-full uppercase tracking-wider mb-3 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" />
            Creator Sandbox
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            My Asset Vault
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            Review your inventory, edit blueprints, and list simulation models onto the global Marketplace.
          </p>
        </div>
        <Link
          href="/marketplace/assets/upload"
          className="bg-marketplace-primary text-white text-sm font-extrabold px-6 py-3 rounded-full flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-red-900/10 cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          Publish New Asset
        </Link>
      </div>

      {/* Tab Selectors */}
      <div className="border-b border-marketplace-border flex flex-wrap gap-2 mb-8">
        {[
          { id: "All", name: "All Assets", icon: Box },
          { id: "Interactive", name: "Interactive", icon: Cpu },
          { id: "Environment", name: "Environments", icon: Layers },
          { id: "Group", name: "Groups", icon: Workflow },
          { id: "Purchased", name: "Purchased Inventory", icon: HelpCircle },
          { id: "Preview", name: "Preview Assets", icon: Eye }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setTypeFilter("All");
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? "border-marketplace-primary text-marketplace-primary"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Icon className="w-4.5 h-4.5" />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 mb-8">
        {/* Row 1: Search + Type */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by file name or description..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-marketplace-soft border border-marketplace-border rounded-xl pl-11 pr-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-marketplace-primary transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 bg-marketplace-soft border border-marketplace-border rounded-xl px-4 py-3 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer font-medium"
            >
              <option value="All" className="bg-[#0f172a]">All Types</option>
              {Object.entries(ASSET_TYPES).map(([val, label]) => (
                <option key={val} value={val} className="bg-[#0f172a]">
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Store listing filter pills */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Store Status:
          </span>
          <div className="flex gap-1.5">
            {([
              { value: "all",      label: "All",      icon: <Layers className="w-3 h-3" /> },
              { value: "listed",   label: "Listed",   icon: <Globe className="w-3 h-3" /> },
              { value: "unlisted", label: "Unlisted", icon: <EyeOff className="w-3 h-3" /> }
            ] as const).map(opt => (
              <button
                key={opt.value}
                onClick={() => setListingFilter(opt.value)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold border transition-all cursor-pointer ${
                  listingFilter === opt.value
                    ? opt.value === "listed"
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                      : opt.value === "unlisted"
                        ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                        : "bg-marketplace-primary/15 border-marketplace-primary/30 text-marketplace-primary"
                    : "bg-marketplace-soft border-marketplace-border text-slate-400 hover:text-slate-200 hover:border-slate-600"
                }`}
              >
                {opt.icon}
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-marketplace-primary" />
          <p className="text-sm font-medium">Fetching assets from Vault...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{errorMsg}</p>
        </div>
      ) : filteredAssets.length === 0 ? (
        <div className="border border-dashed border-marketplace-border rounded-3xl py-20 px-6 text-center max-w-md mx-auto">
          <Box className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-200">No Assets Found</h3>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
            There are no assets under this filter. Upload a new asset to register your creator package in the sandbox.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssets.map(asset => {
            const isPurchased = purchasedAssetIds.has(asset.assetID);
            const isOwned = !isPurchased;
            
            const isListed = asset.isListedInStore;

            return (
              <div
                key={asset.assetID}
                className="bg-marketplace-soft/40 border border-marketplace-border rounded-2xl flex flex-col overflow-hidden relative group hover:border-marketplace-primary/20 transition-all duration-300"
              >
                {/* Thumbnail Preview */}
                <div className="aspect-video bg-[#030712] relative overflow-hidden flex items-center justify-center border-b border-marketplace-border">
                  {asset.thumbnailSasUrl ? (
                    <img
                      src={asset.thumbnailSasUrl}
                      alt={asset.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-slate-600 flex flex-col items-center gap-1.5">
                      <Box className="w-10 h-10" />
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Preview</span>
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    <span className="bg-slate-900/80 backdrop-blur-md text-slate-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      {ASSET_TYPES[asset.assetType] || "Asset"}
                    </span>
                    
                    {isOwned ? (
                      isListed ? (
                        <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Listed
                        </span>
                      ) : (
                        <span className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                          <EyeOff className="w-3 h-3" /> Unlisted
                        </span>
                      )
                    ) : (
                      <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        Purchased
                      </span>
                    )}
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white line-clamp-1 mb-1.5" title={asset.fileName}>
                      {asset.fileName}
                    </h3>
                    <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium mb-4">
                      {asset.description || "No description provided for this blueprint asset package."}
                    </p>
                  </div>

                  {/* Metadata and Actions */}
                  <div>
                    <div className="border-t border-marketplace-border/60 pt-4 flex justify-between items-center text-xs font-semibold text-slate-500 mb-4">
                      <span>Uploaded {new Date(asset.uploadedAt).toLocaleDateString()}</span>
                      <span className="text-white text-sm font-extrabold">
                        {asset.isFree ? "FREE" : `$${asset.price.toFixed(2)}`}
                      </span>
                    </div>

                    <div className="flex gap-2 w-full">
                      {isOwned ? (
                        <Link
                          href={`/marketplace/assets/${asset.assetID}`}
                          className="w-full bg-marketplace-primary text-white py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Manage Asset
                        </Link>
                      ) : (
                        <Link
                          href={`/marketplace/assets/${asset.assetID}`}
                          className="w-full bg-white/5 border border-marketplace-border text-slate-300 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Preview Assets Grid (shown only when Preview tab is active) */}
      {!loading && !errorMsg && activeTab === "Preview" && (
        previewAssets.length === 0 ? (
          <div className="border border-dashed border-marketplace-border rounded-3xl py-20 px-6 text-center max-w-md mx-auto">
            <Eye className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-200">No Preview Assets</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              No assets have been shared with you for preview yet. When a freelancer delivers a milestone, their asset will appear here for inspection.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewAssets.map(preview => {
              const isExpired = preview.isExpired || new Date(preview.expiryDate) < new Date();
              return (
                <div
                  key={preview.assetPreviewId}
                  className={`bg-marketplace-soft/40 border rounded-2xl flex flex-col overflow-hidden relative group transition-all duration-300 ${
                    isExpired
                      ? "border-red-500/20 opacity-60"
                      : "border-marketplace-border hover:border-purple-500/30"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-[#030712] relative overflow-hidden flex items-center justify-center border-b border-marketplace-border">
                    {preview.thumbnailUrl ? (
                      <img
                        src={preview.thumbnailUrl}
                        alt={preview.assetName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="text-slate-600 flex flex-col items-center gap-1.5">
                        <Eye className="w-10 h-10" />
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Preview</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 border ${
                        isExpired
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-purple-500/10 border-purple-500/20 text-purple-400"
                      }`}>
                        <Eye className="w-3 h-3" />
                        {isExpired ? "Expired" : "Preview"}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-white line-clamp-1 mb-1.5" title={preview.assetName}>
                        {preview.assetName}
                      </h3>
                      <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed font-medium mb-4">
                        {preview.description || "No description provided."}
                      </p>
                    </div>

                    {/* Shared by + Expiry */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-xs">
                        <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="text-slate-500 font-semibold">Shared by</span>
                        <span className="text-white font-bold truncate">{preview.sharedByUsername}</span>
                      </div>

                      <div className="border-t border-marketplace-border/60 pt-3 flex justify-between items-center text-xs font-semibold text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{isExpired ? "Expired" : `Expires ${new Date(preview.expiryDate).toLocaleDateString()}`}</span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          Shared {new Date(preview.sharedDate).toLocaleDateString()}
                        </span>
                      </div>

                      <Link
                        href={`/marketplace/assets/${preview.assetId}`}
                        className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer text-center transition-all ${
                          isExpired
                            ? "bg-white/5 border border-marketplace-border text-slate-500 cursor-not-allowed"
                            : "bg-purple-600/80 hover:bg-purple-600 text-white"
                        }`}
                      >
                        <Eye className="w-3.5 h-3.5" />
                        {isExpired ? "Preview Expired" : "View Preview"}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Edit Details Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-marketplace-soft border border-marketplace-border rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-marketplace-border">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Edit className="w-4 h-4 text-marketplace-primary" />
                Edit Asset Metadata
              </h3>
              <button
                onClick={() => setEditingAsset(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">File Name</label>
                <input
                  type="text"
                  required
                  value={editForm.fileName}
                  onChange={e => setEditForm({ ...editForm, fileName: e.target.value })}
                  className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</label>
                <textarea
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  rows={3}
                  className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Type</label>
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

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={editForm.categoryId}
                    onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })}
                    className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="border-t border-marketplace-border/60 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="edit-isFree"
                    checked={editForm.isFree}
                    onChange={e => setEditForm({ ...editForm, isFree: e.target.checked })}
                    className="w-4.5 h-4.5 rounded border-marketplace-border bg-slate-950 text-marketplace-primary focus:ring-marketplace-primary accent-marketplace-primary cursor-pointer"
                  />
                  <label htmlFor="edit-isFree" className="text-sm font-semibold text-slate-300 cursor-pointer">
                    This is a Free Asset
                  </label>
                </div>

                {!editForm.isFree && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editForm.price}
                      onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                      className="w-24 bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-3 py-1.5 text-sm text-right focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              {editingAsset.video && (
                <div className="bg-white/5 border border-marketplace-border rounded-xl p-3 flex items-center justify-between">
                  <span className="text-xs font-medium text-slate-400">Has Demo Video file</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="edit-removeVideo"
                      checked={editForm.removeVideo}
                      onChange={e => setEditForm({ ...editForm, removeVideo: e.target.checked })}
                      className="w-4 h-4 accent-marketplace-primary cursor-pointer"
                    />
                    <label htmlFor="edit-removeVideo" className="text-xs font-semibold text-red-400 cursor-pointer">
                      Remove Video
                    </label>
                  </div>
                </div>
              )}

              <div className="border-t border-marketplace-border/60 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-marketplace-border py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-marketplace-primary text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List In Store Modal */}
      {listingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-marketplace-soft border border-marketplace-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-marketplace-border">
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                List Asset in Store
              </h3>
              <button
                onClick={() => setListingAsset(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleListSubmit} className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
              {actionSuccess && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-lg flex items-center gap-2.5 text-xs font-medium">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                Confirm listing details for <strong className="text-white">"{listingAsset.fileName}"</strong>. This will make your asset searchable and purchaseable in the global catalog.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Category</label>
                <select
                  required
                  value={listForm.categoryId}
                  onChange={e => setListForm({ ...listForm, categoryId: e.target.value })}
                  className="w-full bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-4 py-2.5 text-sm focus:outline-none transition-colors cursor-pointer"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border-t border-marketplace-border/60 pt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="list-isFree"
                    checked={listForm.isFree}
                    onChange={e => setListForm({ ...listForm, isFree: e.target.checked })}
                    className="w-4.5 h-4.5 rounded border-marketplace-border bg-slate-950 text-marketplace-primary focus:ring-marketplace-primary accent-marketplace-primary cursor-pointer"
                  />
                  <label htmlFor="list-isFree" className="text-sm font-semibold text-slate-300 cursor-pointer">
                    List as Free Asset
                  </label>
                </div>

                {!listForm.isFree && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={listForm.price}
                      onChange={e => setListForm({ ...listForm, price: Number(e.target.value) })}
                      className="w-24 bg-[#030712] border border-marketplace-border focus:border-marketplace-primary rounded-xl px-3 py-1.5 text-sm text-right focus:outline-none transition-colors"
                    />
                  </div>
                )}
              </div>

              <div className="border-t border-marketplace-border/60 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setListingAsset(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-marketplace-border py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 bg-marketplace-primary text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Confirm List
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-marketplace-soft border border-marketplace-border rounded-2xl w-full max-w-md overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-150 text-slate-100">
            <div className="flex justify-between items-center px-6 py-4 border-b border-marketplace-border">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-red-400">
                <Trash2 className="w-4.5 h-4.5 text-red-500" />
                Confirm Asset Deletion
              </h3>
              <button
                onClick={() => setDeletingAsset(null)}
                className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {actionError && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex items-start gap-2.5 text-xs font-medium leading-relaxed">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
                  <div className="space-y-1">
                    <strong className="block text-red-300 font-bold uppercase tracking-wider">Deletion Failed</strong>
                    <span>{actionError}</span>
                  </div>
                </div>
              )}

              <p className="text-xs text-slate-400 leading-relaxed">
                Are you absolutely sure you want to permanently delete <strong className="text-white">"{deletingAsset.fileName}"</strong>? This action will destroy all uploaded files and media packages. It cannot be undone.
              </p>

              <div className="border-t border-marketplace-border/60 pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingAsset(null)}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-marketplace-border py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={formLoading}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Permanently Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
