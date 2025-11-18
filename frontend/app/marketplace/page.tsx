"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import Portfolio from "../components/Portfolio";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { useLocalshareProgram } from "../hooks/useLocalshareProgram";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { getSharesVaultPda } from "../lib/localshare";

interface ListedBusiness {
  publicKey: PublicKey;
  account: {
    owner: PublicKey;
    name: string;
    shareMint: PublicKey;
    totalShares: any; // BN
    pricePerShareLamports: any; // BN
    treasury: PublicKey;
    isListed: boolean;
    bump: number;
  };
  availableShares?: number;
}

export default function MarketplacePage() {
  const [businesses, setBusinesses] = useState<ListedBusiness[]>([]);
  const [loading, setLoading] = useState(true);
  const { program } = useLocalshareProgram();
  const { connection } = useConnection();

  // Fetch businesses from blockchain
  useEffect(() => {
    const fetchBusinesses = async () => {
      if (!program) {
        setBusinesses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch all business accounts from the program
        const allBusinesses = await (program.account as any).business.all();
        
        // Filter only listed businesses
        const listedBusinesses = allBusinesses.filter(
          (b: any) => b.account.isListed === true
        ) as ListedBusiness[];

        // Fetch available shares for each business (from shares vault)
        const businessesWithShares = await Promise.all(
          listedBusinesses.map(async (business) => {
            try {
              const [sharesVaultPda] = getSharesVaultPda(business.publicKey);
              const vaultAccount = await connection.getTokenAccountBalance(sharesVaultPda);
              return {
                ...business,
                availableShares: vaultAccount.value.uiAmount || 0,
              };
            } catch (error) {
              console.error(`Error fetching vault for ${business.publicKey.toString()}:`, error);
              return {
                ...business,
                availableShares: 0,
              };
            }
          })
        );

        setBusinesses(businessesWithShares);
      } catch (error) {
        console.error("Error fetching businesses:", error);
        setBusinesses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinesses();
  }, [program, connection]);

  // Note: Category filtering removed since we're fetching from blockchain
  // You can add category metadata to Business account if needed
  const filteredBusinesses = businesses;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold text-slate-50 mb-4">
            Explore Businesses
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl">
            Discover investment opportunities in verified local businesses. 
            Each business undergoes rigorous analysis by our AI.
          </p>
        </div>
      </div>


      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Portfolio Sidebar */}
          <div className="lg:col-span-1">
            <Portfolio />
          </div>

          {/* Business Grid */}
          <div className="lg:col-span-3">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            <span className="ml-3 text-slate-400">Loading businesses...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBusinesses.map((business) => {
              const pricePerShareSol = business.account.pricePerShareLamports.toNumber() / LAMPORTS_PER_SOL;
              const totalShares = business.account.totalShares.toNumber();
              const availableShares = business.availableShares || 0;
              
              return (
                <Link
                  key={business.publicKey.toString()}
                  href={`/business/${business.publicKey.toString()}`}
                  className="group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all"
                >
                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-50 mb-2 group-hover:text-emerald-400 transition-colors">
                        {business.account.name}
                      </h3>
                    </div>

                    {/* Price per share */}
                    <div className="pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Price per share</span>
                        <span className="text-lg font-semibold text-emerald-400">
                          {pricePerShareSol.toFixed(4)} SOL
                        </span>
                      </div>
                    </div>

                    {/* Shares Info */}
                    <div className="pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-slate-400">Available shares</span>
                        <span className="text-sm font-semibold text-slate-50">
                          {availableShares.toLocaleString()}/{totalShares.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-sky-500"
                          style={{
                            width: `${totalShares > 0 ? (availableShares / totalShares) * 100 : 0}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Treasury */}
                    <div className="pt-2">
                      <p className="text-xs text-slate-500">Treasury</p>
                      <p className="text-xs text-slate-400 font-mono truncate">
                        {business.account.treasury.toString().slice(0, 8)}...
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredBusinesses.length === 0 && (
          <div className="text-center py-24">
            <p className="text-slate-400 text-lg">
              No listed businesses found. Check back later!
            </p>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
