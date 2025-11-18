import { useMemo } from "react";
import { PublicKey } from "@solana/web3.js";
import { getBusinessPda } from "../lib/localshare";

/**
 * Hook to derive the Business PDA for a given owner
 * @param ownerPubkey - PublicKey of the business owner (null if not available)
 * @returns [businessPda, bump] or [null, null] if ownerPubkey is null
 */
export function useBusinessPda(ownerPubkey: PublicKey | null) {
  return useMemo(() => {
    if (!ownerPubkey) {
      return [null, null] as [null, null];
    }
    return getBusinessPda(ownerPubkey);
  }, [ownerPubkey]);
}

