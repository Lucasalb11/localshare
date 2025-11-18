import { AnchorProvider, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import idl from "../idl/localshare.json";

/**
 * Program ID do Localshare Lite
 * Substitua este valor com o endereço real após o deploy
 */
export const LOCALSHARE_PROGRAM_ID = new PublicKey(
  "8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y"
);

/**
 * Cria uma instância do programa Localshare
 * @param provider - AnchorProvider configurado com connection e wallet
 * @returns Program instance
 */
export function getLocalshareProgram(provider: AnchorProvider): Program<Idl> {
  return new Program(idl as Idl, provider);
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
