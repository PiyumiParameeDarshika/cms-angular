export interface User {
  id: number;
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
  isLocked: boolean;
  createdDateTime: string;
  lastLoginDateTime?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  username: string;
  phoneNumber?: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber?: string;
  role: string;
  isActive: boolean;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserSearchRequest {
  keyword?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}
