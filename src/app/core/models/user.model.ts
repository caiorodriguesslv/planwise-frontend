export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  active: boolean;
  role: UserRole;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  createdAt: string;
  active: boolean;
  role: UserRole;
}

export interface UserUpdateRequest {
  name: string;
  email: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}
