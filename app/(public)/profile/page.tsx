"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { profileApi, UserProfile, UpdateProfileRequest } from "@/features/instructor/lib/profile-api";
import { showToast } from "@/features/instructor/components/Toast";

// Sub-components
import ProfileHeader from "@/features/profile/components/ProfileHeader";
import ProfileCard from "@/features/profile/components/ProfileCard";
import ProfileForm from "@/features/profile/components/ProfileForm";
import ImageCropModal from "@/features/profile/components/ImageCropModal";
import InstructorRequestsModal from "@/features/profile/components/InstructorRequestsModal";

export default function ProfilePage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Core profile States
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);

    // Form fields state
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");
    const [phone, setPhone] = useState("");
    const [country, setCountry] = useState("Albania");
    const [gender, setGender] = useState("Male");
    const [avatarUrl, setAvatarUrl] = useState("");
    const [linkedinUrl, setLinkedinUrl] = useState("");
    const [portfolioUrl, setPortfolioUrl] = useState("");
    const [yearsOfExperience, setYearsOfExperience] = useState<number>(0);

    // Crop Modal States
    const [cropFile, setCropFile] = useState<File | null>(null);
    const [showCropModal, setShowCropModal] = useState(false);

    // Instructor Request Modal State
    const [showRequestsModal, setShowRequestsModal] = useState(false);

    const loadProfile = async () => {
        try {
            setLoading(true);
            const data = await profileApi.getProfile();
            setProfile(data);
            
            // Populate form states
            setName(data.name || "");
            setBio(data.bio || "");
            setPhone(data.phone || "");
            setCountry(data.country || "Albania");
            setGender(data.gender || "Male");
            setAvatarUrl(data.avatarUrl || "");
            setLinkedinUrl(data.linkedinUrl || "");
            setPortfolioUrl(data.portfolioUrl || "");
            setYearsOfExperience(data.yearsOfExperience || 0);
        } catch (error: any) {
            console.error("Failed to load profile", error);
            if (error.status === 401 || error.message?.includes("unauthorized") || error.message?.includes("401")) {
                showToast("error", "Please sign in to view your profile");
                router.push("/login");
            } else {
                showToast("error", error.message || "Failed to load profile. Please refresh.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            showToast("error", "Name is required");
            return;
        }

        setSaving(true);
        try {
            const isInstructor = profile?.profileType?.toLowerCase() === "instructor";
            const payload: UpdateProfileRequest = {
                name: name.trim(),
                bio: bio.trim() || null,
                phone: phone.trim() || null,
                country,
                gender,
                avatarUrl,
                linkedinUrl: isInstructor ? (linkedinUrl.trim() || null) : null,
                portfolioUrl: isInstructor ? (portfolioUrl.trim() || null) : null,
                yearsOfExperience: isInstructor ? (Number(yearsOfExperience) || 0) : 0
            };

            const updatedProfile = await profileApi.updateProfile(payload);
            setProfile(updatedProfile);
            showToast("success", "Profile updated successfully!");
        } catch (error: any) {
            console.error("Failed to update profile", error);
            showToast("error", error.message || "Failed to update profile details");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (!profile) return;
        setName(profile.name || "");
        setBio(profile.bio || "");
        setPhone(profile.phone || "");
        setCountry(profile.country || "Albania");
        setGender(profile.gender || "Male");
        setAvatarUrl(profile.avatarUrl || "");
        setLinkedinUrl(profile.linkedinUrl || "");
        setPortfolioUrl(profile.portfolioUrl || "");
        setYearsOfExperience(profile.yearsOfExperience || 0);
        showToast("info", "Changes discarded");
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showToast("error", "Image size should be less than 5MB");
            return;
        }

        setCropFile(file);
        setShowCropModal(true);
    };

    const handleCropApplied = async (croppedFile: File) => {
        setShowCropModal(false);
        setCropFile(null);
        setUploadingAvatar(true);
        
        try {
            const res = await profileApi.uploadAvatar(croppedFile);
            setAvatarUrl(res.avatarUrl);
            showToast("success", "Profile photo cropped & uploaded! Save profile to commit changes.");
        } catch (error: any) {
            console.error("Failed to upload avatar", error);
            showToast("error", error.message || "Failed to upload avatar");
        } finally {
            setUploadingAvatar(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
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
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <Loader2 size={36} className="animate-spin text-brand-primary" />
                <p className="text-brand-muted text-sm font-medium">Loading your profile...</p>
            </div>
        );
    }

    const isInstructor = profile?.profileType?.toLowerCase() === "instructor";

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-12">
            <ProfileHeader isInstructor={isInstructor} />

            {/* Main Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                
                {/* Left Card: Summary & Stats */}
                <div className="lg:col-span-1 space-y-6">
                    <ProfileCard 
                        profile={profile}
                        avatarUrl={avatarUrl}
                        name={name}
                        yearsOfExperience={yearsOfExperience}
                        uploadingAvatar={uploadingAvatar}
                        onAvatarClick={handleAvatarClick}
                        isInstructor={isInstructor}
                        getInitials={getInitials}
                        onShowRequests={() => setShowRequestsModal(true)}
                    />

                    {/* Hidden File Input */}
                    <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleAvatarSelect}
                        className="hidden"
                    />
                </div>

                {/* Right Form: Details Form */}
                <div className="lg:col-span-3">
                    <ProfileForm 
                        name={name}
                        setName={setName}
                        phone={phone}
                        setPhone={setPhone}
                        gender={gender}
                        setGender={setGender}
                        country={country}
                        setCountry={setCountry}
                        bio={bio}
                        setBio={setBio}
                        yearsOfExperience={yearsOfExperience}
                        setYearsOfExperience={setYearsOfExperience}
                        linkedinUrl={linkedinUrl}
                        setLinkedinUrl={setLinkedinUrl}
                        portfolioUrl={portfolioUrl}
                        setPortfolioUrl={setPortfolioUrl}
                        saving={saving}
                        onSubmit={handleSave}
                        onCancel={handleCancel}
                        isInstructor={isInstructor}
                    />
                </div>
            </div>

            {/* Image Cropping Modal */}
            {showCropModal && cropFile && (
                <ImageCropModal 
                    file={cropFile}
                    onCrop={handleCropApplied}
                    onClose={() => {
                        setShowCropModal(false);
                        setCropFile(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                />
            )}

            {/* Instructor Applications History Modal */}
            {showRequestsModal && (
                <InstructorRequestsModal 
                    onClose={() => setShowRequestsModal(false)}
                />
            )}
        </div>
    );
}
