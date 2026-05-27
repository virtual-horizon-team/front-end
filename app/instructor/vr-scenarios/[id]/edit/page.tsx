import Link from "next/link";
import { ArrowLeft, Pencil, AlertCircle } from "lucide-react";
import { fetchScenarioDisplay, fetchScenarioMetadata } from "@/features/instructor/services/scenario.service";
import { getSession } from "@/features/auth/lib/get-session";
import { redirect } from "next/navigation";
import ScenarioMetadataForm from "@/features/instructor/components/ScenarioMetadataForm";
import ScenarioImagesForm from "@/features/instructor/components/ScenarioImagesForm";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ title?: string }>;
}

export default async function ScenarioEditPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { title: titleParam } = await searchParams;

    // Only instructors can access the edit page
    const session = await getSession();
    if (!session?.isInstructor) {
        redirect("/forbidden");
    }

    let displayData = null;
    let metadataData = null;
    let error = "";

    try {
        // Fetch both display (for title fallback) and metadata (for the form)
        const [displayRes, metadataRes] = await Promise.all([
            fetchScenarioDisplay(id),
            fetchScenarioMetadata(id)
        ]);
        displayData = displayRes;
        metadataData = metadataRes;
    } catch (err) {
        error = err instanceof Error ? err.message : "Failed to load scenario metadata";
    }

    const title = titleParam
        ? decodeURIComponent(titleParam)
        : displayData
            ? `Scenario ${id.slice(0, 8)}...`
            : `Scenario ${id.slice(0, 8)}...`;

    return (
        <div className="pt-12 lg:pt-0">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm text-brand-muted mb-2 flex-wrap">
                <Link href="/instructor/vr-scenarios" className="hover:text-brand-text transition-colors">
                    VR Scenarios
                </Link>
                <span className="text-brand-border">›</span>
                <Link
                    href={`/instructor/vr-scenarios/${id}${titleParam ? `?title=${titleParam}` : ""}`}
                    className="hover:text-brand-text transition-colors truncate max-w-[180px]"
                >
                    {title}
                </Link>
                <span className="text-brand-border">›</span>
                <span className="text-brand-text font-medium">Edit Metadata</span>
            </nav>

            <Link
                href={`/instructor/vr-scenarios/${id}${titleParam ? `?title=${titleParam}` : ""}`}
                className="inline-flex items-center gap-1.5 text-sm text-brand-primary hover:text-brand-hover font-medium mb-6 transition-colors group"
            >
                <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" />
                Back to Scenario
            </Link>

            {/* Page header */}
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-primary/10 flex items-center justify-center flex-shrink-0">
                    <Pencil size={18} className="text-brand-primary" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-brand-text">Edit Scenario Metadata</h1>
                    <p className="text-sm text-brand-muted mt-0.5">{title}</p>
                </div>
            </div>

            {error || !metadataData ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
                    <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-semibold text-red-700 mb-1">Failed to load scenario</p>
                        <p className="text-sm text-red-600">{error || "Metadata could not be loaded."}</p>
                    </div>
                </div>
            ) : (
                <div className="space-y-8">
                    <ScenarioMetadataForm scenarioId={id} initialData={metadataData} />
                    <ScenarioImagesForm scenarioId={id} currentImages={metadataData.imageAssetSasLinks || []} />
                </div>
            )}
        </div>
    );
}
