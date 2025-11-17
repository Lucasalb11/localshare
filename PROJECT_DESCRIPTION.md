# Localshare - Investment in Local Businesses

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://localshare-nine.vercel.app)
[![Solana](https://img.shields.io/badge/Solana-Devnet-blueviolet)](https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet)

## Project Overview

**Localshare** is a decentralized application (dApp) that enables investments in local businesses through tokenized shares on the Solana blockchain. It connects entrepreneurs who need funding with local investors, creating a transparent and secure ecosystem for community-driven investments.

**Live Application**: [https://localshare-nine.vercel.app](https://localshare-nine.vercel.app)

**Program ID (Devnet)**: `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

### Problem Statement

Small local businesses struggle to access traditional funding, while community members want to invest in and support their neighborhood establishments but lack accessible platforms to do so.

### Solution

Localshare provides a blockchain-based platform where:
- Business owners can register and create share offerings
- Investors can discover, analyze, and invest in local businesses
- All transactions are transparent and recorded on-chain
- Share ownership is represented by tokens on Solana

---

## Technical Implementation

### Smart Contract (Anchor Program)

**Program ID (Devnet):** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

**Explorer Link**: [View on Solana Explorer](https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet)

#### Instructions

1. **init_config**
   - Initializes global configuration with payment mint
   - Creates Config PDA: `["config"]`
   - Admin-only operation
   - Sets the accepted payment token for the platform

2. **register_business**
   - Registers a new business on the platform
   - Creates Business PDA: `["business", owner]`
   - Stores business name and share mint
   - Validates business information (name length, non-empty)

3. **create_offering**
   - Creates a share offering for a registered business
   - Creates Offering PDA: `["offering", business, share_mint]`
   - Defines price and quantity of shares
   - Links to global payment configuration
   - Validates price and share amounts

4. **buy_shares**
   - Allows investors to purchase shares
   - Transfers SOL from buyer to business owner
   - Updates remaining shares counter
   - Auto-deactivates offering when sold out
   - Validates offering is active and has sufficient shares

#### Program Derived Addresses (PDAs)

The program uses PDAs for deterministic account addresses and security:

- **Config**: `["config"]` - Global configuration (singleton)
- **Business**: `["business", owner_pubkey]` - Business account (one per owner)
- **Offering**: `["offering", business_pubkey, share_mint_pubkey]` - Share offering (one per business/mint pair)

#### Security Features

- ✅ Input validation (price > 0, shares > 0, name length)
- ✅ Ownership checks (has_one constraints)
- ✅ Math overflow protection (checked arithmetic)
- ✅ Active offering validation
- ✅ Sufficient shares check
- ✅ PDA-based accounts (no spoofing possible)
- ✅ Custom error messages for debugging
- ✅ State consistency (auto-deactivation)

---

### Frontend

**Live Demo:** [https://localshare-nine.vercel.app](https://localshare-nine.vercel.app)

#### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Solana Web3.js + Anchor
- **Wallet:** Solana Wallet Adapter (Phantom, Solflare)
- **Deployment:** Vercel

#### Features

1. **Landing Page** (`/`)
   - Hero section with value proposition
   - How it works (3-step explanation)
   - Key features showcase
   - Protocol statistics display
   - Call-to-action buttons
   - Responsive design for all devices

2. **Marketplace** (`/marketplace`)
   - Browse available businesses
   - Filter by category (Food, Automotive, Health & Wellness)
   - View AI-generated scores (simulated)
   - See financial metrics (revenue, growth, valuation)
   - Investment progress visualization
   - Real Unsplash images for businesses

3. **Business Details** (`/business/[id]`)
   - Complete business information and description
   - Photo gallery carousel
   - Financial data (revenue, costs, valuation, growth)
   - AI analysis (strengths, risks, recommendations)
   - Investment calculator (shares based on amount)
   - "Invest Now" button (connects to smart contract)
   - Tabbed interface: Overview, Financials, Analysis
   - Owner profile and business metrics

4. **Dashboard** (`/dashboard`)
   - Register new business (3-step wizard form)
   - Upload business information
   - Enter financial data
   - Configure share offering details
   - Real-time form validation
   - Preview and submit

#### Mock Data

The frontend includes 5 realistic mock businesses:

| Business | Category | AI Score | Valuation | Growth |
|----------|----------|----------|-----------|--------|
| St. Peter's Bakery | Food | 87/100 | $850k | 18.5% |
| Aroma Coffee Shop | Food | 82/100 | $420k | 32.5% |
| Modern Auto Repair | Automotive | 85/100 | $1.2M | 12.3% |
| Northeastern Flavor | Food | 78/100 | $580k | 25.8% |
| Fit Zone Gym | Health | 80/100 | $950k | 15.2% |

Each business includes:
- Real images (Unsplash)
- Financial metrics (revenue, costs, profit)
- Location data
- AI-generated analysis (strengths, risks, recommendations)
- Owner profile
- Investment information (shares, price, minimum)

---

## Testing

### Test Coverage

All program instructions have comprehensive tests covering both happy and unhappy paths.

**Happy Path Tests:**
- ✅ Successful config initialization
- ✅ Business registration
- ✅ Offering creation
- ✅ Share purchase
- ✅ Full end-to-end flow

**Unhappy Path Tests:**
- ❌ Empty business name
- ❌ Name too long (>50 chars)
- ❌ Zero price validation
- ❌ Zero shares validation
- ❌ Insufficient shares error
- ❌ Inactive offering error
- ❌ Unauthorized operations
- ❌ Math overflow scenarios

**Test Files:**
- `anchor_project/tests/localshare.ts` - Bootstrap and basic tests
- `anchor_project/tests/integration.ts` - Full integration scenarios

**Run Tests:**
```bash
cd anchor_project
anchor test
```

---

## Deployment

### Smart Contract

**Network:** Solana Devnet  
**Program ID:** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

**Deploy Commands:**
```bash
cd anchor_project
anchor build
anchor deploy --provider.cluster devnet
```

**Verify Deployment:**
```bash
# Check program on explorer
open "https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet"

# Get program info
solana program show 8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y --url devnet
```

### Frontend

**Platform:** Vercel  
**URL:** [https://localshare-nine.vercel.app](https://localshare-nine.vercel.app)

**Deploy Commands:**
```bash
cd frontend
yarn build
vercel deploy --prod
```

**Environment Variables:**
- Program ID is hardcoded in `lib/constants.ts`
- RPC endpoint uses Devnet by default
- No secrets required for Devnet deployment

---

## How to Use

### For Business Owners

1. **Connect Wallet** (Phantom/Solflare on Devnet)
   - Click "Select Wallet" in the top-right corner
   - Choose your wallet provider
   - Approve connection

2. **Register Business**
   - Navigate to Dashboard
   - Fill business information (name, description, location)
   - Provide financial data (revenue, costs, etc.)
   - Upload documents (simulated)

3. **Create Offering**
   - Set share price in SOL
   - Define quantity of shares
   - Submit for blockchain recording

4. **Receive Investments**
   - SOL transfers directly to your wallet
   - Track investments on blockchain
   - Monitor remaining shares

### For Investors

1. **Explore Businesses**
   - Browse marketplace at [/marketplace](https://localshare-nine.vercel.app/marketplace)
   - Use category filters
   - View business cards with key metrics

2. **Analyze Opportunities**
   - Click on business card for details
   - Check AI scores (0-100)
   - Review financials tab
   - Read owner profile
   - Analyze strengths and risks

3. **Invest**
   - Connect Devnet wallet (must have test SOL)
   - Enter investment amount in calculator
   - Click "Invest Now" button
   - Confirm transaction in wallet
   - View transaction on Explorer

4. **Track Portfolio**
   - View owned shares (coming soon)
   - Monitor business performance
   - Receive dividends (future feature)

### Get Test SOL

To use the application on Devnet:

1. Visit [https://faucet.solana.com/](https://faucet.solana.com/)
2. Enter your wallet address
3. Request 2 SOL (test tokens)
4. Use for testing investments

---

## Future Enhancements

### Short Term (Q1 2025)

1. **Real Investment Integration**
   - Complete buy_shares flow in frontend
   - Add transaction status notifications
   - Implement share minting with SPL Token

2. **Investor Dashboard**
   - View owned shares across businesses
   - Track investment performance
   - Show transaction history

3. **Enhanced Business Profiles**
   - Real document upload to IPFS/Arweave
   - Verification badges
   - Business updates feed

### Medium Term (Q2-Q3 2025)

1. **AI Integration**
   - OpenAI GPT-4 for document analysis
   - Automated risk scoring
   - Financial projection models

2. **KYC System**
   - Identity verification for businesses
   - Investor accreditation checks
   - Compliance with regulations

3. **Dividends**
   - Automated profit distribution
   - On-chain dividend tracking
   - Configurable payout schedules

4. **Secondary Market**
   - Trade shares between users
   - Price discovery mechanism
   - Order book for liquidity

### Long Term (Q4 2025+)

1. **Mobile App**
   - React Native with Solana Mobile SDK
   - Push notifications for investments
   - Mobile wallet integration
   - In-app document scanning

2. **DAO Governance**
   - Community voting on protocol changes
   - Business verification process
   - Dispute resolution mechanism

3. **Multi-Chain Support**
   - Ethereum (EVM) version
   - Polygon for lower fees
   - Cross-chain bridges

4. **Advanced Features**
   - Credit scoring for businesses
   - Insurance fund for investors
   - Automated compliance reporting
   - Integration with traditional finance

---

## Project Structure

```
program-Lucasalb11/
├── anchor_project/              # Anchor program
│   ├── programs/my_program/
│   │   └── src/lib.rs          # Smart contract code (889 lines)
│   ├── tests/                  # TypeScript tests
│   │   ├── localshare.ts       # Bootstrap tests
│   │   └── integration.ts      # Integration tests
│   ├── target/idl/             # Generated IDL
│   │   └── my_program.json
│   └── Anchor.toml             # Anchor config (Devnet)
│
└── frontend/                   # Next.js application
    ├── app/
    │   ├── page.tsx            # Landing page
    │   ├── marketplace/        # Business listings
    │   ├── business/[id]/      # Business details
    │   ├── dashboard/          # Owner dashboard
    │   ├── components/         # React components
    │   ├── lib/                # Anchor client utilities
    │   ├── data/               # Mock business data
    │   ├── hooks/              # Custom React hooks
    │   └── providers/          # Wallet provider
    └── package.json
```

---

## Links

- **Live Demo**: [https://localshare-nine.vercel.app](https://localshare-nine.vercel.app)
- **GitHub Repository**: [https://github.com/Lucasalb11/program-Lucasalb11](https://github.com/Lucasalb11/program-Lucasalb11)
- **Program Explorer**: [View on Solana Explorer](https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet)
- **Program IDL**: `anchor_project/target/idl/my_program.json`
- **Devnet Faucet**: [https://faucet.solana.com/](https://faucet.solana.com/)

---

## Developer Information

**Author:** Lucas Alberto  
**GitHub:** [@Lucasalb11](https://github.com/Lucasalb11)  
**School of Solana:** Season 8 - Program Assignment  

### Project Goals

1. ✅ Complete School of Solana Season 8 assignment
2. 🎯 Participate in Solana hackathons
3. 🎯 Apply for ecosystem grants (Solana Foundation, Superteam)
4. 🎯 Develop into production-ready platform
5. 🎯 Onboard real local businesses

---

## License

This is an **educational prototype** for School of Solana Season 8.

**⚠️ IMPORTANT: Educational Use Only**

This project is:
- Built for learning purposes
- Running on Testnet (Devnet)
- NOT intended for real investments
- NOT audited for production use

**NOT intended for production use without:**
- Professional security audit by certified auditors
- Proper KYC/AML compliance system
- Legal regulatory compliance (varies by jurisdiction)
- Real AI implementation for risk assessment
- Production-ready infrastructure and monitoring
- Insurance and investor protection mechanisms

---

## Requirements Checklist (School of Solana)

### Program Requirements
- ✅ Anchor program deployed on Devnet
- ✅ Program uses PDAs (3 types: Config, Business, Offering)
- ✅ Multiple instructions (init_config, register_business, create_offering, buy_shares)
- ✅ Proper account validation and security
- ✅ Custom errors with meaningful messages
- ✅ Well-documented code in English

### Testing Requirements
- ✅ TypeScript tests for all instructions
- ✅ Happy path tests (successful operations)
- ✅ Unhappy path tests (error cases)
- ✅ Input validation tests
- ✅ End-to-end integration tests

### Frontend Requirements
- ✅ Frontend application deployed and accessible
- ✅ Connects to deployed Devnet program
- ✅ Wallet integration (Phantom, Solflare)
- ✅ User-friendly interface
- ✅ Responsive design

### Documentation Requirements
- ✅ Comprehensive README.md
- ✅ PROJECT_DESCRIPTION.md with technical details
- ✅ All code and comments in English
- ✅ Clear instructions for running locally
- ✅ Deployment documentation

**Status:** ✅ **Ready for Submission**

---

## Support

For questions about the project:
- Open an issue on GitHub
- Check the main README.md
- Review test files for usage examples
- Explore the live demo

---

**Made with ❤️ to democratize local investments**

**Last Updated:** January 2025
