"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { useLocalshareProgram } from "../hooks/useLocalshareProgram";
import { getBusinessPda, getMintPda, getMintAuthorityPda, getConfigPda } from "../lib/localshare";
import * as anchor from "@coral-xyz/anchor";
import Link from "next/link";
import {
  Building2,
  ArrowLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

export default function RegisterBusinessPage() {
  const { connected, publicKey } = useWallet();
  const { program } = useLocalshareProgram();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"register" | "success">("register");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const [formData, setFormData] = useState({
    name: "",
  });

  const handleRegisterBusiness = async () => {
    if (!program || !publicKey) {
      setStatus("Please connect your wallet first");
      setStatusType("error");
      return;
    }

    if (!formData.name.trim()) {
      setStatus("Business name is required");
      setStatusType("error");
      return;
    }

    if (formData.name.length > 50) {
      setStatus("Business name cannot exceed 50 characters");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Registering business...");
      setStatusType("");

      const [businessPda] = getBusinessPda(publicKey);
      const [mintPda] = getMintPda(businessPda);
      const [mintAuthorityPda] = getMintAuthorityPda(businessPda);
      const ownerTokenAccount = await anchor.utils.token.associatedAddress({
        mint: mintPda,
        owner: publicKey,
      });

      const [configPda] = getConfigPda();
      try {
        await program.methods
          .initConfig()
          .accounts({
            config: configPda,
            admin: publicKey,
            systemProgram: SystemProgram.programId,
          })
          .rpc();
      } catch (_) {}

      const tx = await program.methods
        .registerBusiness(formData.name)
        .accounts({
          business: businessPda,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          ownerTokenAccount: ownerTokenAccount,
          owner: publicKey,
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`✅ Business registered successfully! TX: ${tx.slice(0, 8)}...`);
      setStatusType("success");
      setStep("success");

    } catch (error: any) {
      console.error("Error registering business:", error);
      setStatus(`❌ Error: ${error.message || "Registration failed"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  // Mint creation happens during register_business. No separate step needed.

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-50 mb-2">
            Register Your Business
          </h1>
          <p className="text-slate-400 mb-6">
            Connect your wallet to register your business on Localshare
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to home
          </Link>
          <h1 className="text-3xl font-bold text-slate-50 mb-2">
            Register Your Business
          </h1>
          <p className="text-slate-400">
            Join Localshare and start offering shares in your business
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          {step === "register" && (
            <>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-50">Step 1: Register Business</h2>
                  <p className="text-slate-400">Create your business profile on the blockchain</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your business name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                    maxLength={50}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {formData.name.length}/50 characters
                  </p>
                </div>

                <button
                  onClick={handleRegisterBusiness}
                  disabled={loading || !formData.name.trim()}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>Register Business</>
                  )}
                </button>
              </div>
            </>
          )}

          

          {step === "success" && (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-50 mb-2">Setup Complete!</h2>
                <p className="text-slate-400">
                  Your business is now registered and ready to offer shares.
                </p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-emerald-300 mb-2">What&rsquo;s next?</h3>
                <ul className="text-sm text-emerald-200 space-y-1">
                  <li>• Create share offerings in your dashboard</li>
                  <li>• Set prices and share amounts</li>
                  <li>• Investors can start buying your shares</li>
                </ul>
              </div>

              <Link
                href="/dashboard"
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 text-center block"
              >
                Go to Dashboard
              </Link>
            </>
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

          <div className="border-t border-slate-800 pt-6 mt-8">
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-300 font-medium mb-1">⚠️ EDUCATIONAL PROTOTYPE</p>
                  <p className="text-xs text-amber-200">
                    Use only Devnet SOL (testnet). Do not register real businesses or use real funds!
                  </p>
                  <a
                    href="https://faucet.solana.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2 text-xs text-emerald-400 hover:underline"
                  >
                    → Get free test SOL
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
