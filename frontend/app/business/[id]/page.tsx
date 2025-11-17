"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { mockBusinesses } from "../../data/mockBusinesses";
import { useLocalshareProgram } from "../../hooks/useLocalshareProgram";
import { getBusinessPda, getOfferingPda } from "../../lib/localshare";
import * as anchor from "@coral-xyz/anchor";
import {
  MapPin,
  TrendingUp,
  Users,
  Star,
  Calendar,
  DollarSign,
  ChevronLeft,
  Shield,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  Loader2,
} from "lucide-react";

interface PageProps {
  params: { id: string };
}

export default function BusinessDetailPage({ params }: PageProps) {
  const { id } = params;
  const { connected, publicKey } = useWallet();
  const { program } = useLocalshareProgram();
  const [selectedTab, setSelectedTab] = useState<"overview" | "financials" | "analysis">("overview");
  const [investmentAmount, setInvestmentAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");

  const business = mockBusinesses.find((b) => b.id === id);

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

  const calculateShares = () => {
    const amount = parseFloat(investmentAmount) || 0;
    return Math.floor(amount / business.sharesInfo.pricePerShare);
  };


  const handleBuyShares = async () => {
    if (!program || !publicKey || !business) {
      setStatus("Please connect your wallet first");
      setStatusType("error");
      return;
    }

    const shares = calculateShares();
    if (shares <= 0) {
      setStatus("Invalid investment amount");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Preparing transaction...");
      setStatusType("");

      // For now, we'll use a mock business owner for demonstration
      // In production, this would come from the actual business account on chain
      const mockOwnerPubkey = new PublicKey("BvWN5kqzufmJDLfQbpvGWbfL4ZSBKY3bH3EoJ4sXDq5i");

      // Get PDAs
      const [businessPdaKey] = getBusinessPda(mockOwnerPubkey);
      const [mintPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint"), businessPdaKey.toBuffer()],
        program.programId
      );
      const [mintAuthorityPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("mint_authority"), businessPdaKey.toBuffer()],
        program.programId
      );
      const [offeringPdaKey] = getOfferingPda(businessPdaKey, mintPda);

      // Get the associated token account for the buyer
      const buyerTokenAccount = await anchor.utils.token.associatedAddress({
        mint: mintPda,
        owner: publicKey,
      });

      setStatus("Sending transaction to blockchain...");

      // Call buy_shares instruction with all required accounts
      const tx = await program.methods
        .buyShares(new anchor.BN(shares))
        .accounts({
          offering: offeringPdaKey,
          business: businessPdaKey,
          mint: mintPda,
          mintAuthority: mintAuthorityPda,
          buyerTokenAccount: buyerTokenAccount,
          owner: mockOwnerPubkey, // Business owner (receives payment)
          buyer: publicKey, // Current wallet (pays)
          tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
          associatedTokenProgram: anchor.utils.token.ASSOCIATED_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
          rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        })
        .rpc();

      setStatus(`✅ Purchase successful! You received ${shares} shares. TX: ${tx.slice(0, 8)}...`);
      setStatusType("success");
      setInvestmentAmount("");

      // Open explorer
      setTimeout(() => {
        window.open(`https://explorer.solana.com/tx/${tx}?cluster=devnet`, "_blank");
      }, 1000);
    } catch (error: any) {
      console.error("Error buying shares:", error);
      setStatus(`❌ Error: ${error.message || "Transaction failed"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

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

      {/* Hero Section */}
      <div className="relative h-96 overflow-hidden">
        <img
          src={business.images[0]}
          alt={business.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm mb-4">
                  {business.category}
                </div>
                <h1 className="text-5xl font-bold text-slate-50 mb-4">{business.name}</h1>
                <div className="flex items-center gap-6 text-slate-300">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{business.location.city}, {business.location.state}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span>{business.metrics.rating}/5.0</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    <span>{business.metrics.yearsInBusiness} years in business</span>
                  </div>
                </div>
              </div>

              {business.aiAnalysis && (
                <div className="flex flex-col items-end">
                  <div className="px-6 py-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-sky-500/20 backdrop-blur-sm border border-emerald-500/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm text-slate-300">AI Score</span>
                    </div>
                    <div className="text-4xl font-bold text-slate-50">{business.aiAnalysis.score}<span className="text-2xl text-slate-400">/100</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-4 border-b border-slate-800">
              {[
                { key: "overview", label: "Overview" },
                { key: "financials", label: "Financials" },
                { key: "analysis", label: "AI Analysis" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSelectedTab(tab.key as any)}
                  className={`px-6 py-3 font-medium transition-colors border-b-2 ${
                    selectedTab === tab.key
                      ? "border-emerald-500 text-emerald-400"
                      : "border-transparent text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {selectedTab === "overview" && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-50 mb-4">About the Business</h3>
                  <p className="text-slate-300 whitespace-pre-line leading-relaxed">
                    {business.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <Users className="w-8 h-8 text-emerald-400 mb-3" />
                    <p className="text-3xl font-bold text-slate-50">{business.metrics.employees}</p>
                    <p className="text-sm text-slate-400">Employees</p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <TrendingUp className="w-8 h-8 text-sky-400 mb-3" />
                    <p className="text-3xl font-bold text-slate-50">{business.metrics.monthlyCustomers.toLocaleString()}</p>
                    <p className="text-sm text-slate-400">Customers/month</p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-50 mb-4">Owner</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={business.owner.avatar}
                      alt={business.owner.name}
                      className="w-16 h-16 rounded-full"
                    />
                    <div>
                      <p className="font-semibold text-slate-50">{business.owner.name}</p>
                      <p className="text-sm text-slate-400">{business.owner.role}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "financials" && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-sm text-slate-400 mb-2">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      ${business.financials.monthlyRevenue.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-sm text-slate-400 mb-2">Net Profit</p>
                    <p className="text-3xl font-bold text-sky-400">
                      ${business.financials.netProfit.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-sm text-slate-400 mb-2">Monthly Costs</p>
                    <p className="text-3xl font-bold text-slate-400">
                      ${business.financials.monthlyCosts.toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                    <p className="text-sm text-slate-400 mb-2">Yearly Growth</p>
                    <p className="text-3xl font-bold text-violet-400">
                      +{business.financials.yearlyGrowth}%
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-50 mb-4">Valuation</h3>
                  <p className="text-4xl font-bold text-slate-50 mb-2">
                    ${business.financials.valuation.toLocaleString('en-US')}
                  </p>
                  <p className="text-sm text-slate-400">
                    Based on profit multiples and market valuation
                  </p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-slate-50 mb-4">Documents</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Business Plan", has: business.documents.hasBusinessPlan },
                      { label: "Financial Report", has: business.documents.hasFinancialReport },
                      { label: "Legal Documentation", has: business.documents.hasLegalDocs },
                    ].map((doc) => (
                      <div key={doc.label} className="flex items-center justify-between">
                        <span className="text-slate-300">{doc.label}</span>
                        {doc.has ? (
                          <CheckCircle className="w-5 h-5 text-emerald-400" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-amber-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {selectedTab === "analysis" && business.aiAnalysis && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="w-6 h-6 text-emerald-400" />
                    <h3 className="text-xl font-bold text-slate-50">Artificial Intelligence Analysis</h3>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{business.aiAnalysis.recommendation}</p>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-emerald-400" />
                    Strengths
                  </h3>
                  <ul className="space-y-3">
                    {business.aiAnalysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400" />
                    Identified Risks
                  </h3>
                  <ul className="space-y-3">
                    {business.aiAnalysis.risks.map((risk, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-300">{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Investment */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-xl font-bold text-slate-50 mb-6">Invest Now</h3>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-400 mb-2">Price per share</p>
                    <p className="text-2xl font-bold text-slate-50">
                      ${business.sharesInfo.pricePerShare.toLocaleString('en-US')}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-slate-400 mb-2">Available shares</p>
                    <p className="text-lg font-semibold text-slate-50">
                      {business.sharesInfo.availableShares}/{business.sharesInfo.totalShares}
                    </p>
                    <div className="w-full bg-slate-800 rounded-full h-2 mt-2">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 rounded-full"
                        style={{
                          width: `${(business.sharesInfo.availableShares / business.sharesInfo.totalShares) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-4">
                    <label className="block text-sm text-slate-400 mb-2">
                      Investment amount ($)
                    </label>
                    <input
                      type="number"
                      placeholder={`Minimum $${business.sharesInfo.minInvestment}`}
                      value={investmentAmount}
                      onChange={(e) => setInvestmentAmount(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                    />
                    {investmentAmount && (
                      <p className="text-sm text-slate-400 mt-2">
                        You will receive {calculateShares()} share{calculateShares() !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

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

                  {connected ? (
                    <button
                      onClick={handleBuyShares}
                      disabled={loading || !investmentAmount || parseFloat(investmentAmount) < business.sharesInfo.minInvestment}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>Invest Now</>
                      )}
                    </button>
                  ) : (
                    <div className="w-full py-4 bg-slate-800 rounded-xl text-center">
                      <p className="text-slate-400 text-sm">Connect your wallet to invest</p>
                    </div>
                  )}

                  <p className="text-xs text-slate-500 text-center">
                    Minimum investment: ${business.sharesInfo.minInvestment.toLocaleString('en-US')}
                  </p>

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
