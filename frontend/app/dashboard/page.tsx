"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, SystemProgram, Keypair } from "@solana/web3.js";
import { Store, Upload, DollarSign, TrendingUp, FileText, CheckCircle, AlertCircle } from "lucide-react";
import { useLocalshareProgram } from "../hooks/useLocalshareProgram";
import { getBusinessPda, getOfferingPda, getConfigPda } from "../lib/localshare";
import * as anchor from "@coral-xyz/anchor";

export default function DashboardPage() {
  const { connected, publicKey } = useWallet();
  const { program, provider } = useLocalshareProgram();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "">("");
  const [businessPda, setBusinessPda] = useState<PublicKey | null>(null);
  const [offeringPda, setOfferingPda] = useState<PublicKey | null>(null);

  // Form states
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [yearsInBusiness, setYearsInBusiness] = useState("");
  const [employees, setEmployees] = useState("");
  const [monthlyRevenue, setMonthlyRevenue] = useState("");
  const [monthlyCosts, setMonthlyCosts] = useState("");
  const [totalShares, setTotalShares] = useState("");
  const [sharePrice, setSharePrice] = useState("");

  // Handle Register Business
  const handleRegisterBusiness = async () => {
    if (!program || !publicKey) {
      setStatus("Connect your wallet first");
      setStatusType("error");
      return;
    }

    if (!businessName || businessName.length > 50) {
      setStatus("Business name must be between 1-50 characters");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Creating share mint...");

      // Generate a new keypair for the share mint
      const shareMint = Keypair.generate();

      // Get Business PDA
      const [businessPdaKey] = getBusinessPda(publicKey);
      setBusinessPda(businessPdaKey);

      setStatus("Registering business on blockchain...");

      // Call register_business instruction
      const tx = await program.methods
        .registerBusiness(businessName, shareMint.publicKey)
        .accounts({
          business: businessPdaKey,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`✅ Business registered! TX: ${tx.slice(0, 8)}...`);
      setStatusType("success");
      
      // Store shareMint for next step
      (window as any).localshareShareMint = shareMint.publicKey.toBase58();

      setTimeout(() => {
        setStep(3); // Go to offering step
      }, 2000);
    } catch (error: any) {
      console.error("Error registering business:", error);
      setStatus(`❌ Error: ${error.message || "Failed to register business"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  // Handle Create Offering
  const handleCreateOffering = async () => {
    if (!program || !publicKey || !businessPda) {
      setStatus("Missing requirements. Please register business first.");
      setStatusType("error");
      return;
    }

    const shares = parseInt(totalShares);
    const price = parseInt(sharePrice);

    if (!shares || shares <= 0 || !price || price <= 0) {
      setStatus("Invalid shares or price. Must be greater than 0");
      setStatusType("error");
      return;
    }

    try {
      setLoading(true);
      setStatus("Creating offering...");

      // Get share mint from previous step
      const shareMintStr = (window as any).localshareShareMint;
      if (!shareMintStr) {
        throw new Error("Share mint not found. Please register business first.");
      }
      const shareMint = new PublicKey(shareMintStr);

      // Get PDAs
      const [configPdaKey] = getConfigPda();
      const [offeringPdaKey] = getOfferingPda(businessPda, shareMint);
      setOfferingPda(offeringPdaKey);

      // Price in lamports (0.01 SOL = 10000000 lamports)
      const priceInLamports = new anchor.BN(price * 1000000); // price in micro-SOL

      setStatus("Submitting to blockchain...");

      // Call create_offering instruction
      const tx = await program.methods
        .createOffering(priceInLamports, new anchor.BN(shares))
        .accounts({
          offering: offeringPdaKey,
          business: businessPda,
          config: configPdaKey,
          owner: publicKey,
          systemProgram: SystemProgram.programId,
        })
        .rpc();

      setStatus(`✅ Offering created! TX: ${tx.slice(0, 8)}...`);
      setStatusType("success");

      setTimeout(() => {
        setStatus(`🎉 Success! Your business is now live on Localshare!`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating offering:", error);
      setStatus(`❌ Error: ${error.message || "Failed to create offering"}`);
      setStatusType("error");
    } finally {
      setLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center max-w-md">
          <Store className="w-20 h-20 text-emerald-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-slate-50 mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-slate-400 mb-8">
            To register your business and start raising funds, 
            you need to connect your digital wallet.
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-xl text-white font-semibold transition-all">
            Click the button in the top right corner
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-50 mb-4">
            Register Your Business
          </h1>
          <p className="text-lg text-slate-400">
            Fill in the information to start raising investments for your business.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Basic Information" },
              { num: 2, label: "Financial Data" },
              { num: 3, label: "Investment Offering" },
            ].map((s, index) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      step >= s.num
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {s.num}
                  </div>
                  <span
                    className={`ml-3 text-sm font-medium ${
                      step >= s.num ? "text-slate-50" : "text-slate-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {index < 2 && (
                  <div
                    className={`flex-1 h-1 mx-4 rounded ${
                      step > s.num ? "bg-emerald-500" : "bg-slate-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-50 mb-6">
                Basic Information
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  placeholder="E.g., São Pedro Bakery"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 focus:border-emerald-500 outline-none transition"
                >
                  <option value="">Select a category</option>
                  <option value="Food">Food</option>
                  <option value="Automotive Services">Automotive Services</option>
                  <option value="Health and Wellness">Health and Wellness</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Services">Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Business Description *
                </label>
                <textarea
                  placeholder="Tell us about your business, what you do, differentiators, history..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Years in Business *
                  </label>
                  <input
                    type="number"
                    placeholder="E.g., 5"
                    value={yearsInBusiness}
                    onChange={(e) => setYearsInBusiness(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Employees *
                  </label>
                  <input
                    type="number"
                    placeholder="E.g., 8"
                    value={employees}
                    onChange={(e) => setEmployees(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Address *
                </label>
                <input
                  type="text"
                  placeholder="E.g., 123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., São Paulo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    State *
                  </label>
                  <input
                    type="text"
                    placeholder="E.g., SP"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    maxLength={2}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-50 mb-6">
                Financial Data
              </h2>

              <div className="bg-sky-500/10 border border-sky-500/30 rounded-xl p-4 mb-6">
                <div className="flex gap-3">
                  <FileText className="w-5 h-5 text-sky-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-sky-200 font-medium mb-1">
                      Why do we need this information?
                    </p>
                    <p className="text-xs text-sky-200/80">
                      This data is used by our AI to evaluate your business&apos;s financial health 
                      and provide a confidence score to investors.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Average Monthly Revenue ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="E.g., 85000"
                    value={monthlyRevenue}
                    onChange={(e) => setMonthlyRevenue(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Average of the last 6 months
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Average Monthly Costs ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="E.g., 52000"
                    value={monthlyCosts}
                    onChange={(e) => setMonthlyCosts(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Including salaries, rent, suppliers, etc.
                </p>
              </div>

              {monthlyRevenue && monthlyCosts && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                  <p className="text-sm text-emerald-300 mb-2">Estimated Net Profit</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    ${(parseFloat(monthlyRevenue) - parseFloat(monthlyCosts)).toLocaleString('en-US')}
                    <span className="text-lg text-emerald-300/80">/month</span>
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Documents (optional)
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-emerald-500/50 transition cursor-pointer">
                  <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-300 mb-1">
                    Drag files or click to upload
                  </p>
                  <p className="text-xs text-slate-500">
                    Balance sheets, contracts, reports (PDF, up to 10MB)
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-50 mb-6">
                Configure Investment Offering
              </h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  How many shares do you want to offer? *
                </label>
                <input
                  type="number"
                  placeholder="E.g., 1000"
                  value={totalShares}
                  onChange={(e) => setTotalShares(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                />
                <p className="text-xs text-slate-500 mt-1">
                  You can keep shares for yourself. More shares means lower individual value.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price per share ($) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="number"
                    placeholder="E.g., 850"
                    value={sharePrice}
                    onChange={(e) => setSharePrice(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-12 pr-4 py-3 text-slate-50 placeholder-slate-500 focus:border-emerald-500 outline-none transition"
                  />
                </div>
              </div>

              {totalShares && sharePrice && (
                <div className="bg-violet-500/10 border border-violet-500/30 rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-violet-300 mb-1">Total Offering Value</p>
                      <p className="text-2xl font-bold text-violet-400">
                        ${(parseFloat(totalShares) * parseFloat(sharePrice)).toLocaleString('en-US')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-violet-300 mb-1">Minimum Investment</p>
                      <p className="text-2xl font-bold text-violet-400">
                        ${(parseFloat(sharePrice) * 5).toLocaleString('en-US')}
                      </p>
                      <p className="text-xs text-violet-300/70 mt-1">5 shares minimum</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <div className="flex gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-sm text-amber-200 font-medium mb-1">
                      Next steps
                    </p>
                    <p className="text-xs text-amber-200/80">
                      After registration, our team will review the information and contact you 
                      within 48 hours to validate documents and activate your offering.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Status Display */}
          {status && (
            <div className={`mt-6 p-4 rounded-xl border flex items-start gap-3 ${
              statusType === "success"
                ? "bg-emerald-500/10 border-emerald-500/30"
                : statusType === "error"
                ? "bg-red-500/10 border-red-500/30"
                : "bg-sky-500/10 border-sky-500/30"
            }`}>
              {statusType === "success" ? (
                <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : statusType === "error" ? (
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              ) : (
                <div className="w-5 h-5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin flex-shrink-0 mt-0.5" />
              )}
              <p className={`text-sm ${
                statusType === "success"
                  ? "text-emerald-300"
                  : statusType === "error"
                  ? "text-red-300"
                  : "text-sky-300"
              }`}>
                {status}
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800">
            {step > 1 && step !== 3 && (
              <button
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-50 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={loading}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            )}

            {step === 2 && (
              <button
                onClick={handleRegisterBusiness}
                disabled={loading || !businessName}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Registering...
                  </>
                ) : (
                  <>Register on Blockchain</>
                )}
              </button>
            )}

            {step === 3 && (
              <button
                onClick={handleCreateOffering}
                disabled={loading || !totalShares || !sharePrice}
                className="ml-auto px-8 py-3 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-600 hover:to-sky-600 rounded-lg text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Offering...
                  </>
                ) : (
                  <>Create Offering on Blockchain</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
