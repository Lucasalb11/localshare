"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { clusterApiUrl } from "@solana/web3.js";

// Importa estilos do wallet adapter
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

/**
 * Provider principal do Solana que configura a conexão e os wallets
 * Usa Devnet por padrão
 */
export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Define a rede como Devnet
  const network = WalletAdapterNetwork.Devnet;

  // Endpoint da RPC (pode ser customizado para usar RPC privado)
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Lista de wallets suportados
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      // Adicione outros wallets aqui se necessário
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

