"use client";

import React from "react";
import { User, Phone, Globe, Award, Linkedin, ExternalLink, Loader2 } from "lucide-react";

interface ProfileFormProps {
    name: string;
    setName: (val: string) => void;
    phone: string;
    setPhone: (val: string) => void;
    gender: string;
    setGender: (val: string) => void;
    country: string;
    setCountry: (val: string) => void;
    bio: string;
    setBio: (val: string) => void;
    yearsOfExperience: number;
    setYearsOfExperience: (val: number) => void;
    linkedinUrl: string;
    setLinkedinUrl: (val: string) => void;
    portfolioUrl: string;
    setPortfolioUrl: (val: string) => void;
    saving: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    isInstructor: boolean;
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

export default function ProfileForm({
    name,
    setName,
    phone,
    setPhone,
    gender,
    setGender,
    country,
    setCountry,
    bio,
    setBio,
    yearsOfExperience,
    setYearsOfExperience,
    linkedinUrl,
    setLinkedinUrl,
    portfolioUrl,
    setPortfolioUrl,
    saving,
    onSubmit,
    onCancel,
    isInstructor
}: ProfileFormProps) {
    return (
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-brand-border shadow-sm overflow-hidden animate-fade-in">
            
            {/* Form Body */}
            <div className="p-6 md:p-8 space-y-6">
                <div className="border-b border-brand-border/60 pb-4">
                    <h3 className="text-xl md:text-2xl font-bold text-[#1F2937]">Profile Information</h3>
                    <p className="text-sm text-brand-muted mt-1">Customize your personal bio, contact, and system details.</p>
                </div>

                {/* Section: Name & General Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label htmlFor="form-name" className="text-xs font-medium text-brand-text flex items-center gap-1">
                            <User size={13} className="text-brand-muted" /> Name
                        </label>
                        <input 
                            id="form-name"
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text font-medium"
                            placeholder="Enter your profile name"
                            required
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="form-phone" className="text-xs font-medium text-brand-text flex items-center gap-1">
                            <Phone size={13} className="text-brand-muted" /> Phone Number
                        </label>
                        <input 
                            id="form-phone"
                            type="tel" 
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text"
                            placeholder="e.g. +355 69 123 4567"
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="form-gender" className="text-xs font-medium text-brand-text">Gender</label>
                        <select 
                            id="form-gender"
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text cursor-pointer"
                        >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label htmlFor="form-country" className="text-xs font-medium text-brand-text flex items-center gap-1">
                            <Globe size={13} className="text-brand-muted" /> Country
                        </label>
                        <select 
                            id="form-country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text cursor-pointer"
                        >
                            {COUNTRIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Section: Bio & Professional experience */}
                <div className="space-y-4 pt-4 border-t border-brand-border/60">
                    <div className="space-y-1.5">
                        <label htmlFor="form-bio" className="text-xs font-medium text-brand-text">Biography / About Me</label>
                        <textarea 
                            id="form-bio"
                            rows={4}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text"
                            placeholder={isInstructor ? "Write a brief profile description or instructor bio..." : "Write a brief description about yourself..."}
                        />
                    </div>

                    {isInstructor && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label htmlFor="form-exp" className="text-xs font-medium text-brand-text flex items-center gap-1">
                                    <Award size={13} className="text-brand-muted" /> Years of Experience
                                </label>
                                <input 
                                    id="form-exp"
                                    type="number" 
                                    min={0}
                                    max={60}
                                    value={yearsOfExperience}
                                    onChange={(e) => setYearsOfExperience(Number(e.target.value))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Section: Professional Links (Only shown for Instructors) */}
                {isInstructor && (
                    <div className="space-y-4 pt-4 border-t border-brand-border/60">
                        <div>
                            <h4 className="text-xl md:text-2xl font-bold text-[#1F2937]">Professional Links</h4>
                            <p className="text-sm text-brand-muted mt-1">Connect your social and portfolio accounts for students to find.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                                <label htmlFor="form-linkedin" className="text-xs font-medium text-[#4B5563] flex items-center gap-1.5">
                                    <Linkedin size={13} className="text-brand-muted" /> LinkedIn URL
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none">
                                        <Linkedin size={16} />
                                    </div>
                                    <input 
                                        id="form-linkedin"
                                        type="url" 
                                        value={linkedinUrl}
                                        onChange={(e) => setLinkedinUrl(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text"
                                        placeholder="https://linkedin.com/in/username"
                                    />
                                    {linkedinUrl && (
                                        <a 
                                            href={linkedinUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary cursor-pointer"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label htmlFor="form-portfolio" className="text-xs font-medium text-[#4B5563] flex items-center gap-1.5">
                                    <Globe size={13} className="text-brand-muted" /> Portfolio URL
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted pointer-events-none">
                                        <Globe size={16} />
                                    </div>
                                    <input 
                                        id="form-portfolio"
                                        type="url" 
                                        value={portfolioUrl}
                                        onChange={(e) => setPortfolioUrl(e.target.value)}
                                        className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-brand-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:border-brand-primary transition-all text-brand-text"
                                        placeholder="https://yourportfolio.com"
                                    />
                                    {portfolioUrl && (
                                        <a 
                                            href={portfolioUrl} 
                                            target="_blank" 
                                            rel="noopener noreferrer" 
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-brand-muted hover:text-brand-primary cursor-pointer"
                                        >
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Form Actions Footer */}
            <div className="px-6 py-4 bg-brand-soft border-t border-brand-border flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="px-5 py-2 text-sm font-semibold text-[#4B5563] border border-brand-border hover:bg-brand-soft rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-2 bg-brand-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-brand-hover transition-colors shadow-lg shadow-red-500/10 cursor-pointer disabled:opacity-50"
                >
                    {saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>
        </form>
    );
}
