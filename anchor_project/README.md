# 🦀 Localshare - Anchor Program

Solana Smart Contract for the Localshare Lite protocol, developed with Anchor Framework.

## 📖 Complete Documentation

For detailed documentation on the program, architecture, security, and usage examples, see:

**[LOCALSHARE_README.md](./LOCALSHARE_README.md)**

## ⚡ Quick Commands

```bash
# Build
anchor build

# Test
anchor test

# Deploy (local)
anchor deploy

# Deploy (devnet)
anchor deploy --provider.cluster devnet
```

## 📊 Structure

```
anchor_project/
├── programs/my_program/    # Smart contract source code
│   └── src/lib.rs         # Main program (969 lines)
├── tests/                 # Integration tests
│   ├── integration.ts     # Complete test suite
│   ├── e2e_business_flow.ts  # End-to-end test
│   └── localshare.ts      # Bootstrap tests
├── migrations/            # Deployment scripts
├── target/               # Compiled artifacts
│   ├── deploy/          # .so and keypairs
│   ├── idl/             # Interface Definition Language
│   └── types/           # TypeScript types
├── Anchor.toml          # Project configuration
└── Cargo.toml          # Rust dependencies
```

## 🎯 Features

### Implemented Instructions

1. **`init_config`** - Global protocol configuration
2. **`register_business`** - Business registration
3. **`configure_offering`** - Configure offering parameters
4. **`init_share_mint`** - Initialize share mint and vault
5. **`list_business`** - List business on marketplace
6. **`buy_shares`** - Buy shares from listed business
7. **`create_offering`** - Create share offering (legacy)
8. **`buy_shares_from_offering`** - Buy from offering (legacy)

### Accounts (PDAs)

- **Config**: Global configuration
- **Business**: Business profile
- **Offering**: Share offering (legacy)
- **ShareMintAuthority**: Authority for share mint
- **MintAuthority**: Authority for business mint

## ✅ Tests

### Integration Tests

```bash
anchor test
```

**Result**: 11/11 tests passing ✅

### End-to-End (E2E) Test

Complete business flow test: register → configure → create token → list → buy.

```bash
# Run E2E test
yarn test:e2e

# Or directly with anchor
anchor test tests/e2e_business_flow.ts
```

**What the E2E test does:**
1. Creates owner and buyer keypairs
2. Airdrops SOL to both on devnet
3. Owner: `RegisterBusiness` → `configure_offering` → `init_share_mint` → `list_business`
4. Buyer: `buy_shares` (buys 10 shares)
5. Verifies:
   - Buyer's ATA has 10 tokens
   - Treasury received SOL (at least `10 * price_per_share_lamports` minus fees)

## 🔒 Security

- ✅ Integer overflow protection
- ✅ Robust input validation
- ✅ Deterministic PDAs
- ✅ Anchor constraints
- ✅ Custom errors (9 types)

## 📝 Program ID

```
91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a
```

## 🔗 Cluster

Configured for: **devnet** (see `Anchor.toml`)

To change:
```bash
# Devnet
solana config set --url devnet

# Mainnet (production)
solana config set --url mainnet-beta
```

## 🚀 Deploy to Devnet

### Prerequisites

1. **Configure Solana CLI for devnet:**
```bash
solana config set --url devnet
```

2. **Verify wallet:**
```bash
solana address
# Make sure the wallet has SOL on devnet
```

3. **Airdrop SOL (if needed):**
```bash
solana airdrop 2
```

### Deployment Steps

1. **Build the program:**
```bash
cd anchor_project
anchor build
```

2. **Deploy to devnet:**
```bash
anchor deploy --provider.cluster devnet
```

3. **Verify Program ID:**
   - Program ID is in `Anchor.toml` under `[programs.devnet]`
   - Current: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a`

4. **Update frontend:**
   - Update `frontend/app/lib/constants.ts` with Program ID if needed
   - Program ID is already configured as default

5. **Sync IDL (if needed):**
```bash
../scripts/sync-idl.sh
```

6. **Redeploy frontend on Vercel:**
   - Push to repository or manual trigger on Vercel
   - Frontend will automatically use devnet Program ID

### Verification

After deployment, you can verify on Solana Explorer:
```bash
# Replace <SIGNATURE> with the deployment transaction signature
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet
```

---

Developed with [Anchor Framework](https://www.anchor-lang.com/) 🦀
