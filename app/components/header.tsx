import Link from 'next/link';
import './header.css';
import { getSession } from '@/features/auth/lib/get-session';

export default async function Header() {
    const session = await getSession();
    
    return (
        <div className="fixed lg:top-8 left-1/2 -translate-x-1/2 w-full md:w-[80%] z-50">
            <div className="h-16 md:h-20 md:rounded-2xl bg-brand-navy border border-brand-border/20 text-white flex items-center justify-between px-8 shadow-sm">
                <Link className="z-50" href={'/'}>
                    <h1 className="text-[18px] md:text-[24px] font-semibold z-50 tracking-wide">Virtual Horizon</h1>
                </Link>
                <ul className="gap-10 hidden lg:flex">
                    <Link href={'/'} className="cursor-pointer hover:text-brand-primary text-slate-300 font-medium text-[15px] transition-colors">Home</Link>
                    <Link href={'/about'} className="cursor-pointer hover:text-brand-primary text-slate-300 font-medium text-[15px] transition-colors">About</Link>
                    <Link href={'/features'} className="cursor-pointer hover:text-brand-primary text-slate-300 font-medium text-[15px] transition-colors">Features</Link>
                </ul>
                {session ? (
                    <div className="flex gap-4 items-center">
                        <Link href={'/pair-device'} className="bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium z-50">Pair Device</Link>
                        <p className="text-sm font-medium">{session.userName}</p>
                    </div>
                ) : (
                    <div className="flex gap-4 items-center">
                        <Link href={'/pair-device'} className="bg-white/5 text-white px-4 py-2 rounded-xl border border-white/10 hover:bg-white/10 transition-colors cursor-pointer text-sm font-medium z-50">Pair Device</Link>
                        <Link href={'/login'} className="bg-brand-primary hover:bg-brand-hover text-white px-6 py-2 rounded-xl transition-colors cursor-pointer text-sm font-medium shadow-sm z-50">Login</Link>
                    </div>
                )}
            </div>
        </div>
    )
}