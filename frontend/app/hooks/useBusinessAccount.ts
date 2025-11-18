import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { getBusinessPda } from "../lib/localshare";
import { BN } from "@coral-xyz/anchor";
import { useLocalshareProgram } from "./useLocalshareProgram";

export interface BusinessAccount {
  owner: PublicKey;
  name: string;
  shareMint: PublicKey;
  totalShares: BN;
  pricePerShareLamports: BN;
  treasury: PublicKey;
  isListed: boolean;
  bump: number;
}

/**
 * Hook to fetch the Business account for a given owner
 * @param ownerPubkey - PublicKey of the business owner (null if not available)
 * @returns { business: BusinessAccount | null, loading: boolean, error: Error | null }
 */
export function useBusinessAccount(ownerPubkey: PublicKey | null) {
  const { connection } = useConnection();
  const { program } = useLocalshareProgram();
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!ownerPubkey) {
      setBusiness(null);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchBusiness = async () => {
      try {
        setLoading(true);
        setError(null);

        const [businessPda] = getBusinessPda(ownerPubkey);
        
        // Try to use Anchor's account parsing if program is available
        if (program) {
          try {
            // Try capitalized account name first (as per IDL)
            let account;
            try {
              account = await (program.account as any).Business.fetch(businessPda);
            } catch {
              // Fallback to lowercase
              account = await (program.account as any).business.fetch(businessPda);
            }
            
            setBusiness({
              owner: account.owner,
              name: account.name,
              shareMint: account.shareMint,
              totalShares: account.totalShares,
              pricePerShareLamports: account.pricePerShareLamports,
              treasury: account.treasury,
              isListed: account.isListed,
              bump: account.bump,
            });
            setLoading(false);
            return;
          } catch (err) {
            // If account doesn't exist or parsing fails, try manual parsing
            console.log("Anchor parsing failed, trying manual parsing:", err);
          }
        }

        // Fallback to manual parsing
        const accountInfo = await connection.getAccountInfo(businessPda);
        
        if (!accountInfo) {
          setBusiness(null);
          setLoading(false);
          return;
        }

        // Parse the account data using Borsh format
        // Anchor uses Borsh serialization with 8-byte discriminator
        const data = accountInfo.data;
        let offset = 8; // Skip discriminator (8 bytes)

        // Read owner (32 bytes)
        const owner = new PublicKey(data.slice(offset, offset + 32));
        offset += 32;

        // Read name (4 bytes length + string, Borsh uses u32 for length)
        const nameLength = data.readUInt32LE(offset);
        offset += 4;
        const nameBytes = data.slice(offset, offset + nameLength);
        const name = new TextDecoder().decode(nameBytes);
        offset += nameLength;

        // Read share_mint (32 bytes)
        const shareMint = new PublicKey(data.slice(offset, offset + 32));
        offset += 32;

        // Read total_shares (u64, 8 bytes, little-endian)
        const totalShares = new BN(data.slice(offset, offset + 8), 'le');
        offset += 8;

        // Read price_per_share_lamports (u64, 8 bytes, little-endian)
        const pricePerShareLamports = new BN(data.slice(offset, offset + 8), 'le');
        offset += 8;

        // Read treasury (32 bytes)
        const treasury = new PublicKey(data.slice(offset, offset + 32));
        offset += 32;

        // Read is_listed (bool, 1 byte, Borsh uses u8: 0 = false, 1 = true)
        const isListed = data[offset] === 1;
        offset += 1;

        // Read bump (u8, 1 byte)
        const bump = data[offset];

        setBusiness({
          owner,
          name,
          shareMint,
          totalShares,
          pricePerShareLamports,
          treasury,
          isListed,
          bump,
        });
      } catch (err) {
        console.error("Error fetching business account:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch business account"));
        setBusiness(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [ownerPubkey, connection, program]);

  return { business, loading, error };
}

