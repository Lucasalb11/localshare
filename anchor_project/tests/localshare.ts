import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { MyProgram } from "../target/types/my_program";
import { assert } from "chai";

describe("Localshare Lite - Bootstrap Tests", () => {
  // Configure the provider to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.myProgram as Program<MyProgram>;

  it("Localshare test bootstrap - Provider connected successfully", async () => {
    // Verify that the provider is configured correctly
    assert.ok(provider.connection, "Provider should have a valid connection");
    
    // Verify that the program was loaded
    assert.ok(program.programId, "Program ID should be defined");
    
    console.log("✅ Localshare test bootstrap");
    console.log("📍 Program ID:", program.programId.toString());
    console.log("🔗 Cluster:", provider.connection.rpcEndpoint);
    console.log("👤 Wallet:", provider.wallet.publicKey.toString());
  });

  it("Verifies that all program functions are defined", () => {
    // Verify that the 4 main functions exist in the IDL
    assert.ok(program.methods.initConfig, "initConfig should be defined");
    assert.ok(program.methods.registerBusiness, "registerBusiness should be defined");
    assert.ok(program.methods.createOffering, "createOffering should be defined");
    assert.ok(program.methods.buyShares, "buyShares should be defined");
    
    console.log("✅ All 4 Localshare functions are defined in the program");
  });
});

