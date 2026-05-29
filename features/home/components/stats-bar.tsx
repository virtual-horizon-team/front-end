"use client";

import { useEffect, useRef, useState } from "react";
import { Users, Globe, MonitorPlay } from "lucide-react";

const stats = [
  { icon: Users, value: "500+", label: "Active Students", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: MonitorPlay, value: "50+", label: "VR Scenarios", color: "text-brand-primary", bg: "bg-brand-peach" },
  { icon: Globe, value: "3", label: "Platform Apps", color: "text-emerald-600", bg: "bg-emerald-50" },
];

export default function StatsBar() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#f9fafb] py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-6 sm:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`flex items-center gap-4 p-5 bg-white rounded-2xl border border-brand-border/50 shadow-sm transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 120}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-brand-navy tracking-tight">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-brand-muted font-medium">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
