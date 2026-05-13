import Link from "next/link";
import { getSession } from "@/features/auth/lib/get-session";
import Hero from "@/features/home/components/hero";

export default async function Home() {
  const session = await getSession();

  return (
    <main className="pt-[100px]"> 
      <Hero />
    </main>
  );
}
