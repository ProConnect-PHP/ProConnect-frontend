export type ProfessionalProfile = {
  id: string;
  bio: string | null;
  avg_rating: number;
  reviews_count: number;
  is_verified: boolean;
  created_at: string;
};

export type ProfessionalProfileResponse = {
  professional_profile: ProfessionalProfile;
};

export type StoreProfessionalProfileRequest = {
  bio: string | null;
};
