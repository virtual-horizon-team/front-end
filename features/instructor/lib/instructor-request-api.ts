import { api } from "@/features/auth/lib/api-client";

export interface InstructorRoleRequestPayload {
  name: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  hasToughtBefore?: boolean;
  documents: File[];
}

export interface RoleRequestItem {
  requestId: string;
  status: "Pending" | "Approved" | "Rejected";
  createdAt: string;
  processedAt?: string;
  name: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  yearsOfExperience?: number;
  hasToughtBefore?: boolean;
  documentsCount: number;
}

export interface RoleRequestsResponse {
  items: RoleRequestItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

export const instructorRequestApi = {
  /**
   * Submits the instructor role request to the backend.
   * Uses multipart/form-data.
   */
  submitInstructorRequest: async (payload: InstructorRoleRequestPayload): Promise<{ message: string }> => {
    const formData = new FormData();

    // Append required name
    formData.append("Name", payload.name);

    // Append optional URLs (matching Swagger API definition)
    if (payload.linkedinUrl) {
      formData.append("LinkedinUrl", payload.linkedinUrl);
    }
    if (payload.portfolioUrl) {
      formData.append("PortfolioUrl", payload.portfolioUrl);
    }

    // Append experience and boolean fields
    if (payload.yearsOfExperience !== undefined) {
      formData.append("YearsOfExperience", payload.yearsOfExperience.toString());
    }
    if (payload.hasToughtBefore !== undefined) {
      formData.append("HasToughtBefore", payload.hasToughtBefore.toString());
    }

    // Append documents (array of files) exactly once under key "Documents"
    payload.documents.forEach((file) => {
      formData.append("Documents", file);
    });

    return api<{ message: string }>("/api/Profile/role-request/instructor", {
      method: "POST",
      body: formData,
      timeout: 120000, // 2 minutes to accommodate document uploads
    });
  },

  /**
   * Retrieves all instructor role requests submitted by the logged-in user.
   */
  getInstructorRequests: async (): Promise<RoleRequestsResponse> => {
    return api<RoleRequestsResponse>("/api/Profile/role-request/instructor");
  },
};
