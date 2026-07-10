export interface RegisterPayload {
  email: string;
  password?: string;
}

export interface LoginPayload {
  email: string;
  password?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    userId: string;
    email: string;
    role: 'USER' | 'ADMIN';
  };
}