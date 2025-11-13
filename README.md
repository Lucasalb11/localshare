# 🏘️ Localshare - Investment in Local Businesses

Decentralized platform for investing in local businesses using Solana blockchain.

## 🎯 About the Project

Localshare democratizes access to investments in neighborhood businesses. Bakeries, restaurants, gyms, and other establishments can raise capital from local investors through tokenized shares on the blockchain.

### 💡 Problem We Solve

- Small businesses struggle to access investment capital
- Investors want to support the local economy but lack easy access
- Lack of transparency in traditional investments
- Slow and bureaucratic processes

### ✨ Our Solution

- **For Businesses**: Register and offer shares of your business
- **For Investors**: Invest from $100 in verified businesses
- **Blockchain**: Full transparency, tokenized shares, automatic dividends
- **AI**: Intelligent analysis of each business

## 🏗️ Architecture

```
program-Lucasalb11/
├── anchor_project/          # Solana Smart Contract (Anchor)
│   ├── programs/my_program/ # Rust program
│   ├── tests/               # Program tests
│   └── target/idl/          # Generated IDL
│
└── frontend/                # Next.js Application
    ├── app/
    │   ├── page.tsx         # Landing page
    │   ├── marketplace/     # Explore businesses
    │   ├── business/[id]/   # Details + AI analysis
    │   ├── dashboard/       # Business registration
    │   ├── components/      # Navbar, etc
    │   ├── data/            # Mock businesses
    │   └── lib/             # Anchor client
    └── package.json
```

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+
- Yarn
- Rust + Solana CLI + Anchor (for program development)
- Solana Wallet (Phantom, Solflare)

### 2. Frontend

```bash
cd frontend
yarn install
yarn dev
```

Access: **http://localhost:3000**

### 3. Smart Contract (Optional)

```bash
cd anchor_project
anchor build
anchor test
anchor deploy --provider.cluster devnet
```

## 🎨 Frontend Features

### ✅ Implemented Pages

1. **Landing Page** (`/`)
   - Modern hero section
   - How it works (3 steps)
   - Key features
   - Protocol statistics
   - Web2-friendly design

2. **Marketplace** (`/marketplace`)
   - 5 mock businesses with real data
   - Category filters
   - Cards with Unsplash photos
   - AI score
   - Investment progress

3. **Business Details** (`/business/[id]`)
   - Photo gallery
   - Complete AI analysis (strengths, risks, recommendation)
   - Detailed financial data
   - Owner information
   - Investment calculator
   - Tabs: Overview, Financials, Analysis

4. **Dashboard** (`/dashboard`)
   - 3-step registration
   - Human-friendly form
   - Calculation previews
   - Document upload (UI)

### 🎯 Modern UX

- ✅ Elegant dark design
- ✅ Emerald + sky gradients
- ✅ Real images (Unsplash)
- ✅ Lucide React icons
- ✅ Intuitive navigation
- ✅ Subtle wallet integration
- ✅ No crypto jargon (Web2-friendly)
- ✅ Responsive (mobile-first)

## 🤖 AI Analysis (Simulated)

Each business has AI-generated analysis that evaluates:

- **Score** (0-100): Based on multiple factors
- **Strengths**: 5 highlighted items
- **Risks**: 3 main identified risks
- **Recommendation**: Suitable investor profile

## 💼 Mock Businesses

5 fictional businesses with realistic data:

| Business | Category | AI Score | Valuation | Yearly Growth |
|----------|----------|----------|-----------|---------------|
| Padaria São Pedro | Food | 87/100 | $850k | 18.5% |
| Cafeteria Aroma | Food | 82/100 | $420k | 32.5% |
| Oficina Mecânica | Automotive | 85/100 | $1.2M | 12.3% |
| Sabor Nordestino | Food | 78/100 | $580k | 25.8% |
| Academia Fit Zone | Health | 80/100 | $950k | 15.2% |

## 🔐 Smart Contract (Anchor)

### Instructions

1. **init_config** - Set global payment token
2. **register_business** - Register a business
3. **create_offering** - Create share offering
4. **buy_shares** - Investor purchases shares

### PDAs

- Config: `["config"]`
- Business: `["business", owner]`
- Offering: `["offering", business, share_mint]`

### Security

✅ On-chain validations
✅ Unique PDAs per entity
✅ has_one constraints
✅ Overflow checks
✅ Blockchain auditable

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Blockchain**: @coral-xyz/anchor
- **Wallet**: Solana Wallet Adapter

### Blockchain
- **Network**: Solana (Devnet)
- **Framework**: Anchor 0.32
- **Language**: Rust
- **Cluster**: Devnet

## 📊 Metrics

```
✅ Build: Success
✅ Lint Errors: 0
✅ Type Errors: 0
✅ Bundle Size: 87.2 kB (First Load JS)
✅ Pages: 6
✅ Components: 10+
✅ Mock Data: 5 complete businesses
```

## 🎯 Next Steps

### Short Term
- [ ] Integrate registration form with smart contract
- [ ] Implement real investment button
- [ ] Add SPL Token minting for shares
- [ ] Investor dashboard (my shares)

### Medium Term
- [ ] Real image upload (IPFS/Arweave)
- [ ] KYC/verification system
- [ ] On-chain transaction history
- [ ] Automatic dividends

### Long Term
- [ ] Real AI for business analysis
- [ ] Mobile app (React Native)
- [ ] Share marketplace (secondary market)
- [ ] DAO governance

## 🌐 Network

**Currently**: Solana Devnet

To switch to mainnet: edit `frontend/app/providers/SolanaProvider.tsx`

## 📝 Documentation

- **Frontend**: `frontend/README.md`
- **Smart Contract**: `anchor_project/README.md`
- **IDL**: `anchor_project/target/idl/my_program.json`
- **Project Description**: `PROJECT_DESCRIPTION.md`

## 🤝 How to Contribute

1. Fork the project
2. Create a branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## ⚖️ License

This is an **educational prototype** for School of Solana. Not intended for production use without proper auditing.

## 📞 Support

For questions about the project:
- Open an issue on GitHub
- Check documentation in `/frontend/README.md`
- Review `PROJECT_DESCRIPTION.md`

---

**Status**: ✅ Frontend complete | 🚧 Blockchain integration in progress

**Last update**: January 2025

**School of Solana**: Season 8 - Program Assignment

Made with ❤️ to democratize local investments
