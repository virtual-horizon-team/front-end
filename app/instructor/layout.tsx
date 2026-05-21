import InstructorLayout from "@/features/instructor/components/InstructorLayout";

export default async function InstructorRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <InstructorLayout>{children}</InstructorLayout>;
}
