import { getSession } from "@/features/auth/lib/get-session";
import ContractDetailsClient from "./contract-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ContractDetailsPage({ params }: PageProps) {
  const session = await getSession();
  const { id } = await params;

  return <ContractDetailsClient contractId={id} session={session || undefined} />;
}
