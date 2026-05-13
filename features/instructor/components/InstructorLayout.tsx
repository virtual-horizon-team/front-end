import Sidebar from "./Sidebar";
import ToastContainer from "./Toast";

interface InstructorLayoutProps {
    children: React.ReactNode;
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
    return (
        <div className="min-h-screen bg-brand-bg">
            <Sidebar />
            <main className="lg:ml-[260px] min-h-screen">
                <div className="p-6 md:p-10 max-w-[1200px] mx-auto w-full">
                    {children}
                </div>
            </main>
            <ToastContainer />
        </div>
    );
}
