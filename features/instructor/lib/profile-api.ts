import { api } from "@/features/auth/lib/api-client";

export interface UserProfile {
    profileId: string;
    profileType: string;
    userId: string;
    name: string;
    bio: string | null;
    phone: string | null;
    country: string;
    gender: string;
    avatarUrl: string;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    yearsOfExperience: number | null;
    averageRating: number | null;
    totalReview: number | null;
    requestId: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateProfileRequest {
    name: string;
    bio: string | null;
    phone: string | null;
    country: string;
    gender: string;
    avatarUrl: string;
    linkedinUrl: string | null;
    portfolioUrl: string | null;
    yearsOfExperience: number;
}

export const profileApi = {
    getProfile: () => {
        return api<UserProfile>("/api/Profile");
    },

    updateProfile: (data: UpdateProfileRequest) => {
        return api<UserProfile>("/api/Profile", {
            method: "PUT",
            body: JSON.stringify(data),
        });
    },

    uploadAvatar: (file: File) => {
        const formData = new FormData();
        formData.append("avatar", file);

        return api<{ avatarUrl: string }>("/api/Profile/avatar/upload", {
            method: "POST",
            body: formData,
        });
    }
};
