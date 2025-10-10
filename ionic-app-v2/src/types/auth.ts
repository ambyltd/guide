/**
 * Types d'authentification - Architecture type-safe
 */

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
  subscription?: UserSubscription;
}

export interface UserSubscription {
  type: 'free' | 'premium' | 'pro';
  expiresAt?: Date;
  features: string[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}