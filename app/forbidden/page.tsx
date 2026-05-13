import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center flex flex-col items-center animate-fade-in">
                <div className="relative w-24 h-24 mb-8 flex items-center justify-center">
                    <div className="relative bg-white p-5 rounded-xl border border-brand-border shadow-sm">
                        <ShieldAlert className="w-12 h-12 text-brand-primary" strokeWidth={1.5} />
                    </div>
                </div>
                
                <h1 className="text-4xl font-bold text-brand-text tracking-tight mb-3">
                    403
                </h1>
                <h2 className="text-xl font-semibold text-brand-text mb-4">
                    Access Forbidden
                </h2>
                <p className="text-brand-muted mb-10 text-[15px] leading-relaxed max-w-[90%]">
                    You don't have the necessary permissions to access this page or resource. Please check your credentials and try again.
                </p>

                <div className="flex gap-4">
                    <Link 
                        href="/"
                        className="group flex items-center gap-2 px-6 py-2.5 rounded-lg bg-brand-primary hover:bg-brand-hover text-white text-[14px] font-medium transition-colors duration-200 shadow-sm"
                    >
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
