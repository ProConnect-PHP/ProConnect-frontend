export type User = {
  id: string;
  name: string;
  email: string;
  role: 'client' | 'professional';
  avatar_url: string | null;
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
