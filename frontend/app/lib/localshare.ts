import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../idl/localshare.json";
import { PROGRAM_ID } from "./constants";

/**
 * Program ID do Localshare Lite
 * Must match the deployed program ID on the target network
 */
export const LOCALSHARE_PROGRAM_ID = PROGRAM_ID;

/**
 * Cria uma instância do programa Localshare
 * @param provider - AnchorProvider configurado com connection e wallet
 * @returns Program instance
 */
export function getLocalshareProgram(provider: AnchorProvider): Program<Idl> {
  try {
    const program = new Program(idl as Idl, LOCALSHARE_PROGRAM_ID, provider);
    
    // Verify program ID matches
    if (!program.programId.equals(LOCALSHARE_PROGRAM_ID)) {
      console.warn("Program ID mismatch detected");
    }
    
    return program;
  } catch (error) {
    console.error("Error creating program instance:", error);
    throw error;
  }
}

/**
 * Deriva o PDA da Config global
 * Seeds: ["config"]
 * @returns [PublicKey, bump]
 */
export function getConfigPda(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("config")],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA de um Business
 * Seeds: ["business", owner.toBuffer()]
 * @param owner - PublicKey do proprietário do negócio
 * @returns [PublicKey, bump]
 */
export function getBusinessPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("business"), owner.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA de uma Offering
 * Seeds: ["offering", business.toBuffer(), share_mint.toBuffer()]
 * @param business - PublicKey do business
 * @param shareMint - PublicKey do mint das shares
 * @returns [PublicKey, bump]
 */
export function getOfferingPda(
  business: PublicKey,
  shareMint: PublicKey
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("offering"), business.toBuffer(), shareMint.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA do Mint de um Business
 * Seeds: ["mint", business.toBuffer()]
 * @param business - PublicKey do business
 * @returns [PublicKey, bump]
 */
export function getMintPda(business: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint"), business.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA da Mint Authority de um Business
 * Seeds: ["mint_authority", business.toBuffer()]
 * @param business - PublicKey do business
 * @returns [PublicKey, bump]
 */
export function getMintAuthorityPda(business: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("mint_authority"), business.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA do Share Mint de um Business
 * Seeds: ["share_mint", business.toBuffer()]
 * @param business - PublicKey do business
 * @returns [PublicKey, bump]
 */
export function getShareMintPda(business: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint"), business.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA da Share Mint Authority de um Business
 * Seeds: ["share_mint_authority", business.toBuffer()]
 * @param business - PublicKey do business
 * @returns [PublicKey, bump]
 */
export function getShareMintAuthorityPda(business: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("share_mint_authority"), business.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}

/**
 * Deriva o PDA do Shares Vault de um Business
 * Seeds: ["shares_vault", business.toBuffer()]
 * @param business - PublicKey do business
 * @returns [PublicKey, bump]
 */
export function getSharesVaultPda(business: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("shares_vault"), business.toBuffer()],
    LOCALSHARE_PROGRAM_ID
  );
}
