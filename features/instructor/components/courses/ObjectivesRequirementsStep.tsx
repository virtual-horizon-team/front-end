"use client";

import { useState, KeyboardEvent } from "react";
import { Plus, X, Loader2, Target, ListChecks, Save } from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { showToast } from "../Toast";

interface ObjectivesRequirementsStepProps {
    courseId: string;
    objectives: string[];
    requirements: string[];
    onSaved: (data: { objectives?: string[]; requirements?: string[] }) => void;
}

function DynamicList({
    label,
    helperText,
    items,
    setItems,
    minCount,
    minLabel,
    placeholder,
    icon: Icon,
}: {
    label: string;
    helperText: string;
    items: string[];
    setItems: (items: string[]) => void;
    minCount?: number;
    minLabel?: string;
    placeholder: string;
    icon: typeof Target;
}) {
    const [inputValue, setInputValue] = useState("");

    const addItem = () => {
        const val = inputValue.trim();
        if (!val) return;
        setItems([...items, val]);
        setInputValue("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addItem();
        }
    };

    const removeItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Icon size={18} className="text-brand-primary" />
                    <label className="text-sm font-medium text-brand-text">{label}</label>
                </div>
                {minCount && (
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${items.length >= minCount ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"}`}>
                        {items.length}/{minCount} {minLabel || "minimum"}
                    </span>
                )}
            </div>
            <p className="text-xs text-brand-muted mb-3">{helperText}</p>

            {/* Input */}
            <div className="flex gap-2 mb-3">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-1 px-4 py-2.5 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm"
                />
                <button
                    onClick={addItem}
                    disabled={!inputValue.trim()}
                    className="px-4 py-2.5 rounded-xl border border-brand-border text-sm font-medium text-brand-text hover:bg-brand-bg transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    <Plus size={16} />
                </button>
            </div>

            {/* Items list */}
            {items.length === 0 ? (
                <div className="text-center py-6 text-brand-muted text-sm border border-dashed border-brand-border rounded-xl bg-brand-bg/50">
                    No items added yet. Type above and press Enter.
                </div>
            ) : (
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <li
                            key={index}
                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-brand-bg border border-brand-border group"
                        >
                            <span className="text-xs font-medium text-brand-muted w-6 shrink-0">{index + 1}.</span>
                            <span className="text-sm text-brand-text flex-1">{item}</span>
                            <button
                                onClick={() => removeItem(index)}
                                className="p-1 text-brand-muted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                                <X size={14} />
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default function ObjectivesRequirementsStep({ courseId, objectives: initObj, requirements: initReq, onSaved }: ObjectivesRequirementsStepProps) {
    const [objectives, setObjectives] = useState<string[]>(initObj || []);
    const [requirements, setRequirements] = useState<string[]>(initReq || []);
    const [savingObj, setSavingObj] = useState(false);
    const [savingReq, setSavingReq] = useState(false);

    const handleSaveObjectives = async () => {
        setSavingObj(true);
        try {
            await courseApi.updateObjectives(courseId, objectives);
            onSaved({ objectives });
            showToast("success", "Learning objectives saved");
        } catch (err: any) {
            showToast("error", err.message || "Failed to save objectives");
        } finally {
            setSavingObj(false);
        }
    };

    const handleSaveRequirements = async () => {
        setSavingReq(true);
        try {
            await courseApi.updateRequirements(courseId, requirements);
            onSaved({ requirements });
            showToast("success", "Requirements saved");
        } catch (err: any) {
            showToast("error", err.message || "Failed to save requirements");
        } finally {
            setSavingReq(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-8">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <Target size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Learning Objectives & Requirements</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Tell students what they will learn and what they need before starting.</p>
                </div>
            </div>

            {/* Objectives */}
            <div className="space-y-4">
                <DynamicList
                    label="Learning Objectives"
                    helperText="What will students be able to do after completing this course?"
                    items={objectives}
                    setItems={setObjectives}
                    minCount={4}
                    minLabel="minimum required"
                    placeholder="e.g. Build a REST API with Node.js"
                    icon={Target}
                />
                <div className="pt-2">
                    <button
                        onClick={handleSaveObjectives}
                        disabled={savingObj}
                        className="flex items-center gap-2.5 bg-white border border-brand-border text-brand-text px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-bg hover:border-brand-border transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                        {savingObj ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Objectives
                    </button>
                </div>
            </div>

            <div className="border-t border-brand-border" />

            {/* Requirements */}
            <div className="space-y-4">
                <DynamicList
                    label="Requirements"
                    helperText="What should students already know or have before taking this course?"
                    items={requirements}
                    setItems={setRequirements}
                    minCount={1}
                    minLabel="minimum required"
                    placeholder="e.g. Basic knowledge of JavaScript"
                    icon={ListChecks}
                />
                <div className="pt-2">
                    <button
                        onClick={handleSaveRequirements}
                        disabled={savingReq}
                        className="flex items-center gap-2.5 bg-white border border-brand-border text-brand-text px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-bg hover:border-brand-border transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                    >
                        {savingReq ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                        Save Requirements
                    </button>
                </div>
            </div>
        </div>
    );
}
