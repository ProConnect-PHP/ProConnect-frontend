import { User } from '../models/auth.models';

export function hasProfessionalAccess(user: User | null): boolean {
  if (!user) return false;
  if (user.professional_profile_status === 'suspended') return false;

  return (
    user.role === 'professional' ||
    user.has_professional_profile === true ||
    user.professional_profile_status === 'active'
  );
}
