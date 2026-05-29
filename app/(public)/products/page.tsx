"use client";

import { useEffect, useState } from "react";
import {
  Download,
  Monitor,
  Layers,
  Cpu,
  CheckCircle,
  Workflow,
  HelpCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Laptop,
  Terminal,
  ChevronRight
} from "lucide-react";
import { api } from "@/features/auth/lib/api-client";
import { showToast } from "@/features/instructor/components/Toast";

interface ApplicationVersion {
  id: string;
  applicationName: string;
  platform: string;
  version: string;
  url: string;
  createdAtUtc?: string;
}

interface VersionState {
  version: string | null;
  url: string | null;
  loading: boolean;
  error: boolean;
}

type VersionData = Record<string, Record<string, VersionState>>;

const APPLICATIONS = [
  { id: "VrStudio", name: "VrStudio" },
  { id: "VrScinarioDisplay", name: "VrScinarioDisplay" },
  { id: "CreatorSDK", name: "CreatorSDK" }
];

const PLATFORMS = ["Windows", "MacOS", "Linux"];

export default function ProductsPage() {
  const [versionData, setVersionData] = useState<VersionData>(() => {
    const initial: VersionData = {};
    APPLICATIONS.forEach((app) => {
      initial[app.id] = {};
      PLATFORMS.forEach((plat) => {
        initial[app.id][plat] = {
          version: null,
          url: null,
          loading: true,
          error: false
        };
      });
    });
    return initial;
  });

  const [activeTab, setActiveTab] = useState<string>("all");

  useEffect(() => {
    const fetchLatestVersions = async () => {
      for (const app of APPLICATIONS) {
        for (const plat of PLATFORMS) {
          try {
            // Call the latest version endpoint for specific application name and platform
            const data = await api<ApplicationVersion>(
              `/api/application-versions/${app.name}/${plat}/latest`
            );

            setVersionData((prev) => ({
              ...prev,
              [app.id]: {
                ...prev[app.id],
                [plat]: {
                  version: data.version,
                  url: data.url,
                  loading: false,
                  error: false
                }
              }
            }));
          } catch (err: any) {
            // Gracefully catch 404 errors (not uploaded yet) and other API issues
            setVersionData((prev) => ({
              ...prev,
              [app.id]: {
                ...prev[app.id],
                [plat]: {
                  version: null,
                  url: null,
                  loading: false,
                  error: true
                }
              }
            }));
          }
        }
      }
    };

    fetchLatestVersions();
  }, []);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Windows":
        return <Laptop className="w-5 h-5 text-blue-500" />;
      case "MacOS":
        return <Monitor className="w-5 h-5 text-purple-500" />;
      case "Linux":
        return <Terminal className="w-5 h-5 text-amber-500" />;
      default:
        return <Laptop className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPlatformExtension = (platform: string, appName: string) => {
    if (appName === "CreatorSDK") return ".unitypackage";
    switch (platform) {
      case "Windows":
        return ".zip / .exe";
      case "MacOS":
        return ".dmg / .app";
      case "Linux":
        return ".tar.gz";
      default:
        return ".zip";
    }
  };

  return (
    <div className="bg-[#f9fafb] text-brand-text min-h-screen">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-brand-border py-16 md:py-24 px-6 sm:px-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-peach/20 rounded-full blur-3xl -z-10 translate-x-12 -translate-y-12" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-50 rounded-full blur-3xl -z-10 -translate-x-12 translate-y-12" />
 
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-peach text-brand-primary rounded-full text-xs font-bold tracking-wide uppercase">
                Virtual Horizon Suite
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-brand-navy tracking-tight leading-tight">
                Software & Developer Tools
              </h1>
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed max-w-xl">
                Create, manage, and experience high-fidelity 3D scenarios. Download our interactive client apps and Unity integration tools to start training.
              </p>
 
              {/* Quick jump tabs */}
              <div className="flex flex-wrap gap-2.5 pt-4">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "all"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-soft hover:bg-brand-border text-brand-muted"
                    }`}
                >
                  All Products
                </button>
                <button
                  onClick={() => setActiveTab("studio")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "studio"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-soft hover:bg-brand-border text-brand-muted"
                    }`}
                >
                  VR Studio
                </button>
                <button
                  onClick={() => setActiveTab("viewer")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "viewer"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-soft hover:bg-brand-border text-brand-muted"
                    }`}
                >
                  VR Viewer
                </button>
                <button
                  onClick={() => setActiveTab("sdk")}
                  className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer ${activeTab === "sdk"
                      ? "bg-brand-primary text-white shadow-sm"
                      : "bg-brand-soft hover:bg-brand-border text-brand-muted"
                    }`}
                >
                  Creator SDK
                </button>
              </div>
            </div>
 
            {/* Right Graphic Column: home.png */}
            <div className="lg:col-span-6 relative flex justify-center">
              <div className="relative group w-full max-w-md lg:max-w-xl animate-fade-in-up">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/home.png"
                  alt="Virtual Horizon VR Headset"
                  className="w-full h-auto object-contain transition-transform duration-500 hover:scale-[1.03] animate-float"
                />
              </div>
            </div>
 
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-16 space-y-16">

        {/* VR Studio Component Card */}
        {(activeTab === "all" || activeTab === "studio") && (
          <section className="bg-white border border-brand-border/80 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-brand-primary" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Product Header/Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-brand-peach flex items-center justify-center text-brand-primary shrink-0">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-brand-navy">Virtual Horizon Studio</h2>
                    <p className="text-xs text-brand-muted font-bold tracking-wider uppercase">Application: VrStudio</p>
                  </div>
                </div>

                <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                  Virtual Horizon Studio is the primary workspace application where you organize, configure, and build interactive 3D training scenarios. Import assets generated from the SDK, orchestrate learning steps, and publish interactive lessons directly to your student directory.
                </p>

                {/* Features Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Key Capabilities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Interactive scenario designer",
                      "3D asset library organizer",
                      "Visual learning objective manager",
                      "Direct course cloud publishing"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                        <CheckCircle className="w-4.5 h-4.5 text-brand-primary shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads Column */}
              <div className="lg:col-span-5 bg-[#f9fafb] border border-brand-border/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border pb-3">
                  <Download className="w-4.5 h-4.5 text-brand-primary" />
                  Downloads
                </h3>

                <div className="space-y-3">
                  {PLATFORMS.map((plat) => {
                    const state = versionData.VrStudio[plat];
                    return (
                      <div
                        key={plat}
                        className="bg-white border border-brand-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(plat)}
                          <div>
                            <p className="text-xs font-extrabold text-brand-navy">{plat}</p>
                            <span className="text-[10px] text-brand-muted font-medium block mt-0.5">
                              {getPlatformExtension(plat, "VrStudio")}
                            </span>
                          </div>
                        </div>

                        <div>
                          {state.loading ? (
                            <div className="h-9 w-28 bg-brand-soft animate-pulse rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-brand-muted font-bold">Checking...</span>
                            </div>
                          ) : state.url ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <a
                                href={state.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-brand-primary hover:bg-brand-hover text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 duration-100 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download {state.version}
                              </a>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-muted bg-brand-soft border border-brand-border px-2.5 py-1 rounded-lg">
                              <Clock className="w-3 h-3 text-brand-muted" />
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* VR Viewer 3D Component Card */}
        {(activeTab === "all" || activeTab === "viewer") && (
          <section className="bg-white border border-brand-border/80 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#3b82f6]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Product Header/Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-brand-navy">Virtual Horizon Viewer 3D</h2>
                    <p className="text-xs text-brand-muted font-bold tracking-wider uppercase">Application: VrScinarioDisplay (VR App)</p>
                  </div>
                </div>

                <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                  The client environment application that students use to run immersive, real-time 3D simulation modules. It securely connects to study room parameters, fetches active 3D scenarios, and lets students practice exercises with immediate safety and performance metrics.
                </p>

                {/* Features Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Key Capabilities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Cross-platform 3D simulation engine",
                      "Touch, keyboard, and controller support",
                      "Live score and objective telemetry",
                      "Local offline scenario caching"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                        <CheckCircle className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads Column */}
              <div className="lg:col-span-5 bg-[#f9fafb] border border-brand-border/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border pb-3">
                  <Download className="w-4.5 h-4.5 text-blue-500" />
                  Downloads
                </h3>

                <div className="space-y-3">
                  {PLATFORMS.map((plat) => {
                    const state = versionData.VrScinarioDisplay[plat];
                    return (
                      <div
                        key={plat}
                        className="bg-white border border-brand-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(plat)}
                          <div>
                            <p className="text-xs font-extrabold text-brand-navy">{plat}</p>
                            <span className="text-[10px] text-brand-muted font-medium block mt-0.5">
                              {getPlatformExtension(plat, "VrScinarioDisplay")}
                            </span>
                          </div>
                        </div>

                        <div>
                          {state.loading ? (
                            <div className="h-9 w-28 bg-brand-soft animate-pulse rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-brand-muted font-bold">Checking...</span>
                            </div>
                          ) : state.url ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <a
                                href={state.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#3b82f6] hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 duration-100 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download {state.version}
                              </a>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-muted bg-brand-soft border border-brand-border px-2.5 py-1 rounded-lg">
                              <Clock className="w-3 h-3 text-brand-muted" />
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Creator SDK Component Card */}
        {(activeTab === "all" || activeTab === "sdk") && (
          <section className="bg-white border border-brand-border/80 rounded-3xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-2 h-full bg-[#10b981]" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Product Header/Details */}
              <div className="lg:col-span-7 space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 shrink-0">
                    <Cpu className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-extrabold text-brand-navy">Creator SDK</h2>
                    <p className="text-xs text-brand-muted font-bold tracking-wider uppercase">Application: CreatorSDK</p>
                  </div>
                </div>

                <p className="text-brand-muted text-sm sm:text-base leading-relaxed">
                  A custom Integration Unity package tailored for developers and instructors who build 3D assets, custom scripting controllers, and spatial models. Package your files correctly with pre-set VR wrappers and publish packages into your Studio library assets list.
                </p>

                {/* Features Checklist */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold text-brand-navy uppercase tracking-wider">Key Capabilities</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {[
                      "Unity Editor menu integration",
                      "Pre-built interactive physics scripts",
                      "Automated package building and linting",
                      "Quick asset manifest builder tools"
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs font-semibold text-brand-muted">
                        <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Downloads Column */}
              <div className="lg:col-span-5 bg-[#f9fafb] border border-brand-border/60 rounded-2xl p-6 space-y-4">
                <h3 className="text-sm font-extrabold text-brand-navy uppercase tracking-wider flex items-center gap-1.5 border-b border-brand-border pb-3">
                  <Download className="w-4.5 h-4.5 text-emerald-500" />
                  Downloads
                </h3>

                <div className="space-y-3">
                  {PLATFORMS.map((plat) => {
                    const state = versionData.CreatorSDK[plat];
                    return (
                      <div
                        key={plat}
                        className="bg-white border border-brand-border/60 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-primary/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          {getPlatformIcon(plat)}
                          <div>
                            <p className="text-xs font-extrabold text-brand-navy">{plat}</p>
                            <span className="text-[10px] text-brand-muted font-medium block mt-0.5">
                              {getPlatformExtension(plat, "CreatorSDK")}
                            </span>
                          </div>
                        </div>

                        <div>
                          {state.loading ? (
                            <div className="h-9 w-28 bg-brand-soft animate-pulse rounded-lg flex items-center justify-center">
                              <span className="text-[10px] text-brand-muted font-bold">Checking...</span>
                            </div>
                          ) : state.url ? (
                            <div className="flex flex-col items-end gap-1.5">
                              <a
                                href={state.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-[#10b981] hover:bg-emerald-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm active:scale-95 duration-100 cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Download {state.version}
                              </a>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-brand-muted bg-brand-soft border border-brand-border px-2.5 py-1 rounded-lg">
                              <Clock className="w-3 h-3 text-brand-muted" />
                              Coming Soon
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Workflow / How it works Section */}
        <section className="bg-white border border-brand-border/80 rounded-3xl p-8 sm:p-10 shadow-sm space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy">The Creation & Learning Workflow</h3>
            <p className="text-xs sm:text-sm text-brand-muted font-semibold">How our developer utilities and runtime systems connect together.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Step 1 */}
            <div className="relative p-6 bg-[#f9fafb] border border-brand-border/50 rounded-2xl space-y-3">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-emerald-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">1</span>
              <h4 className="text-sm font-extrabold text-brand-navy">Creator SDK</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Developers/instructors use the Unity SDK to prepare scripts, attach properties, and bundle custom 3D files.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative p-6 bg-[#f9fafb] border border-brand-border/50 rounded-2xl space-y-3">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-primary text-white font-extrabold text-sm flex items-center justify-center shadow-sm">2</span>
              <h4 className="text-sm font-extrabold text-brand-navy">VR Studio</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Import packages inside the VR Studio app, define objectives, place objects in 3D, and publish live interactive courses.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative p-6 bg-[#f9fafb] border border-brand-border/50 rounded-2xl space-y-3">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-blue-500 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">3</span>
              <h4 className="text-sm font-extrabold text-brand-navy">VR Viewer 3D</h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Students launch the Viewer application, load their assigned courses, and practice hands-on simulations with feedback.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="space-y-6">
          <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy text-center">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-brand-border/60 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                Why does a download button say &quot;Coming Soon&quot;?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                This indicates that the build package for that specific OS platform has not been registered by the administration team yet. Please check back later.
              </p>
            </div>

            <div className="bg-white border border-brand-border/60 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                Do I need to sign in to download?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                No, downloading the latest binaries is public. However, to access premium courses in the Viewer or publish assets from the Studio, you must sign in.
              </p>
            </div>

            <div className="bg-white border border-brand-border/60 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                What Unity version is supported?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                The Creator SDK officially supports Unity 2022.3 LTS and newer versions. Refer to the onboarding documentation for dependency details.
              </p>
            </div>

            <div className="bg-white border border-brand-border/60 rounded-2xl p-6 space-y-2">
              <h4 className="text-sm font-bold text-brand-navy flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-brand-primary shrink-0" />
                How do I troubleshoot installation errors?
              </h4>
              <p className="text-xs text-brand-muted leading-relaxed">
                Make sure your device satisfies the core graphic requirements. If you encounter issues on macOS/Linux, check permissions (e.g. running `chmod +x` on binary launches).
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
