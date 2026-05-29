"use client";

import { useEffect, useRef, useState } from "react";
import { Code2, Layers, Glasses, ArrowRight } from "lucide-react";

const steps = [
  {
    step: "01",
    title: "Build in Unity",
    description: "Use the Creator SDK to import 3D models, write Lua scripts, and package interactive assets ready for VR training.",
    icon: Code2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    borderColor: "border-emerald-200",
  },
  {
    step: "02",
    title: "Compose in Studio",
    description: "Open VR Studio to arrange assets into scenes, define learning steps, set objectives, and publish training scenarios.",
    icon: Layers,
    color: "text-brand-primary",
    bg: "bg-brand-peach",
    borderColor: "border-red-200",
  },
  {
    step: "03",
    title: "Practice in Viewer",
    description: "Students launch VR Viewer 3D to enter simulations, complete hands-on tasks, and get real-time analytics.",
    icon: Glasses,
    color: "text-blue-600",
    bg: "bg-blue-50",
    borderColor: "border-blue-200",
  },
];

export default function HowItWorks() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-[#f9fafb] py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach/60 text-brand-primary rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            From Asset to Immersive Practice
          </h2>
          <p className="mt-4 text-brand-muted text-base sm:text-lg leading-relaxed">
            Three simple steps connect your entire VR training pipeline
          </p>
        </div>

        <div className="relative">
          <div className="hidden lg:block absolute top-[4.5rem] left-[16.67%] right-[16.67%] h-[2px]">
            <div className={`h-full bg-gradient-to-r from-emerald-300 via-brand-primary/40 to-blue-300 transition-all duration-1000 ${isVisible ? "w-full" : "w-0"}`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {steps.map((item, i) => (
              <div key={item.step} className={`relative text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ transitionDelay: `${i * 200}ms` }}>
                <div className="relative z-10 mx-auto mb-6">
                  <div className={`w-20 h-20 rounded-2xl ${item.bg} border-2 ${item.borderColor} flex items-center justify-center mx-auto shadow-sm`}>
                    <item.icon className={`w-9 h-9 ${item.color}`} />
                  </div>
                  <span className={`absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border-2 ${item.borderColor} flex items-center justify-center text-xs font-extrabold ${item.color}`}>
                    {item.step}
                  </span>
                </div>
                <div className="bg-white rounded-2xl border border-brand-border/50 p-6 shadow-sm">
                  <h3 className="text-lg font-extrabold text-brand-navy mb-2">{item.title}</h3>
                  <p className="text-brand-muted text-sm leading-relaxed">{item.description}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center py-4">
                    <ArrowRight className="w-5 h-5 text-brand-muted rotate-90" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
