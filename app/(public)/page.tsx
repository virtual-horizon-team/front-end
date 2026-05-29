import { getSession } from "@/features/auth/lib/get-session";
import Hero from "@/features/home/components/hero";
import StatsBar from "@/features/home/components/stats-bar";
import ImmersiveIntro from "@/features/home/components/immersive-intro";
import ProductShowcase from "@/features/home/components/product-showcase";
import CourseShowcase from "@/features/home/components/course-showcase";
import HowItWorks from "@/features/home/components/how-it-works";
import FeaturesGrid from "@/features/home/components/features-grid";
import CtaSection from "@/features/home/components/cta-section";

export default async function Home() {
  const session = await getSession();

  return (
    <main>
      <Hero isLoggedIn={!!session} />
      <StatsBar />
      <ImmersiveIntro />
      <ProductShowcase />
      <CourseShowcase />
      <HowItWorks />
      <FeaturesGrid />
      <CtaSection />
    </main>
  );
}
