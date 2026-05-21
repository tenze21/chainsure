import type { Hex } from "viem";

export enum Gender {
  MALE = "male",
  FEMALE = "female",
  OTHER = "other",
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
  role: string;
  contactNumber: string;
  maritalStatus: MaritalStatus;
  address: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SafeUserData {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  cid: string | null;
  dob: Date | null;
  gender: string | null;
  role: string;
  contactNumber: string | null;
  maritalStatus: string | null;
  address: string | null;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminData {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestUserData {
  id: string;
  email: string;
  emailVerified: boolean;
  role: string;
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
  fullName: string;
  email: string;
  passwordHash: string;
  walletAddress: Hex;
  encryptedPrivateKey: string;
  salt: string;
}

export interface AuthResponse {
  user: SafeUserData;
  jwtToken: string;
  salt: string;
}

export interface AdminAuthResponse {
  user: AdminData;
  jwtToken: string;
  salt: string;
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

export interface InitiatePaymentResponse {
  clientSecret: string;
  type: "payment_intent" | "subscription";
}

export interface PolicySignatureInput {
  id: string;
  userId: string;
  holderCid: string;
  holderName: string;
  name: string;
  category: string;
  coverageAmount: number;
  premium: number;
  deductible: number;
  coverageDetails: string;
  eligibility: string;
  limitations: string;
  duration: number | null;
  createdAt: Date;
}

export interface MintResult {
  tokenId: bigint;
  transactionHash: string;
  contractAddress: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export interface PinataResponse {
  IpfsHash: string;
  PinSize: number; // in bytes
  TimeStamp: string;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export type LoginResponse = AuthResponse;
