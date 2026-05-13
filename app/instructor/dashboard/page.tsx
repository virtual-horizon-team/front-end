import { LayoutDashboard, Upload, BookOpen, ClipboardList, Glasses, TrendingUp } from "lucide-react";

export default function DashboardPage() {
    const stats = [
        { label: "Total Courses", value: "—", icon: BookOpen, color: "from-blue-500 to-blue-600" },
        { label: "Media Uploads", value: "—", icon: Upload, color: "from-teal-500 to-teal-600" },
        { label: "Assessments", value: "—", icon: ClipboardList, color: "from-emerald-500 to-emerald-600" },
        { label: "VR Scenarios", value: "—", icon: Glasses, color: "from-orange-500 to-orange-600" },
    ];

    return (
        <div className="pt-12 lg:pt-0">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-brand-text">Dashboard</h1>
                <p className="text-brand-muted mt-1">Welcome back! Here's an overview of your content.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                {stats.map((stat) => (
                    <div
                        key={stat.label}
                        className="bg-white rounded-[20px] p-6 shadow-sm border border-brand-border/80 hover:shadow-md hover:border-brand-border transition-all duration-300 relative overflow-hidden group"
                    >
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={`p-3.5 rounded-xl bg-gradient-to-br ${stat.color} shadow-sm group-hover:scale-105 transition-transform duration-300`}>
                                <stat.icon size={22} className="text-white" />
                            </div>
                            <TrendingUp size={20} className="text-brand-muted" />
                        </div>
                        <p className="text-4xl font-bold text-brand-text mb-1 relative z-10">{stat.value}</p>
                        <p className="text-sm font-medium text-brand-muted relative z-10">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-[20px] p-8 shadow-sm border border-brand-border/80">
                <h2 className="text-xl font-bold text-brand-text mb-6">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    <a
                        href="/instructor/media-hub"
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-brand-border hover:border-teal-300 hover:bg-brand-soft hover:shadow-sm transition-all duration-300 active:scale-[0.98] group"
                    >
                        <div className="p-3 bg-teal-100 text-brand-primary rounded-xl group-hover:bg-brand-hover group-hover:text-white transition-colors duration-300">
                            <Upload size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-text group-hover:text-teal-700">Upload Media</span>
                    </a>
                    <a
                        href="/instructor/courses"
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-brand-border hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm transition-all duration-300 active:scale-[0.98] group"
                    >
                        <div className="p-3 bg-blue-100 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                            <BookOpen size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-text group-hover:text-blue-700">Create Course</span>
                    </a>
                    <a
                        href="/instructor/assessments"
                        className="flex flex-col items-center justify-center gap-3 p-6 rounded-xl border border-brand-border hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-sm transition-all duration-300 active:scale-[0.98] group"
                    >
                        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                            <ClipboardList size={24} />
                        </div>
                        <span className="text-sm font-bold text-brand-text group-hover:text-emerald-700">Create Assessment</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
