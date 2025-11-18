"use client";

import { useState, useEffect } from "react";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { useLocalshareProgram } from "../hooks/useLocalshareProgram";
import * as anchor from "@coral-xyz/anchor";
import { Loader2, Wallet, TrendingUp } from "lucide-react";
import Link from "next/link";

interface PortfolioItem {
  businessPda: PublicKey;
  businessName: string;
  shareMint: PublicKey;
  balance: number;
  pricePerShare: number;
  totalValue: number;
}

export default function Portfolio() {
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();
  const { program } = useLocalshareProgram();
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!connected || !publicKey || !program) {
        setPortfolio([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all business accounts
        const allBusinesses = await (program.account as any).business.all();
        
        // For each business, check if user has tokens
        const portfolioItems: PortfolioItem[] = [];

        for (const business of allBusinesses) {
          try {
            const shareMint = business.account.shareMint;
            
            // Skip if share mint is default (not initialized)
            if (shareMint.equals(PublicKey.default)) {
              continue;
            }

            // Get user's ATA for this business's share mint
            const userAta = await anchor.utils.token.associatedAddress({
              mint: shareMint,
              owner: publicKey,
            });

            // Check balance
            try {
              const balance = await connection.getTokenAccountBalance(userAta);
              const tokenAmount = balance.value.uiAmount || 0;

              if (tokenAmount > 0) {
                const pricePerShare = business.account.pricePerShareLamports.toNumber() / 1e9; // Convert to SOL
                portfolioItems.push({
                  businessPda: business.publicKey,
                  businessName: business.account.name,
                  shareMint: shareMint,
                  balance: tokenAmount,
                  pricePerShare: pricePerShare,
                  totalValue: tokenAmount * pricePerShare,
                });
              }
            } catch (error) {
              // ATA doesn't exist or has zero balance, skip
              continue;
            }
          } catch (error) {
            console.error(`Error processing business ${business.publicKey.toString()}:`, error);
            continue;
          }
        }

        setPortfolio(portfolioItems);
      } catch (error) {
        console.error("Error fetching portfolio:", error);
        setPortfolio([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, [connected, publicKey, program, connection]);

  if (!connected) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-50">My Portfolio</h3>
        </div>
        <p className="text-slate-400 text-sm">Connect your wallet to view your portfolio</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-50">My Portfolio</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="ml-3 text-slate-400">Loading portfolio...</span>
        </div>
      </div>
    );
  }

  if (portfolio.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <Wallet className="w-6 h-6 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-50">My Portfolio</h3>
        </div>
        <p className="text-slate-400 text-sm">You don't own any business shares yet.</p>
        <Link 
          href="/marketplace"
          className="mt-4 inline-block text-emerald-400 hover:text-emerald-300 text-sm font-medium"
        >
          Browse marketplace →
        </Link>
      </div>
    );
  }

  const totalValue = portfolio.reduce((sum, item) => sum + item.totalValue, 0);

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Wallet className="w-6 h-6 text-emerald-400" />
        <h3 className="text-xl font-bold text-slate-50">My Portfolio</h3>
      </div>

      <div className="mb-6 p-4 bg-gradient-to-br from-emerald-500/10 to-sky-500/10 border border-emerald-500/30 rounded-xl">
        <p className="text-sm text-slate-400 mb-1">Total Portfolio Value</p>
        <p className="text-3xl font-bold text-emerald-400">
          {totalValue.toFixed(4)} SOL
        </p>
      </div>

      <div className="space-y-4">
        {portfolio.map((item) => (
          <Link
            key={item.businessPda.toString()}
            href={`/business/${item.businessPda.toString()}`}
            className="block p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-emerald-500/50 transition-all"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className="font-semibold text-slate-50 mb-1">{item.businessName}</h4>
                <p className="text-sm text-slate-400 font-mono">
                  {item.businessPda.toString().slice(0, 8)}...
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-emerald-400">
                  {item.balance.toLocaleString()} shares
                </p>
                <p className="text-sm text-slate-400">
                  {item.totalValue.toFixed(4)} SOL
                </p>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Price per share</span>
                <span className="text-slate-300">{item.pricePerShare.toFixed(4)} SOL</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link 
        href="/marketplace"
        className="mt-6 block text-center text-emerald-400 hover:text-emerald-300 text-sm font-medium"
      >
        Browse more businesses →
      </Link>
    </div>
  );
}

