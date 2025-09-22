import { User } from './user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface TokenPayload {
  sub: string; 
  exp: number; 
  iat: number; 
  roles: string[];
  userId: number;
}
