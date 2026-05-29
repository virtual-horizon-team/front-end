"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Eye, Cpu, BookOpen, ShieldCheck, ShoppingBag } from "lucide-react";
 
const features = [
  { icon: Box, title: "Immersive 3D Scenarios", description: "Step into realistic virtual environments that simulate real-world technical challenges.", color: "text-brand-primary", bg: "bg-brand-peach" },
  { icon: Eye, title: "Interactive 3D Previews", description: "Inspect, zoom, and rotate high-fidelity WebGL training models directly from your web browser.", color: "text-blue-600", bg: "bg-blue-50" },
  { icon: Cpu, title: "Creator SDK Support", description: "Import custom 3D models, interactive assets, and Unity packages to build customized training.", color: "text-emerald-600", bg: "bg-emerald-50" },
  { icon: BookOpen, title: "Integrated VR Courses", description: "Learn through comprehensive courses combining video lectures, quizzes, documents, and interactive VR training scenarios.", color: "text-amber-600", bg: "bg-amber-50" },
  { icon: ShieldCheck, title: "Role-Based Access", description: "Separate dashboards for admins, instructors, and students with fine-grained permissions.", color: "text-purple-600", bg: "bg-purple-50" },
  { icon: ShoppingBag, title: "Course Catalog", description: "Browse, enroll, and learn from a variety of VR-enhanced courses created by certified instructors.", color: "text-rose-600", bg: "bg-rose-50" },
];

export default function FeaturesGrid() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach/60 text-brand-primary rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            Everything You Need to Train Smarter
          </h2>
          <p className="mt-4 text-brand-muted text-base sm:text-lg leading-relaxed">
            A complete ecosystem built for immersive, scalable technical education
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`group p-7 rounded-2xl border border-brand-border/50 bg-white hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 transition-all duration-500 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-base font-extrabold text-brand-navy mb-2">{f.title}</h3>
              <p className="text-brand-muted text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
