# Localshare Technical Summary

## Overview
Localshare is a Solana dApp that enables local businesses to tokenize and sell shares to investors. The system consists of an Anchor program (on-chain) and a Next.js frontend (off-chain).

## Architecture

### On-Chain Program (Anchor)
- **Location**: `anchor_project/programs/my_program/src/lib.rs`
- **Program ID**: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a` (devnet)
- **Network**: Devnet

### Frontend (Next.js)
- **Location**: `frontend/`
- **Framework**: Next.js with TypeScript
- **Wallet Integration**: Solana Wallet Adapter
- **IDL Location**: `frontend/app/idl/localshare.json`

## Key Account Types

### Business Account
- **PDA Seeds**: `["business", owner.key()]`
- **Fields**:
  - `owner`: Pubkey of business owner
  - `name`: String (max 50 chars)
  - `share_mint`: Pubkey (set by `init_share_mint`)
  - `total_shares`: u64
  - `price_per_share_lamports`: u64
  - `treasury`: Pubkey (receives payments)
  - `is_listed`: bool
  - `bump`: u8

### Share Mint
- **PDA Seeds**: `["share_mint", business.key()]`
- **Decimals**: 0 (whole shares only)
- **Authority**: `share_mint_authority` PDA

### Shares Vault
- **PDA Seeds**: `["shares_vault", business.key()]`
- **Purpose**: Holds all business shares initially
- **Authority**: `share_mint_authority` PDA

### Share Mint Authority
- **PDA Seeds**: `["share_mint_authority", business.key()]`
- **Purpose**: Controls minting and transfers from vault

## Main Instructions

### 1. `register_business`
- **Purpose**: Register or update a business
- **Accounts**:
  - `business`: Business PDA
  - `mint`: Old mint PDA (for backward compatibility)
  - `mint_authority`: Old mint authority PDA
  - `owner_token_account`: Owner's ATA for old mint
  - `owner`: Business owner (signer)
- **Behavior**: 
  - Initializes business with `share_mint = Pubkey::default()`
  - Sets default treasury to owner
  - Idempotent: can be called multiple times to update name

### 2. `configure_offering`
- **Purpose**: Set offering parameters (total shares, price, treasury)
- **Accounts**:
  - `business`: Business PDA (mutable)
  - `owner`: Business owner (signer)
  - `system_program`: System program
- **Validations**:
  - Only owner can call
  - `total_shares > 0`
  - `price_per_share_lamports > 0`
- **Note**: Does NOT list the business

### 3. `init_share_mint`
- **Purpose**: Create share mint and vault, mint all shares into vault
- **Accounts**:
  - `business`: Business PDA (mutable)
  - `owner`: Business owner (signer)
  - `share_mint`: Share mint PDA
  - `share_mint_authority`: Share mint authority PDA
  - `shares_vault`: Shares vault PDA
  - `token_program`: Token program
  - `system_program`: System program
- **Validations**:
  - Only owner can call
  - `total_shares > 0` (must call `configure_offering` first)
- **Behavior**:
  - Creates mint with decimals = 0
  - Mints `total_shares` into `shares_vault`
  - Updates `business.share_mint`

### 4. `list_business`
- **Purpose**: Make business available on marketplace
- **Accounts**:
  - `business`: Business PDA (mutable)
  - `owner`: Business owner (signer)
  - `system_program`: System program
- **Validations**:
  - Only owner can call
  - `total_shares > 0`
  - `price_per_share_lamports > 0`
  - `share_mint != Pubkey::default()`
  - `!is_listed` (prevents double-listing)
- **Behavior**: Sets `is_listed = true`

### 5. `buy_shares`
- **Purpose**: Buy shares from a listed business
- **Accounts**:
  - `buyer`: Buyer (signer)
  - `business`: Business PDA (mutable)
  - `shares_vault`: Shares vault PDA (mutable)
  - `treasury`: Treasury account (mutable, receives SOL)
  - `buyer_shares_ata`: Buyer's ATA for share mint
  - `share_mint`: Share mint
  - `share_mint_authority`: Share mint authority PDA (signer)
  - `token_program`: Token program
  - `system_program`: System program
  - `associated_token_program`: Associated token program
  - `rent`: Rent sysvar
- **Validations**:
  - `business.is_listed == true`
  - `amount_shares > 0`
  - `shares_vault.amount >= amount_shares`
- **Behavior**:
  - Transfers SOL from buyer to treasury
  - Transfers tokens from vault to buyer's ATA
  - Uses PDA signer for vault authority

## PDA Derivations

All PDAs use the program ID: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a`

```typescript
// Business PDA
["business", owner.toBuffer()]

// Share Mint PDA
["share_mint", business.toBuffer()]

// Share Mint Authority PDA
["share_mint_authority", business.toBuffer()]

// Shares Vault PDA
["shares_vault", business.toBuffer()]

// Old Mint PDA (for backward compatibility)
["mint", business.toBuffer()]

// Old Mint Authority PDA
["mint_authority", business.toBuffer()]
```

## Frontend Integration

### Key Files
- **Program Client**: `frontend/app/lib/localshare.ts`
- **Hooks**: 
  - `frontend/app/hooks/useLocalshareProgram.ts` - Program instance
  - `frontend/app/hooks/useBusinessAccount.ts` - Business account fetcher
- **Pages**:
  - `frontend/app/onboarding/business/page.tsx` - Register business
  - `frontend/app/dashboard/business/page.tsx` - Business dashboard
  - `frontend/app/marketplace/page.tsx` - Marketplace listing
  - `frontend/app/business/[id]/page.tsx` - Business detail & buy shares

### Account Name Convention
The frontend uses **snake_case** for account names to match the IDL exactly:
- `system_program` (not `systemProgram`)
- `token_program` (not `tokenProgram`)
- `share_mint` (not `shareMint`)
- `shares_vault` (not `sharesVault`)
- etc.

## Changes Made

### Program Changes
1. **Fixed `register_business`**:
   - Removed automatic minting of 100 shares
   - Set `share_mint = Pubkey::default()` initially
   - Share mint is now created separately in `init_share_mint`

### Frontend Changes
1. **Fixed account names**: Changed from camelCase to snake_case to match IDL
2. **Synced IDL**: Updated `frontend/app/idl/localshare.json` from latest build
3. **Fixed buy shares**: Updated account names in `buy_shares` call

## Testing

### Anchor Tests
- **Location**: `anchor_project/tests/`
- **E2E Test**: `e2e_business_flow.ts` - Full flow test
- **Integration Tests**: `integration.ts` - Individual instruction tests
- **Status**: All tests passing ✅

### Test Flow
1. Register business
2. Configure offering
3. Initialize share mint
4. List business
5. Buy shares
6. Verify token transfer and SOL payment

## Deployment

### Current Status
- **Program**: Deployed to devnet
- **Program ID**: `91CC3aZEnHLe7VvnE9wXwY4TPUTLR4EKfRAZYNjRPM2a`
- **Frontend**: Configured for devnet
- **IDL**: Synced

### Deployment Commands
```bash
# Build program
cd anchor_project
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Sync IDL to frontend
cp target/idl/my_program.json ../frontend/app/idl/localshare.json
```

## Known Issues & Notes

1. **Old Mint vs Share Mint**: The program maintains both the old `mint` (for backward compatibility with `create_offering` flow) and the new `share_mint` (for the `list_business` flow). The frontend uses the new flow exclusively.

2. **Stack Warning**: There's a compiler warning about stack offset, but it doesn't affect functionality.

3. **Deployment Funds**: Ensure the deployer wallet has sufficient SOL for deployment.

## Security Considerations

1. **Owner Validation**: All owner-only instructions use `has_one` constraint
2. **PDA Signing**: Vault transfers use PDA signer with correct seeds
3. **Overflow Protection**: All math operations use `checked_mul`/`checked_sub`
4. **Input Validation**: All inputs validated (non-zero, bounds checks)
5. **Double-Listing Prevention**: `list_business` checks `!is_listed`

## Next Steps

1. ✅ Program reviewed and fixed
2. ✅ Tests passing
3. ✅ Frontend integration fixed
4. ⏳ E2E testing on deployed frontend
5. ⏳ Final deployment verification

