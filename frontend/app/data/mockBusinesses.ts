import { BusinessData } from "../types/business";

export const mockBusinesses: BusinessData[] = [
  {
    id: "st-peters-bakery",
    name: "St. Peter's Bakery",
    category: "Food",
    description: `St. Peter's Bakery is a traditional establishment in the Pinheiros neighborhood, São Paulo, 
    with over 15 years of history. Specializing in artisan breads and confectionery products, 
    we serve more than 500 customers daily. The business has a loyal customer base and is in the process 
    of expansion with plans to open a second location.
    
    Our products are 100% artisanal, made daily with selected ingredients. 
    We have a team of experienced bakers and a welcoming environment that is a reference in the neighborhood.
    
    We are seeking investors to expand our operation and open 2 more locations in the next 18 months.`,
    shortDescription: "Traditional artisan bakery in Pinheiros with expansion plans",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Pinheiros Street, 1234 - Pinheiros",
    },
    images: [
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800",
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800",
      "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200",
    owner: {
      name: "Peter Silva Santos",
      role: "Founder and Master Baker",
      avatar: "https://i.pravatar.cc/150?img=12",
    },
    financials: {
      monthlyRevenue: 85000,
      monthlyCosts: 52000,
      netProfit: 33000,
      yearlyGrowth: 18.5,
      valuation: 850000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 250,
      pricePerShare: 850,
      minInvestment: 4250, // 5 shares
    },
    metrics: {
      yearsInBusiness: 15,
      employees: 12,
      monthlyCustomers: 15000,
      rating: 4.8,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 87,
      strengths: [
        "Prime location in upscale area of São Paulo",
        "Loyal customer base with increasing average ticket",
        "Established brand for 15 years in the neighborhood",
        "Healthy profit margin (38%)",
        "Well-structured expansion plan",
      ],
      risks: [
        "Dependency on specialized labor",
        "Growing competition in the artisan segment",
        "Seasonality during holiday periods",
      ],
      recommendation: "Recommended investment. Established business with good growth prospects.",
    },
  },
  {
    id: "aroma-coffee-shop",
    name: "Aroma Coffee Shop",
    category: "Food",
    description: `Aroma Coffee Shop is a specialty coffee shop located in the heart of Vila Madalena. 
    We work with selected beans from small Brazilian producers and offer a unique experience to coffee lovers.
    
    Our proposition goes beyond coffee: we create a gathering and coworking space, attracting freelancers, 
    students and professionals from the region. We also offer monthly workshops on brewing methods.
    
    We are seeking investment to expand the space and add our own mini-roastery.`,
    shortDescription: "Specialty coffee shop and coworking space",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Harmonia Street, 456 - Vila Madalena",
    },
    images: [
      "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800",
      "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
      "https://images.unsplash.com/photo-1559496417-e7f25cb247f6?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=200",
    owner: {
      name: "Ana Carolina Mendes",
      role: "Barista and Entrepreneur",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    financials: {
      monthlyRevenue: 45000,
      monthlyCosts: 28000,
      netProfit: 17000,
      yearlyGrowth: 32.5,
      valuation: 420000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 300,
      pricePerShare: 420,
      minInvestment: 2100,
    },
    metrics: {
      yearsInBusiness: 3,
      employees: 6,
      monthlyCustomers: 3500,
      rating: 4.9,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 82,
      strengths: [
        "Accelerated growth (32% per year)",
        "Differentiation with specialty coffee and coworking",
        "Strategic location in bohemian neighborhood",
        "Engaged community of regular customers",
        "Diversified revenue model",
      ],
      risks: [
        "Relatively new business (3 years)",
        "High dependency on founder",
        "Investment needed for scalability",
      ],
      recommendation: "Investment with good potential. Moderate risk offset by accelerated growth.",
    },
  },
  {
    id: "modern-auto-repair",
    name: "Modern Auto Repair Shop",
    category: "Automotive Services",
    description: `Modern Auto Repair Shop has been operating for 20 years in the automotive market, specializing in 
    preventive and corrective maintenance of national and imported vehicles. We have state-of-the-art equipment 
    and a highly qualified team.
    
    We serve both individual customers and corporate fleets. We have fixed contracts with 3 logistics 
    companies in the region, ensuring a constant flow of revenue.
    
    We are seeking investment to further modernize our structure and create a mobile maintenance service 
    (shop that goes to the customer).`,
    shortDescription: "Traditional repair shop with 20 years of experience and B2B contracts",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Bandeirantes Avenue, 3200 - Ipiranga",
    },
    images: [
      "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800",
      "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=800",
      "https://images.unsplash.com/photo-1632823469910-59d2e3357006?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=200",
    owner: {
      name: "Robert Carlos Almeida",
      role: "Mechanic and Owner",
      avatar: "https://i.pravatar.cc/150?img=33",
    },
    financials: {
      monthlyRevenue: 125000,
      monthlyCosts: 78000,
      netProfit: 47000,
      yearlyGrowth: 12.3,
      valuation: 1200000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 200,
      pricePerShare: 1200,
      minInvestment: 6000,
    },
    metrics: {
      yearsInBusiness: 20,
      employees: 15,
      monthlyCustomers: 450,
      rating: 4.7,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 85,
      strengths: [
        "Long operating history (20 years)",
        "Recurring revenue with B2B contracts",
        "Low default rate and good margin",
        "Stable and qualified team",
        "Solid reputation in the market",
      ],
      risks: [
        "Moderate growth",
        "Dependency on corporate contracts",
        "Need for constant technological updates",
      ],
      recommendation: "Safe and stable investment. Ideal for conservative profile focused on dividends.",
    },
  },
  {
    id: "northeastern-flavor",
    name: "Northeastern Flavor Restaurant",
    category: "Food",
    description: `Northeastern Flavor is a restaurant specializing in typical cuisine from Northeast Brazil, 
    focusing on dishes from Bahia and Pernambuco. Located in the Liberdade region, we serve both 
    in the dining room and by delivery.
    
    Our dishes are prepared with traditional recipes, authentic ingredients brought directly from the Northeast. 
    On weekends, we offer live music with forró and MPB.
    
    We are seeking investment to expand the kitchen and increase service capacity.`,
    shortDescription: "Northeastern food restaurant with live music",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Glory Street, 789 - Liberdade",
    },
    images: [
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=200",
    owner: {
      name: "Maria Jose da Silva",
      role: "Chef and Owner",
      avatar: "https://i.pravatar.cc/150?img=9",
    },
    financials: {
      monthlyRevenue: 68000,
      monthlyCosts: 45000,
      netProfit: 23000,
      yearlyGrowth: 25.8,
      valuation: 580000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 350,
      pricePerShare: 580,
      minInvestment: 2900,
    },
    metrics: {
      yearsInBusiness: 8,
      employees: 10,
      monthlyCustomers: 2800,
      rating: 4.6,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 78,
      strengths: [
        "Differentiated cuisine with low direct competition",
        "Strong year-over-year growth (25%)",
        "Cultural events attract loyal audience",
        "Diversification with delivery",
        "Owner chef with recognized expertise",
      ],
      risks: [
        "Tight profit margin (33%)",
        "High turnover in restaurant sector",
        "Dependency on few specific suppliers",
      ],
      recommendation: "Interesting investment for those seeking to support cultural businesses with growth.",
    },
  },
  {
    id: "fit-zone-gym",
    name: "Fit Zone Gym",
    category: "Health and Wellness",
    description: `Fit Zone Gym is a mid-sized gym focusing on functional training, 
    weight training and group classes. We have 450 active members and a team of 8 personal trainers.
    
    Our differentiation is in personalized service and creation of individualized training programs. 
    We also offer nutritional monitoring included in premium memberships.
    
    We are seeking investment to add a physiotherapy area and expand to modalities like pilates and yoga.`,
    shortDescription: "Modern gym focusing on personalized training",
    location: {
      city: "São Paulo",
      state: "SP",
      address: "Paulista Avenue, 2500 - Consolação",
    },
    images: [
      "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800",
      "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800",
      "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800",
    ],
    logo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200",
    owner: {
      name: "Carlos Eduardo Fitness",
      role: "Personal Trainer and Manager",
      avatar: "https://i.pravatar.cc/150?img=15",
    },
    financials: {
      monthlyRevenue: 95000,
      monthlyCosts: 58000,
      netProfit: 37000,
      yearlyGrowth: 15.2,
      valuation: 950000,
    },
    sharesInfo: {
      totalShares: 1000,
      availableShares: 280,
      pricePerShare: 950,
      minInvestment: 4750,
    },
    metrics: {
      yearsInBusiness: 6,
      employees: 14,
      monthlyCustomers: 450,
      rating: 4.5,
    },
    documents: {
      hasBusinessPlan: true,
      hasFinancialReport: true,
      hasLegalDocs: true,
    },
    aiAnalysis: {
      score: 80,
      strengths: [
        "Premium location on Av. Paulista",
        "Recurring revenue model (memberships)",
        "Low default rate (5%)",
        "Consistent growth",
        "Qualified and engaged team",
      ],
      risks: [
        "High competition in the region",
        "Seasonality (peaks in Jan/Feb)",
        "Need for equipment renewal",
      ],
      recommendation: "Solid investment. Health and wellness sector expanding post-pandemic.",
    },
  },
];
