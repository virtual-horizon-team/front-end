import Sidebar from "./Sidebar";
import ToastContainer from "./Toast";
import Header from "@/app/components/header";

interface InstructorLayoutProps {
    children: React.ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
    return (
        <div className="min-h-screen bg-brand-bg flex flex-col">
            <Header />
            <div className="flex flex-1 relative">
                <Sidebar />
                <main className="lg:ml-[260px] flex-1 min-h-[calc(100vh-64px)]">
                    <div className="p-6 md:p-10 max-w-[1200px] mx-auto w-full">
                        {children}
                    </div>
                </main>
            </div>
            <ToastContainer />
        </div>
    );
}
