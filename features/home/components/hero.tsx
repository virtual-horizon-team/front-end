"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Play, Sparkles } from "lucide-react";
import VRCanvas3D from "./vr-canvas-3d";

interface HeroProps {
  isLoggedIn: boolean;
}

const MODELS = [
  { name: "Electrical Box", path: "/3d-models/industrial_electrical_box.glb" },
  { name: "HVAC Unit", path: "/3d-models/hvac_unit.glb" },
  { name: "Defibrillator", path: "/3d-models/defibrillator-_low_poly.glb" },
  { name: "Power Drill", path: "/3d-models/black__decker_drill.glb" },
  { name: "Server Rack", path: "/3d-models/server_rack.glb" },
];

export default function Hero({ isLoggedIn }: HeroProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedModelIdx, setSelectedModelIdx] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    setSelectedModelIdx(Math.floor(Math.random() * MODELS.length));
  }, []);

  return (
    <section className="relative overflow-hidden bg-white min-h-[calc(100vh-64px)]">
      {/* Decorative background elements */}
      <div className="absolute top-20 right-10 w-[500px] h-[500px] bg-brand-peach/30 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-10 left-10 w-[400px] h-[400px] bg-blue-50/60 rounded-full blur-[80px] animate-pulse-glow delay-200" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-rose-50/20 rounded-full blur-[120px]" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle, #a30014 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 sm:px-8 py-16 sm:py-20 lg:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div
            className={`lg:col-span-6 space-y-8 transition-all duration-1000 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-peach/60 border border-brand-primary/10 rounded-full">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-xs font-bold tracking-wider uppercase text-brand-primary">
                Immersive VR Learning Platform
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-brand-navy leading-[1.1] tracking-tight">
              The Future of{" "}
              <span className="text-gradient-crimson">Technical Training</span>{" "}
              is Immersive
            </h1>

            {/* Subtitle */}
            <p className="text-brand-muted text-lg sm:text-xl leading-relaxed max-w-xl">
              We combine high-fidelity virtual reality with real-world
              curriculum to transform how skills are built.{" "}
              <span className="font-semibold text-brand-navy">
                No classrooms. No boundaries.
              </span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2">
              {!isLoggedIn && (
                <Link
                  href="/login?tab=register"
                  className="group inline-flex items-center gap-2 bg-brand-primary text-white px-7 py-3.5 rounded-xl font-bold text-base hover:bg-brand-hover transition-all duration-200 shadow-lg shadow-brand-primary/20 hover:shadow-xl hover:shadow-brand-primary/30 active:scale-[0.98]"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                href="/courses"
                className="group inline-flex items-center gap-2 bg-white text-brand-navy px-7 py-3.5 rounded-xl font-bold text-base border-2 border-brand-border hover:border-brand-primary/30 hover:bg-brand-peach/30 transition-all duration-200"
              >
                <Play className="w-4 h-4 text-brand-primary" />
                Explore Courses
              </Link>
            </div>

            {/* Social proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-2">
                {[
                  "bg-blue-400",
                  "bg-emerald-400",
                  "bg-amber-400",
                  "bg-rose-400",
                ].map((color, i) => (
                  <div
                    key={i}
                    className={`w-8 h-8 rounded-full ${color} border-2 border-white flex items-center justify-center text-[10px] font-bold text-white`}
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-sm font-bold text-brand-navy">
                  500+ Students
                </p>
                <p className="text-xs text-brand-muted">
                  Already learning in VR
                </p>
              </div>
            </div>
          </div>

          {/* Right: 3D Model */}
          <div
            className={`lg:col-span-6 transition-all duration-1000 delay-300 ${
              isVisible
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
          >
            <div className="relative">
              {/* Soft glow behind the headset */}
              <div className="absolute inset-10 bg-gradient-to-br from-brand-peach/40 via-rose-100/30 to-blue-100/40 rounded-full blur-3xl animate-pulse-glow" />

              {/* Dynamic 3D WebGL VR Headset Model */}
              <div className="relative pb-14">
                <VRCanvas3D modelPath={MODELS[selectedModelIdx].path} />
                
                {/* Switcher Buttons */}
                <div className="absolute bottom-2 left-0 right-0 flex flex-wrap justify-center gap-2 z-20">
                  {MODELS.map((model, idx) => (
                    <button
                      key={model.name}
                      onClick={() => setSelectedModelIdx(idx)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1 active:scale-95 ${
                        selectedModelIdx === idx
                          ? "bg-brand-primary text-white scale-105 shadow-brand-primary/25"
                          : "bg-white border border-brand-border text-brand-muted hover:text-brand-navy hover:bg-brand-soft"
                      }`}
                    >
                      <span>{model.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-12">
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            fill="#f9fafb"
            opacity=".5"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            fill="#f9fafb"
            opacity=".3"
          />
        </svg>
      </div>
    </section>
  );
}