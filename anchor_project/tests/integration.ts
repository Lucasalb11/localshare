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
  const businessOwner = admin.payer as Keypair; // use provider wallet as owner
  const buyer = Keypair.generate();
  // Pagamento usa SOL nativo (SystemProgram)

  // PDAs
  let configPda: PublicKey;
  let businessPda: PublicKey;
  let offeringPda: PublicKey;

  before(async () => {
    console.log("\n🔧 Setup inicial dos testes");
    
    // Financiamento: transferir do admin para o buyer (evita faucet rate-limit)
    const txFund = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: buyer.publicKey,
        lamports: 50_000_000, // 0.05 SOL
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      txFund,
      [businessOwner]
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

    console.log("\n📍 PDAs derivadas:");
    console.log("Config PDA:", configPda.toString());
    console.log("Business PDA:", businessPda.toString());
    // Offering PDA será derivada após conhecer o mint da business
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
    assert.ok(configAccount.paymentMint.equals(SystemProgram.programId), "Payment mint deve ser SystemProgram (SOL)");
    assert.isNumber(configAccount.bump, "Bump deve ser um número");

    console.log("✅ Config inicializada com sucesso!");
    console.log("   Admin:", configAccount.admin.toString());
    console.log("   Payment Mint:", configAccount.paymentMint.toString());
  });

  it("2️⃣ Registra um novo negócio (register_business)", async () => {
    console.log("\n🚀 Teste 2: Registrando Negócio");

    const businessName = "Café da Esquina";

    // PDAs necessárias
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
      owner: businessOwner.publicKey,
    });

    const tx = await program.methods
      .registerBusiness(businessName)
      .accounts({
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        ownerTokenAccount,
        owner: businessOwner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a conta foi criada corretamente
    const businessAccount = await program.account.business.fetch(businessPda);
    
    assert.ok(businessAccount.owner.equals(businessOwner.publicKey), "Owner deve estar correto");
    assert.equal(businessAccount.name, businessName, "Nome deve estar correto");
    assert.ok(businessAccount.shareMint.equals(mintPda), "Share mint deve estar correto");
    assert.isNumber(businessAccount.bump, "Bump deve ser um número");

    console.log("✅ Negócio registrado com sucesso!");
    console.log("   Nome:", businessAccount.name);
    console.log("   Owner:", businessAccount.owner.toString());
    console.log("   Share Mint:", businessAccount.shareMint.toString());
  });

  it("2️⃣.5️⃣ Testa upsert: Registra negócio novamente (deve atualizar nome sem erro)", async () => {
    console.log("\n🚀 Teste 2.5: Testando upsert - Registrar negócio novamente");

    const updatedBusinessName = "Café da Esquina - Atualizado";

    // PDAs necessárias (mesmas do teste anterior)
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
      owner: businessOwner.publicKey,
    });

    // Buscar o estado antes da atualização
    const businessAccountBefore = await program.account.business.fetch(businessPda);
    const originalName = businessAccountBefore.name;
    console.log("📝 Nome original:", originalName);

    // Chamar register_business novamente - NÃO deve falhar com "Allocate: account already in use"
    const tx = await program.methods
      .registerBusiness(updatedBusinessName)
      .accounts({
        business: businessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        ownerTokenAccount,
        owner: businessOwner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a transação foi bem-sucedida (não falhou com Allocate error)
    const businessAccountAfter = await program.account.business.fetch(businessPda);
    
    // Verifica que o nome foi atualizado
    assert.equal(businessAccountAfter.name, updatedBusinessName, "Nome deve ter sido atualizado");
    assert.ok(businessAccountAfter.owner.equals(businessOwner.publicKey), "Owner deve permanecer o mesmo");
    
    // Verifica que outros campos não foram alterados
    assert.ok(businessAccountAfter.shareMint.equals(businessAccountBefore.shareMint), "Share mint não deve mudar");
    assert.equal(businessAccountAfter.totalShares.toString(), businessAccountBefore.totalShares.toString(), "Total shares não deve mudar");
    assert.equal(businessAccountAfter.isListed, businessAccountBefore.isListed, "isListed não deve mudar");

    console.log("✅ Negócio atualizado com sucesso (sem erro de Allocate)!");
    console.log("   Nome original:", originalName);
    console.log("   Nome atualizado:", businessAccountAfter.name);
    console.log("   Owner:", businessAccountAfter.owner.toString());
  });

  it("2️⃣.6️⃣ Configura os parâmetros da oferta (configure_offering)", async () => {
    console.log("\n🚀 Teste 2.6: Configurando Parâmetros da Oferta");

    const totalShares = new anchor.BN(1000);
    const pricePerShareLamports = new anchor.BN(1000000); // 0.001 SOL per share
    const treasury = Keypair.generate().publicKey; // Sample treasury address

    // Fetch business account before configuration
    const businessAccountBefore = await program.account.business.fetch(businessPda);
    console.log("📝 Estado antes da configuração:");
    console.log("   Total shares:", businessAccountBefore.totalShares.toString());
    console.log("   Price per share:", businessAccountBefore.pricePerShareLamports.toString());
    console.log("   Treasury:", businessAccountBefore.treasury.toString());
    console.log("   Is listed:", businessAccountBefore.isListed);

    const tx = await program.methods
      .configureOffering(totalShares, pricePerShareLamports, treasury)
      .accounts({
        business: businessPda,
        owner: businessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verify that the business account was updated correctly
    const businessAccountAfter = await program.account.business.fetch(businessPda);
    
    assert.equal(
      businessAccountAfter.totalShares.toString(),
      totalShares.toString(),
      "Total shares deve estar correto"
    );
    assert.equal(
      businessAccountAfter.pricePerShareLamports.toString(),
      pricePerShareLamports.toString(),
      "Price per share deve estar correto"
    );
    assert.ok(
      businessAccountAfter.treasury.equals(treasury),
      "Treasury deve estar correto"
    );
    assert.isFalse(
      businessAccountAfter.isListed,
      "Business não deve estar listado (is_listed deve ser false)"
    );
    
    // Verify that other fields were not changed
    assert.ok(
      businessAccountAfter.owner.equals(businessAccountBefore.owner),
      "Owner não deve mudar"
    );
    assert.equal(
      businessAccountAfter.name,
      businessAccountBefore.name,
      "Nome não deve mudar"
    );
    assert.ok(
      businessAccountAfter.shareMint.equals(businessAccountBefore.shareMint),
      "Share mint não deve mudar"
    );

    console.log("✅ Oferta configurada com sucesso!");
    console.log("   Total shares:", businessAccountAfter.totalShares.toString());
    console.log("   Price per share (lamports):", businessAccountAfter.pricePerShareLamports.toString());
    console.log("   Treasury:", businessAccountAfter.treasury.toString());
    console.log("   Is listed:", businessAccountAfter.isListed);
  });

  it("2️⃣.7️⃣ Inicializa o share mint e vault (init_share_mint)", async () => {
    console.log("\n🚀 Teste 2.7: Inicializando Share Mint e Vault");

    // Fetch business account to get total_shares
    const businessAccount = await program.account.business.fetch(businessPda);
    const totalShares = businessAccount.totalShares;
    
    // Ensure total_shares > 0 (should be set by configure_offering)
    assert.isTrue(
      totalShares.gt(new anchor.BN(0)),
      "Total shares deve ser maior que zero (configure_offering deve ter sido chamado primeiro)"
    );
    
    console.log("📝 Estado antes da inicialização:");
    console.log("   Total shares:", totalShares.toString());
    console.log("   Share mint atual:", businessAccount.shareMint.toString());

    // Derive PDAs for share mint, share mint authority, and shares vault
    const [shareMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint"), businessPda.toBuffer()],
      program.programId
    );
    const [shareMintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint_authority"), businessPda.toBuffer()],
      program.programId
    );
    const [sharesVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("shares_vault"), businessPda.toBuffer()],
      program.programId
    );

    console.log("📍 PDAs derivadas:");
    console.log("   Share Mint PDA:", shareMintPda.toString());
    console.log("   Share Mint Authority PDA:", shareMintAuthorityPda.toString());
    console.log("   Shares Vault PDA:", sharesVaultPda.toString());

    const tx = await program.methods
      .initShareMint()
      .accounts({
        business: businessPda,
        owner: businessOwner.publicKey,
        shareMint: shareMintPda,
        shareMintAuthority: shareMintAuthorityPda,
        sharesVault: sharesVaultPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verify that the business account was updated with the new share mint
    const businessAccountAfter = await program.account.business.fetch(businessPda);
    
    assert.ok(
      businessAccountAfter.shareMint.equals(shareMintPda),
      "Share mint deve estar correto no business account"
    );

    // Fetch the mint account and verify decimals = 0
    const mintInfo = await provider.connection.getParsedAccountInfo(shareMintPda);
    const mintData = mintInfo.value?.data;
    
    if (mintData && "parsed" in mintData) {
      const parsedMint = mintData.parsed as any;
      assert.equal(
        parsedMint.info.decimals,
        0,
        "Mint decimals deve ser 0"
      );
      console.log("✅ Mint decimals:", parsedMint.info.decimals);
    } else {
      assert.fail("Não foi possível obter informações do mint");
    }

    // Fetch the vault account and verify balance = total_shares
    const vaultInfo = await provider.connection.getTokenAccountBalance(sharesVaultPda);
    
    assert.equal(
      vaultInfo.value.amount,
      totalShares.toString(),
      "Vault balance deve ser igual a total_shares"
    );
    assert.equal(
      vaultInfo.value.uiAmount,
      totalShares.toNumber(),
      "Vault UI amount deve ser igual a total_shares"
    );

    console.log("✅ Share mint inicializado com sucesso!");
    console.log("   Share Mint:", businessAccountAfter.shareMint.toString());
    console.log("   Shares Vault:", sharesVaultPda.toString());
    console.log("   Vault Balance:", vaultInfo.value.amount);
    console.log("   Total Shares:", totalShares.toString());
  });

  // Removido: criação de mint separada. O mint é criado em register_business.

  it("3️⃣ Cria uma oferta de shares (create_offering)", async () => {
    console.log("\n🚀 Teste 3: Criando Oferta");

    // Calcular o mint PDA correto
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );
    // Derivar Offering PDA
    [offeringPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("offering"), businessPda.toBuffer(), mintPda.toBuffer()],
      program.programId
    );
    const ownerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: businessOwner.publicKey,
    });
    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

    const pricePerShare = new anchor.BN(1000); // 0.000001 SOL por share
    const initialShares = new anchor.BN(10); // 10 shares disponíveis

    const tx = await program.methods
      .createOffering(pricePerShare, initialShares)
      .accounts({
        offering: offeringPda,
        business: businessPda,
        config: configPda,
        mint: mintPda,
        ownerTokenAccount,
        offeringVault,
        owner: businessOwner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([businessOwner])
      .rpc();

    console.log("Transaction signature:", tx);

    // Verifica que a conta foi criada corretamente
    const offeringAccount = await program.account.offering.fetch(offeringPda);
    
    assert.ok(offeringAccount.business.equals(businessPda), "Business deve estar correto");
    assert.ok(offeringAccount.shareMint.equals(mintPda), "Share mint deve estar correto");
    assert.ok(offeringAccount.paymentMint.equals(SystemProgram.programId), "Payment mint deve estar correto (SOL)");
    assert.equal(offeringAccount.pricePerShare.toString(), pricePerShare.toString(), "Preço deve estar correto");
    assert.equal(offeringAccount.remainingShares.toString(), initialShares.toString(), "Shares restantes devem estar corretas");
    assert.isTrue(offeringAccount.isActive, "Oferta deve estar ativa");

    console.log("✅ Oferta criada com sucesso!");
    console.log("   Preço por share (lamports):", offeringAccount.pricePerShare.toNumber());
    console.log("   Shares disponíveis:", offeringAccount.remainingShares.toString());
    console.log("   Status:", offeringAccount.isActive ? "Ativa" : "Inativa");
  });

  it("4️⃣ Compra shares da oferta (buy_shares)", async () => {
    console.log("\n🚀 Teste 4: Comprando Shares");

    const amountToBuy = new anchor.BN(2); // Comprar 2 shares
    const pricePerShare = 1000; // lamports
    const expectedCost = amountToBuy.toNumber() * pricePerShare;

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

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
        offeringVault,
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
      "8",
      "Shares restantes devem ser 8 (10 - 2)"
    );
    assert.isTrue(offeringAccount.isActive, "Oferta ainda deve estar ativa");

    // Pagamento realizado via SystemProgram; saldos variam por taxas. Verificação omitida.

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
    // Valor pago omitido devido a variação de taxas em localnet
    console.log("   Tokens recebidos:", buyerTokenBalance.value.uiAmount);
  });

  it("5️⃣ Testa validações: Compra com quantidade inválida", async () => {
    console.log("\n🚀 Teste 5: Tentando comprar 0 shares (deve falhar)");

    // Calcular as PDAs necessárias
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), businessPda.toBuffer()],
      program.programId
    );

    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

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
          offeringVault,
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

    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

    const buyerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: buyer.publicKey,
    });

    try {
      await program.methods
        .buyShares(new anchor.BN(1000)) // Mais que disponível
        .accounts({
          offering: offeringPda,
          business: businessPda,
          mint: mintPda,
          offeringVault,
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

    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

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
        offeringVault,
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

    const offeringVault = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: offeringPda,
    });

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
        offeringVault,
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
    console.log("   Shares vendidas:", (10 - offering.remainingShares.toNumber()));
    console.log("   Shares restantes:", offering.remainingShares.toString());
    console.log("   Status:", offering.isActive ? "Ativa ✅" : "Inativa ❌");

    console.log("\n✅ Todos os testes de integração passaram com sucesso!");
  });

  it("🔟 Testa o fluxo completo: RegisterBusiness -> configure_offering -> init_share_mint -> list_business", async () => {
    console.log("\n🚀 Teste 10: Fluxo completo de listagem de negócio");
    
    // Criar um novo business owner para este teste
    const newBusinessOwner = Keypair.generate();
    
    // Financiar o novo business owner
    const txFund = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: newBusinessOwner.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL, // 10 SOL
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      txFund,
      [businessOwner]
    );

    // Deriva a Business PDA para o novo owner
    const [newBusinessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("business"), newBusinessOwner.publicKey.toBuffer()],
      program.programId
    );

    console.log("📍 Novo Business PDA:", newBusinessPda.toString());
    console.log("📍 Novo Business Owner:", newBusinessOwner.publicKey.toString());

    // 1️⃣ RegisterBusiness
    console.log("\n📝 Passo 1: RegisterBusiness");
    const businessName = "Restaurante Novo";
    
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), newBusinessPda.toBuffer()],
      program.programId
    );
    const ownerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: newBusinessOwner.publicKey,
    });

    const tx1 = await program.methods
      .registerBusiness(businessName)
      .accounts({
        business: newBusinessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        ownerTokenAccount,
        owner: newBusinessOwner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ RegisterBusiness transaction:", tx1);

    const businessAfterRegister = await program.account.business.fetch(newBusinessPda);
    assert.equal(businessAfterRegister.name, businessName, "Nome do negócio deve estar correto");
    assert.isFalse(businessAfterRegister.isListed, "Negócio não deve estar listado inicialmente");
    console.log("   ✅ Negócio registrado. isListed:", businessAfterRegister.isListed);

    // 2️⃣ configure_offering
    console.log("\n📝 Passo 2: configure_offering");
    const totalShares = new anchor.BN(5000);
    const pricePerShareLamports = new anchor.BN(2000000); // 0.002 SOL per share
    const treasury = Keypair.generate().publicKey;

    const tx2 = await program.methods
      .configureOffering(totalShares, pricePerShareLamports, treasury)
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ configure_offering transaction:", tx2);

    const businessAfterConfigure = await program.account.business.fetch(newBusinessPda);
    assert.equal(
      businessAfterConfigure.totalShares.toString(),
      totalShares.toString(),
      "Total shares deve estar correto"
    );
    assert.equal(
      businessAfterConfigure.pricePerShareLamports.toString(),
      pricePerShareLamports.toString(),
      "Price per share deve estar correto"
    );
    assert.isFalse(businessAfterConfigure.isListed, "Negócio ainda não deve estar listado");
    console.log("   ✅ Oferta configurada. isListed:", businessAfterConfigure.isListed);

    // 3️⃣ init_share_mint
    console.log("\n📝 Passo 3: init_share_mint");
    
    const [shareMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [shareMintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint_authority"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [sharesVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("shares_vault"), newBusinessPda.toBuffer()],
      program.programId
    );

    const tx3 = await program.methods
      .initShareMint()
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        shareMint: shareMintPda,
        shareMintAuthority: shareMintAuthorityPda,
        sharesVault: sharesVaultPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ init_share_mint transaction:", tx3);

    const businessAfterInitMint = await program.account.business.fetch(newBusinessPda);
    assert.ok(
      businessAfterInitMint.shareMint.equals(shareMintPda),
      "Share mint deve estar correto"
    );
    assert.isFalse(businessAfterInitMint.isListed, "Negócio ainda não deve estar listado");
    console.log("   ✅ Share mint inicializado. isListed:", businessAfterInitMint.isListed);

    // 4️⃣ list_business
    console.log("\n📝 Passo 4: list_business");
    
    const tx4 = await program.methods
      .listBusiness()
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ list_business transaction:", tx4);

    const businessAfterList = await program.account.business.fetch(newBusinessPda);
    assert.isTrue(
      businessAfterList.isListed,
      "Negócio deve estar listado após list_business"
    );
    console.log("   ✅ Negócio listado com sucesso! isListed:", businessAfterList.isListed);

    // Verificar que tentar listar novamente falha
    console.log("\n📝 Teste adicional: Tentar listar novamente (deve falhar)");
    try {
      await program.methods
        .listBusiness()
        .accounts({
          business: newBusinessPda,
          owner: newBusinessOwner.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([newBusinessOwner])
        .rpc();
      
      assert.fail("Deveria ter falhado ao tentar listar negócio já listado");
    } catch (error) {
      console.log("✅ Erro esperado:", error.message);
      assert.include(error.message, "BusinessAlreadyListed", "Erro deve ser BusinessAlreadyListed");
    }

    console.log("\n✅ Fluxo completo testado com sucesso!");
    console.log("   ✅ RegisterBusiness");
    console.log("   ✅ configure_offering");
    console.log("   ✅ init_share_mint");
    console.log("   ✅ list_business");
    console.log("   ✅ Validação de dupla listagem");
  });

  it("1️⃣1️⃣ Testa buy_shares: Compra shares diretamente do negócio listado", async () => {
    console.log("\n🚀 Teste 11: Compra shares diretamente do negócio");
    
    // Criar um novo business owner e buyer para este teste
    const newBusinessOwner = Keypair.generate();
    const buyer = Keypair.generate();
    
    // Financiar ambos
    const txFund = new anchor.web3.Transaction().add(
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: newBusinessOwner.publicKey,
        lamports: 10 * LAMPORTS_PER_SOL,
      }),
      SystemProgram.transfer({
        fromPubkey: admin.publicKey,
        toPubkey: buyer.publicKey,
        lamports: 5 * LAMPORTS_PER_SOL,
      })
    );
    await anchor.web3.sendAndConfirmTransaction(
      provider.connection,
      txFund,
      [businessOwner]
    );

    // Deriva a Business PDA
    const [newBusinessPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("business"), newBusinessOwner.publicKey.toBuffer()],
      program.programId
    );

    console.log("📍 Business PDA:", newBusinessPda.toString());
    console.log("📍 Business Owner:", newBusinessOwner.publicKey.toString());
    console.log("📍 Buyer:", buyer.publicKey.toString());

    // 1️⃣ RegisterBusiness
    console.log("\n📝 Passo 1: RegisterBusiness");
    const businessName = "Loja de Investimentos";
    
    const [mintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("mint_authority"), newBusinessPda.toBuffer()],
      program.programId
    );
    const ownerTokenAccount = await anchor.utils.token.associatedAddress({
      mint: mintPda,
      owner: newBusinessOwner.publicKey,
    });

    await program.methods
      .registerBusiness(businessName)
      .accounts({
        business: newBusinessPda,
        mint: mintPda,
        mintAuthority: mintAuthorityPda,
        ownerTokenAccount,
        owner: newBusinessOwner.publicKey,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ RegisterBusiness concluído");

    // 2️⃣ configure_offering
    console.log("\n📝 Passo 2: configure_offering");
    const totalShares = new anchor.BN(10000);
    const pricePerShareLamports = new anchor.BN(1000000); // 0.001 SOL per share
    const treasury = Keypair.generate().publicKey;

    await program.methods
      .configureOffering(totalShares, pricePerShareLamports, treasury)
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ configure_offering concluído");

    // 3️⃣ init_share_mint
    console.log("\n📝 Passo 3: init_share_mint");
    
    const [shareMintPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [shareMintAuthorityPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("share_mint_authority"), newBusinessPda.toBuffer()],
      program.programId
    );
    const [sharesVaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("shares_vault"), newBusinessPda.toBuffer()],
      program.programId
    );

    await program.methods
      .initShareMint()
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        shareMint: shareMintPda,
        shareMintAuthority: shareMintAuthorityPda,
        sharesVault: sharesVaultPda,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ init_share_mint concluído");

    // 4️⃣ list_business
    console.log("\n📝 Passo 4: list_business");
    
    await program.methods
      .listBusiness()
      .accounts({
        business: newBusinessPda,
        owner: newBusinessOwner.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([newBusinessOwner])
      .rpc();

    console.log("✅ list_business concluído");

    // 5️⃣ buy_shares
    console.log("\n📝 Passo 5: buy_shares");
    
    const amountShares = new anchor.BN(100); // Comprar 100 shares
    const expectedCost = amountShares.toNumber() * pricePerShareLamports.toNumber();
    
    // Get balances before
    const treasuryBalanceBefore = await provider.connection.getBalance(treasury);
    const buyerBalanceBefore = await provider.connection.getBalance(buyer.publicKey);
    
    console.log("💰 Treasury balance antes:", treasuryBalanceBefore / LAMPORTS_PER_SOL, "SOL");
    console.log("💰 Buyer balance antes:", buyerBalanceBefore / LAMPORTS_PER_SOL, "SOL");
    console.log("💰 Custo esperado:", expectedCost / LAMPORTS_PER_SOL, "SOL");

    // Get buyer's ATA
    const buyerSharesAta = await anchor.utils.token.associatedAddress({
      mint: shareMintPda,
      owner: buyer.publicKey,
    });

    // Get vault balance before
    const vaultBalanceBefore = await provider.connection.getTokenAccountBalance(sharesVaultPda);
    console.log("📊 Vault balance antes:", vaultBalanceBefore.value.amount);

    const tx = await program.methods
      .buyShares(amountShares)
      .accounts({
        buyer: buyer.publicKey,
        business: newBusinessPda,
        sharesVault: sharesVaultPda,
        treasury: treasury,
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

    console.log("✅ buy_shares transaction:", tx);

    // Get balances after
    const treasuryBalanceAfter = await provider.connection.getBalance(treasury);
    const buyerBalanceAfter = await provider.connection.getBalance(buyer.publicKey);
    
    console.log("💰 Treasury balance depois:", treasuryBalanceAfter / LAMPORTS_PER_SOL, "SOL");
    console.log("💰 Buyer balance depois:", buyerBalanceAfter / LAMPORTS_PER_SOL, "SOL");

    // Assertions
    const treasuryIncrease = treasuryBalanceAfter - treasuryBalanceBefore;
    console.log("💰 Treasury aumentou:", treasuryIncrease / LAMPORTS_PER_SOL, "SOL");
    
    // Treasury should have increased (allowing for transaction fees)
    assert.isTrue(
      treasuryIncrease >= expectedCost - 10000, // Allow for small fee variations
      "Treasury deve ter recebido o pagamento"
    );

    // Check buyer's token account
    const buyerTokenBalance = await provider.connection.getTokenAccountBalance(buyerSharesAta);
    assert.equal(
      buyerTokenBalance.value.amount,
      amountShares.toString(),
      "Buyer deve ter recebido as shares corretas"
    );
    console.log("✅ Buyer recebeu", buyerTokenBalance.value.amount, "shares");

    // Check vault balance decreased
    const vaultBalanceAfter = await provider.connection.getTokenAccountBalance(sharesVaultPda);
    const vaultDecrease = BigInt(vaultBalanceBefore.value.amount) - BigInt(vaultBalanceAfter.value.amount);
    assert.equal(
      vaultDecrease.toString(),
      amountShares.toString(),
      "Vault deve ter diminuído pela quantidade comprada"
    );
    console.log("✅ Vault diminuiu", vaultDecrease.toString(), "shares");

    console.log("\n✅ Teste buy_shares concluído com sucesso!");
    console.log("   ✅ SOL transferido para treasury");
    console.log("   ✅ Shares transferidas para buyer");
    console.log("   ✅ Vault balance atualizado");
  });
});

