import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { Keypair, PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { assert } from "chai";

describe("Localshare Lite - Testes de Integração", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.myProgram as Program<MyProgram>;
  
  // Keypairs para testes
  const admin = provider.wallet as anchor.Wallet;
  const businessOwner = Keypair.generate();
  const buyer = Keypair.generate();
  const paymentMint = Keypair.generate(); // Simula o mint de pagamento (ex: USDC)
  const shareMint = Keypair.generate(); // Simula o mint das shares do negócio

  // PDAs
  let configPda: PublicKey;
  let businessPda: PublicKey;
  let offeringPda: PublicKey;

  before(async () => {
    console.log("\n🔧 Setup inicial dos testes");
    
    // Financia as contas de teste
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        businessOwner.publicKey,
        2 * LAMPORTS_PER_SOL
      )
    );
    
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(
        buyer.publicKey,
        15 * LAMPORTS_PER_SOL // Saldo suficiente para comprar todas as shares
      )
    );

    console.log("✅ Admin:", admin.publicKey.toString());
    console.log("✅ Business Owner:", businessOwner.publicKey.toString());
    console.log("✅ Buyer:", buyer.publicKey.toString());

    // Deriva as PDAs
    [configPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    [businessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("business"), businessOwner.publicKey.toBuffer()],
      program.programId
    );

    [offeringPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("offering"),
        businessPda.toBuffer(),
        shareMint.publicKey.toBuffer(),
      ],
      program.programId
    );

    console.log("\n📍 PDAs derivadas:");
    console.log("Config PDA:", configPda.toString());
    console.log("Business PDA:", businessPda.toString());
    console.log("Offering PDA:", offeringPda.toString());
  });

  it("1️⃣ Inicializa a configuração global (init_config)", async () => {
    console.log("\n🚀 Teste 1: Inicializando Config");

    const tx = await program.methods
      .initConfig()
      .accounts({
        config: configPda,
        admin: admin.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a conta foi criada corretamente
    const configAccount = await program.account.config.fetch(configPda);
    
    assert.ok(configAccount.admin.equals(admin.publicKey), "Admin deve ser o wallet do provider");
    assert.ok(configAccount.paymentMint.equals(paymentMint.publicKey), "Payment mint deve estar correto");
    assert.isNumber(configAccount.bump, "Bump deve ser um número");

    console.log("✅ Config inicializada com sucesso!");
    console.log("   Admin:", configAccount.admin.toString());
    console.log("   Payment Mint:", configAccount.paymentMint.toString());
  });

  it("2️⃣ Registra um novo negócio (register_business)", async () => {
    console.log("\n🚀 Teste 2: Registrando Negócio");

    const businessName = "Café da Esquina";

    const tx = await program.methods
      .registerBusiness(businessName)
      .accounts({
        business: businessPda,
        owner: businessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a conta foi criada corretamente
    const businessAccount = await program.account.business.fetch(businessPda);
    
    assert.ok(businessAccount.owner.equals(businessOwner.publicKey), "Owner deve estar correto");
    assert.equal(businessAccount.name, businessName, "Nome deve estar correto");
    assert.ok(businessAccount.shareMint.equals(shareMint.publicKey), "Share mint deve estar correto");
    assert.isNumber(businessAccount.bump, "Bump deve ser um número");

    console.log("✅ Negócio registrado com sucesso!");
    console.log("   Nome:", businessAccount.name);
    console.log("   Owner:", businessAccount.owner.toString());
    console.log("   Share Mint:", businessAccount.shareMint.toString());
  });

  it("2.5️⃣ Cria o mint das shares do negócio (create_business_mint)", async () => {
    console.log("\n🚀 Teste 2.5: Criando Mint das Shares");

    // Calcular as PDAs para mint e mint_authority
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    const tx = await program.methods
      .createBusinessMint()
      .accounts({
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        owner: businessOwner.publicKey,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verificar que o mint foi criado
    const mintAccount = await anchor.utils.token.getMint(
      provider.connection,
      mintPda
    );

    console.log("✅ Mint criado com sucesso!");
    console.log("   Mint Address:", mintPda.toString());
    console.log("   Mint Authority:", mintAuthorityPda.toString());
    console.log("   Decimals:", mintAccount.decimals);
    console.log("   Supply:", mintAccount.supply.toString());
  });

  it("3️⃣ Cria uma oferta de shares (create_offering)", async () => {
    console.log("\n🚀 Teste 3: Criando Oferta");

    // Calcular o mint PDA correto
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const pricePerShare = new anchor.BN(0.1 * LAMPORTS_PER_SOL); // 0.1 SOL por share
    const initialShares = new anchor.BN(100); // 100 shares disponíveis

    const tx = await program.methods
      .createOffering(pricePerShare, initialShares)
      .accounts({
        offering: offeringPda,
        business: businessPda,
        config: configPda,
        owner: businessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a conta foi criada corretamente
    const offeringAccount = await program.account.offering.fetch(offeringPda);
    
    assert.ok(offeringAccount.business.equals(businessPda), "Business deve estar correto");
    assert.ok(offeringAccount.shareMint.equals(shareMint.publicKey), "Share mint deve estar correto");
    assert.ok(offeringAccount.paymentMint.equals(paymentMint.publicKey), "Payment mint deve estar correto");
    assert.equal(offeringAccount.pricePerShare.toString(), pricePerShare.toString(), "Preço deve estar correto");
    assert.equal(offeringAccount.remainingShares.toString(), initialShares.toString(), "Shares restantes devem estar corretas");
    assert.isTrue(offeringAccount.isActive, "Oferta deve estar ativa");

    console.log("✅ Oferta criada com sucesso!");
    console.log("   Preço por share:", offeringAccount.pricePerShare.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("   Shares disponíveis:", offeringAccount.remainingShares.toString());
    console.log("   Status:", offeringAccount.isActive ? "Ativa" : "Inativa");
  });

  it("4️⃣ Compra shares da oferta (buy_shares)", async () => {
    console.log("\n🚀 Teste 4: Comprando Shares");

    const amountToBuy = new anchor.BN(10); // Comprar 10 shares
    const pricePerShare = 0.1 * LAMPORTS_PER_SOL;
    const expectedCost = amountToBuy.toNumber() * pricePerShare;

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    // Calcular o associated token account do buyer
    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    // Saldos antes da transação
    const businessOwnerBalanceBefore = await provider.connection.getBalance(
      businessOwner.publicKey
    );
    const buyerBalanceBefore = await provider.connection.getBalance(
      buyer.publicKey
    );

    console.log("💰 Saldo business owner antes:", businessOwnerBalanceBefore / LAMPORTS_PER_SOL, "SOL");
    console.log("💰 Saldo buyer antes:", buyerBalanceBefore / LAMPORTS_PER_SOL, "SOL");

    const tx = await program.methods
      .buyShares(amountToBuy)
      .accounts({
        offering: offeringPda,
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        buyerTokenAccount: buyerTokenAccount,
        owner: businessOwner.publicKey,
        buyer: buyer.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    console.log("Transaction signature:", tx);

    // Saldos depois da transação
    const businessOwnerBalanceAfter = await provider.connection.getBalance(
      businessOwner.publicKey
    );
    const buyerBalanceAfter = await provider.connection.getBalance(
      buyer.publicKey
    );

    console.log("💰 Saldo business owner depois:", businessOwnerBalanceAfter / LAMPORTS_PER_SOL, "SOL");
    console.log("💰 Saldo buyer depois:", buyerBalanceAfter / LAMPORTS_PER_SOL, "SOL");

    // Verifica que a oferta foi atualizada
    const offeringAccount = await program.account.offering.fetch(offeringPda);
    
    assert.equal(
      offeringAccount.remainingShares.toString(),
      "90",
      "Shares restantes devem ser 90 (100 - 10)"
    );
    assert.isTrue(offeringAccount.isActive, "Oferta ainda deve estar ativa");

    // Verifica que o pagamento foi realizado
    const receivedAmount = businessOwnerBalanceAfter - businessOwnerBalanceBefore;
    assert.equal(
      receivedAmount,
      expectedCost,
      "Business owner deve ter recebido o valor correto"
    );

    // Verificar que os tokens foram minted para o buyer
    const buyerTokenBalance = await provider.connection.getTokenAccountBalance(buyerTokenAccount);
    assert.equal(
      buyerTokenBalance.value.uiAmount,
      amountToBuy.toNumber(),
      "Buyer deve ter recebido os tokens corretos"
    );

    console.log("✅ Compra realizada com sucesso!");
    console.log("   Shares compradas:", amountToBuy.toString());
    console.log("   Shares restantes:", offeringAccount.remainingShares.toString());
    console.log("   Valor pago:", receivedAmount / LAMPORTS_PER_SOL, "SOL");
    console.log("   Tokens recebidos:", buyerTokenBalance.value.uiAmount);
  });

  it("5️⃣ Testa validações: Compra com quantidade inválida", async () => {
    console.log("\n🚀 Teste 5: Tentando comprar 0 shares (deve falhar)");

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    try {
      await program.methods
        .buyShares(new anchor.BN(0))
        .accounts({
          offering: offeringPda,
          business: businessPda,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          buyerTokenAccount: buyerTokenAccount,
          owner: businessOwner.publicKey,
          buyer: buyer.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([buyer])
        .rpc();
      
      assert.fail("Deveria ter falhado ao tentar comprar 0 shares");
    } catch (error) {
      console.log("✅ Erro esperado:", error.message);
      assert.include(error.message, "InvalidShareAmount", "Erro deve ser InvalidShareAmount");
    }
  });

  it("6️⃣ Testa validações: Compra mais shares do que disponível", async () => {
    console.log("\n🚀 Teste 6: Tentando comprar mais shares do que disponível (deve falhar)");

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    try {
      await program.methods
        .buyShares(new anchor.BN(1000)) // Apenas 90 disponíveis
        .accounts({
          offering: offeringPda,
          business: businessPda,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          buyerTokenAccount: buyerTokenAccount,
          owner: businessOwner.publicKey,
          buyer: buyer.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([buyer])
        .rpc();
      
      assert.fail("Deveria ter falhado ao tentar comprar mais shares do que disponível");
    } catch (error) {
      console.log("✅ Erro esperado:", error.message);
      assert.include(error.message, "InsufficientShares", "Erro deve ser InsufficientShares");
    }
  });

  it("7️⃣ Compra todas as shares restantes e verifica desativação automática", async () => {
    console.log("\n🚀 Teste 7: Comprando todas as shares restantes");

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    const offeringBefore = await program.account.offering.fetch(offeringPda);
    const remainingShares = offeringBefore.remainingShares;

    console.log("📊 Shares restantes antes:", remainingShares.toString());

    const tx = await program.methods
      .buyShares(remainingShares)
      .accounts({
        offering: offeringPda,
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        buyerTokenAccount: buyerTokenAccount,
        owner: businessOwner.publicKey,
        buyer: buyer.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
      })
      .signers([buyer])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a oferta foi esgotada e desativada
    const offeringAfter = await program.account.offering.fetch(offeringPda);
    
    assert.equal(
      offeringAfter.remainingShares.toString(),
      "0",
      "Não deve haver shares restantes"
    );
    assert.isFalse(offeringAfter.isActive, "Oferta deve estar desativada automaticamente");

    console.log("✅ Oferta esgotada e desativada com sucesso!");
    console.log("   Shares restantes:", offeringAfter.remainingShares.toString());
    console.log("   Status:", offeringAfter.isActive ? "Ativa" : "Inativa");
  });

  it("8️⃣ Testa validações: Compra de oferta inativa", async () => {
    console.log("\n🚀 Teste 8: Tentando comprar de oferta inativa (deve falhar)");

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), businessPda.toBuffer()],
      program.programId
    );

    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    try {
      await program.methods
        .buyShares(new anchor.BN(1))
        .accounts({
          offering: offeringPda,
          business: businessPda,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          buyerTokenAccount: buyerTokenAccount,
          owner: businessOwner.publicKey,
          buyer: buyer.publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .signers([buyer])
        .rpc();
      
      assert.fail("Deveria ter falhado ao tentar comprar de oferta inativa");
    } catch (error) {
      console.log("✅ Erro esperado:", error.message);
      assert.include(error.message, "OfferingNotActive", "Erro deve ser OfferingNotActive");
    }
  });

  it("9️⃣ Resumo final do protocolo", async () => {
    console.log("\n📊 ========================================");
    console.log("📊 RESUMO FINAL DO PROTOCOLO LOCALSHARE");
    console.log("📊 ========================================");

    const config = await program.account.config.fetch(configPda);
    const business = await program.account.business.fetch(businessPda);
    const offering = await program.account.offering.fetch(offeringPda);

    console.log("\n🔧 Config Global:");
    console.log("   Admin:", config.admin.toString());
    console.log("   Payment Mint:", config.paymentMint.toString());

    console.log("\n🏪 Negócio:");
    console.log("   Nome:", business.name);
    console.log("   Owner:", business.owner.toString());
    console.log("   Share Mint:", business.shareMint.toString());

    console.log("\n💼 Oferta:");
    console.log("   Preço por share:", offering.pricePerShare.toNumber() / LAMPORTS_PER_SOL, "SOL");
    console.log("   Shares vendidas:", (100 - offering.remainingShares.toNumber()));
    console.log("   Shares restantes:", offering.remainingShares.toString());
    console.log("   Status:", offering.isActive ? "Ativa ✅" : "Inativa ❌");

    console.log("\n✅ Todos os testes de integração passaram com sucesso!");
  });
});

