"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/features/auth/lib/api-client";
import {
  User, Briefcase, Star, Clock, Upload, Loader2, ArrowRight, CheckCircle2,
  Globe, Phone, Linkedin, Eye, X, Camera, AlertCircle, Sparkles, BookOpen
} from "lucide-react";

interface ProfileData {
  profileId: string;
  userId: string;
  name: string;
  bio: string | null;
  phone: string | null;
  country: string | number;
  gender: string | number;
  avatarUrl: string | null;
  linkedinUrl: string | null;
  portfolioUrl: string | null;
  yearsOfExperience: number | null;
  averageRating: number | null;
  totalReviews?: number;
  skills?: string[] | string;
  createdAt: string;
  updatedAt: string;
}

const COUNTRIES = [
  "Albania", "Algeria", "Andorra", "Angola", "Argentina", "Armenia", "Australia", "Austria", 
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", 
  "Benin", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", 
  "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", 
  "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", 
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", 
  "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", 
  "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", 
  "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", 
  "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hungary", "Iceland", "India", 
  "Indonesia", "Iran", "Iraq", "Ireland", "Italy", "Ivory Coast", "Jamaica", "Japan", 
  "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", 
  "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", 
  "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", 
  "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", 
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", 
  "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", 
  "North Korea", "Norway", "Oman", "Pakistan", "Palau", "Panama", "Papua New Guinea", 
  "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", 
  "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent", "Samoa", "San Marino", 
  "Sao Tome", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", 
  "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", 
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", 
  "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", 
  "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", 
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", 
  "Vanuatu", "Vatican City", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

const GENDERS = ["Male", "Female", "Other"];

export default function MarketplaceProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Profile Type Indicator
  const [isFreelancer, setIsFreelancer] = useState(false);

  // Form Fields State
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("Albania");
  const [gender, setGender] = useState("Male");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);
  const [skills, setSkills] = useState("");

  // Stats for Freelancer Profile
  const [rating, setRating] = useState<number | null>(null);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [joinDate, setJoinDate] = useState("");

  // Activation State
  const [showActivationForm, setShowActivationForm] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [regName, setRegName] = useState("");
  const [regYears, setRegYears] = useState(0);
  const [regSkills, setRegSkills] = useState("");
  const [regLinkedin, setRegLinkedin] = useState("");
  const [regPortfolio, setRegPortfolio] = useState("");

  const loadProfileData = async () => {
    setLoading(true);
    setError(null);
    try {
      const manifest = await api<{ capabilities?: { isFreelancer?: boolean } }>("api/Profile/manifest");
      const holdsFreelancerRole = !!manifest?.capabilities?.isFreelancer;
      setIsFreelancer(holdsFreelancerRole);

      const endpoint = holdsFreelancerRole ? "api/Profile/me/freelancer" : "api/Profile/me/user";
      const profile = await api<ProfileData>(endpoint);

      setName(profile.name || "");
      setBio(profile.bio || "");
      setPhone(profile.phone || "");
      
      // Parse country/gender string values safely
      if (profile.country !== undefined) {
        const cVal = typeof profile.country === "number" ? COUNTRIES[profile.country] || "Albania" : profile.country;
        setCountry(cVal);
      }
      if (profile.gender !== undefined) {
        const gVal = typeof profile.gender === "number" ? GENDERS[profile.gender] || "Male" : profile.gender;
        setGender(gVal);
      }

      setAvatarUrl(profile.avatarUrl || "");
      setLinkedinUrl(profile.linkedinUrl || "");
      setPortfolioUrl(profile.portfolioUrl || "");
      setYearsOfExperience(profile.yearsOfExperience || 0);
      setRating(profile.averageRating ?? null);
      setReviewsCount(profile.totalReviews || 0);
      setJoinDate(profile.createdAt);

      if (profile.skills) {
        if (Array.isArray(profile.skills)) {
          setSkills(profile.skills.join(", "));
        } else {
          setSkills(profile.skills);
        }
      }
    } catch (e: any) {
      console.warn("Failed to fetch profile details:", e);
      setError(e.message || "Failed to load profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError("Avatar image size must be less than 5MB");
      return;
    }

    setUploadingAvatar(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await api<{ avatarUrl: string }>("api/Profile/avatar/upload", {
        method: "POST",
        body: formData
      });
      setAvatarUrl(response.avatarUrl);
      setSuccess("Profile photo uploaded successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.warn("Failed to upload avatar:", err);
      setError(err.message || "Failed to upload avatar.");
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name field is required.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      // Find Enum values for Country and Gender
      const countryEnumIndex = COUNTRIES.indexOf(country);
      const genderEnumIndex = GENDERS.indexOf(gender);

      const payload = {
        name: name.trim(),
        bio: bio.trim() || null,
        phone: phone.trim() || null,
        country: countryEnumIndex >= 0 ? countryEnumIndex : 0,
        gender: genderEnumIndex >= 0 ? genderEnumIndex : 0,
        avatarUrl: avatarUrl || null,
        linkedinUrl: isFreelancer ? (linkedinUrl.trim() || null) : null,
        portfolioUrl: isFreelancer ? (portfolioUrl.trim() || null) : null,
        yearsOfExperience: isFreelancer ? (Number(yearsOfExperience) || 0) : null,
        skills: isFreelancer ? (skills.trim() || null) : null
      };

      await api("api/Profile", {
        method: "PUT",
        body: JSON.stringify(payload)
      });

      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.warn("Failed to update profile:", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handleRegisterFreelancer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim()) {
      setError("Name is required.");
      return;
    }
    if (!regSkills.trim()) {
      setError("Skills / Specializations are required.");
      return;
    }

    setRegisterLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api("api/Profile/freelancer/register", {
        method: "POST",
        body: JSON.stringify({
          name: regName.trim(),
          yearsOfExperience: Number(regYears) || 0,
          skills: regSkills.trim(),
          linkedinUrl: regLinkedin.trim() || null,
          portfolioUrl: regPortfolio.trim() || null
        })
      });
      setRegisterSuccess(true);
    } catch (err: any) {
      console.warn("Failed to register as freelancer:", err);
      setError(err.message || "Failed to register as freelancer.");
    } finally {
      setRegisterLoading(false);
    }
  };

  const getInitials = (userName: string) => {
    if (!userName) return "?";
    const parts = userName.trim().split(" ");
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 flex-grow">
        <Loader2 className="w-10 h-10 animate-spin text-marketplace-primary" />
        <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Loading profile details...</p>
      </div>
    );
  }

  return (
    <main className="w-full mx-auto px-6 py-10 space-y-8 flex-grow flex flex-col" style={{ maxWidth: "80rem" }}>
      
      {/* ── Header ── */}
      <div className="border-b border-marketplace-border pb-6">
        <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
          <User className="w-7 h-7 text-marketplace-primary" />
          My Profile Workspace
        </h1>
        <p className="text-sm text-slate-400 font-medium mt-1">
          Manage your personal details, developer status, and professional contact links.
        </p>
      </div>

      {/* ── Alerts ── */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider px-5 py-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="p-1 hover:bg-red-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider px-5 py-4 rounded-xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess(null)} className="p-1 hover:bg-emerald-500/20 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Profile Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Left Side: Avatar & Badge Card */}
        <div className="lg:col-span-1 bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 flex flex-col items-center text-center space-y-6 shadow-xl shadow-black/25">
          
          <div className="relative group w-32 h-32">
            <div 
              onClick={handleAvatarClick}
              className="w-full h-full rounded-full overflow-hidden border border-marketplace-border bg-[#121826] flex items-center justify-center cursor-pointer relative shadow-inner group-hover:opacity-80 transition-all"
            >
              {uploadingAvatar ? (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <Loader2 className="w-7 h-7 animate-spin text-white" />
                </div>
              ) : null}

              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img 
                  src={avatarUrl} 
                  alt={name || "User Avatar"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-3xl font-black text-slate-500">
                  {getInitials(name)}
                </div>
              )}

              {/* Hover Cam Icon */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[10px] font-bold uppercase tracking-wider gap-1">
                <Camera className="w-5 h-5" />
                <span>Upload</span>
              </div>
            </div>
          </div>

          <input 
            ref={fileInputRef}
            type="file" 
            accept="image/*"
            onChange={handleAvatarSelect}
            className="hidden"
          />

          <div className="space-y-2 w-full">
            <h2 className="text-lg font-black text-white truncate px-2">{name || "Unnamed Developer"}</h2>
            
            {isFreelancer ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Briefcase className="w-3.5 h-3.5" />
                Freelancer
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <User className="w-3.5 h-3.5" />
                Standard Account
              </span>
            )}
          </div>

          <div className="w-full border-t border-marketplace-border/50 my-2" />

          {/* Experience & Rating Panel if Freelancer */}
          {isFreelancer ? (
            <div className="w-full grid grid-cols-2 gap-3">
              <div className="bg-[#121826]/40 border border-marketplace-border/60 rounded-xl p-3 text-center">
                <Briefcase className="w-4.5 h-4.5 text-marketplace-primary mx-auto mb-1" />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Experience</span>
                <span className="text-xs font-black text-white mt-1 block">
                  {yearsOfExperience ? `${yearsOfExperience} Yrs` : "0 Yrs"}
                </span>
              </div>
              <div className="bg-[#121826]/40 border border-marketplace-border/60 rounded-xl p-3 text-center">
                <Star className="w-4.5 h-4.5 text-amber-500 mx-auto mb-1 fill-amber-500" />
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Rating</span>
                <span className="text-xs font-black text-white mt-1 block">
                  {rating ? `${rating.toFixed(1)} ★` : "--"}
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full bg-[#121826]/30 border border-marketplace-border/55 rounded-2xl p-4 text-center space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Explore Freelancer Gigs</span>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Activate your Freelancer Profile to pitch bids and secure VR contracts!
              </p>
            </div>
          )}

          {joinDate && (
            <div className="text-[10px] text-slate-500 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              Joined {new Date(joinDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
            </div>
          )}
        </div>

        {/* ── Right Side: Details Form Card ── */}
        <div className="lg:col-span-3">
          {showActivationForm ? (
            <div className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-8 shadow-xl shadow-black/25">
              {registerSuccess ? (
                <div className="text-center py-12 space-y-5">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                  <div className="space-y-2 max-w-md mx-auto">
                    <h3 className="text-base font-black text-white uppercase tracking-wider">Developer Profile Activated!</h3>
                    <p className="text-xs text-slate-400 font-semibold leading-relaxed">
                      Your developer credentials have been created in the system. To apply this new role to your current login session, please sign in once again.
                    </p>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => {
                      router.push(`/login?redirect=/marketplace/profile`);
                    }}
                    className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-lg active:scale-95 duration-100 cursor-pointer"
                  >
                    Sign In Again to Refresh Session
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegisterFreelancer} className="space-y-8">
                  <div className="border-b border-marketplace-border/60 pb-4 flex justify-between items-center">
                    <div>
                      <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                        <Briefcase className="w-4.5 h-4.5 text-marketplace-primary" />
                        Activate Developer Profile
                      </h2>
                      <p className="text-xs text-slate-400 font-semibold mt-1">
                        Activate your profile to pitch bid proposals, build milestones, and manage escrow contracts.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowActivationForm(false)}
                      className="text-xs font-bold text-slate-500 hover:text-white transition-colors"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Display/Full Name</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        placeholder="e.g. Yousef Joe"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Years of Experience */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Years of Experience</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="85"
                        value={regYears}
                        onChange={(e) => setRegYears(Number(e.target.value))}
                        placeholder="e.g. 3"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white font-bold text-emerald-450 focus:outline-none"
                      />
                    </div>

                    {/* Skills */}
                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Skills / Specializations</label>
                      <input
                        type="text"
                        required
                        value={regSkills}
                        onChange={(e) => setRegSkills(e.target.value)}
                        placeholder="e.g. Unity, C#, 3D Modeling, Shaders (comma-separated)"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 text-slate-400">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={regLinkedin}
                        onChange={(e) => setRegLinkedin(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 text-slate-400">
                        <Globe className="w-3.5 h-3.5" /> Portfolio Website URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={regPortfolio}
                        onChange={(e) => setRegPortfolio(e.target.value)}
                        placeholder="https://myportfolio.com"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-3 border-t border-marketplace-border/50 pt-5">
                    <button
                      type="button"
                      onClick={() => setShowActivationForm(false)}
                      disabled={registerLoading}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={registerLoading}
                      className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-marketplace-primary/10 active:scale-95 duration-100 cursor-pointer disabled:opacity-50"
                    >
                      {registerLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Activating...
                        </>
                      ) : (
                        <>
                          Activate Developer Profile
                          <Briefcase className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <form onSubmit={handleSave} className="bg-[#0a0f1d] border border-marketplace-border rounded-3xl p-6 md:p-8 space-y-8 shadow-xl shadow-black/25">
              
              <div className="border-b border-marketplace-border/60 pb-4">
                <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-marketplace-primary" />
                  Account Details
                </h2>
                <p className="text-xs text-slate-400 font-semibold mt-1">
                  Customize your login presentation, personal bio, and region parameters.
                </p>
              </div>

              {/* General Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Display/Full Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +355 69 123 4567"
                    className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                  >
                    {GENDERS.map((g) => (
                      <option key={g} value={g} className="bg-[#121826] text-white">{g}</option>
                    ))}
                  </select>
                </div>

                {/* Country */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide font-sans">Country</label>
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white focus:outline-none cursor-pointer font-semibold"
                  >
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c} className="bg-[#121826] text-white">{c}</option>
                    ))}
                  </select>
                </div>

                {/* Biography */}
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Biography / Summary</label>
                  <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Briefly describe your profile, experiences, or VR specialization..."
                    className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3.5 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none leading-relaxed"
                  />
                </div>
              </div>

              {/* Freelancer Developer Section */}
              {isFreelancer ? (
                <div className="space-y-6 pt-6 border-t border-marketplace-border/50">
                  <div className="pb-2">
                    <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" />
                      Developer Specifications
                    </h3>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Configure your freelancing parameters, specializations, and developer links.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Years Of Experience */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        value={yearsOfExperience}
                        onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white font-bold text-emerald-450 focus:outline-none"
                      />
                    </div>

                    {/* Skills / Tags */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Specialized Skills</label>
                      <input
                        type="text"
                        value={skills}
                        onChange={(e) => setSkills(e.target.value)}
                        placeholder="e.g. Unity, C#, 3D Modeling, Shaders (comma-separated)"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>

                    {/* LinkedIn */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 text-slate-400">
                        <Linkedin className="w-3.5 h-3.5" /> LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>

                    {/* Portfolio */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide flex items-center gap-1 text-slate-400">
                        <Globe className="w-3.5 h-3.5" /> Portfolio website URL
                      </label>
                      <input
                        type="url"
                        value={portfolioUrl}
                        onChange={(e) => setPortfolioUrl(e.target.value)}
                        placeholder="https://myportfolio.com"
                        className="w-full bg-[#121826]/60 border border-marketplace-border focus:border-marketplace-primary/40 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-650 font-semibold focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                // CTA Banner to become freelancer
                <div className="bg-[#121826]/20 border border-marketplace-border rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-marketplace-primary" />
                      Unlock Freelancer Capabilites
                    </h4>
                    <p className="text-[11px] text-slate-450 font-semibold max-w-lg leading-relaxed">
                      Activate your developer status to unlock proposed contract bidding, milestones delivery pipelines, and secure payment escrows.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setRegName(name);
                      setShowActivationForm(true);
                    }}
                    className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-md active:scale-95 duration-100 shrink-0 cursor-pointer text-center"
                  >
                    Activate Developer Profile
                  </button>
                </div>
              )}

              {/* Actions Bar */}
              <div className="flex items-center justify-end gap-3 border-t border-marketplace-border/50 pt-5">
                <button
                  type="button"
                  onClick={loadProfileData}
                  disabled={saving}
                  className="px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                >
                  Discard Changes
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-marketplace-primary hover:bg-marketplace-primary/95 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg hover:shadow-marketplace-primary/10 active:scale-95 duration-100 cursor-pointer disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>

    </main>
  );
}
