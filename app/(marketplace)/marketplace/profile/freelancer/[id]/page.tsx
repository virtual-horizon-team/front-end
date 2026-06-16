"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/features/auth/lib/api-client";
import {
  User, Mail, Phone, MapPin, Globe, Linkedin, Award, Briefcase, Star,
  ArrowLeft, Loader2, AlertCircle, Bookmark, Compass
} from "lucide-react";

interface FreelancerProfile {
  id: string;
  name: string;
  bio: string | null;
  phone: string | null;
  country: string | number;
  gender: string | number;
  avatarUrl: string | null;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  yearsOfExperience: number | null;
  averageRating: number | null;
  totalReviews: number;
  skills?: string[] | string | null;
}

export default function FreelancerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [profile, setProfile] = useState<FreelancerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api<FreelancerProfile>(`api/Profile/freelancer/${userId}`);
        setProfile(data);
      } catch (e: any) {
        console.error("Failed to fetch freelancer profile:", e);
        setError(e.message || "Failed to load developer profile details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const getInitials = (name: string) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-9 h-9 animate-spin text-marketplace-primary" />
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Loading Developer Profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-xl mx-auto px-6 py-16 space-y-6">
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 flex items-start gap-4 shadow-xl">
          <AlertCircle className="w-7 h-7 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <h3 className="text-base font-bold text-white">Profile Loading Failed</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              {error || "The requested developer profile does not exist or you do not have permission to view it."}
            </p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-marketplace-primary hover:underline mt-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const skillList = Array.isArray(profile.skills)
    ? profile.skills
    : (typeof profile.skills === "string"
        ? profile.skills.split(",").map(s => s.trim()).filter(Boolean)
        : []);

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "70rem" }}>
      {/* ── Back Button ── */}
      <div>
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-400 hover:text-white uppercase tracking-wider transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Gigs
        </button>
      </div>

      {/* ── Profile Header Card ── */}
      <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-marketplace-primary/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          {/* Avatar */}
          {profile.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profile.avatarUrl}
              alt={profile.name}
              className="w-24 h-24 md:w-32 md:h-32 rounded-3xl object-cover border border-marketplace-border shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-marketplace-primary/15 border border-marketplace-primary/30 flex items-center justify-center font-black text-3xl md:text-4xl text-marketplace-primary shadow-lg">
              {getInitials(profile.name)}
            </div>
          )}

          {/* Details */}
          <div className="flex-grow text-center md:text-left space-y-4">
            <div className="space-y-1">
              <span className="bg-marketplace-primary/10 border border-marketplace-primary/20 text-marketplace-primary text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Freelancer Developer
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-2.5">
                {profile.name}
              </h1>
              <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap text-xs text-slate-400 font-semibold mt-1.5">
                {profile.country && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {profile.country}
                  </span>
                )}
                {profile.yearsOfExperience !== null && (
                  <span className="flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-slate-500" />
                    {profile.yearsOfExperience} Years Experience
                  </span>
                )}
              </div>
            </div>

            {/* Stats indicators */}
            <div className="flex items-center justify-center md:justify-start gap-6 border-t border-marketplace-border/50 pt-4 mt-4">
              <div className="text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rating</span>
                <span className="text-base font-black text-emerald-400 flex items-center justify-center md:justify-start gap-1 mt-0.5">
                  <Star className="w-4 h-4 fill-emerald-400 shrink-0" />
                  {profile.averageRating !== null && profile.averageRating > 0
                    ? profile.averageRating.toFixed(1)
                    : "No Ratings"}
                </span>
              </div>
              <div className="w-px h-8 bg-marketplace-border/50" />
              <div className="text-center md:text-left">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Reviews</span>
                <span className="text-base font-black text-white block mt-0.5">
                  {profile.totalReviews} Total
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Details Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Contact & Links */}
        <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 space-y-6 shadow-xl">
          <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-marketplace-border/50 pb-3 flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 text-marketplace-primary" />
            Connect & Links
          </h3>

          <div className="space-y-4">
            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-slate-500" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Phone Number</span>
                  <a href={`tel:${profile.phone}`} className="text-xs font-bold text-slate-200 hover:text-white transition-colors block">
                    {profile.phone}
                  </a>
                </div>
              </div>
            )}

            {profile.portfolioUrl && (
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-slate-500" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">Personal Portfolio</span>
                  <a
                    href={profile.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-marketplace-primary hover:underline truncate max-w-56 block"
                  >
                    {profile.portfolioUrl}
                  </a>
                </div>
              </div>
            )}

            {profile.linkedinUrl && (
              <div className="flex items-center gap-3">
                <Linkedin className="w-4 h-4 text-[#0077b5]" />
                <div className="space-y-0.5">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block">LinkedIn Profile</span>
                  <a
                    href={profile.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-marketplace-primary hover:underline truncate max-w-56 block"
                  >
                    {profile.linkedinUrl}
                  </a>
                </div>
              </div>
            )}

            {!profile.phone && !profile.portfolioUrl && !profile.linkedinUrl && (
              <p className="text-xs text-slate-500 font-semibold italic text-center py-4">No contact details or web links provided.</p>
            )}
          </div>
        </div>

        {/* Right Side: Professional Bio & Skills */}
        <div className="lg:col-span-2 space-y-8">
          {/* Professional Summary */}
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-marketplace-border/50 pb-3 flex items-center gap-2">
              <Briefcase className="w-4.5 h-4.5 text-marketplace-primary" />
              Professional Biography
            </h3>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-medium whitespace-pre-wrap">
              {profile.bio || "No professional biography provided yet. This freelancer is ready to execute customized job scopes."}
            </p>
          </div>

          {/* Specializations & Skills */}
          <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-6 shadow-xl">
            <h3 className="text-xs font-black text-white uppercase tracking-wider border-b border-marketplace-border/50 pb-3 flex items-center gap-2">
              <Bookmark className="w-4.5 h-4.5 text-marketplace-primary" />
              Developer Specializations & Skills
            </h3>
            
            {skillList.length > 0 ? (
              <div className="flex flex-wrap gap-2.5">
                {skillList.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-[#121826]/80 border border-marketplace-border hover:border-marketplace-primary/20 text-slate-200 text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-semibold italic">No specialization tags added yet.</p>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}
