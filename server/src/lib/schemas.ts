import { z } from "zod";

export const EmailSchema = z
  .email("Invalid email format")
  .toLowerCase()
  .trim();

export const PasswordSchema = z
  .string()
  .min(12, "Master password must be at least 12 characters")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter")
  .regex(/[a-z]/, "Must contain at least one lowercase letter")
  .regex(/\d/, "Must contain at least one number")
  .regex(/[^A-Z0-9]/i, "Must contain at least one special character");

export const WalletAddressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum wallet address format")
  .toLowerCase()
  .trim();

export const CIDSchema = z
  .string()
  // eslint-disable-next-line regexp/no-dupe-characters-character-class
  .regex(/^[a-zA-Z0-9]+$/i, "CID must be alphanumeric")
  .min(11, "CID must be at least 11 characters")
  .max(11, "CID must be at most 11 characters")
  .trim();

export const Base64WithIvSchema = z
  .string()
  // eslint-disable-next-line regexp/use-ignore-case
  .regex(/^[A-Za-z0-9+/]+=*:[A-Za-z0-9+/]+=*$/, "Invalid base64 with iv format.");

export const Base64Schema = z
  .string()
  // eslint-disable-next-line regexp/use-ignore-case
  .regex(/^[A-Za-z0-9+/]+=*$/, "Invalid base64 format.");

export const PasswordHashSchema = z
  .string()
  .min(32, "Invalid password hash format.");

export const ContactNumberSchema = z
  .string()
  .regex(/\b(17|77)\d{6}\b/, "Invalid contact number.");

export const RegisterSchema = z.object({
  email: EmailSchema,
  passwordHash: PasswordHashSchema,
  walletAddress: WalletAddressSchema,
  encryptedPrivateKey: Base64WithIvSchema,
  salt: Base64Schema,
});

export const LoginSchema = z.object({
  email: EmailSchema,
  passwordHash: PasswordHashSchema,
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
