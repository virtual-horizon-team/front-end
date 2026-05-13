import Link from "next/link";
import { Calendar, ChevronLeft, ChevronRight, Clock3, Glasses, Plus, Search } from "lucide-react";
import { fetchScenarioCards } from "@/features/instructor/services/scenario.service";

function difficultyBadgeColor(level: string | null): string {
    if (!level) return "bg-brand-bg text-brand-text border-brand-border";
    const normalized = level.trim().toLowerCase();
    if (normalized === "easy") return "bg-green-50 text-green-700 border-green-200";
    if (normalized === "medium" || normalized === "intermediate") return "bg-amber-50 text-amber-700 border-amber-200";
    if (normalized === "hard" || normalized === "advanced") return "bg-red-50 text-red-700 border-red-200";
    return "bg-brand-bg text-brand-text border-brand-border";
}

function formatDuration(duration: string | null): string {
    if (!duration) return "N/A";

    // Parse .NET TimeSpan format: [-][d.]hh:mm:ss[.fffffff]
    let days = 0;
    let timeStr = duration;

    // Extract days if present (dot before the first colon)
    if (timeStr.includes('.')) {
        const parts = timeStr.split(':');
        if (parts[0].includes('.')) {
            const dayParts = parts[0].split('.');
            days = parseInt(dayParts[0], 10) || 0;
            parts[0] = dayParts[1];
            timeStr = parts.join(':');
        }
    }

    // Extract hours, minutes, seconds
    const mainTime = timeStr.split('.')[0]; 
    const timeParts = mainTime.split(':').map(val => parseInt(val, 10) || 0);
    
    const h = timeParts[0] || 0;
    const m = timeParts[1] || 0;
    const s = timeParts[2] || 0;

    let totalMinutes = 0;

    // Handle backend bug where minutes are mistakenly mapped to days (e.g., "60.00:00:00" for 60 mins)
    if (days > 0 && h === 0 && m === 0) {
        totalMinutes = days;
    } else {
        totalMinutes = (days * 24 * 60) + (h * 60) + m + (s > 0 ? 1 : 0);
    }
    
    if (isNaN(totalMinutes) || totalMinutes <= 0) return "N/A";
    
    if (totalMinutes < 60) {
        return `${totalMinutes} Mins`;
    }
    
    const outHours = Math.floor(totalMinutes / 60);
    const outMins = totalMinutes % 60;
    
    if (outMins === 0) {
        return `${outHours} Hr${outHours > 1 ? 's' : ''}`;
    }
    
    return `${outHours} Hr${outHours > 1 ? 's' : ''} ${outMins} Min`;
}

function formatCreatedAt(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Unknown date";

    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}

function toSingle(value: string | string[] | undefined): string {
    if (Array.isArray(value)) return value[0] ?? "";
    return value ?? "";
}

function parsePage(value: string, fallback: number): number {
    const parsed = Number.parseInt(value, 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallback;
    return parsed;
}

type SearchParams = { [key: string]: string | string[] | undefined };

function createQuery(params: Record<string, string | number | undefined>): string {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
            query.set(key, String(value));
        }
    });
    return query.toString();
}

export default async function VRScenariosPage({
    searchParams,
}: {
    searchParams: Promise<SearchParams>;
}) {
    const resolvedParams = await searchParams;
    const search = toSingle(resolvedParams.Search).trim();
    const statusFilter = toSingle(resolvedParams["Filters[status]"]);
    const levelFilter = toSingle(resolvedParams["Filters[difficultylevel]"]);
    const resourceIdFilter = toSingle(resolvedParams["Filters[resourceId]"]);
    const pageNumber = parsePage(toSingle(resolvedParams.PageNumber), 1);

    let data = null;
    let error = "";

    try {
        data = await fetchScenarioCards({
            Search: search || undefined,
            SortBy: "createdat",
            IsDescending: true,
            thumbnailWidth: 512,
            thumbnailHeight: 320,
            PageNumber: pageNumber,
            PageSize: 12,
            "Filters[difficultylevel]": levelFilter || undefined,
            "Filters[status]": statusFilter || undefined,
            "Filters[resourceId]": resourceIdFilter || undefined,
        });
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load scenarios";
    }

    const scenarios = data?.items ?? [];
    const totalPages = data?.totalPages ?? 1;
    const currentPage = data?.pageNumber ?? pageNumber;

    const previousQuery =
        currentPage > 1
            ? createQuery({
                Search: search || undefined,
                "Filters[difficultylevel]": levelFilter || undefined,
                "Filters[status]": statusFilter || undefined,
                PageNumber: currentPage - 1,
            })
            : "";

    const nextQuery =
        currentPage < totalPages
            ? createQuery({
                Search: search || undefined,
                "Filters[difficultylevel]": levelFilter || undefined,
                "Filters[status]": statusFilter || undefined,
                PageNumber: currentPage + 1,
            })
            : "";

    return (
        <div className="pt-12 lg:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-brand-text">VR Scenarios</h1>
                    <p className="text-brand-muted mt-1">Browse and manage virtual reality learning modules.</p>
                </div>
                <button className="flex items-center gap-2 bg-brand-primary text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-hover transition-colors shadow-sm cursor-pointer">
                    <Plus size={16} />
                    Create Scenario
                </button>
            </div>

            <form method="GET" className="bg-white border border-brand-border rounded-xl p-4 mb-6">
                <div className="flex flex-col xl:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-muted" />
                        <input
                            name="Search"
                            defaultValue={search}
                            placeholder="Search scenarios by title..."
                            className="w-full h-10 pl-9 pr-3 border border-brand-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-colors"
                        />
                    </div>

                    <select
                        name="Filters[difficultylevel]"
                        defaultValue={levelFilter}
                        className="h-10 px-3 border border-brand-border rounded-lg text-sm bg-white"
                    >
                        <option value="">All Levels</option>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>

                    <select
                        name="Filters[status]"
                        defaultValue={statusFilter}
                        className="h-10 px-3 border border-brand-border rounded-lg text-sm bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="Uploaded">Uploaded</option>
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                        <option value="Archived">Archived</option>
                    </select>

                    <button
                        type="submit"
                        className="h-10 px-4 rounded-lg bg-brand-primary hover:bg-brand-hover transition-colors text-white text-sm font-medium shadow-sm"
                    >
                        Apply
                    </button>
                </div>
            </form>

            {error ? (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
                    {error}
                </div>
            ) : scenarios.length === 0 ? (
                <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-brand-border">
                    <div className="mx-auto w-16 h-16 rounded-xl bg-brand-primary/10 flex items-center justify-center mb-4">
                        <Glasses size={28} className="text-brand-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-brand-text mb-2">No VR scenarios yet</h3>
                    <p className="text-sm text-brand-muted max-w-sm mx-auto">
                        Create your first scenario and it will appear here.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {scenarios.map((scenario) => (
                        <article
                            key={scenario.id}
                            className="bg-white border border-brand-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="aspect-[16/9] bg-brand-soft relative overflow-hidden group">
                                {scenario.previewSasUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={scenario.previewSasUrl}
                                        alt={scenario.title || "Scenario preview"}
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-brand-muted bg-brand-bg transition-colors group-hover:bg-brand-soft">
                                        <Glasses size={28} className="text-brand-muted/50" />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-2 flex-wrap text-xs">
                                    <span
                                        className={`px-2 py-1 rounded-full border font-medium ${difficultyBadgeColor(
                                            scenario.difficultyLevel
                                        )}`}
                                    >
                                        {scenario.difficultyLevel?.trim() || "Unspecified"}
                                    </span>
                                    <span className="text-brand-muted">{scenario.status || "Unknown"}</span>
                                </div>

                                <h2 className="text-lg font-semibold text-brand-text leading-6 truncate">
                                    {scenario.title || "Untitled Scenario"}
                                </h2>

                                <div className="flex items-center gap-4 text-sm text-brand-muted">
                                    <span className="inline-flex items-center gap-1.5">
                                        <Clock3 size={15} />
                                        {formatDuration(scenario.estimatedDuration)}
                                    </span>
                                    <span className="inline-flex items-center gap-1.5">
                                        <Calendar size={15} />
                                        {formatCreatedAt(scenario.createdAt)}
                                    </span>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {!error && totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                    <p className="text-sm text-brand-muted">
                        Page <span className="font-semibold text-brand-text">{currentPage}</span> of{" "}
                        <span className="font-semibold text-brand-text">{totalPages}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        {currentPage > 1 ? (
                            <Link
                                href={`/instructor/vr-scenarios?${previousQuery}`}
                                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-brand-border text-sm text-brand-text hover:bg-brand-bg"
                            >
                                <ChevronLeft size={16} />
                                Previous
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-brand-border text-sm text-brand-muted cursor-not-allowed">
                                <ChevronLeft size={16} />
                                Previous
                            </span>
                        )}

                        {currentPage < totalPages ? (
                            <Link
                                href={`/instructor/vr-scenarios?${nextQuery}`}
                                className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-brand-border text-sm text-brand-text hover:bg-brand-bg"
                            >
                                Next
                                <ChevronRight size={16} />
                            </Link>
                        ) : (
                            <span className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-brand-border text-sm text-brand-muted cursor-not-allowed">
                                Next
                                <ChevronRight size={16} />
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
