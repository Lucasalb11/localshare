import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { assert } from "chai";

describe("Localshare Lite - Bootstrap Tests", () => {
  // Configura o provider para usar o cluster local
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.myProgram as Program<MyProgram>;

  it("Localshare test bootstrap - Provider conectado com sucesso", async () => {
    // Verifica que o provider está configurado corretamente
    assert.ok(provider.connection, "Provider deve ter uma conexão válida");
    
    // Verifica que o programa foi carregado
    assert.ok(program.programId, "Program ID deve estar definido");
    
    console.log("✅ Localshare test bootstrap");
    console.log("📍 Program ID:", program.programId.toString());
    console.log("🔗 Cluster:", provider.connection.rpcEndpoint);
    console.log("👤 Wallet:", provider.wallet.publicKey.toString());
  });

  it("Verifica que todas as funções do programa estão definidas", () => {
    // Verifica que as 4 funções principais existem no IDL
    assert.ok(program.methods.initConfig, "initConfig deve estar definida");
    assert.ok(program.methods.registerBusiness, "registerBusiness deve estar definida");
    assert.ok(program.methods.createOffering, "createOffering deve estar definida");
    assert.ok(program.methods.buyShares, "buyShares deve estar definida");
    
    console.log("✅ Todas as 4 funções do Localshare estão definidas no programa");
  });
});

