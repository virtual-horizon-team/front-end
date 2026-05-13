"use client";

import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon, DollarSign, Save } from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { showToast } from "../Toast";

interface MediaPricingStepProps {
    courseId: string;
    thumbnailUrl: string | null;
    price: number | null;
    currency: string | null;
    onSaved: (data: { thumbnailUrl?: string; price: number | null; currency: string | null }) => void;
}

const CURRENCIES = [
    { value: "USD", label: "USD — US Dollar" },
    { value: "EGP", label: "EGP — Egyptian Pound" },
    { value: "EUR", label: "EUR — Euro" },
    { value: "GBP", label: "GBP — British Pound" },
    { value: "SAR", label: "SAR — Saudi Riyal" },
    { value: "AED", label: "AED — UAE Dirham" },
];

export default function MediaPricingStep({ courseId, thumbnailUrl: initThumb, price: initPrice, currency: initCurrency, onSaved }: MediaPricingStepProps) {
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(initThumb);
    const [uploadingThumb, setUploadingThumb] = useState(false);
    const [price, setPrice] = useState(initPrice !== null ? String(initPrice) : "");
    const [currency, setCurrency] = useState(initCurrency || "USD");
    const [isFree, setIsFree] = useState(initPrice === 0);
    const [savingPricing, setSavingPricing] = useState(false);
    const fileRef = useRef<HTMLInputElement>(null);

    const MAX_THUMB_SIZE = 2 * 1024 * 1024; // 2MB
    const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

    const handleThumbnailUpload = async (file: File) => {
        if (!ACCEPTED_TYPES.includes(file.type)) {
            showToast("error", "Only JPG, PNG, and WebP images are accepted");
            return;
        }
        if (file.size > MAX_THUMB_SIZE) {
            showToast("error", "Image must be smaller than 2 MB");
            return;
        }
        setUploadingThumb(true);
        const localPreview = URL.createObjectURL(file);
        setThumbnailPreview(localPreview);
        try {
            const updated = await courseApi.updateThumbnail(courseId, file);
            const serverUrl = updated.thumbnailUrl || localPreview;
            setThumbnailPreview(serverUrl);
            showToast("success", "Thumbnail uploaded successfully");
            onSaved({ thumbnailUrl: serverUrl, price: null, currency: null });
        } catch (err: any) {
            showToast("error", err.message || "Failed to upload thumbnail");
            setThumbnailPreview(initThumb);
            URL.revokeObjectURL(localPreview);
        } finally {
            setUploadingThumb(false);
        }
    };

    const handleSavePricing = async () => {
        const priceVal = isFree ? 0 : parseFloat(price);
        if (!isFree && (isNaN(priceVal) || priceVal < 0)) {
            showToast("error", "Please enter a valid price");
            return;
        }
        setSavingPricing(true);
        try {
            await courseApi.updatePricing(courseId, {
                price: priceVal,
                currency,
            });
            onSaved({ price: priceVal, currency });
            showToast("success", "Pricing saved successfully");
        } catch (err: any) {
            showToast("error", err.message || "Failed to save pricing");
        } finally {
            setSavingPricing(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <ImageIcon size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Media & Pricing</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Upload your course thumbnail and set the price.</p>
                </div>
            </div>

            {/* Thumbnail Upload */}
            <div>
                <label className="block text-sm font-medium text-brand-text mb-3">Course Thumbnail</label>
                <div className="flex items-start gap-5">
                    <div className="w-48 h-28 rounded-xl border-2 border-dashed border-brand-border bg-brand-bg overflow-hidden flex items-center justify-center relative shrink-0">
                        {thumbnailPreview ? (
                            <>
                                <img src={thumbnailPreview} alt="Thumbnail" className="w-full h-full object-cover" />
                                {uploadingThumb && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <Loader2 size={24} className="text-white animate-spin" />
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center gap-1.5 text-brand-muted">
                                <ImageIcon size={24} />
                                <span className="text-xs">No thumbnail</span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={uploadingThumb}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-text bg-white hover:bg-brand-bg transition-colors cursor-pointer disabled:opacity-50"
                        >
                            {uploadingThumb ? (
                                <Loader2 size={16} className="animate-spin" />
                            ) : (
                                <Upload size={16} />
                            )}
                            {thumbnailPreview ? "Change Image" : "Upload Image"}
                        </button>
                        <p className="text-xs text-brand-muted">JPG, PNG, or WebP — max 2 MB</p>
                    </div>
                </div>
                <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleThumbnailUpload(file);
                        e.target.value = "";
                    }}
                />
            </div>

            {/* Divider */}
            <div className="border-t border-brand-border" />

            {/* Pricing */}
            <div className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-brand-text mb-3">Pricing</label>

                    {/* Free toggle */}
                    <label className="flex items-center gap-3 mb-4 cursor-pointer">
                        <div
                            className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${isFree ? "bg-teal-600" : "bg-brand-border"}`}
                            onClick={() => {
                                const next = !isFree;
                                setIsFree(next);
                                if (next) setPrice("0");
                            }}
                        >
                            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${isFree ? "translate-x-[18px]" : "translate-x-0.5"}`} />
                        </div>
                        <span className="text-sm text-brand-text font-medium">Free course</span>
                    </label>

                    {!isFree && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-medium text-brand-muted mb-1.5">Price</label>
                                <div className="relative">
                                    <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="29.99"
                                        className="w-full pl-9 pr-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-brand-muted mb-1.5">Currency</label>
                                <select
                                    value={currency}
                                    onChange={(e) => setCurrency(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm transition-all hover:border-brand-border shadow-sm appearance-none cursor-pointer"
                                >
                                    {CURRENCIES.map((c) => (
                                        <option key={c.value} value={c.value}>{c.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="pt-4 border-t border-brand-border">
                    <button
                        onClick={handleSavePricing}
                        disabled={savingPricing}
                        className="flex items-center gap-2.5 bg-white border border-brand-border text-brand-text px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-bg hover:border-brand-border transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                        {savingPricing ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Pricing
                    </button>
                </div>
            </div>
        </div>
    );
}
