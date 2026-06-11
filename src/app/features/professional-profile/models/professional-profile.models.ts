import { User } from '../../../core/auth/models/auth.models';

export type ProfessionalProfile = {
  id: string;
  bio: string | null;
  avg_rating: number;
  reviews_count: number;
  is_verified: boolean;
  created_at: string;
};

export type ProfessionalProfileResponse = {
  message?: string;
  professional_profile: ProfessionalProfile;
  user?: User;
};

export type StoreProfessionalProfileRequest = {
  bio: string | null;
};
