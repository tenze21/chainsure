export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
}

export enum Role {
  ADMIN = "admin",
  USER = "user",
}

export enum MaritalStatus {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
}

export enum PaymentType {
  FIXED = "fixed",
  RECURRING = "recurring",
}

export enum PolicyStatus {
  ACTIVE = "active",
  PENDING = "pending",
  EXPIRED = "expired",
  CLAIMED = "claimed",
  CANCELLED = "cancelled",
  INVALIDATED = "invalidated",
}

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  cid: string;
  dob: Date;
  gender: Gender;
  passwordHash: string;
  role: Role;
  contactNumber: number;
  maritalStatus: MaritalStatus;
  address: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUserData {
  id: string;
  email: string;
  emailVerified: boolean;
  cid: string;
  age: number;
  gender: Gender;
  role: Role;
  contactNumber: number;
  maritalStatus: MaritalStatus;
  address: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PolicyTemplate {
  id: string;
  policy_name: string;
  description: string;
  category: string;
  paymentType: PaymentType;
  coverage_amount: number;
  duration_days: number;
  coverage_details: string;
  eligibility_criteria: string;
  limitations: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Policy {
  id: string;
  template: PolicyTemplate;
  status: PolicyStatus;
  premium_amount: number;
  deductible_amount: number;
  coverage_start_date: Date;
  coverage_end_date: Date;
  transaction_hash: string;
  token_id: string;
  signature: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginRequest {
  email: string;
  passwordHash: string;
}

export interface RegisterRequest {
  email: string;
  CID: string;
  passwordHash: string;
  walletAddress: string;
  encryptedPrivateKey: string;
}

export interface AuthResponse {
  user: SafeUserData;
  jwtToken: string;
}

export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export type LoginResponse = AuthResponse;
