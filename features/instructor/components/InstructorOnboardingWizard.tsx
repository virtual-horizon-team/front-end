"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  Check,
  Loader2,
  FileText,
  Trash2,
  AlertCircle,
  Award,
  BookOpen,
  Cpu,
  Layers,
  Sparkles,
} from "lucide-react";
import { showToast } from "@/features/instructor/components/Toast";
import { instructorRequestApi } from "../lib/instructor-request-api";
import Step3DScene from "./Step3DScene";

// Types for form state
interface FormState {
  // API Fields
  name: string;
  linkedinUrl: string;
  portfolioUrl: string;
  yearsOfExperience: string;
  hasToughtBefore: boolean;
  documents: File[];

  // Non-API Custom Fields (Saved in state and printed in console/submission summary)
  teachingPhilosophy: string;
  vrToolsUsed: string[];
  comfortWith3D: string;
  vrLearningImpact: string;
  videoSkills: string;
  videoSoftwareUsed: string[];
}

const INITIAL_STATE: FormState = {
  name: "",
  linkedinUrl: "",
  portfolioUrl: "",
  yearsOfExperience: "0",
  hasToughtBefore: false,
  documents: [],
  teachingPhilosophy: "",
  vrToolsUsed: [],
  comfortWith3D: "Intermediate",
  vrLearningImpact: "",
  videoSkills: "Yes, I can record and edit my own videos",
  videoSoftwareUsed: [],
};

export default function InstructorOnboardingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormState>(INITIAL_STATE);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Available VR tools list for Step 3 checkboxes
  const AVAILABLE_VR_TOOLS = [
    "Unity 3D",
    "Unreal Engine",
    "Blender",
    "Gravity Sketch",
    "Oculus/Meta Quest SDK",
    "HTC Vive/OpenXR",
    "Apple Vision Pro (visionOS)",
    "Three.js / WebGL",
  ];

  // Handle standard text inputs
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle custom boolean toggles
  const handleBooleanChange = (name: keyof FormState, value: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle checkboxes for VR tools list
  const handleCheckboxChange = (tool: string) => {
    setFormData((prev) => {
      const alreadySelected = prev.vrToolsUsed.includes(tool);
      const updatedTools = alreadySelected
        ? prev.vrToolsUsed.filter((t) => t !== tool)
        : [...prev.vrToolsUsed, tool];
      return { ...prev, vrToolsUsed: updatedTools };
    });
  };

  // URL format validation helper
  const isValidUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Validate current step fields
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Full Name is required";
      }
      if (formData.linkedinUrl.trim() && !isValidUrl(formData.linkedinUrl.trim())) {
        newErrors.linkedinUrl = "Please enter a valid URL (e.g. https://linkedin.com/in/...)";
      }
      if (formData.portfolioUrl.trim() && !isValidUrl(formData.portfolioUrl.trim())) {
        newErrors.portfolioUrl = "Please enter a valid URL (e.g. https://portfolio.com)";
      }
    }

    if (currentStep === 2) {
      const yoe = parseInt(formData.yearsOfExperience, 10);
      if (isNaN(yoe) || yoe < 0) {
        newErrors.yearsOfExperience = "Years of experience must be a non-negative number";
      }
    }

    if (currentStep === 4) {
      if (formData.documents.length === 0) {
        newErrors.documents = "At least one certification or verification document is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Navigation handlers
  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      showToast("error", "Please fix the validation errors before proceeding.");
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Drag and drop uploader helpers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    // Validate file sizes (10MB limit)
    const validFiles = newFiles.filter((file) => {
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > 10) {
        showToast("error", `File "${file.name}" exceeds the 10MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, ...validFiles],
      }));
      if (errors.documents) {
        setErrors((prev) => ({ ...prev, documents: "" }));
      }
      showToast("success", `${validFiles.length} file(s) added successfully.`);
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  // Submit onboarding wizard form to backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(4)) {
      showToast("error", "Validation failed. Please review your documents.");
      return;
    }

    setSubmitting(true);
    try {
      // Log the full custom questionnaire state for client records/diagnostics
      console.log("Submitting Instructor Onboarding Questionnaire:", {
        teachingPhilosophy: formData.teachingPhilosophy,
        vrToolsUsed: formData.vrToolsUsed,
        comfortWith3D: formData.comfortWith3D,
        vrLearningImpact: formData.vrLearningImpact,
        videoSkills: formData.videoSkills,
        videoSoftwareUsed: formData.videoSoftwareUsed,
      });

      // Prepare payload mapping types appropriately
      const apiPayload = {
        name: formData.name.trim(),
        linkedinUrl: formData.linkedinUrl.trim() || undefined,
        portfolioUrl: formData.portfolioUrl.trim() || undefined,
        yearsOfExperience: parseInt(formData.yearsOfExperience, 10) || 0,
        hasToughtBefore: formData.hasToughtBefore,
        documents: formData.documents,
      };

      await instructorRequestApi.submitInstructorRequest(apiPayload);
      
      setIsSuccess(true);
      showToast("success", "Application submitted successfully!");
    } catch (error: any) {
      console.error("Failed to submit application", error);
      showToast("error", error.message || "Something went wrong during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  // Meta details for rendering step info
  const stepDetails = [
    {
      title: "Personal Info & Presence",
      desc: "Tell us who you are and share links to your professional channels or portfolio.",
      icon: Award,
      visualMetaphor: "Setting up your digital identity card in the Virtual Horizon universe.",
    },
    {
      title: "Experience & Background",
      desc: "Help us understand your teaching history, years of experience, and core philosophy.",
      icon: BookOpen,
      visualMetaphor: "Opening the gateway to knowledge sharing and educational leadership.",
    },
    {
      title: "VR & 3D Familiarity",
      desc: "Assess your expertise level with virtual environments, VR tooling, and assets.",
      icon: Cpu,
      visualMetaphor: "Configuring the interactive floating primitives that power immersive VR rooms.",
    },
    {
      title: "Verification & Upload",
      desc: "Upload verification files (degrees, CV, certifications) and submit your application.",
      icon: Layers,
      visualMetaphor: "Enclosing your records inside a secure ledger waiting to be verified.",
    },
  ];

  if (isSuccess) {
    return (
      <div className="bg-white rounded-2xl border border-brand-border p-8 md:p-12 text-center max-w-2xl mx-auto shadow-sm my-8 animate-fade-in">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-200">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-3xl font-extrabold text-brand-navy mb-4">Application Submitted!</h2>
        <p className="text-brand-muted text-base leading-relaxed mb-8 max-w-md mx-auto">
          Thank you for applying to become an Instructor on Virtual Horizon. 
          Our administrators will review your credentials, profile information, and uploaded documents. 
          We will contact you via email shortly.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/profile")}
            className="bg-brand-primary hover:bg-brand-hover text-white font-bold py-3 px-8 rounded-xl shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
          >
            Go to Profile
          </button>
          <button
            onClick={() => router.push("/")}
            className="bg-white border border-brand-border text-brand-navy hover:bg-brand-soft font-bold py-3 px-8 rounded-xl transition-all duration-150 active:scale-95 cursor-pointer"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header section */}
      <div className="mb-10 text-center max-w-2xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-brand-navy tracking-tight mb-3">
          Become an Instructor
        </h1>
        <p className="text-brand-muted text-base">
          Join our network of VR educators. Share your technical expertise and design classes inside the Virtual Horizon metaverse.
        </p>
      </div>

      {/* Stepper bar */}
      <div className="mb-12 max-w-4xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Connector Line */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-brand-border z-0" />
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-primary transition-all duration-300 z-0"
            style={{ width: `${((step - 1) / 3) * 100}%` }}
          />

          {/* Steps */}
          {stepDetails.map((details, index) => {
            const stepNum = index + 1;
            const StepIcon = details.icon;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={stepNum} className="flex flex-col items-center relative z-10">
                <button
                  onClick={() => stepNum < step && setStep(stepNum)}
                  disabled={stepNum >= step}
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold ${
                    isActive
                      ? "bg-brand-primary border-brand-primary text-white scale-110 shadow-md ring-4 ring-brand-primary/20"
                      : isCompleted
                      ? "bg-green-600 border-green-600 text-white cursor-pointer hover:bg-green-700"
                      : "bg-white border-brand-border text-brand-muted cursor-not-allowed"
                  }`}
                  aria-label={`Step ${stepNum}: ${details.title}`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <StepIcon className="w-5 h-5" />}
                </button>
                <span
                  className={`hidden md:block absolute top-14 text-xs font-semibold whitespace-nowrap transition-colors duration-300 ${
                    isActive ? "text-brand-primary font-bold" : "text-brand-muted"
                  }`}
                >
                  {details.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Form and 3D Visual Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch pt-4">
        
        {/* Left Side: Onboarding form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-7 bg-white rounded-2xl border border-brand-border p-6 md:p-8 flex flex-col justify-between shadow-sm min-h-[500px]"
        >
          <div>
            <div className="mb-6">
              <span className="text-xs font-bold text-brand-primary tracking-wider uppercase">
                Step {step} of 4
              </span>
              <h2 className="text-2xl font-bold text-brand-navy mt-1">
                {stepDetails[step - 1].title}
              </h2>
              <p className="text-brand-muted text-sm mt-2">
                {stepDetails[step - 1].desc}
              </p>
            </div>

            {/* STEP 1: Personal Info & Presence */}
            {step === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-brand-text mb-1.5">
                    Full Name <span className="text-brand-primary">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.name ? "border-brand-primary bg-red-50/20" : "border-brand-border"
                    } focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
                  />
                  {errors.name && (
                    <p className="text-xs text-brand-primary font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.name}
                    </p>
                  )}
                </div>

                {/* LinkedIn URL */}
                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-semibold text-brand-text mb-1.5">
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="text"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    value={formData.linkedinUrl}
                    onChange={handleInputChange}
                    placeholder="https://linkedin.com/in/username"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.linkedinUrl ? "border-brand-primary bg-red-50/20" : "border-brand-border"
                    } focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-xs text-brand-primary font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.linkedinUrl}
                    </p>
                  )}
                </div>

                {/* Portfolio URL */}
                <div>
                  <label htmlFor="portfolioUrl" className="block text-sm font-semibold text-brand-text mb-1.5">
                    Portfolio / Website URL
                  </label>
                  <input
                    type="text"
                    id="portfolioUrl"
                    name="portfolioUrl"
                    value={formData.portfolioUrl}
                    onChange={handleInputChange}
                    placeholder="https://myportfolio.com"
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.portfolioUrl ? "border-brand-primary bg-red-50/20" : "border-brand-border"
                    } focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
                  />
                  {errors.portfolioUrl && (
                    <p className="text-xs text-brand-primary font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.portfolioUrl}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: Experience & Background */}
            {step === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* Years of Experience */}
                <div>
                  <label htmlFor="yearsOfExperience" className="block text-sm font-semibold text-brand-text mb-1.5">
                    Years of Professional Experience
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    min="0"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.yearsOfExperience ? "border-brand-primary bg-red-50/20" : "border-brand-border"
                    } focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
                  />
                  {errors.yearsOfExperience && (
                    <p className="text-xs text-brand-primary font-medium mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.yearsOfExperience}
                    </p>
                  )}
                </div>

                {/* Has Taught Before */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2.5">
                    Have you taught students or created courses before?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleBooleanChange("hasToughtBefore", true)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all duration-150 ${
                        formData.hasToughtBefore
                          ? "bg-brand-primary border-brand-primary text-white shadow-sm"
                          : "bg-white border-brand-border text-brand-text hover:bg-brand-soft"
                      }`}
                    >
                      Yes, I have
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBooleanChange("hasToughtBefore", false)}
                      className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm transition-all duration-150 ${
                        !formData.hasToughtBefore
                          ? "bg-brand-primary border-brand-primary text-white shadow-sm"
                          : "bg-white border-brand-border text-brand-text hover:bg-brand-soft"
                      }`}
                    >
                      No, I haven't
                    </button>
                  </div>
                </div>

                {/* Video Recording & Editing Ability */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2.5">
                    Can you record or edit educational video lectures?
                  </label>
                  <div className="grid grid-cols-1 gap-2.5">
                    {[
                      "Yes, I can record and edit my own videos",
                      "I can record videos, but I need help editing them",
                      "I need guidance and training on both recording and editing",
                    ].map((option) => {
                      const isSelected = formData.videoSkills === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, videoSkills: option }))}
                          className={`w-full px-4 py-2.5 rounded-xl border text-left text-sm transition-all duration-150 ${
                            isSelected
                              ? "bg-brand-soft border-brand-primary/60 font-semibold text-brand-navy ring-1 ring-brand-primary/20"
                              : "bg-white border-brand-border text-brand-muted hover:bg-brand-soft"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                                isSelected ? "border-brand-primary bg-brand-primary text-white" : "border-brand-border bg-white"
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                            <span>{option}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Video Tools/Software Selection */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2.5">
                    Which video recording/editing tools have you used? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {["OBS Studio", "Camtasia", "Loom / Zoom", "Adobe Premiere / CapCut", "None of them"].map((tool) => {
                      const isChecked = formData.videoSoftwareUsed.includes(tool);
                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => {
                              const alreadySelected = prev.videoSoftwareUsed.includes(tool);
                              let updatedTools;
                              if (tool === "None of them") {
                                updatedTools = ["None of them"];
                              } else {
                                updatedTools = alreadySelected
                                  ? prev.videoSoftwareUsed.filter((t) => t !== tool)
                                  : [...prev.videoSoftwareUsed.filter((t) => t !== "None of them"), tool];
                              }
                              return { ...prev, videoSoftwareUsed: updatedTools };
                            });
                          }}
                          className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left text-xs transition-all duration-150 ${
                            isChecked
                              ? "bg-brand-soft border-brand-primary/60 font-semibold text-brand-navy ring-1 ring-brand-primary/20"
                              : "bg-white border-brand-border text-brand-muted hover:bg-brand-soft"
                          }`}
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${
                              isChecked ? "bg-brand-primary border-brand-primary text-white" : "border-brand-border bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                          <span>{tool}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Teaching Philosophy */}
                <div>
                  <label htmlFor="teachingPhilosophy" className="block text-sm font-semibold text-brand-text mb-1.5">
                    Describe your teaching philosophy <span className="text-xs font-normal text-brand-muted">(Optional)</span>
                  </label>
                  <textarea
                    id="teachingPhilosophy"
                    name="teachingPhilosophy"
                    rows={4}
                    value={formData.teachingPhilosophy}
                    onChange={handleInputChange}
                    placeholder="E.g., I believe in hands-on, project-based learning where students build practical prototypes..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 3: VR & 3D Familiarity */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                {/* Encouraging guide banner at the beginning of this step */}
                <div className="bg-brand-primary/5 border border-brand-primary/15 rounded-xl p-4 flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-300">
                  <Sparkles className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-extrabold text-brand-navy">This is the perfect place for you!</h4>
                    <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                      Don't worry if you don't have experience in VR or 3D assets. Virtual Horizon is designed to guide and teach you in an easy way. The core target of our platform is to enable building courses and 3D scenarios in an easy way, even without prior experience. We will support you all the way!
                    </p>
                  </div>
                </div>

                {/* VR Tool Selection Checkboxes */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2">
                    Which tools, SDKs, or assets have you worked with? (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {AVAILABLE_VR_TOOLS.map((tool) => {
                      const isChecked = formData.vrToolsUsed.includes(tool);
                      return (
                        <button
                          key={tool}
                          type="button"
                          onClick={() => handleCheckboxChange(tool)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition-all duration-150 ${
                            isChecked
                              ? "bg-brand-soft border-brand-primary/60 font-semibold text-brand-navy ring-1 ring-brand-primary/20"
                              : "bg-white border-brand-border text-brand-muted hover:bg-brand-soft"
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                              isChecked ? "bg-brand-primary border-brand-primary text-white" : "border-brand-border bg-white"
                            }`}
                          >
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span>{tool}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Comfort Level Slider/Selection */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2">
                    How do you rate your comfort managing 3D assets in a virtual space?
                  </label>
                  <div className="flex bg-brand-soft/50 rounded-xl p-1.5 border border-brand-border gap-2">
                    {["Beginner", "Intermediate", "Expert"].map((level) => {
                      const isSelected = formData.comfortWith3D === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, comfortWith3D: level }))}
                          className={`flex-1 py-2 text-center text-sm font-bold rounded-lg transition-all ${
                            isSelected
                              ? "bg-white text-brand-navy shadow-sm border border-brand-border"
                              : "text-brand-muted hover:text-brand-navy"
                          }`}
                        >
                          {level}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* VR Learning Impact Textarea */}
                <div>
                  <label htmlFor="vrLearningImpact" className="block text-sm font-semibold text-brand-text mb-1.5">
                    How do you think VR/3D tools enhance education?
                  </label>
                  <textarea
                    id="vrLearningImpact"
                    name="vrLearningImpact"
                    rows={3}
                    value={formData.vrLearningImpact}
                    onChange={handleInputChange}
                    placeholder="Share your perspective on the future of virtual classrooms..."
                    className="w-full px-4 py-3 rounded-xl border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all resize-none text-sm leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: Verification & Upload */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in">
                {/* File Uploader Box */}
                <div>
                  <label className="block text-sm font-semibold text-brand-text mb-2">
                    Upload certifications, resume, or teaching credentials <span className="text-brand-primary">*</span>
                  </label>
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-colors ${
                      errors.documents
                        ? "border-brand-primary bg-red-50/5"
                        : "border-brand-border hover:bg-brand-soft/20 bg-brand-soft/10"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                    />
                    <Upload className="w-10 h-10 text-brand-muted mx-auto mb-3" />
                    <p className="text-sm font-bold text-brand-navy">
                      Drag & Drop files here, or <span className="text-brand-primary underline">browse</span>
                    </p>
                    <p className="text-xs text-brand-muted mt-1.5">
                      Supports PDF, DOCX, ZIP, or Images. Max size 10MB per file.
                    </p>
                  </div>
                  {errors.documents && (
                    <p className="text-xs text-brand-primary font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.documents}
                    </p>
                  )}
                </div>

                {/* Uploaded Files List */}
                {formData.documents.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    <h4 className="text-xs font-bold text-brand-muted uppercase tracking-wider">
                      Uploaded Documents ({formData.documents.length})
                    </h4>
                    {formData.documents.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-brand-soft/40 border border-brand-border rounded-xl"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-5 h-5 text-brand-primary shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-brand-text truncate">
                              {file.name}
                            </p>
                            <p className="text-[10px] text-brand-muted">
                              {(file.size / (1024 * 1024)).toFixed(2)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-1.5 hover:bg-brand-peach hover:text-brand-primary rounded-lg transition-colors cursor-pointer text-brand-muted"
                          title="Remove file"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Summary Review details */}
                <div className="border border-brand-border rounded-2xl bg-brand-soft/10 p-5 space-y-4">
                  <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider border-b border-brand-border pb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-brand-primary" /> Application Review Summary
                  </h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                    <div>
                      <p className="text-brand-muted">Full Name</p>
                      <p className="font-bold text-brand-navy truncate mt-0.5">{formData.name || "—"}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted">Experience</p>
                      <p className="font-bold text-brand-navy mt-0.5">{formData.yearsOfExperience || "0"} years</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-brand-muted">LinkedIn Profile</p>
                      <p className="font-bold text-brand-navy truncate mt-0.5">{formData.linkedinUrl || "—"}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-brand-muted">Portfolio URL</p>
                      <p className="font-bold text-brand-navy truncate mt-0.5">{formData.portfolioUrl || "—"}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted">Previously Taught</p>
                      <p className="font-bold text-brand-navy mt-0.5">{formData.hasToughtBefore ? "Yes" : "No"}</p>
                    </div>
                    <div>
                      <p className="text-brand-muted">Comfort with 3D</p>
                      <p className="font-bold text-brand-navy mt-0.5">{formData.comfortWith3D}</p>
                    </div>
                    <div className="col-span-2 border-t border-brand-border/40 pt-2">
                      <p className="text-brand-muted">Video Recording & Editing</p>
                      <p className="font-bold text-brand-navy mt-0.5">{formData.videoSkills}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-brand-muted">Video Software Used</p>
                      <p className="font-bold text-brand-navy mt-0.5">
                        {formData.videoSoftwareUsed.length > 0
                          ? formData.videoSoftwareUsed.join(", ")
                          : "None"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form navigation buttons */}
          <div className="flex justify-between items-center gap-4 mt-8 pt-6 border-t border-brand-border">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={submitting}
                className="flex items-center gap-2 bg-white border border-brand-border text-brand-navy hover:bg-brand-soft py-3 px-6 rounded-xl font-bold text-sm transition-all active:scale-95 duration-150 cursor-pointer disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div /> // spacing block
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white py-3 px-6 rounded-xl font-bold text-sm transition-all active:scale-95 duration-150 cursor-pointer ml-auto"
              >
                Next Step <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 bg-brand-primary hover:bg-brand-hover text-white py-3 px-8 rounded-xl font-bold text-sm transition-all active:scale-95 duration-150 cursor-pointer ml-auto disabled:opacity-80"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Check className="w-4.5 h-4.5" />
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Right Side: 3D Visual container */}
        <div className="lg:col-span-5 bg-brand-navy rounded-2xl p-6 md:p-8 text-white flex flex-col justify-between shadow-lg relative overflow-hidden min-h-[400px]">
          {/* Neon grid pattern background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50" />
          
          <div className="relative z-10">
            <span className="text-xs font-bold text-brand-primary tracking-wider uppercase bg-brand-primary/10 border border-brand-primary/20 px-2.5 py-1 rounded-full">
              Visual Metaphor
            </span>
            <p className="text-sm text-brand-peach/80 mt-4 leading-relaxed italic">
              "{stepDetails[step - 1].visualMetaphor}"
            </p>
          </div>

          {/* Render our interactive 3D Scene */}
          <div className="flex-1 my-4 flex items-center justify-center z-10">
            <Step3DScene step={step} />
          </div>

          <div className="relative z-10 border-t border-white/10 pt-4 mt-auto">
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-primary mb-1">
              Virtual Horizon VR Ecosystem
            </h4>
            <p className="text-[11px] text-white/50 leading-relaxed">
              Every step matches an entity in the Virtual Horizon simulation. Instructors create interactive, immersive rooms using modular shapes, uploaded resources, and virtual models.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
