"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";

export default function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#f9fafb] py-20 sm:py-28 px-6 sm:px-8">
      <div className={`max-w-5xl mx-auto transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-navy via-[#1e293b] to-brand-navy p-12 sm:p-16 text-center">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/20 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px]" />

          <div className="relative z-10 space-y-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Ready to Transform How <br className="hidden sm:inline" />
              You Learn and Teach?
            </h2>
            <p className="text-gray-300 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Join hundreds of instructors and students already using Virtual Horizon
              to deliver immersive, hands-on technical training.
            </p>
            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <Link
                href="/login?tab=register"
                className="group inline-flex items-center gap-2 bg-brand-primary text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-brand-hover transition-all duration-200 shadow-lg shadow-brand-primary/30"
              >
                Start Learning Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white px-7 py-3.5 rounded-xl font-bold text-base border border-white/20 hover:bg-white/20 transition-all duration-200"
              >
                <Download className="w-4 h-4" />
                Download Apps
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
