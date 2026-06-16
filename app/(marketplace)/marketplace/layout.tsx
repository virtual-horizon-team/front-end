import React from "react";
import Link from "next/link";
import { getSession } from "@/features/auth/lib/get-session";
import { Wallet, LogOut, User, Sparkles, BookOpen, ShoppingCart, Receipt, Package } from "lucide-react";
import { logoutUser } from "@/features/auth/actions/logout";
import MarketplaceCartBadge from "./components/marketplace-cart-badge";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
  isAdmin?: boolean;
}

export default async function MarketplaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = (await getSession()) as SessionData | null;

  return (
    <div className="min-h-screen bg-marketplace-bg text-slate-100 flex flex-col relative overflow-hidden">
      {/* Dynamic ambient glowing backgrounds */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Marketplace Top Bar */}
      <header className="bg-marketplace-bg/80 backdrop-blur-md border-b border-marketplace-border sticky top-0 w-full z-50 shadow-lg relative">
        <div className="flex justify-between items-center px-6 w-full h-16">
          
          {/* Brand Logo & Indicators */}
          <div className="flex items-center gap-6">
            <Link href="/marketplace" className="flex items-center gap-2">
              <span className="font-extrabold text-[22px] md:text-[24px] tracking-tight text-white">
                Virtual Horizon
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center bg-marketplace-primary/10 border border-marketplace-primary/20 text-[10px] font-bold text-marketplace-primary px-3 py-1 rounded-full uppercase tracking-widest">
              Marketplace
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link href="/marketplace" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Home
            </Link>
            <Link
              href="/marketplace/assets"
              className="text-white font-bold transition-colors px-3 py-1.5 rounded-lg bg-marketplace-primary/10 border border-marketplace-primary/20 hover:bg-marketplace-primary/20 flex items-center gap-1.5 text-marketplace-primary"
            >
              <Package className="w-3.5 h-3.5" />
              Asset Store
            </Link>
            <Link href="/marketplace/jobs" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
              Freelance Hub
            </Link>
            {session && (
              <>
                <Link href="/marketplace/assets/my" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  My Assets
                </Link>
                <Link href="/marketplace/orders" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  My Orders
                </Link>
                <Link href="/marketplace/jobs/my" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  My Jobs
                </Link>
                <Link href="/marketplace/contracts" className="text-slate-400 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-white/5">
                  My Contracts
                </Link>
              </>
            )}
          </nav>

          {/* Right Controls / Auth */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-slate-400 hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-full border border-white/5"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-400" />
              Academy
            </Link>

            {session ? (
              <div className="flex items-center gap-3">
                <MarketplaceCartBadge />
                <Link
                  href="/wallet"
                  className="p-2 text-slate-300 hover:text-white transition-all duration-150 relative group flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full border border-white/10"
                  aria-label="My Wallet"
                >
                  <Wallet className="w-4.5 h-4.5 text-marketplace-primary" />
                </Link>
                
                <div className="relative group py-2">
                  <span className="text-[13px] font-semibold text-slate-200 bg-white/5 hover:bg-white/10 py-1.5 px-3 rounded-full border border-white/10 cursor-pointer flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-marketplace-primary/20 text-marketplace-primary flex items-center justify-center text-[10px] font-bold uppercase border border-marketplace-primary/30">
                      {session.userName.slice(0, 2)}
                    </span>
                    <span>{session.userName}</span>
                  </span>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full pt-1.5 w-48 bg-marketplace-soft border border-marketplace-border rounded-xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-1">
                      <Link
                        href="/marketplace/profile"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/marketplace/jobs/my"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Jobs & Bids
                      </Link>
                      <Link
                        href="/marketplace/contracts"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Contracts
                      </Link>
                      <Link
                        href="/wallet"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Wallet
                      </Link>
                      <Link
                        href="/marketplace/orders"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Orders
                      </Link>
                      <Link
                        href="/marketplace/cart"
                        className="block px-4 py-2 text-xs text-slate-300 hover:bg-white/5 hover:text-white transition-colors font-semibold"
                      >
                        My Cart
                      </Link>
                      <hr className="border-marketplace-border my-1" />
                      <form action={async () => {
                        "use server";
                        await logoutUser();
                      }}>
                        <button
                          type="submit"
                          className="w-full text-left block px-4 py-2 text-xs text-marketplace-primary hover:bg-white/5 hover:text-white transition-colors font-semibold cursor-pointer"
                        >
                          Sign Out
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/login"
                  className="text-slate-400 hover:text-white text-[13px] font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  className="bg-marketplace-primary text-white px-4 py-1.5 rounded-lg font-bold text-[13px] transition-all shadow-md active:scale-95 duration-150"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="flex-grow flex flex-col relative z-10 w-full">
        {children}
      </div>

      {/* Marketplace Footer */}
      <footer className="border-t border-marketplace-border bg-[#030712] py-8 z-10 relative">
        <div className="w-full px-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div>
            <span className="font-extrabold text-[15px] text-white block mb-1">
              Virtual Horizon <span className="text-marketplace-primary font-semibold">Marketplace</span>
            </span>
            <p>© {new Date().getFullYear()} Virtual Horizon. All rights reserved.</p>
          </div>
          <div className="flex gap-6 font-semibold">
            <Link href="/privacy" className="hover:text-slate-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-slate-300 transition-colors">Terms of Service</Link>
            <Link href="/help" className="hover:text-slate-300 transition-colors">Support Center</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
