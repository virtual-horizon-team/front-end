import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
    return (
        <main className="min-h-screen w-full flex items-center justify-center bg-[#050510] relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 blur-[120px] rounded-full" />
            <div className="relative z-10 w-full px-4">
                <RegisterForm />
            </div>
        </main>
    );
}
