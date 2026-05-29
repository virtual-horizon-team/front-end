"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldAlert, RotateCcw, CheckCircle } from "lucide-react";
import VRCanvas3D from "./vr-canvas-3d";

export default function ImmersiveIntro() {
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
    <section ref={ref} className="bg-white py-20 sm:py-24 px-6 sm:px-8 border-b border-brand-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: 3D VR Headset Model */}
          <div className={`lg:col-span-6 order-2 lg:order-1 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>
            <div className="relative">
              {/* Backing decorative glow */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-brand-peach/30 to-blue-50/40 rounded-3xl blur-2xl" />
              
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-brand-border/60 p-2 shadow-xl min-h-[400px]">
                <VRCanvas3D modelPath="/3d-models/meta_quest_3.glb" />
              </div>
            </div>
          </div>

          {/* Right Column: Content */}
          <div className={`lg:col-span-6 order-1 lg:order-2 space-y-6 sm:space-y-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach/60 text-brand-primary rounded-full text-xs font-bold tracking-wider uppercase mb-4">
                Immersive Learning
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-brand-navy tracking-tight leading-tight">
                Immersive Hands-On Training Without Real-World Risk
              </h2>
            </div>
            
            <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
              Virtual Horizon bridges the gap between digital theory and physical practice. By leveraging high-fidelity VR simulations, students can repeatedly perform high-stakes operations, learn from critical mistakes in a safe environment, and gain muscle memory before setting foot in a real lab or workspace.
            </p>

            {/* Feature list */}
            <div className="space-y-4 pt-2">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-5 h-5 text-brand-primary" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-brand-navy">Safe Failure Space</h4>
                  <p className="text-brand-muted text-sm mt-1">Practice complex, high-voltage, or hazardous procedures with zero danger or material costs.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-brand-navy">Unlimited Replays</h4>
                  <p className="text-brand-muted text-sm mt-1">Repeat training workflows infinitely to reinforce training steps and build absolute mastery.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-brand-navy">Interactive Diagnostics</h4>
                  <p className="text-brand-muted text-sm mt-1">Get immediate feedback and visual aids highlighting exactly where mistakes were made.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
