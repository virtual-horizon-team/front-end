import { PairDeviceForm } from "@/features/auth/components/pair-device-form";
import { getSession } from "@/features/auth/lib/get-session";
import { redirect } from "next/navigation";

const Page = async () => {
    const session = await getSession();

    if (!session) {
        redirect("/login");
    }

    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-brand-bg relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-primary/10 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-navy/5 blur-[120px] rounded-full" />
            <div className="relative z-10 w-full px-4">
                <PairDeviceForm />
            </div>
        </main>
    );
};

export default Page;
