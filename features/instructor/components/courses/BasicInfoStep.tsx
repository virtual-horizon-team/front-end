"use client";

import { useState } from "react";
import { Loader2, Heading, Type, AlignLeft, Globe, BarChart3, Save } from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { showToast } from "../Toast";

interface BasicInfoStepProps {
    courseId: string;
    title: string;
    subtitle: string | null;
    description: string | null;
    language: string | null;
    level: string | null;
    onSaved: (data: { title: string; subtitle: string | null; description: string | null; language: string | null; level: string | null }) => void;
}

const LEVELS = [
    { value: "", label: "Select level" },
    { value: "Beginner", label: "Beginner" },
    { value: "Intermediate", label: "Intermediate" },
    { value: "Advanced", label: "Advanced" },
    { value: "Expert", label: "Expert" },
    { value: "AllLevels", label: "All Levels" },
];

const LANGUAGES = [
    { value: "", label: "Select language" },
    { value: "English", label: "English" },
    { value: "Arabic", label: "Arabic" },
    { value: "French", label: "French" },
    { value: "Spanish", label: "Spanish" },
    { value: "German", label: "German" },
    { value: "Chinese", label: "Chinese" },
    { value: "Japanese", label: "Japanese" },
    { value: "Korean", label: "Korean" },
    { value: "Portuguese", label: "Portuguese" },
    { value: "Russian", label: "Russian" },
    { value: "Hindi", label: "Hindi" },
    { value: "Turkish", label: "Turkish" },
];

export default function BasicInfoStep({ courseId, title: initTitle, subtitle: initSubtitle, description: initDesc, language: initLang, level: initLevel, onSaved }: BasicInfoStepProps) {
    const [title, setTitle] = useState(initTitle || "");
    const [subtitle, setSubtitle] = useState(initSubtitle || "");
    const [description, setDescription] = useState(initDesc || "");
    const [language, setLanguage] = useState(initLang || "");
    const [level, setLevel] = useState(initLevel || "");
    const [saving, setSaving] = useState(false);
    const [titleError, setTitleError] = useState("");

    const handleSave = async () => {
        if (!title.trim()) {
            setTitleError("Title is required");
            return;
        }
        setTitleError("");
        setSaving(true);
        try {
            await courseApi.updateBasicInfo(courseId, {
                title: title.trim(),
                subtitle: subtitle.trim() || null,
                description: description.trim() || null,
                language: language || null,
                level: level || null,
            });
            onSaved({
                title: title.trim(),
                subtitle: subtitle.trim() || null,
                description: description.trim() || null,
                language: language || null,
                level: level || null,
            });
            showToast("success", "Basic info saved successfully");
        } catch (err: any) {
            showToast("error", err.message || "Failed to save basic info");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <AlignLeft size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Basic Information</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Set the title, description, and key details for your course.</p>
                </div>
            </div>

            {/* Title */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-brand-text mb-1.5">
                    <Heading size={16} className="text-brand-muted" />
                    Course Title <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setTitleError(""); }}
                    placeholder="e.g. Introduction to Machine Learning"
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-0 transition-all placeholder:text-brand-muted hover:border-slate-400 shadow-sm ${titleError ? "border-red-300 focus:ring-red-500/20 focus:border-red-400" : "border-brand-border focus:border-brand-primary focus:shadow-sm"}`}
                />
                {titleError && <p className="text-xs text-red-500 mt-1.5">{titleError}</p>}
                <p className="text-xs text-brand-muted mt-1.5">A clear, descriptive title helps students find your course.</p>
            </div>

            {/* Subtitle */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-brand-text mb-1.5">
                    <Type size={16} className="text-brand-muted" />
                    Subtitle
                </label>
                <input
                    type="text"
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="e.g. A hands-on guide to building ML models from scratch"
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm"
                />
                <p className="text-xs text-brand-muted mt-1.5">Use this to add a brief tagline for your course.</p>
            </div>

            {/* Description */}
            <div>
                <label className="flex items-center gap-2 text-sm font-medium text-brand-text mb-1.5">
                    <AlignLeft size={16} className="text-brand-muted" />
                    Description
                </label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={6}
                    placeholder="Describe what students will learn in this course..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm resize-y"
                />
                <p className="text-xs text-brand-muted mt-1.5">A detailed description helps students decide if this course is right for them.</p>
            </div>

            {/* Language & Level */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-brand-text mb-1.5">
                        <Globe size={16} className="text-brand-muted" />
                        Language
                    </label>
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm transition-all hover:border-brand-border shadow-sm appearance-none cursor-pointer"
                    >
                        {LANGUAGES.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-brand-text mb-1.5">
                        <BarChart3 size={16} className="text-brand-muted" />
                        Level
                    </label>
                    <select
                        value={level}
                        onChange={(e) => setLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm transition-all hover:border-brand-border shadow-sm appearance-none cursor-pointer"
                    >
                        {LEVELS.map((l) => (
                            <option key={l.value} value={l.value}>{l.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Save */}
            <div className="pt-4 border-t border-brand-border">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2.5 bg-white border border-brand-border text-brand-text px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-bg hover:border-brand-border transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Basic Info
                </button>
            </div>
        </div>
    );
}
