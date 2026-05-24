import { redirect } from "next/navigation";
import { getSession } from "@/features/auth/lib/get-session";
import InstructorOnboardingWizard from "@/features/instructor/components/InstructorOnboardingWizard";

export const metadata = {
  title: "Apply as Instructor - Virtual Horizon",
  description: "Apply to become a VR educator and class creator on Virtual Horizon.",
};

export default async function TeachPage() {
  const session = await getSession();

  // 1. If not authenticated, redirect to login
  if (!session) {
    redirect("/login?redirect=/teach");
  }

  // 2. If already an instructor, redirect to instructor dashboard
  if (session.isInstructor) {
    redirect("/instructor/dashboard");
  }

  return (
    <main className="pt-20 pb-16 bg-brand-bg min-h-screen">
      <InstructorOnboardingWizard />
    </main>
  );
}
