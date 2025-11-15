import { PublicKey } from "@solana/web3.js";

/**
 * Program Configuration Constants
 * 
 * These values should match the deployed program on the target network
 */

// Program ID on Devnet
export const PROGRAM_ID = new PublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID || "8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y"
);

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

// Explorer URL based on network
export const getExplorerUrl = (signature: string): string => {
  const cluster = NETWORK === "mainnet-beta" ? "" : `?cluster=${NETWORK}`;
  return `https://explorer.solana.com/tx/${signature}${cluster}`;
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_INVESTMENT: process.env.NEXT_PUBLIC_ENABLE_INVESTMENT !== "false",
  ENABLE_REGISTRATION: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION !== "false",
} as const;

// Transaction timeouts
export const TX_TIMEOUT = 60000; // 60 seconds

// RPC Configuration
export const RPC_CONFIG = {
  commitment: "confirmed" as const,
  preflightCommitment: "confirmed" as const,
};

