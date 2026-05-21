"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, Link2 } from "lucide-react";

interface SessionData {
  userId?: string;
  userName: string;
  email?: string;
}

interface HeaderClientProps {
  session: SessionData | null;
}

export default function HeaderClient({ session }: HeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Navigation Links matching the Stitch Design exactly
  const navLinks = [
    { name: "Find Courses", href: "/courses" },
    { name: "Teach on Virtual Horizon", href: "/teach" },
    { name: "Scholarships", href: "/scholarships" },
    { name: "Community", href: "/community" },
  ];

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <header className="bg-white border-b border-brand-border sticky top-0 w-full z-50 shadow-sm">
      <div className="flex justify-between items-center max-w-container-max mx-auto px-6 w-full h-16">
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
              // Highlight "Find Courses" if we are on the courses page or homepage
              const isFindCourses = link.name === "Find Courses";
              const isActive = isFindCourses 
                ? (pathname === "/courses" || pathname === "/") 
                : pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href === "/courses" ? "/courses" : "#"}
                  className={`text-[16px] leading-6 font-medium transition-all duration-200 ${
                    isActive
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
          <Link
            href="/pair-device"
            className="flex items-center gap-1.5 text-brand-muted hover:text-brand-primary text-[14px] font-medium transition-colors"
          >
            <Link2 className="w-4 h-4" />
            Pair Device
          </Link>

          {session ? (
            <div className="flex items-center gap-4">
              <span className="text-[14px] font-semibold text-brand-text bg-brand-soft/50 py-1.5 px-3.5 rounded-full border border-brand-border">
                {session.userName}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-brand-muted hover:text-brand-primary text-sm font-medium transition-colors"
                title="Logout"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
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
        <div className="md:hidden flex items-center">
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
        <div className="md:hidden border-t border-brand-border bg-white w-full py-4 px-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => {
              const isFindCourses = link.name === "Find Courses";
              const isActive = isFindCourses 
                ? (pathname === "/courses" || pathname === "/") 
                : pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href === "/courses" ? "/courses" : "#"}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-[15px] font-medium py-1 transition-colors ${
                    isActive ? "text-brand-primary font-bold" : "text-brand-muted"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <hr className="border-brand-border" />

          <div className="flex flex-col gap-3">
            <Link
              href="/pair-device"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-brand-muted hover:text-brand-primary text-sm font-medium py-1"
            >
              <Link2 className="w-4 h-4" />
              Pair Device
            </Link>

            {session ? (
              <div className="flex flex-col gap-3">
                <span className="text-sm font-semibold text-brand-text">
                  Logged in as: <span className="text-brand-primary">{session.userName}</span>
                </span>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center gap-2 text-brand-primary hover:text-brand-hover text-sm font-semibold py-1.5 self-start"
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
