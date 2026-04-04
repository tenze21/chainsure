import type { Hex } from "viem";
import env from "@config/env";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { anvil, sepolia } from "viem/chains";

const privateKey = env.PRIVATE_KEY as Hex;
export const account = privateKeyToAccount(privateKey);

const chain = env.NODE_ENV === "development" ? anvil : sepolia;

export const client = createWalletClient({
  account,
  chain,
  transport: http(env.RPC_URL),
}).extend(publicActions);
