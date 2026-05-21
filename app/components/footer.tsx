import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-border py-8 w-full">
      <div className="max-w-container-max mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Left copyright and logo info */}
        <div className="space-y-1 text-center md:text-left">
          <span className="font-bold text-[18px] text-brand-primary block">
            Virtual Horizon
          </span>
          <p className="text-xs text-brand-muted">
            © {new Date().getFullYear()} Virtual Horizon. Empowering scholarly excellence through innovation.
          </p>
        </div>

        {/* Right Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-brand-muted">
          <Link href="/privacy" className="hover:text-brand-primary transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-brand-primary transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-brand-primary transition-colors">
            Help Center
          </Link>
          <Link href="/accessibility" className="hover:text-brand-primary transition-colors">
            Accessibility
          </Link>
        </div>
      </div>
    </footer>
  );
}
