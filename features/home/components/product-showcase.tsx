"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Layers, Glasses, Code2, ArrowRight } from "lucide-react";

const products = [
  {
    id: "studio",
    name: "Virtual Horizon Studio",
    tagline: "Build & Publish",
    description:
      "The desktop workspace where instructors assemble 3D training scenarios, configure learning objectives, and publish immersive lessons directly to the student directory.",
    icon: Layers,
    color: "text-brand-primary",
    bg: "bg-brand-peach",
    borderHover: "hover:border-brand-primary/30",
    features: ["Drag-and-drop scene builder", "Learning step sequencer", "One-click publishing"],
  },
  {
    id: "viewer",
    name: "VR Viewer 3D",
    tagline: "Practice & Learn",
    description:
      "The cross-platform runtime application that students use to access 3D scenarios, interact with virtual environments, and practice real-world technical exercises.",
    icon: Glasses,
    color: "text-blue-600",
    bg: "bg-blue-50",
    borderHover: "hover:border-blue-300",
    features: ["VR headset & desktop support", "Real-time progress tracking", "Interactive simulations"],
  },
  {
    id: "sdk",
    name: "Creator SDK",
    tagline: "Develop & Extend",
    description:
      "A comprehensive Unity integration toolkit that enables developers to build custom 3D assets, write Lua scripts, and package content for the Virtual Horizon ecosystem.",
    icon: Code2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    borderHover: "hover:border-emerald-300",
    features: ["Unity plugin integration", "Lua scripting engine", "Asset packaging & export"],
  },
];

export default function ProductShowcase() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="bg-white py-20 sm:py-28 px-6 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach/60 text-brand-primary rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            Our Products
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight">
            The Virtual Horizon Suite
          </h2>
          <p className="mt-4 text-brand-muted text-base sm:text-lg leading-relaxed">
            A unified system of tools for developers, instructors, and students
            — working together to deliver immersive learning experiences.
          </p>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {products.map((product, i) => (
            <div
              key={product.id}
              className={`group relative bg-white rounded-2xl border border-brand-border/60 p-8 transition-all duration-500 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 ${product.borderHover} ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-8"
              }`}
              style={{ transitionDelay: `${i * 150}ms` }}
            >
              {/* Icon */}
              <div className={`w-14 h-14 rounded-2xl ${product.bg} flex items-center justify-center mb-6`}>
                <product.icon className={`w-7 h-7 ${product.color}`} />
              </div>

              {/* Content */}
              <p className={`text-xs font-bold uppercase tracking-wider ${product.color} mb-2`}>
                {product.tagline}
              </p>
              <h3 className="text-xl font-extrabold text-brand-navy mb-3">
                {product.name}
              </h3>
              <p className="text-brand-muted text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Feature list */}
              <ul className="space-y-2 mb-8">
                {product.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-brand-navy">
                    <span className={`w-1.5 h-1.5 rounded-full ${product.color === "text-brand-primary" ? "bg-brand-primary" : product.color === "text-blue-600" ? "bg-blue-500" : "bg-emerald-500"}`} />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Learn more link */}
              <Link
                href="/products"
                className={`inline-flex items-center gap-1 text-sm font-bold ${product.color} group-hover:gap-2 transition-all duration-200`}
              >
                Learn more
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
