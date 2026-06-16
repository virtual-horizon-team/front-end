import { getSession } from "@/features/auth/lib/get-session";
import AssetDetailsClient from "./asset-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AssetDetailsPage({ params }: PageProps) {
  const session = await getSession();
  const { id } = await params;

  return <AssetDetailsClient assetId={id} session={session || undefined} />;
}
