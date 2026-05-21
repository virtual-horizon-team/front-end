"use client";

import { useState } from "react";
import { 
    BookOpen, 
    Clock, 
    AlertTriangle, 
    BookOpenCheck,
    Search,
    ChevronLeft,
    ChevronRight,
    X,
    Loader2,
    TrendingDown,
    Award,
    FilePlay
} from "lucide-react";
import { 
    UnderReviewCourse, 
    getUnderReviewCourses, 
    publishCourse, 
    rejectCourse 
} from "../lib/course-review-api";
import { showToast } from "@/features/instructor/components/Toast";

interface CourseReviewsViewProps {
    initialCourses: UnderReviewCourse[];
}

export default function CourseReviewsView({ initialCourses }: CourseReviewsViewProps) {
    const [courses, setCourses] = useState<UnderReviewCourse[]>(initialCourses);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    
    // Action loading states
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    
    // Modal state for rejection
    const [rejectingCourse, setRejectingCourse] = useState<UnderReviewCourse | null>(null);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectSubmitLoading, setRejectSubmitLoading] = useState(false);

    // Refresh course review list
    const refreshCourses = async () => {
        setLoading(true);
        try {
            const data = await getUnderReviewCourses();
            setCourses(data);
        } catch (error: any) {
            showToast("error", error?.message || "Failed to load course list.");
        } finally {
            setLoading(false);
        }
    };

    // Publish Course
    const handlePublish = async (course: UnderReviewCourse) => {
        if (confirm(`Are you sure you want to approve and publish "${course.title}"?`)) {
            setActionLoadingId(course.id);
            try {
                await publishCourse(course.id);
                showToast("success", `Course "${course.title}" has been published successfully!`);
                await refreshCourses();
            } catch (error: any) {
                showToast("error", error?.message || "Failed to publish course.");
            } finally {
                setActionLoadingId(null);
            }
        }
    };

    // Open rejection dialog
    const handleOpenRejectModal = (course: UnderReviewCourse) => {
        setRejectingCourse(course);
        setRejectReason("");
    };

    // Close rejection dialog
    const handleCloseRejectModal = () => {
        setRejectingCourse(null);
        setRejectReason("");
    };

    // Confirm Course Rejection
    const handleConfirmReject = async () => {
        if (!rejectingCourse) return;
        
        setRejectSubmitLoading(true);
        try {
            await rejectCourse(rejectingCourse.id, rejectReason);
            showToast("success", `Course "${rejectingCourse.title}" has been rejected.`);
            handleCloseRejectModal();
            await refreshCourses();
        } catch (error: any) {
            showToast("error", error?.message || "Failed to reject course.");
        } finally {
            setRejectSubmitLoading(false);
        }
    };

    // Filter courses client-side
    const filteredCourses = courses.filter(c => 
        c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const pendingCount = courses.length;

    return (
        <div className="space-y-8 relative">
            {/* Header */}
            <div>
                <h1 className="text-[28px] font-bold text-brand-navy tracking-tight">Course Reviews</h1>
                <p className="text-brand-muted text-[15px] font-medium mt-1">
                    Review and approve submitted courses before publishing them to the catalog.
                </p>
            </div>

            {/* Bento Grid Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Stat Card 1 */}
                <div className="bg-white border border-brand-border/70 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Avg. Review Time</span>
                    <span className="text-2xl font-extrabold text-brand-navy">1.4 Days</span>
                    <div className="text-green-600 text-xs font-bold flex items-center gap-1">
                        <TrendingDown size={14} />
                        12% faster than last month
                    </div>
                </div>

                {/* Stat Card 2 */}
                <div className="bg-white border border-brand-border/70 p-6 rounded-2xl shadow-sm flex flex-col justify-between gap-4">
                    <span className="text-[11px] font-bold text-brand-muted uppercase tracking-wider">Priority Level</span>
                    <span className="text-2xl font-extrabold text-red-600">High</span>
                    <span className="text-xs font-semibold text-brand-muted leading-none">Review active queue</span>
                </div>

                {/* Stat Card 3 (Bento-styled primary card) */}
                <div className="col-span-1 md:col-span-2 relative overflow-hidden rounded-2xl bg-brand-primary p-6 text-white shadow-sm flex flex-col justify-between gap-6 group hover:shadow-lg transition-all duration-300">
                    <div className="relative z-10 space-y-2">
                        <h4 className="text-lg font-bold">Review Guidelines</h4>
                        <p className="text-xs opacity-90 max-w-sm font-medium leading-relaxed">
                            Ensure every course meets the strict audio, video, and structure criteria before granting publishing access to instructors.
                        </p>
                    </div>
                    <button className="relative z-10 w-fit px-4 py-2 bg-white text-brand-primary rounded-xl text-xs font-bold hover:bg-brand-soft transition-colors cursor-pointer active:scale-98">
                        Read Review Manual
                    </button>
                    <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 pointer-events-none">
                        <Award size={140} className="absolute -right-6 top-1/2 -translate-y-1/2" />
                    </div>
                </div>
            </div>

            {/* List Header controls */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h3 className="text-lg font-bold text-brand-navy">Pending Submissions</h3>
                    <p className="text-xs text-brand-muted font-semibold mt-1">There are {pendingCount} courses awaiting review</p>
                </div>

                {/* Search control */}
                <div className="relative max-w-xs w-full">
                    <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
                    <input
                        type="text"
                        placeholder="Search courses..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-white border border-brand-border/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all font-medium"
                    />
                </div>
            </div>

            {/* Submissions Table Component */}
            <div className="bg-white rounded-3xl shadow-sm border border-brand-border/70 overflow-hidden">
                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-brand-muted gap-3">
                            <Loader2 className="animate-spin text-brand-primary" size={32} />
                            <p className="text-sm font-semibold">Updating reviews...</p>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="py-16 text-center text-brand-muted">
                            <p className="text-sm font-semibold">No pending courses waiting for review.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-soft/20 border-b border-brand-border/70">
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">Course Thumbnail & Title</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">Lectures</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider">Submitted Date</th>
                                    <th className="px-6 py-4 text-[10px] font-extrabold text-brand-muted uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-border/50">
                                {filteredCourses.map((course) => (
                                    <tr key={course.id} className="hover:bg-brand-soft/10 transition-colors group">
                                        {/* Thumbnail & Title */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                {course.thumbnailUrl ? (
                                                    <div className="w-16 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-brand-border/50 relative shadow-sm">
                                                        <img 
                                                            src={course.thumbnailUrl} 
                                                            alt={course.title} 
                                                            className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="w-16 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0 border border-brand-border/40 shadow-sm">
                                                        <BookOpenCheck size={20} />
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-sm font-extrabold text-brand-navy">{course.title}</p>
                                                    <p className="text-[10px] text-brand-muted font-bold tracking-wide uppercase mt-0.5">Course ID: {course.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        {/* Lecture count */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-brand-soft border border-brand-border/60 text-brand-navy">
                                                <FilePlay size={14} className="text-brand-primary" />
                                                {course.totalLectures} {course.totalLectures === 1 ? "Lecture" : "Lectures"}
                                            </span>
                                        </td>
                                        {/* Status badge */}
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                                {course.status === "UnderReview" ? "Under Review" : course.status}
                                            </span>
                                        </td>
                                        {/* Date info */}
                                        <td className="px-6 py-4 text-xs text-brand-muted font-bold">
                                            {new Date(course.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric"
                                            })}
                                        </td>
                                        {/* Row Actions */}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handlePublish(course)}
                                                    disabled={actionLoadingId !== null}
                                                    className="bg-brand-primary text-white hover:bg-brand-hover px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                                                >
                                                    {actionLoadingId === course.id ? (
                                                        <Loader2 size={12} className="animate-spin" />
                                                    ) : null}
                                                    Publish Course
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenRejectModal(course)}
                                                    disabled={actionLoadingId !== null}
                                                    className="border border-brand-border text-brand-muted hover:border-red-200 hover:bg-red-50 hover:text-red-600 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50 active:scale-95"
                                                    title="Reject course"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Table Footer / Pagination */}
                <div className="px-6 py-4 border-t border-brand-border/70 flex items-center justify-between bg-gray-50/50">
                    <p className="text-xs font-bold text-brand-muted">
                        Showing {filteredCourses.length} of {courses.length} pending submissions
                    </p>
                    <div className="flex items-center gap-2">
                        <button disabled className="p-1.5 rounded-xl border border-brand-border bg-white text-brand-muted hover:bg-brand-soft/50 disabled:opacity-50 transition-all cursor-pointer">
                            <ChevronLeft size={16} />
                        </button>
                        <button disabled className="p-1.5 rounded-xl border border-brand-border bg-white text-brand-muted hover:bg-brand-soft/50 disabled:opacity-50 transition-all cursor-pointer">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Rejection Modal Overlay */}
            {rejectingCourse && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
                        onClick={handleCloseRejectModal}
                    />

                    {/* Modal Card */}
                    <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 border border-brand-border transition-all transform animate-in scale-in duration-200">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-brand-border flex justify-between items-center bg-gray-50/50">
                            <h2 className="text-md font-bold text-brand-navy">Reject Course Submission</h2>
                            <button 
                                onClick={handleCloseRejectModal}
                                className="p-2 text-brand-muted hover:text-brand-navy rounded-xl hover:bg-brand-soft transition-all cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Body content */}
                        <div className="p-6 space-y-5">
                            {/* Warnings */}
                            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-2xl border border-amber-200/50">
                                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                                <p className="text-xs font-semibold text-amber-800 leading-relaxed">
                                    Rejecting this course will notify the instructor. They must correct quality issues and resubmit before it can be reviewed again.
                                </p>
                            </div>

                            {/* Reason for rejection input */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-extrabold text-brand-navy uppercase tracking-wider ml-1" htmlFor="reject-reason">
                                    Reason for rejection (optional)
                                </label>
                                <textarea 
                                    id="reject-reason" 
                                    placeholder="Provide details about quality updates needed (e.g., audio noise in module 3, unclear objectives)..." 
                                    rows={4}
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                    className="w-full bg-white border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all p-4 text-sm font-medium outline-none placeholder:text-brand-muted/50 text-brand-navy"
                                />
                            </div>
                        </div>

                        {/* Footer actions */}
                        <div className="px-6 py-4 bg-gray-50/50 border-t border-brand-border flex justify-end gap-3">
                            <button 
                                onClick={handleCloseRejectModal}
                                className="px-4 py-2 border border-brand-border text-brand-navy rounded-xl text-xs font-bold hover:bg-brand-soft transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmReject}
                                disabled={rejectSubmitLoading}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                                {rejectSubmitLoading ? (
                                    <Loader2 size={12} className="animate-spin" />
                                ) : null}
                                Confirm Rejection
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
