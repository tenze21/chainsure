import env from "@config/env";
import { createPublicClient, createWalletClient, http } from "viem";
import { sepolia } from "viem/chains";

export const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(env.RPC_URL),
});
