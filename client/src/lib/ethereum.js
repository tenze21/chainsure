/**
 * Ethereum / Viem configuration for ChainSure
 * Use this module for blockchain interactions (wallet, contract calls, etc.)
 */
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Public client for read operations (adjust chain for your deployment)
export const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
});

// Re-export viem utilities for use across the app
export { formatEther, parseEther, formatUnits, parseUnits } from 'viem';
