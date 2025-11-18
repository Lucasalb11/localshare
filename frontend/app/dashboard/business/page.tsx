"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useLocalshareProgram } from "../../hooks/useLocalshareProgram";
import { useBusinessAccount } from "../../hooks/useBusinessAccount";
import {
  getBusinessPda,
  getShareMintPda,
  getShareMintAuthorityPda,
  getSharesVaultPda,
  getConfigPda,
} from "../../lib/localshare";
import * as anchor from "@coral-xyz/anchor";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertCircle,
  Settings,
  Coins,
  Globe,
  ArrowRight,
} from "lucide-react";
import { BN } from "@coral-xyz/anchor";

// SOL to lamports conversion
const LAMPORTS_PER_SOL = 1_000_000_000;

export default function DashboardBusinessPage() {
  const router = useRouter();
  const { connected, publicKey } = useWallet();
  const { program } = useLocalshareProgram();
  const { business, loading: businessLoading, error: businessError } = useBusinessAccount(publicKey);

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  // Configure offering form state
  const [totalShares, setTotalShares] = useState("");
  const [pricePerShareSol, setPricePerShareSol] = useState("");
  const [treasuryAddress, setTreasuryAddress] = useState("");

  // Update treasury address when wallet connects
  useEffect(() => {
    if (publicKey && !treasuryAddress) {
      setTreasuryAddress(publicKey.toString());
    }
  }, [publicKey, treasuryAddress]);

  // Determine current step
  const getCurrentStep = () => {
    if (!business) return 0; // No business registered
    if (business.totalShares.isZero() || business.pricePerShareLamports.isZero()) {
      return 1; // Need to configure offering
    }
    if (business.shareMint.equals(PublicKey.default)) {
      return 2; // Need to init share mint
    }
    if (!business.isListed) {
      return 3; // Need to list business
    }
    return 4; // Complete
  };

  const currentStep = getCurrentStep();

  const handleConfigureOffering = async () => {
    if (!program || !publicKey || !business) {
      setStatus("Missing requirements");
      setStatusType("error");
      return;
    }

    const shares = parseInt(totalShares);
    const priceSol = parseFloat(pricePerShareSol);

    if (!shares || shares <= 0) {
      setStatus("Total shares must be greater than 0");
      setStatusType("error");
      return;
    }

    if (!priceSol || priceSol <= 0) {
      setStatus("Price per share must be greater than 0");
      setStatusType("error");
      return;
    }

    let treasury: PublicKey;
    try {
      treasury = new PublicKey(treasuryAddress);
    } catch {
      setStatus("Invalid treasury address");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Configuring offering...");
      setStatusType("");

      const pricePerShareLamports = new BN(Math.floor(priceSol * LAMPORTS_PER_SOL));
      const totalSharesBN = new BN(shares);

      // Call configure_offering instruction
      const [businessPda] = getBusinessPda(publicKey);
      const tx = await (program.methods as any)
        .configureOffering(totalSharesBN, pricePerShareLamports, treasury)
        .accounts({
          business: businessPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Offering configured! TX:", tx);
      setStatus(`✅ Offering configured successfully!`);
      setStatusType("success");

      // Refresh business data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error configuring offering:", error);
      setStatus(`❌ Error: ${error.message || "Failed to configure offering"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleInitShareMint = async () => {
    if (!program || !publicKey || !business) {
      setStatus("Missing requirements");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Initializing share mint...");
      setStatusType("");

      const [businessPda] = getBusinessPda(publicKey);
      const [shareMintPda] = getShareMintPda(businessPda);
      const [shareMintAuthorityPda, shareMintAuthorityBump] = getShareMintAuthorityPda(businessPda);
      const [sharesVaultPda] = getSharesVaultPda(businessPda);

      // Call init_share_mint instruction
      const tx = await (program.methods as any)
        .initShareMint()
        .accounts({
          business: businessPda,
          owner: publicKey,
          shareMint: shareMintPda,
          shareMintAuthority: shareMintAuthorityPda,
          sharesVault: sharesVaultPda,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Share mint initialized! TX:", tx);
      setStatus(`✅ Share token created successfully!`);
      setStatusType("success");

      // Refresh business data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error initializing share mint:", error);
      setStatus(`❌ Error: ${error.message || "Failed to create share token"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleListBusiness = async () => {
    if (!program || !publicKey || !business) {
      setStatus("Missing requirements");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Publishing business...");
      setStatusType("");

      const [businessPda] = getBusinessPda(publicKey);

      // Call list_business instruction
      const tx = await (program.methods as any)
        .listBusiness()
        .accounts({
          business: businessPda,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      console.log("Business listed! TX:", tx);
      setStatus(`✅ Your business is now live on the marketplace!`);
      setStatusType("success");

      // Refresh business data
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error: any) {
      console.error("Error listing business:", error);
      setStatus(`❌ Error: ${error.message || "Failed to publish business"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-50 mb-2">
            Connect Your Wallet
          </h1>
          <p className="text-slate-400 mb-6">
            Connect your wallet to view your business dashboard
          </p>
        </div>
      </div>
    );
  }

  if (businessLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Business Dashboard
          </h1>
          <p className="text-slate-400">
            {business ? `Managing: ${business.name}` : "Manage your business offering"}
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Step Indicators */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Business", icon: Building2 },
              { num: 2, label: "Offering", icon: Settings },
              { num: 3, label: "Token", icon: Coins },
              { num: 4, label: "Listing", icon: Globe },
            ].map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.num;
              const isComplete = currentStep > step.num;
              const isPending = currentStep < step.num;

              return (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition ${
                        isComplete
                          ? "bg-emerald-500 text-white"
                          : isActive
                          ? "bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isComplete ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`ml-3 text-sm font-medium ${
                        isActive || isComplete ? "text-slate-50" : "text-slate-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-1 mx-4 rounded transition ${
                        isComplete ? "bg-emerald-500" : "bg-slate-800"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          {/* Step 0: No Business */}
          {currentStep === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-50 mb-2">
                No Business Registered
              </h2>
              <p className="text-slate-400 mb-6">
                Register your business to start offering shares
              </p>
              <Link
                href="/onboarding/business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all"
              >
                Register Your Business
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Step 1: Configure Offering */}
          {currentStep === 1 && business && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Settings className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-50">Configure Offering</h2>
                  <p className="text-slate-400">Set up your share offering parameters</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Total Shares *
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 1000"
                    value={totalShares}
                    onChange={(e) => setTotalShares(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                    min="1"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Total number of shares to offer
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Price per Share (in SOL) *
                  </label>
                  <input
                    type="number"
                    step="0.000000001"
                    placeholder="e.g., 0.1"
                    value={pricePerShareSol}
                    onChange={(e) => setPricePerShareSol(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                    min="0.000000001"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Price per share in SOL (will be converted to lamports)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Treasury Address *
                  </label>
                  <input
                    type="text"
                    placeholder="Wallet address to receive payments"
                    value={treasuryAddress}
                    onChange={(e) => setTreasuryAddress(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition font-mono text-sm"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Defaults to your wallet address. Payments will be sent here.
                  </p>
                </div>

                <button
                  onClick={handleConfigureOffering}
                  disabled={loading || !totalShares || !pricePerShareSol || !treasuryAddress}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Configuring...
                    </>
                  ) : (
                    <>Configure Offering</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Create Share Token */}
          {currentStep === 2 && business && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Coins className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-50">Create Share Token</h2>
                  <p className="text-slate-400">Initialize your share token mint</p>
                </div>
              </div>

              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-sky-200">
                  Your offering is configured with <strong>{business.totalShares.toString()}</strong> shares at{" "}
                  <strong>{(Number(business.pricePerShareLamports) / LAMPORTS_PER_SOL).toFixed(9)} SOL</strong> per share.
                </p>
              </div>

              <button
                onClick={handleInitShareMint}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Share Token...
                  </>
                ) : (
                  <>Create Share Token</>
                )}
              </button>
            </div>
          )}

          {/* Step 3: Publish on Marketplace */}
          {currentStep === 3 && business && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Globe className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-50">Publish on Marketplace</h2>
                  <p className="text-slate-400">Make your business available for investment</p>
                </div>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-emerald-200">
                  Your share token is ready! Publish your business to make it available on the marketplace.
                </p>
              </div>

              <button
                onClick={handleListBusiness}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>Publish</>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Complete */}
          {currentStep === 4 && business && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-50 mb-2">
                Your Business is Live!
              </h2>
              <p className="text-slate-400 mb-6">
                Your business is now listed on the marketplace and ready for investors.
              </p>
              <Link
                href="/marketplace"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all"
              >
                View Marketplace
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          )}

          {/* Status Display */}
          {status && (
            <div className={`p-4 rounded-lg border text-sm mt-6 ${
              statusType === "success"
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : statusType === "error"
                ? "bg-red-500/10 border-red-500/30 text-red-300"
                : "bg-sky-500/10 border-sky-500/30 text-sky-300"
            }`}>
              {status}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

