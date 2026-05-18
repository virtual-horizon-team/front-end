import AdminLayout from "@/features/admin/components/AdminLayout";
import { requireAdmin } from "@/features/auth/lib/require-admin";
import { getSession } from "@/features/auth/lib/get-session";

export default async function AdminRootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Ensure user has administrative privileges before loading any content
    await requireAdmin();
    
    // Fetch current user session to personalize layout sidebar/headers
    const session = await getSession();

    return (
        <AdminLayout 
            userName={session?.userName} 
            email={session?.email}
        >
            {children}
        </AdminLayout>
    );
}
