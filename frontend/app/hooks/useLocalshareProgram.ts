import { useMemo } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider } from "@coral-xyz/anchor";
import { getLocalshareProgram } from "../lib/localshare";

/**
 * Hook para obter a instância do programa Localshare
 * Retorna null se a wallet não estiver conectada
 */
export function useLocalshareProgram() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const provider = useMemo(() => {
    if (!wallet.publicKey || !wallet.signTransaction || !wallet.signAllTransactions) {
      return null;
    }

    try {
      return new AnchorProvider(
        connection,
        wallet as any,
        AnchorProvider.defaultOptions()
      );
    } catch (error) {
      console.error("Erro ao criar provider:", error);
      return null;
    }
  }, [connection, wallet]);

  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return getLocalshareProgram(provider);
    } catch (error) {
      console.error("Erro ao criar programa:", error);
      return null;
    }
  }, [provider]);

  return {
    program,
    provider,
    wallet,
  };
}
