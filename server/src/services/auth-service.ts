import type { AuthResponse, LoginRequest, RegisterRequest, SafeUserData } from "@/lib/types";
import { Role } from "@/database/models/role";
import { User } from "@/database/models/user";
import { Wallet } from "@/database/models/wallet";
import { ERROR_CODES } from "@/lib/constants";
import { AppError } from "@/middlewares/error-handler";
import { hashPassword, verifyPassword } from "@/utils/crypto";
import { generateToken } from "@/utils/jwt";

/**
 * Register new user
 * Flow:
 * 1. Check if email already exists
 * 2. Hash the password (client already hashed with Argon2)
 * 3. Assign role and Create user in database
 * 4. Store user wallet details
 * 4. Generate JWT tokens
 * 5. Return auth response
 * @param data - Registration data from client
 * @returns Authentication response with tokens
 */
export async function registerUser(data: RegisterRequest): Promise<AuthResponse> {
  const isExistingUser = await User.findOne({ where: { email: data.email } });
  if (isExistingUser) {
    throw new AppError(ERROR_CODES.EMAIL_ALREADY_EXISTS, "This email is already exist on our system. do you want to login?", 409);
  }

  const hashedPassword = await hashPassword(data.passwordHash);

  const userRole = await Role.findOne({ where: { name: "user" } });
  if (!userRole) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Default user role not found", 500);
  }

  const user = await User.create({
    email: data.email,
    roleId: userRole.id,
    passwordHash: hashedPassword,
    salt: data.salt,
  });

  const wallet = await Wallet.create({
    userId: user.id,
    walletAddress: data.walletAddress,
    encryptedPrivateKey: data.encryptedPrivateKey,
  });

  const jwtToken = generateToken(user.id);

  const safeUserdata: SafeUserData = {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    cid: user.cid,
    dob: user.dob,
    gender: user.gender,
    role: userRole.name,
    contactNumber: user.contactNumber,
    maritalStatus: user.maritalStatus,
    address: user.address,
    walletAddress: wallet.walletAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: safeUserdata,
    jwtToken,
    salt: user.salt,
  };
}

/**
 * Authenticate a user
 *
 * Flow:
 * 1. Find user by email
 * 3. Verify password
 * 6. Generate tokens
 *
 * @param data - Login credentials
 * @returns Authentication response with tokens
 * @throws AppError if login fails
 */
export async function loginUser(data: LoginRequest): Promise<AuthResponse> {
  const user = await User.findOne({
    where: { email: data.email },
    include: [
      { model: Wallet, as: "wallet" },
      { model: Role, as: "role" },
    ],
  });

  if (!user) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
  }

  const isPasswordValid = await verifyPassword(data.passwordHash, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError(ERROR_CODES.INVALID_CREDENTIALS, "Invalid email or password", 401);
  }

  if (!user.wallet || !user.role) {
    throw new AppError(ERROR_CODES.INTERNAL_ERROR, "Invalid user", 500);
  }

  const jwtToken = generateToken(user.id);

  const safeUserData: SafeUserData = {
    id: user.id,
    email: user.email,
    emailVerified: user.emailVerified,
    cid: user.cid,
    dob: user.dob,
    gender: user.gender,
    role: user.role.name,
    contactNumber: user.contactNumber,
    maritalStatus: user.maritalStatus,
    address: user.address,
    walletAddress: user.wallet.walletAddress,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return {
    user: safeUserData,
    jwtToken,
    salt: user.salt,
  };
}
