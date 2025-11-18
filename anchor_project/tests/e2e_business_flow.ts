import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Connection,
} from "@solana/web3.js";
import { assert } from "chai";
import * as token from "@solana/spl-token";

/**
 * End-to-End Business Flow Test
 * 
 * This test simulates the complete business registration and investment flow:
 * 1. Owner registers a business
 * 2. Owner configures offering parameters
 * 3. Owner initializes share mint
 * 4. Owner lists business on marketplace
 * 5. Buyer purchases shares
 * 6. Verifies token transfer and SOL payment
 */
describe("E2E Business Flow - Register -> Configure -> Mint -> List -> Buy", () => {
  // Setup provider and program
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.myProgram as Program<MyProgram>;
  const connection = provider.connection;

  // Keypairs
  let owner: Keypair;
  let buyer: Keypair;
  let treasury: Keypair;

  // PDAs
  let businessPda: PublicKey;
  let shareMintPda: PublicKey;
  let shareMintAuthorityPda: PublicKey;
  let sharesVaultPda: PublicKey;

  // Test parameters
  const BUSINESS_NAME = "Test Coffee Shop";
  const TOTAL_SHARES = 1_000;
  const PRICE_PER_SHARE_LAMPORTS = 1_000_000; // 0.001 SOL per share
  const SHARES_TO_BUY = 10;
  const EXPECTED_COST = SHARES_TO_BUY * PRICE_PER_SHARE_LAMPORTS;

  before(async () => {
    console.log("\n🔧 Setting up E2E test environment...");

    // Generate keypairs
    owner = Keypair.generate();
    buyer = Keypair.generate();
    treasury = Keypair.generate();

    console.log("📍 Owner:", owner.publicKey.toString());
    console.log("📍 Buyer:", buyer.publicKey.toString());
    console.log("📍 Treasury:", treasury.publicKey.toString());

    // Airdrop SOL to owner and buyer on devnet
    console.log("\n💰 Airdropping SOL to owner and buyer...");
    
    try {
      // Airdrop to owner (needs funds for transactions)
      const ownerAirdropSig = await connection.requestAirdrop(
        owner.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(ownerAirdropSig, "confirmed");
      console.log("✅ Owner airdropped:", ownerAirdropSig);

      // Airdrop to buyer (needs funds for purchase)
      const buyerAirdropSig = await connection.requestAirdrop(
        buyer.publicKey,
        2 * LAMPORTS_PER_SOL
      );
      await connection.confirmTransaction(buyerAirdropSig, "confirmed");
      console.log("✅ Buyer airdropped:", buyerAirdropSig);
    } catch (error) {
      console.warn("⚠️  Airdrop failed (might be rate-limited), using provider wallet to fund accounts");
      
      // Fallback: transfer from provider wallet
      const providerWallet = provider.wallet as anchor.Wallet;
      const fundTx = new anchor.web3.Transaction().add(
        SystemProgram.transfer({
          fromPubkey: providerWallet.publicKey,
          toPubkey: owner.publicKey,
          lamports: 2 * LAMPORTS_PER_SOL,
        }),
        SystemProgram.transfer({
          fromPubkey: providerWallet.publicKey,
          toPubkey: buyer.publicKey,
          lamports: 2 * LAMPORTS_PER_SOL,
        })
      );
      await anchor.web3.sendAndConfirmTransaction(
        connection,
        fundTx,
        [providerWallet.payer as Keypair]
      );
      console.log("✅ Accounts funded via provider wallet");
    }

    // Derive PDAs
    [businessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("business"), owner.publicKey.toBuffer()],
      program.programId
    );

    [shareMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint"), businessPda.toBuffer()],
      program.programId
    );

    [shareMintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    [sharesVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("shares_vault"), businessPda.toBuffer()],
      program.programId
    );

    console.log("\n📍 Derived PDAs:");
    console.log("   Business PDA:", businessPda.toString());
    console.log("   Share Mint PDA:", shareMintPda.toString());
    console.log("   Share Mint Authority PDA:", shareMintAuthorityPda.toString());
    console.log("   Shares Vault PDA:", sharesVaultPda.toString());
  });

  it("Complete E2E Flow: Register -> Configure -> Init Mint -> List -> Buy", async () => {
    console.log("\n🚀 Starting E2E Business Flow Test");
    console.log("=" .repeat(60));

    // ============================================================
    // STEP 1: Register Business
    // ============================================================
    console.log("\n📝 Step 1: Registering Business");

    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );
    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );
    const ownerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: owner.publicKey,
    });

    const registerTx = await program.methods
      .registerBusiness(BUSINESS_NAME)
      .accounts({
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        ownerTokenAccount,
        owner: owner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("✅ RegisterBusiness transaction:", registerTx);

    const businessAfterRegister = await program.account.business.fetch(businessPda);
    assert.equal(businessAfterRegister.name, BUSINESS_NAME, "Business name should match");
    assert.isFalse(businessAfterRegister.isListed, "Business should not be listed yet");
    console.log("   ✅ Business registered successfully");

    // ============================================================
    // STEP 2: Configure Offering
    // ============================================================
    console.log("\n📝 Step 2: Configuring Offering");

    const configureTx = await program.methods
      .configureOffering(
        new anchor.BN(TOTAL_SHARES),
        new anchor.BN(PRICE_PER_SHARE_LAMPORTS),
        treasury.publicKey
      )
      .accounts({
        business: businessPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("✅ ConfigureOffering transaction:", configureTx);

    const businessAfterConfigure = await program.account.business.fetch(businessPda);
    assert.equal(
      businessAfterConfigure.totalShares.toString(),
      TOTAL_SHARES.toString(),
      "Total shares should match"
    );
    assert.equal(
      businessAfterConfigure.pricePerShareLamports.toString(),
      PRICE_PER_SHARE_LAMPORTS.toString(),
      "Price per share should match"
    );
    assert.ok(
      businessAfterConfigure.treasury.equals(treasury.publicKey),
      "Treasury should match"
    );
    assert.isFalse(businessAfterConfigure.isListed, "Business should still not be listed");
    console.log("   ✅ Offering configured successfully");

    // ============================================================
    // STEP 3: Initialize Share Mint
    // ============================================================
    console.log("\n📝 Step 3: Initializing Share Mint");

    const initMintTx = await program.methods
      .initShareMint()
      .accounts({
        business: businessPda,
        owner: owner.publicKey,
        shareMint: shareMintPda,
        shareMintAuthority: shareMintAuthorityPda,
        sharesVault: sharesVaultPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("✅ InitShareMint transaction:", initMintTx);

    const businessAfterInitMint = await program.account.business.fetch(businessPda);
    assert.ok(
      businessAfterInitMint.shareMint.equals(shareMintPda),
      "Share mint should be set"
    );

    // Verify vault has all shares
    const vaultBalance = await connection.getTokenAccountBalance(sharesVaultPda);
    assert.equal(
      vaultBalance.value.amount,
      TOTAL_SHARES.toString(),
      "Vault should contain all shares"
    );
    console.log("   ✅ Share mint initialized, vault contains", vaultBalance.value.amount, "shares");

    // ============================================================
    // STEP 4: List Business
    // ============================================================
    console.log("\n📝 Step 4: Listing Business on Marketplace");

    const listTx = await program.methods
      .listBusiness()
      .accounts({
        business: businessPda,
        owner: owner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([owner])
      .rpc();

    console.log("✅ ListBusiness transaction:", listTx);

    const businessAfterList = await program.account.business.fetch(businessPda);
    assert.isTrue(businessAfterList.isListed, "Business should be listed");
    console.log("   ✅ Business listed successfully");

    // ============================================================
    // STEP 5: Buyer Purchases Shares
    // ============================================================
    console.log("\n📝 Step 5: Buyer Purchasing Shares");

    // Get balances before purchase
    const treasuryBalanceBefore = await connection.getBalance(treasury.publicKey);
    const buyerBalanceBefore = await connection.getBalance(buyer.publicKey);
    const vaultBalanceBefore = await connection.getTokenAccountBalance(sharesVaultPda);

    console.log("💰 Balances before purchase:");
    console.log("   Treasury:", treasuryBalanceBefore / LAMPORTS_PER_SOL, "SOL");
    console.log("   Buyer:", buyerBalanceBefore / LAMPORTS_PER_SOL, "SOL");
    console.log("   Vault shares:", vaultBalanceBefore.value.amount);

    // Get buyer's ATA for share mint
    const buyerSharesAta = await anchor.utils.token.associatedAddress({
      mint: shareMintPda,
      owner: buyer.publicKey,
    });

    const buyTx = await program.methods
      .buyShares(new anchor.BN(SHARES_TO_BUY))
      .accounts({
        buyer: buyer.publicKey,
        business: businessPda,
        sharesVault: sharesVaultPda,
        treasury: treasury.publicKey,
        buyerSharesAta: buyerSharesAta,
        shareMint: shareMintPda,
        shareMintAuthority: shareMintAuthorityPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    console.log("✅ BuyShares transaction:", buyTx);

    // ============================================================
    // STEP 6: Verify Results
    // ============================================================
    console.log("\n📝 Step 6: Verifying Results");

    // Check buyer's token balance
    const buyerTokenBalance = await connection.getTokenAccountBalance(buyerSharesAta);
    assert.equal(
      buyerTokenBalance.value.amount,
      SHARES_TO_BUY.toString(),
      `Buyer should have ${SHARES_TO_BUY} shares`
    );
    console.log("   ✅ Buyer received", buyerTokenBalance.value.amount, "shares");

    // Check treasury balance increased
    const treasuryBalanceAfter = await connection.getBalance(treasury.publicKey);
    const treasuryIncrease = treasuryBalanceAfter - treasuryBalanceBefore;
    console.log("   💰 Treasury increased by:", treasuryIncrease / LAMPORTS_PER_SOL, "SOL");
    
    // Allow for transaction fees (should receive at least EXPECTED_COST - small fee)
    assert.isTrue(
      treasuryIncrease >= EXPECTED_COST - 10_000, // Allow 0.00001 SOL for fees
      `Treasury should have received at least ${EXPECTED_COST / LAMPORTS_PER_SOL} SOL (minus fees)`
    );

    // Check vault balance decreased
    const vaultBalanceAfter = await connection.getTokenAccountBalance(sharesVaultPda);
    const vaultDecrease = BigInt(vaultBalanceBefore.value.amount) - BigInt(vaultBalanceAfter.value.amount);
    assert.equal(
      vaultDecrease.toString(),
      SHARES_TO_BUY.toString(),
      "Vault should have decreased by the amount purchased"
    );
    console.log("   ✅ Vault decreased by", vaultDecrease.toString(), "shares");

    console.log("\n" + "=".repeat(60));
    console.log("✅ E2E Business Flow Test Completed Successfully!");
    console.log("=".repeat(60));
    console.log("\n📊 Summary:");
    console.log("   Business:", BUSINESS_NAME);
    console.log("   Total Shares:", TOTAL_SHARES);
    console.log("   Price per Share:", PRICE_PER_SHARE_LAMPORTS / LAMPORTS_PER_SOL, "SOL");
    console.log("   Shares Purchased:", SHARES_TO_BUY);
    console.log("   Total Cost:", EXPECTED_COST / LAMPORTS_PER_SOL, "SOL");
    console.log("   Buyer Token Account:", buyerSharesAta.toString());
    console.log("   Treasury:", treasury.publicKey.toString());
  });
});

