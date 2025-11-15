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

### 3. Smart Contract

#### Option A: Devnet (Recommended - Currently Configured)

The project is now configured to run on Solana Devnet.

```bash
# Make sure you have SOL on Devnet
solana airdrop 2 --url devnet

# Build and deploy
cd anchor_project
anchor build
anchor deploy --provider.cluster devnet
```

**Current Devnet Program ID:** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

#### Option B: Localnet (For Development)

If you want to switch to localnet for testing:

1. Update `anchor_project/Anchor.toml`:
```toml
[provider]
cluster = "localnet"
```

2. Start local validator:
```bash
solana-test-validator
```

3. Deploy:
```bash
cd anchor_project
anchor build
anchor deploy
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
- ✅ **Fully translated to English**

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
| São Pedro Bakery | Food | 87/100 | $850k | 18.5% |
| Aroma Coffee Shop | Food | 82/100 | $420k | 32.5% |
| Modern Auto Repair | Automotive | 85/100 | $1.2M | 12.3% |
| Northeastern Flavor | Food | 78/100 | $580k | 25.8% |
| Fit Zone Gym | Health | 80/100 | $950k | 15.2% |

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
- **Network**: Solana Devnet
- **Framework**: Anchor 0.32
- **Language**: Rust
- **Program ID**: `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

## 📊 Metrics

```
✅ Build: Success
✅ Lint Errors: 0
✅ Type Errors: 0
✅ Bundle Size: 87.2 kB (First Load JS)
✅ Pages: 6
✅ Components: 10+
✅ Mock Data: 5 complete businesses
✅ Language: English
✅ Network: Devnet
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

**Currently**: Solana **Devnet** (configured in `Anchor.toml`)

### Changing the Network

#### Smart Contract (Anchor.toml)
```toml
[provider]
cluster = "devnet"  # or "localnet" or "mainnet-beta"
```

#### Frontend
The frontend automatically connects to Devnet by default. To change:

```bash
# Localnet
NEXT_PUBLIC_SOLANA_NETWORK=localnet yarn dev

# Devnet (default)
yarn dev

# Mainnet
NEXT_PUBLIC_SOLANA_NETWORK=mainnet yarn dev
```

## 📝 Documentation

- **Frontend**: `frontend/README.md`
- **Smart Contract**: `anchor_project/README.md`
- **Scripts**: `scripts/README.md` - Deployment and development scripts
- **IDL**: `anchor_project/target/idl/my_program.json`
- **Project Description**: `PROJECT_DESCRIPTION.md`

## 🔗 Important Links

- **Solana Explorer**: https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet
- **Devnet Faucet**: https://faucet.solana.com/
- **Program ID**: `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

## 🤝 How to Contribute

1. Fork the project
2. Create a branch (`git checkout -b feature/NewFeature`)
3. Commit your changes (`git commit -m 'Add NewFeature'`)
4. Push to branch (`git push origin feature/NewFeature`)
5. Open a Pull Request

## ⚠️ Important Notes

### Educational Prototype
This is an **educational prototype** for School of Solana Season 8. 

**NOT intended for production use without:**
- Professional security audit
- Proper KYC/AML compliance
- Legal regulatory compliance
- Real AI implementation
- Production-ready infrastructure

### Testnet Only
- Uses **Solana Devnet** (testnet)
- Do **NOT** invest real funds
- Get free test SOL from https://faucet.solana.com/

## ⚖️ License

This is an **educational prototype** for School of Solana. Not intended for production use without proper auditing.

## 📞 Support

For questions about the project:
- Open an issue on GitHub
- Check documentation in `/frontend/README.md`
- Review `PROJECT_DESCRIPTION.md`

---

**Status**: ✅ Frontend complete | ✅ Blockchain deployed on Devnet | ✅ Fully translated to English

**Last update**: January 2025

**School of Solana**: Season 8 - Program Assignment

Made with ❤️ to democratize local investments
