"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Save } from "lucide-react";
import { courseApi } from "@/features/instructor/lib/course-api";
import { showToast } from "../Toast";

interface MessagesStepProps {
    courseId: string;
    welcomeMessage: string | null;
    congratulationMessage: string | null;
    onSaved: (data: { welcomeMessage: string | null; congratulationMessage: string | null }) => void;
}

export default function MessagesStep({ courseId, welcomeMessage: initWelcome, congratulationMessage: initCongrats, onSaved }: MessagesStepProps) {
    const [welcomeMessage, setWelcomeMessage] = useState(initWelcome || "");
    const [congratulationMessage, setCongratulationMessage] = useState(initCongrats || "");
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        setSaving(true);
        try {
            await courseApi.updateMessages(courseId, {
                welcomeMessage: welcomeMessage.trim() || null,
                congratulationMessage: congratulationMessage.trim() || null,
            });
            onSaved({
                welcomeMessage: welcomeMessage.trim() || null,
                congratulationMessage: congratulationMessage.trim() || null,
            });
            showToast("success", "Messages saved successfully");
        } catch (err: any) {
            showToast("error", err.message || "Failed to save messages");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-2xl space-y-6">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-brand-border">
                <div className="p-2.5 bg-brand-soft text-brand-primary rounded-xl">
                    <MessageSquare size={20} />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-brand-text">Course Messages</h2>
                    <p className="text-sm text-brand-muted mt-0.5">Set automatic messages for students at key milestones.</p>
                </div>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare size={16} className="text-brand-primary" />
                    <label className="text-sm font-medium text-brand-text">Welcome Message</label>
                </div>
                <textarea
                    value={welcomeMessage}
                    onChange={(e) => setWelcomeMessage(e.target.value)}
                    rows={4}
                    placeholder="Welcome to the course! Here's what you can expect..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm resize-y"
                />
                <p className="text-xs text-brand-muted mt-1.5">Shown to students when they first enroll in your course.</p>
            </div>

            <div>
                <div className="flex items-center gap-2 mb-1.5">
                    <MessageSquare size={16} className="text-green-500" />
                    <label className="text-sm font-medium text-brand-text">Congratulation Message</label>
                </div>
                <textarea
                    value={congratulationMessage}
                    onChange={(e) => setCongratulationMessage(e.target.value)}
                    rows={4}
                    placeholder="Congratulations on completing the course! Here are your next steps..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-border text-sm bg-white focus:outline-none focus:border-brand-primary focus:ring-0 focus:shadow-sm placeholder:text-brand-muted transition-all hover:border-brand-border shadow-sm resize-y"
                />
                <p className="text-xs text-brand-muted mt-1.5">Shown to students upon course completion.</p>
            </div>

            <div className="pt-4 border-t border-brand-border">
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2.5 bg-white border border-brand-border text-brand-text px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-bg hover:border-brand-border transition-all shadow-sm cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    Save Messages
                </button>
            </div>
        </div>
    );
}
