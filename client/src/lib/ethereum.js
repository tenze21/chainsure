/**
 * Ethereum / Viem configuration for ChainSure
 * Use this module for blockchain interactions (wallet, contract calls, etc.)
 */
import { createPublicClient, http } from 'viem';
import { mainnet, sepolia, anvil } from 'viem/chains';

const chainId = (import.meta.env.VITE_CHAIN_ID || 'sepolia').trim();
const rpcUrl = import.meta.env.VITE_RPC_URL || '';

const chainMap = {
  'mainnet': mainnet,
  'sepolia': sepolia,
  'anvil': anvil,
};

const selectedChain = chainMap[chainId] || sepolia;

export const publicClient = createPublicClient({
  chain: selectedChain,
  transport: http(rpcUrl),
});

// Re-export viem utilities for use across the app
export { formatEther, parseEther, formatUnits, parseUnits } from 'viem';
