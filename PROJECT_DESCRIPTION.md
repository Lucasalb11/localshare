# Localshare - Investment in Local Businesses

## Project Overview

**Localshare** is a decentralized application (dApp) that enables investments in local businesses through tokenized shares on the Solana blockchain. It connects entrepreneurs who need funding with local investors, creating a transparent and secure ecosystem for community-driven investments.

### Problem Statement

Small local businesses struggle to access traditional funding, while community members want to invest in and support their neighborhood establishments but lack accessible platforms to do so.

### Solution

Localshare provides a blockchain-based platform where:
- Business owners can register and create share offerings
- Investors can discover, analyze, and invest in local businesses
- All transactions are transparent and recorded on-chain
- Share ownership is represented by tokens on Solana

## Technical Implementation

### Smart Contract (Anchor Program)

**Program ID (Devnet):** `8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y`

#### Instructions

1. **init_config**
   - Initializes global configuration with payment mint
   - Creates Config PDA: `["config"]`
   - Admin-only operation

2. **register_business**
   - Registers a new business on the platform
   - Creates Business PDA: `["business", owner]`
   - Stores business name and share mint

3. **create_offering**
   - Creates a share offering for a registered business
   - Creates Offering PDA: `["offering", business, share_mint]`
   - Defines price and quantity of shares

4. **buy_shares**
   - Allows investors to purchase shares
   - Transfers SOL from buyer to business owner
   - Updates remaining shares counter

#### PDAs (Program Derived Addresses)

- **Config**: `["config"]` - Global configuration
- **Business**: `["business", owner_pubkey]` - Business account
- **Offering**: `["offering", business_pubkey, share_mint_pubkey]` - Share offering

#### Security Features

- ✅ Input validation (price > 0, shares > 0, name length)
- ✅ Ownership checks (has_one constraints)
- ✅ Math overflow protection
- ✅ Active offering validation
- ✅ Sufficient shares check
- ✅ PDA-based accounts (no spoofing)

### Frontend

**Live Demo:** [To be deployed on Vercel]

#### Technology Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Blockchain:** Solana Web3.js + Anchor
- **Wallet:** Solana Wallet Adapter (Phantom, Solflare)

#### Features

1. **Landing Page** (`/`)
   - Hero section with value proposition
   - How it works (3-step explanation)
   - Key features showcase
   - Call-to-action buttons

2. **Marketplace** (`/marketplace`)
   - Browse available businesses
   - Filter by category
   - View AI-generated scores (simulated)
   - See financial metrics

3. **Business Details** (`/business/[id]`)
   - Complete business information
   - Financial data (revenue, costs, valuation)
   - AI analysis (strengths, risks, recommendations)
   - Investment calculator
   - "Invest Now" button

4. **Dashboard** (`/dashboard`)
   - Register new business (3-step form)
   - Upload business information
   - Financial data entry
   - Share offering configuration

#### Mock Data

The frontend includes 5 realistic mock businesses:
- Padaria São Pedro (Bakery)
- Cafeteria Aroma (Coffee Shop)
- Oficina Mecânica Moderna (Auto Repair)
- Sabor Nordestino (Restaurant)
- Academia Fit Zone (Gym)

Each with:
- Real images (Unsplash)
- Financial metrics
- Location data
- AI-generated analysis

## Testing

### Test Coverage

All program instructions have comprehensive tests covering:

**Happy Path Tests:**
- ✅ Successful config initialization
- ✅ Business registration
- ✅ Offering creation
- ✅ Share purchase

**Unhappy Path Tests:**
- ❌ Empty business name
- ❌ Name too long (>50 chars)
- ❌ Zero price
- ❌ Zero shares
- ❌ Insufficient shares
- ❌ Inactive offering
- ❌ Unauthorized operations

**Test Files:**
- `anchor_project/tests/localshare.ts` - Main integration tests
- `anchor_project/tests/integration.ts` - Additional scenarios

**Run Tests:**
```bash
cd anchor_project
anchor test
```

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

### Frontend

**Platform:** Vercel  
**URL:** [To be deployed]

**Deploy Commands:**
```bash
cd frontend
yarn build
vercel deploy --prod
```

## How to Use

### For Business Owners

1. **Connect Wallet** (Phantom/Solflare on Devnet)
2. **Register Business**
   - Navigate to Dashboard
   - Fill business information
   - Provide financial data
3. **Create Offering**
   - Set share price
   - Define quantity
   - Submit for review
4. **Receive Investments**
   - SOL transfers directly to your wallet

### For Investors

1. **Explore Businesses**
   - Browse marketplace
   - View detailed information
2. **Analyze Opportunities**
   - Check AI scores
   - Review financials
   - Read owner profile
3. **Invest**
   - Connect wallet
   - Enter investment amount
   - Confirm transaction
4. **Track Portfolio**
   - View owned shares
   - Monitor performance

## Future Enhancements

1. **Real AI Integration**
   - OpenAI GPT-4 for document analysis
   - Automated risk scoring

2. **KYC System**
   - Identity verification
   - Business validation

3. **Dividends**
   - Automated profit distribution
   - On-chain dividend tracking

4. **Secondary Market**
   - Trade shares between users
   - Price discovery mechanism

5. **Mobile App**
   - React Native with Solana Mobile SDK
   - Push notifications

## Project Structure

```
program-Lucasalb11/
├── anchor_project/          # Anchor program
│   ├── programs/my_program/
│   │   └── src/lib.rs      # Smart contract code
│   ├── tests/              # TypeScript tests
│   ├── target/idl/         # Generated IDL
│   └── Anchor.toml         # Anchor config
│
└── frontend/               # Next.js application
    ├── app/
    │   ├── page.tsx        # Landing page
    │   ├── marketplace/    # Business listings
    │   ├── business/[id]/  # Business details
    │   ├── dashboard/      # Owner dashboard
    │   ├── components/     # React components
    │   ├── lib/            # Anchor client
    │   └── data/           # Mock data
    └── package.json
```

## Links

- **Repository:** https://github.com/School-of-Solana/program-Lucasalb11
- **Frontend Demo:** [To be deployed]
- **Program IDL:** `anchor_project/target/idl/my_program.json`
- **Solana Explorer:** https://explorer.solana.com/address/8sTHpKZ2jbTNBzCxmwFytcift1j6J2Nfj1s9WHGSoE5Y?cluster=devnet

## Developer Information

**Author:** Lucas Alberto  
**School of Solana:** Season 8  
**Task:** Solana Program Assignment  

## License

Educational project for School of Solana. Not intended for production use without proper auditing.

---

## Requirements Checklist

- ✅ Anchor program deployed on Devnet
- ✅ Program uses PDAs (3 types: Config, Business, Offering)
- ✅ TypeScript tests for all instructions (happy + unhappy paths)
- ✅ Frontend application ready for deployment
- ✅ PROJECT_DESCRIPTION.md completed

**Status:** Ready for submission 🎓

