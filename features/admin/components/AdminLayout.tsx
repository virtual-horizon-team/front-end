import Sidebar from "./Sidebar";
import ToastContainer from "@/features/instructor/components/Toast";

interface AdminLayoutProps {
    children: React.ReactNode;
    userName?: string;
    email?: string;
}

export default function AdminLayout({ children, userName, email }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-brand-bg text-brand-text">
            {/* Sidebar Navigation */}
            <Sidebar userName={userName} email={email} />
            
            {/* Main Application Container */}
            <main className="lg:ml-[260px] min-h-screen flex flex-col">
                <div className="flex-1 p-6 md:p-10 max-w-[1400px] mx-auto w-full">
                    {children}
                </div>
            </main>

            {/* Global Admin Notifications */}
            <ToastContainer />
        </div>
    );
}
