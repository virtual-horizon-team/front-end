import { getSession } from "@/features/auth/lib/get-session";
import HeaderClient from "./header-client";

export default async function Header() {
  const session = await getSession();

  return <HeaderClient session={session} />;
}