export type User = {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'professional' | 'admin';
  avatar_url: string | null;

  email_verified_at: string | null;
  email_verified: boolean;

  has_professional_profile?: boolean;
  professional_profile_status?: 'missing' | 'draft' | 'active' | 'suspended';
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type RegisterResponse = {
  message: string;
  user: User;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type OAuthProvider = 'google' | 'github';

export type OAuthExchangeRequest = {
  code: string;
};

export type AuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
  user: User;
};

export type RefreshTokenRequest = {
  refresh_token: string;
};

export type RefreshTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
};

export type MeResponse = {
  user: User;
};

export type UpdateMeRequest = {
  name?: string;
  avatar_url?: string | null;
};

export type SendEmailVerificationResponse = {
  message: string;
  email_verified: boolean;
  expires_at?: string | null;
};

export type VerifyEmailRequest = {
  email: string;
  token: string;
};

export type VerifyEmailResponse = {
  message: string;
  email_verified: boolean;
  user: User;
};
