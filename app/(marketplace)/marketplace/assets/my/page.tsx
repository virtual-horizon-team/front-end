import { getSession } from "@/features/auth/lib/get-session";
import { redirect } from "next/navigation";
import MyAssetsClient from "./my-assets-client";

export default async function MyAssetsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login?redirect=/marketplace/assets/my");
    return null;
  }

  return <MyAssetsClient session={session} />;
}
