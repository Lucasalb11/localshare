"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, SolflareWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Import wallet adapter styles
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

/**
 * Main Solana Provider that configures connection and wallets
 * Supports Localnet, Devnet and Mainnet
 * 
 * Environment Variables:
 * - NEXT_PUBLIC_SOLANA_NETWORK: Network selection (default: devnet)
 * - NEXT_PUBLIC_SOLANA_RPC_ENDPOINT: Custom RPC endpoint (optional)
 * 
 * For production, it's recommended to use a dedicated RPC provider
 * like Helius, QuickNode, or Alchemy for better performance and reliability
 */
export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Detect network via environment variable (default: devnet)
  const networkEnv = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  
  // RPC Endpoint configuration
  const endpoint = useMemo(() => {
    // If custom RPC endpoint is provided, use it
    const customEndpoint = process.env.NEXT_PUBLIC_SOLANA_RPC_ENDPOINT;
    if (customEndpoint) {
      return customEndpoint;
    }
    
    // For localnet, use custom endpoint
    if (networkEnv === "localnet") {
      return "http://127.0.0.1:8899";
    }
    
    // For devnet/mainnet, use public clusterApiUrl
    // Note: For production with high traffic, consider using a dedicated RPC provider
    const network = networkEnv === "mainnet" 
      ? WalletAdapterNetwork.Mainnet 
      : WalletAdapterNetwork.Devnet;
    
    return clusterApiUrl(network);
  }, [networkEnv]);

  // List of supported wallets
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // Add more wallets here if needed
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
