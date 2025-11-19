"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useLocalshareProgram } from "../../hooks/useLocalshareProgram";
import { 
  getSharesVaultPda, 
  getShareMintPda, 
  getShareMintAuthorityPda 
} from "../../lib/localshare";
import * as anchor from "@coral-xyz/anchor";
// Using anchor utilities for token operations
import {
  ChevronLeft,
  Loader2,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

interface PageProps {
  params: { id: string };
}

interface BusinessAccount {
  owner: PublicKey;
  name: string;
  shareMint: PublicKey;
  totalShares: anchor.BN;
  pricePerShareLamports: anchor.BN;
  treasury: PublicKey;
  isListed: boolean;
  bump: number;
}

export default function BusinessDetailPage({ params }: PageProps) {
  const { id } = params;
  const { connected, publicKey } = useWallet();
  const { program, provider } = useLocalshareProgram();
  const { connection } = useConnection();
  const [business, setBusiness] = useState<BusinessAccount | null>(null);
  const [availableShares, setAvailableShares] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [numShares, setNumShares] = useState("");
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  // Fetch business account
  useEffect(() => {
    const fetchBusiness = async () => {
      if (!program || !id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const businessPubkey = new PublicKey(id);
        
        // Fetch business account
        const businessAccount = await (program.account as any).business.fetch(businessPubkey);
        
        if (!businessAccount.isListed) {
          setStatus("This business is not currently listed");
          setStatusType("error");
        }

        setBusiness({
          owner: businessAccount.owner,
          name: businessAccount.name,
          shareMint: businessAccount.shareMint,
          totalShares: businessAccount.totalShares,
          pricePerShareLamports: businessAccount.pricePerShareLamports,
          treasury: businessAccount.treasury,
          isListed: businessAccount.isListed,
          bump: businessAccount.bump,
        });

        // Fetch available shares from vault
        try {
          const [sharesVaultPda] = getSharesVaultPda(businessPubkey);
          const vaultBalance = await connection.getTokenAccountBalance(sharesVaultPda);
          setAvailableShares(vaultBalance.value.uiAmount || 0);
        } catch (error) {
          console.error("Error fetching vault balance:", error);
          setAvailableShares(0);
        }
      } catch (error: any) {
        console.error("Error fetching business:", error);
        setStatus("Business not found");
        setStatusType("error");
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [program, id, connection]);

  const calculateTotalCost = () => {
    if (!business || !numShares) return 0;
    const shares = parseInt(numShares) || 0;
    const pricePerShare = business.pricePerShareLamports.toNumber();
    return (shares * pricePerShare) / LAMPORTS_PER_SOL;
  };

  const handleBuyShares = async () => {
    if (!program || !publicKey || !business || !provider) {
      setStatus("Please connect your wallet first");
      setStatusType("error");
      return;
    }

    if (!business.isListed) {
      setStatus("This business is not listed");
      setStatusType("error");
      return;
    }

    const shares = parseInt(numShares) || 0;
    if (shares <= 0) {
      setStatus("Please enter a valid number of shares");
      setStatusType("error");
      return;
    }

    if (shares > availableShares) {
      setStatus(`Insufficient shares available. Only ${availableShares} shares remaining.`);
      setStatusType("error");
      return;
    }

    try {
      setBuying(true);
      setStatus("Preparing transaction...");
      setStatusType("");

      const businessPubkey = new PublicKey(id);
      const [shareMintPda] = getShareMintPda(businessPubkey);
      const [shareMintAuthorityPda, shareMintAuthorityBump] = getShareMintAuthorityPda(businessPubkey);
      const [sharesVaultPda, sharesVaultBump] = getSharesVaultPda(businessPubkey);

      // Get buyer's associated token account
      const buyerSharesAta = await anchor.utils.token.associatedAddress({
        mint: shareMintPda,
        owner: publicKey,
      });

      setStatus("Sending transaction to blockchain...");

      // Call buy_shares instruction for listed businesses
      // Account names must match the IDL (snake_case)
      const tx = await (program.methods as any)
        .buyShares(new anchor.BN(shares))
        .accounts({
          buyer: publicKey,
          business: businessPubkey,
          shares_vault: sharesVaultPda,
          treasury: business.treasury,
          buyer_shares_ata: buyerSharesAta,
          share_mint: shareMintPda,
          share_mint_authority: shareMintAuthorityPda,
          token_program: anchor.utils.token.TOKEN_PROGRAM_ID,
          system_program: SystemProgram.programId,
          associated_token_program: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setStatus(`✅ Purchase successful! You now own ${shares} shares. Transaction: ${tx.slice(0, 8)}...`);
      setStatusType("success");
      setNumShares("");

      // Refresh available shares
      try {
        const vaultBalance = await connection.getTokenAccountBalance(sharesVaultPda);
        setAvailableShares(vaultBalance.value.uiAmount || 0);
      } catch (error) {
        console.error("Error refreshing vault balance:", error);
      }

      // Open explorer
      setTimeout(() => {
        const cluster = process.env.NEXT_PUBLIC_SOLANA_NETWORK === "mainnet-beta" ? "" : `?cluster=${process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet"}`;
        window.open(`https://explorer.solana.com/tx/${tx}${cluster}`, "_blank");
      }, 1000);
    } catch (error: any) {
      console.error("Error buying shares:", error);
      
      // Better error handling
      let errorMessage = "Transaction failed";
      
      if (error.message?.includes("OfferingNotActive") || 
          error.message?.includes("Offering is not active") ||
          error.message?.includes("not listed")) {
        errorMessage = "This business is not currently listed for sale.";
      } else if (error.message?.includes("InsufficientShares")) {
        errorMessage = "Insufficient shares available for this purchase.";
      } else if (error.message?.includes("InsufficientFunds") || 
                 error.message?.includes("insufficient funds")) {
        errorMessage = "Insufficient SOL balance. Please add more funds to your wallet.";
      } else if (error.message?.includes("InvalidShareAmount")) {
        errorMessage = "Invalid number of shares. Please enter a valid amount.";
      } else if (error.message?.includes("MathOverflow")) {
        errorMessage = "Calculation error. Please try a smaller amount.";
      } else {
        errorMessage = error.message || "Transaction failed. Please try again.";
      }
      
      setStatus(`❌ Error: ${errorMessage}`);
      setStatusType("error");
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading business...</p>
        </div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-50 mb-2">Business not found</h1>
          <Link href="/marketplace" className="text-emerald-400 hover:underline">
            Back to marketplace
          </Link>
        </div>
      </div>
    );
  }

  const pricePerShareSol = business.pricePerShareLamports.toNumber() / LAMPORTS_PER_SOL;
  const totalCost = calculateTotalCost();

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Back Button */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-50 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to marketplace
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <h1 className="text-4xl font-bold text-slate-50 mb-4">{business.name}</h1>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-400 mb-1">Owner</p>
                  <p className="text-slate-50 font-mono text-sm">{business.owner.toString()}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Treasury Address</p>
                  <p className="text-slate-50 font-mono text-sm">{business.treasury.toString()}</p>
                </div>

                <div>
                  <p className="text-sm text-slate-400 mb-1">Share Mint</p>
                  <p className="text-slate-50 font-mono text-sm">{business.shareMint.toString()}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Total Shares</p>
                    <p className="text-2xl font-bold text-slate-50">
                      {business.totalShares.toNumber().toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 mb-1">Available Shares</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {availableShares.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Buy Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-50 mb-6">Buy Shares</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Price per share</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {pricePerShareSol.toFixed(4)} SOL
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Available shares</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {availableShares.toLocaleString()}/{business.totalShares.toNumber().toLocaleString()}
                    </p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                        style={{
                          width: `${business.totalShares.toNumber() > 0 ? (availableShares / business.totalShares.toNumber()) * 100 : 0}%`,
                        }}
                      />
                    </div>
                  </div>

                  {!business.isListed && (
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                      <p className="text-xs text-amber-300 text-center">
                        ⚠️ This business is not currently listed
                      </p>
                    </div>
                  )}

                  {connected && business.isListed && (
                    <div className="border-t border-slate-800 pt-4">
                      <label className="block text-sm text-slate-400 mb-2">
                        Number of shares
                      </label>
                      <input
                        type="number"
                        placeholder="Enter number of shares"
                        value={numShares}
                        onChange={(e) => setNumShares(e.target.value)}
                        min="1"
                        max={availableShares}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                      />
                      {numShares && (
                        <p className="text-sm text-slate-400 mt-2">
                          Total to pay: <span className="text-emerald-400 font-semibold">{totalCost.toFixed(4)} SOL</span>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Status Display */}
                  {status && (
                    <div className={`p-3 rounded-lg border text-sm ${
                      statusType === "success"
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                        : statusType === "error"
                        ? "bg-red-500/10 border-red-500/30 text-red-300"
                        : "bg-sky-500/10 border-sky-500/30 text-sky-300"
                    }`}>
                      {status}
                    </div>
                  )}

                  {connected && business.isListed ? (
                    <button
                      onClick={handleBuyShares}
                      disabled={buying || !numShares || parseInt(numShares) <= 0 || parseInt(numShares) > availableShares}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {buying ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Buy Shares"
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-slate-800 rounded-xl text-center">
                      <p className="text-slate-400 text-sm">
                        {!connected ? "Connect your wallet to buy shares" : "This business is not listed"}
                      </p>
                    </div>
                  )}

                  <div className="border-t border-slate-800 pt-4">
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-xs text-amber-300 text-center">
                        ⚠️ <strong>EDUCATIONAL PROTOTYPE</strong><br/>
                        Use only Devnet SOL (testnet).<br/>
                        Do not invest real funds!
                      </p>
                      <a
                        href="https://faucet.solana.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-2 text-center text-xs text-emerald-400 hover:underline"
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
      </div>
    </div>
  );
}
