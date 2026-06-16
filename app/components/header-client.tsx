"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Link2, Wallet } from "lucide-react";
import { API_BASE_URL } from "@/lib/config";
import { getAccessToken } from "@/features/auth/lib/get-access-token";
import { logoutUser } from "@/features/auth/actions/logout";
import { CartBadge } from "@/features/cart/components/CartBadge";
import { ThemeToggle } from "./theme-toggle";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
  isInstructor?: boolean;
  isAdmin?: boolean;
}

interface HeaderClientProps {
  session: SessionData | null;
}

export default function HeaderClient({ session }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!session?.userId) {
      setAvatarSrc(null);
      return;
    }

    let active = true;
    let objectUrl: string | null = null;

    const fetchAvatar = async () => {
      try {
        const token = await getAccessToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        const res = await fetch(`${API_BASE_URL}/api/Profile/avatar?userId=${session.userId}`, {
          headers
        });
        if (res.ok) {
          const blob = await res.blob();
          if (active) {
            if (blob.type.startsWith("image/")) {
              objectUrl = URL.createObjectURL(blob);
              setAvatarSrc(objectUrl);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching avatar", err);
      }
    };

    fetchAvatar();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [session?.userId]);

  // Navigation Links matching the Stitch Design exactly
  const navLinks = [
    { name: "Find Courses", href: "/courses" },
    ...(!session?.isInstructor ? [{ name: "Teach on Virtual Horizon", href: "/teach" }] : []),
    { name: "Products", href: "/products" },
    { name: "Pair Device", href: "/pair-device" },
    { name: "Community", href: "/community" },
  ];

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="bg-background border-b border-brand-border sticky top-0 w-full z-50 shadow-sm">
      <div className="flex justify-between items-center px-6 w-full h-16">
        {/* Left Section: Brand Logo & Navigation */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-bold text-[24px] leading-8 tracking-tight text-brand-primary">
              Virtual Horizon
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              // If it's Products, render a dropdown
              if (link.name === "Products") {
                const isActive = pathname.startsWith("/products") || pathname.startsWith("/marketplace");
                return (
                  <div key={link.name} className="relative group py-2">
                    <button
                      type="button"
                      className={`text-[16px] leading-6 font-medium transition-all duration-200 cursor-pointer flex items-center gap-1 ${
                        isActive
                          ? "text-brand-primary font-bold border-b-2 border-brand-primary pb-0.5"
                          : "text-brand-muted hover:text-brand-primary"
                      }`}
                    >
                      Products
                      <svg className="w-3.5 h-3.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Products Dropdown List Wrapper */}
                    <div className="absolute left-0 top-full pt-2 w-48 z-50 hidden group-hover:block animate-in fade-in duration-100">
                      <div className="bg-white border border-brand-border rounded-xl shadow-xl py-1.5">
                        <Link
                          href="/products"
                          className="block px-4 py-2.5 text-sm text-brand-muted hover:text-brand-primary hover:bg-brand-soft transition-colors font-semibold"
                        >
                          Products Catalog
                        </Link>
                        <Link
                          href="/marketplace"
                          className="block px-4 py-2.5 text-sm text-brand-muted hover:text-brand-primary hover:bg-brand-soft transition-colors font-semibold"
                        >
                          Asset Marketplace
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              }

              // Highlight "Find Courses" if we are on the courses page or homepage
              const isFindCourses = link.name === "Find Courses";
              const isActive = isFindCourses
                ? (pathname === "/courses" || pathname === "/")
                : pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[16px] leading-6 font-medium transition-all duration-200 ${isActive
                    ? "text-brand-primary font-bold border-b-2 border-brand-primary pb-1"
                    : "text-brand-muted hover:text-brand-primary"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Auth Buttons */}
        <div className="hidden md:flex items-center gap-6">

          {session ? (
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link
                href="/wallet"
                className="p-2 text-brand-muted hover:text-brand-primary transition-all duration-150 relative group flex items-center justify-center bg-brand-soft/30 hover:bg-brand-soft rounded-full border border-brand-border"
                aria-label="My Wallet"
              >
                <Wallet className="w-5 h-5" />
              </Link>
              <CartBadge />
              <div className="relative group py-2">
                <Link
                  href="/profile"
                  className="text-[14px] font-semibold text-brand-text bg-brand-soft/50 hover:bg-brand-soft hover:text-brand-primary py-1.5 px-3 rounded-full border border-brand-border transition-all duration-150 flex items-center gap-2"
                >
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt={session.userName}
                      className="w-6 h-6 rounded-full object-cover border border-brand-border"
                    />
                  ) : (
                    <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-[10px] font-bold uppercase border border-brand-primary/20">
                      {session.userName.slice(0, 2)}
                    </span>
                  )}
                  <span>{session.userName}</span>
                </Link>

                {/* Dropdown Menu (Hover Triggered) */}
                <div className="absolute right-0 top-full pt-1.5 w-48 bg-background border border-brand-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <div className="py-1">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                    >
                      My Profile
                    </Link>
                    <Link
                      href="/wallet"
                      className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                    >
                      My Wallet
                    </Link>
                    <Link
                      href="/transactions"
                      className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                    >
                      Transaction Ledger
                    </Link>
                    <Link
                      href="/my-courses"
                      className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                    >
                      My Courses
                    </Link>
                    {session.isInstructor && (
                      <Link
                        href="/instructor/dashboard"
                        className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                      >
                        Instructor Dashboard
                      </Link>
                    )}
                    {session.isAdmin && (
                      <Link
                        href="/admin"
                        className="block px-4 py-2 text-sm text-brand-text hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <hr className="border-brand-border my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left block px-4 py-2 text-sm text-red-600 hover:bg-brand-soft hover:text-brand-primary transition-colors font-medium cursor-pointer"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ThemeToggle />
              <Link
                href="/login"
                className="text-brand-muted hover:text-brand-primary text-[14px] font-semibold transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/login?tab=register"
                className="bg-brand-primary text-white hover:bg-brand-hover px-6 py-2 rounded-lg font-bold text-[14px] transition-all shadow-sm active:scale-95 duration-150"
              >
                sign up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-brand-text hover:text-brand-primary p-2 focus:outline-none"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 animate-in fade-in zoom-in duration-200" />
            ) : (
              <Menu className="w-6 h-6 animate-in fade-in zoom-in duration-200" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-brand-border bg-background w-full py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isFindCourses = link.name === "Find Courses";
              const isActive = isFindCourses
                ? (pathname === "/courses" || pathname === "/")
                : pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-[15px] font-medium py-1 transition-colors ${isActive ? "text-brand-primary font-bold" : "text-brand-muted"
                    }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <hr className="border-brand-border" />

          <div className="flex flex-col gap-3">
            {session ? (
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  {avatarSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarSrc}
                      alt={session.userName}
                      className="w-10 h-10 rounded-full object-cover border border-brand-border"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-bold uppercase border border-brand-primary/20">
                      {session.userName.slice(0, 2)}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-brand-muted font-medium">Logged in as</span>
                    <span className="text-sm font-bold text-brand-text">{session.userName}</span>
                  </div>
                </div>
                <Link
                  href="/cart"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover py-1 self-start flex items-center gap-2"
                >
                  My Cart
                </Link>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover py-1 self-start"
                >
                  My Profile
                </Link>
                <Link
                  href="/wallet"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover py-1 self-start"
                >
                  My Wallet
                </Link>
                <Link
                  href="/transactions"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover py-1 self-start"
                >
                  Transaction Ledger
                </Link>
                <Link
                  href="/my-courses"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-semibold text-brand-primary hover:text-brand-hover py-1 self-start"
                >
                  My Courses
                </Link>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 text-brand-muted hover:text-red-500 text-sm font-semibold py-1 self-start cursor-pointer"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5 pt-2">
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-brand-muted hover:text-brand-primary text-sm font-medium py-2 rounded-lg border border-brand-border hover:bg-brand-soft transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/login?tab=register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center bg-brand-primary text-white hover:bg-brand-hover py-2 rounded-lg font-bold text-sm shadow-sm transition-all"
                >
                  sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
