export interface BusinessFinancials {
  monthlyRevenue: number;
  monthlyCosts: number;
  netProfit: number;
  yearlyGrowth: number;
  valuation: number;
}

export interface BusinessOwner {
  name: string;
  role: string;
  avatar: string;
}

export interface BusinessData {
  id: string;
  name: string;
  category: string;
  description: string;
  shortDescription: string;
  location: {
    city: string;
    state: string;
    address: string;
  };
  images: string[];
  logo: string;
  owner: BusinessOwner;
  ownerPubkey?: string;
  financials: BusinessFinancials;
  sharesInfo: {
    totalShares: number;
    availableShares: number;
    pricePerShare: number;
    minInvestment: number;
  };
  metrics: {
    yearsInBusiness: number;
    employees: number;
    monthlyCustomers: number;
    rating: number;
  };
  documents: {
    hasBusinessPlan: boolean;
    hasFinancialReport: boolean;
    hasLegalDocs: boolean;
  };
  aiAnalysis?: {
    score: number;
    strengths: string[];
    risks: string[];
    recommendation: string;
  };
  // Blockchain data (quando disponível)
  onChain?: {
    businessPda: string;
    offeringPda: string;
    shareMint: string;
    isActive: boolean;
  };
}

