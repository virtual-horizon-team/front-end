import { getSession } from "@/features/auth/lib/get-session";
import JobDetailsClient from "./job-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailsPage({ params }: PageProps) {
  const session = await getSession();
  const { id } = await params;

  return <JobDetailsClient jobId={id} session={session || undefined} />;
}
