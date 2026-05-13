import InstructorLayout from "@/features/instructor/components/InstructorLayout";
import { requireCapability } from "@/features/auth/lib/require-capability";

export default async function InstructorRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    await requireCapability("isInstructor");
    
    return <InstructorLayout>{children}</InstructorLayout>;
}
