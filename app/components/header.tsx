import Link from 'next/link';
import './header.css';
import { getSession } from '@/features/auth/lib/get-session';

export default async function Header() {
    const session = await getSession();
    
    return (
        <div className="fixed lg:top-12 left-1/2 -translate-x-1/2 w-full md:w-[80%] z-50">
            <div className='p-[1.5px] md:rounded-3xl gradient-border'>
                <div className="h-16 md:h-22 md:rounded-3xl bg-[#13151B] text-white flex items-center justify-between px-8 z-50">
                    <Link className='z-50' href={'/'}><h1 className="text-[18px] md:text-[28px] font-semibold z-50">Virtual Horizon</h1></Link>
                    <ul className=" gap-[100px] hidden lg:flex">
                        <Link href={'/'} className="cursor-pointer hover:text-gray-400 font-thin text-xl z-50">Home</Link>
                        <Link href={'/about'} className="cursor-pointer hover:text-gray-400 font-thin text-xl">About</Link>
                        <Link href={'/features'} className="cursor-pointer hover:text-gray-400 font-thin text-xl">Feature</Link>
                    </ul>
                    {session ? (
                        <div className='flex gap-4 items-center'>
                            <Link href={'/pair-device'} className="bg-[#1F1C1C] text-white px-2 md:px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#2B2929] to-[#3A3A3A] cursor-pointer z-50">Pair Device</Link>
                            <p>{session.userName}</p>
                        </div>
                    ) : (
                        <div className='flex gap-4'>
                            <Link href={'/pair-device'} className="bg-[#1F1C1C] text-white px-2 md:px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#2B2929] to-[#3A3A3A] cursor-pointer z-50">Pair Device</Link>
                            <Link href={'/login'} className="bg-blue-500 text-white px-2 md:px-4 py-2 rounded-[10px] bg-gradient-to-r from-[#6E27E0] to-[#460F9E] cursor-pointer z-50">Login</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}