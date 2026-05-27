import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Glasses } from "lucide-react";
import {
    fetchScenarioDisplay,
    fetchScenarioMetadata,
} from "@/features/instructor/services/scenario.service";
import ScenarioDetailClient, {
    ScenarioDetailSkeleton,
} from "@/features/instructor/components/ScenarioDetailClient";
import { getSession } from "@/features/auth/lib/get-session";
import { ScenarioMetadataResult } from "@/features/instructor/types/scenario";

export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ title?: string }>;
}

export default async function ScenarioDetailPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { title: titleParam } = await searchParams;

    // Fetch both endpoints in parallel for a single network round-trip
    const [displayResult, metadataResult] = await Promise.allSettled([
        fetchScenarioDisplay(id),
        fetchScenarioMetadata(id),
    ]);

    // If the main display endpoint fails with 404, show not-found page
    if (displayResult.status === "rejected") {
        const msg = (displayResult.reason as Error)?.message ?? "";
        if (msg.includes("404") || msg.toLowerCase().includes("not found")) {
            notFound();
        }
        // Other network error — show full-page error
        return (
            <div className="pt-12 lg:pt-0 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
                    <Glasses size={28} className="text-red-500" />
                </div>
                <h1 className="text-xl font-bold text-brand-text mb-2">Failed to load scenario</h1>
                <p className="text-sm text-brand-muted mb-6 max-w-sm">{msg}</p>
                <Link
                    href="/instructor/vr-scenarios"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-primary text-white text-sm font-medium hover:bg-brand-hover transition-colors"
                >
                    <ArrowLeft size={15} />
                    Back to Scenarios
                </Link>
            </div>
        );
    }

    const display = displayResult.value;

    let metadata: ScenarioMetadataResult | null = null;
    let metadataError: string | null = null;
    if (metadataResult.status === "fulfilled") {
        metadata = metadataResult.value;
    } else {
        metadataError =
            (metadataResult.reason as Error)?.message ?? "Failed to load metadata";
    }

    // Resolve title: URL query param → fallback to scenario id prefix
    const title = titleParam
        ? decodeURIComponent(titleParam)
        : `Scenario ${id.slice(0, 8)}...`;

    // Check if the current user is an instructor
    const session = await getSession();
    const isInstructor = session?.isInstructor ?? false;

    return (
        <ScenarioDetailClient
            display={display}
            metadata={metadata}
            metadataError={metadataError}
            title={title}
            isInstructor={isInstructor}
        />
    );
}
