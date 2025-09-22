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
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
  };
}

export interface TokenPayload {
  sub: string; 
  exp: number; 
  iat: number; 
  roles: string[];
  userId: number;
}
