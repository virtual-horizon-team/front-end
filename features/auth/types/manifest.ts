export interface Profile {
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

export interface Capabilities {
  isInstructor: boolean;
  isFreelancer: boolean;
  isPublisher: boolean;
  // This index signature allows checking capability by string key dynamically if needed later
  [key: string]: boolean | undefined;
}

export interface Manifest {
  userId: string;
  userName: string | null;
  profile: Profile;
  capabilities: Capabilities;
  roles: string[];
  lastUpdated: string;
}
